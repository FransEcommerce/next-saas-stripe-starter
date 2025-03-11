"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, CreditCard, Building, Loader2 } from "lucide-react"
import { useFormContext } from "react-hook-form"
import { RadioGroup } from "@/components/ui/radio-group"

// 导入支付方式组件
import { RazorpayForm, RazorpayFormRef } from "./payment-methods/razorpay/razorpay-form"
import { ManualTransferForm } from "./payment-methods/manual-transfer/manual-transfer-form"
import { RazorpayButton } from "./payment-methods/razorpay/razorpay-button"
import { ManualTransferButton } from "./payment-methods/manual-transfer/manual-transfer-button"
import { PayPalForm, PayPalFormRef } from "./payment-methods/paypal/paypal-form"
import { PayPalButton } from "./payment-methods/paypal/paypal-button"
import { ManualPaypalForm } from "./payment-methods/manual-paypal/manual-paypal-form"
import { ManualPaypalButton } from "./payment-methods/manual-paypal/manual-paypal-button"
import { toast } from "sonner"

interface PaymentFormProps {
  total: number
  formData: any
  isProcessing: boolean
  paymentMethod: string
  setPaymentMethod: (method: string) => void
  handleFormDataChange: (data: any) => void
  onBack: () => void
  onSubmit: () => void
  formatPrice: (price: number) => string
  productName: string
}

