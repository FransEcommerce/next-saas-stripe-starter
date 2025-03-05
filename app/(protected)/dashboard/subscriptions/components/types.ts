export type SubscriptionStatus =
    | "active"
    | "canceled"
    | "incomplete"
    | "incomplete_expired"
    | "past_due"
    | "trialing"
    | "unpaid"
export type PlanInterval = "monthly" | "yearly" | "quarterly"

export interface Service {
    id: string
    name: string
    description: string
    color: string
    limitType: "UNLIMITED" | "DAILY" | "MONTHLY"
    limitValue: number | null
    currentUsage: number
}

export interface Plan {
    id: string
    name: string
    description: string
    price: number
    interval: PlanInterval
    features: string[]
    services: Service[]
}

export interface Subscription {
    id: string
    status: SubscriptionStatus
    startDate: string
    endDate: string | null
    canceledAt?: string
    trialStartDate?: string
    trialEndDate?: string
    currentPeriodStart: string | null
    currentPeriodEnd: string | null
    cancelAtPeriodEnd: boolean
    quantity: number
    priceAmount: number
    currency: string
    plan: Plan
}
