"use client";

import { ChangeEvent, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Loader2, Upload } from "lucide-react";

interface FileUploadProps {
  parentId: string;
  onUploadComplete: (data: {
    fileId: string;
    fileName: string;
    fileSize: string;
    downloadUrl: string;
  }) => void;
  accept?: string;
  placeholderText?: string;
  value?: string;
  className?: string;
}

export function FileUpload({ 
  parentId,
  onUploadComplete, 
  accept = "*",
  placeholderText = "Click or drag file to upload",
  value,
  className
}: FileUploadProps) {
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
    formData.append("parent_id", parentId);

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

  const displayText = value || (selectedFile ? selectedFile.name : placeholderText);

  return (
    <div className={cn("relative group", className)}>
      <Input
        type="file"
        onChange={handleFileUpload}
        accept={accept}
        className="hidden"
        id="file-upload"
        disabled={isUploading}
      />
      <label 
        htmlFor="file-upload" 
        className={cn(
          "flex items-center gap-2 p-3 border-2 border-dashed rounded-lg cursor-pointer transition-all",
          "hover:border-primary group-hover:border-primary",
          "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          isUploading && "opacity-50 cursor-not-allowed"
        )}
      >
        <div className="flex items-center gap-2 w-full">
          <div className="shrink-0">
            {isUploading ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : (
              <Upload className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">
              {isUploading ? "Uploading..." : displayText}
            </div>
            <div className="text-xs text-muted-foreground">
              {value ? "Click to change file" : `Supports ${accept.replace("*", "all")} files`}
            </div>
          </div>
        </div>
      </label>
    </div>
  );
}
