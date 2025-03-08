import { PaymentGatewayFactory } from './factory/payment-gateway-factory';
import { registerPaymentGateways } from './register-gateways';
import { CreateOrderParams, VerifyPaymentParams } from './interfaces/payment-gateway';

// 确保所有支付网关已注册
registerPaymentGateways();

/**
 * 支付网关服务
 * 提供在服务器操作（Server Actions）中使用的支付网关功能
 */
export class PaymentGatewayService {
  /**
   * 创建支付订单
   * @param gateway 支付网关类型
   * @param params 创建订单参数
   * @returns 创建订单结果
   */
  static async createOrder(gateway: string, params: CreateOrderParams) {
    try {
      const paymentGateway = PaymentGatewayFactory.createGateway(gateway);
      return await paymentGateway.createOrder(params);
    } catch (error) {
      console.error(`Failed to create ${gateway} order:`, error);
      throw new Error(`Failed to create payment order: ${error.message}`);
    }
  }

  /**
   * 验证支付
   * @param gateway 支付网关类型
   * @param params 验证支付参数
   * @returns 验证结果
   */
  static async verifyPayment(gateway: string, params: VerifyPaymentParams) {
    try {
      const paymentGateway = PaymentGatewayFactory.createGateway(gateway);
      return await paymentGateway.verifyPayment(params);
    } catch (error) {
      console.error(`Payment verification failed for ${gateway}:`, error);
      return { 
        verified: false, 
        error: `Payment verification failed: ${error.message}` 
      };
    }
  }

  /**
   * 获取支付网关客户端配置
   * @param gateway 支付网关类型
   * @returns 客户端配置
   */
  static getClientConfig(gateway: string) {
    try {
      const paymentGateway = PaymentGatewayFactory.createGateway(gateway);
      return paymentGateway.getClientConfig();
    } catch (error) {
      console.error(`Failed to get client config for ${gateway}:`, error);
      return {};
    }
  }

  /**
   * 获取所有支持的支付网关
   * @returns 支付网关列表
   */
  static getSupportedGateways() {
    return PaymentGatewayFactory.getSupportedGateways();
  }
}
