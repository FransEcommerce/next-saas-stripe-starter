"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useRouter } from "next/navigation";
import { SerializedPlan } from "../queries";
import { createPlan, updatePlan } from "../actions";
import { toast } from "sonner";

const planFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.string().min(1, "Price is required").regex(/^\d+(\.\d{1,2})?$/, "Invalid price format"),
  interval: z.enum(["MONTHLY", "YEARLY"]),
  features: z.string().optional(),
  active: z.boolean().default(true),
  isFree: z.boolean().default(false),
});

type PlanFormValues = z.infer<typeof planFormSchema>;

export function PlanForm({ plan }: { plan?: SerializedPlan }) {
  const router = useRouter();

  const form = useForm<PlanFormValues>({
    resolver: zodResolver(planFormSchema),
    defaultValues: plan ? {
      name: plan.name,
      description: plan.description || "",
      price: plan.price.toString(),
      interval: plan.interval,
      features: plan.features ? JSON.stringify(plan.features) : "",
      active: plan.active,
      isFree: plan.isFree,
    } : {
      name: "",
      description: "",
      price: "",
      interval: "MONTHLY",
      features: "",
      active: true,
      isFree: false,
    },
  });

  async function onSubmit(data: PlanFormValues) {
    try {
      if (data.isFree) {
        // 检查是否已存在免费计划
        const existingFreePlan = plan?.isFree ? 1 : 0;
        if (!plan?.isFree && existingFreePlan > 0) {
          toast.error("Only one free plan is allowed");
          return;
        }
      }

      if (plan) {
        await updatePlan({
          id: plan.id,
          ...data,
          price: parseFloat(data.price),
          features: data.features ? JSON.parse(data.features) : null,
        });
        toast.success("Plan updated successfully");
      } else {
        await createPlan({
          ...data,
          price: parseFloat(data.price),
          features: data.features ? JSON.parse(data.features) : null,
        });
        toast.success("Plan created successfully");
      }

      router.push("/admin/plans");
      router.refresh();
    } catch (error) {
      toast.error("Failed to save plan");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Basic Plan" {...field} />
              </FormControl>
              <FormDescription>
                The name of the subscription plan
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Perfect for small teams..."
                  {...field}
                />
              </FormControl>
              <FormDescription>
                A brief description of the plan
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <Input placeholder="29.99" {...field} />
              </FormControl>
              <FormDescription>
                Monthly/yearly price in USD
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="interval"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Billing Interval</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select billing interval" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="MONTHLY">Monthly</SelectItem>
                  <SelectItem value="YEARLY">Yearly</SelectItem>
                  <SelectItem value="UNLIMITED">Unlimited</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                How often to bill the customer
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="features"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Features (JSON)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder='["Feature 1", "Feature 2"]'
                  {...field}
                />
              </FormControl>
              <FormDescription>
                List of features included in this plan (JSON array)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col gap-6">
          <FormField
            control={form.control}
            name="isFree"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Free Plan</FormLabel>
                  <FormDescription>
                    Set this plan as the free tier (only one free plan allowed)
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="active"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Active</FormLabel>
                  <FormDescription>
                    Whether this plan is currently active
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <Button type="submit">
          {plan ? "Update Plan" : "Create Plan"}
        </Button>
      </form>
    </Form>
  );
}
