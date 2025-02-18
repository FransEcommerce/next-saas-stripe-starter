"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { createCoupon, updateCoupon } from "../actions";
import { toast } from "sonner";

const formSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters"),
  type: z.enum(["FIXED", "PERCENTAGE"]),
  value: z.number().min(0),
  active: z.boolean(),
  maxUses: z.number().nullable(),
  minAmount: z.number().nullable(),
  startDate: z.date().nullable(),
  endDate: z.date().nullable(),
});

interface CouponFormProps {
  initialData?: any;
}

export function CouponForm({ initialData }: CouponFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({    
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      code: initialData.code,
      type: initialData.type,
      value: Number(initialData.value),
      active: initialData.active,
      maxUses: initialData.maxUses ? Number(initialData.maxUses) : null,
      minAmount: initialData.minAmount ? Number(initialData.minAmount) : null,
      startDate: initialData.startDate ? new Date(initialData.startDate) : null,
      endDate: initialData.endDate ? new Date(initialData.endDate) : null,
    } : {
      code: "",
      type: "FIXED",
      value: 0,
      active: true,
      maxUses: null,
      minAmount: null,
      startDate: null,
      endDate: null,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      const result = await (initialData
        ? updateCoupon(initialData.id, values)
        : createCoupon(values));

      if (!result.success) {
        throw new Error(result.error || "Failed to save coupon");
      }

      toast.success(initialData ? "Coupon updated successfully" : "Coupon created successfully");
      router.push("/admin/coupons");
      router.refresh();
    } catch (error) {
      console.error("Error saving coupon:", error);
      toast.error("Failed to save coupon");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Coupon Code</FormLabel>
                <FormControl>
                  <div className="flex gap-2">
                    <Input placeholder="Enter coupon code" {...field} />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const randomCode = `SAVE-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
                        field.onChange(randomCode);
                      }}
                    >
                      Generate
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discount Type</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="FIXED" id="fixed" />
                      <Label htmlFor="fixed">Fixed Amount</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="PERCENTAGE" id="percentage" />
                      <Label htmlFor="percentage">Percentage</Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discount Value</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder={form.watch("type") === "FIXED" ? "Enter amount" : "Enter percentage"}
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxUses"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Maximum Uses</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Leave empty for unlimited"
                    value={field.value || ""}
                    onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="minAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum Order Amount</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Leave empty for no minimum"
                    value={field.value || ""}
                    onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="startDate"
            render={({ field: startDateField }) => (
              <FormField
                control={form.control}
                name="endDate"
                render={({ field: endDateField }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Valid Period</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !startDateField.value && !endDateField.value && "text-muted-foreground"
                            )}
                          >
                            {startDateField.value && endDateField.value ? (
                              `${format(startDateField.value, "PPP")} - ${format(endDateField.value, "PPP")}`
                            ) : (
                              <span>Pick a date range</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="range"
                          selected={{
                            from: startDateField.value,
                            to: endDateField.value,
                          }}
                          onSelect={(range) => {
                            startDateField.onChange(range?.from);
                            endDateField.onChange(range?.to);
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          />

          <FormField
            control={form.control}
            name="active"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Active Status</FormLabel>
                  <FormDescription>
                    Enable or disable this coupon
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

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : initialData ? "Update" : "Create"} Coupon
        </Button>
      </form>
    </Form>
  );
}