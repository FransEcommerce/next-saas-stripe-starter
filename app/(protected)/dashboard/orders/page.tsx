import { getUserOrders } from "./queries";
import { OrderList } from "./components/order-list";

export default async function OrdersPage() {
    const orders = await getUserOrders();

    if (!orders) {
        return <div>Please login to view your orders.</div>;
    }

    return (
        <div className="container mx-auto py-6">
            <OrderList orders={orders} />
        </div>
    );
}