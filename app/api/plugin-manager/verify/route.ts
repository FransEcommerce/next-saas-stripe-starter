import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { LicenseStatus, Plugin } from "@prisma/client";
import { compareVersions } from "@/lib/utils";

// 插件管理器的固定 project_id
const PLUGIN_MANAGER_PROJECT_ID = "250222024";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { licenseKey, domain, chatpionVersion, project_id } = body;

    // 验证请求参数
    if (!licenseKey || !domain || !chatpionVersion || !project_id) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // 验证是否是插件管理器
    if (project_id !== PLUGIN_MANAGER_PROJECT_ID) {
      return NextResponse.json(
        { error: "Invalid plugin manager" },
        { status: 403 }
      );
    }

    // 查找许可证和用户信息
    const license = await prisma.license.findUnique({
      where: { licenseKey },
      include: {
        plugin: {
          select: {
            id: true,
            name: true,
            project_id: true,
            chatpionVersion: true,
            parentId: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    if (!license) {
      return NextResponse.json(
        { error: "Invalid license key" },
        { status: 404 }
      );
    }

    // 验证许可证是否属于插件管理器
    if (license.plugin.project_id !== PLUGIN_MANAGER_PROJECT_ID) {
      return NextResponse.json(
        { error: "Invalid plugin manager license" },
        { status: 403 }
      );
    }

    // 验证域名
    if (license.domain !== domain) {
      return NextResponse.json(
        { error: "Domain mismatch" },
        { status: 403 }
      );
    }

    // 获取插件管理器的所有版本
    const allVersions = await prisma.plugin.findMany({
      where: {
        project_id: PLUGIN_MANAGER_PROJECT_ID,
      },
      orderBy: [
        { versionNumber: 'desc' }
      ],
    });

    // 找到适配的最新版本
    let compatibleVersion: Plugin | undefined;
    for (const version of allVersions) {
      if (compareVersions(version.chatpionVersion || '0.0.0', chatpionVersion) <= 0) {
        compatibleVersion = version;
        break;
      }
    }

    if (!compatibleVersion) {
      return NextResponse.json(
        { error: "No compatible version found for your platform" },
        { status: 400 }
      );
    }

    // 获取用户购买的插件
    const purchasedPlugins = await prisma.license.findMany({
      where: {
        userId: license.user.id,
        plugin: {
          project_id: {
            not: PLUGIN_MANAGER_PROJECT_ID
          }
        }
      },
      include: {
        plugin: {
          select: {
            id: true,
            name: true,
            description: true,
            project_id: true,
            uiFields: true,
            avatar: true,
          },
        },
      },
    });

    // 获取每个插件的最新兼容版本
    const pluginsWithVersions = await Promise.all(
      purchasedPlugins.map(async (license) => {
        // 获取该插件的所有版本
        const pluginVersions = await prisma.plugin.findMany({
          where: {
            project_id: license.plugin.project_id,
          },
          orderBy: [
            { versionNumber: 'desc' }
          ],
        });

        // 找到兼容的最新版本
        let compatiblePluginVersion: Plugin | undefined;
        for (const version of pluginVersions) {
          if (compareVersions(version.chatpionVersion || '0.0.0', chatpionVersion) <= 0) {
            compatiblePluginVersion = version;
            break;
          }
        }

        return {
          ...license,
          compatibleVersion: compatiblePluginVersion
        };
      })
    );

    // 获取用户已购买的插件ID列表
    const purchasedPluginIds = pluginsWithVersions.map(l => l.plugin.id);

    // 获取未购买的产品
    const notPurchasedProducts = await prisma.product.findMany({
      where: {
        active: true,
        plugin: {
          AND: [
            {
              NOT: {
                id: {
                  in: purchasedPluginIds
                }
              }
            },
            {
              project_id: {
                not: PLUGIN_MANAGER_PROJECT_ID
              }
            }
          ]
        }
      },
      select: {
        name: true,
        description: true,
        price: true,
        comparePrice: true,
        features: true,
        plugin: {
          select: {
            avatar: true,
          }
        }
      },
    });

    // 获取所有活跃的服务
    const activeServices = await prisma.service.findMany({
      where: {
        active: true
      },
      select: {
        id: true,
        name: true,
        color: true
      }
    });

    // 获取最近14天的日期范围
    const today = new Date();
    const fourteenDaysAgo = new Date(today);
    fourteenDaysAgo.setDate(today.getDate() - 13); // 设为13是因为要包含今天

    // 获取每个服务的使用统计
    const servicesWithStats = await Promise.all(
      activeServices.map(async (service) => {
        // 获取总使用量
        const totalUsage = await prisma.serviceUsage.aggregate({
          where: {
            serviceId: service.id,
            userId: license.user.id
          },
          _sum: {
            count: true
          }
        });

        // 获取本月使用量
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthUsage = await prisma.serviceUsage.aggregate({
          where: {
            serviceId: service.id,
            userId: license.user.id,
            date: {
              gte: firstDayOfMonth
            }
          },
          _sum: {
            count: true
          }
        });

        // 获取最近14天的每日使用量
        const dailyUsage = await prisma.serviceUsage.groupBy({
          by: ['date'],
          where: {
            serviceId: service.id,
            userId: license.user.id,
            date: {
              gte: fourteenDaysAgo,
              lte: today
            }
          },
          _sum: {
            count: true
          }
        });

        // 生成最近14天的日期数组
        const dailyUsageData = Array.from({ length: 14 }, (_, i) => {
          const date = new Date(fourteenDaysAgo);
          date.setDate(date.getDate() + i);
          const dateStr = date.toISOString().split('T')[0];
          
          const usage = dailyUsage.find(u => 
            u.date.toISOString().split('T')[0] === dateStr
          );

          return {
            date: dateStr,
            count: usage ? usage._sum.count || 0 : 0
          };
        });

        return {
          serviceName: service.name || 'Unnamed Service',
          color: service.color || '#1C9488',
          date: today.toISOString().split('T')[0],
          totalCount: totalUsage._sum.count || 0,
          monthCount: monthUsage._sum.count || 0,
          dailyUsage: dailyUsageData
        };
      })
    );

    // 构建响应数据
    const response = {
      success: true,
      data: {
        user: {
          name: license.user.name,
          email: license.user.email,
          image: license.user.image,
        },
        pluginManager: {
          latestVersion: compatibleVersion.version,
          chatpionVersion: compatibleVersion.chatpionVersion,
          changelogUrl: `https://your-domain.com/plugins/${PLUGIN_MANAGER_PROJECT_ID}/changelog`,
        },
        service: servicesWithStats,
        purchasedPlugin: [{
          pluginsList: pluginsWithVersions.map(license => ({
            projectId: license.plugin.project_id,
            name: license.plugin.name,
            description: license.plugin.description,
            avatar: license.plugin.avatar || `https://your-domain.com/plugins/${license.plugin.project_id}/image`,
            latestVersion: license.compatibleVersion?.version || '0.0.0',
            license: license.status.toLowerCase(),
            changelogUrl: `https://example.com/plugins/${license.plugin.project_id}/changelog`,
            uiFields: license.plugin.uiFields,
          }))
        }],
        notPurchasedPlugin: [{
          pluginsList: notPurchasedProducts.map(product => ({
            name: product.name,
            description: product.description,
            price: product.comparePrice?.toString(),
            discountPrice: product.price.toString(),
            avatar: product.plugin.avatar || `https://your-domain.com/products/${product.name}/image`,
            features: product.features,
          }))
        }],
      }
    };

    // 如果是首次激活，更新许可证状态
    if (license.status === LicenseStatus.PENDING) {
      await prisma.license.update({
        where: { id: license.id },
        data: {
          status: LicenseStatus.ACTIVE,
          domain,
          activatedAt: new Date(),
        },
      });
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error("Plugin manager verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
