"use client";

import { useState } from "react";
import { EditCustomerDialog } from "./EditCustomerDialog";
import { EditPaymentDialog } from "./EditPaymentDialog";
import { updateOrderCustomer, updateOrderPayment } from "../../actions";
import { toast } from "sonner";

interface OrderActionsProps {
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
    billingCompany?: string | null;
    billingName?: string | null;
    billingAddress?: string | null;
    billingCity?: string | null;
    billingState?: string | null;
    billingCountry?: string | null;
    billingZip?: string | null;
    billingPhone?: string | null;
    user: {
      name?: string | null;
      email?: string | null;
    };
    affiliate?: {
      user: {
        name: string;
        email: string;
      };
    } | null;
  };
}

export function OrderActions({ order }: OrderActionsProps) {
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  const handleUpdateCustomer = async (data: any) => {
    try {
      await updateOrderCustomer(order.id, data);
      toast.success("Customer information updated");
      // 强制刷新页面以获取最新数据
      window.location.reload();
    } catch (error) {
      console.error("Failed to update customer:", error);
      toast.error("Failed to update customer information");
    }
  };

  const handleUpdatePayment = async (data: any) => {
    try {
      await updateOrderPayment(order.id, data);
      toast.success("Payment information updated");
      // 强制刷新页面以获取最新数据
      window.location.reload();
    } catch (error) {
      console.error("Failed to update payment:", error);
      toast.error("Failed to update payment information");
    }
  };

  return (
    <>
      <EditCustomerDialog
        open={isCustomerDialogOpen}
        onOpenChange={setIsCustomerDialogOpen}
        initialData={{
          name: order.user.name || undefined,
          email: order.user.email || undefined,
          billingCompany: order.billingCompany || undefined,
          billingName: order.billingName || undefined,
          billingAddress: order.billingAddress || undefined,
          billingCity: order.billingCity || undefined,
          billingState: order.billingState || undefined,
          billingCountry: order.billingCountry || undefined,
          billingZip: order.billingZip || undefined,
          billingPhone: order.billingPhone || undefined,
        }}
        onSubmit={handleUpdateCustomer}
      />

      <EditPaymentDialog
        open={isPaymentDialogOpen}
        onOpenChange={setIsPaymentDialogOpen}
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

// 导出一个函数用于打开编辑对话框
export function useOrderActions() {
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  return {
    openCustomerDialog: () => setIsCustomerDialogOpen(true),
    openPaymentDialog: () => setIsPaymentDialogOpen(true),
  };
}
