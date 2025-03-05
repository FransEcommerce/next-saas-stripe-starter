"use client";

import { useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { OrderDetailsDialog } from "./order-details-dialog";

interface OrderListProps {
    orders: {
        id: string;
        orderNumber: string;
        status: string;
        amount: number;
        product: {
            name: string;
            plugin: {
                name: string;
                avatar?: string | null;
            };
        };
        user: {
            name?: string | null;
            email?: string | null;
        };
    }[];
}

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

export function OrderList({ orders }: OrderListProps) {
    const [selectedOrder, setSelectedOrder] = useState<OrderListProps["orders"][0] | null>(null);

    if (orders.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-muted-foreground">You have no orders yet.</p>
                <Link href="/dashboard/products">
                    <Button className="mt-4">Explore Products</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
                <p className="text-muted-foreground">
                    Manage your orders and track the status of your purchases. View details.
                </p>
            </div>
            <div className="md:hidden">
                {orders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4 mb-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                                {order.product.plugin.avatar && (
                                    <div className="relative h-8 w-8 overflow-hidden rounded-lg">
                                        <Image
                                            src={order.product.plugin.avatar}
                                            alt={order.product.plugin.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                )}
                                <span className="font-medium">#{order.orderNumber}</span>
                            </div>
                            <Badge className={orderStatusMap[order.status as keyof typeof orderStatusMap].color}>
                                {order.status.toLowerCase()}
                            </Badge>
                        </div>
                        <div className="mt-4 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Product:</span>
                                <span className="text-xs">{order.product.name}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Amount:</span>
                                <span>{formatPrice(order.amount)}</span>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full mt-4"
                            onClick={() => setSelectedOrder(order)}
                        >
                            View Details
                        </Button>
                    </div>
                ))}
            </div>
            <div className="hidden md:block">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order #</TableHead>
                            <TableHead>Product</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.map((order) => (
                            <TableRow key={order.id}>
                                <TableCell className="font-medium">#{order.orderNumber}</TableCell>
                                <TableCell>
                                    <div className="flex items-center space-x-2">
                                        {order.product.plugin.avatar && (
                                            <div className="relative h-8 w-8 overflow-hidden rounded-lg">
                                                <Image
                                                    src={order.product.plugin.avatar}
                                                    alt={order.product.plugin.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        )}
                                        <span>{order.product.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell>{formatPrice(order.amount)}</TableCell>
                                <TableCell>
                                    <Badge className={orderStatusMap[order.status as keyof typeof orderStatusMap].color}>
                                        {order.status.toLowerCase()}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setSelectedOrder(order)}
                                    >
                                        View Details
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {selectedOrder && (
                <OrderDetailsDialog
                    order={selectedOrder}
                    open={!!selectedOrder}
                    onOpenChange={(open) => !open && setSelectedOrder(null)}
                />
            )}
        </div>
    );
}