/**
 * Webhook Parser Interface and Implementations
 * 
 * Parses raw webhook payloads from payment providers into normalized events.
 * Based on official Razorpay and PhonePe webhook documentation.
 */

import * as crypto from 'crypto';
import type { PaymentProvider } from '../types/provider.enum';
import type { SubscriptionType } from '../types/subscription-type.enum';
import type { SubscriptionStatus } from '../types/subscription-status.enum';
import type { OrderStatus } from '../types/order-status.enum';
import {
  type NormalizedWebhookEvent,
  type WebhookHeaders,
  type WebhookParseResult,
  type WebhookPaymentDetail,
  type PaymentInstrument,
  type PaymentRail,
  normalizeEventType,
  getEventCategory,
  NormalizedWebhookEventType,
  WebhookEventCategory,
} from './webhook-types';
import {
  RazorpayStateMapper,
  mapRazorpayOrderState,
  mapRazorpayPaymentState,
  type RazorpaySubscriptionState,
  type RazorpayOrderState,
  type RazorpayPaymentState,
} from '../providers/mappers/state-mappers';

// ============================================================================
// Webhook Parser Interface
// ============================================================================

/**
 * Webhook parser interface
 */
export interface WebhookParser {
  /**
   * Parse raw webhook payload into normalized event
   */
  parse(payload: string | Buffer, headers: WebhookHeaders): WebhookParseResult;

  /**
   * Verify webhook signature
   */
  verifySignature(payload: string | Buffer, signature: string, secret: string): boolean;

