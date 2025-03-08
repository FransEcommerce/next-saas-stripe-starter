import { prisma } from "@/lib/db";

export async function checkPluginManagerDownloaded(userId: string) {
  const pluginManagerProductId = process.env.PLUGIN_MANAGER_PRODUCT_ID;
  if (!pluginManagerProductId) {
    throw new Error("PLUGIN_MANAGER_PRODUCT_ID is not defined in environment variables");
  }

  const order = await prisma.order.findFirst({
    where: {
      userId,
      productId: pluginManagerProductId,
      status: "COMPLETED",
    },
  });

  return !!order;
}

export async function getLatestPluginManagerVersion() {
  const projectId = process.env.NEXT_PUBLIC_PLUGIN_MANAGER_PROJECT_ID;
  if (!projectId) {
    throw new Error("NEXT_PUBLIC_PLUGIN_MANAGER_PROJECT_ID is not defined in environment variables");
  }

  const plugin = await prisma.plugin.findFirst({
    where: { 
      project_id: projectId,
      isLatest: true
    },
    select: {
      id: true,
      name: true,
      version: true,
      versionNumber: true,
      downloadUrl: true
    }
  });

  if (!plugin) {
    throw new Error("Plugin manager not found");
  }

  return plugin;
}

// 获取仪表盘统计数据
export async function getDashboardStats(userId: string) {
  // 获取平台上所有激活的产品数量
  const totalProducts = await prisma.product.count({
    where: { active: true }
  });
  
  // 获取用户已购买的产品数量（已完成订单）
  const userCompletedOrders = await prisma.order.count({
    where: { 
      userId,
      status: { in: ['COMPLETED', 'PAID'] }
    }
  });
  
  // 获取用户许可证数量和激活数量
  const licenses = await prisma.license.findMany({
    where: { userId }
  });
  
  const totalLicenses = licenses.length;
  const activeLicenses = licenses.filter(l => l.status === 'ACTIVE').length;
  
  // 获取用户订单数量和处理中的订单
  const orders = await prisma.order.findMany({
    where: { userId }
  });
  
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(
    o => o.status === 'PENDING' || o.status === 'PROCESSING'
  ).length;
  
  // 获取用户活跃订阅和相关服务
  const activeSubscriptions = await prisma.subscription.count({
    where: {
      userId,
      status: 'ACTIVE'
    }
  });
  
  // 获取所有活跃服务数量
  const activeServices = await prisma.service.count({
    where: { active: true }
  });
  
  // 获取用户订阅中包含的服务数量
  const userSubscriptions = await prisma.subscription.findMany({
    where: {
      userId,
      status: 'ACTIVE'
    },
    select: {
      planId: true
    }
  });
  
  // 获取用户订阅的计划IDs
  const planIds = userSubscriptions.map(sub => sub.planId);
  
  // 通过ServicePlanLimit表获取这些计划关联的服务ID
  const servicePlanLimits = await prisma.servicePlanLimit.findMany({
    where: {
      planId: { in: planIds }
    },
    select: {
      serviceId: true
    }
  });
  
  // 计算用户可访问的唯一服务数量
  const accessibleServiceIds = new Set(servicePlanLimits.map(limit => limit.serviceId));
  
  return {
    plugins: { total: totalProducts, owned: userCompletedOrders },
    licenses: { total: totalLicenses, active: activeLicenses },
    orders: { total: totalOrders, pending: pendingOrders },
    subscriptions: { 
      active: activeSubscriptions, 
      services: { total: activeServices, accessible: accessibleServiceIds.size }
    }
  };
}

// 获取用户服务使用统计数据
export async function getServiceUsageStats(userId: string) {
  // 获取最近90天的数据（包括今天）
  const today = new Date();
  today.setHours(23, 59, 59, 999); // 设置为今天的最后一刻
  
  const ninetyDaysAgo = new Date(today);
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 89); // 89天前 + 今天 = 90天
  ninetyDaysAgo.setHours(0, 0, 0, 0); // 设置为当天的开始
  
  // 获取用户的订阅
  const userSubscriptions = await prisma.subscription.findMany({
    where: {
      userId,
      status: 'ACTIVE'
    },
    select: {
      planId: true
    }
  });
  
  // 获取用户订阅的计划IDs
  const planIds = userSubscriptions.map(sub => sub.planId);
  
  // 通过ServicePlanLimit表获取这些计划关联的服务ID
  const servicePlanLimits = await prisma.servicePlanLimit.findMany({
    where: {
      planId: { in: planIds }
    },
    select: {
      serviceId: true
    }
  });
  
  // 获取用户可访问的唯一服务ID集合
  const accessibleServiceIds = [...new Set(servicePlanLimits.map(limit => limit.serviceId))];
  
  // 只获取用户可访问的服务
  const services = await prisma.service.findMany({
    where: {
      id: { in: accessibleServiceIds },
      active: true
    },
    select: {
      id: true,
      name: true,
      color: true
    }
  });
  
  // 获取用户的服务使用记录
  const serviceUsages = await prisma.serviceUsage.findMany({
    where: {
      userId,
      serviceId: { in: accessibleServiceIds },
      date: {
        gte: ninetyDaysAgo,
        lte: today
      }
    },
    include: {
      service: {
        select: {
          id: true,
          name: true,
          color: true
        }
      }
    },
    orderBy: {
      date: 'asc'
    }
  });
  
  // 创建过去90天的日期数组（包括今天）
  const dates: string[] = [];
  for (let i = 0; i < 90; i++) {
    const date = new Date(ninetyDaysAgo);
    date.setDate(date.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
  }
  
  // 初始化每天的数据
  const usageByDate: Record<string, { 
    date: string; 
    fb: number; 
    ig: number; 
    services: Record<string, number>;
  }> = {};
  
  // 为每一天创建初始数据结构
  dates.forEach(dateStr => {
    usageByDate[dateStr] = {
      date: dateStr,
      fb: 0,
      ig: 0,
      services: {}
    };
    
    // 为每个服务初始化使用量为0
    services.forEach(service => {
      usageByDate[dateStr].services[service.id] = 0;
    });
  });
  
  // 填充实际使用数据
  serviceUsages.forEach(usage => {
    const dateStr = usage.date.toISOString().split('T')[0];
    
    // 如果日期不在我们的范围内，跳过
    if (!usageByDate[dateStr]) return;
    
    // 按社交媒体类型分组
    const socialType = usage.socialMediaType || 'other';
    if (socialType === 'fb' || socialType === 'ig') {
      usageByDate[dateStr][socialType] += usage.count;
    }
    
    // 按服务ID分组
    const serviceId = usage.serviceId;
    if (!usageByDate[dateStr].services[serviceId]) {
      usageByDate[dateStr].services[serviceId] = 0;
    }
    usageByDate[dateStr].services[serviceId] += usage.count;
  });
  
  // 转换为数组并按日期排序
  const chartData = Object.values(usageByDate).sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  return {
    chartData,
    services: services.map(service => ({
      id: service.id,
      name: service.name || `Service ${service.id}`,
      color: service.color || '#1C9488'
    }))
  };
}