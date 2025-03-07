import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { orderCreationId, razorpayPaymentId, razorpaySignature } = await request.json()

    // 生成签名验证字符串
    const text = `${orderCreationId}|${razorpayPaymentId}`
    
    // 使用 HMAC-SHA256 算法生成签名
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(text)
      .digest('hex')

    // 验证签名
    if (generated_signature === razorpaySignature) {
      return NextResponse.json({ 
        verified: true 
      })
    } else {
      return NextResponse.json({ 
        verified: false 
      }, { 
        status: 400 
      })
    }
  } catch (error) {
    console.error('Payment verification failed:', error)
    return NextResponse.json({ 
      verified: false,
      error: 'Invalid signature' 
    }, { 
      status: 400 
    })
  }
} 