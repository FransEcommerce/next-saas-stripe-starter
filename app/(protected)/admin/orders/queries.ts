"use server";

import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { Prisma } from "@prisma/client";

function convertDecimalToNumber(decimal: Prisma.Decimal | null): number {
  if (decimal === null) return 0;
  return Number(decimal.toString());
}

export async function getUsers(search?: string) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      throw new Error("Unauthorized");
    }

    const where = search ? {
      OR: [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { billingName: { contains: search, mode: 'insensitive' } },
        { billingAddress: { contains: search, mode: 'insensitive' } },
        { billingCity: { contains: search, mode: 'insensitive' } },
        { billingState: { contains: search, mode: 'insensitive' } },
        { billingCountry: { contains: search, mode: 'insensitive' } },
        { billingZip: { contains: search, mode: 'insensitive' } },
        { billingPhone: { contains: search, mode: 'insensitive' } },
      ]
    } : {};

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        billingName: true,
        billingAddress: true,
        billingCity: true,
        billingState: true,
        billingCountry: true,
        billingZip: true,
        billingPhone: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

export async function getProducts() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      throw new Error("Unauthorized");
    }

    const products = await prisma.product.findMany({
      where: {
        active: true,
      },
      include: {
        plugin: {
          select: {
            id: true,
            name: true,
            version: true,
            avatar: true,
            description: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    // Convert Decimal values to numbers
    return products.map(product => ({
      ...product,
      price: convertDecimalToNumber(product.price),
      comparePrice: convertDecimalToNumber(product.comparePrice),
    }));
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
}

export async function getProductById(id: string) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      throw new Error("Unauthorized");
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        plugin: {
          select: {
            id: true,
            name: true,
            description: true,
            version: true,
            avatar: true,
          },
        },
      },
    });

    if (!product) return null;

    // Convert Decimal values to numbers
    return {
      ...product,
      price: convertDecimalToNumber(product.price),
      comparePrice: convertDecimalToNumber(product.comparePrice),
    };
  } catch (error) {
    console.error("Error fetching product by id:", error);
    throw error;
  }
}

export async function getOrder(orderId: string) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      throw new Error("Unauthorized");
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
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

    // Convert all Decimal values to numbers
    return {
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
  } catch (error) {
    console.error("Error fetching order:", error);
    throw error;
  }
}

export async function getOrders() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      throw new Error("Unauthorized");
    }

    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        product: {
          include: {
            plugin: {
              select: {
                name: true,
                version: true,
              },
            },
          },
        },
        license: {
          select: {
            id: true,
            licenseKey: true,
            status: true,
            activatedAt: true,
            expiresAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Convert all Decimal values to numbers
    return orders.map(order => ({
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
    }));
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
}

export async function getOrdersByProduct(productId: string) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      throw new Error("Unauthorized");
    }

    const orders = await prisma.order.findMany({
      where: {
        productId,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        license: {
          select: {
            licenseKey: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Convert all Decimal values to numbers
    return orders.map(order => ({
      ...order,
      amount: convertDecimalToNumber(order.amount),
      subtotal: convertDecimalToNumber(order.subtotal),
      discountAmount: convertDecimalToNumber(order.discountAmount),
      tax: convertDecimalToNumber(order.tax),
    }));
  } catch (error) {
    console.error("Error fetching orders by product:", error);
    throw error;
  }
}

export async function getOrdersByUser(userId: string) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      throw new Error("Unauthorized");
    }

    const orders = await prisma.order.findMany({
      where: {
        userId,
      },
      include: {
        product: {
          include: {
            plugin: true,
          },
        },
        license: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Convert all Decimal values to numbers
    return orders.map(order => ({
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
    }));
  } catch (error) {
    console.error("Error fetching orders by user:", error);
    throw error;
  }
}

export async function getCoupons() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      throw new Error("Unauthorized");
    }

    const coupons = await prisma.coupon.findMany({
      where: {
        active: true,
        OR: [
          {
            endDate: {
              gte: new Date(),
            },
          },
          {
            endDate: null,
          },
        ],
        AND: [
          {
            startDate: {
              lte: new Date(),
            },
          },
          {
            OR: [
              {
                maxUses: null,
              },
              {
                usedCount: {
                  lt: prisma.coupon.fields.maxUses,
                },
              },
            ],
          },
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Convert Decimal values to numbers
    return coupons.map(coupon => ({
      ...coupon,
      value: convertDecimalToNumber(coupon.value),
    }));
  } catch (error) {
    console.error("Error fetching coupons:", error);
    throw error;
  }
}

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
      // 确保百分比计算正确
      discountAmount = (amount * (value / 100));
    }

    // 确保折扣不超过订单金额
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

// 获取所有推荐人
export async function getAffiliates() {
  const affiliates = await prisma.affiliate.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        }
      }
    }
  });
  return affiliates;
}
