"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { Prisma } from "@prisma/client";
import { generateOrderNumber } from "@/lib/order";
import { z } from "zod";
import { formatPrice } from "@/lib/utils";

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
  billingEmail: string;
  billingCompany: string;
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
  tax?: number;
  discountAmount?: number;
  status: string;
  paymentMethod?: string;
  paymentNote?: string;
  paymentProof?: string;
  affiliateId?: string | null;
  affiliateCommission?: number | null;
  billingName: string;
  billingEmail: string;
  billingCompany: string;
  billingAddress: string;
  billingCity: string;
  billingState: string;
  billingCountry: string;
  billingZip: string;
  billingPhone: string;
}

interface OrderPaymentUpdateInput {
  amount: number;
  subtotal: number;
  discountAmount?: number;
  tax?: number;
  affiliateCommission?: number;
  affiliateId?: string;
  paymentMethod?: string;
  paymentNote?: string;
  paymentProof?: string;
  couponCode?: string;
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
          discountAmount: new Prisma.Decimal(data.discountAmount || 0),
          tax: new Prisma.Decimal(data.tax || 0),
          status: data.status,
          paymentMethod: data.paymentMethod,
          paymentNote: data.paymentNote || null,
          paymentProof: data.paymentProof || null,
          billingName: data.billingName,
          billingEmail: data.billingEmail,
          billingCompany: data.billingCompany,
          billingAddress: data.billingAddress,
          billingCity: data.billingCity,
          billingState: data.billingState,
          billingCountry: data.billingCountry,
          billingZip: data.billingZip,
          billingPhone: data.billingPhone,
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
      affiliateCommission: order.affiliateCommission ? convertDecimalToNumber(order.affiliateCommission) : null,
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
        license: true,
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

    // Handle coupon changes
    let couponId: string | undefined = order.couponId;
    if (data.couponCode) {
      const coupon = await prisma.coupon.findFirst({
        where: { code: data.couponCode },
      });

      if (coupon) {
        // If coupon is different from current one
        if (coupon.id !== order.couponId) {
          // Decrement old coupon usage if exists
          if (order.couponId) {
            await prisma.coupon.update({
              where: { id: order.couponId },
              data: { usedCount: { decrement: 1 } }
            });
          }
          // Increment new coupon usage
          await prisma.coupon.update({
            where: { id: coupon.id },
            data: { usedCount: { increment: 1 } }
          });
          couponId = coupon.id;
        }
      }
    } else if (order.couponId) {
      // If coupon was removed, decrement its usage
      await prisma.coupon.update({
        where: { id: order.couponId },
        data: { usedCount: { decrement: 1 } }
      });
      couponId = undefined;
    }

