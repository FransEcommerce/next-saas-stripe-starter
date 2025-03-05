import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { OrderStatus } from "./components/OrderStatus";
import { OrderProduct } from "./components/OrderProduct";
import { OrderPayment } from "./components/OrderPayment";
import { OrderCustomer } from "./components/OrderCustomer";
import { OrderLicense } from "./components/OrderLicense";
import { Separator } from "@/components/ui/separator";

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
      coupon: true,
      affiliate: {
        include: {
          user: true,
          paymentMethod: true,
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  // Convert Decimal fields to numbers
  const processedOrder = {
    ...order,
    amount: Number(order.amount.toString()),
    subtotal: order.subtotal ? Number(order.subtotal.toString()) : null, // 确保 subtotal 可以为 null
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
    coupon: order.coupon ? {
      ...order.coupon,
      value: Number(order.coupon.value.toString()),
      minAmount: order.coupon.minAmount ? Number(order.coupon.minAmount.toString()) : null,
    } : null
  };

  return processedOrder;
}

export default async function OrderPage({
  params,
}: {
  params: { id: string };
}) {
  const order = await getOrder(params.id);

  return (
    <div className="flex-1 space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Order #{order.orderNumber}
          </h2>
          <p className="text-muted-foreground">
            View and manage order information
          </p>
        </div>
        <OrderStatus order={order} />
      </div>

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
  );
}
