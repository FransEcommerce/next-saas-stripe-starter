import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function POST(req: NextRequest) {
  try {
    // 验证用户会话（可选）
    const session = await auth();
    
    // 如果需要身份验证，取消注释下面的代码
    // if (!session) {
    //   return NextResponse.json(
    //     { error: 'Unauthorized' },
    //     { status: 401 }
    //   );
    // }

    // 获取表单数据
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // 准备发送到外部 API 的数据
    const apiFormData = new FormData();
    apiFormData.append('file', file);
    apiFormData.append('name', formData.get('name') as string || file.name);
    apiFormData.append('extension', formData.get('extension') as string || file.name.split('.').pop() || '');
    apiFormData.append('share', formData.get('share') as string || '1');
    apiFormData.append('parent_id', formData.get('parent_id') as string || '');

    // 发送到外部 API
    const response = await fetch('https://drive.frs.com.my/api/upload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_FRS_DRIVE_API_KEY}`,
      },
      body: apiFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('External API error:', errorText);
      return NextResponse.json(
        { error: 'External API error' },
        { status: response.status }
      );
    }

    // 获取响应
    const data = await response.json();

    // 返回结果
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

// 增加最大请求体大小限制
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};
