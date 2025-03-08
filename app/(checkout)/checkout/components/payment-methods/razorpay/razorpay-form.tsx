"use client"

import { useState, useEffect, useImperativeHandle, forwardRef } from 'react'
import { useFormContext } from 'react-hook-form'
import { toast } from 'sonner'
import { Card, CardContent } from "@/components/ui/card"
import { loadScript } from "@/lib/utils"

interface RazorpayFormProps {
  total: number
  isLoading?: boolean
  onSubmit?: () => void
  productName: string
  onLoaded?: () => void
}

export interface RazorpayFormRef {
  handlePayment: () => Promise<void>;
  isLoaded: boolean;
  isProcessing: boolean;
}

const RazorpayFormComponent = forwardRef<RazorpayFormRef, RazorpayFormProps>(({ 
  total, 
  isLoading = false,
  onSubmit,
  productName,
  onLoaded
}, ref) => {
  const { register, setValue, watch } = useFormContext();
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [razorpayOrderId, setRazorpayOrderId] = useState("");

  // 加载 Razorpay 脚本
  useEffect(() => {
    loadScript("https://checkout.razorpay.com/v1/checkout.js")
      .then(() => {
        setIsRazorpayLoaded(true);
        if (onLoaded) onLoaded();
      })
      .catch((error) => {
        console.error("Failed to load Razorpay:", error);
        toast.error("Failed to load payment gateway. Please try again.");
      });
  }, [onLoaded]);

  // 创建 Razorpay 订单
  const createRazorpayOrder = async () => {
    try {
      setIsProcessing(true);
      const response = await fetch("/api/payment-gateways/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: total,
          currency: "USD",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create order");
      }

      const data = await response.json();
      return data.orderId;
    } catch (error) {
      console.error("Error creating Razorpay order:", error);
      toast.error("Failed to create payment order. Please try again.");
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  // 处理 Razorpay 支付
  const handleRazorpayPayment = async () => {
    if (!isRazorpayLoaded) {
      toast.error("Payment gateway is still loading. Please wait.");
      return;
    }

    try {
      // 设置处理状态为 true
      setIsProcessing(true);
      
      const orderId = await createRazorpayOrder();
      if (!orderId) {
        setIsProcessing(false);
        return;
      }

      setRazorpayOrderId(orderId);
      setValue("razorpayOrderId", orderId);

      const billingInfo = watch("billingInfo");

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: total * 100,
        currency: "USD",
        name: "NextPion",
        description: productName || "Product Purchase",
        image: 'https://nextpion.frs.com.my/favicon.png',
        order_id: orderId,
        handler: function (response: any) {
          setValue("razorpayPaymentId", response.razorpay_payment_id);
          setValue("razorpayOrderId", response.razorpay_order_id);
          setValue("razorpaySignature", response.razorpay_signature);
          setValue("status", "COMPLETED");
          
          toast.success("Payment Successful");
          
          // 提交表单
          if (onSubmit) {
            onSubmit();
          }
          
          // 重置处理状态
          setIsProcessing(false);
        },
        prefill: {
          name: billingInfo?.name || "",
          email: billingInfo?.email || "",
          contact: billingInfo?.phone || "",
        },
        theme: {
          color: "#000000",
        },
        modal: {
          ondismiss: function() {
            // 当用户关闭 Razorpay 弹窗时重置处理状态
            setIsProcessing(false);
          }
        }
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Razorpay payment error:", error);
      toast.error("There was an error processing your payment. Please try again.");
      // 重置处理状态
      setIsProcessing(false);
    }
  };

  // 导出方法供外部调用
  useImperativeHandle(ref, () => ({
    handlePayment: handleRazorpayPayment,
    isLoaded: isRazorpayLoaded,
    isProcessing
  }));

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm">
            You will be redirected to Razorpay to complete your payment.
            After payment, you will be returned to this page.
          </p>
        </CardContent>
      </Card>
      <input
        type="hidden"
        {...register("razorpayOrderId")}
        value={razorpayOrderId}
      />
    </div>
  );
});

RazorpayFormComponent.displayName = "RazorpayForm";

export const RazorpayForm = RazorpayFormComponent;