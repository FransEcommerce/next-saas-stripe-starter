import { notFound } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/header";
import { CouponForm } from "../components/coupon-form";
import { getCouponById, getAffiliates } from "../queries";

interface EditCouponPageProps {
  params: {
    id: string;
  };
}

export default async function EditCouponPage({ params }: EditCouponPageProps) {
  const [coupon, affiliates] = await Promise.all([
    getCouponById(params.id),
    getAffiliates(),
  ]);

  if (!coupon) {
    notFound();
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <DashboardHeader
        heading="Edit Coupon"
        text="Update an existing discount coupon."
      />
      <div className="grid gap-4 grid-cols-1">
        <CouponForm initialData={coupon} affiliates={affiliates} />
      </div>
    </div>
  );
}