"use server";

import { getAffiliates, getUsers } from "./queries";
import { AffiliateList } from "./components/affiliate-list";
import { AddAffiliateButton } from "./components/add-affiliate-button";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Suspense } from "react";
import { DashboardHeader } from "@/components/dashboard/header";

export default async function AffiliatesPage() {
  const [affiliates, users] = await Promise.all([
    getAffiliates(),
    getUsers()
  ]);

  return (
    <>
      <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <DashboardHeader
            heading="Affiliates"
            text="Manage your affiliate partners and commission settings."
          />
          <div className="flex items-center gap-4">
            <Link href="/admin/affiliates/payments">
              <Button variant="outline">
                Manage Payments
              </Button>
            </Link>
            <AddAffiliateButton users={users} />
          </div>
        </div>
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <AffiliateList 
          initialAffiliates={affiliates} 
          users={users}
        />
      </Suspense>
    </>
  );
}
