/**
 * Razorpay Subscription Provider Implementation
 * 
 * Handles both provider-managed and user-managed subscriptions for Razorpay.
 * 
 * Provider-Managed: Razorpay handles auto-charging on billing cycles
 * User-Managed: We initiate charges using Razorpay's order API
 */

import type { PaymentProvider } from '../../types/provider.enum';
import type { SubscriptionType } from '../../types/subscription-type.enum';
import type { SubscriptionStatus } from '../../types/subscription-status.enum';
import type { BillingFrequency } from '../../types/frequency.enum';
import {
  type RazorpayProviderConfig,
  type SetupSubscriptionParams,
  type SetupSubscriptionResult,
  type ChargeSubscriptionParams,
  type ChargeSubscriptionResult,
  type GetSubscriptionStatusParams,
  type SubscriptionStatusResult,
  type GetOrderStatusParams,
  type OrderStatusResult,
  type CancelSubscriptionParams,
  type CancelSubscriptionResult,
  type ParseWebhookParams,
  type WebhookEvent,
  type SubscriptionProvider,
} from '../interfaces/subscription-provider.interface';
import {
  type RazorpaySubscriptionEntity,
  type RazorpayOrderEntity,
  type RazorpayPaymentEntity,
  type RazorpayWebhookPayload,
  RazorpaySubscriptionStatus,
  RazorpayOrderStatus,
  RazorpayPaymentStatus,
  RazorpayWebhookEvent,
  mapRazorpaySubscriptionStatus,
  mapRazorpayOrderStatus,
  mapRazorpayPaymentStatus,
} from '../../types/razorpay.types';
import { toRazorpayPeriod } from '../../types/frequency.enum';
import {
  generateId,
  unixToDate,
  dateToUnix,
  verifyHmacSha256,
  createProviderError,
} from '../base/provider-utils';

// ============================================================================
// Razorpay Client Wrapper
// ============================================================================

/**
 * Razorpay API client wrapper
 * Abstracts the actual Razorpay SDK calls
 */
interface RazorpayClient {
  subscriptions: {
    create(params: RazorpaySubscriptionCreateParams): Promise<RazorpaySubscriptionEntity>;
    fetch(subscriptionId: string): Promise<RazorpaySubscriptionEntity>;
    cancel(subscriptionId: string, options?: { cancel_at_cycle_end?: boolean }): Promise<RazorpaySubscriptionEntity>;
    pause(subscriptionId: string): Promise<RazorpaySubscriptionEntity>;
    resume(subscriptionId: string): Promise<RazorpaySubscriptionEntity>;
    update(subscriptionId: string, params: RazorpaySubscriptionUpdateParams): Promise<RazorpaySubscriptionEntity>;
  };
  orders: {
    create(params: RazorpayOrderCreateParams): Promise<RazorpayOrderEntity>;
    fetch(orderId: string): Promise<RazorpayOrderEntity>;
    fetchPayments(orderId: string): Promise<RazorpayPaymentEntity[]>;
  };
  payments: {
    fetch(paymentId: string): Promise<RazorpayPaymentEntity>;
    capture(paymentId: string, amount: number, currency: string): Promise<RazorpayPaymentEntity>;
    refund(paymentId: string, params?: { amount?: number; notes?: Record<string, string> }): Promise<{ id: string }>;
  };
  customers: {
    create(params: { name: string; email: string; contact: string }): Promise<{ id: string }>;
  };
  plans: {
    create(params: RazorpayPlanCreateParams): Promise<{ id: string }>;
  };
}

/**
 * Razorpay subscription create parameters
 */
interface RazorpaySubscriptionCreateParams {
  plan_id: string;
  total_count: number;
  quantity?: number;
  customer_notify?: boolean;
  start_at?: number;
  expire_by?: number;
  customer_id?: string;
  notes?: Record<string, string>;
}

/**
 * Razorpay order create parameters
 */
interface RazorpayOrderCreateParams {
  amount: number;
  currency: string;
  receipt?: string;
  notes?: Record<string, string>;
  payment_capture?: boolean | number;
}

/**
 * Razorpay plan create parameters
 */
