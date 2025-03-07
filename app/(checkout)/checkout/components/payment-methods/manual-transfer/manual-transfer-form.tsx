"use client"

import { Upload } from "lucide-react"
import { motion } from "framer-motion"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FileUpload } from "@/components/file-upload"
import { formatPrice } from "@/lib/utils"

interface ManualTransferFormProps {
  total: number
  formData: {
    paymentNote: string
    paymentProof: string
  }
  onUploadComplete: (data: { downloadUrl: string; paymentNote?: string }) => void
  formatPrice?: (price: number) => string
}

export function ManualTransferForm({ 
  total, 
  formData, 
  onUploadComplete,
}: ManualTransferFormProps) {
  return (
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
          onUploadComplete={onUploadComplete}
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
          onChange={(e) => {
            onUploadComplete({ 
              downloadUrl: formData.paymentProof,
              paymentNote: e.target.value 
            });
          }}
        />
      </div>
    </motion.div>
  )
} 