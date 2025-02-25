import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { licenseKey, version, project_id } = body;

    // 验证请求参数
    if (!licenseKey || !version || !project_id) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // 查找许可证和用户信息
    const license = await prisma.license.findUnique({
      where: { licenseKey },
      include: {
        plugin: true,
        user: true,
      },
    });

    if (!license) {
      return NextResponse.json(
        { error: "Invalid license key" },
        { status: 404 }
      );
    }

    // 验证插件 project_id
    if (license.plugin.project_id !== project_id) {
      return NextResponse.json(
        { error: "Invalid project ID" },
        { status: 403 }
      );
    }

    // 查找指定版本的插件
    const pluginVersion = await prisma.plugin.findFirst({
      where: {
        project_id: project_id,
        version: version,
      },
    });

    if (!pluginVersion) {
      return NextResponse.json(
        { error: "Plugin version not found" },
        { status: 404 }
      );
    }

    // 创建下载令牌
    const downloadToken = await prisma.downloadToken.create({
      data: {
        token: randomUUID(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30分钟有效期
        used: false,
        pluginId: pluginVersion.id,
        userId: license.userId,
      },
    });

    // 返回下载链接
    return NextResponse.json({
      success: true,
      data: {
        downloadUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/plugin-manager/download/${downloadToken.token}`,
        expiresAt: downloadToken.expiresAt,
      },
    });

  } catch (error) {
    console.error("Plugin download error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
