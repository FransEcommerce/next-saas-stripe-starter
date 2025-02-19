"use client";

import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Copy, Eye, EyeOff, ExternalLink, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";

interface OrderLicenseProps {
  order: {
    license?: {
      id: string;
      licenseKey: string;
      status: string;
      domain?: string | null;
      activatedAt?: Date | null;
      expiresAt?: Date | null;
    } | null;
    product: {
      plugin: {
        name: string;
        version: string;
      };
    };
  };
}

export function OrderLicense({ order }: OrderLicenseProps) {
  const { license } = order;

  if (!license) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>License</CardTitle>
          <CardDescription>License information and status</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No license found</p>
        </CardContent>
      </Card>
    );
  }

  const [showLicenseKey, setShowLicenseKey] = useState(false);

  const copyLicenseKey = () => {
    navigator.clipboard.writeText(license.licenseKey);
    toast.success("License key copied to clipboard");
  };

  const toggleLicenseKeyVisibility = () => {
    setShowLicenseKey(!showLicenseKey);
  };

  const maskLicenseKey = (key: string) => {
    return key.replace(/[A-Z0-9]/g, "•");
  };

  const InfoRow = ({ label, value }: { label: string; value: string | null | undefined }) => {
    if (!value) return null;
    return (
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}</span>
      </div>
    );
  };

  const DateRow = ({ label, date }: { label: string; date: Date | null | undefined }) => {
    if (!date) return null;
    return (
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{format(date, "PPP")}</span>
      </div>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-500/20 text-green-700";
      case "inactive":
        return "bg-yellow-500/20 text-yellow-700";
      case "expired":
        return "bg-red-500/20 text-red-700";
      default:
        return "bg-gray-500/20 text-gray-700";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>License</CardTitle>
            <CardDescription>License information and status</CardDescription>
          </div>
          <Badge className={cn("capitalize", getStatusColor(license.status))}>
            {license.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <InfoRow label="Plugin" value={`${order.product.plugin.name}`} />
            <InfoRow label="Version" value={`v${order.product.plugin.version}`} />
            <InfoRow label="Domain" value={license.domain || "Not activated"} />
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">License Key</span>
                <div className="mt-1 flex items-center gap-2">
                  <code className="flex rounded-md bg-muted/50 border px-3 py-1 text-sm font-mono tracking-wider">
                    {showLicenseKey ? (
                      <span className="text-primary">{license.licenseKey}</span>
                    ) : (
                      <span className="text-muted-foreground">{maskLicenseKey(license.licenseKey)}</span>
                    )}
                  </code>
                </div>
              </div>
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-muted"
                  onClick={toggleLicenseKeyVisibility}
                >
                  {showLicenseKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-muted"
                  onClick={copyLicenseKey}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <DateRow label="Activated" date={license.activatedAt} />
            <DateRow label="Expires" date={license.expiresAt} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
