import { prisma } from "@/lib/db";

export async function checkPluginManagerDownloaded(userId: string) {
  const pluginManagerProductId = process.env.PLUGIN_MANAGER_PRODUCT_ID;
  if (!pluginManagerProductId) {
    throw new Error("PLUGIN_MANAGER_PRODUCT_ID is not defined in environment variables");
  }

  const order = await prisma.order.findFirst({
    where: {
      userId,
      productId: pluginManagerProductId,
      status: "COMPLETED",
    },
  });

  return !!order;
}

export async function getLatestPluginManagerVersion() {
  const projectId = process.env.NEXT_PUBLIC_PLUGIN_MANAGER_PROJECT_ID;
  if (!projectId) {
    throw new Error("NEXT_PUBLIC_PLUGIN_MANAGER_PROJECT_ID is not defined in environment variables");
  }

  const plugin = await prisma.plugin.findFirst({
    where: { 
      project_id: projectId,
      isLatest: true
    },
    select: {
      id: true,
      name: true,
      version: true,
      versionNumber: true,
      downloadUrl: true
    }
  });

  if (!plugin) {
    throw new Error("Plugin manager not found");
  }

  return plugin;
}