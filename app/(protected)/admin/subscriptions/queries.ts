import { prisma } from "@/lib/db";

export async function getSubscriptions() {
  const subscriptions = await prisma.subscription.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      plan: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return JSON.parse(JSON.stringify(subscriptions), (key, value) => {
    if ((key === 'startDate' || key === 'endDate' || key === 'trialStartDate' || key === 'trialEndDate' || key === 'createdAt' || key === 'updatedAt') && value !== null && value !== undefined) {
      return new Date(value);
    }
    return value;
  });
}

export async function getSubscriptionById(id: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      plan: true,
    },
  });

  if (!subscription) return null;

  return JSON.parse(JSON.stringify(subscription), (key, value) => {
    if ((key === 'startDate' || key === 'endDate' || key === 'trialStartDate' || key === 'trialEndDate' || key === 'createdAt' || key === 'updatedAt') && value !== null && value !== undefined) {
      return new Date(value);
    }
    return value;
  });
}

export async function getPlans() {
  const plans = await prisma.plan.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });

  return JSON.parse(JSON.stringify(plans), (key, value) => {
    if ((key === 'createdAt' || key === 'updatedAt') && value !== null && value !== undefined) {
      return new Date(value);
    }
    return value;
  });
}

export async function getUsers() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
    },
    orderBy: {
      createdAt: 'desc',  
    },
  });

  return JSON.parse(JSON.stringify(users), (key, value) => {
    if ((key === 'createdAt' || key === 'updatedAt') && value !== null && value !== undefined) {
      return new Date(value);
    }
    return value;
  });
}