  /**
   * Get provider for this parser
   */
  getProvider(): PaymentProvider;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Convert Unix timestamp (seconds or milliseconds) to Date
 */
function unixToDate(timestamp: number): Date {
  // PhonePe uses milliseconds, Razorpay uses seconds
  if (timestamp > 1e12) {
    return new Date(timestamp);
  }
  return new Date(timestamp * 1000);
}

/**
 * Safely get value from object
 */
function safeGet<T>(obj: unknown, path: string): T | undefined {
  const keys = path.split('.');
  let current: unknown = obj;
  for (const key of keys) {
    if (current === null || current === undefined) return undefined;
    if (typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return current as T | undefined;
}

/**
 * Extract string value from object
 */
function getString(obj: unknown, key: string): string | null {
  const value = safeGet<string>(obj, key);
  return typeof value === 'string' ? value : null;
}

/**
 * Extract number value from object
 */
function getNumber(obj: unknown, key: string): number | null {
  const value = safeGet<number>(obj, key);
  return typeof value === 'number' ? value : null;
}

// ============================================================================
// Razorpay Webhook Parser
// ============================================================================

/**
 * Razorpay webhook payload structure (from documentation)
 */
interface RazorpayWebhookPayload {
  entity: 'event';
  account_id: string;
  event: string;
  contains: string[];
  payload: {
    payment?: { entity: RazorpayPaymentPayload };
    subscription?: { entity: RazorpaySubscriptionPayload };
    order?: { entity: RazorpayOrderPayload };
    token?: { entity: RazorpayTokenPayload };
    refund?: { entity: RazorpayRefundPayload };
    customer?: { entity: RazorpayCustomerPayload };
  };
  created_at: number;
}

interface RazorpayPaymentPayload {
  id: string;
  entity: 'payment';
  order_id: string | null;
  subscription_id?: string;
  amount: number;
  currency: string;
  status: RazorpayPaymentState;
  method: string | null;
  amount_refunded: number;
  captured: boolean;
  email: string;
  contact: string;
  fee: number;
  tax: number;
  error_code: string | null;
  error_description: string | null;
  error_reason: string | null;
  created_at: number;
  card?: {
    last4: string;
    network: string;
    type: 'credit' | 'debit' | 'prepaid';
    issuer: string;
  };
  vpa?: string;
  bank?: string;
  wallet?: string;
  notes?: Record<string, string>;
}

interface RazorpaySubscriptionPayload {
  id: string;
  entity: 'subscription';
  plan_id: string;
  customer_id: string | null;
  status: RazorpaySubscriptionState;
  current_start: number | null;
  current_end: number | null;
  charge_at: number | null;
  start_at: number | null;
  end_at: number | null;
  total_count: number;
  paid_count: number;
  remaining_count: number;
  notes?: Record<string, string>;
  created_at: number;
}

interface RazorpayOrderPayload {
  id: string;
  entity: 'order';
  amount: number;
  currency: string;
  receipt: string | null;
  status: RazorpayOrderState;
  notes?: Record<string, string>;
  created_at: number;
}

interface RazorpayTokenPayload {
  id: string;
  entity: 'token';
  token: string;
  method: string;
  recurring: boolean;
  auth_type: string | null;
  vpa?: string;
  card?: {
    last4: string;
    network: string;
    type: 'credit' | 'debit';
    issuer: string;
  };
}

interface RazorpayRefundPayload {
  id: string;
  entity: 'refund';
  payment_id: string;
  order_id: string | null;
  amount: number;
  currency: string;
  status: 'pending' | 'processed' | 'failed';
  created_at: number;
}

interface RazorpayCustomerPayload {
  id: string;
  entity: 'customer';
  name: string;
  email: string;
  contact: string;
}

/**
 * Razorpay webhook parser implementation
 */
export class RazorpayWebhookParser implements WebhookParser {
  getProvider(): PaymentProvider {
    return 'RAZORPAY';
  }

  parse(payload: string | Buffer, headers: WebhookHeaders): WebhookParseResult {
    try {
      const raw = JSON.parse(payload.toString()) as RazorpayWebhookPayload;
      const eventType = normalizeEventType('RAZORPAY', raw.event);
      const category = getEventCategory(eventType);

      const subscription = raw.payload.subscription?.entity;
      const payment = raw.payload.payment?.entity;
      const order = raw.payload.order?.entity;
      const token = raw.payload.token?.entity;
      const refund = raw.payload.refund?.entity;

      // Determine subscription type from notes
      const notes = subscription?.notes ?? payment?.notes ?? order?.notes ?? {};
      const subscriptionType = this.extractSubscriptionType(notes);

      // Build payment details if available
      const paymentDetails: WebhookPaymentDetail[] = payment
        ? [this.buildPaymentDetail(payment)]
        : [];

      // Determine unified statuses
      const unifiedSubscriptionStatus = subscription
        ? RazorpayStateMapper.toUnified(subscription.status)
        : null;
      const unifiedOrderStatus = payment
        ? mapRazorpayPaymentState(payment.status)
        : order
        ? mapRazorpayOrderState(order.status)
        : null;

      const event: NormalizedWebhookEvent = {
        eventId: `${raw.account_id}_${raw.created_at}`,
        eventType,
        provider: 'RAZORPAY',
        providerEventType: raw.event,
        timestamp: unixToDate(raw.created_at),

        merchantSubscriptionId: getString(notes, 'merchant_subscription_id'),
        providerSubscriptionId: subscription?.id ?? payment?.subscription_id ?? null,
        merchantOrderId: getString(notes, 'merchant_order_id') ?? order?.receipt ?? null,
        providerOrderId: order?.id ?? payment?.order_id ?? null,
        paymentId: payment?.id ?? null,
        refundId: refund?.id ?? null,
        tokenId: token?.id ?? null,

        previousStatus: null,
        currentStatus: subscription?.status ?? payment?.status ?? order?.status ?? 'unknown',
        unifiedSubscriptionStatus,
        unifiedOrderStatus,

        subscriptionType,

        amount: payment?.amount ?? order?.amount ?? null,
        currency: payment?.currency ?? order?.currency ?? 'INR',
        paymentMethod: payment?.method ?? null,
        paymentDetails,

        errorCode: payment?.error_code ?? null,
        detailedErrorCode: null,
        errorMessage: payment?.error_description ?? payment?.error_reason ?? null,

        signatureValid: false, // Set by caller after verification
        processed: false,

        appId: getString(notes, 'app_id'),
        userId: getString(notes, 'user_id'),

        rawPayload: raw as unknown as Record<string, unknown>,
        providerMetadata: {
          accountId: raw.account_id,
          contains: raw.contains,
          notes,
        },
      };

      return { success: true, event };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to parse Razorpay webhook',
        errorCode: 'PARSE_ERROR',
      };
    }
  }

  verifySignature(payload: string | Buffer, signature: string, secret: string): boolean {
    try {
      const expected = crypto
        .createHmac('sha256', secret)
        .update(payload.toString())
        .digest('hex');
      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expected),
      );
    } catch {
      return false;
    }
  }

