"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { createPlugin } from "../actions";
import { FileUpload } from "@/components/file-upload";
import { toast } from "sonner";

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
  changelog: z.string().optional(),
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

type PluginFormValues = z.infer<typeof pluginFormSchema>;

export function CreatePluginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<PluginFormValues>({
    resolver: zodResolver(pluginFormSchema),
    defaultValues: {
      name: "",
      description: "",
      version: "1.0.0",
      chatpionVersion: "1.0.0",
      changelog: "",
      avatar: "",
      cover: "",
      fileId: "",
      fileName: "",
      fileSize: "",
      downloadUrl: "",
      activationFields: "{}",
      uiFields: "{}",
    },
  });

  const handleUploadComplete = (fileData: {
    fileId: string;
    fileName: string;
    fileSize: string;
    downloadUrl: string;
  }) => {
    form.setValue("fileId", fileData.fileId);
    form.setValue("fileName", fileData.fileName);
    form.setValue("fileSize", fileData.fileSize);
    form.setValue("downloadUrl", fileData.downloadUrl);
  };

  async function onSubmit(data: PluginFormValues) {
    setIsLoading(true);

    try {
      const parsedData = {
        ...data,
        activationFields: JSON.parse(data.activationFields),
        uiFields: JSON.parse(data.uiFields),
        downloadUrl: data.downloadUrl || '',
      };

      await createPlugin(parsedData);
      router.push("/admin/plugins");
      toast.success("New plugin created successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create plugin");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">New Plugin</h2>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Plugin"}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-8">
          {/* 第一列 */}
          <div className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Plugin name" {...field} />
                  </FormControl>
                  <FormDescription>
                    The name of your plugin as it will appear to users.
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
                      placeholder="Describe your plugin"
                      className="resize-none h-[70px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    A brief description of what your plugin does.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="version"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Version</FormLabel>
                    <FormControl>
                      <Input placeholder="1.0.0" {...field} />
                    </FormControl>
                    <FormDescription>
                      The version number of your plugin.
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
            </div>
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
                      parentId="fcfe83ce-abae-44ed-9fcb-9f69c8597e22"
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
                    Upload your plugin file (ZIP, RAR, or 7Z format).
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
                        parentId="ccccffb9-a335-4091-aac2-2a24ba3b9883"
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
                        parentId="ccccffb9-a335-4091-aac2-2a24ba3b9883"
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
                    placeholder="Describe the initial version..."
                    className="h-32 font-mono"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Document the features of this initial version.
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
                    className="font-mono h-64"
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
                    className="font-mono h-64"
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
