import { getUserOrders } from "./queries";
import { OrderList } from "./components/order-list";

export default async function OrdersPage() {
    const orders = await getUserOrders();

    if (!orders) {
        return <div>Please login to view your orders.</div>;
    }

    // Convert Decimal fields to numbers
    const processedOrders = orders.map((order) => ({
        ...order,
        amount: Number(order.amount.toString()),
        product: {
            ...order.product,
            plugin: {
                ...order.product.plugin,
            },
        },
    }));

    return (
        <div className="container mx-auto py-6">
            <OrderList orders={processedOrders} />
        </div>
    );
}