  private extractSubscriptionType(notes: Record<string, string> | undefined): SubscriptionType | null {
    const type = notes?.subscription_type;
    if (type === 'PROVIDER_MANAGED' || type === 'USER_MANAGED') {
      return type;
    }
    // Razorpay subscriptions are typically provider-managed
    return 'PROVIDER_MANAGED';
  }

  private buildPaymentDetail(payment: RazorpayPaymentPayload): WebhookPaymentDetail {
    const instrument: PaymentInstrument | undefined = payment.card
      ? {
          type: 'CARD',
          last4: payment.card.last4,
          network: payment.card.network,
          issuer: payment.card.issuer,
          cardType: payment.card.type,
        }
      : payment.vpa
      ? {
          type: 'UPI',
        }
      : payment.bank
      ? {
          type: 'ACCOUNT',
        }
      : payment.wallet
      ? {
          type: 'WALLET',
        }
      : undefined;

    const rail: PaymentRail | undefined = payment.vpa
      ? {
          type: 'UPI',
          vpa: payment.vpa,
        }
      : payment.bank
      ? {
          type: 'NETBANKING',
        }
      : undefined;

    return {
      transactionId: payment.id,
      paymentMode: payment.method ?? 'unknown',
      timestamp: unixToDate(payment.created_at),
      amount: payment.amount,
      currency: payment.currency,
      state: payment.status === 'captured' ? 'COMPLETED' : payment.status === 'failed' ? 'FAILED' : 'PENDING',
      instrument,
      rail,
      errorCode: payment.error_code ?? undefined,
      detailedErrorCode: undefined,
    };
  }
}

// ============================================================================
// PhonePe Webhook Parser
// ============================================================================

/**
 * PhonePe webhook payload structure (from documentation)
 */
interface PhonePeWebhookPayload {
  type?: string;
  event: string;
  payload: PhonePePayload;
}

interface PhonePePayload {
  merchantId?: string;
  merchantOrderId?: string;
  merchantSubscriptionId?: string;
  orderId?: string;
  subscriptionId?: string;
  transactionId?: string;
  amount?: number;
  currency?: string;
  state: string;
  expireAt?: number;
  timestamp?: number;
  errorCode?: string;
  detailedErrorCode?: string;
  authWorkflowType?: string;
  amountType?: 'FIXED' | 'VARIABLE';
  maxAmount?: number;
  frequency?: string;
  pauseStartDate?: number | null;
  pauseEndDate?: number | null;
  metaInfo?: Record<string, string>;
  paymentFlow?: {
    type: string;
    merchantSubscriptionId?: string;
    subscriptionId?: string;
    redemptionRetryStrategy?: 'STANDARD' | 'CUSTOM';
    autoDebit?: boolean;
    validAfter?: number;
    validUpto?: number;
    notifiedAt?: number;
  };
  paymentDetails?: PhonePePaymentDetail[];
}

