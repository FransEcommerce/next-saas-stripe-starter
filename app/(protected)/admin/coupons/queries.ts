"use server";

import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
function convertDecimalToNumber(decimal: Prisma.Decimal | null): number {
  if (decimal === null) return 0;
  return Number(decimal.toString());
}

export async function getCoupons() {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return coupons.map(coupon => ({
      ...coupon,
      value: convertDecimalToNumber(coupon.value),
      minAmount: convertDecimalToNumber(coupon.minAmount)
    }));
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

    return {
      ...coupon,
      value: convertDecimalToNumber(coupon.value),
      minAmount: convertDecimalToNumber(coupon.minAmount)
    };
  } catch (error) {
    console.error("Error fetching coupon:", error);
    throw new Error("Failed to fetch coupon");
  }
}