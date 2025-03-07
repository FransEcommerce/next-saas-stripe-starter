import { redirect } from "next/navigation"
import { getOrderByNumber } from "../queries"
import { ThankYouView } from "./components/thank-you-view"

export default async function ThankYouPage({ 
  searchParams 
}: { 
  searchParams: { orderNumber: string } 
}) {
  const { orderNumber } = searchParams
  
  if (!orderNumber) {
    redirect("/")
  }

  const order = await getOrderByNumber(orderNumber)
  if (!order) {
    redirect("/")
  }

  return <ThankYouView order={order} />
} 