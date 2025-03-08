import { NextRequest, NextResponse } from 'next/server'
import { PaymentGatewayFactory } from '@/lib/payment-gateways/factory/payment-gateway-factory'
import { registerPaymentGateways } from '@/lib/payment-gateways/register-gateways'

// 确保所有支付网关已注册
registerPaymentGateways();

export async function POST(request: NextRequest) {
  try {
    const { amount, currency, metadata } = await request.json();

    // 创建指定的支付网关实例
    const paymentGateway = PaymentGatewayFactory.createGateway('paypal');
    
    // 调用支付网关创建订单
    const result = await paymentGateway.createOrder({ 
      amount, 
      currency, 
      metadata 
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to create paypal order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
