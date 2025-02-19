"use client";

import Link from "next/link";
import { formatDistance } from "date-fns";
import { Eye, MoreHorizontal, Copy, Trash2 } from "lucide-react";
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
import { deleteOrder } from "../actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const orderStatusMap = {
  PENDING: { label: "Pending", color: "bg-yellow-500/20 text-yellow-700" },
  PROCESSING: { label: "Processing", color: "bg-blue-500/20 text-blue-700" },
  COMPLETED: { label: "Completed", color: "bg-green-500/20 text-green-700" },
  FAILED: { label: "Failed", color: "bg-red-500/20 text-red-700" },
  REFUNDED: { label: "Refunded", color: "bg-purple-500/20 text-purple-700" },
  CANCELLED: { label: "Cancelled", color: "bg-gray-500/20 text-gray-700" },
};

export function OrdersList({ orders }: { orders: any[] }) {
  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const handleDelete = async (orderId: string) => {
    try {
      await deleteOrder(orderId);
      toast.success("Order deleted successfully");
    } catch (error) {
      toast.error("Failed to delete order");
    }
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
            <TableHead>Commission</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>License Key</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders?.map((order) => (
            <TableRow key={order.id} className="text-sm">
              <TableCell className="font-medium text-sx">
                #{order.orderNumber}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {order.user.email}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {order.product.name}
              </TableCell>
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
                {order.affiliateCommission ? (
                  <div className="flex flex-col">
                    <span className="font-medium">{formatPrice(order.affiliateCommission)}</span>
                    <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                      {order.affiliate?.user?.name || order.affiliate?.user?.email}
                    </span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell>
                <Badge
                  className={`${orderStatusMap[order.status].color} text-xs`}
                  variant="secondary"
                >
                  {orderStatusMap[order.status].label}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {order.paymentMethod || "N/A"}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDistance(new Date(order.createdAt), new Date(), {
                  addSuffix: true,
                })}
              </TableCell>
              <TableCell>
                {order.license && (
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs text-muted-foreground">
                      {order.license.licenseKey.slice(0, 4)}****
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => copyToClipboard(order.license.licenseKey)}
                    >
                      <Copy className="h-3 w-3" />
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
                      <Link href={`/admin/orders/${order.id}`}>
                        <Eye className="mr-2 h-4 w-4" /> View Details
                      </Link>
                    </DropdownMenuItem>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem
                          className="text-red-600"
                          onSelect={(e) => e.preventDefault()}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete Order
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Order</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete <span className="font-semibold text-foreground">Order ID #{order.orderNumber} ? </span> 
                            This action cannot be undone. This will permanently delete the
                            order and all related data including license keys and commission records.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() => handleDelete(order.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
