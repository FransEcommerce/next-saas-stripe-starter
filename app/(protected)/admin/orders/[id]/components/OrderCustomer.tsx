"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { EditCustomerDialog } from "./EditCustomerDialog";
import { updateOrderCustomer } from "../../actions";
import { toast } from "sonner";

interface OrderCustomerProps {
  order: {
    id: string;
    user: {
      name?: string | null;
      email?: string | null;
    };
    billingCompany?: string | null;
    billingName?: string | null;
    billingAddress?: string | null;
    billingCity?: string | null;
    billingState?: string | null;
    billingCountry?: string | null;
    billingZip?: string | null;
    billingPhone?: string | null;
  };
}

export function OrderCustomer({ order }: OrderCustomerProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleUpdateCustomer = async (data: any) => {
    try {
      await updateOrderCustomer(order.id, data);
      toast.success("Customer information updated");
      window.location.reload();
    } catch (error) {
      console.error("Failed to update customer:", error);
      toast.error("Failed to update customer information");
    }
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

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Customer</CardTitle>
              <CardDescription>Customer and billing information</CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                  Edit customer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-sm font-medium">Contact Information</h3>
              <div className="border-b bg-card p-3 text-card-foreground">
                <div className="space-y-2">
                  <InfoRow label="Name" value={order.user.name} />
                  <InfoRow label="Email" value={order.user.email} />
                </div>
              </div>
            </div>

            {(order.billingName || order.billingCompany || order.billingAddress || order.billingCity || 
              order.billingState || order.billingCountry || order.billingZip || order.billingPhone) && (
              <div className="space-y-1">
                <h3 className="text-sm font-medium">Billing Information</h3>
                <div className="rounded-lg border border-gray-50 bg-card p-3 text-card-foreground bg-muted/50 rounded-xl">
                  <div className="grid gap-2 md:grid-cols-2">
                    <InfoRow label="Name" value={order.billingName} />
                    <InfoRow label="Company" value={order.billingCompany} />
                    <InfoRow label="Address" value={order.billingAddress} />
                    <InfoRow label="City" value={order.billingCity} />
                    <InfoRow label="State" value={order.billingState} />
                    <InfoRow label="Country" value={order.billingCountry} />
                    <InfoRow label="ZIP" value={order.billingZip} />
                    <InfoRow label="Phone" value={order.billingPhone} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <EditCustomerDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        initialData={{
          name: order.user.name || undefined,
          email: order.user.email || undefined,
          billingCompany: order.billingCompany || undefined,
          billingName: order.billingName || undefined,
          billingAddress: order.billingAddress || undefined,
          billingCity: order.billingCity || undefined,
          billingState: order.billingState || undefined,
          billingCountry: order.billingCountry || undefined,
          billingZip: order.billingZip || undefined,
          billingPhone: order.billingPhone || undefined,
        }}
        onSubmit={handleUpdateCustomer}
      />
    </>
  );
}
