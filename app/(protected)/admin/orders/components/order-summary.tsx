import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatPrice } from "@/lib/utils";
import { FileUpload } from "@/components/file-upload";

interface OrderCalculation {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
}

interface OrderSummaryProps {
  calculation: OrderCalculation;
  formData: {
    status: string;
    paymentMethod: string;
    paymentNote: string;
    paymentProof: string;
    couponCode: string;
    affiliateId: string;
    affiliateCommission: number;
  };
  selectedCoupon: any;
  onFormDataChange: (data: any) => void;
  onCouponApply: () => void;
  onSubmit: (e: React.FormEvent) => void;
  disabled: boolean;
}

export function OrderSummary({
  calculation,
  formData,
  selectedCoupon,
  onFormDataChange,
  onCouponApply,
  onSubmit,
  disabled,
}: OrderSummaryProps) {
  const TAX_RATE = 0.00;

  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
        <CardDescription>
          Review order details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="status">Order Status</Label>
            <Select 
              value={formData.status}
              onValueChange={(value) => onFormDataChange({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="PROCESSING">Processing</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Payment Method</Label>
            <Select 
              value={formData.paymentMethod}
              onValueChange={(value) => onFormDataChange({ ...formData, paymentMethod: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                <SelectItem value="PAYPAL">PayPal</SelectItem>
                <SelectItem value="STRIPE">Stripe</SelectItem>
                <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                <SelectItem value="DEBIT_CARD">Debit Card</SelectItem>
                <SelectItem value="RAZORPAY">Razorpay</SelectItem>
                <SelectItem value="CRYPTO">Cryptocurrency</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.paymentMethod && (
            <>
              <div className="space-y-2">
                <Label htmlFor="paymentNote">Payment Note</Label>
                <Textarea
                  id="paymentNote"
                  value={formData.paymentNote}
                  onChange={(e) => onFormDataChange({ ...formData, paymentNote: e.target.value })}
                  placeholder="Enter payment details or instructions..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentProof">Payment Proof</Label>
                <FileUpload
                  parentId="903f8177-8654-41f8-bab9-f8cbaf5c2d7a"
                  onUploadComplete={(data) => {
                    onFormDataChange({
                      ...formData,
                      paymentProof: data.downloadUrl
                    });
                  }}
                  accept="image/*,.pdf"
                  placeholderText="Upload payment receipt or screenshot"
                  value={formData.paymentProof}
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="couponCode">Coupon Code</Label>
            <div className="flex space-x-2">
              <Input
                id="couponCode"
                value={formData.couponCode}
                onChange={(e) => onFormDataChange({ ...formData, couponCode: e.target.value })}
                placeholder="Enter coupon code"
              />
              <Button type="button" onClick={onCouponApply}>
                Apply
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatPrice(calculation.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Discount</span>
              <span className="font-medium text-green-600">
                -{formatPrice(calculation.discount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax ({TAX_RATE*100}%)</span>
              <span className="font-medium">{formatPrice(calculation.tax)}</span>
            </div>
            {formData.affiliateId && formData.affiliateId !== "none" && (
              <div className="flex justify-between text-amber-600">
                <span>Affiliate Commission</span>
                <span>{formatPrice(formData.affiliateCommission)}</span>
              </div>
            )}
            <div className="border-t pt-2">
              <div className="flex justify-between">
                <span className="font-medium">Total</span>
                <span className="font-bold">{formatPrice(calculation.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {selectedCoupon && (
          <div className="pt-4 border-t">
            <h4 className="font-medium mb-2">Applied Coupon</h4>
            <div className="text-sm text-muted-foreground">
              <p>{selectedCoupon.code}</p>
              <p>{selectedCoupon.type === "FIXED" 
                ? `${formatPrice(selectedCoupon.value)} off`
                : `${selectedCoupon.value}% off`}
              </p>
            </div>
          </div>
        )}

        <Button 
          className="w-full" 
          type="submit"
          disabled={disabled}
          onClick={onSubmit}
        >
          Create Order
        </Button>
      </CardContent>
    </Card>
  );
}
