import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import { getPluginById } from "../../queries";
import { EditPluginForm } from "../../components/edit-plugin-form";

export const metadata = constructMetadata({
  title: "Edit Plugin – Admin Panel",
  description: "Edit plugin details",
});

interface EditPluginPageProps {
  params: {
    id: string;
  };
  searchParams: {
    returnTo?: string;
  };
}

export default async function EditPluginPage({ params, searchParams }: EditPluginPageProps) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/login");

  const plugin = await getPluginById(params.id);
  if (!plugin) redirect("/admin/plugins");

  // 如果有 returnTo 参数，使用它作为返回路径
  const returnPath = searchParams.returnTo || "/admin/plugins";

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <EditPluginForm plugin={plugin} returnPath={returnPath} />
    </div>
  );
}
