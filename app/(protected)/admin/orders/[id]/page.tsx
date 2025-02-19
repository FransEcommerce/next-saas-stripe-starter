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
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  // 序列化 Decimal 类型数据
  const serializedOrder = {
    ...order,
    amount: order.amount.toString(),
    subtotal: order.subtotal.toString(),
    discountAmount: order.discountAmount?.toString(),
    tax: order.tax?.toString(),
    affiliateCommission: order.affiliateCommission?.toString(),
    product: {
      ...order.product,
      price: order.product.price.toString(),
      comparePrice: order.product.comparePrice?.toString(),
    },
    coupon: order.coupon ? {
      ...order.coupon,
      value: order.coupon.value.toString(),
      minAmount: order.coupon.minAmount?.toString(),
    } : null,
    affiliate: order.affiliate ? {
      ...order.affiliate,
      commissionValue: order.affiliate.commissionValue.toString(),
      totalEarnings: order.affiliate.totalEarnings.toString(),
    } : null,
  };

  return serializedOrder;
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
          <OrderPayment order={order} />
          <OrderLicense order={order} />
        </div>
      </div>
    </div>
  );
}
