"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function createCoupon(data: any) {
  try {
    const coupon = await prisma.coupon.create({
      data: {
        code: data.code,
        type: data.type,
        value: data.value,
        active: data.active,
        maxUses: data.maxUses || null,
        minAmount: data.minAmount || null,
        startDate: data.startDate || null,
        endDate: data.endDate || null,
        usedCount: 0
      },
    });

    revalidatePath("/admin/coupons");
    return { success: true, data: coupon };
  } catch (error) {
    console.error("Error creating coupon:", error);
    return { success: false, error: "Failed to create coupon" };
  }
}

export async function updateCoupon(id: string, data: any) {
  try {
    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        code: data.code,
        type: data.type,
        value: new Prisma.Decimal(data.value),
        active: data.active,
        maxUses: data.maxUses || null,
        minAmount: data.minAmount ? new Prisma.Decimal(data.minAmount) : null,
        startDate: data.startDate,
        endDate: data.endDate,
      },
    });

    revalidatePath("/admin/coupons");
    return { success: true, data: coupon };
  } catch (error) {
    console.error("Error updating coupon:", error);
    return { success: false, error: "Failed to update coupon" };
  }
}

export async function deleteCoupon(id: string) {
  try {
    await prisma.coupon.delete({
      where: { id },
    });

    revalidatePath("/admin/coupons");
    return { success: true };
  } catch (error) {
    console.error("Error deleting coupon:", error);
    return { success: false, error: "Failed to delete coupon" };
  }
}