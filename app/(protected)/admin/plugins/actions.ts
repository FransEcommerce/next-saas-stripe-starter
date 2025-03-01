"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { generateProjectId } from "@/lib/utils";

// 自定义业务逻辑错误类
class BusinessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BusinessError';
  }
}

interface PluginInput {
  name: string;
  description?: string;
  version: string;
  chatpionVersion?: string;
  avatar?: string;
  cover?: string;
  fileId?: string;
  fileName?: string;
  fileSize?: string;
  downloadUrl: string;
  activationFields: Record<string, any>;
  uiFields: Record<string, any>;
  changelog?: string;
}

interface CreatePluginInput extends PluginInput {}
interface UpdatePluginInput extends Partial<PluginInput> {}

const createPluginSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  version: z.string(),
  chatpionVersion: z.string().optional(),
  avatar: z.string().optional(),
  cover: z.string().optional(),
  fileId: z.string().optional(),
  fileName: z.string().optional(),
  fileSize: z.string().optional(),
  downloadUrl: z.string(),
  activationFields: z.record(z.any()),
  uiFields: z.record(z.any()),
  changelog: z.string().optional(),
});

export async function createPlugin(data: CreatePluginInput) {
  try {
    // 验证数据
    const validatedData = createPluginSchema.parse({
      ...data,
      changelog: data.changelog || "Initial version",
    });

    // 生成新的 project_id
    const project_id = generateProjectId();

    // 创建插件
    const plugin = await prisma.plugin.create({
      data: {
        ...validatedData,
        project_id,
        isLatest: true,
        versionNumber: 1,
      },
    });

    revalidatePath("/admin/plugins");
    return { success: true, plugin };
  } catch (error) {
    if (error instanceof BusinessError) {
      return { success: false, message: error.message };
    }
    console.error("Error creating plugin:", error);
    throw error;
  }
}

export async function createPluginVersion(pluginId: string, data: CreatePluginInput) {
  try {
    // 获取原始插件，包括 version 和 project_id
    const originalPlugin = await prisma.plugin.findUnique({
      where: { id: pluginId },
      select: {
        id: true,
        version: true,
        project_id: true,
        versionNumber: true,
        parentId: true,
      }
    });

    if (!originalPlugin) {
      throw new BusinessError("Original plugin not found");
    }

    // 验证版本号
    const currentVersion = originalPlugin.version.split('.').map(Number);
    const newVersion = data.version.split('.').map(Number);
    
    if (newVersion.length !== 3 || newVersion.some(n => isNaN(n))) {
      throw new BusinessError("Invalid version format. Use x.y.z format");
    }
    
    for (let i = 0; i < 3; i++) {
      if (newVersion[i] > currentVersion[i]) break;
      if (newVersion[i] < currentVersion[i]) {
        throw new BusinessError("New version must be higher than the current version");
      }
      if (i === 2) {
        throw new BusinessError("New version must be higher than the current version");
      }
    }

    // 验证更新日志
    if (!data.changelog?.trim()) {
      throw new BusinessError("Changelog is required for new versions");
    }

    // 更新当前版本的 isLatest 状态
    await prisma.plugin.update({
      where: { id: originalPlugin.id },
      data: { isLatest: false },
    });

    // 创建新版本，继承 project_id
    const newPluginVersion = await prisma.plugin.create({
      data: {
        ...data,
        project_id: originalPlugin.project_id, // 继承 project_id
        parentId: originalPlugin.parentId || originalPlugin.id,
        isLatest: true,
        versionNumber: (originalPlugin.versionNumber || 1) + 1,
      },
    });

    revalidatePath("/admin/plugins");
    return { success: true, plugin: newPluginVersion };
  } catch (error) {
    if (error instanceof BusinessError) {
      return { success: false, message: error.message };
    }
    console.error("Error creating plugin version:", error);
    throw error;
  }
}

export async function updatePlugin(id: string, data: UpdatePluginInput) {
  try {
    const plugin = await prisma.plugin.update({
      where: { id },
      data: {
        ...data,
        changelog: data.changelog || undefined, // 只在有值时更新
      },
    });

    revalidatePath("/admin/plugins");
    return { success: true, plugin };
  } catch (error) {
    if (error instanceof BusinessError) {
      return { success: false, message: error.message };
    }
    console.error("Error updating plugin:", error);
    throw error;
  }
}