interface RazorpayPlanCreateParams {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  item: {
    name: string;
    amount: number;
    currency: string;
    description?: string;
  };
  notes?: Record<string, string>;
}

/**
 * Razorpay subscription update parameters
 */
interface RazorpaySubscriptionUpdateParams {
  plan_id?: string;
  offer_id?: string;
  notes?: Record<string, string>;
  customer_notify?: boolean;
}

/**
 * Create Razorpay client
 */
function createRazorpayClient(config: RazorpayProviderConfig): RazorpayClient {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Razorpay = require('razorpay');
  const client = new Razorpay({
    key_id: config.keyId,
    key_secret: config.keySecret,
  });

  return {
    subscriptions: {
      create: (params) => client.subscriptions.create(params),
      fetch: (id) => client.subscriptions.fetch(id),
      cancel: (id, options) => client.subscriptions.cancel(id, options),
      pause: (id) => client.subscriptions.pause(id),
      resume: (id) => client.subscriptions.resume(id),
      update: (id, params) => client.subscriptions.update(id, params),
    },
    orders: {
      create: (params) => client.orders.create(params),
      fetch: (id) => client.orders.fetch(id),
      fetchPayments: (id) => client.orders.fetchPayments(id),
    },
    payments: {
      fetch: (id) => client.payments.fetch(id),
      capture: (id, amount, currency) => client.payments.capture(id, amount, currency),
      refund: (id, params) => client.payments.refund(id, params),
    },
    customers: {
      create: (params) => client.customers.create(params),
    },
    plans: {
      create: (params) => client.plans.create(params),
    },
  };
}

// ============================================================================
// Base Razorpay Provider
// ============================================================================

/**
 * Base class for Razorpay providers
 * Contains shared functionality for both provider-managed and user-managed
 */
abstract class BaseRazorpayProvider implements SubscriptionProvider {
  readonly provider: PaymentProvider = 'RAZORPAY';
  protected config: RazorpayProviderConfig | null = null;
  protected client: RazorpayClient | null = null;

  abstract readonly subscriptionType: SubscriptionType;

  initialize(config: RazorpayProviderConfig): void {
    this.config = config;
    this.client = createRazorpayClient(config);
  }

  getPublicConfig(): Record<string, unknown> {
    if (!this.config) {
      throw new Error('Provider not initialized');
    }
    return {
      keyId: this.config.keyId,
      provider: 'RAZORPAY',
    };
  }

  protected ensureInitialized(): void {
    if (!this.config || !this.client) {
      throw createProviderError(
        'Provider not initialized',
        'NOT_INITIALIZED',
        'RAZORPAY',
      );
    }
  }

  verifyWebhookSignature(
    payload: string | Record<string, unknown>,
    signature: string,
  ): boolean {
    this.ensureInitialized();
    const payloadStr = typeof payload === 'string' ? payload : JSON.stringify(payload);
    return verifyHmacSha256(payloadStr, signature, this.config!.webhookSecret ?? '');
  }

  async healthCheck(): Promise<{ readonly healthy: boolean; readonly message: string | null }> {
    try {
      this.ensureInitialized();
      // Simple health check by verifying config is valid
      return { healthy: true, message: null };
    } catch (error) {
      return {
        healthy: false,
        message: error instanceof Error ? error.message : 'Health check failed',
      };
    }
  }

  abstract setupSubscription(params: SetupSubscriptionParams): Promise<SetupSubscriptionResult>;
  abstract chargeSubscription(params: ChargeSubscriptionParams): Promise<ChargeSubscriptionResult>;
  abstract getSubscriptionStatus(params: GetSubscriptionStatusParams): Promise<SubscriptionStatusResult>;
  abstract getOrderStatus(params: GetOrderStatusParams): Promise<OrderStatusResult>;
  abstract cancelSubscription(params: CancelSubscriptionParams): Promise<CancelSubscriptionResult>;
  abstract parseWebhookEvent(params: ParseWebhookParams): Promise<WebhookEvent>;
}

// ============================================================================
// Provider-Managed Razorpay Implementation
// ============================================================================

