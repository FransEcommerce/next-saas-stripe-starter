import { getCurrentUser } from "@/lib/session";
import { PluginManagerCard } from "./components/plugin-manager-card";
import { DashboardStatsGrid } from "./components/dashboard-stats-grid";
import { InteractiveBarChart } from "./components/service-stats-chart";
import { checkPluginManagerDownloaded, getDashboardStats, getLatestPluginManagerVersion, getServiceUsageStats } from "./queries";

export default async function Dashboard() {
  const user = await getCurrentUser();
  
  // 检查插件管理器是否已安装
  const isInstalled = user?.id ? await checkPluginManagerDownloaded(user.id) : false;
  
  // 获取最新版本
  const latestVersion = await getLatestPluginManagerVersion();
  
  // 获取仪表盘统计数据
  const stats = user?.id ? await getDashboardStats(user.id) : { 
    plugins: { total: 0, owned: 0 },
    licenses: { total: 0, active: 0 },
    orders: { total: 0, pending: 0 },
    subscriptions: { active: 0, services: { total: 0, accessible: 0 } }
  };
  
  // 获取服务使用统计数据
  const serviceUsageStats = user?.id ? await getServiceUsageStats(user.id) : {
    chartData: [],
    services: []
  };

  return (
    <div className="flex flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold md:text-2xl">Welcome back, {user?.name || 'User'}</h1>
        </div>
        {/* <pre>{JSON.stringify(stats, null, 2)}</pre> */}
        <PluginManagerCard 
          isInstalled={isInstalled} 
          userId={user?.id || ''} 
          initialVersion={latestVersion.version}
        />

        {/* Stats Grid */}
        <DashboardStatsGrid stats={stats} />

        {/* Usage Trends */}
        <div className="mt-4">
          <h2 className="mb-4 text-xl font-semibold">Service Usage Trends</h2>
          <InteractiveBarChart 
            data={serviceUsageStats.chartData} 
            services={serviceUsageStats.services}
          />
        </div>
      </main>
    </div>
  );
}
