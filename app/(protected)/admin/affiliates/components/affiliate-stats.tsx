"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";

interface AffiliateStatsProps {
  stats: {
    pendingAmount: number;
    paidAmount: number;
    totalAmount: number;
    currency: string;
  };
}

export function AffiliateStats({ stats }: AffiliateStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Pending Commission
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatPrice(stats.pendingAmount)}
          </div>
          <p className="text-xs text-muted-foreground">
            Awaiting payment processing
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Paid Commission
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatPrice(stats.paidAmount)}
          </div>
          <p className="text-xs text-muted-foreground">
            Total paid to date
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Commission
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatPrice(stats.totalAmount)}
          </div>
          <p className="text-xs text-muted-foreground">
            Including pending and processing
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
