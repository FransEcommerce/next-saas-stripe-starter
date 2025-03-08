"use client"

import { Upload } from "lucide-react"
import { motion } from "framer-motion"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FileUpload } from "@/components/file-upload"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { useFormContext } from "react-hook-form"

interface ManualTransferFormProps {
  total: number
  formatPrice?: (price: number) => string
  gatewayConfig?: any
}

export function ManualTransferForm({ 
  total, 
  formatPrice = (price) => `$${price.toFixed(2)}`,
  gatewayConfig
}: ManualTransferFormProps) {
  const { register, setValue, watch } = useFormContext();
  const paymentProof = watch("paymentProof");
  const paymentNote = watch("paymentNote");

  // 银行账户信息
  const bankDetails = gatewayConfig?.bankDetails || {
    bankName: 'Example Bank',
    accountName: 'Your Company Name',
    accountNumber: '1234567890',
    swiftCode: 'EXAMPLEXXX'
  };

  // 支付说明
  const instructions = gatewayConfig?.instructions || 
    'Please transfer the amount and upload the payment proof.';
  
  // 上传说明
  const uploadInstructions = gatewayConfig?.uploadInstructions || 
    'Upload a screenshot or PDF of your payment receipt.';

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
              <p>Bank: {bankDetails.bankName}</p>
              <p>Account Name: {bankDetails.accountName}</p>
              <p>Account Number: {bankDetails.accountNumber}</p>
              <p>Swift Code: {bankDetails.swiftCode}</p>
            </div>
            
            <div>
              <p className="text-sm pl-[52px]">{instructions}</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="paymentProof">
                Payment Proof <span className="text-red-500">*</span>
              </Label>
              <FileUpload
                id="transfer-payment-proof"
                parentId={process.env.NEXT_PUBLIC_PAYMENT_PARENT_ID}
                onUploadComplete={onUploadComplete}
                accept="image/*,.pdf"
                placeholderText="Upload payment receipt or screenshot"
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