/**
 * Razorpay Provider-Managed Subscription Provider
 * 
 * Razorpay handles:
 * - Auto-charging on billing cycles
 * - Retry logic for failed payments
 * - Subscription state management
 * 
 * We handle:
 * - Webhook events for status updates
 * - Premium status updates
 */
export class RazorpayProviderManagedProvider extends BaseRazorpayProvider {
  readonly subscriptionType: SubscriptionType = 'PROVIDER_MANAGED';

  async setupSubscription(params: SetupSubscriptionParams): Promise<SetupSubscriptionResult> {
    this.ensureInitialized();

    try {
      // Create plan if not provided
      let planId = params.providerPlanId;
      if (!planId) {
        const periodInfo = toRazorpayPeriod(params.pricing.frequency);
        const plan = await this.client!.plans.create({
          period: periodInfo.period as 'daily' | 'weekly' | 'monthly' | 'yearly',
          interval: periodInfo.interval,
          item: {
            name: `Plan ${params.planId}`,
            amount: params.pricing.recurringAmount,
            currency: params.pricing.currency,
          },
        });
        planId = plan.id;
      }

      // Create subscription
      const subscriptionParams: RazorpaySubscriptionCreateParams = {
        plan_id: planId,
        total_count: params.pricing.totalCycles ?? 0, // 0 = unlimited
        customer_notify: true,
        notes: params.metadata,
      };

      if (params.customerEmail || params.customerPhone) {
        const customer = await this.client!.customers.create({
          name: params.metadata.customerName ?? 'Customer',
          email: params.customerEmail ?? '',
          contact: params.customerPhone ?? '',
        });
        subscriptionParams.customer_id = customer.id;
      }

      const subscription = await this.client!.subscriptions.create(subscriptionParams);

      return {
        success: true,
        merchantSubscriptionId: params.merchantSubscriptionId,
        merchantOrderId: params.merchantOrderId,
        providerSubscriptionId: subscription.id,
        providerOrderId: subscription.id, // Razorpay uses subscription ID for setup
        intentUrl: subscription.short_url,
        redirectUrl: params.redirectUrl,
        state: subscription.status,
        expiresAt: subscription.expire_by ? unixToDate(subscription.expire_by) : null,
        providerData: { subscription },
        error: null,
        errorCode: null,
      };
    } catch (error) {
      const err = error as { error?: { description?: string; code?: string } };
      return {
        success: false,
        merchantSubscriptionId: params.merchantSubscriptionId,
        merchantOrderId: params.merchantOrderId,
        providerSubscriptionId: null,
        providerOrderId: '',
        intentUrl: null,
        redirectUrl: null,
        state: 'failed',
        expiresAt: null,
        providerData: {},
        error: err.error?.description ?? 'Failed to setup subscription',
        errorCode: err.error?.code ?? 'SETUP_FAILED',
      };
    }
  }

  async chargeSubscription(params: ChargeSubscriptionParams): Promise<ChargeSubscriptionResult> {
    // Provider-managed subscriptions are auto-charged by Razorpay
    // This method is not typically used, but we can check status
    const status = await this.getSubscriptionStatus({
      merchantSubscriptionId: params.merchantSubscriptionId,
      providerSubscriptionId: params.providerSubscriptionId,
    });

    return {
      success: status.canCharge,
      merchantOrderId: params.merchantOrderId,
      providerOrderId: params.providerSubscriptionId,
      transactionId: null,
      amount: params.amount,
      currency: params.currency,
      state: status.providerState,
      paidAt: null,
      providerData: status.providerData,
      error: status.canCharge ? null : 'Subscription cannot be charged',
      errorCode: status.canCharge ? null : 'CANNOT_CHARGE',
    };
  }

