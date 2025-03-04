import { prisma } from "@/lib/db";
import { Plan, Prisma } from "@prisma/client";

// 定义序列化后的 Plan 类型
export type SerializedPlan = Omit<Plan, 'price' | 'createdAt' | 'updatedAt'> & {
  price: number;
  createdAt: string;
  updatedAt: string;
  userCount: number;
};

// 处理 Decimal 类型的工具函数
const serializePlan = async (plan: Plan): Promise<SerializedPlan> => {
  // 获取使用此计划的用户数量
  const userCount = await prisma.user.count({
    where: {
      subscriptions: {
        some: {
          planId: plan.id, // 通过 subscriptions.planId 查询
        },
      },
    },
  });

  return {
    ...plan,
    price: plan.price.toNumber(),
    createdAt: plan.createdAt.toISOString(),
    updatedAt: plan.updatedAt.toISOString(),
    userCount,
  };
};

export async function getPlans(): Promise<SerializedPlan[]> {
  const plans = await prisma.plan.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
  return Promise.all(plans.map(serializePlan));
}

export async function getPlanById(id: string): Promise<SerializedPlan | null> {
  const plan = await prisma.plan.findUnique({
    where: {
      id,
    },
  });
  return plan ? serializePlan(plan) : null;
}

export async function getPlansByIds(ids: string[]): Promise<SerializedPlan[]> {
  const plans = await prisma.plan.findMany({
    where: {
      id: {
        in: ids,
      },
    },
  });
  return Promise.all(plans.map(serializePlan));
}

export async function getActivePlans(): Promise<SerializedPlan[]> {
  const plans = await prisma.plan.findMany({
    where: {
      active: true,
    },
    orderBy: {
      price: "asc",
    },
  });
  return Promise.all(plans.map(serializePlan));
}
