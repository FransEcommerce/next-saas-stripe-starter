"use client"

import React from "react"
import { motion } from "framer-motion"
import { AppleIcon as ApplePay, CreditCard, Lock, Upload, ShoppingCartIcon as PayPal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { FileUpload } from "@/components/file-upload"

interface PaymentFormProps {
  formData: {
    paymentNote: string
    paymentProof: string
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
  onSubmit: (e: React.FormEvent) => void
}

export function PaymentForm({
  formData,
  paymentMethod,
  setPaymentMethod,
  handleFormDataChange,
  setFormData,
  isProcessing,
  uploadedFile,
  total,
  formatPrice,
  onBack,
  onSubmit
}: PaymentFormProps) {
  return (
    <motion.form 
      className="space-y-6" 
      onSubmit={onSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">Payment method</h2>
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Secure payment</span>
          </div>
        </div>

        <RadioGroup
          value={paymentMethod}
          onValueChange={setPaymentMethod}
          className="grid gap-4"
        >
          <div>
            <RadioGroupItem
              value="manual-transfer"
              id="manual-transfer"
              className="peer sr-only"
            />
            <Label
              htmlFor="manual-transfer"
              className="flex flex-col items-start justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/5 p-2">
                    <Upload className="h-4 w-4 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Manual Bank Transfer
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Upload payment proof after transfer
                    </p>
                  </div>
                </div>
              </div>
            </Label>
          </div>

          {/* 其他支付方式暂时注释掉 */}
          {/* <div className="opacity-40 cursor-not-allowed">
            <div className="flex flex-col items-start justify-between rounded-lg border-2 border-muted bg-popover p-4">
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/5 p-2">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Credit Card
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Coming soon
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div> */}
        </RadioGroup>

        {paymentMethod === "manual-transfer" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            <div className="rounded-lg border bg-card p-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Upload className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Bank Transfer Instructions</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Please transfer {formatPrice(total)} to the following account:
                    </p>
                  </div>
                </div>
                <div className="pl-[52px] space-y-1 text-sm">
                  <p>Bank: Example Bank</p>
                  <p>Account Name: Your Company Name</p>
                  <p>Account Number: 1234567890</p>
                  <p>Swift Code: EXAMPLEXXX</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentProof">Upload Payment Proof</Label>
              <FileUpload
                parentId={process.env.NEXT_PUBLIC_PAYMENT_PARENT_ID}
                onUploadComplete={(data) => {
                  handleFormDataChange({ paymentProof: data.downloadUrl })
                }}
                accept="image/*,.pdf"
                placeholderText="Upload payment receipt or screenshot"
                value={formData.paymentProof}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentNote">Payment Note (Optional)</Label>
              <Textarea
                id="paymentNote"
                name="paymentNote"
                placeholder="Add any additional information about your payment"
                className="resize-none"
                rows={3}
                value={formData.paymentNote}
                onChange={(e) => handleFormDataChange({ paymentNote: e.target.value })}
              />
            </div>
          </motion.div>
        )}
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          type="submit"
          className="flex-1"
          disabled={isProcessing || (paymentMethod === "manual-transfer" && !formData.paymentProof)}
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
      </div>
    </motion.form>
  )
}