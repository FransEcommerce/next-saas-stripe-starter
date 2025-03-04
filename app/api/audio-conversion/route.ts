import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { AudioConversionService } from "@/app/services/handlers/audio-conversion";

export async function POST(req: NextRequest) {
  async function logServiceError({
    userId,
    serviceId,
    pluginId,
    subscriptionId,
    planId,
    errorType,
    errorMessage,
    requestData,
  }: {
    userId?: string;
    serviceId?: string;
    pluginId?: string;
    subscriptionId?: string;
    planId?: string;
    errorType: string;
    errorMessage: string;
    requestData?: any;
  }) {
    await prisma.serviceErrorLog.create({
      data: {
        userId,
        serviceId,
        pluginId,
        subscriptionId,
        planId,
        errorType,
        errorMessage,
        requestData,
      },
    });
  }
  const body = await req.json();
  const { licenseKey, domain, audio_url, project_id, social_media_type } = body;
  const socialMediaType = body.social_media_type || 'fb';

  // 验证请求参数
  if (!licenseKey || !domain || !audio_url || !project_id || !social_media_type) {
    return NextResponse.json(
      { error: "Missing required parameters" },
      { status: 400 }
    );
  }

  // 查找许可证和用户信息，同时获取所有相关信息
  // 集中获取所有必要参数
const [license, audioConversionService] = await Promise.all([
  prisma.license.findUnique({
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
  }),
  prisma.service.findFirst({
    where: { handlerId: "audio-conversion" }
  })
]);

// 提前提取公共参数
const commonParams = {
  userId: license?.userId,
  pluginId: license?.pluginId,
  serviceId: audioConversionService?.id,
  subscriptionId: license?.user.subscriptions[0]?.id,
  planId: license?.user.subscriptions[0]?.planId
};

  // 如果找不到许可证，记录错误并返回
  if (!license) {
    await logServiceError({
      ...commonParams,
      errorType: "VALIDATION",
      errorMessage: "Invalid license key",
      requestData: { licenseKey, domain, audio_url, project_id, social_media_type }
    });
    return NextResponse.json(
      { error: "Invalid license key" },
      { status: 404 }
    );
  }

  // 获取活跃订阅信息
  const activeSubscriptions = license.user.subscriptions;
  const activeSubscription = activeSubscriptions[0];

  // 验证项目ID
  if (license.plugin.project_id !== project_id) {
    await logServiceError({
      ...commonParams,
      errorType: "VALIDATION",
      errorMessage: "Invalid project ID",
      requestData: { licenseKey, domain, audio_url, project_id, social_media_type }
    });
    return NextResponse.json(
      { error: "Invalid project ID" },
      { status: 403 }
    );
  }

  // 验证域名
  if (license.domain !== domain) {
    await logServiceError({
      ...commonParams,
      errorType: "VALIDATION",
      errorMessage: "Domain does not match license",
      requestData: { licenseKey, domain, audio_url, project_id, social_media_type }
    });
    return NextResponse.json(
      { error: "Domain does not match license" },
      { status: 403 }
    );
  }

  // 检查用户是否有有效的订阅
  if (activeSubscriptions.length === 0) {
    await logServiceError({
      ...commonParams,
      errorType: "VALIDATION",
      errorMessage: "No active subscription found",
      requestData: { licenseKey, domain, audio_url, project_id, social_media_type }
    });
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
    await logServiceError({
      ...commonParams,
      errorType: "VALIDATION",
      errorMessage: "Audio conversion service not included in plan",
      requestData: { licenseKey, domain, audio_url, project_id, social_media_type }
    });
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
    await logServiceError({
      ...commonParams,
      serviceId: serviceLimits[0].serviceId,
      errorType: "VALIDATION",
      errorMessage: "Audio conversion service not available for this plugin",
      requestData: { licenseKey, domain, audio_url, project_id, social_media_type }
    });
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
      await logServiceError({
        ...commonParams,
        serviceId: limit.serviceId,
        errorType: "USAGE_LIMIT",
        errorMessage: "Usage limit exceeded",
        requestData: { licenseKey, domain, audio_url, project_id, social_media_type }
      });
      return NextResponse.json(
        { error: "Usage limit exceeded" },
        { status: 403 }
      );
    }
  }
  try {
    // 调用音频转换服务
    const audioService = new AudioConversionService();
    const result = await audioService.handle({ audioUrl: audio_url }, {});

    // 更新使用记录
    await prisma.serviceUsage.upsert({
      where: {
        userId_serviceId_date_socialMediaType: {
          userId: license.userId,
          serviceId: limit.serviceId,
          date: new Date(new Date().toDateString()),
          socialMediaType: socialMediaType  // 传入的社交媒体类型
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
        date: new Date(new Date().toDateString()),
        socialMediaType: socialMediaType  // 传入的社交媒体类型
      }
    });

    // 更新订阅使用记录
    await prisma.subscriptionUsageRecord.upsert({
      where: {
        subscriptionId_serviceId_period_socialMediaType: {
          subscriptionId: activeSubscriptions[0].id,
          serviceId: limit.serviceId,
          period: new Date(new Date().toDateString()),
          socialMediaType: socialMediaType  // 传入的社交媒体类型
        }
      },
      update: {
        quantity: {
          increment: 1
        }
      },
      create: {
        subscriptionId: activeSubscriptions[0].id,
        serviceId: limit.serviceId,
        quantity: 1,
        period: new Date(new Date().toDateString()),
        socialMediaType: socialMediaType  // 传入的社交媒体类型
      }
    });

    return NextResponse.json(result);

  } catch (error) {
    await logServiceError({
      ...commonParams,
      serviceId: limit.serviceId,
      errorType: "SERVICE_ERROR",
      errorMessage: error.message || "Unknown error",
      requestData: { licenseKey, domain, audio_url, project_id, social_media_type }
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
