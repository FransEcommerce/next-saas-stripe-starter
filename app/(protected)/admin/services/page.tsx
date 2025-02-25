import { getServices, getPlugins } from "./queries";
import { ServiceList } from "./components/service-list";
import { getAvailableServices } from "@/app/services/registry";
import { prisma } from "@/lib/db";
import { AddServiceButton } from "./components/add-service-button";
import { DashboardHeader } from "@/components/dashboard/header";

export default async function ServicesPage() {
  // 确保等待所有服务加载完成
  const [services, availableServices, plans, plugins] = await Promise.all([
    getServices(),
    getAvailableServices(),
    prisma.plan.findMany({
      select: {
        id: true,
        name: true
      },
      where: {
        active: true
      }
    }),
    getPlugins()
  ]);

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between">
        <DashboardHeader
          heading="Services"
          text="Manage your services here."
        />
        <AddServiceButton
          availableServices={availableServices}
          availablePlans={plans}
          plugins={plugins}
        />
      </div>
      <ServiceList
        services={services}
        availableServices={availableServices}
        availablePlans={plans}
        plugins={plugins}
      />
    </div>
  );
}