export function PaymentForm({
  total,
  formData,
  isProcessing,
  paymentMethod,
  setPaymentMethod,
  handleFormDataChange,
  onBack,
  onSubmit,
  formatPrice,
  productName
}: PaymentFormProps) {
  const { setValue, watch } = useFormContext();
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);
  const [isPayPalLoaded, setIsPayPalLoaded] = useState(false);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const razorpayFormRef = useRef<RazorpayFormRef>(null);
  const paypalFormRef = useRef<PayPalFormRef>(null);

  // 硬编码的支付网关配置
  const paymentGatewayConfigs = {
    razorpay: {
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      name: "Razorpay",
      description: "Pay with Credit/Debit Card",
      icon: "credit-card"
    },
    paypal: {
      clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
      name: "PayPal",
      description: "Pay with PayPal or Credit/Debit Card",
      icon: "credit-card"
    },
    manualTransfer: {
      name: "Manual Bank Transfer",
      description: "Upload bank transfer payment proof",
      icon: "upload",
      bankDetails: {
        bankName: 'Example Bank',
        accountName: 'Your Company Name',
        accountNumber: '1234567890',
        swiftCode: 'EXAMPLEXXX'
      },
      instructions: 'Please transfer the amount and upload the payment proof.',
      uploadInstructions: 'Upload a screenshot or PDF of your payment receipt.'
    },
    manualPaypal: {
      name: "Manual PayPal Transfer",
      description: "Upload PayPal payment proof after transfer",
      icon: "paypal",
      paypalDetails: {
        accountName: 'Your PayPal Name',
        accountEmail: 'your.email@example.com'
      },
      instructions: 'Please transfer the amount to our PayPal account and upload the payment proof.',
      uploadInstructions: 'Upload a screenshot of your PayPal payment confirmation.'
    }
  };

  // 当支付方式改变时更新表单值
  useEffect(() => {
    setValue("paymentMethod", paymentMethod);
    if (paymentMethod === "manual-transfer" || paymentMethod === "manual-paypal") {
      setValue("status", "PENDING");
    }
    // 其他支付方式不设置状态，会在支付成功后直接设为 COMPLETED
  }, [paymentMethod, setValue]);

  const handlePaymentMethodChange = (value: string) => {
    setPaymentMethod(value);
  };

  // 处理 Razorpay 支付
  const handleRazorpayPayment = async () => {
    setIsPaymentLoading(true);
    if (razorpayFormRef.current) {
      try {
        await razorpayFormRef.current.handlePayment();
      } catch (error) {
        console.error("Razorpay payment error:", error);
      } finally {
        setIsPaymentLoading(false);
      }
    } else {
      setIsPaymentLoading(false);
    }
  };

  // 处理 PayPal 支付
  const handlePayPalPayment = async () => {
    setIsPaymentLoading(true);
    if (paypalFormRef.current) {
      try {
        await paypalFormRef.current.handlePayment();
      } catch (error) {
        console.error("PayPal payment error:", error);
      } finally {
        setIsPaymentLoading(false);
      }
    } else {
      setIsPaymentLoading(false);
    }
  };

  // 动画变量
  const fadeIn = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.3 }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Payment Method</h2>
        <p className="text-sm text-muted-foreground">
          Choose your preferred payment method
        </p>
      </div>

      <RadioGroup
        value={paymentMethod}
        onValueChange={handlePaymentMethodChange}
        className="grid gap-4"
      >
        {/* <RazorpayButton 
          id="razorpay-payment" 
          config={paymentGatewayConfigs.razorpay}
        /> */}
        <PayPalButton 
          id="paypal-payment" 
          config={paymentGatewayConfigs.paypal}
        />
        {/* <ManualTransferButton 
          id="manual-transfer-payment" 
          config={paymentGatewayConfigs.manualTransfer}
        /> */}
        {/* <ManualPaypalButton 
          id="manual-paypal-payment" 
          value="manual-paypal"
          config={{
            name: paymentGatewayConfigs.manualPaypal.name,
            description: paymentGatewayConfigs.manualPaypal.description,
            icon: paymentGatewayConfigs.manualPaypal.icon
          }}
        /> */}
      </RadioGroup>

      <div className="mt-6">
        <AnimatePresence mode="wait">
          {paymentMethod === "razorpay" && (
            <motion.div
              key="razorpay"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={fadeIn}
            >
              <RazorpayForm
                ref={razorpayFormRef}
                total={total}
                isLoading={isProcessing}
                onSubmit={onSubmit}
                productName={productName}
                onLoaded={() => setIsRazorpayLoaded(true)}
              />
            </motion.div>
          )}

          {paymentMethod === "paypal" && (
            <motion.div
              key="paypal"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={fadeIn}
            >
              <PayPalForm
                ref={paypalFormRef}
                total={total}
                isLoading={isProcessing}
                onSubmit={onSubmit}
                productName={productName}
                onLoaded={() => setIsPayPalLoaded(true)}
              />
            </motion.div>
          )}

          {paymentMethod === "manual-transfer" && (
            <motion.div
              key="manual-transfer"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={fadeIn}
            >
              <ManualTransferForm
                total={total}
                formatPrice={formatPrice}
                gatewayConfig={paymentGatewayConfigs.manualTransfer}
              />
            </motion.div>
          )}

          {paymentMethod === "manual-paypal" && (
            <motion.div
              key="manual-paypal"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={fadeIn}
            >
              <ManualPaypalForm
                total={total}
                formatPrice={formatPrice}
                gatewayConfig={paymentGatewayConfigs.manualPaypal}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center pt-4 gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isProcessing || isPaymentLoading}
          className="shrink-0"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {paymentMethod === 'manual-transfer' && (
          <Button 
            type="button" 
            onClick={onSubmit}
            disabled={isProcessing || !watch("paymentProof")}
            className="flex-1"
          >
            {isProcessing && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Complete Order
          </Button>
        )}

        {paymentMethod === 'manual-paypal' && (
          <Button 
            type="button" 
            onClick={onSubmit}
            disabled={isProcessing || !watch("paymentProof")}
            className="flex-1"
          >
            {isProcessing && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Complete Order
          </Button>
        )}

        {paymentMethod === 'razorpay' && (
          <Button 
            type="button" 
            onClick={handleRazorpayPayment}
            disabled={isProcessing || isPaymentLoading || !isRazorpayLoaded}
            className="flex-1"
          >
            {(isProcessing || isPaymentLoading) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Pay Now {formatPrice(total)}
          </Button>
        )}
      </div>
    </motion.div>
  )
}