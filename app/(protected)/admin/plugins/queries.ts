import { prisma } from "@/lib/db";

export async function getPlugins() {
  const plugins = await prisma.plugin.findMany({
    where: {
      isLatest: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      description: true,
      version: true,
      versionNumber: true,
      chatpionVersion: true,
      changelog: true,
      createdAt: true,
      isLatest: true,
      parentId: true,
      project_id: true,
    }
  });
  return JSON.parse(JSON.stringify(plugins));
}

export async function getPluginById(id: string) {
  const plugin = await prisma.plugin.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      description: true,
      version: true,
      versionNumber: true,
      chatpionVersion: true,
      changelog: true,
      avatar: true,
      cover: true,
      fileId: true,
      fileName: true,
      fileSize: true,
      downloadUrl: true,
      createdAt: true,
      isLatest: true,
      parentId: true,
      project_id: true,
      activationFields: true,
      uiFields: true,
      products: true,
      licenses: true,
    }
  });
  return plugin ? JSON.parse(JSON.stringify(plugin)) : null;
}

export async function getPluginVersions(pluginId: string) {
  // 获取插件（无论是原始插件还是版本）
  const plugin = await prisma.plugin.findUnique({
    where: { id: pluginId }
  });

  if (!plugin) return [];

  // 如果是子版本，使用parentId，否则使用自己的id
  const targetId = plugin.parentId || plugin.id;

  // 获取所有相关版本（包括原始版本和所有子版本）
  const versions = await prisma.plugin.findMany({
    where: {
      OR: [
        { id: targetId },
        { parentId: targetId }
      ]
    },
    orderBy: [
      { versionNumber: "desc" },
      { createdAt: "desc" }
    ],
    select: {
      id: true,
      name: true,
      description: true,
      version: true,
      versionNumber: true,
      chatpionVersion: true,
      changelog: true,
      createdAt: true,
      isLatest: true,
      parentId: true,
      project_id: true,
    }
  });
  return JSON.parse(JSON.stringify(versions));
}
