import { 
  PaymentGateway, 
  PaymentGatewayConfig, 
  CreateOrderParams, 
  CreateOrderResult,
  VerifyPaymentParams, 
  VerifyPaymentResult 
} from '../interfaces/payment-gateway';

/**
 * PayPal支付网关实现
 */
export class PayPalGateway implements PaymentGateway {
  private clientId: string;
  private clientSecret: string;
  name = 'paypal';

  constructor(config: PaymentGatewayConfig) {
    this.clientId = config.apiKey || process.env.PAYPAL_CLIENT_ID!;
    this.clientSecret = config.apiSecret || process.env.PAYPAL_CLIENT_SECRET!;
  }

  /**
   * 创建PayPal订单
   * @param params 创建订单参数
   * @returns 创建订单结果
   */
  async createOrder(params: CreateOrderParams): Promise<CreateOrderResult> {
    try {
      // 获取访问令牌
      const accessToken = await this.getAccessToken();
      
      // 创建订单
      const response = await fetch(`${this.getApiBaseUrl()}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [{
            amount: {
              currency_code: params.currency,
              value: params.amount.toFixed(2)
            },
            description: params.metadata?.description || 'Purchase'
          }]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`PayPal API error: ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      
      return { 
        orderId: data.id,
        links: data.links,
        status: data.status
      };
    } catch (error) {
      console.error('Failed to create PayPal order:', error);
      throw new Error('Failed to create payment order');
    }
  }

  /**
   * 验证PayPal支付
   * @param params 验证支付参数
   * @returns 验证结果
   */
  async verifyPayment(params: VerifyPaymentParams): Promise<VerifyPaymentResult> {
    try {
      const { orderId, paymentId } = params;

      // 获取访问令牌
      const accessToken = await this.getAccessToken();

      // 获取订单详情
      const response = await fetch(`${this.getApiBaseUrl()}/v2/checkout/orders/${orderId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`PayPal API error: ${JSON.stringify(errorData)}`);
      }

      const orderData = await response.json();
      
      // 如果需要捕获付款（对于已授权但未捕获的付款）
      if (orderData.status === 'APPROVED') {
        // 捕获付款
        const captureResponse = await fetch(`${this.getApiBaseUrl()}/v2/checkout/orders/${orderId}/capture`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({})
        });
        
        if (!captureResponse.ok) {
          const errorData = await captureResponse.json();
          throw new Error(`PayPal API error: ${JSON.stringify(errorData)}`);
        }
        
        const captureData = await captureResponse.json();
        
        // 使用捕获数据提取支付详情
        return this.extractPaymentDetails(captureData);
      }
      
      // 订单已经完成，直接使用订单数据提取支付详情
      return this.extractPaymentDetails(orderData);
    } catch (error) {
      return { 
        verified: false, 
        status: 'ERROR', 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  }

  /**
   * 从 PayPal 响应中提取支付详情
   */
  private extractPaymentDetails(data: any): VerifyPaymentResult {
    let orderAmount = 0;
    const gatewayFeeCurrency = 'USD';
    
    // 从数据中获取订单金额
    if (data.purchase_units && data.purchase_units[0] && data.purchase_units[0].amount) {
      const amountData = data.purchase_units[0].amount;
      orderAmount = parseFloat(amountData.value);
    }
    
    // PayPal 暂时不获取手续费，使用固定值 0
    const gatewayFee = 0;
    
    return {
      verified: data.status === 'COMPLETED',
      status: data.status,
      error: data.status !== 'COMPLETED' ? 'Payment not completed' : undefined,
      gatewayFee,
      orderAmount,
      gatewayFeeCurrency
    };
  }

  /**
   * 获取PayPal客户端配置
   * @returns 客户端配置
   */
  getClientConfig(): Record<string, any> {
    return {
      clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
      currency: 'USD',
      intent: 'CAPTURE',
      name: 'NextPion',
      description: 'Payment for products',
      environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox'
    };
  }

  /**
   * 获取PayPal访问令牌
   * @returns 访问令牌
   */
  private async getAccessToken(): Promise<string> {
    const response = await fetch(`${this.getApiBaseUrl()}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`
      },
      body: 'grant_type=client_credentials'
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to get PayPal access token: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return data.access_token;
  }

  /**
   * 获取PayPal API基础URL
   * @returns API基础URL
   */
  private getApiBaseUrl(): string {
    return process.env.NODE_ENV === 'production'
      ? 'https://api.paypal.com'
      : 'https://api.sandbox.paypal.com';
  }
}
