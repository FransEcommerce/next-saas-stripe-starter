"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

interface ImageUploadProps {
  onUploadComplete: (imageUrl: string) => void;
  defaultImage?: string;
  label: string;
}

export function ImageUpload({ onUploadComplete, defaultImage, label }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(defaultImage);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", file.name);
    formData.append("extension", file.name.split(".").pop() || "");
    formData.append("share", "1");
    formData.append("parent_id", "ccccffb9-a335-4091-aac2-2a24ba3b9883");

    try {
      const response = await fetch("https://drive.frs.com.my/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_DRIVE_API_KEY}`,
        },
        body: formData,
      });

      const result = await response.json();
      
      if (result.data) {
        const imageUrl = result.data.relationships.shared_access.data.attributes.download_link;
        setPreviewUrl(imageUrl);
        onUploadComplete(imageUrl);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          type="file"
          onChange={handleImageUpload}
          accept="image/*"
          disabled={isUploading}
          className="hidden"
          id={`image-upload-${label}`}
        />
        <label
          htmlFor={`image-upload-${label}`}
          className="flex items-center gap-2 px-4 py-2 border rounded-md cursor-pointer hover:bg-gray-50"
        >
          {isUploading ? (
            <Upload className="h-4 w-4 animate-spin" />
          ) : (
            <ImageIcon className="h-4 w-4" />
          )}
          {label}
        </label>
      </div>
      
      {previewUrl && (
        <div className="relative w-40 h-40 border rounded-lg overflow-hidden">
          <Image
            src={previewUrl}
            alt={label}
            fill
            className="object-cover"
          />
        </div>
      )}
    </div>
  );
}
