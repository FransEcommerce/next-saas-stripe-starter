"use client"

import { Upload } from "lucide-react"
import { motion } from "framer-motion"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FileUpload } from "@/components/file-upload"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { useFormContext } from "react-hook-form"

interface ManualPaypalFormProps {
  total: number
  formatPrice?: (price: number) => string
  gatewayConfig?: any
}

export function ManualPaypalForm({ 
  total, 
  formatPrice = (price) => `$${price.toFixed(2)}`,
  gatewayConfig
}: ManualPaypalFormProps) {
  const { register, setValue, watch } = useFormContext();
  const paymentProof = watch("paymentProof");
  const paymentNote = watch("paymentNote");

  // PayPal 账户信息
  const paypalDetails = gatewayConfig?.paypalDetails || {
    accountName: 'Your PayPal Name',
    accountEmail: 'your.email@example.com'
  };

  // 支付说明
  const instructions = gatewayConfig?.instructions || 
    'Please transfer the amount to our PayPal account and upload the payment proof.';
  
  // 上传说明
  const uploadInstructions = gatewayConfig?.uploadInstructions || 
    'Upload a screenshot of your PayPal payment confirmation.';

  // 处理文件上传完成
  const onUploadComplete = (data: { 
    fileId: string; 
    fileName: string; 
    fileSize: string; 
    downloadUrl: string; 
  }) => {
    setValue("paymentProof", data.downloadUrl);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-[#0070ba]/10 p-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0070ba" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-paypal">
                  <path d="M7 11.5l1.5-9H16c1.2 0 2.2.6 2.6 1.5.4 1 .3 2.2-.6 3.3-.9 1-2.2 1.5-3.4 1.5H12l-1.2 7.5H4.3l.6-4H7z"/>
                  <path d="M15.8 6.7c.1-.5 0-.9-.3-1.3-.3-.4-.7-.4-1.2-.4h-3.2l-.6 4H13c.5 0 1-.2 1.4-.5.4-.3.6-.8.8-1.4z"/>
                  <path d="M18.5 5.5c-.4-.9-1.4-1.5-2.6-1.5h-7.5l-1.5 9H4.3l-.6 4h6.5l1.2-7.5h2.6c1.2 0 2.5-.5 3.4-1.5.9-1.1 1-2.3.6-3.3z"/>
                </svg>
              </div>
              <div>
                <p className="font-medium">PayPal Transfer Instructions</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Please transfer {formatPrice(total)} to the following PayPal account:
                </p>
              </div>
            </div>
            
            <div className="pl-[52px] space-y-1 text-sm">
              <p>Account Name: {paypalDetails.accountName}</p>
              <p>PayPal Email: {paypalDetails.accountEmail}</p>
            </div>
            
            <div>
              <p className="text-sm pl-[52px]">{instructions}</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="paymentProof">
                Payment Proof <span className="text-red-500">*</span>
              </Label>
              <FileUpload
                id="paypal-payment-proof"
                parentId={process.env.NEXT_PUBLIC_PAYMENT_PARENT_ID}
                onUploadComplete={onUploadComplete}
                accept="image/*,.pdf"
                placeholderText="Upload PayPal payment receipt or screenshot"
                value={paymentProof}
              />
              <p className="text-xs text-muted-foreground">
                {uploadInstructions}
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="paymentNote">Additional Notes</Label>
              <Textarea
                id="paymentNote"
                placeholder="Any additional information about your payment"
                {...register("paymentNote")}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
