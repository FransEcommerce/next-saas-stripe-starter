"use server"

import { prisma } from "@/lib/db";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";

interface CreateAffiliateInput {
  userId: string;
  commissionType: 'FIXED' | 'PERCENTAGE';
  commissionValue: number;
  paymentMethod: {
    type: string;
    details: string;
  };
}

interface UpdateAffiliateInput {
  commissionType: 'FIXED' | 'PERCENTAGE';
  commissionValue: number;
  paymentMethod: {
    type: string;
    details: string;
  };
}

interface CreateAffiliatePaymentInput {
  affiliateId: string;
  methodId: string;
  amount: number;
  currency: string;
  note?: string;
  proofUrl?: string;
  orderIds: string[];
}

interface UpdatePaymentStatusInput {
  status: 'COMPLETED' | 'FAILED' | 'CANCELLED';
  proofUrl?: string;
}

export async function  createAffiliate(data: CreateAffiliateInput) {
  try {
    const affiliate = await prisma.affiliate.create({
      data: {
        userId: data.userId,
        commissionType: data.commissionType,
        commissionValue: data.commissionValue,
        referralCode: nanoid(8),
        paymentMethod: {
          create: {
            type: data.paymentMethod.type,
            details: data.paymentMethod.details,
            isDefault: true,
          }
        }
      },
      include: {
        user: true,
        paymentMethod: true,
      }
    });

    // 将 Decimal 类型转换为普通数字
    const serializedAffiliate = {
      ...affiliate,
      commissionValue: Number(affiliate.commissionValue),
      totalEarnings: affiliate.totalEarnings ? Number(affiliate.totalEarnings) : 0
    };

    revalidatePath('/admin/affiliates');
    return { success: true, data: serializedAffiliate };
  } catch (error) {
    console.error('Error creating affiliate:', error);
    return { success: false, error: 'Failed to create affiliate' };
  }
}

export async function updateAffiliate(id: string, data: UpdateAffiliateInput) {
  try {
    const affiliate = await prisma.affiliate.findUnique({
      where: { id },
      include: {
        paymentMethod: true
      }
    });

    if (!affiliate) {
      return { success: false, error: 'Affiliate not found' };
    }

    // 更新推广者信息
    const updatedAffiliate = await prisma.affiliate.update({
      where: { id },
      data: {
        commissionType: data.commissionType,
        commissionValue: data.commissionValue,
      },
      include: {
        user: true,
        paymentMethod: true,
      }
    });

    // 更新或创建支付方式
    if (affiliate.paymentMethod) {
      await prisma.affiliatePaymentMethod.update({
        where: { id: affiliate.paymentMethod.id },
        data: {
          type: data.paymentMethod.type,
          details: data.paymentMethod.details,
        },
      });
    } else {
      await prisma.affiliatePaymentMethod.create({
        data: {
          affiliateId: id,
          type: data.paymentMethod.type,
          details: data.paymentMethod.details,
          isDefault: true,
        },
      });
    }

    // 将 Decimal 类型转换为普通数字
    const serializedAffiliate = {
      ...updatedAffiliate,
      commissionValue: Number(updatedAffiliate.commissionValue),
      totalEarnings: updatedAffiliate.totalEarnings ? Number(updatedAffiliate.totalEarnings) : 0
    };

    revalidatePath('/admin/affiliates');
    return { success: true, data: serializedAffiliate };
  } catch (error) {
    console.error('Error updating affiliate:', error);
    return { success: false, error: 'Failed to update affiliate' };
  }
}