    // Handle affiliate commission changes
    if (data.affiliateId && data.affiliateCommission) {
      // If order was completed and affiliate changed or commission amount changed
      if (order.status === "COMPLETED") {
        if (order.affiliateId && order.affiliateCommission) {
          // Deduct old commission
          await prisma.affiliate.update({
            where: { id: order.affiliateId },
            data: {
              totalEarnings: {
                decrement: order.affiliateCommission
              }
            }
          });
        }
        // Add new commission
        await prisma.affiliate.update({
          where: { id: data.affiliateId },
          data: {
            totalEarnings: {
              increment: data.affiliateCommission
            }
          }
        });
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
        billingEmail: data.billingEmail,
        billingCompany: data.billingCompany,
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

    // Handle license based on status change
    if (data.status === "COMPLETED" && order.status !== "COMPLETED") {
      // Create new license if none exists
      if (!order.license) {
        await prisma.license.create({
          data: {
            licenseKey: generateLicenseKey(),
            pluginId: order.product.plugin.id,
            userId: data.userId,
            status: "ACTIVE",
            expiresAt: order.product.duration
              ? new Date(Date.now() + order.product.duration * 24 * 60 * 60 * 1000)
              : null,
            orderId: order.id,
          },
        });
      } else if (order.license.status !== "ACTIVE") {
        // Update existing license to active if not already
        await prisma.license.update({
          where: { id: order.license.id },
          data: { status: "ACTIVE" }
        });
      }
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
      include: {
        product: true,
        coupon: true
      }
    });

    const processedOrder = {
      ...updatedOrder,
      amount: convertDecimalToNumber(updatedOrder.amount),
      subtotal: convertDecimalToNumber(updatedOrder.subtotal),
      discountAmount: convertDecimalToNumber(updatedOrder.discountAmount),
      tax: convertDecimalToNumber(updatedOrder.tax),
      affiliateCommission: convertDecimalToNumber(updatedOrder.affiliateCommission),
      product: updatedOrder.product ? {
        ...updatedOrder.product,
        price: convertDecimalToNumber(updatedOrder.product.price),
        comparePrice: convertDecimalToNumber(updatedOrder.product.comparePrice),
      } : null,
      coupon: updatedOrder.coupon ? {
        ...updatedOrder.coupon,
        value: convertDecimalToNumber(updatedOrder.coupon.value),
      } : null,
    };

    // 如果订单状态变更为已完成，且还没有许可证，则创建许可证
    if (status === "COMPLETED") {
      const existingLicense = await prisma.license.findFirst({
        where: { orderId: order.id },
      });

      if (!existingLicense) {
        await prisma.license.create({
          data: {
            licenseKey: generateLicenseKey(),
            status: "PENDING",
            orderId: order.id,
            userId: order.userId,
            pluginId: order.product.plugin.id,
            expiresAt: order.product.duration
              ? new Date(Date.now() + order.product.duration * 24 * 60 * 60 * 1000)
              : null,
          },
        });
      }
    }

    revalidatePath("/admin/orders");
    return processedOrder;
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

const updateCustomerSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  billingCompany: z.string().optional(),
  billingName: z.string().optional(),
  billingAddress: z.string().optional(),
  billingCity: z.string().optional(),
  billingState: z.string().optional(),
  billingCountry: z.string().optional(),
  billingZip: z.string().optional(),
  billingPhone: z.string().optional(),
});

const updatePaymentSchema = z.object({
  amount: z.number().min(0),
  subtotal: z.number().min(0),
  discountAmount: z.number().min(0).optional(),
  tax: z.number().min(0).optional(),
  affiliateCommission: z.number().min(0).optional(),
  paymentMethod: z.string().optional(),
  paymentNote: z.string().optional(),
  paymentProof: z.string().url().optional(),
  couponCode: z.string().optional(),
});

export async function updateOrderCustomer(orderId: string, data: z.infer<typeof updateCustomerSchema>) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    // 更新用户信息
    await prisma.user.update({
      where: { id: order.userId },
      data: {
        name: data.name,
        email: data.email,
      },
    });

    // 更新订单账单信息
    await prisma.order.update({
      where: { id: orderId },
      data: {
        billingCompany: data.billingCompany,
        billingName: data.billingName,
        billingAddress: data.billingAddress,
        billingCity: data.billingCity,
        billingState: data.billingState,
        billingCountry: data.billingCountry,
        billingZip: data.billingZip,
        billingPhone: data.billingPhone,
      },
    });

    revalidatePath("/admin/orders/[id]", "page");
  } catch (error) {
    console.error("Failed to update order customer:", error);
    throw error;
  }
}

