import { prisma } from "@/lib/db";

export async function getUsers() {
  return await prisma.user.findMany({
    include: {
      orders: {
        select: {
          id: true,
        },
      },
      licenses: {
        select: {
          id: true,
          status: true,
        },
      },
      affiliate: {
        select: {
          id: true,
          totalEarnings: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getUserById(id: string) {
  return await prisma.user.findUnique({
    where: { id },
    include: {
      orders: {
        include: {
          product: true,
          license: true,
        },
      },
      licenses: {
        include: {
          plugin: true,
        },
      },
      affiliate: {
        include: {
          paymentMethod: true,
        },
      },
    },
  });
}
