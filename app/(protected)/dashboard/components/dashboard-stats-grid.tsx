import { PluginsStatCard } from "./plugins-stat-card";
import { LicensesStatCard } from "./licenses-stat-card";
import { OrdersStatCard } from "./orders-stat-card";
import { SubscriptionsStatCard } from "./subscriptions-stat-card";

interface DashboardStatsGridProps {
  stats: {
    plugins: { total: number; owned: number };
    licenses: { total: number; active: number };
    orders: { total: number; pending: number };
    subscriptions: { 
      active: number; 
      services: { total: number; accessible: number } 
    };
  };
}

export function DashboardStatsGrid({ stats }: DashboardStatsGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <PluginsStatCard 
        totalPlugins={stats.plugins.total} 
        ownedPlugins={stats.plugins.owned} 
      />
      <LicensesStatCard 
        totalLicenses={stats.licenses.total} 
        activeLicenses={stats.licenses.active} 
      />
      <OrdersStatCard 
        totalOrders={stats.orders.total} 
        pendingOrders={stats.orders.pending} 
      />
      <SubscriptionsStatCard 
        activeSubscriptions={stats.subscriptions.active}
        totalServices={stats.subscriptions.services.total}
        accessibleServices={stats.subscriptions.services.accessible}
      />
    </div>
  );
}
