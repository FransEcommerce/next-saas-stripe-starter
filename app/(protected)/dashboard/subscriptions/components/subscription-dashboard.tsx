"use client"

import { useState } from "react"
import { format, parseISO } from "date-fns"
import { Package, CheckCircle2, Clock, Shield, Zap } from "lucide-react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"

import type { Subscription } from "./types"
import { StatusBadge } from "./status-badge"
import { Badge } from "@/components/ui/badge"

interface SubscriptionDashboardProps {
    initialSubscriptions: Subscription[]
}

export function SubscriptionDashboard({ initialSubscriptions }: SubscriptionDashboardProps) {
    const [subscriptions] = useState(initialSubscriptions)

    // Format currency based on locale and currency code
    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currency,
        }).format(amount)
    }

    // Format the interval for display
    const formatInterval = (interval: string) => {
        switch (interval) {
            case "monthly":
                return "/month"
            case "yearly":
                return "/year"
            case "quarterly":
                return "/quarter"
            default:
                return `/${interval}`
        }
    }

    // Calculate days remaining in trial or current period
    const getDaysRemaining = (endDate: string) => {
        const end = parseISO(endDate)
        const now = new Date()
        const diffTime = end.getTime() - now.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays > 0 ? diffDays : 0
    }

    // 获取服务使用情况
    const getServiceUsage = (serviceId: string) => {
        const service = subscriptions
            .flatMap(sub => sub.plan.services)
            .find(s => s.id === serviceId);

        if (!service) {
            return { current: 0, limit: null };
        }

        return {
            current: service.currentUsage || 0,
            limit: service.limitValue
        };
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">My Subscriptions</h1>
                <p className="text-muted-foreground">Manage your subscription plans and services</p>
            </div>

            <div className="grid gap-8">
                {subscriptions.length > 0 ? (
                    subscriptions.map((subscription) => (
                        <Card
                            key={subscription.id}
                            className="overflow-hidden border bg-gradient-to-br from-background to-muted/30"
                        >
                            <div className="grid md:grid-cols-[1fr_350px]">
                                <div className="p-8">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 rounded-full bg-primary/10">
                                            <Package className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold">{subscription.plan.name}</h2>
                                            <p className="text-muted-foreground">{subscription.plan.description}</p>
                                        </div>
                                        <StatusBadge status={subscription.status} className="ml-auto" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-6 mb-8">
                                        <div className="space-y-1.5">
                                            <div className="text-sm text-muted-foreground">Billing Period</div>
                                            <div className="font-medium text-xs sm:text-base">
                                                {subscription.currentPeriodStart && subscription.currentPeriodEnd ? (
                                                    <>
                                                        {format(new Date(Date.parse(subscription.currentPeriodStart)), "MM/dd/yyyy")} -{" "}
                                                        {format(new Date(Date.parse(subscription.currentPeriodEnd)), "MM/dd/yyyy")}
                                                    </>
                                                ) : (
                                                    "No billing period (Free Plan)"
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <div className="text-sm text-muted-foreground">
                                                {subscription.cancelAtPeriodEnd ? "Cancels On" : "Renews On"}
                                            </div>
                                            <div className="font-medium text-xs sm:text-base">
                                                {subscription.currentPeriodEnd ? (
                                                    format(new Date(subscription.currentPeriodEnd), "MM/dd/yyyy")
                                                ) : (
                                                    "N/A (Free Plan)"
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-8">
                                        <h3 className="text-sm font-medium">Included Services</h3>
                                        <div className="grid gap-3">
                                            {subscription.plan.services.map((service) => {
                                                const usage = getServiceUsage(service.id);
                                                const hasLimit = service.limitType !== "UNLIMITED" && service.limitValue !== null;
                                                const usagePercentage = hasLimit
                                                    ? Math.min(Math.round((usage.current / usage.limit!) * 100), 100)
                                                    : null;

                                                return (
                                                    <div
                                                        key={service.id}
                                                        className="flex flex-col p-4 rounded-xl bg-card dark:bg-card/50 border shadow-sm"
                                                    >
                                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                                                            <div className="flex items-center gap-3">
                                                                <div
                                                                    className="w-2 h-10 rounded-full shrink-0 border"
                                                                    style={{ backgroundColor: service.color }}
                                                                />
                                                                <div>
                                                                    <div className="font-medium text-sm sm:text-base">{service.name}</div>
                                                                    <div className="text-xs sm:text-sm text-muted-foreground">
                                                                        {service.description}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="self-start sm:self-center">
                                                                <Badge variant="default" className="text-[8px] sm:text-xs font-normal">
                                                                    {service.limitType === "DAILY" ? (
                                                                        "Based on today's usage"
                                                                    ) : service.limitType === "MONTHLY" ? (
                                                                        subscription.currentPeriodStart && subscription.currentPeriodEnd ? (
                                                                            `Usage from ${new Date(subscription.currentPeriodStart).toLocaleDateString()} to ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
                                                                        ) : (
                                                                            `Usage from ${new Date(new Date().setDate(1)).toLocaleDateString()} to ${new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toLocaleDateString()}`
                                                                        )
                                                                    ) : (
                                                                        "Unlimited usage"
                                                                    )}
                                                                </Badge>
                                                            </div>
                                                        </div>

                                                        {hasLimit ? (
                                                            <div className="mt-4">
                                                                <div className="flex justify-between text-xs sm:text-sm mb-1.5">
                                                                    <span className="text-muted-foreground">Usage</span>
                                                                    <span className="font-medium">
                                                                        {usage.current} / {service.limitValue}
                                                                    </span>
                                                                </div>
                                                                <Progress
                                                                    value={usagePercentage!}
                                                                    className="h-1.5"
                                                                    style={{
                                                                        backgroundColor: usagePercentage! > 90
                                                                            ? "bg-red-500"
                                                                            : usagePercentage! > 75
                                                                                ? "bg-amber-500"
                                                                                : "bg-primary",
                                                                    }}
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="mt-4">
                                                                <div className="flex justify-between text-xs sm:text-sm mb-1.5">
                                                                    <span className="text-muted-foreground">Usage</span>
                                                                    <span className="font-medium">
                                                                        {usage.current} / UNLIMITED
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {subscription.status === "trialing" && subscription.trialEndDate && (
                                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 flex items-center gap-4 border border-blue-200">
                                            <div className="p-3 rounded-full bg-blue-100 border border-blue-200">
                                                <Clock className="h-6 w-6 text-blue-600" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-blue-800">Trial Period Active</div>
                                                <div className="text-sm text-blue-600">
                                                    Your trial ends in {getDaysRemaining(subscription.trialEndDate)} days on{" "}
                                                    {format(parseISO(subscription.trialEndDate), "MM/dd/yyyy")}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-8 flex flex-col justify-between border-l">
                                    <div>
                                        <div className="text-3xl font-bold mb-1 flex items-baseline">
                                            {formatCurrency(subscription.priceAmount, subscription.currency)}
                                            <span className="text-base font-normal text-muted-foreground ml-1">
                                                {formatInterval(subscription.plan.interval)}
                                            </span>
                                        </div>

                                        <div className="text-sm text-muted-foreground mb-8">
                                            Next billing date: {subscription.currentPeriodEnd ? (
                                                format(new Date(subscription.currentPeriodEnd), "MM/dd/yyyy")
                                            ) : (
                                                "N/A (Free Plan)"
                                            )}
                                        </div>

                                        <div className="space-y-5 mb-8">
                                            <h3 className="text-sm font-medium">Plan Features</h3>
                                            <ul className="space-y-3">
                                                {(subscription.plan.features || []).slice(0, 2).map((feature, index) => (
                                                    <li key={index} className="flex items-start gap-3 text-sm">
                                                        <div className="p-1 rounded-full bg-primary/10 mt-0.5">
                                                            <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                                                        </div>
                                                        <span>{feature}</span>
                                                    </li>
                                                ))}
                                                {(subscription.plan.features || []).length > 2 && (
                                                    <li className="text-sm text-muted-foreground pl-7">
                                                        +{(subscription.plan.features || []).length - 2} more features
                                                    </li>
                                                )}
                                            </ul>
                                        </div>

                                        {/* <div className="grid grid-cols-2 gap-4 mb-8">
                                            <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/80 border shadow-sm">
                                                <Shield className="h-5 w-5 text-primary mb-2" />
                                                <div className="text-sm font-medium">Premium Support</div>
                                            </div>
                                            <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/80 border shadow-sm">
                                                <Zap className="h-5 w-5 text-primary mb-2" />
                                                <div className="text-sm font-medium">Priority Access</div>
                                            </div>
                                        </div> */}
                                    </div>

                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button size="lg" className="w-full">
                                                View Details
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[1300px] max-h-[90vh] overflow-y-auto p-6">
                                            <div className="grid gap-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-full bg-primary/10">
                                                        <Package className="h-5 w-5 text-primary" />
                                                    </div>
                                                    <div>
                                                        <h2 className="text-lg sm:text-xl font-bold">{subscription.plan.name}</h2>
                                                        <p className="text-sm text-muted-foreground">{subscription.plan.description}</p>
                                                    </div>
                                                </div>

                                                <div className="grid md:grid-cols-2 gap-6">
                                                    <div className="space-y-6">
                                                        <div className="space-y-4 p-4 rounded-lg border bg-background/50">
                                                            <h3 className="text-sm font-medium">Subscription Details</h3>
                                                            <div className="grid grid-cols-2 gap-3 text-sm">
                                                                <div className="space-y-1">
                                                                    <p className="text-muted-foreground">Status</p>
                                                                    <StatusBadge status={subscription.status}/>
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <p className="text-muted-foreground">Price</p>
                                                                    <p className="font-medium">
                                                                        {formatCurrency(subscription.priceAmount, subscription.currency)}
                                                                        <span className="text-muted-foreground ml-1">
                                                                            {formatInterval(subscription.plan.interval)}
                                                                        </span>
                                                                    </p>
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <p className="text-muted-foreground">Start Date</p>
                                                                    <p className="font-medium">
                                                                        {format(parseISO(subscription.startDate), "MM/dd/yyyy")}
                                                                    </p>
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <p className="text-muted-foreground">Current Period</p>
                                                                    <p className="font-medium">
                                                                        {subscription.currentPeriodStart && subscription.currentPeriodEnd ? (
                                                                            <>
                                                                                {format(new Date(Date.parse(subscription.currentPeriodStart)), "MM/dd/yyyy")} -{" "}
                                                                                {format(new Date(Date.parse(subscription.currentPeriodEnd)), "MM/dd/yyyy")}
                                                                            </>
                                                                        ) : (
                                                                            "No billing period (Free Plan)"
                                                                        )}
                                                                    </p>
                                                                </div>
                                                                {subscription.status === "trialing" && subscription.trialEndDate && (
                                                                    <>
                                                                        <div className="space-y-1">
                                                                            <p className="text-muted-foreground">Trial Period</p>
                                                                            <p className="font-medium">
                                                                                {format(parseISO(subscription.trialStartDate!), "MM/dd/yyyy")} -{" "}
                                                                                {format(parseISO(subscription.trialEndDate), "MM/dd/yyyy")}
                                                                            </p>
                                                                        </div>
                                                                        <div className="space-y-1">
                                                                            <p className="text-muted-foreground">Trial Status</p>
                                                                            <p className="font-medium text-blue-600">
                                                                                {getDaysRemaining(subscription.trialEndDate)} days remaining
                                                                            </p>
                                                                        </div>
                                                                    </>
                                                                )}
                                                                <div className="space-y-1">
                                                                    <p className="text-muted-foreground">Renewal</p>
                                                                    <p className="font-medium">
                                                                        {subscription.cancelAtPeriodEnd ? "Cancels on " : "Renews on "}
                                                                        {subscription.currentPeriodEnd ? (
                                                                            format(new Date(subscription.currentPeriodEnd), "MM/dd/yyyy")
                                                                        ) : (
                                                                            "N/A (Free Plan)"
                                                                        )}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-4 p-4 rounded-lg border bg-background/50">
                                                            <h3 className="text-sm font-medium">Plan Features</h3>
                                                            <ul className="grid grid-cols-1 gap-2">
                                                                {(subscription.plan.features || []).map((feature, index) => (
                                                                    <li key={index} className="flex items-center gap-2 text-sm">
                                                                        <div className="p-1 rounded-full bg-primary/10">
                                                                            <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                                                                        </div>
                                                                        {feature}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-6">
                                                        <div className="grid gap-3">
                                                            <h3 className="text-sm font-medium">Included Services</h3>
                                                            <div className="grid gap-3">
                                                                {subscription.plan.services.map((service) => {
                                                                    const usage = getServiceUsage(service.id);
                                                                    const hasLimit = service.limitType !== "UNLIMITED" && service.limitValue !== null;
                                                                    const usagePercentage = hasLimit
                                                                        ? Math.min(Math.round((usage.current / usage.limit!) * 100), 100)
                                                                        : null;

                                                                    return (
                                                                        <div
                                                                            key={service.id}
                                                                            className="flex flex-col p-4 rounded-xl bg-card dark:bg-card/50 border shadow-sm"
                                                                        >
                                                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                                                                                <div className="flex items-center gap-3">
                                                                                    <div
                                                                                        className="w-2 h-10 rounded-full shrink-0 border"
                                                                                        style={{ backgroundColor: service.color }}
                                                                                    />
                                                                                    <div>
                                                                                        <div className="font-medium text-sm sm:text-base">{service.name}</div>
                                                                                        <div className="text-xs sm:text-sm text-muted-foreground">
                                                                                            {service.description}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="self-start sm:self-center">
                                                                                    <Badge variant="default" className="text-[8px] sm:text-xs font-normal">
                                                                                        {service.limitType === "DAILY" ? (
                                                                                            "Based on today's usage"
                                                                                        ) : service.limitType === "MONTHLY" ? (
                                                                                            subscription.currentPeriodStart && subscription.currentPeriodEnd ? (
                                                                                                `Usage from ${new Date(subscription.currentPeriodStart).toLocaleDateString()} to ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
                                                                                            ) : (
                                                                                                `Usage from ${new Date(new Date().setDate(1)).toLocaleDateString()} to ${new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toLocaleDateString()}`
                                                                                            )
                                                                                        ) : (
                                                                                            "Unlimited usage"
                                                                                        )}
                                                                                    </Badge>
                                                                                </div>
                                                                            </div>

                                                                            {hasLimit ? (
                                                                                <div className="mt-4">
                                                                                    <div className="flex justify-between text-xs sm:text-sm mb-1.5">
                                                                                        <span className="text-muted-foreground">Usage</span>
                                                                                        <span className="font-medium">
                                                                                            {usage.current} / {service.limitValue}
                                                                                        </span>
                                                                                    </div>
                                                                                    <Progress
                                                                                        value={usagePercentage!}
                                                                                        className="h-1.5"
                                                                                        style={{
                                                                                            backgroundColor: usagePercentage! > 90
                                                                                                ? "bg-red-500"
                                                                                                : usagePercentage! > 75
                                                                                                    ? "bg-amber-500"
                                                                                                    : "bg-primary",
                                                                                        }}
                                                                                    />
                                                                                </div>
                                                                            ) : (
                                                                                <div className="mt-4">
                                                                                    <div className="flex justify-between text-xs sm:text-sm mb-1.5">
                                                                                        <span className="text-muted-foreground">Usage</span>
                                                                                        <span className="font-medium">
                                                                                            {usage.current} / UNLIMITED
                                                                                        </span>
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>
                        </Card>
                    ))
                ) : (
                    <Card className="border bg-gradient-to-br from-background to-muted/30">
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="p-4 rounded-full bg-primary/10 mb-4">
                                <Package className="h-10 w-10 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">No Active Subscriptions</h3>
                            <p className="text-muted-foreground mb-8 max-w-md">
                                You don't have any active subscriptions at the moment. Browse our plans to get started.
                            </p>
                            <Button size="lg" variant="outline" disabled>Coming Soon</Button>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    )
}
