import { getServices } from "./queries";
import { ServiceList } from "./components/service-list";
import { getAvailableServices } from "@/app/services/registry";
import { prisma } from "@/lib/db";
import { AddServiceButton } from "./components/add-service-button";
import { DashboardHeader } from "@/components/dashboard/header";

export default async function ServicesPage() {
  // 确保等待所有服务加载完成
  const [services, availableServices, plans] = await Promise.all([
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
    })
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
        />
      </div>
      <ServiceList
        services={services}
        availableServices={availableServices}
        availablePlans={plans}
      />
    </div>
  );
}
