"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

interface CreatePlanData {
  name: string;
  description?: string;
  price: number;
  interval: "MONTHLY" | "YEARLY";
  features?: any;
  active: boolean;
  isFree: boolean;
}

interface UpdatePlanData extends CreatePlanData {
  id: string;
}

async function checkFreePlanExists(excludeId?: string) {
  const freePlan = await prisma.plan.findFirst({
    where: {
      isFree: true,
      id: {
        not: excludeId,
      },
    },
  });
  return !!freePlan;
}

export async function createPlan(data: CreatePlanData) {
  try {
    if (data.isFree && await checkFreePlanExists()) {
      throw new Error("Only one free plan is allowed");
    }

    const plan = await prisma.plan.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        interval: data.interval,
        features: data.features,
        active: data.active,
        isFree: data.isFree,
      },
    });

    revalidatePath("/admin/plans");
    return plan;
  } catch (error) {
    console.error("Failed to create plan:", error);
    throw error;
  }
}

export async function updatePlan(data: UpdatePlanData) {
  try {
    if (data.isFree && await checkFreePlanExists(data.id)) {
      throw new Error("Only one free plan is allowed");
    }

    const plan = await prisma.plan.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        interval: data.interval,
        features: data.features,
        active: data.active,
        isFree: data.isFree,
      },
    });

    revalidatePath("/admin/plans");
    return plan;
  } catch (error) {
    console.error("Failed to update plan:", error);
    throw error;
  }
}

export async function deletePlan(id: string) {
  try {
    await prisma.plan.delete({
      where: {
        id,
      },
    });

    revalidatePath("/admin/plans");
  } catch (error) {
    console.error("Failed to delete plan:", error);
    throw error;
  }
}

export async function togglePlanStatus(id: string) {
  try {
    const plan = await prisma.plan.findUnique({
      where: { id },
      select: { active: true },
    });

    if (!plan) {
      throw new Error("Plan not found");
    }

    await prisma.plan.update({
      where: { id },
      data: { active: !plan.active },
    });

    revalidatePath("/admin/plans");
  } catch (error) {
    console.error("Failed to toggle plan status:", error);
    throw error;
  }
}
