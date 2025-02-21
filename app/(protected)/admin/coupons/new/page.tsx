import { DashboardHeader } from "@/components/dashboard/header";
import { CouponForm } from "../components/coupon-form";
import { getAffiliates } from "../queries";

export default async function NewCouponPage() {
  const affiliates = await getAffiliates();

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <DashboardHeader
        heading="Create Coupon"
        text="Create a new discount coupon."
      />
      <div className="grid gap-4 grid-cols-1">
        <CouponForm affiliates={affiliates} />
      </div>
    </div>
  );
}