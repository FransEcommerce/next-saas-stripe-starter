/**
 * 支付网关接口定义
 * 所有支付网关实现都必须遵循此接口
 */

export interface PaymentGatewayConfig {
  apiKey?: string;
  apiSecret?: string;
  // 银行转账配置
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  swiftCode?: string;
  instructions?: string;
  // 其他通用配置
  [key: string]: any;
}

export interface CreateOrderParams {
  amount: number;
  currency: string;
  metadata?: Record<string, any>;
}

export interface CreateOrderResult {
  orderId: string;
  [key: string]: any;
}

export interface VerifyPaymentParams {
  orderId: string;
  paymentId: string;
  signature?: string;
  // Razorpay 特定参数
  razorpayOrderId?: string;
  razorpaySignature?: string;
  metadata?: Record<string, any>;
  // 其他验证参数
}

export interface VerifyPaymentResult {
  verified: boolean;
  error?: string;
  status?: string;
  gatewayFee?: number;        // 支付处理手续费
  gatewayFeeCurrency?: string; // 支付处理手续费货币
  orderAmount?: number;       // 订单总金额
  [key: string]: any;
}

export interface PaymentGateway {
  /**
   * 支付网关名称
   */
  name: string;
  
  /**
   * 创建支付订单
   * @param params 创建订单参数
   * @returns 创建订单结果
   */
  createOrder(params: CreateOrderParams): Promise<CreateOrderResult>;
  
  /**
   * 验证支付
   * @param params 验证支付参数
   * @returns 验证结果
   */
  verifyPayment(params: VerifyPaymentParams): Promise<VerifyPaymentResult>;
  
  /**
   * 获取客户端配置
   * 返回前端组件需要的配置信息
   */
  getClientConfig(): Record<string, any>;
}
