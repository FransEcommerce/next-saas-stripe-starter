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
    },
    orderBy: {
      createdAt: "desc",
    },
  });

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
        {orders.length > 0 ? (
          <OrdersList orders={orders} />
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
