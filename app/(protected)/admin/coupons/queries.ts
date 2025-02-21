"use server";

import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

function convertDecimalToNumber(decimal: Prisma.Decimal | null): number {
  if (decimal === null) return 0;
  return Number(decimal.toString());
}

function convertToPlainObject(data: any) {
  return JSON.parse(JSON.stringify(data));
}

export async function getCoupons() {
  try {
    const coupons = await prisma.coupon.findMany({
      include: {
        affiliate: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return convertToPlainObject(coupons).map(coupon => ({
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
      include: {
        affiliate: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!coupon) {
      throw new Error("Coupon not found");
    }

    const plainCoupon = convertToPlainObject(coupon);
    return {
      ...plainCoupon,
      value: convertDecimalToNumber(plainCoupon.value),
      minAmount: convertDecimalToNumber(plainCoupon.minAmount)
    };
  } catch (error) {
    console.error("Error fetching coupon:", error);
    throw new Error("Failed to fetch coupon");
  }
}

export async function getAffiliates() {
  try {
    const affiliates = await prisma.affiliate.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return convertToPlainObject(affiliates);
  } catch (error) {
    console.error("Error fetching affiliates:", error);
    throw new Error("Failed to fetch affiliates");
  }
}