"use client";

import { ChangeEvent, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Loader2, Upload, FileText } from "lucide-react";
import Image from "next/image";
import { uploadFile, type UploadResponse } from "@/app/actions/upload";

interface FileUploadProps {
  parentId?: string; // 允许 undefined
  onUploadComplete: (data: {
    fileId: string;
    fileName: string;
    fileSize: string;
    downloadUrl?: string; // 现在是可选的
    fileType?: string;
  }) => void;
  accept?: string;
  placeholderText?: string;
  value?: string;
  className?: string;
  id?: string;
}

export function FileUpload({ 
  parentId,
  onUploadComplete, 
  accept = "*",
  placeholderText = "Click or drag file to upload",
  value,
  className,
  id = "file-upload"
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [fileType, setFileType] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const isImageAccepted = accept.includes('image/') || accept === 'image/*' || accept.includes('image/*');
  const isPdfAccepted = accept.includes('.pdf') || accept.includes('application/pdf');
  const inputId = `${id}-${parentId}`;

  // 检测文件类型
  useEffect(() => {
    if (value) {
      // 如果有文件名，先尝试从文件名判断
      if (value.toLowerCase().endsWith('.pdf')) {
        setFileType('application/pdf');
      } else if (/\.(jpe?g|png|gif|webp|bmp)$/i.test(value)) {
        setFileType('image');
        setPreviewUrl(value); // 对于图片，设置预览URL
      } else {
        // 如果文件名不明确，尝试从 URL 获取文件类型
        fetch(value, { method: 'HEAD' })
          .then(response => {
            const contentType = response.headers.get('content-type');
            if (contentType) {
              setFileType(contentType);
              if (contentType.startsWith('image/')) {
                setPreviewUrl(value);
              }
            }
          })
          .catch(error => {
            console.error("Error checking file type:", error);
            // 如果无法确定，根据 accept 参数猜测
            if (isImageAccepted && !isPdfAccepted) {
              setFileType('image');
              setPreviewUrl(value);
            } else if (isPdfAccepted && !isImageAccepted) {
              setFileType('application/pdf');
            }
          });
      }

      // 从 URL 中提取文件名
      try {
        const url = new URL(value);
        const pathSegments = url.pathname.split('/');
        const lastSegment = pathSegments[pathSegments.length - 1];
        
        // 如果最后一段是文件名（包含扩展名）
        if (lastSegment && lastSegment.includes('.')) {
          setFileName(lastSegment);
        } else {
          // 尝试从倒数第二段获取
          const secondLastSegment = pathSegments[pathSegments.length - 2];
          if (secondLastSegment && secondLastSegment.includes('.')) {
            setFileName(secondLastSegment);
          }
        }
      } catch (e) {
        // 如果不是有效的 URL，直接使用 value 的最后部分
        const segments = value.split('/');
        const lastSegment = segments[segments.length - 1];
        if (lastSegment) {
          setFileName(lastSegment);
        }
      }
    }
  }, [value, isImageAccepted, isPdfAccepted]);

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setFileType(file.type);
    setFileName(file.name);
    setIsUploading(true);

    // 为图片文件创建本地预览
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }

    // 准备表单数据
    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", file.name);
    formData.append("extension", file.name.split(".").pop() || "");
    formData.append("share", "1");
    formData.append("parent_id", parentId || "");
    
    try {
      // 使用 Server Action 上传文件
      const result: UploadResponse = await uploadFile(formData);

      if (result.success && result.file) {
        // 使用服务器返回的安全数据
        onUploadComplete({
          fileId: result.file.id,
          fileName: result.file.name,
          fileSize: result.file.size,
          fileType: result.file.type,
          downloadUrl: result.file.downloadUrl // 使用服务器返回的下载链接
        });
      } else {
        // 处理错误情况 - 此时 result 一定是 UploadErrorResponse 类型
        // 使用类型守卫确保 TypeScript 理解我们在处理 UploadErrorResponse
        const errorResult = result as { success: false; error: string; status: number };
        console.error("Upload error:", errorResult.error);
        // 可以在这里添加错误提示
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setIsUploading(false);
    }
  };
  
  // 显示文件名或占位符文本
  const displayText = isUploading 
    ? "Uploading..." 
    : (fileName || (selectedFile ? selectedFile.name : placeholderText));

  const isPdfFile = fileType === 'application/pdf' || fileType?.includes('pdf');
  const isImageFile = fileType?.startsWith('image/') || fileType === 'image';
  const canShowImage = isImageFile && previewUrl && !isPdfFile;

  return (
    <div className={cn("relative group", className)}>
      <Input
        type="file"
        onChange={handleFileUpload}
        accept={accept}
        className="hidden"
        id={inputId}
        disabled={isUploading}
      />
      <label 
        htmlFor={inputId}
        className={cn(
          "flex items-center gap-2 p-3 border-2 border-dashed rounded-lg cursor-pointer transition-all",
          "hover:border-primary group-hover:border-primary",
          "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          isUploading && "opacity-50 cursor-not-allowed"
        )}
      >
        {canShowImage ? (
          <div className="relative w-full aspect-video">
            <Image
              src={previewUrl}
              alt="Preview"
              fill
              className="object-cover rounded-md"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
              <Upload className="h-5 w-5 text-white" />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 w-full">
            <div className="shrink-0">
              {isUploading ? (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              ) : isPdfFile ? (
                <FileText className="h-5 w-5 text-red-500" />
              ) : (
                <Upload className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium break-words">
                {displayText}
              </div>
              <div className="text-xs text-muted-foreground">
                {value ? (isPdfFile ? "PDF Document" : "Click to change file") : `Supports ${accept.replace("*", "all")} files`}
              </div>
            </div>
          </div>
        )}
      </label>
    </div>
  );
}
