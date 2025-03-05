"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";
import { ExternalLink, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditPaymentDialog } from "./EditPaymentDialog";
import { updateOrderPayment } from "../../actions";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface OrderPaymentProps {
  order: {
    id: string;
    amount: number;
    subtotal: number;
    discountAmount?: number | null;
    tax?: number | null;
    affiliateCommission?: number | null;
    paymentMethod?: string | null;
    paymentNote?: string | null;
    paymentProof?: string | null;
    couponCode?: string | null;
    coupon?: {
      code: string;
      value: number;
      type: string;
    } | null;
    affiliate?: {
      user: {
        name: string;
        email: string;
      };
    } | null;
  };
}

export function OrderPayment({ order }: OrderPaymentProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleUpdatePayment = async (data: any) => {
    try {
      const result = await updateOrderPayment(order.id, data);
      if (result.error) {
        toast.error(result.error);
      } else {
        setIsEditDialogOpen(false);
        toast.success("Payment information updated", {
        });
      }
    } catch (error) {
      console.error("Failed to update payment:", error);
      toast.error("Failed to update payment information");
    }
  };

  const PriceRow = ({ label, amount, type = "normal" }: { label: string; amount: number; type?: "normal" | "discount" | "total" }) => {
    const getTextColor = () => {
      switch (type) {
        case "discount":
          return "text-green-600";
        case "total":
          return "font-medium text-foreground";
        default:
          return "text-muted-foreground";
      }
    };

    return (
      <div className="flex items-center justify-between text-sm">
        <span className={type === "total" ? "font-medium" : "text-muted-foreground"}>{label}</span>
        <span className={getTextColor()}>
          {type === "discount" ? "-" : ""}{formatPrice(amount)}
        </span>
      </div>
    );
  };

  const getPaymentMethodLabel = (method: string | null | undefined) => {
    if (!method) return "";
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
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Payment</CardTitle>
            <CardDescription>Payment information and status</CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                Edit payment
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <PriceRow label="Subtotal" amount={order.subtotal} />
              {(order.discountAmount || 0) > 0 && (
                <PriceRow 
                  label={`Discount${order.coupon ? ` (${order.coupon.code})` : ''}`} 
                  amount={order.discountAmount || 0} 
                  type="discount" 
                />
              )}
              {order.affiliateCommission && order.affiliateCommission > 0 && (
                <div className="space-y-1">
                  <PriceRow 
                    label="Affiliate Commission" 
                    amount={order.affiliateCommission}
                  />
                  {order.affiliate && (
                    <div className="text-xs text-muted-foreground pl-4">
                      Affiliate: {order.affiliate.user.name} ({order.affiliate.user.email})
                    </div>
                  )}
                </div>
              )}
 
              <PriceRow label="Tax" amount={order.tax || 0} />

              <Separator className="my-2" />
              <PriceRow label="Total" amount={order.amount} type="total" />
            </div>

            <Separator />

            <div className="space-y-2">
              {order.paymentMethod && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Payment Method</span>
                  <span className="font-medium">{getPaymentMethodLabel(order.paymentMethod)}</span>
                </div>
              )}
              {order.paymentNote && (
                <div className="space-y-1 text-sm">
                  <span className="text-muted-foreground">Note:</span>
                  <p className="text-sm">{order.paymentNote}</p>
                </div>
              )}
            </div>

            {order.paymentProof && (
              <>
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Payment Proof</span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => order.paymentProof && window.open(order.paymentProof, "_blank")}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            View Image
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                          <DialogHeader>
                            <DialogTitle>Payment Proof</DialogTitle>
                          </DialogHeader>
                          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg">
                            <Image
                              src={order.paymentProof}
                              alt="Payment proof"
                              fill
                              className="object-contain"
                            />
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                  <div className="relative h-24 w-full overflow-hidden rounded-lg bg-muted">
                    <Image
                      src={order.paymentProof}
                      alt="Payment proof thumbnail"
                      fill
                      className="object-cover opacity-80 hover:opacity-100 transition-opacity"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <EditPaymentDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        initialData={{
          amount: Number(order.amount),
          subtotal: Number(order.subtotal),
          discountAmount: order.discountAmount ? Number(order.discountAmount) : undefined,
          tax: order.tax ? Number(order.tax) : undefined,
          affiliateCommission: order.affiliateCommission ? Number(order.affiliateCommission) : undefined,
          paymentMethod: order.paymentMethod || undefined,
          paymentNote: order.paymentNote || undefined,
          paymentProof: order.paymentProof || undefined,
          couponCode: order.couponCode || undefined,
        }}
        onSubmit={handleUpdatePayment}
      />
    </>
  );
}
