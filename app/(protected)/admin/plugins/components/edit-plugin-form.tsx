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
import { FileUpload } from "./file-upload";
import { ImageUpload } from "./image-upload";
import { updatePlugin } from "../actions";
import { Plugin } from "@prisma/client";

const pluginFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  description: z.string().optional(),
  version: z.string().min(1, {
    message: "Version is required.",
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

type PluginFormValues = z.infer<typeof pluginFormSchema>;

interface EditPluginFormProps {
  plugin: Plugin;
}

export function EditPluginForm({ plugin }: EditPluginFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<PluginFormValues>({
    resolver: zodResolver(pluginFormSchema),
    defaultValues: {
      name: plugin.name,
      description: plugin.description || "",
      version: plugin.version,
      avatar: plugin.avatar || "",
      cover: plugin.cover || "",
      fileId: plugin.fileId,
      fileName: plugin.fileName || "",
      fileSize: plugin.fileSize || "",
      downloadUrl: plugin.downloadUrl,
      activationFields: JSON.stringify(plugin.activationFields, null, 2),
      uiFields: JSON.stringify(plugin.uiFields, null, 2),
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
      };

      await updatePlugin(plugin.id, parsedData);
      router.push("/admin/plugins");
      router.refresh();
    } catch (error) {
      console.error("Error updating plugin:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
              name="avatar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Avatar</FormLabel>
                  <FormControl>
                    <ImageUpload
                      label="Upload Avatar"
                      onUploadComplete={(url) => form.setValue("avatar", url)}
                      defaultImage={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fileId"
              render={() => (
                <FormItem>
                  <FormLabel>Plugin File</FormLabel>
                  <FormControl>
                    <FileUpload onUploadComplete={handleUploadComplete} />
                  </FormControl>
                  <FormDescription>
                    Upload your plugin file (ZIP, RAR, or 7Z format).
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your plugin"
                      className="resize-none h-[38px]"
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

            <FormField
              control={form.control}
              name="cover"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cover</FormLabel>
                  <FormControl>
                    <ImageUpload
                      label="Upload Cover"
                      onUploadComplete={(url) => form.setValue("cover", url)}
                      defaultImage={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
          </div>
        </div>

        {/* 配置字段（单列） */}
        <div className="space-y-6">
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

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
