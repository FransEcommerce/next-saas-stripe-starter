import { NextRequest, NextResponse } from 'next/server'
import { PaymentGatewayFactory } from '@/lib/payment-gateways/factory/payment-gateway-factory'
import { registerPaymentGateways } from '@/lib/payment-gateways/register-gateways'

// 确保所有支付网关已注册
registerPaymentGateways();

export async function POST(request: NextRequest) {
  try {
    const requestData = await request.json();
    const { orderId, paymentId, signature, ...otherData } = requestData;

    // 创建指定的支付网关实例
    const paymentGateway = PaymentGatewayFactory.createGateway('razorpay');
    
    // 调用支付网关验证支付
    const result = await paymentGateway.verifyPayment({ 
      orderId, 
      paymentId, 
      signature,
      metadata: otherData // 将其他数据作为元数据传递
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Payment verification failed for razorpay:', error);
    return NextResponse.json({ 
      verified: false,
      error: 'Payment verification failed' 
    }, { 
      status: 400 
    });
  }
}
