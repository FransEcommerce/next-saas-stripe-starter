'use server'

import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

export async function validateCoupon(code: string, amount: number) {
    try {
        const coupon = await prisma.coupon.findUnique({
            where: { code }
        });

        if (!coupon) {
            return { error: "Invalid coupon code" };
        }

        if (!coupon.active) {
            return { error: "Coupon is inactive" };
        }

        if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
            return { error: "Coupon has reached maximum usage limit" };
        }

        const now = new Date();
        if (coupon.startDate && now < coupon.startDate) {
            return { error: "Coupon is not yet valid" };
        }

        if (coupon.endDate && now > coupon.endDate) {
            return { error: "Coupon has expired" };
        }

        if (coupon.minAmount && amount < Number(coupon.minAmount)) {
            return {
                error: `Order amount must be at least $${coupon.minAmount} to use this coupon`
            };
        }

        let discountAmount = 0;
        const value = Number(coupon.value);

        if (coupon.type === "FIXED") {
            discountAmount = value;
        } else if (coupon.type === "PERCENTAGE") {
            discountAmount = (amount * (value / 100));
        }

        discountAmount = Math.min(discountAmount, amount);

        return {
            coupon: {
                id: coupon.id,
                code: coupon.code,
                type: coupon.type,
                value: value,
                discountAmount: Number(discountAmount.toFixed(2))
            }
        };
    } catch (error) {
        console.error("Error validating coupon:", error);
        return { error: "Failed to validate coupon" };
    }
}