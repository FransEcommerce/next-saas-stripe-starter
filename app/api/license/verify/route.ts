import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { LicenseStatus } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { licenseKey, domain, chatpionVersion } = body;

    // 验证请求参数
    if (!licenseKey) {
      return NextResponse.json(
        { error: "License key is required" },
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
            chatpionVersion: true,
            activationFields: true,
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

    // 返回成功响应
    return NextResponse.json({
      success: true,
      data: {
        status: license.status,
        activationFields: license.plugin.activationFields,
        plugin: {
          name: license.plugin.name,
          version: license.plugin.version,
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
