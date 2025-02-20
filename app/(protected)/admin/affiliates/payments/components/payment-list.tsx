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
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuContent } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { updatePaymentStatus } from "../../actions";

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  note?: string | null;
  proofUrl?: string | null;
  createdAt: Date;
  processedAt?: Date | null;
  affiliate: {
    user: {
      name: string | null;
      email: string | null;
    };
  };
  method: {
    type: string;
    details: any;
  };
  orders: {
    orderNumber: string;
    amount: number;
    affiliateCommission: number;
  }[];
}

interface PaymentListProps {
  payments: Payment[];
  onSuccess?: () => void;
}

const paymentStatusMap = {
  PROCESSING: { label: "Processing", color: "bg-yellow-500/20 text-yellow-700" },
  COMPLETED: { label: "Completed", color: "bg-green-500/20 text-green-700" },
  FAILED: { label: "Failed", color: "bg-red-500/20 text-red-700" },
  CANCELLED: { label: "Cancelled", color: "bg-gray-500/20 text-gray-700" },
};

function getStatusColor(status: string) {
  switch (status) {
    case 'COMPLETED':
      return 'bg-green-500/20 text-green-700';
    case 'PROCESSING':
      return 'bg-yellow-500/20 text-yellow-700';
    case 'FAILED':
      return 'bg-red-500/20 text-red-700';
    case 'CANCELLED':
      return 'bg-gray-500/20 text-gray-700';
    default:
      return 'bg-blue-500/20 text-blue-700';
  }
}

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

export function PaymentList({ payments, onSuccess }: PaymentListProps) {
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusUpdate = async (id: string, status: 'COMPLETED' | 'FAILED' | 'CANCELLED') => {
    try {
      setIsUpdating(true);
      const result = await updatePaymentStatus(id, { status });
      
      if (result.success) {
        toast.success(`Payment status updated to ${status.toLowerCase()}`);
        onSuccess?.();
      } else {
        toast.error(result.error || "Failed to update payment status");
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Affiliate</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                <div className="flex flex-col items-center justify-center text-sm">
                  <p className="text-muted-foreground">No payment history found</p>
                  <p className="text-muted-foreground">Process your first commission payment to see it here</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>
                  {format(new Date(payment.createdAt), 'MMM d, yyyy')}
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{payment.affiliate.user.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {payment.affiliate.user.email}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{formatPrice(payment.amount)}</TableCell>
                <TableCell>{getPaymentMethodLabel(payment.method.type)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        paymentStatusMap[payment.status as keyof typeof paymentStatusMap]?.color
                      }`}
                    >
                      {paymentStatusMap[payment.status as keyof typeof paymentStatusMap]?.label}
                    </span>
                    {/* {payment.status === "PROCESSING" && ( */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild disabled={isUpdating}>
                          <Button variant="ghost" className="p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleStatusUpdate(payment.id, "COMPLETED")}
                          >
                            Mark as Completed
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleStatusUpdate(payment.id, "FAILED")}
                          >
                            Mark as Failed
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleStatusUpdate(payment.id, "CANCELLED")}
                          >
                            Mark as Cancelled
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    {/* )} */}
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedPayment(payment)}
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="font-medium mb-1">Affiliate</div>
                  <div className="text-sm">
                    <div>{selectedPayment.affiliate.user.name}</div>
                    <div className="text-muted-foreground">
                      {selectedPayment.affiliate.user.email}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="font-medium mb-1">Payment Method</div>
                  <div className="text-sm">
                    <div>{getPaymentMethodLabel(selectedPayment.method.type)}</div>
                    <div className="text-muted-foreground">
                      {selectedPayment.method.details}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="font-medium mb-1">Amount</div>
                  <div className="text-lg">
                    {formatPrice(selectedPayment.amount)}
                  </div>
                </div>
                <div>
                  <div className="font-medium mb-1">Status</div>
                  <Badge variant="secondary" className={`${getStatusColor(selectedPayment.status)} border-none`}>
                    {paymentStatusMap[selectedPayment.status as keyof typeof paymentStatusMap]?.label || selectedPayment.status}
                  </Badge>
                </div>
              </div>

              <div>
                <div className="font-medium mb-2">Orders</div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order Number</TableHead>
                      <TableHead>Order Amount</TableHead>
                      <TableHead>Commission</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedPayment.orders.map((order) => (
                      <TableRow key={order.orderNumber}>
                        <TableCell>#{order.orderNumber}</TableCell>
                        <TableCell>{formatPrice(order.amount)}</TableCell>
                        <TableCell>{formatPrice(order.affiliateCommission)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {selectedPayment.note && (
                <div>
                  <div className="font-medium mb-1">Note</div>
                  <div className="text-sm text-muted-foreground">
                    {selectedPayment.note}
                  </div>
                </div>
              )}

              {selectedPayment.proofUrl && (
                <div>
                  <div className="font-medium mb-1">Payment Proof</div>
                  <a
                    href={selectedPayment.proofUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-500 hover:underline"
                  >
                    View Payment Proof
                  </a>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
