"use client"

import Image from "next/image";
import Link from "next/link";
import type { Order } from "@prisma/client";
import { Drawer } from "vaul"
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Download,
  ShoppingBag,
  ChevronUp,
  Copy,
  Eye,
  EyeOff,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { ThankYouViewProps } from "../../components/types"
import { formatPrice } from "@/lib/utils"

function LicenseKeyDisplay({ licenseKey }: { licenseKey: string }) {
  const [isVisible, setIsVisible] = useState(false);

  const maskLicenseKey = (key: string) => {
    return key.replace(/[A-Z0-9]/g, "•");
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(licenseKey);
      toast.success("License key copied to clipboard");
    } catch (err) {
      toast.error("Failed to copy license key");
    }
  };

  return (
    <div className="bg-background p-4 rounded-lg">
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm text-muted-foreground">License Key</p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsVisible(!isVisible)}
            className="p-1 hover:bg-muted rounded-md transition-colors"
            title={isVisible ? "Hide license key" : "Show license key"}
          >
            {isVisible ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
          <button
            onClick={copyToClipboard}
            className="p-1 hover:bg-muted rounded-md transition-colors"
            title="Copy license key"
          >
            <Copy className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>
      <p className="font-mono text-sm bg-muted p-2 rounded overflow-auto">
        {isVisible ? licenseKey : maskLicenseKey(licenseKey)}
      </p>
    </div>
  );
}

