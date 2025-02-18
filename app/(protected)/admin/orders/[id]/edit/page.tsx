import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { constructMetadata } from "@/lib/utils";
import { OrderForm } from "../../components/order-form";

export const metadata = constructMetadata({
  title: "Edit Order – Admin Panel",
  description: "Edit order details",
});

interface EditOrderPageProps {
  params: {
    id: string;
  };
}

export default async function EditOrderPage({ params }: EditOrderPageProps) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/login");

  const [order, users, products] = await Promise.all([
    prisma.order.findUnique({
      where: { id: params.id },
    }),
    prisma.user.findMany({
      orderBy: {
        email: "asc",
      },
    }),
    prisma.product.findMany({
      orderBy: {
        name: "asc",
      },
      where: {
        active: true,
      },
    }),
  ]);

  if (!order) redirect("/admin/orders");

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <OrderForm users={users} products={products} order={order} />
    </div>
  );
}
