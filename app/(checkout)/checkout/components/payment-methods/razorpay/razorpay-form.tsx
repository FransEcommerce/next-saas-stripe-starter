"use client"

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'

interface RazorpayFormProps {
  total: number
  formData: {
    billingName: string
    billingEmail: string
    billingPhone: string
  }
  onPaymentComplete: (paymentData: {
    razorpayPaymentId: string
    razorpayOrderId: string
    razorpaySignature: string
    paymentMethod: string
  }) => void
  onCreateOrder: (orderData: any) => Promise<{ success: boolean; orderNumber?: string; error?: string }>
  productName: string
}

export function RazorpayForm({ 
  total, 
  formData, 
  onPaymentComplete,
  onCreateOrder,
  productName
}: RazorpayFormProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()

  // 添加 Razorpay 脚本
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const handlePayment = async () => {
    if (isProcessing) return
    setIsProcessing(true)

    try {
      // 1. 创建 Razorpay 订单
      const response = await fetch('/api/payment-gateways/razorpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total, currency: 'USD' })
      })

      if (!response.ok) throw new Error('Failed to create order')
      const data = await response.json()

      // 2. 配置 Razorpay 选项
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: total * 100,
        currency: 'USD',
        name: 'NextPion',
        description: productName,
        image: 'https://nextpion.frs.com.my/favicon.png',
        order_id: data.orderId,
        handler: async function (response: any) {
          try {
            // 验证支付
            const verifyResponse = await fetch('/api/payment-gateways/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderCreationId: data.orderId,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature
              })
            })

            const verifyResult = await verifyResponse.json()

            if (!verifyResult.verified) {
              throw new Error('Payment verification failed')
            }

            // 支付验证成功，创建已完成状态的订单
            const paymentData = {
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: data.orderId,
              razorpaySignature: response.razorpay_signature,
              paymentMethod: 'razorpay',
              status: "COMPLETED"
            }

            // 创建订单
            const orderResult = await onCreateOrder(paymentData)
            
            if (orderResult.success && orderResult.orderNumber) {
              toast.success('Payment successful!')
              router.push(`/checkout/thank-you?orderNumber=${orderResult.orderNumber}`)
            } else {
              throw new Error(orderResult.error || 'Failed to create order')
            }
          } catch (error) {
            console.error('Order creation failed:', error)
            toast.error('Payment verification failed. Please contact support.')
          }
        },
        modal: {
          ondismiss: function() {
            // 用户关闭支付窗口
            toast.error('Payment cancelled')
          }
        },
        prefill: {
          name: formData.billingName,
          email: formData.billingEmail,
          contact: formData.billingPhone
        },
        theme: {
          color: '#000000'
        }
      }

      // 3. 初始化 Razorpay
      const razorpay = new (window as any).Razorpay(options)
      razorpay.open()

    } catch (error) {
      console.error('Payment failed:', error)
      toast.error('Payment failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Button
      type="button"
      className="flex-1"
      disabled={isProcessing}
      onClick={handlePayment}
    >
      {isProcessing ? (
        <div className="flex items-center">
          <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
          Processing...
        </div>
      ) : (
        "Pay Now"
      )}
    </Button>
  )
} 