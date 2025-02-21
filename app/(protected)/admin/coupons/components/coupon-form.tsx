"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { createCoupon, updateCoupon } from "../actions";
import { toast } from "sonner";
import { Check, ChevronsUpDown } from "lucide-react";

const formSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters"),
  type: z.enum(["FIXED", "PERCENTAGE"]),
  value: z.number().min(0),
  active: z.boolean(),
  maxUses: z.number().nullable(),
  minAmount: z.number().nullable(),
  startDate: z.date().nullable(),
  endDate: z.date().nullable(),
  affiliateId: z.string().nullable(),
});

interface CouponFormProps {
  initialData?: any;
  affiliates?: Array<{
    id: string;
    user: {
      name: string;
      email: string;
    };
    referralCode: string;
  }>;
}

export function CouponForm({ initialData, affiliates = [] }: CouponFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

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
      affiliateId: initialData.affiliateId,
    } : {
      code: "",
      type: "FIXED",
      value: 0,
      active: true,
      maxUses: null,
      minAmount: null,
      startDate: null,
      endDate: null,
      affiliateId: null,
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Input Fields */}
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
                        const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
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
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="FIXED">Fixed Amount ($)</SelectItem>
                    <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                  </SelectContent>
                </Select>
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
            name="affiliateId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Affiliate</FormLabel>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-full justify-between",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          (affiliates || []).find((affiliate) => affiliate.id === field.value)?.user.name ||
                          "Select affiliate"
                        ) : (
                          "Select affiliate"
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command>
                      <CommandInput placeholder="Search affiliate..." />
                      <CommandEmpty>No affiliate found.</CommandEmpty>
                      <CommandGroup>
                        {(affiliates || []).map((affiliate) => (
                          <CommandItem
                            key={affiliate.id}
                            value={affiliate.user.name}
                            onSelect={() => {
                              form.setValue("affiliateId", affiliate.id);
                              setOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                field.value === affiliate.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div className="flex flex-col">
                              <span>{affiliate.user.name}</span>
                              <span className="text-sm text-muted-foreground">
                                {affiliate.user.email}
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Options Row */}
        <div className="flex items-center space-x-6">
          <div className="md:col-span-3">
            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Active Status</FormLabel>
                  <div className="flex h-10 items-center space-x-2 px-3">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormDescription className="text-sm">
                      {field.value ? "Enabled" : "Disabled"}
                    </FormDescription>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="md:col-span-9">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field: startDateField }) => (
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field: endDateField }) => (
                    <FormItem>
                      <FormLabel>Valid Period</FormLabel>
                      <div className="flex gap-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                size="default"
                                className={cn(
                                  "w-[140px] pl-3 text-left font-normal",
                                  !startDateField.value && "text-muted-foreground"
                                )}
                              >
                                {startDateField.value ? (
                                  format(startDateField.value, "MM/dd/yyyy")
                                ) : (
                                  <span>Start date</span>
                                )}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={startDateField.value || undefined}
                              onSelect={startDateField.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <span className="flex items-center text-muted-foreground">to</span>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                size="default"
                                className={cn(
                                  "w-[140px] pl-3 text-left font-normal",
                                  !endDateField.value && "text-muted-foreground"
                                )}
                              >
                                {endDateField.value ? (
                                  format(endDateField.value, "MM/dd/yyyy")
                                ) : (
                                  <span>End date</span>
                                )}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={endDateField.value || undefined}
                              onSelect={endDateField.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            />
          </div>
        </div>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : initialData ? "Update" : "Create"} Coupon
        </Button>
      </form>
    </Form>
  );
}