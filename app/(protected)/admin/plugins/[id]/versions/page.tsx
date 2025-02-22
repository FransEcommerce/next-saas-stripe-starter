import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import { DashboardHeader } from "@/components/dashboard/header";
import { getPluginVersions } from "../../queries";
import { VersionsList } from "./components/versions-list";

export const metadata = constructMetadata({
  title: "Plugin Versions – Admin Panel",
  description: "Manage plugin versions",
});

interface VersionsPageProps {
  params: {
    id: string;
  };
}

export default async function VersionsPage({ params }: VersionsPageProps) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/login");

  const versions = await getPluginVersions(params.id);
  if (!versions.length) redirect("/admin/plugins");

  return (
    <>
      <div className="flex justify-between items-end">
        <DashboardHeader
          heading={`${versions[0].name} - Version History`}
          text="Manage and view all versions of this plugin."
        />
        <span className="text-sm bg-secondary px-2 py-1 rounded-md font-mono">
          Project ID: {versions[0].project_id || "N/A"}
        </span>
      </div>

      <div className="grid gap-8">
        <VersionsList versions={versions} />
      </div>
    </>
  );
}
