"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { validateCoupon } from "../../actions";
import { getAffiliates } from "../../queries";
import { FileUpload } from "@/components/file-upload";
import { env } from "@/env.mjs";

const formSchema = z.object({
  amount: z.number().min(0),
  subtotal: z.number().min(0),
  discountAmount: z.number().min(0).optional(),
  tax: z.number().min(0).optional(),
  affiliateCommission: z.number().min(0).optional(),
  affiliateId: z.string().optional(),
  paymentMethod: z.string().optional(),
  paymentNote: z.string().optional(),
  paymentProof: z.string().url().optional(),
  couponCode: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface EditPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: FormValues;
  onSubmit: (data: FormValues) => Promise<void>;
}

const paymentMethods = [
  { label: "Bank Transfer", value: "BANK_TRANSFER" },
  { label: "PayPal", value: "PAYPAL" },
  { label: "Stripe", value: "STRIPE" },
  { label: "Credit Card", value: "CREDIT_CARD" },
  { label: "Debit Card", value: "DEBIT_CARD" },
  { label: "Razorpay", value: "RAZORPAY" },
  { label: "Cryptocurrency", value: "CRYPTO" },
  { label: "Other", value: "OTHER" },
];

export function EditPaymentDialog({
  open,
  onOpenChange,
  initialData,
  onSubmit,
}: EditPaymentDialogProps) {
  const [isPending, setIsPending] = useState(false);
  const [proofUrl, setProofUrl] = useState(initialData.paymentProof || "");
  const [affiliates, setAffiliates] = useState<Array<{
    id: string;
    user: {
      name: string | null;
      email: string | null;
    };
    commissionValue: number;
    totalEarnings: number;
  }>>([]);

  useEffect(() => {
    const loadAffiliates = async () => {
      const data = await getAffiliates();
      setAffiliates(data);
    };
    loadAffiliates();
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...initialData,
      affiliateId: initialData.affiliateId || "none",
      paymentProof: proofUrl,
    },
  });

  const affiliateId = form.watch("affiliateId");

  const handleAffiliateChange = (value: string) => {
    form.setValue("affiliateId", value);
    if (value === "none") {
      form.setValue("affiliateCommission", undefined);
    } else {
      // 找到选中的 affiliate
      const selectedAffiliate = affiliates.find((a) => a.id === value);
      if (selectedAffiliate) {
        // 获取当前订单金额
        const subtotal = form.getValues("subtotal");
        // 计算佣金
        const commission = (selectedAffiliate.commissionValue / 100) * subtotal;
        // 设置佣金值，保留两位小数
        form.setValue("affiliateCommission", Number(commission.toFixed(2)));
      }
    }
  };

  // 监听 subtotal 变化，如果有选中的 affiliate，重新计算佣金
  const subtotal = form.watch("subtotal");
  useEffect(() => {
    const currentAffiliateId = form.getValues("affiliateId");
    if (currentAffiliateId && currentAffiliateId !== "none") {
      const selectedAffiliate = affiliates.find((a) => a.id === currentAffiliateId);
      if (selectedAffiliate) {
        const commission = (selectedAffiliate.commissionValue / 100) * subtotal;
        form.setValue("affiliateCommission", Number(commission.toFixed(2)));
      }
    }
  }, [subtotal, affiliates, form]);

  const handleSubmit = async (data: FormValues) => {
    try {
      setIsPending(true);

      // 如果提供了优惠券码,先验证优惠券
      if (data.couponCode) {
        const validationResult = await validateCoupon(data.couponCode, data.subtotal);
        if (validationResult.error) {
          toast.error(validationResult.error);
          setIsPending(false);
          return;
        }
        // 使用验证后的折扣金额
        if (validationResult.data) {
          data.discountAmount = validationResult.data.discountAmount;
        }
      }

      await onSubmit(data);
      onOpenChange(false);
    } catch (error) {
      toast.error("An error occurred while saving changes");
      console.error(error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[99%] h-[100%] mt-6 overflow-y-auto flex items-center justify-center">
        <div className="container mx-auto max-w-[900px]">
        <DialogHeader className="pb-6">
          <DialogTitle>Edit Payment Information</DialogTitle>
          <DialogDescription>
            Update the order&apos;s payment details and pricing information.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              {/* 左列 - 价格信息 */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Pricing Information</h4>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="subtotal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subtotal</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            step="0.01"
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="discountAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Discount</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              step="0.01"
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value ? parseFloat(e.target.value) : undefined
                                )
                              }
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="couponCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Coupon Code</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="tax"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tax</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              step="0.01"
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value ? parseFloat(e.target.value) : undefined
                                )
                              }
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total Amount</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              step="0.01"
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Affiliate Information</h4>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="affiliateId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Affiliate</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={handleAffiliateChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select affiliate" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">No Affiliate</SelectItem>
                              {affiliates.map((affiliate) => (
                                <SelectItem key={affiliate.id} value={affiliate.id}>
                                  {affiliate.user.name} ({affiliate.user.email})
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
                      name="affiliateCommission"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Affiliate Commission</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              step="0.01"
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value ? parseFloat(e.target.value) : undefined
                                )
                              }
                              value={field.value || ""}
                              disabled={affiliateId === "none"}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* 右列 - 支付信息 */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Payment Details</h4>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="paymentMethod"
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
                            {paymentMethods.map((method) => (
                              <SelectItem key={method.value} value={method.value}>
                                {method.label}
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
                    name="paymentNote"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Note</FormLabel>
                        <FormControl>
                          <Textarea {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="paymentProof"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Proof</FormLabel>
                        <FormControl>
                          <FileUpload
                            id="order-payments"
                            parentId={process.env.NEXT_PUBLIC_PAYMENT_PARENT_ID}
                            onUploadComplete={(data) => {
                              setProofUrl(data.downloadUrl);
                              field.onChange(data.downloadUrl);
                            }}
                            accept="image/*,.pdf"
                            placeholderText="Upload payment receipt or screenshot"
                            value={proofUrl}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                Save changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
