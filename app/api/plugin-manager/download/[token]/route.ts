import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;

    // 查找下载令牌
    const downloadToken = await prisma.downloadToken.findUnique({
      where: { token },
      include: {
        plugin: true,
      },
    });

    // 验证令牌
    if (!downloadToken) {
      return new NextResponse("Invalid download token", { status: 404 });
    }

    // 检查令牌是否过期
    if (downloadToken.expiresAt < new Date()) {
      return new NextResponse("Download token expired", { status: 403 });
    }

    // 检查令牌是否已使用
    if (downloadToken.used) {
      return new NextResponse("Download token already used", { status: 403 });
    }

    // 获取插件下载链接
    const downloadUrl = downloadToken.plugin.downloadUrl;
    if (!downloadUrl) {
      return new NextResponse("Plugin download URL not found", { status: 404 });
    }

    try {
      // 下载文件
      const response = await fetch(downloadUrl);
      const arrayBuffer = await response.arrayBuffer();
      const headers = new Headers(response.headers);
      
      // 设置文件名
      const filename = downloadToken.plugin.fileName || "plugin.zip";
      headers.set("Content-Disposition", `attachment; filename="${filename}"`);
      
      // 标记令牌为已使用
      await prisma.downloadToken.update({
        where: { id: downloadToken.id },
        data: { used: true },
      });

      return new NextResponse(arrayBuffer, {
        headers,
        status: 200,
      });
    } catch (error) {
      console.error("Download error:", error);
      return new NextResponse("Failed to download plugin", { status: 500 });
    }
  } catch (error) {
    console.error("Download token error:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
