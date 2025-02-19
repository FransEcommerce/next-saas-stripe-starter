import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { constructMetadata } from "@/lib/utils";
import { OrdersList } from "./components/orders-list";
import { Button } from "@/components/ui/button";
import { DashboardHeader } from "@/components/dashboard/header";
import { EmptyPlaceholder } from "@/components/shared/empty-placeholder";
import { PlusIcon } from "lucide-react";

export const metadata = constructMetadata({
  title: "Orders – Admin Panel",
  description: "Check and manage your latest orders.",
});

export default async function OrdersPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/login");

  const orders = await prisma.order.findMany({
    include: {
      user: true,
      product: true,
      license: true,
      affiliate: {
        include: {
          user: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Convert Decimal fields to numbers
  const processedOrders = orders.map(order => ({
    ...order,
    amount: Number(order.amount.toString()),
    subtotal: order.subtotal ? Number(order.subtotal.toString()) : null,
    discountAmount: order.discountAmount ? Number(order.discountAmount.toString()) : 0,
    tax: order.tax ? Number(order.tax.toString()) : 0,
    affiliateCommission: order.affiliateCommission ? Number(order.affiliateCommission.toString()) : null,
    product: {
      ...order.product,
      price: Number(order.product.price.toString()),
      comparePrice: order.product.comparePrice ? Number(order.product.comparePrice.toString()) : null,
    },
    affiliate: order.affiliate ? {
      ...order.affiliate,
      commissionValue: Number(order.affiliate.commissionValue.toString()),
      totalEarnings: Number(order.affiliate.totalEarnings.toString())
    } : null,
  }));

  return (
    <>
      <div className="flex items-center justify-between">
        <DashboardHeader
          heading="Orders"
          text="Check and manage your latest orders."
        />
        <Link href="/admin/orders/new" className="mr-4">
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" />
            New Order
          </Button>
        </Link>
      </div>
      <div className="flex-1 space-y-4 pt-6">
        {processedOrders.length > 0 ? (
          <OrdersList orders={processedOrders} />
        ) : (
          <EmptyPlaceholder>
            <EmptyPlaceholder.Icon name="package" />
            <EmptyPlaceholder.Title>No orders yet</EmptyPlaceholder.Title>
            <EmptyPlaceholder.Description>
              You don&apos;t have any orders yet. Create your first order to get started.
            </EmptyPlaceholder.Description>
            <Link href="/admin/orders/new">
              <Button>
                <PlusIcon className="mr-2 h-4 w-4" />
                Create Order
              </Button>
            </Link>
          </EmptyPlaceholder>
        )}
      </div>
    </>
  );
}
