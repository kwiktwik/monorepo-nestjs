/**
 * Razorpay Provider Implementation
 *
 * Implements PaymentProvider interface for Razorpay.
 * Loosely coupled: Only depends on razorpay SDK and crypto.
 */

import Razorpay from 'razorpay';
import crypto from 'crypto';

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
import type { RazorpayConfig } from '../types/payment-config.types';
import { PaymentError } from '../types/payment-provider.interface';

export class RazorpayProvider implements PaymentProvider {
  readonly providerType = 'razorpay';

  private readonly config: RazorpayConfig;
  private readonly client: Razorpay;

  constructor(config: RazorpayConfig) {
    this.config = config;
    this.client = new Razorpay({
      key_id: config.keyId,
      key_secret: config.keySecret,
    });
  }

  async createOrder(params: CreateOrderParams): Promise<OrderResult> {
    try {
      const orderData: any = {
        amount: params.amount,
        currency: params.currency || 'INR',
        notes: params.notes || {},
      };
      if (params.orderId) orderData.receipt = params.orderId;
      if (params.customer?.id) orderData.notes.customer_id = params.customer.id;

      const order = await this.client.orders.create(orderData);

      return {
        orderId: order.id,
        amount:
          typeof order.amount === 'string'
            ? parseInt(order.amount, 10)
            : order.amount,
        currency: order.currency,
        status: this.mapOrderStatus(order.status),
        provider: 'razorpay',
        providerData: {
          entity: order.entity,
          attempts: order.attempts,
          created_at: order.created_at,
        },
      };
    } catch (error: any) {
      throw new PaymentError(
        `Razorpay order creation failed: ${error.message}`,
        'ORDER_CREATION_FAILED',
        'razorpay',
        error,
      );
    }
  }

  async verifyPayment(params: VerifyPaymentParams): Promise<VerifyResult> {
    try {
      if (params.signature && params.paymentId) {
        const isValid = this.verifySignature(
          params.orderId,
          params.paymentId,
          params.signature,
        );
        if (!isValid) {
          return {
            isValid: false,
            orderId: params.orderId,
            status: 'failed',
            error: 'Signature verification failed',
            provider: 'razorpay',
          };
        }
      }
      const payments = await this.client.orders.fetchPayments(params.orderId);
      const payment = payments.items.find(
        (p: any) => p.status === 'captured' || p.status === 'authorized',
      );
      if (!payment) {
        return {
          isValid: false,
          orderId: params.orderId,
          status: 'pending',
          error: 'No successful payment found',
          provider: 'razorpay',
        };
      }
      return {
        isValid: true,
        paymentId: payment.id ?? undefined,
        orderId: params.orderId,
        status: payment.status === 'captured' ? 'captured' : 'authorized',
        amount:
          typeof payment.amount === 'string'
            ? parseInt(payment.amount, 10)
            : payment.amount,
        provider: 'razorpay',
        providerData: { paymentMethod: payment.method },
      };
    } catch (error: any) {
      throw new PaymentError(
        `Razorpay verification failed: ${error.message}`,
        'VERIFICATION_FAILED',
        'razorpay',
        error,
      );
    }
  }

  async createSubscription(
    params: CreateSubscriptionParams,
  ): Promise<SubscriptionResult> {
    try {
      const subData: any = {
        plan_id: params.planId,
        customer_id: params.customer?.id,
        notes: params.notes || {},
      };
      if (params.expireAt)
        subData.expire_by = Math.floor(params.expireAt / 1000);
      const subscription = await this.client.subscriptions.create(subData);
      return {
        subscriptionId: subscription.id,
        customerId: subscription.customer_id ?? undefined,
        status: this.mapSubscriptionStatus(subscription.status),
        provider: 'razorpay',
        providerData: {
          plan_id: subscription.plan_id,
          created_at: subscription.created_at,
        },
      };
    } catch (error: any) {
      throw new PaymentError(
        `Razorpay subscription creation failed: ${error.message}`,
        'SUBSCRIPTION_CREATION_FAILED',
        'razorpay',
        error,
      );
    }
  }

