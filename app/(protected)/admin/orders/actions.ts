"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { Prisma } from "@prisma/client";
import { generateOrderNumber } from "@/lib/order";

function generateLicenseKey() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const segments = 4;
  const segmentLength = 4;
  
  const generateSegment = () => {
    let segment = "";
    for (let i = 0; i < segmentLength; i++) {
      segment += chars[Math.floor(Math.random() * chars.length)];
    }
    return segment;
  };

  const licenseSegments = Array(segments).fill(null).map(generateSegment);
  return licenseSegments.join("-");
}

interface OrderInput {
  userId: string;
  productId: string;
  amount: number;
  status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED" | "CANCELLED";
  billingName: string;
  billingAddress: string;
  billingCity: string;
  billingState: string;
  billingCountry: string;
  billingZip: string;
  billingPhone: string;
  couponCode?: string;
  discountAmount?: number;
  paymentMethod?: string;
  tax?: number;
  affiliateId?: string;
  affiliateCommission?: number;
}

interface CreateOrderInput {
  userId: string;
  productId: string;
  couponId?: string;
  amount: number;
  subtotal: number;
  discountAmount: number;
  tax: number;
  status: string;
  paymentMethod: string;
  paymentNote?: string;
  paymentProof?: string;
  billingName?: string;
  billingEmail?: string;
  billingAddress?: string;
  billingCity?: string;
  billingState?: string;
  billingCountry?: string;
  billingZip?: string;
  billingPhone?: string;
  affiliateId?: string;
  affiliateCommission?: number;
}

function convertDecimalToNumber(decimal: Prisma.Decimal | null): number {
  if (decimal === null) return 0;
  return Number(decimal.toString());
}

export async function createOrder(data: CreateOrderInput) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      throw new Error("Unauthorized access");
    }

    const product = await prisma.product.findUnique({
      where: { id: data.productId },
      include: { plugin: true },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    const order = await prisma.$transaction(async (tx) => {
      // 创建订单
      const newOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId: data.userId,
          productId: data.productId,
          couponId: data.couponId || undefined,
          amount: new Prisma.Decimal(data.amount),
          subtotal: new Prisma.Decimal(data.subtotal),
          discountAmount: new Prisma.Decimal(data.discountAmount),
          tax: new Prisma.Decimal(data.tax),
          status: data.status,
          paymentMethod: data.paymentMethod,
          paymentNote: data.paymentNote || null,
          paymentProof: data.paymentProof || null,
          billingName: data.billingName || null,
          billingEmail: data.billingEmail || null,
          billingAddress: data.billingAddress || null,
          billingCity: data.billingCity || null,
          billingState: data.billingState || null,
          billingCountry: data.billingCountry || null,
          billingZip: data.billingZip || null,
          billingPhone: data.billingPhone || null,
          affiliateId: data.affiliateId || null,
          affiliateCommission: data.affiliateCommission || null,
        },
        include: {
          product: true,
        },
      });

      // 如果使用了优惠券，更新优惠券使用次数
      if (data.couponId) {
        await tx.coupon.update({
          where: { id: data.couponId },
          data: {
            usedCount: {
              increment: 1
            }
          }
        });
      }

      return newOrder;
    });

    // 只在订单状态为 COMPLETED 时才更新推荐人的总收入
    if (data.status === "COMPLETED" && order.affiliateId && order.affiliateCommission) {
      await prisma.affiliate.update({
        where: { id: order.affiliateId },
        data: {
          totalEarnings: {
            increment: order.affiliateCommission
          }
        }
      });
    }

    const processedOrder = {
      ...order,
      amount: convertDecimalToNumber(order.amount),
      subtotal: convertDecimalToNumber(order.subtotal),
      discountAmount: convertDecimalToNumber(order.discountAmount),
      tax: convertDecimalToNumber(order.tax),
      product: order.product ? {
        ...order.product,
        price: convertDecimalToNumber(order.product.price),
        comparePrice: convertDecimalToNumber(order.product.comparePrice),
      } : null,
    };

    // Create license if order is completed
    if (data.status === "COMPLETED") {
      await prisma.license.create({
        data: {
          licenseKey: generateLicenseKey(),
          pluginId: product.plugin.id,
          userId: data.userId,
          status: "PENDING",
          expiresAt: product.duration
            ? new Date(Date.now() + product.duration * 24 * 60 * 60 * 1000)
            : null,
          orderId: order.id,
        },
      });
    }

    revalidatePath("/admin/orders");
    return processedOrder;
  } catch (error) {
    console.error("Failed to create order:", error);
    throw error;
  }
}

