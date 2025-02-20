import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import { DashboardHeader } from "@/components/dashboard/header";
import { LicensesList } from "./components/licenses-list";
import { getLicenses } from "./queries";

export const metadata = constructMetadata({
  title: "Licenses Management – Admin Panel",
  description: "Manage license keys and their statuses",
});

export default async function LicensesPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/login");

  const licenses = await getLicenses();

  return (
    <>
      <div className="flex-1 space-y-4">
        <DashboardHeader
          heading="Licenses"
          text="Manage license keys, domains, and statuses."
        />
        <LicensesList licenses={licenses} />
      </div>
    </>
  );
}
