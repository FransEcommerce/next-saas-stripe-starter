import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// 获取实际的云存储URL
async function getCloudStorageUrl(type: string, id: string) {
  switch (type) {
    case 'plugin':
      const plugin = await prisma.plugin.findUnique({
        where: { id },
        select: { avatar: true }
      });
      return plugin?.avatar;
    
    case 'product':
      const product = await prisma.product.findUnique({
        where: { id },
        select: { 
          plugin: {
            select: { avatar: true }
          }
        }
      });
      return product?.plugin?.avatar;
    
    default:
      return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { type: string; id: string } }
) {
  try {
    const { type, id } = params;
    
    // 获取实际的云存储URL
    const cloudUrl = await getCloudStorageUrl(type, id);
    
    if (!cloudUrl) {
      return new NextResponse('Image not found', { status: 404 });
    }

    // 重定向到实际的图片URL
    // 这里可以添加额外的安全检查，如签名验证等
    const response = await fetch(cloudUrl);
    const buffer = await response.arrayBuffer();
    const headers = new Headers(response.headers);
    
    // 设置缓存控制
    headers.set('Cache-Control', 'public, max-age=3600');
    
    return new NextResponse(buffer, {
      headers,
      status: response.status,
    });

  } catch (error) {
    console.error('Image proxy error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
