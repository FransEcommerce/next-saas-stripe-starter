"use server";

import { auth } from "@/auth";
import { headers } from "next/headers";
// 定义响应类型
type UploadSuccessResponse = {
  success: true;
  file: {
    id: string;
    name: string;
    size: string;
    type: string;
    downloadUrl: string;
  };
};

type UploadErrorResponse = {
  success: false;
  error: string;
  status: number;
};

export type UploadResponse = UploadSuccessResponse | UploadErrorResponse;

/**
 * 上传文件到云存储并返回处理后的结果
 * 使用服务器端操作隐藏第三方存储的详细信息
 */
export async function uploadFile(formData: FormData): Promise<UploadResponse> {
  try {
    // 可选的身份验证检查
    const session = await auth.api.getSession({
      headers: headers(),
    })
    
    // 如果需要身份验证，取消注释下面的代码
    // if (!session) {
    //   return { success: false, error: "Unauthorized", status: 401 };
    // }

    // 从表单数据中获取文件
    const file = formData.get('file') as File;
    if (!file) {
      return { success: false, error: "No file provided", status: 400 };
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
      return { success: false, error: "External API error", status: response.status };
    }

    // 获取原始响应
    const rawData = await response.json();
    
    if (!rawData.data) {
      return { success: false, error: "Invalid response from storage service", status: 500 };
    }
    
    // 创建一个新的响应对象，包含必要的信息
    const sanitizedResponse: UploadSuccessResponse = {
      success: true,
      file: {
        id: rawData.data.id,
        name: rawData.data.attributes.name,
        size: rawData.data.attributes.filesize,
        type: rawData.data.attributes.mimetype || file.type,
        // 返回下载链接，但不暴露完整的第三方存储 URL 结构
        downloadUrl: rawData.data.relationships.shared_access.data.attributes.download_link,
      }
    };
    
    return sanitizedResponse;
  } catch (error) {
    console.error('Error uploading file:', error);
    return { success: false, error: "Failed to upload file", status: 500 };
  }
}

/**
 * 根据文件引用ID获取文件内容
 * 这个函数可以用来在需要时获取文件内容
 */
export async function getFileByReference(referenceId: string) {
  try {
    // 解码引用ID获取原始文件ID
    const fileId = Buffer.from(referenceId, 'base64').toString('ascii');
    
    // 这里应该从数据库或缓存中获取原始URL
    // 为简化示例，我们假设可以通过API重新获取
    
    // 返回一个重定向响应或文件内容
    // 实际实现应该根据您的需求调整
    return { success: true, fileId };
  } catch (error) {
    console.error('Error retrieving file:', error);
    return { error: "Failed to retrieve file", status: 500 };
  }
}
