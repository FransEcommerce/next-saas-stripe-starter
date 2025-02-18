import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import { prisma } from "@/lib/db";
import { EditPluginForm } from "../../components/edit-plugin-form";

export const metadata = constructMetadata({
  title: "Edit Plugin – Admin Panel",
  description: "Edit plugin details",
});

interface EditPluginPageProps {
  params: {
    id: string;
  };
}

export default async function EditPluginPage({ params }: EditPluginPageProps) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/login");

  const plugin = await prisma.plugin.findUnique({
    where: { id: params.id },
  });

  if (!plugin) redirect("/admin/plugins");

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Edit Plugin</h2>
      </div>
      <div className="grid gap-4">
        <EditPluginForm plugin={plugin} />
      </div>
    </div>
  );
}
