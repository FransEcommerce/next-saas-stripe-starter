"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getHandler } from "@/app/services/registry";
import { toast } from "sonner";

interface PlanLimit {
  planId: string;
  limitType: "UNLIMITED" | "DAILY" | "MONTHLY";
  limitValue: number | null;
}

interface ServiceFormData {
  name: string;
  description?: string;
  handlerId: string;
  config?: any;
  active: boolean;
  color: string;
  planLimits: PlanLimit[];
  pluginIds?: string[];
}

export async function createService(data: ServiceFormData) {
  try {
    // 验证服务处理器
    const handler = await getHandler(data.handlerId);
    if (!handler) {
      throw new Error("Invalid service handler");
    }

    // 创建服务及其计划限制
    const service = await prisma.service.create({
      data: {
        name: data.name,
        description: data.description,
        handlerId: data.handlerId,
        config: data.config || {},
        active: data.active,
        color: data.color,
        plugins: {
          create: (data.pluginIds || []).map(pluginId => ({
            pluginId
          }))
        },
        planLimits: {
          create: data.planLimits.map(limit => ({
            planId: limit.planId,
            limitType: limit.limitType,
            limitValue: limit.limitType === "UNLIMITED" ? null : limit.limitValue
          }))
        }
      },
      include: {
        planLimits: {
          include: {
            plan: true
          }
        },
        plugins: true
      }
    });

    revalidatePath("/admin/services");
    return { success: true, message: "Service created successfully" };
  } catch (error) {
    console.error("Failed to create service:", error);
    return { success: false, message: "Failed to create service" };
  }
}

export async function updateService(id: string, data: ServiceFormData) {
  try {
    // 验证服务处理器
    const handler = await getHandler(data.handlerId);
    if (!handler) {
      throw new Error("Invalid service handler");
    }

    // 更新服务
    const service = await prisma.$transaction(async (tx) => {
      // 删除现有的计划限制
      await tx.servicePlanLimit.deleteMany({
        where: { serviceId: id }
      });

      // 删除现有的插件关联
      await tx.servicePlugin.deleteMany({
        where: { serviceId: id }
      });

      // 更新服务并创建新的计划限制和插件关联
      return await tx.service.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description,
          handlerId: data.handlerId,
          config: data.config || {},
          active: data.active,
          color: data.color,
          plugins: {
            deleteMany: {},
            create: (data.pluginIds || []).map(pluginId => ({
              pluginId
            }))
          },
          planLimits: {
            create: data.planLimits.map(limit => ({
              planId: limit.planId,
              limitType: limit.limitType,
              limitValue: limit.limitType === "UNLIMITED" ? null : limit.limitValue
            }))
          }
        },
        include: {
          planLimits: {
            include: {
              plan: true
            }
          },
          plugins: true
        }
      });
    });

    revalidatePath("/admin/services");
    return { success: true, message: "Service updated successfully" };
  } catch (error) {
    console.error("Failed to update service:", error);
    return { success: false, message: "Failed to update service" };
  }
}

export async function deleteService(id: string) {
  try {
    await prisma.servicePlanLimit.deleteMany({
      where: { serviceId: id }
    });

    await prisma.servicePlugin.deleteMany({
      where: { serviceId: id }
    });

    await prisma.service.delete({
      where: { id }
    });

    revalidatePath("/admin/services");
    return { success: true, message: "Service deleted successfully" };
  } catch (error) {
    console.error("Failed to delete service:", error);
    return { success: false, message: "Failed to delete service" };
  }
}
