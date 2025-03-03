"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plugin } from "@prisma/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/file-upload";
import { createPluginVersion } from "../../../actions";
import { env } from "@/env.mjs";

// 在组件外部添加这个辅助函数
function compareVersions(v1: string, v2: string): number {
  const v1Parts = v1.split('.').map(Number);
  const v2Parts = v2.split('.').map(Number);
  
  for (let i = 0; i < 3; i++) {
    if (v1Parts[i] > v2Parts[i]) return 1;
    if (v1Parts[i] < v2Parts[i]) return -1;
  }
  return 0;
}

function incrementVersion(version: string): string {
  const parts = version.split('.').map(Number);
  if (parts.length !== 3) return '1.0.0';
  
  parts[2] += 1; // 增加补丁版本
  return parts.join('.');
}

interface CreateVersionFormProps {
  plugin: Plugin;
}

export function CreateVersionForm({ plugin }: CreateVersionFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const pluginFormSchema = z.object({
    name: z.string().min(2, {
      message: "Name must be at least 2 characters.",
    }),
    description: z.string().optional(),
    version: z.string().min(1, {
      message: "Version is required.",
    }),
    chatpionVersion: z.string().min(1, {
      message: "Chatpion version is required.",
    }),
    changelog: z.string().min(1, {
      message: "Changelog is required for new versions.",
    }),
    avatar: z.string().optional(),
    cover: z.string().optional(),
    fileId: z.string().optional(),
    fileName: z.string().optional(),
    fileSize: z.string().optional(),
    downloadUrl: z.string().url().optional(),
    activationFields: z.string().min(2, {
      message: "Activation fields must be valid JSON.",
    }),
    uiFields: z.string().min(2, {
      message: "UI fields must be valid JSON.",
    }),
  });

  const form = useForm<z.infer<typeof pluginFormSchema>>({
    resolver: zodResolver(pluginFormSchema),
    defaultValues: {
      name: plugin.name,
      description: plugin.description || "",
      version: incrementVersion(plugin.version),
      chatpionVersion: plugin.chatpionVersion || "",
      changelog: "",
      avatar: plugin.avatar || "",
      cover: plugin.cover || "",
      fileId: "",
      fileName: "",
      fileSize: "",
      downloadUrl: "",
      activationFields: JSON.stringify(plugin.activationFields, null, 2),
      uiFields: JSON.stringify(plugin.uiFields, null, 2),
    },
  });

  async function onSubmit(data: z.infer<typeof pluginFormSchema>) {
    // 检查版本号
    if (compareVersions(data.version, plugin.version) <= 0) {
      toast.error("New version must be higher than the current version");
      return;
    }

    setIsLoading(true);

    try {
      const parsedData = {
        ...data,
        activationFields: JSON.parse(data.activationFields),
        uiFields: JSON.parse(data.uiFields),
        downloadUrl: data.downloadUrl || '',
      };

      await createPluginVersion(plugin.id, parsedData);
      toast.success("New version created successfully");
      router.push(`/admin/plugins/${plugin.id}/versions`);
      router.refresh();
    } catch (error) {
      console.error("Error creating plugin version:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create version");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">New Version</h2>
            <p className="text-muted-foreground">
              Create a new version for {plugin.name} (Current version: {plugin.version})
            </p>
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Version"}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-8">
          {/* 第一列 */}
          <div className="space-y-8">
            <FormField
              control={form.control}
              name="version"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Version</FormLabel>
                  <FormControl>
                    <Input placeholder="2.0.0" {...field} />
                  </FormControl>
                  <FormDescription>
                    The version number for this new release.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="chatpionVersion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Required Chatpion Version</FormLabel>
                  <FormControl>
                    <Input placeholder="1.0.0" {...field} />
                  </FormControl>
                  <FormDescription>
                    The minimum Chatpion version required for this plugin.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe what's new in this version"
                      className="resize-none h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    A brief description of the changes in this version.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* 第二列 */}
          <div className="space-y-8">
            <FormField
              control={form.control}
              name="fileId"
              render={() => (
                <FormItem>
                  <FormLabel>Plugin File</FormLabel>
                  <FormControl>
                    <FileUpload
                      parentId={env.PLUGIN_PARENT_ID}
                      onUploadComplete={(data) => {
                        form.setValue("fileId", data.fileId);
                        form.setValue("fileName", data.fileName);
                        form.setValue("fileSize", data.fileSize);
                        form.setValue("downloadUrl", data.downloadUrl);
                      }}
                      accept=".zip,.rar,.7z"
                      placeholderText="Upload your plugin file"
                    />
                  </FormControl>
                  <FormDescription>
                    Upload the new version of your plugin file (ZIP, RAR, or 7Z format).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="avatar"
                render={() => (
                  <FormItem>
                    <FormLabel>Avatar</FormLabel>
                    <FormControl>
                      <FileUpload
                        id="plugin-avatar"
                        parentId={env.IMAGE_PARENT_ID}
                        onUploadComplete={(data) => {
                          form.setValue("avatar", data.downloadUrl);
                        }}
                        accept="image/*"
                        placeholderText="Upload plugin avatar"
                        value={form.getValues("avatar")}
                      />
                    </FormControl>
                    <FormDescription>
                      Upload a square image for your plugin avatar.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cover"
                render={() => (
                  <FormItem>
                    <FormLabel>Cover Image</FormLabel>
                    <FormControl>
                      <FileUpload
                        id="plugin-cover"
                        parentId={env.IMAGE_PARENT_ID}
                        onUploadComplete={(data) => {
                          form.setValue("cover", data.downloadUrl);
                        }}
                        accept="image/*"
                        placeholderText="Upload plugin cover"
                        value={form.getValues("cover")}
                      />
                    </FormControl>
                    <FormDescription>
                      Upload a cover image for your plugin.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        {/* 配置字段（单列） */}
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="changelog"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Changelog</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe what's new in this version..."
                    className="h-32 font-mono"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Document the changes and new features in this version.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="activationFields"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Activation Fields (JSON)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="{}"
                    className="font-mono h-32"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  JSON object containing fields required for plugin activation.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="uiFields"
            render={({ field }) => (
              <FormItem>
                <FormLabel>UI Fields (JSON)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="{}"
                    className="font-mono h-32"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  JSON object containing fields for UI configuration.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
}
