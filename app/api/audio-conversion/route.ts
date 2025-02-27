import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { AudioConversionService } from "@/app/services/handlers/audio-conversion";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { licenseKey, domain, audio_url, project_id } = body;

    // 验证请求参数
    if (!licenseKey || !domain || !audio_url || !project_id) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // 查找许可证和用户信息
    const license = await prisma.license.findUnique({
      where: { licenseKey },
      include: {
        plugin: true,
        user: {
          include: {
            subscriptions: {
              where: {
                status: "ACTIVE",
                OR: [
                  { endDate: null },
                  { endDate: { gt: new Date() } }
                ]
              },
              include: {
                plan: {
                  include: {
                    ServicePlanLimit: {
                      include: {
                        service: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
    });

    if (!license) {
      return NextResponse.json(
        { error: "Invalid license key" },
        { status: 404 }
      );
    }

    // 验证插件 project_id
    if (license.plugin.project_id !== project_id) {
      return NextResponse.json(
        { error: "Invalid project ID" },
        { status: 403 }
      );
    }

    // 验证域名
    if (license.domain !== domain) {
      return NextResponse.json(
        { error: "Domain does not match license" },
        { status: 403 }
      );
    }

    // 检查用户是否有有效的订阅
    const activeSubscriptions = license.user.subscriptions;
    if (activeSubscriptions.length === 0) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 403 }
      );
    }

    // 获取音频转换服务的限制
    const serviceLimits = activeSubscriptions
      .flatMap(sub => sub.plan.ServicePlanLimit)
      .filter(limit => limit.service.handlerId === "audio-conversion");

    if (serviceLimits.length === 0) {
      return NextResponse.json(
        { error: "Audio conversion service not included in plan" },
        { status: 403 }
      );
    }

    // 检查服务是否与插件关联
    const servicePlugin = await prisma.servicePlugin.findFirst({
      where: {
        serviceId: serviceLimits[0].serviceId,
        pluginId: license.pluginId
      }
    });

    if (!servicePlugin) {
      return NextResponse.json(
        { error: "Audio conversion service not available for this plugin" },
        { status: 403 }
      );
    }

    // 检查使用限制
    const limit = serviceLimits[0];
    if (limit.limitType !== "UNLIMITED") {
      const usage = await prisma.serviceUsage.findFirst({
        where: {
          userId: license.userId,
          serviceId: limit.serviceId,
          date: {
            gte: limit.limitType === "DAILY" ? new Date(new Date().setHours(0, 0, 0, 0)) : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      });

      if (usage && usage.count >= (limit.limitValue || 0)) {
        return NextResponse.json(
          { error: "Usage limit exceeded" },
          { status: 403 }
        );
      }
    }

    // 调用音频转换服务
    const audioService = new AudioConversionService();
    const result = await audioService.handle({ audioUrl: audio_url }, {});

    // 更新使用记录
    await prisma.serviceUsage.upsert({
      where: {
        userId_serviceId_date: {
          userId: license.userId,
          serviceId: limit.serviceId,
          date: limit.limitType === "DAILY" 
            ? new Date(new Date().setHours(0, 0, 0, 0)) 
            : new Date(new Date().getFullYear(), new Date().getMonth(), 1, 0, 0, 0, 0)
        }
      },
      update: {
        count: {
          increment: 1
        }
      },
      create: {
        userId: license.userId,
        serviceId: limit.serviceId,
        count: 1,
        date: limit.limitType === "DAILY" 
          ? new Date(new Date().setHours(0, 0, 0, 0)) 
          : new Date(new Date().getFullYear(), new Date().getMonth(), 1, 0, 0, 0, 0)
      }
    });

    // 更新订阅使用记录
    await prisma.subscriptionUsageRecord.create({
      data: {
        subscriptionId: activeSubscriptions[0].id,
        serviceId: limit.serviceId,
        quantity: 1
      }
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error("Audio conversion error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
