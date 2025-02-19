"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createAffiliate, updateAffiliate } from "../actions";
import { toast } from "sonner";

const formSchema = z.object({
  userId: z.string().min(1, "Please select a user"),
  commissionType: z.enum(["FIXED", "PERCENTAGE"]),
  commissionValue: z.string().transform(Number),
  paymentMethodType: z.enum([
    "BANK_TRANSFER",
    "PAYPAL",
    "STRIPE",
    "CREDIT_CARD",
    "DEBIT_CARD",
    "RAZORPAY",
    "CRYPTO",
    "OTHER",
  ]),
  paymentDetails: z.string().min(1, "Payment details are required"),
});

interface AffiliateFormProps {
  open: boolean;
  onClose: () => void;
  users: {
    id: string;
    name: string | null;
    email: string | null;
  }[];
  initialData?: {
    id: string;
    userId: string;
    commissionType: "FIXED" | "PERCENTAGE";
    commissionValue: number;
    paymentMethod?: {
      type: string;
      details: string;
    } | null;
  };
  onSuccess?: () => void;
}

export function AffiliateForm({
  open,
  onClose,
  users,
  initialData,
  onSuccess,
}: AffiliateFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: "",
      commissionType: "PERCENTAGE",
      commissionValue: "0",
      paymentMethodType: "BANK_TRANSFER",
      paymentDetails: "",
    },
  });

  // 当初始数据变化时重置表单
  useEffect(() => {
    if (initialData) {
      form.reset({
        userId: initialData.userId,
        commissionType: initialData.commissionType,
        commissionValue: initialData.commissionValue.toString(),
        paymentMethodType: initialData.paymentMethod?.type || "BANK_TRANSFER",
        paymentDetails: initialData.paymentMethod?.details || "",
      });
    } else {
      form.reset({
        userId: "",
        commissionType: "PERCENTAGE",
        commissionValue: "0",
        paymentMethodType: "BANK_TRANSFER",
        paymentDetails: "",
      });
    }
  }, [form, initialData]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      form.clearErrors();
      const result = initialData
        ? await updateAffiliate(initialData.id, {
            commissionType: values.commissionType as "FIXED" | "PERCENTAGE",
            commissionValue: values.commissionValue,
            paymentMethod: {
              type: values.paymentMethodType,
              details: values.paymentDetails,
            },
          })
        : await createAffiliate({
            userId: values.userId,
            commissionType: values.commissionType as "FIXED" | "PERCENTAGE",
            commissionValue: values.commissionValue,
            paymentMethod: {
              type: values.paymentMethodType,
              details: values.paymentDetails,
            },
          });

      if (result.success) {
        toast.success(
          initialData ? "Affiliate updated successfully" : "Affiliate created successfully"
        );
        if (onSuccess) {
          onSuccess();
        }
        onClose();
      } else {
        toast.error(result.error || "Something went wrong");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("An unexpected error occurred");
    }
  };

  const paymentMethodTypes = [
    { value: "BANK_TRANSFER", label: "Bank Transfer" },
    { value: "PAYPAL", label: "PayPal" },
    { value: "STRIPE", label: "Stripe" },
    { value: "CREDIT_CARD", label: "Credit Card" },
    { value: "DEBIT_CARD", label: "Debit Card" },
    { value: "RAZORPAY", label: "Razorpay" },
    { value: "CRYPTO", label: "Cryptocurrency" },
    { value: "OTHER", label: "Other" },
  ];

  const getPaymentDetailsPlaceholder = (type: string) => {
    switch (type) {
      case "BANK_TRANSFER":
        return "Bank name, account number, account holder name";
      case "PAYPAL":
        return "PayPal email address";
      case "STRIPE":
        return "Stripe account ID";
      case "CREDIT_CARD":
        return "Card number, expiry date, CVV";
      case "DEBIT_CARD":
        return "Card number, expiry date, CVV";
      case "RAZORPAY":
        return "Razorpay account ID";
      case "CRYPTO":
        return "Wallet address";
      default:
        return "Enter payment details";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Affiliate" : "Create Affiliate"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {!initialData && (
              <FormField
                control={form.control}
                name="userId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a user" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem 
                            key={user.id} 
                            value={user.id}
                          >
                            <div className="flex flex-col items-start">
                              <div className="truncate font-medium">
                                {user.name}
                              </div>
                              <div className="text-xs text-muted-foreground truncate">
                                {user.email}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="commissionType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Commission Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select commission type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                      <SelectItem value="FIXED">Fixed Amount</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="commissionValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Commission Value 
                    ({form.watch("commissionType") === "PERCENTAGE" ? "%" : "$"})
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step={form.watch("commissionType") === "PERCENTAGE" ? "0.1" : "0.01"}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentMethodType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {paymentMethodTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Details</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={getPaymentDetailsPlaceholder(form.watch("paymentMethodType"))}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {initialData ? "Update Affiliate" : "Create Affiliate"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