  async getSubscriptionStatus(params: GetSubscriptionStatusParams): Promise<SubscriptionStatusResult> {
    this.ensureInitialized();

    try {
      const subscription = await this.client!.subscriptions.fetch(params.providerSubscriptionId);
      const mappedStatus = mapRazorpaySubscriptionStatus(subscription.status);

      return {
        merchantSubscriptionId: params.merchantSubscriptionId,
        providerSubscriptionId: subscription.id,
        providerState: subscription.status,
        mappedStatus,
        maxAmount: null,
        frequency: this.mapRazorpayPeriodToFrequency(subscription),
        nextBillingDate: subscription.charge_at ? unixToDate(subscription.charge_at) : null,
        paidCount: subscription.paid_count,
        remainingCount: subscription.remaining_count,
        canCharge: subscription.status === RazorpaySubscriptionStatus.ACTIVE,
        providerData: { subscription },
      };
    } catch (error) {
      throw createProviderError(
        'Failed to get subscription status',
        'STATUS_CHECK_FAILED',
        'RAZORPAY',
        error instanceof Error ? error : null,
      );
    }
  }

  private mapRazorpayPeriodToFrequency(subscription: RazorpaySubscriptionEntity): BillingFrequency | null {
    // Razorpay stores period info in the plan, not subscription
    // We would need to fetch the plan to get this
    return null;
  }

  async getOrderStatus(params: GetOrderStatusParams): Promise<OrderStatusResult> {
    this.ensureInitialized();

    try {
      const order = await this.client!.orders.fetch(params.providerOrderId);
      const mappedStatus = mapRazorpayOrderStatus(order.status);

      return {
        merchantOrderId: params.merchantOrderId,
        providerOrderId: order.id,
        providerState: order.status,
        mappedStatus,
        amount: order.amount,
        currency: order.currency,
        expiresAt: null,
        paymentDetails: [],
        providerData: { order },
      };
    } catch (error) {
      throw createProviderError(
        'Failed to get order status',
        'ORDER_STATUS_FAILED',
        'RAZORPAY',
        error instanceof Error ? error : null,
      );
    }
  }

  async cancelSubscription(params: CancelSubscriptionParams): Promise<CancelSubscriptionResult> {
    this.ensureInitialized();

    try {
      const subscription = await this.client!.subscriptions.cancel(
        params.providerSubscriptionId,
        { cancel_at_cycle_end: params.cancelAtCycleEnd ?? false },
      );

      return {
        success: subscription.status === RazorpaySubscriptionStatus.CANCELLED,
        state: subscription.status,
        cancelledAt: new Date(),
        error: null,
      };
    } catch (error) {
      const err = error as { error?: { description?: string } };
      return {
        success: false,
        state: 'cancel_failed',
        cancelledAt: null,
        error: err.error?.description ?? 'Failed to cancel subscription',
      };
    }
  }

  async pauseSubscription(
    merchantSubscriptionId: string,
    providerSubscriptionId: string,
  ): Promise<SubscriptionStatusResult> {
    this.ensureInitialized();

    try {
      const subscription = await this.client!.subscriptions.pause(providerSubscriptionId);
      const mappedStatus = mapRazorpaySubscriptionStatus(subscription.status);

      return {
        merchantSubscriptionId,
        providerSubscriptionId: subscription.id,
        providerState: subscription.status,
        mappedStatus,
        maxAmount: null,
        frequency: this.mapRazorpayPeriodToFrequency(subscription),
        nextBillingDate: subscription.charge_at ? unixToDate(subscription.charge_at) : null,
        paidCount: subscription.paid_count,
        remainingCount: subscription.remaining_count,
        canCharge: false,
        providerData: { subscription },
      };
    } catch (error) {
      throw createProviderError(
        'Failed to pause subscription',
        'PAUSE_FAILED',
        'RAZORPAY',
        error instanceof Error ? error : null,
      );
    }
  }

  async resumeSubscription(
    merchantSubscriptionId: string,
    providerSubscriptionId: string,
  ): Promise<SubscriptionStatusResult> {
    this.ensureInitialized();

    try {
      const subscription = await this.client!.subscriptions.resume(providerSubscriptionId);
      const mappedStatus = mapRazorpaySubscriptionStatus(subscription.status);

      return {
        merchantSubscriptionId,
        providerSubscriptionId: subscription.id,
        providerState: subscription.status,
        mappedStatus,
        maxAmount: null,
        frequency: this.mapRazorpayPeriodToFrequency(subscription),
        nextBillingDate: subscription.charge_at ? unixToDate(subscription.charge_at) : null,
        paidCount: subscription.paid_count,
        remainingCount: subscription.remaining_count,
        canCharge: subscription.status === RazorpaySubscriptionStatus.ACTIVE,
        providerData: { subscription },
      };
    } catch (error) {
      throw createProviderError(
        'Failed to resume subscription',
        'RESUME_FAILED',
        'RAZORPAY',
        error instanceof Error ? error : null,
      );
    }
  }

