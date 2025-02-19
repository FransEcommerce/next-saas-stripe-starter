import { prisma } from "@/lib/db";

export async function getAffiliates() {
  return await prisma.affiliate.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        }
      },
      paymentMethod: {
        select: {
          id: true,
          type: true,
          details: true,
        }
      },
      _count: {
        select: {
          referredOrders: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
}

export async function getUsers() {
  return await prisma.user.findMany({
    where: {
      affiliate: null
    },
    select: {
      id: true,
      name: true,
      email: true,
    }
  });
}

export async function getPendingPayments() {
  return await prisma.order.findMany({
    where: {
      status: 'COMPLETED',
      affiliateId: { not: null },
      affiliatePaymentId: null,
    },
    include: {
      affiliate: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
            }
          },
          paymentMethod: true,
        }
      },
      product: {
        select: {
          name: true,
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
}

export async function getAffiliatePayments() {
  return await prisma.affiliatePayment.findMany({
    include: {
      affiliate: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
            }
          }
        }
      },
      method: true,
      orders: {
        select: {
          orderNumber: true,
          amount: true,
          affiliateCommission: true,
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
}

export async function getAffiliateStats(affiliateId: string) {
  const affiliate = await prisma.affiliate.findUnique({
    where: { id: affiliateId },
    select: {
      totalEarnings: true,
    },
  });

  const [pendingCommissions, paidCommissions] = await Promise.all([
    // 待支付佣金（订单已完成但未支付的佣金）
    prisma.order.aggregate({
      where: {
        affiliateId,
        status: "COMPLETED",
        affiliatePaymentId: null,
      },
      _sum: {
        affiliateCommission: true,
      },
    }),

    // 已支付佣金（已处理的支付）
    prisma.affiliatePayment.aggregate({
      where: {
        affiliateId,
        status: "COMPLETED",
      },
      _sum: {
        amount: true,
      },
    }),
  ]);

  const pendingAmount = pendingCommissions._sum.affiliateCommission || 0;
  const paidAmount = paidCommissions._sum.amount || 0;

  return {
    pendingAmount,
    paidAmount,
    totalAmount: affiliate?.totalEarnings || 0,
    currency: "USD",
  };
}

export async function getAffiliateById(id: string) {
  return await prisma.affiliate.findUnique({
    where: { id },
    include: {
      user: true,
      paymentMethod: true,
    },
  });
}
