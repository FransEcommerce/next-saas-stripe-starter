export type SubscriptionStatus =
  | "TRIALING"
  | "ACTIVE"
  | "PAST_DUE"
  | "CANCELED"
  | "INCOMPLETE"
  | "INCOMPLETE_EXPIRED"
  | "UNPAID"
  | "EXPIRED";

export const SUBSCRIPTION_STATUSES: SubscriptionStatus[] = [
  "TRIALING",
  "ACTIVE",
  "PAST_DUE",
  "CANCELED",
  "INCOMPLETE",
  "INCOMPLETE_EXPIRED",
  "UNPAID",
  "EXPIRED",
];

export function getStatusLabel(status: SubscriptionStatus): string {
  const statusMap: Record<SubscriptionStatus, string> = {
    TRIALING: "Trial Period",
    ACTIVE: "Active",
    PAST_DUE: "Past Due",
    CANCELED: "Canceled",
    INCOMPLETE: "Incomplete",
    INCOMPLETE_EXPIRED: "Incomplete Expired",
    UNPAID: "Unpaid",
    EXPIRED: "Expired",
  };
  return statusMap[status];
}

export function getStatusColor(status: SubscriptionStatus): {
  background: string;
  text: string;
} {
  const colorMap: Record<SubscriptionStatus, { background: string; text: string }> = {
    TRIALING: { background: "bg-blue-100", text: "text-blue-800" },
    ACTIVE: { background: "bg-green-100", text: "text-green-800" },
    PAST_DUE: { background: "bg-yellow-100", text: "text-yellow-800" },
    CANCELED: { background: "bg-red-100", text: "text-red-800" },
    INCOMPLETE: { background: "bg-orange-100", text: "text-orange-800" },
    INCOMPLETE_EXPIRED: { background: "bg-gray-100", text: "text-gray-800" },
    UNPAID: { background: "bg-red-100", text: "text-red-800" },
    EXPIRED: { background: "bg-gray-100", text: "text-gray-800" },
  };
  return colorMap[status];
}
