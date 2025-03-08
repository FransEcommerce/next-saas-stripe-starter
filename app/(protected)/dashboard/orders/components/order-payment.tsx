"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText } from "lucide-react";
import Image from "next/image";

interface OrderPaymentProps {
    order: {
        amount: number;
        subtotal: number;
        discountAmount?: number | null;
        tax?: number | null;
        paymentMethod?: string | null;
        paymentNote?: string | null;
        paymentProof?: string | null;
        couponCode?: string | null;
        coupon?: {
            code: string;
            value: number;
            type: string;
        } | null;
    };
}

export function OrderPayment({ order }: OrderPaymentProps) {
    // 检查是否为 PDF 文件
    const isPdfFile = order.paymentProof?.includes('.pdf/shared/');

    return (
        <Card>
            <CardHeader>
                <CardTitle>Payment</CardTitle>
                <CardDescription>Payment information and status</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span className="font-medium">{formatPrice(order.subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Discount</span>
                            <span className="font-medium text-green-600">-{formatPrice(order.discountAmount || 0)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Tax</span>
                            <span className="font-medium">{formatPrice(order.tax || 0)}</span>
                        </div>
                        <Separator className="my-2" />
                        <div className="flex justify-between text-sm font-medium">
                            <span>Total</span>
                            <span>{formatPrice(order.amount)}</span>
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                        {order.paymentMethod && (
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Payment Method</span>
                                <span className="font-medium">{order.paymentMethod}</span>
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
                                    {isPdfFile ? (
                                        <Button 
                                            variant="ghost" 
                                            size="sm"
                                            onClick={() => order.paymentProof && window.open(order.paymentProof, "_blank")}
                                        >
                                            View PDF
                                        </Button>
                                    ) : (
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
                                    )}
                                </div>
                                <div className="relative h-24 w-full overflow-hidden rounded-lg bg-muted">
                                    {isPdfFile ? (
                                        <div className="flex items-center justify-center h-full">
                                            <FileText className="h-10 w-10 text-red-500" />
                                            <span className="ml-2 text-sm font-medium">PDF Document</span>
                                        </div>
                                    ) : (
                                        <Image
                                            src={order.paymentProof}
                                            alt="Payment proof thumbnail"
                                            fill
                                            className="object-cover opacity-80 hover:opacity-100 transition-opacity"
                                        />
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}