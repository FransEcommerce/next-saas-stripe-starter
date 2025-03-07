import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function POST(request: NextRequest) {
  try {
    const { amount, currency } = await request.json()

    const order = await razorpay.orders.create({
      amount: amount * 100, // Razorpay 使用最小货币单位（分）
      currency,
    })

    return NextResponse.json({ orderId: order.id })
  } catch (error) {
    console.error('Failed to create Razorpay order:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
} 