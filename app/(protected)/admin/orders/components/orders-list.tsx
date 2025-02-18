"use client";

import Link from "next/link";
import { formatDistance } from "date-fns";
import { Eye, MoreHorizontal, Copy } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

const orderStatusMap = {
  PENDING: { label: "Pending", color: "bg-yellow-500/20 text-yellow-700" },
  COMPLETED: { label: "Completed", color: "bg-green-500/20 text-green-700" },
  FAILED: { label: "Failed", color: "bg-red-500/20 text-red-700" },
  REFUNDED: { label: "Refunded", color: "bg-blue-500/20 text-blue-700" },
  CANCELLED: { label: "Cancelled", color: "bg-gray-500/20 text-gray-700" },
};

export function OrdersList({ orders }: { orders: any[] }) {
  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>License Key</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders?.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">
                {order.orderNumber.slice(0, 8)}
              </TableCell>
              <TableCell>{order.user.email}</TableCell>
              <TableCell>{order.product.name}</TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{formatPrice(order.amount)}</span>
                  {order.discountAmount > 0 && (
                    <span className="text-xs text-green-600">
                      -{formatPrice(order.discountAmount)} discount
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  className={orderStatusMap[order.status].color}
                  variant="secondary"
                >
                  {orderStatusMap[order.status].label}
                </Badge>
              </TableCell>
              <TableCell>{order.paymentMethod || "N/A"}</TableCell>
              <TableCell>
                {formatDistance(new Date(order.createdAt), new Date(), {
                  addSuffix: true,
                })}
              </TableCell>
              <TableCell>
                {order.license && (
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm">
                      {order.license.licenseKey.slice(0, 4)}****
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(order.license.licenseKey)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/orders/${order.id}/edit`}>
                        <Eye className="mr-2 h-4 w-4" /> View Details
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
