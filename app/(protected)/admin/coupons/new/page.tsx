import { HeaderSection } from "@/components/shared/header-section";
import { CouponForm } from "../components/coupon-form";

export default function NewCouponPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <HeaderSection
        heading="Create Coupon"
        text="Create a new discount coupon."
      />
      <div className="grid gap-4 grid-cols-1">
        <CouponForm />
      </div>
    </div>
  );
}