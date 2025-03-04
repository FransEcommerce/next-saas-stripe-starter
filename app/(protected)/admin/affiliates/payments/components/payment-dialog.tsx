"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createAffiliatePayment } from "../../actions";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import { FileUpload } from "@/components/file-upload";
import { env } from "@/env.mjs";

interface Payment {
  id: string;
  amount: number;
  affiliateCommission: number;
  orderNumber: string;
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
}

interface PaymentDialogProps {
  open: boolean;
  onClose: () => void;
  payments: Payment[];
}

export function PaymentDialog({ open, onClose, payments }: PaymentDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [note, setNote] = useState("");
  const [proofUrl, setProofUrl] = useState("");

  if (!payments.length) return null;

  const affiliate = payments[0].affiliate;
  const totalCommission = payments.reduce(
    (sum, payment) => sum + Number(payment.affiliateCommission),
    0
  );

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

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      if (!affiliate.paymentMethod) {
        toast.error("Affiliate has no payment method set");
        return;
      }

      const result = await createAffiliatePayment({
        affiliateId: affiliate.id,
        methodId: affiliate.paymentMethod.id,
        amount: totalCommission,
        currency: "USD",
        note,
        proofUrl,
        orderIds: payments.map(p => p.id)
      });

      if (result.success) {
        toast.success("Payment processed successfully");
        onClose();
      } else {
        toast.error(result.error || "Failed to process payment");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Process Commission Payment</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Affiliate</Label>
            <div className="text-sm">
              <div className="font-medium">{affiliate.user.name}</div>
              <div className="text-muted-foreground">{affiliate.user.email}</div>
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Payment Method</Label>
            <div className="text-sm">
              <div className="font-medium">
                {affiliate.paymentMethod ? getPaymentMethodLabel(affiliate.paymentMethod.type) : "No payment method set"}
              </div>
              {affiliate.paymentMethod?.details && (
                <div className="text-muted-foreground">
                  {affiliate.paymentMethod.details}
                </div>
              )}
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Total Commission</Label>
            <div className="text-lg font-medium">
              {formatPrice(totalCommission)}
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Orders</Label>
            <div className="text-sm text-muted-foreground">
              {payments.length} orders selected
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="note">Note</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note for this payment..."
            />
          </div>
          <div className="grid gap-2">
            <Label>Payment Proof</Label>
            <FileUpload
              id="affiliate-payments"
              parentId="fcfe83ce-abae-44ed-9fcb-9f69c8597e22"
              onUploadComplete={(data) => {
                setProofUrl(data.downloadUrl);
              }}
              accept="image/*,.pdf"
              placeholderText="Upload payment receipt or screenshot"
              value={proofUrl}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Processing..." : "Process Payment"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
