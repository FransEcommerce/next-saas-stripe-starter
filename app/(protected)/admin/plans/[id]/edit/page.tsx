import { Metadata } from "next";
import { PlanForm } from "../../components/plan-form";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Edit Plan",
  description: "Edit subscription plan",
};

interface EditPlanPageProps {
  params: {
    id: string;
  };
}

export default async function EditPlanPage({ params }: EditPlanPageProps) {
  const plan = await prisma.plan.findUnique({
    where: {
      id: params.id,
    },
  });

  if (!plan) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-8 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit Plan</h1>
        <p className="text-sm text-muted-foreground">
          Edit subscription plan details
        </p>
      </div>
      <PlanForm plan={plan} />
    </div>
  );
}
