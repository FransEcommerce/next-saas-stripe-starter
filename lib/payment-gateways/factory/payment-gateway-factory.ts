import { PaymentGateway, PaymentGatewayConfig } from '../interfaces/payment-gateway';

/**
 * 支付网关工厂类
 * 用于创建和管理不同的支付网关实例
 */
export class PaymentGatewayFactory {
  private static gateways: Record<string, new (config: PaymentGatewayConfig) => PaymentGateway> = {};

  /**
   * 注册支付网关
   * @param type 支付网关类型
   * @param gatewayClass 支付网关类
   */
  static registerGateway(
    type: string, 
    gatewayClass: new (config: PaymentGatewayConfig) => PaymentGateway
  ): void {
    this.gateways[type] = gatewayClass;
  }

  /**
   * 创建支付网关实例
   * @param type 支付网关类型
   * @param config 支付网关配置
   * @returns 支付网关实例
   */
  static createGateway(type: string, config: PaymentGatewayConfig = {}): PaymentGateway {
    const GatewayClass = this.gateways[type];
    
    if (!GatewayClass) {
      throw new Error(`Payment gateway '${type}' not supported`);
    }
    
    return new GatewayClass(config);
  }

  /**
   * 获取所有支持的支付网关类型
   * @returns 支付网关类型列表
   */
  static getSupportedGateways(): string[] {
    return Object.keys(this.gateways);
  }
}
