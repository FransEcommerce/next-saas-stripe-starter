"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ServiceBasicForm } from "./service-basic-form";
import { ServicePlansForm } from "./service-plans-form";
import { ServiceConfigForm } from "./service-config-form";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { createService, updateService } from "../actions";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  handlerId: z.string().min(1, "Handler is required"),
  active: z.boolean().default(true),
  color: z.string().default("#1C9488"),
  planLimits: z.array(z.object({
    planId: z.string(),
    enabled: z.boolean(),
    limitType: z.enum(["UNLIMITED", "DAILY", "MONTHLY"]),
    limitValue: z.number().nullable(),
  })),
  config: z.record(z.any()),
});

interface ServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service?: any;
  availableServices: any[];
  availablePlans: any[];
}

export function ServiceDialog({
  open,
  onOpenChange,
  service,
  availableServices,
  availablePlans,
}: ServiceDialogProps) {
  const [selectedHandler, setSelectedHandler] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      handlerId: "",
      active: true,
      color: "#1C9488",
      planLimits: availablePlans.map(plan => ({
        planId: plan.id,
        enabled: false,
        limitType: "UNLIMITED",
        limitValue: null,
      })),
      config: {},
    },
  });

  useEffect(() => {
    if (open) {
      if (service) {
        const values = {
          name: service.name,
          description: service.description || "",
          handlerId: service.handlerId,
          active: service.active,
          color: service.color || "#1C9488",
          planLimits: availablePlans.map(plan => {
            const existingLimit = service.planLimits.find((l: any) => l.planId === plan.id);
            return {
              planId: plan.id,
              enabled: !!existingLimit,
              limitType: existingLimit?.limitType || "UNLIMITED",
              limitValue: existingLimit?.limitValue || null,
            };
          }),
          config: service.config || {},
        };
        form.reset(values);
        const handler = availableServices.find(h => h.id === service.handlerId);
        setSelectedHandler(handler);
      } else {
        form.reset({
          name: "",
          description: "",
          handlerId: "",
          active: true,
          color: "#1C9488",
          planLimits: availablePlans.map(plan => ({
            planId: plan.id,
            enabled: false,
            limitType: "UNLIMITED",
            limitValue: null,
          })),
          config: {},
        });
        setSelectedHandler(null);
      }
    }
  }, [service, open, form, availablePlans, availableServices]);

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      const formattedValues = {
        ...values,
        planLimits: values.planLimits.filter(limit => limit.enabled),
      };

      const result = service 
        ? await updateService(service.id, formattedValues)
        : await createService(formattedValues);

      if (result.success) {
        toast.success(result.message);
        onOpenChange(false);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Failed to submit:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHandlerChange = (handlerId: string) => {
    const handler = availableServices.find(service => service.id === handlerId);
    setSelectedHandler(handler);
    if (handler) {
      form.setValue("config", {});
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90%] h-[90%] p-0">
        <div className="flex h-full">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col h-full w-full">
              <div className="flex items-center justify-between border-b p-4">
                <div>
                  <h2 className="text-lg font-semibold">
                    {service ? "Edit Service" : "Create Service"}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Configure your service settings and limits
                  </p>
                </div>
                <div className="flex items-center gap-2 pr-12">
                  <Button type="submit" size="sm" disabled={isSubmitting}>
                    {isSubmitting ? (
                      "Loading..."
                    ) : service ? (
                      "Save changes"
                    ) : (
                      "Create service"
                    )}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-3 h-full">
                <div className="border-r p-6">
                  <ServiceBasicForm
                    form={form}
                    availableServices={availableServices}
                    onHandlerChange={handleHandlerChange}
                  />
                </div>

                <div className="border-r p-6">
                  <ServicePlansForm
                    form={form}
                    availablePlans={availablePlans}
                  />
                </div>

                <div className="bg-muted/50 p-6">
                  <ServiceConfigForm
                    form={form}
                    selectedHandler={selectedHandler}
                  />
                </div>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
