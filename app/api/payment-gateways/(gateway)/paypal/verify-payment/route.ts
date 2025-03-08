import { NextRequest, NextResponse } from 'next/server'
import { PaymentGatewayFactory } from '@/lib/payment-gateways/factory/payment-gateway-factory'
import { registerPaymentGateways } from '@/lib/payment-gateways/register-gateways'

// 确保所有支付网关已注册
registerPaymentGateways();

export async function POST(request: NextRequest) {
  console.log('PayPal 验证支付请求开始处理');
  
  try {
    // 记录请求体
    const requestBody = await request.text();
    console.log('PayPal 验证支付请求体:', requestBody);
    
    // 解析请求体
    const requestData = JSON.parse(requestBody);
    const { orderId, paymentId } = requestData;
    
    console.log('PayPal 验证支付参数:', { orderId, paymentId });

    if (!orderId) {
      console.error('PayPal 验证支付缺少订单ID');
      return NextResponse.json({ 
        verified: false,
        error: 'Missing order ID' 
      }, { 
        status: 400 
      });
    }

    // 创建 PayPal 支付网关实例
    console.log('创建 PayPal 支付网关实例');
    const paymentGateway = PaymentGatewayFactory.createGateway('paypal');
    
    // 调用 PayPal 支付网关验证支付
    console.log('开始验证 PayPal 支付:', { orderId, paymentId: paymentId || orderId });
    const result = await paymentGateway.verifyPayment({ 
      orderId, 
      paymentId: paymentId || orderId
    });
    
    console.log('PayPal 支付验证结果:', result);

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
