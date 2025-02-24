import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { getPlans } from "./queries";
import { PlanList } from "./components/plan-list";
import { DashboardHeader } from "@/components/dashboard/header";

export const metadata: Metadata = {
  title: "Plans Management",
  description: "Manage subscription plans",
};

export default async function PlansPage() {
  const plans = await getPlans();

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <DashboardHeader
          heading="Plans"
          text="Manage subscription plans."
        />
        <div className="flex items-center space-x-2">
          <Link href="/admin/plans/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Plan
            </Button>
          </Link>
        </div>
      </div>
      <PlanList initialPlans={plans} />
    </div>
  );
}
