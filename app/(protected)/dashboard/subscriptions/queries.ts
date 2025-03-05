import { prisma } from "@/lib/db";
import type { PlanInterval, Subscription, SubscriptionStatus } from "./components/types";
import { getCurrentUser } from "@/lib/session"
import { startOfDay } from "date-fns";

export async function getUserSubscriptions(): Promise<Subscription[]> {
    const user = await getCurrentUser();
    const userId = user?.id;

    if (!userId) {
        return [];
    }

    const subscriptions = await prisma.subscription.findMany({
        where: { userId },
        include: {
            plan: {
                include: {
                    services: true,
                    ServicePlanLimit: {
                        include: {
                            service: true,
                        },
                    },
                },
            },
        },
    });

    const currentDate = new Date();
    const startOfCurrentDay = startOfDay(currentDate);

    const serviceUsages = await prisma.serviceUsage.findMany({
        where: { userId },
    });

    return subscriptions.map((subscription) => {
        const currentPeriodStart = subscription.currentPeriodStart;
        const currentPeriodEnd = subscription.currentPeriodEnd;

        return {
            id: subscription.id,
            status: subscription.status as SubscriptionStatus,
            startDate: subscription.startDate.toISOString(),
            endDate: subscription.endDate?.toISOString() ?? null,
            trialStartDate: subscription.trialStartDate?.toISOString(),
            trialEndDate: subscription.trialEndDate?.toISOString(),
            currentPeriodStart: currentPeriodStart ? currentPeriodStart.toISOString() : null,
            currentPeriodEnd: currentPeriodEnd ? currentPeriodEnd.toISOString() : null,
            cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
            quantity: subscription.quantity,
            priceAmount: parseFloat(subscription.priceAmount.toString()),
            currency: subscription.currency,
            plan: {
                id: subscription.plan.id,
                name: subscription.plan.name,
                description: subscription.plan.description ?? "",
                price: parseFloat(subscription.plan.price.toString()),
                interval: subscription.plan.interval as PlanInterval,
                features: subscription.plan.features as string[],
                services: subscription.plan.ServicePlanLimit.map((limit) => {
                    const currentUsage = serviceUsages
                    .filter((usage) => usage.serviceId === limit.service.id)
                    .reduce((acc, usage) => {
                        if (limit.limitType === "DAILY" && usage.date >= startOfCurrentDay) {
                            return acc + usage.count;
                        } else if (limit.limitType === "MONTHLY") {
                            // 如果 currentPeriodStart 和 currentPeriodEnd 为 null，则使用当前月的起始和结束日期
                            const startDate = currentPeriodStart ? new Date(currentPeriodStart) : new Date(new Date().setHours(0, 0, 0, 0));
                            startDate.setDate(1); // 设置为当前月的第一天
                            const endDate = currentPeriodEnd ? new Date(currentPeriodEnd) : new Date(new Date().setHours(23, 59, 59, 999));
                            endDate.setMonth(endDate.getMonth() + 1); // 设置为当前月的最后一天
                
                            // 确保 usage.date 在 startDate 和 endDate 之间
                            if (usage.date >= startDate && usage.date <= endDate) {
                                return acc + usage.count;
                            }
                        } else if (limit.limitType === "UNLIMITED") {
                            return acc + usage.count;
                        }
                        return acc;
                    }, 0);

                    return {
                        id: limit.service.id,
                        name: limit.service.name ?? "",
                        description: limit.service.description ?? "",
                        color: limit.service.color ?? "#1C9488",
                        limitType: limit.limitType as "UNLIMITED" | "DAILY" | "MONTHLY",
                        limitValue: limit.limitValue ?? null,
                        currentUsage,
                        serviceUsages,
                    };
                }),
            },
        };
    });
}