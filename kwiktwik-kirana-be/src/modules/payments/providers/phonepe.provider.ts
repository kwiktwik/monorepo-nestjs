/**
 * PhonePe Provider Implementation
 *
 * Implements PaymentProvider for PhonePe using pg-sdk-node.
 * Loosely coupled: Only depends on pg-sdk-node.
 */

import { StandardCheckoutClient, Env, CreateSdkOrderRequest } from 'pg-sdk-node';

import type { PaymentProvider } from '../types/payment-provider.interface';
import type {
  CreateOrderParams,
  OrderResult,
  VerifyPaymentParams,
  VerifyResult,
  CreateSubscriptionParams,
  SubscriptionResult,
  HandleWebhookParams,
  WebhookResult,
} from '../types/common.types';
import type { PhonePeConfig } from '../types/payment-config.types';
import { PaymentError, UnsupportedOperationError } from '../types/payment-provider.interface';

export class PhonePeProvider implements PaymentProvider {
  readonly providerType = 'phonepe';

  private readonly config: PhonePeConfig;
  private readonly client: StandardCheckoutClient;

  constructor(config: PhonePeConfig) {
    this.config = config;
    const sdkEnv = config.environment === 'production' ? Env.PRODUCTION : Env.SANDBOX;
    this.client = StandardCheckoutClient.getInstance(
      config.clientId,
      config.clientSecret,
      config.clientVersion || 1,
      sdkEnv,
    );
  }

  async createOrder(params: CreateOrderParams): Promise<OrderResult> {
    try {
      const builder = CreateSdkOrderRequest.CustomCheckoutBuilder()
        .merchantOrderId(params.orderId || this.generateOrderId())
        .amount(params.amount)
        .redirectUrl(params.redirectUrl || this.config.redirectUrl || '');
      const request = builder.build();
      const response = await this.client.createSdkOrder(request);
      return {
        orderId: response.orderId,
        amount: params.amount,
        currency: 'INR',
        status: 'created',
        provider: 'phonepe',
        token: response.token,
        expiresAt: response.expireAt,
        providerData: { state: response.state },
      };
    } catch (error: any) {
      throw new PaymentError(`PhonePe order creation failed: ${error.message}`, 'ORDER_CREATION_FAILED', 'phonepe', error);
    }
  }

  async verifyPayment(params: VerifyPaymentParams): Promise<VerifyResult> {
    try {
      const statusResponse = await this.client.getOrderStatus(params.orderId);
      const paymentDetails = statusResponse.paymentDetails?.[0];
      return {
        isValid: statusResponse.state === 'COMPLETED' || statusResponse.state === 'PAID',
        paymentId: paymentDetails?.transactionId,
        orderId: params.orderId,
        status: this.mapPhonePeState(statusResponse.state) as import('../types/common.types').PaymentStatus,
        amount: statusResponse.amount,
        provider: 'phonepe',
        providerData: { state: statusResponse.state, paymentMode: paymentDetails?.paymentMode },
      };
    } catch (error: any) {
      throw new PaymentError(`PhonePe verification failed: ${error.message}`, 'VERIFICATION_FAILED', 'phonepe', error);
    }
  }

  async createSubscription(params: CreateSubscriptionParams): Promise<SubscriptionResult> {
    throw new UnsupportedOperationError('phonepe', 'createSubscription');
  }

  async handleWebhook(params: HandleWebhookParams): Promise<WebhookResult> {
    try {
      const payload = typeof params.payload === 'string' ? JSON.parse(params.payload) : params.payload;
      const eventType = (payload as any).event || (payload as any).type || 'unknown';
      const orderId = (payload as any).payload?.orderId || (payload as any).payload?.merchantOrderId || (payload as any).orderId;
      return { isValid: true, eventType, orderId, payload, provider: 'phonepe' };
    } catch (error: any) {
      throw new PaymentError(`PhonePe webhook failed: ${error.message}`, 'WEBHOOK_ERROR', 'phonepe', error);
    }
  }

  async checkOrderStatus(orderId: string): Promise<OrderResult> {
    try {
      const statusResponse = await this.client.getOrderStatus(orderId);
      return {
        orderId,
        amount: statusResponse.amount,
        currency: 'INR',
        status: this.mapPhonePeState(statusResponse.state) as import('../types/common.types').OrderStatus,
        provider: 'phonepe',
        providerData: { state: statusResponse.state, paymentDetails: statusResponse.paymentDetails },
      };
    } catch (error: any) {
      throw new PaymentError(`PhonePe order status check failed: ${error.message}`, 'STATUS_CHECK_FAILED', 'phonepe', error);
    }
  }

  getPublicConfig(): Record<string, unknown> {
    return { provider: 'phonepe', environment: this.config.environment, merchantId: this.config.merchantId };
  }

  async healthCheck(): Promise<{ healthy: boolean; message?: string }> {
    return { healthy: true, message: 'PhonePe client initialized' };
  }

  private generateOrderId(): string {
    return `PP_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private mapPhonePeState(state: string): import('../types/common.types').OrderStatus | import('../types/common.types').PaymentStatus {
    const map: Record<string, import('../types/common.types').PaymentStatus> = {
      CREATED: 'pending',
      COMPLETED: 'completed',
      PAID: 'captured',
      FAILED: 'failed',
      CANCELLED: 'failed',
      PENDING: 'pending',
    };
    return map[state] || 'pending';
  }
}
