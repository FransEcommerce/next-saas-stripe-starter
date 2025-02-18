"use client";

import { ChangeEvent, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface FileUploadProps {
  onUploadComplete: (data: {
    fileId: string;
    fileName: string;
    fileSize: string;
    downloadUrl: string;
  }) => void;
}

export function FileUpload({ onUploadComplete }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", file.name);
    formData.append("extension", file.name.split(".").pop() || "");
    formData.append("share", "1");
    formData.append("parent_id", "fcfe83ce-abae-44ed-9fcb-9f69c8597e22");

    try {
      const response = await fetch("https://drive.frs.com.my/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_DRIVE_API_KEY}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (data.data) {
        onUploadComplete({
          fileId: data.data.id,
          fileName: data.data.attributes.name,
          fileSize: data.data.attributes.filesize,
          downloadUrl: data.data.relationships.shared_access.data.attributes.download_link,
        });
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <Input
          type="file"
          onChange={handleFileUpload}
          accept=".zip,.rar,.7z"
          className="hidden"
          id="file-upload"
          disabled={isUploading}
        />
        <Button
          variant="secondary"
          size="sm"
          className={cn(
            "cursor-pointer",
            isUploading && "opacity-50 cursor-not-allowed"
          )}
        >
          <label htmlFor="file-upload" className="flex items-center">
            {isUploading ? (
              <Upload className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            {isUploading ? "上传中..." : "选择文件"}
          </label>
        </Button>
      </div>
      <div className="flex-1 text-sm text-muted-foreground border rounded-md px-3 py-2">
        {selectedFile ? selectedFile.name : "未选择任何文件"}
      </div>
    </div>
  );
}
