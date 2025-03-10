"use client"

import { Upload } from "lucide-react"
import { motion } from "framer-motion"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FileUpload } from "@/components/file-upload"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
            <div className="flex flex-col sm:flex-row items-start gap-3">
              <div className="rounded-lg bg-[#0070ba]/10 p-2">
                <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="24" height="24" viewBox="0,0,256,256">
                  <g transform="translate(-39.68,-39.68) scale(1.31,1.31)"><g fill="none" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none"><g transform="translate(4.79558,0.53333) scale(5.33333,5.33333)"><path d="M18.7,13.767l0.005,0.002c0.104,-0.443 0.482,-0.769 0.955,-0.769h13.472c0.017,0 0.034,-0.007 0.051,-0.006c-0.287,-4.779 -4.296,-6.994 -7.833,-6.994h-13.472c-0.474,0 -0.852,0.335 -0.955,0.777l-0.005,-0.002l-5.889,27.038l0.013,0.001c-0.014,0.064 -0.039,0.125 -0.039,0.194c0,0.553 0.447,0.991 1,0.991h8.071z" fill="#1565c0"></path><path d="M33.183,12.994c0.053,0.876 -0.005,1.829 -0.229,2.882c-1.281,5.995 -5.912,9.115 -11.635,9.115c0,0 -3.47,0 -4.313,0c-0.521,0 -0.767,0.306 -0.88,0.54l-1.74,8.049l-0.305,1.429h-0.006l-1.263,5.796l0.013,0.001c-0.014,0.064 -0.039,0.125 -0.039,0.194c0,0.553 0.447,1 1,1h7.333l0.013,-0.01c0.472,-0.007 0.847,-0.344 0.945,-0.788l0.018,-0.015l1.812,-8.416c0,0 0.126,-0.803 0.97,-0.803c0.844,0 4.178,0 4.178,0c5.723,0 10.401,-3.106 11.683,-9.102c1.442,-6.76 -3.38,-9.847 -7.555,-9.872z" fill="#039be5"></path><path d="M19.66,13c-0.474,0 -0.852,0.326 -0.955,0.769l-0.005,-0.002l-2.575,11.765c0.113,-0.234 0.359,-0.54 0.88,-0.54c0.844,0 4.235,0 4.235,0c5.723,0 10.432,-3.12 11.713,-9.115c0.225,-1.053 0.282,-2.006 0.229,-2.882c-0.016,-0.002 -0.034,0.005 -0.05,0.005z" fill="#283593"></path></g></g></g>
                </svg>
              </div>
              <div>
                <p className="font-medium text-sm sm:text-base">PayPal Transfer Instructions</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Please transfer {formatPrice(total)} to the following PayPal account:
                </p>
              </div>
            </div>

            <div className="sm:pl-[52px] space-y-2">
              <div className="bg-secondary/50 p-4 rounded-lg space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Account Name</p>
                  <p className="text-sm font-medium">{paypalDetails.accountName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">PayPal Email</p>
                  <p className="text-sm font-medium">{paypalDetails.accountEmail}</p>
                </div>
              </div>
              <Button
                variant="secondary"
                className="w-full gap-2"
                onClick={() => window.open('https://www.paypal.com', '_blank')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="20" height="20" viewBox="0,0,256,256">
                  <g transform="translate(-39.68,-39.68) scale(1.31,1.31)"><g fill="none" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none"><g transform="translate(4.79558,0.53333) scale(5.33333,5.33333)"><path d="M18.7,13.767l0.005,0.002c0.104,-0.443 0.482,-0.769 0.955,-0.769h13.472c0.017,0 0.034,-0.007 0.051,-0.006c-0.287,-4.779 -4.296,-6.994 -7.833,-6.994h-13.472c-0.474,0 -0.852,0.335 -0.955,0.777l-0.005,-0.002l-5.889,27.038l0.013,0.001c-0.014,0.064 -0.039,0.125 -0.039,0.194c0,0.553 0.447,0.991 1,0.991h8.071z" fill="#1565c0"></path><path d="M33.183,12.994c0.053,0.876 -0.005,1.829 -0.229,2.882c-1.281,5.995 -5.912,9.115 -11.635,9.115c0,0 -3.47,0 -4.313,0c-0.521,0 -0.767,0.306 -0.88,0.54l-1.74,8.049l-0.305,1.429h-0.006l-1.263,5.796l0.013,0.001c-0.014,0.064 -0.039,0.125 -0.039,0.194c0,0.553 0.447,1 1,1h7.333l0.013,-0.01c0.472,-0.007 0.847,-0.344 0.945,-0.788l0.018,-0.015l1.812,-8.416c0,0 0.126,-0.803 0.97,-0.803c0.844,0 4.178,0 4.178,0c5.723,0 10.401,-3.106 11.683,-9.102c1.442,-6.76 -3.38,-9.847 -7.555,-9.872z" fill="#039be5"></path><path d="M19.66,13c-0.474,0 -0.852,0.326 -0.955,0.769l-0.005,-0.002l-2.575,11.765c0.113,-0.234 0.359,-0.54 0.88,-0.54c0.844,0 4.235,0 4.235,0c5.723,0 10.432,-3.12 11.713,-9.115c0.225,-1.053 0.282,-2.006 0.229,-2.882c-0.016,-0.002 -0.034,0.005 -0.05,0.005z" fill="#283593"></path></g></g></g>
                </svg>
                Pay with PayPal
              </Button>
            </div>

            <div className="sm:pl-[52px]">
              <p className="text-xs text-muted-foreground">{instructions}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentProof" className="text-sm sm:text-base">
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
              <Label htmlFor="paymentNote" className="text-sm sm:text-base">Additional Notes</Label>
              <Textarea
                id="paymentNote"
                placeholder="Any additional information about your payment"
                className="min-h-[100px]"
                {...register("paymentNote")}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