export async function deletePlugin(pluginId: string) {
  try {
    const plugin = await prisma.plugin.findUnique({
      where: { id: pluginId },
      include: {
        licenses: true,
        products: {
          include: {
            orders: true
          }
        },
        downloadTokens: true
      }
    });

    if (!plugin) {
      throw new BusinessError("Plugin not found");
    }

    // 检查关联
    if (plugin.licenses.length > 0) {
      throw new BusinessError("Cannot delete plugin: Has associated licenses");
    }

    if (plugin.products.some(product => product.orders.length > 0)) {
      throw new BusinessError("Cannot delete plugin: Has associated orders");
    }

    if (plugin.products.length > 0) {
      throw new BusinessError("Cannot delete plugin: Has associated products");
    }

    // 获取所有相关版本
    const targetId = plugin.parentId || plugin.id;
    const allVersions = await prisma.plugin.findMany({
      where: {
        OR: [
          { id: targetId },
          { parentId: targetId }
        ]
      },
      include: {
        licenses: true,
        products: {
          include: {
            orders: true
          }
        },
        downloadTokens: true
      }
    });

    // 检查所有版本是否可以删除
    for (const version of allVersions) {
      if (version.licenses.length > 0) {
        throw new BusinessError(`Cannot delete plugin: Version ${version.version} has associated licenses`);
      }

      if (version.products.some(product => product.orders.length > 0)) {
        throw new BusinessError(`Cannot delete plugin: Version ${version.version} has associated orders`);
      }

      if (version.products.length > 0) {
        throw new BusinessError(`Cannot delete plugin: Version ${version.version} has associated products`);
      }
    }

    // 逐个删除所有版本
    for (const version of allVersions) {
      // 先删除关联的 DownloadToken
      await prisma.downloadToken.deleteMany({
        where: { pluginId: version.id }
      });

      await prisma.plugin.delete({
        where: { id: version.id }
      });
    }

    return { success: true };
  } catch (error) {
    if (error instanceof BusinessError) {
      return { success: false, message: error.message };
    }
    console.error("Error deleting plugin:", error);
    throw error;
  }
}

export async function deletePluginVersion(versionId: string) {
  try {
    const version = await prisma.plugin.findUnique({
      where: { id: versionId },
      include: {
        licenses: true,
        products: {
          include: {
            orders: true
          }
        },
        downloadTokens: true
      }
    });

    if (!version) {
      throw new BusinessError("Version not found");
    }

    // 检查关联
    if (version.licenses.length > 0) {
      throw new BusinessError("Cannot delete version: Has associated licenses");
    }

    if (version.products.some(product => product.orders.length > 0)) {
      throw new BusinessError("Cannot delete version: Has associated orders");
    }

    if (version.products.length > 0) {
      throw new BusinessError("Cannot delete version: Has associated products");
    }

    // 如果是最新版本，需要将上一个版本设置为最新
    if (version.isLatest && version.parentId) {
      const previousVersion = await prisma.plugin.findFirst({
        where: {
          OR: [
            { id: version.parentId },
            { parentId: version.parentId }
          ],
          id: { not: version.id }
        },
        orderBy: {
          versionNumber: 'desc'
        }
      });

      if (previousVersion) {
        await prisma.plugin.update({
          where: { id: previousVersion.id },
          data: { isLatest: true }
        });
      }
    }

    // 先删除关联的 DownloadToken
    await prisma.downloadToken.deleteMany({
      where: { pluginId: versionId }
    });

    await prisma.plugin.delete({
      where: { id: versionId }
    });

    return { success: true };
  } catch (error) {
    if (error instanceof BusinessError) {
      return { success: false, message: error.message };
    }
    console.error("Error deleting plugin version:", error);
    throw error;
  }
}


export async function updatePluginProjectId(pluginId: string, newProjectId: string) {
  try {
    // 验证 Project ID 格式
    if (!/^\d{9}$/.test(newProjectId)) {
      throw new BusinessError("Project ID must be a 9-digit number (YYMMDDXXX)");
    }

    // 获取前6位作为日期部分
    const datePart = newProjectId.slice(0, 6);
    const year = parseInt(datePart.slice(0, 2), 10) + 2000;
    const month = parseInt(datePart.slice(2, 4), 10) - 1; // JavaScript months are 0-based
    const day = parseInt(datePart.slice(4, 6), 10);

    // 验证日期是否有效
    const date = new Date(year, month, day);
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month ||
      date.getDate() !== day
    ) {
      throw new BusinessError("The date part of Project ID is invalid");
    }

    // 获取原始插件
    const originalPlugin = await prisma.plugin.findUnique({
      where: { id: pluginId },
      select: { parentId: true }
    });

    if (!originalPlugin) {
      throw new BusinessError("Plugin not found");
    }

    // 获取所有相关版本
    const targetId = originalPlugin.parentId || pluginId;
    const allVersions = await prisma.plugin.findMany({
      where: {
        OR: [
          { id: targetId },
          { parentId: targetId }
        ]
      }
    });

    // 批量更新所有版本的 project_id
    await prisma.$transaction(
      allVersions.map(plugin => 
        prisma.plugin.update({
          where: { id: plugin.id },
          data: { project_id: newProjectId }
        })
      )
    );

    revalidatePath("/admin/plugins");
    return { success: true };
  } catch (error) {
    if (error instanceof BusinessError) {
      return { success: false, message: error.message };
    }
    console.error("Error updating project ID:", error);
    throw error;
  }
}