  async updateSubscription(
    providerSubscriptionId: string,
    params: RazorpaySubscriptionUpdateParams,
  ): Promise<SubscriptionStatusResult> {
    this.ensureInitialized();

    try {
      const subscription = await this.client!.subscriptions.update(providerSubscriptionId, params);
      const mappedStatus = mapRazorpaySubscriptionStatus(subscription.status);

      return {
        merchantSubscriptionId: subscription.id,
        providerSubscriptionId: subscription.id,
        providerState: subscription.status,
        mappedStatus,
        maxAmount: null,
        frequency: this.mapRazorpayPeriodToFrequency(subscription),
        nextBillingDate: subscription.charge_at ? unixToDate(subscription.charge_at) : null,
        paidCount: subscription.paid_count,
        remainingCount: subscription.remaining_count,
        canCharge: subscription.status === RazorpaySubscriptionStatus.ACTIVE,
        providerData: { subscription },
      };
    } catch (error) {
      throw createProviderError(
        'Failed to update subscription',
        'UPDATE_FAILED',
        'RAZORPAY',
        error instanceof Error ? error : null,
      );
    }
  }

  async parseWebhookEvent(params: ParseWebhookParams): Promise<WebhookEvent> {
    const payload = typeof params.payload === 'string' 
      ? JSON.parse(params.payload) as unknown as RazorpayWebhookPayload
      : params.payload as unknown as RazorpayWebhookPayload;

    const signatureValid = params.signature 
      ? this.verifyWebhookSignature(params.payload, params.signature)
      : false;

    const eventType = payload.event;
    const subscription = payload.payload.subscription?.entity;
    const payment = payload.payload.payment?.entity;
    const order = payload.payload.order?.entity;

    return {
      eventId: payload.account_id + '_' + payload.created_at,
      eventType,
      mappedEventType: this.mapWebhookEventType(eventType),
      provider: 'RAZORPAY',
      subscriptionType: 'PROVIDER_MANAGED',
      appId: null, // Extract from notes if needed
      merchantSubscriptionId: subscription?.id ?? null,
      providerSubscriptionId: subscription?.id ?? null,
      merchantOrderId: order?.id ?? payment?.order_id ?? null,
      providerOrderId: order?.id ?? payment?.order_id ?? null,
      paymentId: payment?.id ?? null,
      timestamp: unixToDate(payload.created_at),
      status: subscription?.status ?? payment?.status ?? null,
      amount: payment?.amount ?? subscription?.paid_count ?? null,
      currency: payment?.currency ?? 'INR',
      rawPayload: payload as unknown as Record<string, unknown>,
      signatureValid,
      errorCode: payment?.error_code ?? null,
      errorMessage: payment?.error_description ?? null,
    };
  }

  private mapWebhookEventType(razorpayEvent: string): string {
    const eventMap: Record<string, string> = {
      [RazorpayWebhookEvent.SUBSCRIPTION_AUTHENTICATED]: 'subscription.authenticated',
      [RazorpayWebhookEvent.SUBSCRIPTION_ACTIVATED]: 'subscription.activated',
      [RazorpayWebhookEvent.SUBSCRIPTION_CHARGED]: 'subscription.charged',
      [RazorpayWebhookEvent.SUBSCRIPTION_PENDING]: 'subscription.pending',
      [RazorpayWebhookEvent.SUBSCRIPTION_HALTED]: 'subscription.halted',
      [RazorpayWebhookEvent.SUBSCRIPTION_PAUSED]: 'subscription.paused',
      [RazorpayWebhookEvent.SUBSCRIPTION_CANCELLED]: 'subscription.cancelled',
      [RazorpayWebhookEvent.SUBSCRIPTION_COMPLETED]: 'subscription.completed',
      [RazorpayWebhookEvent.PAYMENT_AUTHORIZED]: 'payment.authorized',
      [RazorpayWebhookEvent.PAYMENT_CAPTURED]: 'payment.captured',
      [RazorpayWebhookEvent.PAYMENT_FAILED]: 'payment.failed',
    };
    return eventMap[razorpayEvent] ?? razorpayEvent;
  }
}