export async function updateOrderPayment(orderId: string, data: OrderPaymentUpdateInput) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        coupon: true,
        product: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            comparePrice: true,
            active: true,
            duration: true,
            features: true,
            createdAt: true,
            updatedAt: true,
            pluginId: true
          }
        },
        affiliate: {
          include: {
            user: true
          }
        }
      },
    });

    if (!order) {
      return { error: "Order not found" };
    }

    // 准备更新数据
    let updateData = {
      amount: data.subtotal - (data.discountAmount || 0) + (data.tax || 0),
      subtotal: data.subtotal,
      discountAmount: data.discountAmount || 0,
      tax: data.tax || 0,
      affiliateCommission: data.affiliateCommission,
      paymentMethod: data.paymentMethod,
      paymentNote: data.paymentNote,
      paymentProof: data.paymentProof,
    };

    // 处理 affiliate 变更
    if (data.affiliateId) {
      if (data.affiliateId === "none") {
        updateData = { ...updateData, affiliateId: null, affiliateCommission: null };
      } else {
        const affiliate = await prisma.affiliate.findUnique({
          where: { id: data.affiliateId },
        });
        if (!affiliate) {
          return { error: "Affiliate not found" };
        }
        updateData = { ...updateData, affiliateId: data.affiliateId };
      }
    }

    // 处理优惠券变更
    if (data.couponCode) {
      const coupon = await prisma.coupon.findFirst({
        where: { code: data.couponCode },
      });

      if (coupon) {
        if (coupon.id !== order.couponId) {
          if (order.couponId) {
            await prisma.coupon.update({
              where: { id: order.couponId },
              data: { usedCount: { decrement: 1 } }
            });
          }
          await prisma.coupon.update({
            where: { id: coupon.id },
            data: { usedCount: { increment: 1 } }
          });
          updateData = { ...updateData, couponId: coupon.id };
        }
      }
    } else if (order.couponId) {
      await prisma.coupon.update({
        where: { id: order.couponId },
        data: { usedCount: { decrement: 1 } }
      });
      updateData = { ...updateData, couponId: null };
    }

    // 更新订单
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        coupon: true,
        product: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            comparePrice: true,
            active: true,
            duration: true,
            features: true,
            createdAt: true,
            updatedAt: true,
            pluginId: true
          }
        },
        affiliate: {
          include: {
            user: true
          }
        }
      },
    });

    // 转换 Decimal 类型为普通数字
    const formattedOrder = {
      ...updatedOrder,
      amount: Number(updatedOrder.amount),
      subtotal: Number(updatedOrder.subtotal),
      discountAmount: updatedOrder.discountAmount ? Number(updatedOrder.discountAmount) : null,
      tax: updatedOrder.tax ? Number(updatedOrder.tax) : null,
      affiliateCommission: updatedOrder.affiliateCommission ? Number(updatedOrder.affiliateCommission) : null,
      product: updatedOrder.product ? {
        ...updatedOrder.product,
        price: Number(updatedOrder.product.price),
        comparePrice: updatedOrder.product.comparePrice ? Number(updatedOrder.product.comparePrice) : null
      } : null,
      coupon: updatedOrder.coupon ? {
        ...updatedOrder.coupon,
        value: Number(updatedOrder.coupon.value)
      } : null,
      affiliate: updatedOrder.affiliate ? {
        ...updatedOrder.affiliate,
        commissionValue: Number(updatedOrder.affiliate.commissionValue),
        totalEarnings: Number(updatedOrder.affiliate.totalEarnings),
        user: updatedOrder.affiliate.user
      } : null
    };

    revalidatePath(`/admin/orders/${orderId}`);
    return { success: true, data: formattedOrder };
  } catch (error) {
    console.error("Error updating order payment:", error);
    return { error: "Failed to update payment information" };
  }
}

export async function validateCoupon(code: string, subtotal: number) {
  try {
    const coupon = await prisma.coupon.findFirst({
      where: { 
        code,
        active: true,
        OR: [
          { maxUses: null },
          { maxUses: { gt: prisma.coupon.fields.usedCount } }
        ],
        AND: [
          {
            OR: [
              { startDate: null },
              { startDate: { lte: new Date() } }
            ]
          },
          {
            OR: [
              { endDate: null },
              { endDate: { gte: new Date() } }
            ]
          }
        ]
      },
    });

    if (!coupon) {
      return { error: "Invalid or expired coupon code" };
    }

    // 检查最小订单金额
    if (coupon.minAmount && subtotal < Number(coupon.minAmount)) {
      return { 
        error: `Order amount does not meet minimum requirement (${formatPrice(Number(coupon.minAmount))}) for this coupon` 
      };
    }

    // 计算折扣金额
    let discountAmount = 0;
    if (coupon.type === "PERCENTAGE") {
      discountAmount = (subtotal * Number(coupon.value)) / 100;
    } else {
      discountAmount = Number(coupon.value);
    }

    return { 
      success: true, 
      data: {
        id: coupon.id,
        code: coupon.code,
        type: coupon.type,
        value: Number(coupon.value),
        discountAmount
      }
    };
  } catch (error) {
    console.error("Error validating coupon:", error);
    return { error: "Failed to validate coupon" };
  }
}
