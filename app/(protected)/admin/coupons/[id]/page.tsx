import { notFound } from "next/navigation";
import { HeaderSection } from "@/components/shared/header-section";
import { CouponForm } from "../components/coupon-form";
import { getCouponById } from "../queries";

interface EditCouponPageProps {
  params: {
    id: string;
  };
}

export default async function EditCouponPage({ params }: EditCouponPageProps) {
  const coupon = await getCouponById(params.id);

  if (!coupon) {
    notFound();
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <HeaderSection
        heading="Edit Coupon"
        text="Modify existing coupon details."
      />
      <div className="grid gap-4 grid-cols-1">
        <CouponForm initialData={coupon} />
      </div>
    </div>
  );
}