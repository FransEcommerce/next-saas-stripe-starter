import { NextRequest, NextResponse } from 'next/server'
import { PaymentGatewayFactory } from '@/lib/payment-gateways/factory/payment-gateway-factory'
import { registerPaymentGateways } from '@/lib/payment-gateways/register-gateways'

// 确保所有支付网关已注册
registerPaymentGateways();

export async function POST(request: NextRequest) {
  try {
    // 记录请求体
    const requestBody = await request.text();
    
    // 解析请求体
    const requestData = JSON.parse(requestBody);
    const { orderId, paymentId } = requestData;
    
    if (!orderId) {
      return NextResponse.json({ 
        verified: false,
        error: 'Missing order ID' 
      }, { 
        status: 400 
      });
    }

    // 创建 PayPal 支付网关实例
    const paymentGateway = PaymentGatewayFactory.createGateway('paypal');
    
    // 调用 PayPal 支付网关验证支付
    const result = await paymentGateway.verifyPayment({ 
      orderId, 
      paymentId: paymentId || orderId
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('PayPal 支付验证失败:', error);
    return NextResponse.json({ 
      verified: false,
      error: error instanceof Error ? `Payment verification failed: ${error.message}` : 'Payment verification failed' 
    }, { 
      status: 400 
    });
  }
}
