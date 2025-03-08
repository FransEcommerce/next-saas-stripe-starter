import { CreditCard } from "lucide-react";
import { StatCard } from "./stat-card";

interface SubscriptionsStatCardProps {
  activeSubscriptions: number;
  totalServices: number;
  accessibleServices: number;
}

export function SubscriptionsStatCard({ 
  activeSubscriptions, 
  totalServices, 
  accessibleServices 
}: SubscriptionsStatCardProps) {
  // Calculate the progress percentage based on accessible vs total services
  const progress = totalServices > 0 ? (accessibleServices / totalServices) * 100 : 0;
  
  return (
    <StatCard
      title="Active Subscriptions"
      value={activeSubscriptions}
      description={
        <span>
          Access to <span className="text-green-500">{accessibleServices}</span> services
        </span>
      }
      icon={CreditCard}
      progress={progress}
    />
  );
}
