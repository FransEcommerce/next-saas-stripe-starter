import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import { DashboardHeader } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PluginsList } from "./components/plugins-list";
import { getPlugins } from "./queries";

export const metadata = constructMetadata({
  title: "Plugins Management – Admin Panel",
  description: "Manage and create plugins",
});

export default async function PluginsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/login");

  const plugins = await getPlugins();

  return (
    <>
      <DashboardHeader
        heading="Plugins Management"
        text="Create and manage plugins, configure plugin settings and licenses."
      >
        <Link href="/admin/plugins/new" className="ml-auto">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Plugin
          </Button>
        </Link>
      </DashboardHeader>

      <div className="grid gap-8">
        <PluginsList plugins={plugins} />
      </div>
    </>
  );
}
