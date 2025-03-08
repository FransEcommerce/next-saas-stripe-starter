import Razorpay from 'razorpay';
import crypto from 'crypto';
import { 
  PaymentGateway, 
  PaymentGatewayConfig, 
  CreateOrderParams, 
  CreateOrderResult,
  VerifyPaymentParams, 
  VerifyPaymentResult 
} from '../interfaces/payment-gateway';

/**
 * Razorpay支付网关实现
 */
export class RazorpayGateway implements PaymentGateway {
  private client: Razorpay;
  private keyId: string;
  private keySecret: string;
  name = 'razorpay';

  constructor(config: PaymentGatewayConfig) {
    this.keyId = config.apiKey || process.env.RAZORPAY_KEY_ID!;
    this.keySecret = config.apiSecret || process.env.RAZORPAY_KEY_SECRET!;
    this.client = new Razorpay({
      key_id: this.keyId,
      key_secret: this.keySecret,
    });
  }

  /**
   * 创建Razorpay订单
   * @param params 创建订单参数
   * @returns 创建订单结果
   */
  async createOrder(params: CreateOrderParams): Promise<CreateOrderResult> {
    try {
      const order = await this.client.orders.create({
        amount: Math.round(params.amount * 100), // 转换为最小货币单位（分）
        currency: params.currency,
        ...params.metadata,
      });

      return { 
        orderId: order.id,
        amount: order.amount,
        currency: order.currency
      };
    } catch (error) {
      throw new Error('Failed to create payment order');
    }
  }

  /**
   * 验证Razorpay支付
   * @param params 验证支付参数
   * @returns 验证结果
   */
  async verifyPayment(params: VerifyPaymentParams): Promise<VerifyPaymentResult> {
    try {
      const { paymentId, orderId, signature, razorpayOrderId, razorpaySignature } = params;
      
      // 使用 razorpayOrderId 和 razorpaySignature，如果提供的话，否则使用 orderId 和 signature
      const orderIdToVerify = razorpayOrderId || orderId;
      const signatureToVerify = razorpaySignature || signature;
      
      if (!paymentId || !orderIdToVerify || !signatureToVerify) {
        return { 
          verified: false, 
          error: 'Missing required parameters' 
        };
      }
      
      // 验证签名
      const isVerified = this.validateSignature(orderIdToVerify, paymentId, signatureToVerify);
      
      let gatewayFee = 0;
      let orderAmount = 0;
      let gatewayFeeCurrency = 'USD';
      
      if (isVerified) {
        try {
          // 获取支付详情以获取金额和手续费信息
          const paymentDetails = await this.fetchPaymentDetails(paymentId);
          
          if (paymentDetails && paymentDetails.amount) {
            // Razorpay 金额以最小单位表示（例如，印度卢比为 paise，美元为 cents）
            // 需要除以 100 转换为主要货币单位
            orderAmount = paymentDetails.amount / 100;
            
            // 获取货币信息
            gatewayFeeCurrency = paymentDetails.currency || 'USD';
            
            // 尝试从支付详情中获取手续费信息
            if (paymentDetails.fee) {
              // Razorpay 手续费也是以最小单位表示
              gatewayFee = paymentDetails.fee / 100;
              
              // 检查是否有 base_currency，如果有，使用它作为手续费货币
              if (paymentDetails.base_currency) {
                gatewayFeeCurrency = paymentDetails.base_currency;
              }
            } else {
              // 如果手续费信息不可用，使用估算
              // Razorpay 标准费率: 2% + GST (18% of fee)
              const baseFee = orderAmount * 0.02;
              const gst = baseFee * 0.18;
              gatewayFee = baseFee + gst;
            }
            
            // 四舍五入到两位小数
            gatewayFee = Math.round(gatewayFee * 100) / 100;
          }
        } catch (error) {
          // 即使获取订单详情失败，我们仍然返回验证成功
        }
      }
      
      return {
        verified: isVerified,
        status: isVerified ? 'COMPLETED' : 'FAILED',
        error: isVerified ? undefined : 'Signature verification failed',
        gatewayFee,
        orderAmount,
        gatewayFeeCurrency
      };
    } catch (error) {
      return { 
        verified: false,
        error: 'Payment verification failed'
      };
    }
  }

  /**
   * 验证签名
   * @param orderId 订单ID
   * @param paymentId 支付ID
   * @param signature 签名
   * @returns 验证结果
   */
  private validateSignature(orderId: string, paymentId: string, signature: string): boolean {
    const text = `${orderId}|${paymentId}`;
    const generatedSignature = crypto
      .createHmac('sha256', this.keySecret)
      .update(text)
      .digest('hex');
    return generatedSignature === signature;
  }

  /**
   * 获取支付详情
   * @param paymentId 支付ID
   * @returns 支付详情
   */
  private async fetchPaymentDetails(paymentId: string) {
    try {
      const auth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');
      const response = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Razorpay API error: ${JSON.stringify(errorData)}`);
      }
      
      const paymentDetails = await response.json();
      return paymentDetails;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 获取Razorpay客户端配置
   * @returns 客户端配置
   */
  getClientConfig(): Record<string, any> {
    return {
      keyId: this.keyId,
      currency: 'USD',
      name: 'NextPion ss',
      description: 'Payment for products',
      image: 'https://nextpion.frs.com.my/favicon.png',
      theme: {
        color: '#000000'
      }
    };
  }
}