  async handleWebhook(params: HandleWebhookParams): Promise<WebhookResult> {
    try {
      const payload =
        typeof params.payload === 'string'
          ? JSON.parse(params.payload)
          : params.payload;
      const eventType = payload.event || 'unknown';

      if (this.config.webhookSecret && params.signature) {
        const isValid = this.verifyWebhookSignature(
          params.payload,
          params.signature,
        );
        if (!isValid)
          return { isValid: false, eventType, payload, provider: 'razorpay' };
      }

      const orderId =
        payload.payload?.payment?.entity?.order_id ||
        payload.payload?.order?.entity?.id;
      const paymentId = payload.payload?.payment?.entity?.id;
      const subscriptionId = payload.payload?.subscription?.entity?.id;

      return {
        isValid: true,
        eventType,
        orderId,
        paymentId,
        subscriptionId,
        payload,
        provider: 'razorpay',
      };
    } catch (error: any) {
      throw new PaymentError(
        `Razorpay webhook failed: ${error.message}`,
        'WEBHOOK_ERROR',
        'razorpay',
        error,
      );
    }
  }

  async refund(
    orderId: string,
    amount?: number,
  ): Promise<import('../types/common.types').RefundResult> {
    try {
      const refundData: any = { notes: { refund_reason: 'User requested' } };
      if (amount) refundData.amount = amount;
      const refund = await this.client.payments.refund(orderId, refundData);
      return {
        refundId: refund.id,
        orderId,
        amount: refund.amount ?? 0,
        status: refund.status === 'processed' ? 'processed' : 'pending',
        providerData: { notes: refund.notes, created_at: refund.created_at },
      };
    } catch (error: any) {
      throw new PaymentError(
        `Razorpay refund failed: ${error.message}`,
        'REFUND_FAILED',
        'razorpay',
        error,
      );
    }
  }

  async checkOrderStatus(orderId: string): Promise<OrderResult> {
    try {
      const order = await this.client.orders.fetch(orderId);
      return {
        orderId: order.id,
        amount:
          typeof order.amount === 'string'
            ? parseInt(order.amount, 10)
            : order.amount,
        currency: order.currency,
        status: this.mapOrderStatus(order.status),
        provider: 'razorpay',
        providerData: {
          attempts: order.attempts,
          created_at: order.created_at,
        },
      };
    } catch (error: any) {
      throw new PaymentError(
        `Razorpay order status check failed: ${error.message}`,
        'STATUS_CHECK_FAILED',
        'razorpay',
        error,
      );
    }
  }

  getPublicConfig(): Record<string, unknown> {
    return {
      provider: 'razorpay',
      keyId: this.config.keyId,
      environment: this.config.environment,
    };
  }

  async healthCheck(): Promise<{ healthy: boolean; message?: string }> {
    try {
      await this.client.orders.all({ count: 1 });
      return { healthy: true, message: 'Razorpay API accessible' };
    } catch (error: any) {
      return { healthy: false, message: error.message };
    }
  }

  private verifySignature(
    orderId: string,
    paymentId: string,
    signature: string,
  ): boolean {
    const body = `${orderId}|${paymentId}`;
    const expected = crypto
      .createHmac('sha256', this.config.keySecret)
      .update(body)
      .digest('hex');
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expected),
    );
  }

  private verifyWebhookSignature(payload: any, signature: string): boolean {
    if (!this.config.webhookSecret) return true;
    const payloadStr =
      typeof payload === 'string' ? payload : JSON.stringify(payload);
    const expected = crypto
      .createHmac('sha256', this.config.webhookSecret)
      .update(payloadStr)
      .digest('hex');
    try {
      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expected),
      );
    } catch {
      return false;
    }
  }

  private mapOrderStatus(
    status: string,
  ): import('../types/common.types').OrderStatus {
    const map: Record<string, import('../types/common.types').OrderStatus> = {
      created: 'created',
      attempted: 'attempted',
      paid: 'paid',
      cancelled: 'cancelled',
    };
    return map[status] || 'pending';
  }

  private mapSubscriptionStatus(
    status: string,
  ): import('../types/common.types').SubscriptionStatus {
    const map: Record<
      string,
      import('../types/common.types').SubscriptionStatus
    > = {
      created: 'created',
      authenticated: 'authenticated',
      active: 'active',
      paused: 'paused',
      cancelled: 'cancelled',
      completed: 'completed',
      halted: 'halted',
    };
    return map[status] || 'pending';
  }
}
