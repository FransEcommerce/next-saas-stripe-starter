import { prisma } from "@/lib/db";

export async function getLicenses() {
  try {
    const licenses = await prisma.license.findMany({
      include: {
        plugin: {
          select: {
            id: true,
            name: true,
            version: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            amount: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return JSON.parse(JSON.stringify(licenses));
  } catch (error) {
    console.error("Error fetching licenses:", error);
    throw error;
  }
}
