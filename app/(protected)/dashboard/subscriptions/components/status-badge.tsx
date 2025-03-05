import { Badge } from "@/components/ui/badge"
import type { SubscriptionStatus } from "./types"

interface StatusBadgeProps {
    status: SubscriptionStatus
    className?: string
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
    switch (status.toLowerCase()) {
        case "active":
            return <Badge className={`bg-green-500 hover:bg-green-600 ${className}`}>Active</Badge>
        case "trialing":
            return <Badge className={`bg-blue-500 hover:bg-blue-600 ${className}`}>Trial</Badge>
        case "canceled":
            return (
                <Badge variant="destructive" className={className}>
                    Canceled
                </Badge>
            )
        case "past_due":
            return (
                <Badge variant="destructive" className={className}>
                    Past Due
                </Badge>
            )
        case "unpaid":
            return (
                <Badge variant="destructive" className={className}>
                    Unpaid
                </Badge>
            )
        case "incomplete":
            return (
                <Badge variant="outline" className={`text-yellow-600 border-yellow-600 ${className}`}>
                    Incomplete
                </Badge>
            )
        case "incomplete_expired":
            return (
                <Badge variant="destructive" className={className}>
                    Expired
                </Badge>
            )
        default:
            return (
                <Badge variant="secondary" className={className}>
                    {status}
                </Badge>
            )
    }
}
