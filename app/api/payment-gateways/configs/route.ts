import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 这里可以从数据库或环境变量中获取配置
    // 现在我们使用硬编码的配置作为示例
    const configs = {
      razorpay: {
        keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        name: "Razorpay",
        description: "Pay with Credit/Debit Card, UPI, Netbanking",
        icon: "credit-card"
      },
      manualTransfer: {
        name: "Manual Bank Transfer",
        description: "Upload payment proof after bank transfer",
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
          accountName: process.env.PAYPAL_ACCOUNT_NAME || 'Your PayPal Name',
          accountEmail: process.env.PAYPAL_ACCOUNT_EMAIL || 'your.email@example.com'
        },
        instructions: 'Please transfer the amount to our PayPal account and upload the payment proof.',
        uploadInstructions: 'Upload a screenshot of your PayPal payment confirmation.'
      }
    };

    return NextResponse.json(configs);
  } catch (error) {
    console.error('Error fetching payment gateway configs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment gateway configurations' },
      { status: 500 }
    );
  }
}
