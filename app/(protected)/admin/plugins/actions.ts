"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

interface PluginInput {
  name: string;
  description?: string;
  version: string;
  avatar?: string;
  cover?: string;
  fileId: string;
  fileName: string;
  fileSize: string;
  downloadUrl: string;
  activationFields: Record<string, any>;
  uiFields: Record<string, any>;
}

export async function createPlugin(data: PluginInput) {
  try {
    const plugin = await prisma.plugin.create({
      data: {
        name: data.name,
        description: data.description,
        version: data.version,
        avatar: data.avatar,
        cover: data.cover,
        fileId: data.fileId,
        fileName: data.fileName,
        fileSize: data.fileSize,
        downloadUrl: data.downloadUrl,
        activationFields: data.activationFields,
        uiFields: data.uiFields,
      },
    });

    revalidatePath("/admin/plugins");
    return { success: true, plugin };
  } catch (error) {
    console.error("Error creating plugin:", error);
    return { success: false, error: "创建插件失败" };
  }
}

export async function updatePlugin(id: string, data: Partial<PluginInput>) {
  try {
    const plugin = await prisma.plugin.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        version: data.version,
        avatar: data.avatar,
        cover: data.cover,
        ...(data.fileId && {
          fileId: data.fileId,
          fileName: data.fileName,
          fileSize: data.fileSize,
          downloadUrl: data.downloadUrl,
        }),
        ...(data.activationFields && {
          activationFields: data.activationFields,
        }),
        ...(data.uiFields && {
          uiFields: data.uiFields,
        }),
      },
    });

    revalidatePath("/admin/plugins");
    return { success: true, plugin };
  } catch (error) {
    console.error("Error updating plugin:", error);
    return { success: false, error: "更新插件失败" };
  }
}

export async function deletePlugin(id: string) {
  try {
    await prisma.plugin.delete({
      where: { id },
    });

    revalidatePath("/admin/plugins");
    return { success: true };
  } catch (error) {
    console.error("Error deleting plugin:", error);
    return { success: false, error: "删除插件失败" };
  }
}
