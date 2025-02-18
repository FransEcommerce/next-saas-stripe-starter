"use server";

import { prisma } from "@/lib/db";

export async function getCoupons() {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return coupons;
  } catch (error) {
    console.error("Error fetching coupons:", error);
    throw new Error("Failed to fetch coupons");
  }
}

export async function getCouponById(id: string) {
  try {
    const coupon = await prisma.coupon.findUnique({
      where: { id },
    });

    if (!coupon) {
      throw new Error("Coupon not found");
    }

    return coupon;
  } catch (error) {
    console.error("Error fetching coupon:", error);
    throw new Error("Failed to fetch coupon");
  }
}