import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import { getPluginById } from "../../../queries";
import { CreateVersionForm } from "../components/create-version-form";

export const metadata = constructMetadata({
  title: "New Plugin Version – Admin Panel",
  description: "Create a new version for this plugin",
});

interface NewVersionPageProps {
  params: {
    id: string;
  };
}

export default async function NewVersionPage({ params }: NewVersionPageProps) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/login");

  const plugin = await getPluginById(params.id);
  if (!plugin) redirect("/admin/plugins");

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <CreateVersionForm plugin={plugin} />
    </div>
  );
}
