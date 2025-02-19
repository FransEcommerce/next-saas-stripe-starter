"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatPrice } from "@/lib/utils";
import { PaymentDialog } from "./payment-dialog";

interface PendingPayment {
  id: string;
  amount: number;
  affiliateCommission: number;
  orderNumber: string;
  createdAt: Date;
  affiliate: {
    id: string;
    user: {
      name: string | null;
      email: string | null;
    };
    paymentMethod?: {
      id: string;
      type: string;
      details: any;
    } | null;
  };
  product: {
    name: string;
  };
}

interface PendingPaymentListProps {
  payments: PendingPayment[];
}

export function PendingPaymentList({ payments }: PendingPaymentListProps) {
  const [selectedPayments, setSelectedPayments] = useState<PendingPayment[]>([]);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  // 按推广者ID分组支付项
  const groupedPayments = payments.reduce((acc, payment) => {
    const affiliateId = payment.affiliate.id;
    if (!acc[affiliateId]) {
      acc[affiliateId] = {
        affiliate: payment.affiliate,
        payments: [],
        totalCommission: 0
      };
    }
    acc[affiliateId].payments.push(payment);
    acc[affiliateId].totalCommission += Number(payment.affiliateCommission);
    return acc;
  }, {} as Record<string, { 
    affiliate: PendingPayment['affiliate'], 
    payments: PendingPayment[],
    totalCommission: number
  }>);

  const getPaymentMethodLabel = (method: string) => {
    const methodMap: Record<string, string> = {
      BANK_TRANSFER: "Bank Transfer",
      PAYPAL: "PayPal",
      STRIPE: "Stripe",
      CREDIT_CARD: "Credit Card",
      DEBIT_CARD: "Debit Card",
      RAZORPAY: "Razorpay",
      CRYPTO: "Cryptocurrency",
      OTHER: "Other",
    };
    return methodMap[method] || method;
  };

  return (
    <div className="rounded-md border space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Affiliate</TableHead>
            <TableHead>Payment Method</TableHead>
            <TableHead>Pending Orders</TableHead>
            <TableHead>Total Commission</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Object.keys(groupedPayments).length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                <div className="flex flex-col items-center justify-center text-sm">
                  <p className="text-muted-foreground">No pending commissions found</p>
                  <p className="text-muted-foreground">Commissions will appear here when orders with affiliate referrals are completed</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            Object.entries(groupedPayments).map(([affiliateId, group]) => (
              <TableRow key={affiliateId}>
                <TableCell>
                  <div>
                    <div className="font-medium">{group.affiliate.user.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {group.affiliate.user.email}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {group.affiliate.paymentMethod ? (
                    <div className="text-sm">
                      <div className="font-medium">
                        {getPaymentMethodLabel(group.affiliate.paymentMethod.type)}
                      </div>
                      <div className="text-muted-foreground">
                        {group.affiliate.paymentMethod.details}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      <span>Not set</span>
                      <Button
                        variant="link"
                        className="px-0 text-sm h-auto"
                        onClick={() => {
                          // 这里可以添加一个链接到编辑推广者页面
                          window.location.href = `/admin/affiliates?edit=${affiliateId}`;
                        }}
                      >
                        (Set up payment method)
                      </Button>
                    </div>
                  )}
                </TableCell>
                <TableCell>{group.payments.length}</TableCell>
                <TableCell>{formatPrice(group.totalCommission)}</TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedPayments(group.payments);
                      setShowPaymentDialog(true);
                    }}
                    disabled={!group.affiliate.paymentMethod}
                    className="whitespace-nowrap"
                  >
                    {!group.affiliate.paymentMethod ? "Set Payment Method" : "Process Payment"}
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <PaymentDialog 
        open={showPaymentDialog}
        onClose={() => setShowPaymentDialog(false)}
        payments={selectedPayments}
      />
    </div>
  );
}
