import { redirect } from "next/navigation"
import { getOrderByNumber } from "../queries"
import { ThankYouView } from "./components/thank-you-view"
import type { Order } from "../components/types"

export default async function ThankYouPage({ 
  searchParams 
}: { 
  searchParams: { orderNumber: string } 
}) {
  const { orderNumber } = searchParams
  
  if (!orderNumber) {
    redirect("/")
  }

  const orderData = await getOrderByNumber(orderNumber)
  if (!orderData) {
    redirect("/")
  }

  // 确保返回的数据符合 Order 接口
  const order: Order = {
    ...orderData,
    tax: orderData.tax || null,
    paymentId: orderData.paymentId || null,
    updatedAt: orderData.updatedAt || new Date(),
    refundedAt: orderData.refundedAt || null,
    cancelledAt: orderData.cancelledAt || null,
    affiliateId: orderData.affiliateId || null,
    affiliatePaymentId: orderData.affiliatePaymentId || null,
    license: orderData.license ? {
      id: orderData.license.id,
      licenseKey: orderData.license.licenseKey,
      status: orderData.license.status,
      expiresAt: orderData.license.expiresAt,
      activatedAt: orderData.license.activatedAt,
      orderId: orderData.license.orderId,
      createdAt: orderData.license.createdAt,
      updatedAt: orderData.license.updatedAt,
    } : null,
  }

  return <ThankYouView order={order} />
} 