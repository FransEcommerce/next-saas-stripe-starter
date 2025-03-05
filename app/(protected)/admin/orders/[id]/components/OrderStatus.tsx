"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { updateOrderStatus } from "../../actions";

const orderStatusMap = {
  PENDING: {
    label: "Pending",
    color: "bg-yellow-500/20 text-yellow-700",
  },
  PROCESSING: {
    label: "Processing",
    color: "bg-blue-500/20 text-blue-700",
  },
  COMPLETED: {
    label: "Completed",
    color: "bg-green-500/20 text-green-700",
  },
  CANCELLED: {
    label: "Cancelled",
    color: "bg-red-500/20 text-red-700",
  },
  PAID: {
    label: "Paid",
    color: "bg-purple-500/20 text-purple-700",
  },
  REFUNDED: {
    label: "Refunded",
    color: "bg-gray-500/20 text-gray-700",
  },
} as const;

type OrderStatus = keyof typeof orderStatusMap;

interface OrderStatusProps {
  order: {
    id: string;
    status: OrderStatus;
    amount?: number;
    subtotal?: number;
    discountAmount?: number;
    tax?: number;
    affiliateCommission?: number;
  };
}

export function OrderStatus({ order }: OrderStatusProps) {
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [isPending, setIsPending] = useState(false);

  const handleUpdateStatus = async (newStatus: OrderStatus) => {
    try {
      setIsPending(true);
      await updateOrderStatus(order.id, newStatus);
      setStatus(newStatus);
      toast.success("Order status updated");
    } catch (error) {
      toast.error("Failed to update order status");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Badge className={orderStatusMap[status].color} variant="secondary">
        {orderStatusMap[status].label}
      </Badge>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={isPending}>
          {orderStatusMap[status].label}
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {Object.entries(orderStatusMap).map(([key, { label }]) => (
            <DropdownMenuItem
              key={key}
              onClick={() => handleUpdateStatus(key as OrderStatus)}
              disabled={key === status}
            >
              {label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
