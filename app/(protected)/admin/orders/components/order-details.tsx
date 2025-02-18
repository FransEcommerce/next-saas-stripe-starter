"use client";

import { useState } from "react";
import { Eye, EyeOff, Copy, Check } from "lucide-react";
import { formatDistance } from "date-fns";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";

const orderStatusMap = {
  PENDING: { label: "Pending", color: "bg-yellow-500/20 text-yellow-700" },
  COMPLETED: { label: "Completed", color: "bg-green-500/20 text-green-700" },
  FAILED: { label: "Failed", color: "bg-red-500/20 text-red-700" },
  REFUNDED: { label: "Refunded", color: "bg-blue-500/20 text-blue-700" },
  CANCELLED: { label: "Cancelled", color: "bg-gray-500/20 text-gray-700" },
};

export function OrderDetails({ order }: { order: any }) {
  const [showLicense, setShowLicense] = useState(false);
  const [copying, setCopying] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopying(true);
      toast.success("License key copied to clipboard");
      setTimeout(() => setCopying(false), 2000);
    } catch (error) {
      toast.error("Failed to copy license key");
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Order Information</CardTitle>
          <CardDescription>Basic order details and status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <div className="text-sm font-medium">Order Number</div>
            <div className="font-mono">{order.orderNumber}</div>
          </div>
          <Separator />
          <div className="grid gap-2">
            <div className="text-sm font-medium">Status</div>
            <Badge
              className={orderStatusMap[order.status].color}
              variant="secondary"
            >
              {orderStatusMap[order.status].label}
            </Badge>
          </div>
          <Separator />
          <div className="grid gap-2">
            <div className="text-sm font-medium">Amount</div>
            <div className="space-y-1">
              <div className="font-medium">{formatPrice(order.amount)}</div>
              {order.discountAmount > 0 && (
                <div className="text-sm text-green-600">
                  Discount: -{formatPrice(order.discountAmount)}
                </div>
              )}
              {order.tax > 0 && (
                <div className="text-sm text-muted-foreground">
                  Tax: {formatPrice(order.tax)}
                </div>
              )}
            </div>
          </div>
          <Separator />
          <div className="grid gap-2">
            <div className="text-sm font-medium">Payment Method</div>
            <div>{order.paymentMethod || "N/A"}</div>
          </div>
          <Separator />
          <div className="grid gap-2">
            <div className="text-sm font-medium">Created</div>
            <div>
              {formatDistance(new Date(order.createdAt), new Date(), {
                addSuffix: true,
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>License Information</CardTitle>
          <CardDescription>License key and activation details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {order.license ? (
            <>
              <div className="grid gap-2">
                <div className="text-sm font-medium">License Key</div>
                <div className="flex items-center space-x-2">
                  <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                    {showLicense
                      ? order.license.licenseKey
                      : order.license.licenseKey.replace(/./g, "*")}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowLicense(!showLicense)}
                  >
                    {showLicense ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyToClipboard(order.license.licenseKey)}
                  >
                    {copying ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <Separator />
              <div className="grid gap-2">
                <div className="text-sm font-medium">Status</div>
                <Badge
                  variant="secondary"
                  className={
                    order.license.status === "ACTIVE"
                      ? "bg-green-500/20 text-green-700"
                      : "bg-yellow-500/20 text-yellow-700"
                  }
                >
                  {order.license.status}
                </Badge>
              </div>
              {order.license.expiresAt && (
                <>
                  <Separator />
                  <div className="grid gap-2">
                    <div className="text-sm font-medium">Expires</div>
                    <div>
                      {formatDistance(
                        new Date(order.license.expiresAt),
                        new Date(),
                        { addSuffix: true }
                      )}
                    </div>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="text-sm text-muted-foreground">
              No license key has been generated for this order yet.
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Billing Information</CardTitle>
          <CardDescription>Customer billing details</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-4">
            <div className="grid gap-2">
              <div className="text-sm font-medium">Customer</div>
              <div className="space-y-1">
                <div>{order.user.name || "N/A"}</div>
                <div className="text-sm text-muted-foreground">
                  {order.user.email}
                </div>
              </div>
            </div>
            <Separator />
            <div className="grid gap-2">
              <div className="text-sm font-medium">Product</div>
              <div className="space-y-1">
                <div>{order.product.name}</div>
                <div className="text-sm text-muted-foreground">
                  {order.product.plugin.name} v{order.product.plugin.version}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid gap-2">
              <div className="text-sm font-medium">Billing Address</div>
              <div className="space-y-1">
                <div>{order.billingName}</div>
                <div className="text-sm text-muted-foreground">
                  {order.billingAddress}
                  <br />
                  {order.billingCity}, {order.billingState} {order.billingZip}
                  <br />
                  {order.billingCountry}
                </div>
              </div>
            </div>
            <Separator />
            <div className="grid gap-2">
              <div className="text-sm font-medium">Contact</div>
              <div>{order.billingPhone}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
