import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import { DeleteAccountSection } from "@/components/dashboard/delete-account";
import { DashboardHeader } from "@/components/dashboard/header";
import { UserNameForm } from "@/components/forms/user-name-form";
import { UserRoleForm } from "@/components/forms/user-role-form";
import { UserBillingForm } from "@/components/forms/user-billing-form";

export const metadata = constructMetadata({
  title: "Settings – SaaS Starter",
  description: "Configure your account and website settings.",
});

export default async function SettingsPage() {
  const user = await getCurrentUser();

  if (!user?.id) redirect("/login");

  return (
    <>
      <DashboardHeader
        heading="Settings"
        text="Manage account and website settings."
      />
      <div className="divide-y divide-muted pb-10">
        <UserNameForm user={{ id: user.id, name: user.name || "" }} />
        <UserBillingForm user={{
          id: user.id,
          billingCompany: user.billingCompany || "",
          billingName: user.billingName || "",
          billingAddress: user.billingAddress || "",
          billingCity: user.billingCity || "",
          billingState: user.billingState || "",
          billingCountry: user.billingCountry || "",
          billingZip: user.billingZip || "",
          billingPhone: user.billingPhone || ""
        }} />
        {/* <UserRoleForm user={{ id: user.id, role: user.role }} /> */}
        <DeleteAccountSection />
      </div>
    </>
  );
}
