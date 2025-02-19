'use server'

import { getAffiliatePayments, getPendingPayments } from "../queries";
import { PaymentList } from "./components/payment-list";
import { PendingPaymentList } from "./components/pending-payment-list";
import { Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function AffiliatePaymentsPage() {
  const [pendingPayments, payments] = await Promise.all([
    getPendingPayments(),
    getAffiliatePayments()
  ]);

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Affiliate Payments</h2>
          <p className="text-muted-foreground">
            Manage affiliate commissions and payments
          </p>
        </div>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending Commissions</TabsTrigger>
          <TabsTrigger value="history">Payment History</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="space-y-4">
          <Suspense fallback={<div>Loading pending payments...</div>}>
            <PendingPaymentList payments={pendingPayments} />
          </Suspense>
        </TabsContent>
        <TabsContent value="history" className="space-y-4">
          <Suspense fallback={<div>Loading payment history...</div>}>
            <PaymentList payments={payments} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
