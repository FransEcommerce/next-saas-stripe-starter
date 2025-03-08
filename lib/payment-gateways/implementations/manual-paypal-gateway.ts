import { 
  PaymentGateway, 
  PaymentGatewayConfig, 
  CreateOrderParams, 
  CreateOrderResult,
  VerifyPaymentParams, 
  VerifyPaymentResult 
} from '../interfaces/payment-gateway';

/**
 * 手动 PayPal 转账网关实现
 */
export class ManualPaypalGateway implements PaymentGateway {
  private config: PaymentGatewayConfig;
  name = 'manualPaypal';

  constructor(config: PaymentGatewayConfig) {
    this.config = config;
  }

  /**
   * 创建手动 PayPal 转账订单
   * @param params 创建订单参数
   * @returns 创建订单结果
   */
  async createOrder(params: CreateOrderParams): Promise<CreateOrderResult> {
    // 为手动转账生成一个唯一的订单ID
    const orderId = `MANUAL_PAYPAL_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    
    return { 
      orderId,
      amount: params.amount,
      currency: params.currency
    };
  }

  /**
   * 验证手动 PayPal 转账支付
   * 对于手动转账，我们假设管理员会在后台验证付款证明
   * @param params 验证支付参数
   * @returns 验证结果
   */
  async verifyPayment(params: VerifyPaymentParams): Promise<VerifyPaymentResult> {
    // 对于手动转账，我们假设支付已经被验证（因为用户已经上传了付款证明）
    // 实际验证将由管理员在后台完成
    
    // 从元数据中获取金额和货币信息（如果有的话）
    const amount = params.metadata?.amount || 0;
    const currency = params.metadata?.currency || 'USD';
    
    return {
      verified: true,
      status: 'PENDING', // 手动转账通常需要等待管理员确认
      gatewayFee: 0, // 手动转账没有网关费用
      orderAmount: amount,
      gatewayFeeCurrency: currency
    };
  }

  /**
   * 获取手动 PayPal 转账客户端配置
   * @returns 客户端配置
   */
  getClientConfig(): Record<string, any> {
    return {
      name: "Manual PayPal Transfer",
      description: "Upload PayPal payment proof after transfer",
      icon: "paypal",
      paypalDetails: {
        accountName: process.env.PAYPAL_ACCOUNT_NAME || 'Your PayPal Name',
        accountEmail: process.env.PAYPAL_ACCOUNT_EMAIL || 'your.email@example.com'
      },
      instructions: 'Please transfer the amount to our PayPal account and upload the payment proof.',
      uploadInstructions: 'Upload a screenshot of your PayPal payment confirmation.'
    };
  }
}
