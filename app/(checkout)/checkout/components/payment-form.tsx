"use client"

import React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { RadioGroup } from "@/components/ui/radio-group"
import { RazorpayButton } from "./payment-methods/razorpay/razorpay-button"
import { RazorpayForm } from "./payment-methods/razorpay/razorpay-form"
import { ManualTransferButton } from "./payment-methods/manual-transfer/manual-transfer-button"
import { ManualTransferForm } from "./payment-methods/manual-transfer/manual-transfer-form"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface PaymentFormProps {
  formData: {
    paymentNote: string
    paymentProof: string
    billingName: string
    billingEmail: string
    billingPhone: string
  }
  paymentMethod: string
  setPaymentMethod: (value: string) => void
  handleFormDataChange: (newData: Partial<any>) => void
  setFormData?: (data: any) => void
  isProcessing: boolean
  uploadedFile?: string
  total: number
  formatPrice: (price: number) => string
  onBack: () => void
  onSubmit: (e: React.FormEvent) => Promise<{ success: boolean; orderNumber?: string; error?: string }>
  productName: string
}

export function PaymentForm({
  formData,
  paymentMethod,
  setPaymentMethod,
  handleFormDataChange,
  isProcessing,
  total,
  formatPrice,
  onBack,
  onSubmit,
  productName
}: PaymentFormProps) {
  const router = useRouter()

  return (
    <motion.form 
      className="space-y-6" 
      onSubmit={onSubmit}
    >
      <RadioGroup
        value={paymentMethod}
        onValueChange={setPaymentMethod}
        className="grid gap-4"
      >
        <RazorpayButton id="razorpay" />
        <ManualTransferButton id="manual-transfer" />
      </RadioGroup>

      {paymentMethod === "manual-transfer" && (
        <ManualTransferForm
          total={total}
          formData={formData}
          onUploadComplete={(data) => {
            handleFormDataChange({
              paymentProof: data.downloadUrl,
              paymentNote: data.paymentNote
            })
          }}
          formatPrice={formatPrice}
        />
      )}

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        {paymentMethod === "razorpay" ? (
          <RazorpayForm
            total={total}
            formData={formData}
            onPaymentComplete={handleFormDataChange}
            onCreateOrder={async (orderData) => {
              try {
                const fakeEvent = {
                  preventDefault: () => {},
                  target: {
                    ...formData,
                    ...orderData,
                    paymentMethod: 'razorpay',
                  }
                };

                const result = await onSubmit(fakeEvent);
                
                if (result?.success) {
                  return { 
                    success: true, 
                    orderNumber: result.orderNumber 
                  };
                } else {
                  return { 
                    success: false, 
                    error: result?.error || 'Failed to create order' 
                  };
                }
              } catch (error) {
                console.error('Create order failed:', error);
                return { 
                  success: false, 
                  error: 'Failed to create order' 
                };
              }
            }}
            productName={productName}
          />
        ) : (
          <Button
            type="submit"
            className="flex-1"
            disabled={isProcessing || !formData.paymentProof}
            onClick={async (e) => {
              e.preventDefault();
              try {
                const result = await onSubmit({
                  preventDefault: () => {},
                  target: {
                    ...formData,
                    paymentMethod: 'manual-transfer',
                    status: "PENDING"  // 手动付款时状态为 PENDING
                  }
                } as any);

                if (result?.success) {
                  toast.success('Payment proof submitted successfully!');
                  router.push(`/checkout/thank-you?orderNumber=${result.orderNumber}`);
                } else {
                  throw new Error(result?.error || 'Failed to submit payment proof');
                }
              } catch (error) {
                console.error('Submit payment proof failed:', error);
                toast.error('Failed to submit payment proof. Please try again.');
              }
            }}
          >
            {isProcessing ? (
              <div className="flex items-center">
                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                Processing...
              </div>
            ) : (
              "Submit Payment Proof"
            )}
          </Button>
        )}
      </div>
    </motion.form>
  )
}