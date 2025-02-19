import { Suspense } from "react";
import { CouponList } from "./components/coupon-list";
import { DashboardHeader } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getCoupons } from "./queries";

export default async function CouponsPage() {
  const coupons = await getCoupons();

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <DashboardHeader
          heading="Coupons"
          text="Manage your discount coupons here."
        />
        <Link href="/admin/coupons/new">
          <Button>Create Coupon</Button>
        </Link>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <CouponList coupons={coupons} />
      </Suspense>
    </div>
  );
}