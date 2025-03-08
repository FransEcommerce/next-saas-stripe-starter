'use server'

import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"
import { generateOrderNumber } from "@/lib/order";
import { redirect } from "next/navigation"
import { OrderStatus } from "@prisma/client"
import { PaymentGatewayService } from "@/lib/payment-gateways/payment-gateway-service"

interface CheckoutInput {
  productId: string
  couponCode?: string
  paymentMethod: string
  paymentProof?: string
  paymentNote?: string
  billingInfo: {
    name: string
    email: string
    company?: string
    address: string
    city: string
    state: string
    zip: string
    country: string
    phone: string
  }
  razorpayPaymentId?: string
  razorpayOrderId?: string
  razorpaySignature?: string
  paypalOrderId?: string
  paypalPaymentId?: string
  status?: OrderStatus
}

export async function createCheckoutOrder(data: CheckoutInput) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      throw new Error("Unauthorized")
    }

    const product = await prisma.product.findUnique({
      where: { id: data.productId },
      include: { plugin: true },
    })

    if (!product) {
      throw new Error("Product not found")
    }

    // 处理优惠券
    let coupon
    let discountAmount = 0
    let affiliateId: string | null = null
    let affiliateCommission: number | null = null

    if (data.couponCode) {
      coupon = await prisma.coupon.findFirst({
        where: { code: data.couponCode },
        include: { affiliate: true },
      })

      if (coupon) {
        // 计算折扣金额
        discountAmount = coupon.type === "FIXED" 
          ? Number(coupon.value)
          : (Number(product.price) * Number(coupon.value)) / 100

        // 如果优惠券关联了推荐人，计算佣金
        if (coupon.affiliate) {
          affiliateId = coupon.affiliate.id
          // 确保佣金计算结果可以为 null
          const calculatedCommission = coupon.affiliate.commissionType === "FIXED"
            ? Number(coupon.affiliate.commissionValue)
            : (Number(product.price) * Number(coupon.affiliate.commissionValue)) / 100
          
          affiliateCommission = calculatedCommission || null
        }
      }
    }

    // 计算订单金额
    const subtotal = Number(product.price)
    const total = subtotal - discountAmount

    // 根据支付方式进行验证
    let paymentStatus: OrderStatus = "PENDING";
    let gatewayFee: number | null = null;
    let gatewayFeeCurrency: string | null = null;
    
    if (data.paymentMethod === 'razorpay') {
      if (!data.razorpayPaymentId || !data.razorpayOrderId || !data.razorpaySignature) {
        throw new Error("Missing Razorpay payment verification data");
      }
      
      // 使用支付网关服务验证Razorpay支付
      const verifyResult = await PaymentGatewayService.verifyPayment('razorpay', {
        orderId: data.razorpayOrderId,
        paymentId: data.razorpayPaymentId,
        signature: data.razorpaySignature
      });
      
      if (!verifyResult.verified) {
        throw new Error(verifyResult.error || "Payment verification failed");
      }
      
      paymentStatus = "COMPLETED";
      
      // 保存支付网关手续费和货币
      if (verifyResult.gatewayFee !== undefined) {
        gatewayFee = verifyResult.gatewayFee;
      }
      if (verifyResult.gatewayFeeCurrency !== undefined) {
        gatewayFeeCurrency = verifyResult.gatewayFeeCurrency;
      }
    } else if (data.paymentMethod === 'paypal') {
      if (!data.paypalOrderId || !data.paypalPaymentId) {
        throw new Error("Missing PayPal payment verification data");
      }
      
      // 使用支付网关服务验证PayPal支付
      const verifyResult = await PaymentGatewayService.verifyPayment('paypal', {
        orderId: data.paypalOrderId,
        paymentId: data.paypalPaymentId
      });
      
      if (!verifyResult.verified) {
        throw new Error(verifyResult.error || "PayPal payment verification failed");
      }
      
      paymentStatus = "COMPLETED";
      
      // 保存支付网关手续费和货币
      if (verifyResult.gatewayFee !== undefined) {
        gatewayFee = verifyResult.gatewayFee;
      }
      if (verifyResult.gatewayFeeCurrency !== undefined) {
        gatewayFeeCurrency = verifyResult.gatewayFeeCurrency;
      }
    } else if (data.paymentMethod === 'manual-transfer') {
      if (!data.paymentProof) {
        throw new Error("Payment proof is required for manual transfer");
      }
      
      paymentStatus = "PENDING";
    }

    // 创建订单
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId: user.id,
          productId: product.id,
          couponId: coupon?.id,
          amount: total,
          subtotal,
          discountAmount,
          status: data.status || paymentStatus,
          paymentMethod: data.paymentMethod,
          paymentNote: data.paymentNote,
          paymentProof: data.paymentProof,
          billingName: data.billingInfo.name,
          billingEmail: data.billingInfo.email,
          billingCompany: data.billingInfo.company,
          billingAddress: data.billingInfo.address,
          billingCity: data.billingInfo.city,
          billingState: data.billingInfo.state,
          billingCountry: data.billingInfo.country,
          billingZip: data.billingInfo.zip,
          billingPhone: data.billingInfo.phone,
          affiliateId,
          affiliateCommission,
          razorpayPaymentId: data.razorpayPaymentId,
          razorpayOrderId: data.razorpayOrderId,
          razorpaySignature: data.razorpaySignature,
          paypalOrderId: data.paypalOrderId,
          paypalPaymentId: data.paypalPaymentId,
          gatewayFee: gatewayFee,
          gatewayFeeCurrency: gatewayFeeCurrency,
        },
      })

      if (newOrder.status === "COMPLETED" && coupon) {
        await tx.coupon.update({
          where: { id: coupon.id },
          data: { usedCount: { increment: 1 } },
        })
      }

      if (newOrder.status === "COMPLETED" && affiliateId && affiliateCommission) {
        await tx.affiliate.update({
          where: { id: affiliateId },
          data: {
            totalEarnings: {
              increment: affiliateCommission,
            },
          },
        })
      }

      if (newOrder.status === "COMPLETED" && product.plugin) {
        await tx.license.create({
          data: {
            licenseKey: generateLicenseKey(),
            pluginId: product.plugin.id,
            userId: user.id,
            status: "PENDING",
            expiresAt: product.duration
              ? new Date(Date.now() + product.duration * 24 * 60 * 60 * 1000)
              : null,
            orderId: newOrder.id,
          },
        })
      }

      return newOrder
    })

    return { success: true, orderNumber: order.orderNumber }
  } catch (error) {
    console.error("Checkout error:", error)
    return { success: false, error: error.message || "Failed to process checkout" }
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

// 添加生成许可证密钥的函数
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