function OrderSummarySidebar({ 
  order, 
  isPending 
}: { 
  order: ThankYouViewProps['order']
  isPending: boolean 
}) {
  return (
    <div className={`p-8 rounded-xl text-center ${
      isPending 
        ? "bg-blue-50 dark:bg-blue-950/30" 
        : "bg-green-50 dark:bg-green-950/30"
    }`}>
      <div className={`inline-flex items-center justify-center w-20 h-20 bg-background rounded-full mb-6 shadow-sm`}>
        {isPending ? (
          <Clock className="h-10 w-10 text-blue-600 dark:text-blue-400" />
        ) : (
          <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
        )}
      </div>
      
      <h2 className="text-xl font-bold mb-2">
        {isPending ? "Payment Verification" : "Order Confirmed"}
      </h2>
      
      <p className={`mb-6 ${
        isPending 
          ? "text-blue-700 dark:text-blue-400" 
          : "text-green-700 dark:text-green-400"
      }`}>
        {isPending 
          ? "Your order is being processed. We'll notify you once your payment is verified."
          : "Your license key has been generated and is ready to use."
        }
      </p>

      {isPending ? (
        <div className="space-y-4">
          <div className="bg-background p-4 rounded-lg">
            <h4 className="font-medium mb-2">What happens next?</h4>
            <ol className="text-sm space-y-2 list-decimal list-inside text-muted-foreground">
              <li>Our team reviews your payment proof</li>
              <li>Your payment is verified (1-2 business days)</li>
              <li>Your license key is generated</li>
              <li>You receive an email with download instructions</li>
            </ol>
          </div>

          <div className="bg-background p-4 rounded-lg">
            <h4 className="font-medium mb-2">Need help?</h4>
            <p className="text-sm text-muted-foreground mb-3">
              If you have any questions about your order, please contact our support team.
            </p>
            <Button variant="outline" size="sm" className="w-full">
              Contact Support
            </Button>
          </div>
        </div>
      ) : (
        <>
          {order.license && (
            <div className="space-y-4">
              <LicenseKeyDisplay licenseKey={order.license.licenseKey} />
              
              <div className="bg-background p-4 rounded-lg">
                <h4 className="font-medium mb-2">License Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="font-medium">{order.license.status}</span>
                  </div>
                  {order.license.expiresAt && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Expires:</span>
                      <span className="font-medium">
                        {new Date(order.license.expiresAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-background p-4 rounded-lg">
                <h4 className="font-medium mb-2">Order Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Order Number:</span>
                    <span className="font-medium">#{order.orderNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="font-medium">
                      {formatPrice(order.subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Discount:</span>
                    <span className="font-medium text-green-600 dark:text-green-400">
                      -{formatPrice(order.discountAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-base font-medium">Total:</span>
                    <span className="text-base font-medium">
                      {formatPrice(order.amount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <p className="text-sm text-muted-foreground mt-4">
            A copy of your license key has been sent to your email.
          </p>
        </>
      )}
    </div>
  );
}

export function ThankYouView({ order }: ThankYouViewProps) {
  const isPending = order.status === "PENDING";

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <main className="flex min-h-screen flex-col bg-background">
        {/* Logo */}
        <div className="flex items-center justify-center py-4 border-b">
          <Link href="/" className="relative w-[200px] h-[45px]">
            <Image
              src="/logo.png"
              alt="Logo"
              fill
              className="object-contain dark:hidden"
              priority
            />
            <Image
              src="/logo-white.png"
              alt="Logo"
              fill
              className="object-contain hidden dark:block"
              priority
            />
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md px-6">
            <div className="mb-8 text-center">
              <div
                className={`mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full ${
                  isPending ? "bg-blue-100" : "bg-green-100"
                }`}
              >
                {isPending ? (
                  <Clock className="h-8 w-8 text-blue-600" />
                ) : (
                  <CheckCircle className="h-8 w-8 text-green-600" />
                )}
              </div>
              <h1 className="mb-2 text-2xl font-bold">
                {isPending ? "Payment Being Processed" : "Payment Successful!"}
              </h1>
              <p className="text-muted-foreground">
                {isPending
                  ? "Thank you for your order. We've received your payment proof and our team is currently reviewing it."
                  : "Thank you for your purchase. Your order has been processed successfully."}
              </p>
            </div>

            {/* Product Info */}
            <div className="mb-6 flex items-center gap-3 rounded-lg bg-muted/30 p-4">
              <Image
                src={order.product.plugin.avatar || ""}
                alt={order.product.name}
                width={48}
                height={48}
                className="rounded-lg"
              />
              <div className="text-left">
                <h3 className="font-medium">{order.product.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Version {order.product.plugin.version}
                </p>
              </div>
            </div>

            {/* Order Status Info */}
            {isPending ? (
              <div className="mb-6 rounded-lg bg-blue-50 dark:bg-blue-950 p-4">
                <h4 className="mb-2 font-medium">Order Status</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="font-medium text-blue-700 dark:text-blue-400">
                      Pending Payment Verification
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Order Number:</span>
                    <span className="font-medium dark:text-foreground">#{order.orderNumber}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Estimated Processing Time:
                    </span>
                    <span className="font-medium dark:text-foreground">1-2 business days</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* <Button className="w-full" size="lg">
                  <Download className="mr-2 h-4 w-4" />
                  Download Plugin
                </Button> */}
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              <Button variant="outline" className="w-full">
                <Link
                  href="/dashboard/orders"
                  className="flex items-center"
                >
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  View My Order
                </Link>
              </Button>

              <Button variant="ghost" className="w-full">
                <Link href="/dashboard/plugins" className="flex items-center">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Return to Marketplace
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Order Summary Drawer */}
        <Drawer.Root>
          <div className="md:hidden sticky bottom-0 left-0 right-0 border-t bg-background/80 backdrop-blur-md shadow-sm">
            <Drawer.Trigger asChild>
              <button className="w-full p-4 flex flex-col items-center">
                <div className="flex justify-between w-full max-w-md mx-auto">
                  <span className="text-sm font-medium">Order Summary</span>
                  <div className="flex items-center">
                    <span className="font-medium mr-2">
                      {formatPrice(order.amount)}
                    </span>
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </button>
            </Drawer.Trigger>
          </div>

          <Drawer.Overlay className="fixed inset-0 z-40 bg-black/40" />
          <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 mt-24 flex h-[96%] flex-col rounded-t-[10px] bg-background">
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted my-4" />
            <div className="flex-1 overflow-y-auto rounded-t-[10px] bg-background px-6">
              <div className="mx-auto max-w-md">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Order Summary</h3>
                  <Drawer.Close className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
                    <Button variant="ghost" size="icon">
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </Drawer.Close>
                </div>
                <OrderSummarySidebar order={order} isPending={isPending} />
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Root>
      </main>

      {/* Desktop Order Summary Sidebar */}
      <aside className="hidden md:block relative border-l bg-muted/10">
        <div className="sticky top-0 h-screen flex items-center justify-center p-8">
          <div className="max-w-sm w-full">
            <OrderSummarySidebar order={order} isPending={isPending} />
          </div>
        </div>
      </aside>
    </div>
  );
}
