'use server'

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

interface CreateSubscriptionData {
  userId: string;
  planId: string;
  status: string;
  startDate: Date;
  endDate?: Date;
  quantity: number;
  priceAmount: number;
  currency: string;
  trialStartDate?: Date;
  trialEndDate?: Date;
}

export async function createSubscription(data: CreateSubscriptionData) {
  try {
    const plan = await prisma.plan.findUnique({
      where: { id: data.planId },
    });

    const subscription = await prisma.subscription.create({
      data: {
        userId: data.userId,
        planId: data.planId,
        status: data.status as any,
        startDate: data.startDate,
        endDate: data.endDate,
        quantity: data.quantity,
        priceAmount: Number(data.priceAmount),
        currency: data.currency,
        trialStartDate: data.trialStartDate,
        trialEndDate: data.trialEndDate,
        currentPeriodStart: plan?.isFree ? null : data.startDate, // 免费计划为 null
        currentPeriodEnd: plan?.isFree ? null : data.endDate || new Date(data.startDate.getTime() + 30 * 24 * 60 * 60 * 1000), // 免费计划为 null
        cancelAtPeriodEnd: false,
      },
    });

    revalidatePath('/admin/subscriptions');
    return { success: true, data: JSON.parse(JSON.stringify(subscription)) };
  } catch (error) {
    console.error('Failed to create subscription:', error);
    return { success: false, error: 'Failed to create subscription' };
  }
}

export async function updateSubscription(
  id: string,
  data: Partial<CreateSubscriptionData>
) {
  try {
    const updatedSubscription = await prisma.subscription.update({
      where: { id },
      data: Object.fromEntries(
        Object.entries({
          ...data,
          priceAmount: data.priceAmount ? Number(data.priceAmount) : undefined,
        }).filter(([_, value]) => value !== undefined)
      ),
    });

    revalidatePath('/admin/subscriptions');
    return { success: true, data: JSON.parse(JSON.stringify(updatedSubscription)) };
  } catch (error) {
    console.error('Failed to update subscription:', error);
    return { success: false, error: 'Failed to update subscription' };
  }
}

export async function deleteSubscription(id: string) {
  try {
    await prisma.subscription.delete({
      where: { id },
    });

    revalidatePath('/admin/subscriptions');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete subscription:', error);
    return { success: false, error: 'Failed to delete subscription' };
  }
}