interface PhonePePaymentDetail {
  transactionId: string;
  paymentMode: string;
  timestamp: number;
  amount: number;
  currency?: string;
  state: 'COMPLETED' | 'FAILED' | 'PENDING';
  errorCode?: string;
  detailedErrorCode?: string;
  instrument?: {
    type: 'ACCOUNT' | 'CARD' | 'WALLET';
    maskedAccountNumber?: string;
    ifsc?: string;
    accountHolderName?: string;
    accountType?: 'SAVINGS' | 'CURRENT';
    bankId?: string;
  };
  rail?: {
    type: 'UPI';
    utr: string;
    vpa: string;
    umn: string;
  };
}

/**
 * PhonePe webhook parser implementation
 */
export class PhonePeWebhookParser implements WebhookParser {
  getProvider(): PaymentProvider {
    return 'PHONEPE';
  }

  parse(payload: string | Buffer, headers: WebhookHeaders): WebhookParseResult {
    try {
      // PhonePe may send base64 encoded payload
      let raw: PhonePeWebhookPayload;
      const payloadStr = payload.toString();

      try {
        const decoded = Buffer.from(payloadStr, 'base64').toString('utf-8');
        raw = JSON.parse(decoded) as PhonePeWebhookPayload;
      } catch {
        raw = JSON.parse(payloadStr) as PhonePeWebhookPayload;
      }

      const eventType = normalizeEventType('PHONEPE', raw.event);
      const data = raw.payload;

      // Determine subscription type from autoDebit flag
      const autoDebit = data.paymentFlow?.autoDebit ?? false;
      const subscriptionType: SubscriptionType = autoDebit ? 'PROVIDER_MANAGED' : 'USER_MANAGED';

      // Build payment details
      const paymentDetails: WebhookPaymentDetail[] = (data.paymentDetails ?? []).map((pd) =>
        this.buildPaymentDetail(pd),
      );

      // Determine unified statuses
      const unifiedSubscriptionStatus = this.mapSubscriptionState(data.state);
      const unifiedOrderStatus = this.mapOrderState(data.state);

      const event: NormalizedWebhookEvent = {
        eventId: data.merchantOrderId ?? data.subscriptionId ?? Date.now().toString(),
        eventType,
        provider: 'PHONEPE',
        providerEventType: raw.event,
        timestamp: data.timestamp ? unixToDate(data.timestamp) : new Date(),

        merchantSubscriptionId: data.merchantSubscriptionId ?? data.paymentFlow?.merchantSubscriptionId ?? null,
        providerSubscriptionId: data.subscriptionId ?? data.paymentFlow?.subscriptionId ?? null,
        merchantOrderId: data.merchantOrderId ?? null,
        providerOrderId: data.orderId ?? null,
        paymentId: data.transactionId ?? null,
        refundId: null,
        tokenId: null,

        previousStatus: null,
        currentStatus: data.state,
        unifiedSubscriptionStatus,
        unifiedOrderStatus,

        subscriptionType,

        amount: data.amount ?? null,
        currency: data.currency ?? 'INR',
        paymentMethod: 'UPI_MANDATE',
        paymentDetails,

        errorCode: data.errorCode ?? null,
        detailedErrorCode: data.detailedErrorCode ?? null,
        errorMessage: null,

        signatureValid: false,
        processed: false,

        appId: getString(data.metaInfo, 'udf1'),
        userId: getString(data.metaInfo, 'udf2'),

        rawPayload: raw as unknown as Record<string, unknown>,
        providerMetadata: {
          merchantId: data.merchantId,
          authWorkflowType: data.authWorkflowType,
          amountType: data.amountType,
          maxAmount: data.maxAmount,
          frequency: data.frequency,
          autoDebit,
          redemptionRetryStrategy: data.paymentFlow?.redemptionRetryStrategy,
          pauseStartDate: data.pauseStartDate,
          pauseEndDate: data.pauseEndDate,
        },
      };

      return { success: true, event };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to parse PhonePe webhook',
        errorCode: 'PARSE_ERROR',
      };
    }
  }

  verifySignature(payload: string | Buffer, signature: string, secret: string): boolean {
    try {
      // PhonePe uses SHA256 with base64 encoding
      const expected = crypto
        .createHmac('sha256', secret)
        .update(payload.toString())
        .digest('base64');
      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expected),
      );
    } catch {
      return false;
    }
  }

  private mapSubscriptionState(state: string): SubscriptionStatus | null {
    const mapping: Record<string, SubscriptionStatus> = {
      'CREATED': 'CREATED',
      'ACTIVATION_IN_PROGRESS': 'ACTIVATION_IN_PROGRESS',
      'ACTIVE': 'ACTIVE',
      'PAUSED': 'PAUSED',
      'CANCEL_IN_PROGRESS': 'CANCEL_IN_PROGRESS',
      'CANCELLED': 'CANCELLED',
      'REVOKED': 'REVOKED',
      'EXPIRED': 'EXPIRED',
      'FAILED': 'FAILED',
      'COMPLETED': 'COMPLETED',
      'PENDING': 'PENDING_AUTH',
    };
    return mapping[state] ?? null;
  }

  private mapOrderState(state: string): OrderStatus | null {
    const mapping: Record<string, OrderStatus> = {
      'PENDING': 'CREATED',
      'NOTIFICATION_IN_PROGRESS': 'PENDING',
      'NOTIFIED': 'PENDING',
      'COMPLETED': 'CAPTURED',
      'FAILED': 'FAILED',
    };
    return mapping[state] ?? null;
  }

  private buildPaymentDetail(pd: PhonePePaymentDetail): WebhookPaymentDetail {
    const instrument: PaymentInstrument | undefined = pd.instrument
      ? {
          type: pd.instrument.type,
          maskedAccountNumber: pd.instrument.maskedAccountNumber,
          ifsc: pd.instrument.ifsc,
          accountHolderName: pd.instrument.accountHolderName,
          accountType: pd.instrument.accountType,
        }
      : undefined;

    const rail: PaymentRail | undefined = pd.rail
      ? {
          type: pd.rail.type,
          utr: pd.rail.utr,
          vpa: pd.rail.vpa,
          umn: pd.rail.umn,
        }
      : undefined;

    return {
      transactionId: pd.transactionId,
      paymentMode: pd.paymentMode,
      timestamp: unixToDate(pd.timestamp),
      amount: pd.amount,
      currency: pd.currency ?? 'INR',
      state: pd.state,
      instrument,
      rail,
      errorCode: pd.errorCode,
      detailedErrorCode: pd.detailedErrorCode,
    };
  }
}