// ============================================================================
// User-Managed Razorpay Implementation
// ============================================================================

/**
 * Razorpay User-Managed Subscription Provider
 * 
 * We handle:
 * - Initiating each charge via Razorpay order API
 * - Retry logic for failed payments
 * - Billing schedule management
 * 
 * Razorpay handles:
 * - Payment processing
 * - Token/mandate management
 */
export class RazorpayUserManagedProvider extends BaseRazorpayProvider {
  readonly subscriptionType: SubscriptionType = 'USER_MANAGED';

  async setupSubscription(params: SetupSubscriptionParams): Promise<SetupSubscriptionResult> {
    this.ensureInitialized();

    try {
      // For user-managed, we create an order for the initial payment
      // and set up a token for recurring payments
      const order = await this.client!.orders.create({
        amount: params.pricing.initialAmount || params.pricing.recurringAmount,
        currency: params.pricing.currency,
        receipt: params.merchantOrderId,
        notes: {
          ...params.metadata,
          subscription_type: 'USER_MANAGED',
          plan_id: params.planId,
          frequency: params.pricing.frequency,
          recurring_amount: String(params.pricing.recurringAmount),
        },
        payment_capture: true,
      });

      return {
        success: true,
        merchantSubscriptionId: params.merchantSubscriptionId,
        merchantOrderId: params.merchantOrderId,
        providerSubscriptionId: null, // No subscription entity in user-managed
        providerOrderId: order.id,
        intentUrl: null,
        redirectUrl: params.redirectUrl,
        state: order.status,
        expiresAt: null,
        providerData: { order },
        error: null,
        errorCode: null,
      };
    } catch (error) {
      const err = error as { error?: { description?: string; code?: string } };
      return {
        success: false,
        merchantSubscriptionId: params.merchantSubscriptionId,
        merchantOrderId: params.merchantOrderId,
        providerSubscriptionId: null,
        providerOrderId: '',
        intentUrl: null,
        redirectUrl: null,
        state: 'failed',
        expiresAt: null,
        providerData: {},
        error: err.error?.description ?? 'Failed to setup subscription',
        errorCode: err.error?.code ?? 'SETUP_FAILED',
      };
    }
  }

  async chargeSubscription(params: ChargeSubscriptionParams): Promise<ChargeSubscriptionResult> {
    this.ensureInitialized();

    try {
      // Create an order for this charge
      const order = await this.client!.orders.create({
        amount: params.amount,
        currency: params.currency,
        receipt: params.merchantOrderId,
        notes: params.metadata,
        payment_capture: true,
      });

      return {
        success: true,
        merchantOrderId: params.merchantOrderId,
        providerOrderId: order.id,
        transactionId: null, // Will be available after payment
        amount: params.amount,
        currency: params.currency,
        state: order.status,
        paidAt: null,
        providerData: { order },
        error: null,
        errorCode: null,
      };
    } catch (error) {
      const err = error as { error?: { description?: string; code?: string } };
      return {
        success: false,
        merchantOrderId: params.merchantOrderId,
        providerOrderId: '',
        transactionId: null,
        amount: params.amount,
        currency: params.currency,
        state: 'failed',
        paidAt: null,
        providerData: {},
        error: err.error?.description ?? 'Failed to create charge order',
        errorCode: err.error?.code ?? 'CHARGE_FAILED',
      };
    }
  }

  async getSubscriptionStatus(params: GetSubscriptionStatusParams): Promise<SubscriptionStatusResult> {
    // User-managed subscriptions don't have a provider subscription entity
    // Status is managed by our system
    return {
      merchantSubscriptionId: params.merchantSubscriptionId,
      providerSubscriptionId: params.providerSubscriptionId,
      providerState: 'user_managed',
      mappedStatus: 'ACTIVE', // Our system manages this
      maxAmount: null,
      frequency: null,
      nextBillingDate: null,
      paidCount: 0,
      remainingCount: null,
      canCharge: true, // We decide this
      providerData: {},
    };
  }

