"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface OrderCustomerProps {
    order: {
        user: {
            name?: string | null;
            email?: string | null;
        };
        billingCompany?: string | null;
        billingName?: string | null;
        billingAddress?: string | null;
        billingCity?: string | null;
        billingState?: string | null;
        billingCountry?: string | null;
        billingZip?: string | null;
        billingPhone?: string | null;
    };
}

export function OrderCustomer({ order }: OrderCustomerProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Customer</CardTitle>
                <CardDescription>Customer and billing information</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <h3 className="text-sm font-medium">Contact Information</h3>
                        <div className="rounded-lg border bg-muted/50 p-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="flex flex-col space-y-1">
                                    <span className="text-sm text-muted-foreground">Name</span>
                                    <span className="text-sm font-medium">{order.user?.name || "N/A"}</span>
                                </div>
                                <div className="flex flex-col space-y-1">
                                    <span className="text-sm text-muted-foreground">Email</span>
                                    <span className="text-sm font-medium">{order.user?.email || "N/A"}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    {(order.billingName || order.billingCompany || order.billingAddress || order.billingCity ||
                        order.billingState || order.billingCountry || order.billingZip || order.billingPhone) && (
                            <div className="space-y-2">
                                <h3 className="text-sm font-medium">Billing Information</h3>
                                <div className="rounded-lg border bg-muted/50 p-4">
                                    <div className="grid gap-2 md:grid-cols-2">
                                        <div className="flex flex-col space-y-1">
                                            <span className="text-sm text-muted-foreground">Name</span>
                                            <span className="text-sm font-medium">{order.billingName}</span>
                                        </div>
                                        <div className="flex flex-col space-y-1">
                                            <span className="text-sm text-muted-foreground">Company</span>
                                            <span className="text-sm font-medium">{order.billingCompany}</span>
                                        </div>
                                        <div className="md:col-span-2">
                                            <div className="flex flex-col space-y-1">
                                                <span className="text-sm text-muted-foreground">Address</span>
                                                <span className="text-sm font-medium">{order.billingAddress}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col space-y-1">
                                            <span className="text-sm text-muted-foreground">City</span>
                                            <span className="text-sm font-medium">{order.billingCity}</span>
                                        </div>
                                        <div className="flex flex-col space-y-1">
                                            <span className="text-sm text-muted-foreground">State</span>
                                            <span className="text-sm font-medium">{order.billingState}</span>
                                        </div>
                                        <div className="flex flex-col space-y-1">
                                            <span className="text-sm text-muted-foreground">Country</span>
                                            <span className="text-sm font-medium">{order.billingCountry}</span>
                                        </div>
                                        <div className="flex flex-col space-y-1">
                                            <span className="text-sm text-muted-foreground">ZIP</span>
                                            <span className="text-sm font-medium">{order.billingZip}</span>
                                        </div>
                                        <div className="flex flex-col space-y-1">
                                            <span className="text-sm text-muted-foreground">Phone</span>
                                            <span className="text-sm font-medium">{order.billingPhone}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                </div>
            </CardContent>
        </Card>
    );
}