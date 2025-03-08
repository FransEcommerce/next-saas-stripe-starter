import { PaymentGatewayFactory } from './factory/payment-gateway-factory';
import { RazorpayGateway } from './implementations/razorpay-gateway';
import { ManualTransferGateway } from './implementations/manual-transfer-gateway';
import { PayPalGateway } from './implementations/paypal-gateway';
import { ManualPaypalGateway } from './implementations/manual-paypal-gateway';

/**
 * 注册所有支付网关
 * 在应用启动时调用此函数
 */
export function registerPaymentGateways(): void {
  // 注册 Razorpay 支付网关
  PaymentGatewayFactory.registerGateway('razorpay', RazorpayGateway);
  
  // 注册手动转账支付网关
  PaymentGatewayFactory.registerGateway('manual-transfer', ManualTransferGateway);
  
  // 注册 PayPal 支付网关
  PaymentGatewayFactory.registerGateway('paypal', PayPalGateway);
  
  // 注册 PayPal 手动转账支付网关
  PaymentGatewayFactory.registerGateway('manual-paypal', ManualPaypalGateway);
  
  // 在此处注册其他支付网关
  // PaymentGatewayFactory.registerGateway('stripe', StripeGateway);
}

/**
 * 获取支付网关配置
 * 返回所有支持的支付网关及其配置
 */
export function getPaymentGatewaysConfig() {
  const supportedGateways = PaymentGatewayFactory.getSupportedGateways();
  
  const gatewaysConfig = supportedGateways.map(type => {
    const gateway = PaymentGatewayFactory.createGateway(type);
    return {
      type,
      name: gateway.name,
      config: gateway.getClientConfig()
    };
  });
  
  return gatewaysConfig;
}
