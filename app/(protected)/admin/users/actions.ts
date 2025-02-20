"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { UserRole } from "@prisma/client";

const userSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  role: z.nativeEnum(UserRole),
  billingCompany: z.string().optional(),
  billingName: z.string().optional(),
  billingAddress: z.string().optional(),
  billingCity: z.string().optional(),
  billingState: z.string().optional(),
  billingCountry: z.string().optional(),
  billingZip: z.string().optional(),
  billingPhone: z.string().optional(),
});

export async function createUser(data: z.infer<typeof userSchema>) {
  try {
    const validatedData = userSchema.parse(data);
    
    const user = await prisma.user.create({
      data: {
        ...validatedData,
        role: validatedData.role || "USER",
      },
    });

    revalidatePath("/admin/users");
    return user;
  } catch (error) {
    console.error("Error creating user:", error);
    throw new Error("Failed to create user");
  }
}

export async function updateUser(userId: string, data: z.infer<typeof userSchema>) {
  try {
    const validatedData = userSchema.parse(data);
    
    const user = await prisma.user.update({
      where: { id: userId },
      data: validatedData,
    });

    revalidatePath("/admin/users");
    return user;
  } catch (error) {
    console.error("Error updating user:", error);
    throw new Error("Failed to update user");
  }
}

export async function getUserRelatedDataCount(userId: string) {
  try {
    const [ordersCount, licensesCount, downloadTokensCount, affiliateData] = await Promise.all([
      prisma.order.count({ where: { userId } }),
      prisma.license.count({ where: { userId } }),
      prisma.downloadToken.count({ where: { userId } }),
      prisma.affiliate.findUnique({
        where: { userId },
        select: {
          id: true,
          totalEarnings: true,
          _count: {
            select: {
              referredOrders: true,
              payments: true,
            },
          },
        },
      }),
    ]);

    return {
      ordersCount,
      licensesCount,
      downloadTokensCount,
      affiliateData: affiliateData ? {
        id: affiliateData.id,
        totalEarnings: Number(affiliateData.totalEarnings),
        referredOrdersCount: affiliateData._count.referredOrders,
        paymentsCount: affiliateData._count.payments,
      } : null,
    };
  } catch (error) {
    console.error("Error getting user related data count:", error);
    throw new Error("Failed to get user related data");
  }
}

export async function deleteUser(userId: string) {
  try {
    // 使用事务确保所有删除操作要么全部成功，要么全部失败
    await prisma.$transaction(async (tx) => {
      // 1. 删除用户的下载令牌
      await tx.downloadToken.deleteMany({
        where: { userId },
      });

      // 2. 删除用户的许可证
      await tx.license.deleteMany({
        where: { userId },
      });

      // 3. 删除用户的推广员相关数据
      const affiliate = await tx.affiliate.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (affiliate) {
        // 首先删除推广员支付记录，因为它依赖于支付方式
        await tx.affiliatePayment.deleteMany({
          where: { affiliateId: affiliate.id },
        });

        // 然后删除推广员支付方式
        await tx.affiliatePaymentMethod.deleteMany({
          where: { affiliateId: affiliate.id },
        });

        // 更新引用了这个推广员的订单
        await tx.order.updateMany({
          where: { affiliateId: affiliate.id },
          data: { affiliateId: null },
        });

        // 最后删除推广员记录
        await tx.affiliate.delete({
          where: { id: affiliate.id },
        });
      }

      // 4. 删除用户的订单
      await tx.order.deleteMany({
        where: { userId },
      });

      // 5. 删除用户的会话
      await tx.session.deleteMany({
        where: { userId },
      });

      // 6. 删除用户的账户
      await tx.account.deleteMany({
        where: { userId },
      });

      // 7. 最后删除用户本身
      await tx.user.delete({
        where: { id: userId },
      });
    });

    revalidatePath("/admin/users");
  } catch (error) {
    console.error("Error deleting user:", error);
    throw new Error("Failed to delete user");
  }
}
