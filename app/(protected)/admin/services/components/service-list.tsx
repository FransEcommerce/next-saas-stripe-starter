"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ServiceDialog } from "./service-dialog";
import { useState } from "react";
import { deleteService } from "../actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MoreHorizontal, Plus, Trash, Pencil } from "lucide-react";
import { toast } from "sonner";

interface ServiceListProps {
  services: any[];
  availableServices: any[];
  availablePlans: any[];
}

export function ServiceList({
  services = [],
  availableServices,
  availablePlans,
}: ServiceListProps) {
  const [selectedService, setSelectedService] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleEdit = (service: any) => {
    setSelectedService(service);
    setDialogOpen(true);
  };

  const renderPlanLimits = (service: any) => {
    if (!service.planLimits || service.planLimits.length === 0) {
      return "No limits set";
    }

    return service.planLimits.map((limit: any) => (
      <div key={limit.planId} className="flex items-center space-x-2">
        <span className="font-medium">{limit.plan?.name || 'Unknown Plan'}:</span>
        <span>
          {limit.limitType === "UNLIMITED" 
            ? "Unlimited" 
            : `${limit.limitValue} per ${limit.limitType.toLowerCase()}`}
        </span>
      </div>
    ));
  };

  if (!services || services.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center p-8 text-center">
        <CardHeader>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mx-auto mb-4">
            <Plus className="h-6 w-6" />
          </div>
          <CardTitle>No services created</CardTitle>
          <CardDescription>
            You haven&apos;t created any services yet. Start by creating your first service.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Service
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Handler</TableHead>
              <TableHead>Plans & Limits</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map((service) => (
              <TableRow key={service.id}>
                <TableCell className="font-medium">{service.name}</TableCell>
                <TableCell>{service.handlerId}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {renderPlanLimits(service)}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={service.active ? "default" : "secondary"}
                  >
                    {service.active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>{service.usageCount || 0}</TableCell>
                <TableCell className="text-right">
                  <AlertDialog>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(service)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem className="text-destructive">
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Service</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this service? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={async () => {
                            try {
                              const result = await deleteService(service.id);
                              if (result.success) {
                                toast.success(result.message);
                              } else {
                                toast.error(result.message);
                              }
                            } catch (error) {
                              console.error("Failed to delete service:", error);
                              toast.error("An unexpected error occurred");
                            }
                          }}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ServiceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        service={selectedService}
        availableServices={availableServices}
        availablePlans={availablePlans}
      />
    </div>
  );
}
