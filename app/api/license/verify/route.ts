import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { LicenseStatus, Plugin } from "@prisma/client";
import { compareVersions } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { licenseKey, domain, chatpionVersion, project_id } = body;

    // 验证请求参数
    if (!licenseKey) {
      return NextResponse.json(
        { error: "License key is required" },
        { status: 400 }
      );
    }

    if (!project_id) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    if (!chatpionVersion) {
      return NextResponse.json(
        { error: "Platform version is required" },
        { status: 400 }
      );
    }

    // 查找许可证
    const license = await prisma.license.findUnique({
      where: { licenseKey },
      include: {
        plugin: {
          select: {
            id: true,
            name: true,
            version: true,
            project_id: true,
            chatpionVersion: true,
            activationFields: true,
            parentId: true,
          },
        },
      },
    });

    // 如果许可证不存在
    if (!license) {
      return NextResponse.json(
        { error: "Invalid license key" },
        { status: 404 }
      );
    }

    // 验证插件匹配
    // 1. 获取主插件（如果当前插件是版本，则获取其主插件）
    const mainPluginId = license.plugin.parentId || license.plugin.id;

    // 2. 获取所有相关版本
    const allVersions = await prisma.plugin.findMany({
      where: {
        OR: [
          { id: mainPluginId },
          { parentId: mainPluginId }
        ],
        project_id: project_id,
      },
      orderBy: [
        { versionNumber: 'desc' }
      ],
    });

    // 如果找不到匹配的插件版本
    if (allVersions.length === 0) {
      return NextResponse.json(
        { error: "License is not valid for this plugin" },
        { status: 403 }
      );
    }

    // 3. 找到适配的最新版本
    let compatibleVersion: Plugin | null = null;
    for (const version of allVersions) {
      // 如果插件支持的平台版本小于等于请求的平台版本，则该插件版本可用
      if (compareVersions(version.chatpionVersion || '0.0.0', chatpionVersion) <= 0) {
        compatibleVersion = version;
        break; // 因为已经按版本号降序排序，所以第一个匹配的就是最新的兼容版本
      }
    }

    // 如果没有找到兼容版本
    if (!compatibleVersion) {
      return NextResponse.json(
        { error: "No compatible plugin version found for your platform version" },
        { status: 400 }
      );
    }

    // 如果许可证已被撤销
    if (license.status === LicenseStatus.REVOKED) {
      return NextResponse.json(
        { error: "License has been revoked" },
        { status: 403 }
      );
    }

    // 检查许可证状态和域名
    if (license.status === LicenseStatus.PENDING) {
      // 第一次激活
      if (domain) {
        // 更新许可证状态和域名
        await prisma.license.update({
          where: { id: license.id },
          data: {
            status: LicenseStatus.ACTIVE,
            domain,
            activatedAt: new Date(),
          },
        });
      }
    } else {
      // 后续验证
      if (license.domain && license.domain !== domain) {
        return NextResponse.json(
          { error: "Domain mismatch" },
          { status: 403 }
        );
      }
    }

    // 返回成功响应，使用兼容版本的配置
    return NextResponse.json({
      success: true,
      data: {
        status: license.status,
        pluginConfig: compatibleVersion.activationFields,
        plugin: {
          name: compatibleVersion.name,
          version: compatibleVersion.version,
          project_id: compatibleVersion.project_id,
        },
      },
    });

  } catch (error) {
    console.error("License verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
