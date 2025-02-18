import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { OrderDetails } from "../components/order-details";

async function getOrder(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: true,
      product: {
        include: {
          plugin: true,
        },
      },
      license: true,
    },
  });

  if (!order) {
    notFound();
  }

  return order;
}

export default async function OrderPage({
  params,
}: {
  params: { id: string };
}) {
  const order = await getOrder(params.id);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Order Details</h2>
        <p className="text-muted-foreground">
          View and manage order information
        </p>
      </div>
      <OrderDetails order={order} />
    </div>
  );
}