export async function deleteAffiliate(id: string) {
  try {
    // 使用事务确保数据一致性
    await prisma.$transaction(async (tx) => {
      // 1. 获取所有相关的支付记录ID
      const payments = await tx.affiliatePayment.findMany({
        where: { affiliateId: id },
        select: { id: true }
      });
      const paymentIds = payments.map(p => p.id);

      // 2. 解除订单与支付记录的关联
      await tx.order.updateMany({
        where: { 
          affiliatePaymentId: {
            in: paymentIds
          }
        },
        data: { 
          affiliatePaymentId: null
        }
      });

      // 3. 现在可以安全地删除支付记录
      await tx.affiliatePayment.deleteMany({
        where: { affiliateId: id }
      });

      // 4. 删除支付方法
      await tx.affiliatePaymentMethod.deleteMany({
        where: { affiliateId: id }
      });

      // 5. 更新所有关联的订单
      await tx.order.updateMany({
        where: { affiliateId: id },
        data: { 
          affiliateId: null,
          affiliateCommission: null 
        }
      });

      // 6. 最后删除推广者记录
      await tx.affiliate.delete({
        where: { id }
      });
    });

    revalidatePath("/admin/affiliates");
    return { success: true };
  } catch (error) {
    console.error("Error deleting affiliate:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to delete affiliate and related data" };
  }
}

export async function createAffiliatePayment(data: CreateAffiliatePaymentInput) {
  try {
    const payment = await prisma.affiliatePayment.create({
      data: {
        affiliateId: data.affiliateId,
        methodId: data.methodId,
        amount: data.amount,
        currency: data.currency,
        note: data.note,
        proofUrl: data.proofUrl,
        status: 'PROCESSING',
        orders: {
          connect: data.orderIds.map(id => ({ id }))
        }
      },
      include: {
        affiliate: {
          include: {
            user: true
          }
        },
        orders: true
      }
    });

    // 更新订单的支付状态
    await prisma.order.updateMany({
      where: {
        id: {
          in: data.orderIds
        }
      },
      data: {
        affiliatePaymentId: payment.id
      }
    });

    // 序列化 Decimal 类型数据
    const serializedPayment = {
      ...payment,
      amount: Number(payment.amount),
      affiliate: {
        ...payment.affiliate,
        commissionValue: Number(payment.affiliate.commissionValue),
        totalEarnings: payment.affiliate.totalEarnings ? Number(payment.affiliate.totalEarnings) : 0
      },
      orders: payment.orders.map(order => ({
        ...order,
        amount: Number(order.amount),
        subtotal: Number(order.subtotal),
        discountAmount: Number(order.discountAmount),
        tax: Number(order.tax),
        affiliateCommission: Number(order.affiliateCommission)
      }))
    };

    revalidatePath('/admin/affiliates/payments');
    return { success: true, data: serializedPayment };
  } catch (error) {
    console.error('Error creating affiliate payment:', error);
    return { success: false, error: 'Failed to create affiliate payment' };
  }
}

export async function updatePaymentStatus(id: string, data: UpdatePaymentStatusInput) {
  try {
    const payment = await prisma.affiliatePayment.update({
      where: { id },
      data: {
        status: data.status,
        proofUrl: data.proofUrl,
        processedAt: new Date(),
      },
      include: {
        affiliate: {
          include: {
            user: true
          }
        },
        orders: true
      }
    });

    // 序列化 Decimal 类型数据
    const serializedPayment = {
      ...payment,
      amount: Number(payment.amount),
      affiliate: {
        ...payment.affiliate,
        commissionValue: Number(payment.affiliate.commissionValue),
        totalEarnings: payment.affiliate.totalEarnings ? Number(payment.affiliate.totalEarnings) : 0
      },
      orders: payment.orders.map(order => ({
        ...order,
        amount: Number(order.amount),
        subtotal: Number(order.subtotal),
        discountAmount: Number(order.discountAmount),
        tax: Number(order.tax),
        affiliateCommission: Number(order.affiliateCommission)
      }))
    };

    revalidatePath('/admin/affiliates/payments');
    return { success: true, data: serializedPayment };
  } catch (error) {
    console.error('Error updating payment status:', error);
    return { success: false, error: 'Failed to update payment status' };
  }
}