  async getOrderStatus(params: GetOrderStatusParams): Promise<OrderStatusResult> {
    this.ensureInitialized();

    try {
      const order = await this.client!.orders.fetch(params.providerOrderId);
      const payments = await this.client!.orders.fetchPayments(params.providerOrderId);
      const mappedStatus = mapRazorpayOrderStatus(order.status);

      const paymentDetails = payments.map((p: RazorpayPaymentEntity) => ({
        transactionId: p.id,
        paymentMode: p.method,
        timestamp: unixToDate(p.created_at),
        amount: p.amount,
        state: p.status,
      }));

      return {
        merchantOrderId: params.merchantOrderId,
        providerOrderId: order.id,
        providerState: order.status,
        mappedStatus,
        amount: order.amount,
        currency: order.currency,
        expiresAt: null,
        paymentDetails: paymentDetails,
        providerData: { order, payments },
      };
    } catch (error) {
      throw createProviderError(
        'Failed to get order status',
        'ORDER_STATUS_FAILED',
        'RAZORPAY',
        error instanceof Error ? error : null,
      );
    }
  }

  async cancelSubscription(params: CancelSubscriptionParams): Promise<CancelSubscriptionResult> {
    // User-managed subscriptions are cancelled in our system
    // No provider action needed
    return {
      success: true,
      state: 'cancelled',
      cancelledAt: new Date(),
      error: null,
    };
  }

  async parseWebhookEvent(params: ParseWebhookParams): Promise<WebhookEvent> {
    const payload = typeof params.payload === 'string' 
      ? JSON.parse(params.payload) as unknown as RazorpayWebhookPayload
      : params.payload as unknown as RazorpayWebhookPayload;

    const signatureValid = params.signature 
      ? this.verifyWebhookSignature(params.payload, params.signature)
      : false;

    const eventType = payload.event;
    const payment = payload.payload.payment?.entity;
    const order = payload.payload.order?.entity;

    return {
      eventId: payload.account_id + '_' + payload.created_at,
      eventType,
      mappedEventType: this.mapWebhookEventType(eventType),
      provider: 'RAZORPAY',
      subscriptionType: 'USER_MANAGED',
      appId: null,
      merchantSubscriptionId: order?.notes?.subscription_id ?? null,
      providerSubscriptionId: null,
      merchantOrderId: order?.id ?? payment?.order_id ?? null,
      providerOrderId: order?.id ?? payment?.order_id ?? null,
      paymentId: payment?.id ?? null,
      timestamp: unixToDate(payload.created_at),
      status: payment?.status ?? order?.status ?? null,
      amount: payment?.amount ?? order?.amount ?? null,
      currency: payment?.currency ?? 'INR',
      rawPayload: payload as unknown as Record<string, unknown>,
      signatureValid,
      errorCode: payment?.error_code ?? null,
      errorMessage: payment?.error_description ?? null,
    };
  }

  private mapWebhookEventType(razorpayEvent: string): string {
    const eventMap: Record<string, string> = {
      [RazorpayWebhookEvent.ORDER_PAID]: 'order.paid',
      [RazorpayWebhookEvent.PAYMENT_AUTHORIZED]: 'payment.authorized',
      [RazorpayWebhookEvent.PAYMENT_CAPTURED]: 'payment.captured',
      [RazorpayWebhookEvent.PAYMENT_FAILED]: 'payment.failed',
      [RazorpayWebhookEvent.TOKEN_CONFIRMED]: 'token.confirmed',
    };
    return eventMap[razorpayEvent] ?? razorpayEvent;
  }
}

// ============================================================================
// Exports
// ============================================================================

export {
  BaseRazorpayProvider,
  createRazorpayClient,
  type RazorpayClient,
  type RazorpaySubscriptionCreateParams,
  type RazorpaySubscriptionUpdateParams,
  type RazorpayOrderCreateParams,
  type RazorpayPlanCreateParams,
};