export async function updateOrder(id: string, data: OrderInput) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      throw new Error("Unauthorized access");
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        product: {
          include: {
            plugin: true,
          },
        },
      },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    // Calculate order amounts
    const subtotal = data.amount;
    const discountAmount = data.discountAmount || 0;
    const tax = data.tax || 0;
    const amount = subtotal - discountAmount + tax;

    // Handle coupon if provided
    let couponId: string | undefined;
    if (data.couponCode) {
      const coupon = await prisma.coupon.findFirst({
        where: { code: data.couponCode },
      });

      if (coupon) {
        couponId = coupon.id;
      }
    }

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        userId: data.userId,
        productId: data.productId,
        subtotal,
        amount,
        discountAmount,
        tax,
        status: data.status,
        billingName: data.billingName,
        billingAddress: data.billingAddress,
        billingCity: data.billingCity,
        billingState: data.billingState,
        billingCountry: data.billingCountry,
        billingZip: data.billingZip,
        billingPhone: data.billingPhone,
        paymentMethod: data.paymentMethod,
        paidAt: data.status === "COMPLETED" && !order.paidAt ? new Date() : order.paidAt,
        refundedAt: data.status === "REFUNDED" && !order.refundedAt ? new Date() : order.refundedAt,
        cancelledAt: data.status === "CANCELLED" && !order.cancelledAt ? new Date() : order.cancelledAt,
        couponId,
        affiliateId: data.affiliateId,
        affiliateCommission: data.affiliateCommission,
      },
    });

    // Create license if order status changes to completed
    if (data.status === "COMPLETED" && order.status !== "COMPLETED") {
      await prisma.license.create({
        data: {
          licenseKey: generateLicenseKey(),
          pluginId: order.product.plugin.id,
          userId: data.userId,
          status: "PENDING",
          expiresAt: order.product.duration
            ? new Date(Date.now() + order.product.duration * 24 * 60 * 60 * 1000)
            : null,
          orderId: order.id,
        },
      });
    }

    revalidatePath("/admin/orders");
    return { success: true, order: updatedOrder };
  } catch (error) {
    console.error("Failed to update order:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to update order",
    };
  }
}

export async function updateOrderStatus(orderId: string, status: string) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      throw new Error("Unauthorized access");
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        product: {
          include: { plugin: true },
        },
      },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    // 如果订单状态变更为已完成，且还没有许可证，则创建许可证
    if (status === "COMPLETED") {
      const existingLicense = await prisma.license.findFirst({
        where: { orderId: order.id },
      });

      if (!existingLicense) {
        await prisma.license.create({
          data: {
            licenseKey: generateLicenseKey(),
            status: "ACTIVE",
            orderId: order.id,
            userId: order.userId,
            pluginId: order.product.plugin.id,
          },
        });
      }
    }

    revalidatePath("/admin/orders");
    return updatedOrder;
  } catch (error) {
    console.error("Error updating order status:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to update order status",
    };
  }
}

export async function deleteOrder(orderId: string) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      throw new Error("Unauthorized access");
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        license: true,
        affiliate: true,
      },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    await prisma.$transaction(async (tx) => {
      // 1. 如果订单状态是 COMPLETED 且有推荐人佣金，需要减去推荐人的总收入
      if (order.status === "COMPLETED" && order.affiliateId && order.affiliateCommission) {
        await tx.affiliate.update({
          where: { id: order.affiliateId },
          data: {
            totalEarnings: {
              decrement: order.affiliateCommission
            }
          }
        });
      }

      // 2. 删除关联的许可证
      if (order.license) {
        await tx.license.delete({
          where: { id: order.license.id }
        });
      }

      // 3. 如果订单使用了优惠券，减少优惠券使用次数
      if (order.couponId) {
        await tx.coupon.update({
          where: { id: order.couponId },
          data: {
            usedCount: {
              decrement: 1
            }
          }
        });
      }

      // 4. 最后删除订单
      await tx.order.delete({
        where: { id: orderId }
      });
    });

    revalidatePath("/admin/orders");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete order:", error);
    throw error;
  }
}
