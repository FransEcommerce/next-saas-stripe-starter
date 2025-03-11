import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";

export async function checkUserAndProduct(productId: string) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // 检查用户是否已购买过该产品
  const existingOrder = await prisma.order.findFirst({
    where: {
      userId: user.id,
      productId: productId,
      status: "COMPLETED", // 假设已完成的订单表示成功购买
    },
  });

  if (existingOrder) {
    redirect("/dashboard/plugins");
  }

  return user;
}

export async function getProductById(productId: string) {
  const user = await checkUserAndProduct(productId);

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      plugin: true,
    },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  return {
    id: product.id,
    name: product.name,
    description: product.description || "",
    price: product.price.toNumber(),
    comparePrice: product.comparePrice?.toNumber(),
    duration: product.duration,
    features: Array.isArray(product.features) ? product.features.map(f => f ? f.toString() : "") : [],
    plugin: {
      id: product.plugin.id,
      name: product.plugin.name,
      description: product.plugin.description || "",
      version: product.plugin.version,
      avatar: product.plugin.avatar || "",
      cover: product.plugin.cover || "",
    },
    userBillingInfo: user ? {
      email: user.email || "",
      name: user.billingName || "",
      company: user.billingCompany || "",
      address: user.billingAddress || "",
      city: user.billingCity || "",
      state: user.billingState || "",
      zip: user.billingZip || "",
      country: user.billingCountry || "US",
      phone: user.billingPhone || "",
    } : null,
  };
}

export async function getOrderByNumber(orderNumber: string) {
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          plugin: {
            select: {
              id: true,
              name: true,
              version: true,
              avatar: true,
            }
          }
        }
      },
      license: true,
      coupon: {
        select: {
          id: true,
          code: true,
          type: true,
          value: true,
        }
      }
    }
  });

  if (!order) return null;

  // 转换 Decimal 为 number
  return {
    ...order,
    amount: order.amount?.toNumber() || 0,
    subtotal: order.subtotal?.toNumber() || 0,
    discountAmount: order.discountAmount?.toNumber() || 0,
    tax: order.tax?.toNumber() || 0,
    gatewayFee: order.gatewayFee?.toNumber() || 0,
    gatewayFeeCurrency: order.gatewayFeeCurrency || 'USD',
    affiliateCommission: order.affiliateCommission?.toNumber() || 0,
    coupon: order.coupon ? {
      ...order.coupon,
      value: order.coupon.value?.toNumber() || 0
    } : null
  };
}