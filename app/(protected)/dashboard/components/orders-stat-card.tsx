import { ShoppingBag } from "lucide-react";
import { StatCard } from "./stat-card";

interface OrdersStatCardProps {
  totalOrders: number;
  pendingOrders: number;
}

export function OrdersStatCard({ totalOrders, pendingOrders }: OrdersStatCardProps) {
  // Calculate the progress percentage based on completed vs total orders
  const completedOrders = totalOrders - pendingOrders;
  const progress = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;
  
  return (
    <StatCard
      title="My Orders"
      value={totalOrders}
      description={
        pendingOrders > 0 ? (
          <span>
            <span className="text-amber-500">{pendingOrders}</span> processing
          </span>
        ) : (
          <span>All orders completed</span>
        )
      }
      icon={ShoppingBag}
      progress={progress}
    />
  );
}
