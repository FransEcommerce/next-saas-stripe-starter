import { 
  PaymentGateway, 
  PaymentGatewayConfig, 
  CreateOrderParams, 
  CreateOrderResult,
  VerifyPaymentParams, 
  VerifyPaymentResult 
} from '../interfaces/payment-gateway';

/**
 * 手动银行转账支付网关实现
 */
export class ManualTransferGateway implements PaymentGateway {
  name = 'manual-transfer';

  constructor(private config: PaymentGatewayConfig) {}

  /**
   * 创建手动转账订单
   * 由于手动转账不需要实际创建订单，此方法返回一个模拟订单ID
   * @param params 创建订单参数
   * @returns 创建订单结果
   */
  async createOrder(params: CreateOrderParams): Promise<CreateOrderResult> {
    // 生成一个唯一的订单ID
    const orderId = `manual-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
    
    return {
      orderId,
      amount: params.amount,
      currency: params.currency
    };
  }

  /**
   * 验证手动转账支付
   * 手动转账需要管理员审核，此方法主要验证支付凭证是否已上传
   * @param params 验证支付参数
   * @returns 验证结果
   */
  async verifyPayment(params: VerifyPaymentParams): Promise<VerifyPaymentResult> {
    // 检查是否有支付凭证
    const paymentProof = params.metadata?.paymentProof;
    
    if (!paymentProof) {
      return {
        verified: false,
        error: 'Payment proof is required'
      };
    }
    
    // 手动转账需要管理员审核，所以这里只是初步验证
    return {
      verified: true,
      status: 'PENDING', // 手动转账状态为待审核
      message: 'Payment proof submitted successfully. Waiting for admin approval.'
    };
  }

  /**
   * 获取手动转账客户端配置
   * @returns 客户端配置
   */
  getClientConfig(): Record<string, any> {
    return {
      bankDetails: {
        bankName: this.config.bankName || 'Example Bank',
        accountName: this.config.accountName || 'Your Company Name',
        accountNumber: this.config.accountNumber || '1234567890',
        swiftCode: this.config.swiftCode || 'EXAMPLEXXX',
      },
      instructions: this.config.instructions || 'Please transfer the amount and upload the payment proof.',
      uploadInstructions: 'Upload a screenshot or PDF of your payment receipt.'
    };
  }
}
