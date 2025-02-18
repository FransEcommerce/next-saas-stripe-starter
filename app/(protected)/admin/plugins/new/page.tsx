import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import { DashboardHeader } from "@/components/dashboard/header";
import { CreatePluginForm } from "../components/create-plugin-form";

export const metadata = constructMetadata({
  title: "Create Plugin – Admin Panel",
  description: "Create a new plugin",
});

export default async function CreatePluginPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/login");

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Create Plugin</h2>
      </div>
      <div className="grid gap-4">
        <CreatePluginForm />
      </div>
    </div>
  );
}
