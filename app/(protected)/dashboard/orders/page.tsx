import { getUserOrders } from "./queries";
import { OrderList } from "./components/order-list";

export default async function OrdersPage() {
    const orders = await getUserOrders();

    if (!orders) {
        return <div>Please login to view your orders.</div>;
    }

    // 处理订单数据，确保与 OrderListProps 类型兼容
    const processedOrders = orders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        amount: Number(order.amount),
        subtotal: Number(order.subtotal),
        discountAmount: order.discountAmount,
        tax: order.tax,
        paymentMethod: order.paymentMethod,
        paymentNote: order.paymentNote,
        paymentProof: order.paymentProof,
        couponId: order.couponId,
        product: {
            ...order.product,
            price: Number(order.product.price),
            comparePrice: order.product.comparePrice,
            plugin: order.product.plugin ? {
                id: order.product.plugin.id,
                name: order.product.plugin.name || "",
                version: order.product.plugin.version || "",
                avatar: order.product.plugin.avatar,
                description: order.product.plugin.description,
            } : null,
        },
        user: {
            name: order.user.name,
            email: order.user.email,
        },
        license: order.license,
    }));

    return (
        <div className="container mx-auto py-6">
            <OrderList orders={processedOrders} />
        </div>
    );
}