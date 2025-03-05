"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { OrderProduct } from "./order-product";
import { OrderCustomer } from "./order-customer";
import { OrderLicense } from "./order-license";
import { OrderPayment } from "./order-payment";
import { OrderListProps } from "./types"; // 导入类型

interface OrderDetailsDialogProps {
    order: OrderListProps["orders"][0]; // 使用 OrderListProps 中的类型
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function OrderDetailsDialog({ order, open, onOpenChange }: OrderDetailsDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[100%] h-[100%] !rounded-none overflow-y-auto flex items-start justify-start pt-16">
                <div className="container mx-auto max-w-[1200px]">
                    <DialogHeader>
                        <DialogTitle className="pb-4">Order #{order.orderNumber}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-6">
                            <OrderProduct order={order} />
                            <OrderCustomer order={order} />
                        </div>
                        <div className="space-y-6">
                            <OrderLicense order={order} />
                            <OrderPayment order={order} />
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}