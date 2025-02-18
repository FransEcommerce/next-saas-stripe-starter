import { prisma } from "@/lib/db";

export async function getPlugins() {
  return await prisma.plugin.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getPluginById(id: string) {
  return await prisma.plugin.findUnique({
    where: { id },
  });
}
