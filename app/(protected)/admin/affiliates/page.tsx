"use server";

import { getAffiliates, getUsers } from "./queries";
import { AffiliateList } from "./components/affiliate-list";
import { AddAffiliateButton } from "./components/add-affiliate-button";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Suspense } from "react";

export default async function AffiliatesPage() {
  const [affiliates, users] = await Promise.all([
    getAffiliates(),
    getUsers()
  ]);

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Affiliates</h2>
          <p className="text-muted-foreground">
            Manage your affiliate partners
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline">
            <Link href="/admin/affiliates/payments">
              Manage Payments
            </Link>
          </Button>
          <AddAffiliateButton users={users} />
        </div>
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <AffiliateList 
          initialAffiliates={affiliates} 
          users={users}
        />
      </Suspense>
    </div>
  );
}
