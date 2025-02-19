"use client";

import { formatDistance } from "date-fns";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OrderHeaderProps {
  orderNumber: string;
  createdAt: Date;
  paidAt?: Date;
}

export function OrderHeader({ orderNumber, createdAt, paidAt }: OrderHeaderProps) {
  const copyOrderNumber = async () => {
    try {
      await navigator.clipboard.writeText(orderNumber);
      toast.success("Order number copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy order number");
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Order #{orderNumber}</CardTitle>
        <Button variant="ghost" size="icon" onClick={copyOrderNumber}>
          <Copy className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Created</span>
            <span>{formatDistance(createdAt, new Date(), { addSuffix: true })}</span>
          </div>
          {paidAt && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Paid</span>
              <span>{formatDistance(paidAt, new Date(), { addSuffix: true })}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
