import { prisma } from "@/lib/db";
import { Service } from "@prisma/client";

export async function getServices() {
  const services = await prisma.service.findMany({
    include: {
      _count: {
        select: {
          ServiceUsage: true
        }
      },
      planLimits: {
        include: {
          plan: {
            select: {
              id: true,
              name: true,
              price: true,
              interval: true,
              isFree: true
            }
          }
        }
      },
      Plan: {
        select: {
          id: true,
          name: true,
          isFree: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  return services.map(service => ({
    ...service,
    usageCount: service._count.ServiceUsage
  }));
}

export async function getServiceById(id: string) {
  return prisma.service.findUnique({
    where: { id },
    include: {
      planLimits: {
        include: {
          plan: {
            select: {
              id: true,
              name: true,
              price: true,
              interval: true,
              isFree: true
            }
          }
        }
      },
      Plan: {
        select: {
          id: true,
          name: true,
          isFree: true
        }
      }
    }
  });
}

export async function getServiceUsage(serviceId: string, userId: string, period: "daily" | "monthly") {
  const now = new Date();
  const startDate = period === "daily" 
    ? new Date(now.getFullYear(), now.getMonth(), now.getDate())
    : new Date(now.getFullYear(), now.getMonth(), 1);

  return await prisma.serviceUsage.findMany({
    where: {
      serviceId,
      userId,
      date: {
        gte: startDate
      }
    },
    orderBy: {
      date: "desc"
    }
  });
}
