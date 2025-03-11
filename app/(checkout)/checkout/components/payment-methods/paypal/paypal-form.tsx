"use client"

import { useState, useEffect, useImperativeHandle, forwardRef } from 'react'
import { useFormContext } from 'react-hook-form'
import { toast } from 'sonner'
import { Card, CardContent } from "@/components/ui/card"
import { loadScript } from "@/lib/utils"

interface PayPalFormProps {
  total: number
  isLoading?: boolean
  onSubmit?: () => void
  productName: string
  onLoaded?: () => void
}

export interface PayPalFormRef {
  handlePayment: () => Promise<void>;
  isLoaded: boolean;
  isProcessing: boolean;
}

const PayPalFormComponent = forwardRef<PayPalFormRef, PayPalFormProps>(({ 
  total, 
  isLoading = false,
  onSubmit,
  productName,
  onLoaded
}, ref) => {
  const { register, setValue, watch } = useFormContext();
  const [isPayPalLoaded, setIsPayPalLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paypalOrderId, setPaypalOrderId] = useState("");

  // 加载 PayPal 脚本并初始化按钮
  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    if (!clientId) {
      console.error("PayPal Client ID not found");
      toast.error("PayPal configuration is missing. Please contact support.");
      return;
    }

    loadScript(`https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`)
      .then(() => {
        setIsPayPalLoaded(true);
        if (onLoaded) onLoaded();
        
        // 脚本加载完成后自动初始化 PayPal 按钮
        initPayPalButton();
      })
      .catch((error) => {
        console.error("Failed to load PayPal:", error);
        toast.error("Failed to load payment gateway. Please try again.");
      });
  }, [onLoaded]);

  // 创建 PayPal 订单
  const createPayPalOrder = async () => {
    try {
      setIsProcessing(true);
      const response = await fetch("/api/payment-gateways/paypal/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: total,
          currency: "USD",
          metadata: {
            description: productName || "Product Purchase"
          }
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create order");
      }

      const data = await response.json();
      setPaypalOrderId(data.orderId);
      setValue("paypalOrderId", data.orderId);
      return data.orderId;
    } catch (error) {
      console.error("Error creating PayPal order:", error);
      toast.error("Failed to create payment order. Please try again.");
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  // 初始化 PayPal 按钮
  const initPayPalButton = () => {
    const paypal = (window as any).paypal;
    if (!paypal) return;
    
    // 清除之前的 PayPal 按钮容器内容
    const container = document.getElementById('paypal-button-container');
    if (!container) return;
    
    container.innerHTML = '';
  
    // 创建 PayPal 按钮
    paypal.Buttons({
      // 创建订单
      createOrder: async function() {
        return await createPayPalOrder();
      },
      
      // 付款批准后的回调
      onApprove: async function(data: any, actions: any) {
        try {
          setIsProcessing(true);
          
          // 验证付款
          const response = await fetch(`/api/payment-gateways/paypal/verify-payment`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              orderId: data.orderID,
              paymentId: data.paymentID || data.orderID,
            }),
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            console.error('PayPal 验证失败:', errorData);
            throw new Error(errorData.error || errorData.message || 'Payment verification failed');
          }
          
          const result = await response.json();
          
          if (result.verified) {
            // 更新表单值
            setValue("paypalOrderId", data.orderID);
            setValue("paypalPaymentId", data.paymentID || data.orderID);
            setValue("status", "COMPLETED");
            
            toast.success("Payment Successful");
            
            // 提交表单
            if (onSubmit) {
              onSubmit();
            }
          } else {
            throw new Error(result.error || 'Payment verification failed');
          }
        } catch (error) {
          console.error('PayPal verification error:', error);
          toast.error(error instanceof Error ? error.message : 'Payment verification failed');
        } finally {
          // 重置处理状态
          setIsProcessing(false);
        }
      },
      
      // 用户取消时的回调
      onCancel: function() {
        toast.info("Payment was cancelled");
        setIsProcessing(false);
      },
      
      // 发生错误时的回调
      onError: function(err: any) {
        console.error('PayPal error:', err);
        toast.error("There was an error processing your payment. Please try again.");
        setIsProcessing(false);
      }
    }).render('#paypal-button-container');
  };

  // 处理 PayPal 支付 - 这个方法现在主要用于外部调用，但实际上我们已经在选择时就初始化了按钮
  const handlePayPalPayment = async () => {
    if (!isPayPalLoaded) {
      toast.error("Payment gateway is still loading. Please wait.");
      return;
    }

    // 由于我们已经在选择支付方式时就初始化了按钮，这里不需要做太多事情
    // 如果按钮容器为空，则重新初始化
    const container = document.getElementById('paypal-button-container');
    if (container && container.innerHTML === '') {
      initPayPalButton();
    }
  };

  // 导出方法供外部调用
  useImperativeHandle(ref, () => ({
    handlePayment: handlePayPalPayment,
    isLoaded: isPayPalLoaded,
    isProcessing
  }));

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm">
            Click on the PayPal button below to complete your payment.
          </p>
          <div id="paypal-button-container" className="mt-4"></div>
          {isProcessing && (
            <p className="text-sm text-center mt-2">
              Processing your payment...
            </p>
          )}
        </CardContent>
      </Card>
      <input
        type="hidden"
        {...register("paypalOrderId")}
        value={paypalOrderId}
      />
    </div>
  );
});

PayPalFormComponent.displayName = "PayPalForm";

export const PayPalForm = PayPalFormComponent;