// ============================================================================
// Parser Registry
// ============================================================================

/**
 * Webhook parser registry
 */
export class WebhookParserRegistry {
  private readonly parsers: Map<PaymentProvider, WebhookParser> = new Map();

  constructor() {
    this.parsers.set('RAZORPAY', new RazorpayWebhookParser());
    this.parsers.set('PHONEPE', new PhonePeWebhookParser());
  }

  /**
   * Get parser for provider
   */
  getParser(provider: PaymentProvider): WebhookParser | null {
    return this.parsers.get(provider) ?? null;
  }

  /**
   * Parse webhook for provider
   */
  parse(provider: PaymentProvider, payload: string | Buffer, headers: WebhookHeaders): WebhookParseResult {
    const parser = this.getParser(provider);
    if (!parser) {
      return {
        success: false,
        error: `No parser registered for provider: ${provider}`,
        errorCode: 'UNKNOWN_PROVIDER',
      };
    }
    return parser.parse(payload, headers);
  }

  /**
   * Verify webhook signature
   */
  verifySignature(
    provider: PaymentProvider,
    payload: string | Buffer,
    signature: string,
    secret: string,
  ): boolean {
    const parser = this.getParser(provider);
    if (!parser) {
      return false;
    }
    return parser.verifySignature(payload, signature, secret);
  }
}

/**
 * Default parser registry instance
 */
export const webhookParserRegistry = new WebhookParserRegistry();
