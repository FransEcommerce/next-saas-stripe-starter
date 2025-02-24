import { Metadata } from "next";
import { PlanForm } from "../components/plan-form";

export const metadata: Metadata = {
  title: "Create Plan",
  description: "Create a new subscription plan",
};

export default function NewPlanPage() {
  return (
    <div className="flex flex-col gap-8 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Create Plan</h1>
        <p className="text-sm text-muted-foreground">
          Create a new subscription plan
        </p>
      </div>
      <PlanForm />
    </div>
  );
}
