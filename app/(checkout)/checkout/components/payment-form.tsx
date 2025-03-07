import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AppleIcon as ApplePay, CreditCard, Lock, Upload, ShoppingCartIcon as PayPal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { FileUpload } from "@/components/file-upload"

interface PaymentFormProps {
  formData: {
    cardNumber: string
    cardExpiry: string
    cardCvc: string
    paymentNote: string
    paymentProof: string
  }
  paymentMethod: string
  setPaymentMethod: (value: string) => void
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleFormDataChange: (newData: Partial<any>) => void
  setFormData: React.Dispatch<React.SetStateAction<any>>
  isProcessing: boolean
  uploadedFile: File | null
  total: number
  formatPrice: (price: number) => string
  onBack: () => void
  onSubmit: (e: React.FormEvent) => void
}

export function PaymentForm({
  formData,
  paymentMethod,
  setPaymentMethod,
  handleInputChange,
  handleFormDataChange,
  setFormData,
  isProcessing,
  uploadedFile,
  total,
  formatPrice,
  onBack,
  onSubmit
}: PaymentFormProps) {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  }

  return (
    <motion.form {...fadeIn} className="space-y-6" onSubmit={onSubmit}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">Payment method</h2>
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Secure payment</span>
          </div>
        </div>

        <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid gap-4">
          <div className={`relative flex items-center rounded-lg border p-4 transition-colors ${paymentMethod === "apple-pay" ? "border-primary bg-primary/5" : ""}`}>
            <RadioGroupItem value="apple-pay" id="apple-pay" className="sr-only" />
            <Label htmlFor="apple-pay" className="flex flex-1 cursor-pointer items-center justify-between">
              <div className="flex items-center gap-2">
                <ApplePay className="h-5 w-5" />
                <span>Apple Pay</span>
              </div>
            </Label>
          </div>

          <div className={`relative flex items-center rounded-lg border p-4 transition-colors ${paymentMethod === "card" ? "border-primary bg-primary/5" : ""}`}>
            <RadioGroupItem value="card" id="card" className="sr-only" />
            <Label htmlFor="card" className="flex flex-1 cursor-pointer items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                <span>Credit card</span>
              </div>
            </Label>
          </div>

          <div className={`relative flex items-center rounded-lg border p-4 transition-colors ${paymentMethod === "paypal" ? "border-primary bg-primary/5" : ""}`}>
            <RadioGroupItem value="paypal" id="paypal" className="sr-only" />
            <Label htmlFor="paypal" className="flex flex-1 cursor-pointer items-center justify-between">
              <div className="flex items-center gap-2">
                <PayPal className="h-5 w-5" />
                <span>PayPal</span>
              </div>
            </Label>
          </div>

          <div className={`relative flex items-center rounded-lg border p-4 transition-colors ${paymentMethod === "manual-transfer" ? "border-primary bg-primary/5" : ""}`}>
            <RadioGroupItem value="manual-transfer" id="manual-transfer" className="sr-only" />
            <Label htmlFor="manual-transfer" className="flex flex-1 cursor-pointer items-center justify-between">
              <div className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                <span>Manual bank transfer</span>
              </div>
            </Label>
          </div>
        </RadioGroup>

        <AnimatePresence mode="wait">
          {paymentMethod === "card" && (
            <motion.div key="card-form" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card number</Label>
                <Input id="cardNumber" name="cardNumber" placeholder="1234 5678 9012 3456" value={formData.cardNumber} onChange={handleInputChange} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cardExpiry">Expiry date</Label>
                  <Input id="cardExpiry" name="cardExpiry" placeholder="MM / YY" value={formData.cardExpiry} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cardCvc">CVC</Label>
                  <Input id="cardCvc" name="cardCvc" placeholder="123" value={formData.cardCvc} onChange={handleInputChange} required />
                </div>
              </div>
            </motion.div>
          )}

          {paymentMethod === "paypal" && (
            <motion.div key="paypal-form" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="flex justify-center mb-4">
                  <PayPal className="h-8 w-8 text-blue-600" />
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  You will be redirected to PayPal to complete your payment securely.
                </p>
              </div>
            </motion.div>
          )}

          {paymentMethod === "manual-transfer" && (
            <motion.div key="manual-transfer-form" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-4">
              <div className="bg-yellow-50 p-4 rounded-lg mb-4">
                <h4 className="font-medium mb-2">Manual Payment Instructions</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Please transfer the total amount to the following account:
                </p>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="font-medium">Account Name:</span>
                    <span>NextPion Inc.</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Account Number:</span>
                    <span>1234567890</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Bank:</span>
                    <span>Example Bank</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Reference:</span>
                    <span>ORDER-{Math.floor(Math.random() * 10000).toString().padStart(4, "0")}</span>
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
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, paymentNote: e.target.value }))}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          type="submit"
          className="flex-1"
          disabled={isProcessing || (paymentMethod === "manual-transfer" && !uploadedFile)}
        >
          {isProcessing ? (
            <div className="flex items-center">
              <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
              Processing...
            </div>
          ) : paymentMethod === "manual-transfer" ? (
            "Submit Payment Proof"
          ) : paymentMethod === "paypal" ? (
            "Continue to PayPal"
          ) : (
            `Pay ${formatPrice(total)}`
          )}
        </Button>
      </div>
    </motion.form>
  )
}