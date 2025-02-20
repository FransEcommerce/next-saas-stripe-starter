import { prisma } from "@/lib/db";

export async function getUsers() {
  const users = await prisma.user.findMany({
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

  return users.map(user => ({
    ...user,
    affiliate: user.affiliate
      ? {
          ...user.affiliate,
          totalEarnings: Number(user.affiliate.totalEarnings)
        }
      : null
  }));
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

  return users.map(user => ({
    ...user,
    affiliate: user.affiliate
      ? {
          ...user.affiliate,
          totalEarnings: Number(user.affiliate.totalEarnings)
        }
      : null
  }));
}
