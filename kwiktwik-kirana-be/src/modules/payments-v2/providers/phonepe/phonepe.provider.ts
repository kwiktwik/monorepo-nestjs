/**
 * PhonePe Subscription Provider Implementation
 * 
 * Handles both provider-managed and user-managed subscriptions for PhonePe.
 * 
 * Provider-Managed: PhonePe handles auto-deduction with autoDebit=true
 * User-Managed: We use notify/execute flow with autoDebit=false
 */

import type { PaymentProvider } from '../../types/provider.enum';
import type { SubscriptionType } from '../../types/subscription-type.enum';
import type { BillingFrequency } from '../../types/frequency.enum';
import {
  type PhonePeProviderConfig,
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
  type PaymentDetail,
} from '../interfaces/subscription-provider.interface';
import {
  type PhonePeSetupSubscriptionRequest,
  type PhonePeSetupSubscriptionResponse,
  type PhonePeSubscriptionStatusResponse,
  type PhonePeNotifyRedemptionRequest,
  type PhonePeNotifyRedemptionResponse,
  type PhonePeExecuteRedemptionRequest,
  type PhonePeExecuteRedemptionResponse,
  type PhonePeRedemptionOrderStatusResponse,
  type PhonePeDecodedWebhookPayload,
  PhonePeSubscriptionState,
  PhonePeOrderState,
  PhonePeWebhookEvent,
  PhonePeAuthWorkflowType,
  PhonePeAmountType,
  PhonePeProductType,
  PhonePeSubscriptionType,
  PhonePePaymentFlowType,
  type PhonePeCheckoutMode,
  mapPhonePeSubscriptionState,
  toPhonePeFrequency,
} from '../../types/phonepe.types';
import {
  generateId,
  unixToDate,
  dateToUnix,
  createProviderError,
} from '../base/provider-utils';

// ============================================================================
// PhonePe Client Wrapper
// ============================================================================

/**
 * PhonePe API client wrapper
 */
interface PhonePeClient {
  // Authentication
  getAccessToken(): Promise<string>;
  
  // Subscription APIs
  setupSubscription(request: PhonePeSetupSubscriptionRequest): Promise<PhonePeSetupSubscriptionResponse>;
  getSubscriptionStatus(merchantSubscriptionId: string): Promise<PhonePeSubscriptionStatusResponse>;
  cancelSubscription(merchantSubscriptionId: string): Promise<{ state: PhonePeSubscriptionState }>;
  pauseSubscription(merchantSubscriptionId: string): Promise<{ state: PhonePeSubscriptionState }>;
  unpauseSubscription(merchantSubscriptionId: string): Promise<{ state: PhonePeSubscriptionState }>;
  
  // Redemption APIs
  notifyRedemption(request: PhonePeNotifyRedemptionRequest): Promise<PhonePeNotifyRedemptionResponse>;
  executeRedemption(request: PhonePeExecuteRedemptionRequest): Promise<PhonePeExecuteRedemptionResponse>;
  getRedemptionOrderStatus(merchantOrderId: string): Promise<PhonePeRedemptionOrderStatusResponse>;
  
  // Refund APIs
  refund(params: RefundParams): Promise<RefundResponse>;
}

/**
 * Refund parameters
 */
interface RefundParams {
  merchantRefundId: string;
  originalMerchantOrderId: string;
  amount: number;
  callbackUrl?: string;
}

/**
 * Refund response
 */
interface RefundResponse {
  refundId: string;
  state: string;
}

/**
 * PhonePe API endpoints
 */
const PHONEPE_ENDPOINTS = {
  SANDBOX: {
    AUTH: 'https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token',
    BASE: 'https://api-preprod.phonepe.com/apis/pg-sandbox',
  },
  PRODUCTION: {
    AUTH: 'https://api.phonepe.com/apis/identity-manager/v1/oauth/token',
    BASE: 'https://api.phonepe.com/apis/pg',
  },
};

/**
 * Create PhonePe client
 */
function createPhonePeClient(config: PhonePeProviderConfig): PhonePeClient {
  const endpoints = config.environment === 'PRODUCTION' 
    ? PHONEPE_ENDPOINTS.PRODUCTION 
    : PHONEPE_ENDPOINTS.SANDBOX;

  const isStandardCheckout = (config.checkoutMode ?? 'API_INTEGRATION') === 'STANDARD_CHECKOUT';
  const subPrefix = isStandardCheckout ? 'checkout/v2/subscriptions' : 'subscriptions/v2';
  const orderPrefix = isStandardCheckout ? 'checkout/v2/order' : 'subscriptions/v2/order';
  const setupPath = isStandardCheckout ? 'checkout/v2/pay' : 'subscriptions/v2/setup';

  let cachedToken: { token: string; expiresAt: number } | null = null;
  let pendingTokenRequest: Promise<string> | null = null;

  const fetchWithAuth = async <T>(url: string, options: RequestInit = {}): Promise<T> => {
    const token = await getAccessToken();
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `O-Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw createProviderError(
        `PhonePe API error: ${response.status} ${errorText}`,
        'API_ERROR',
        'PHONEPE',
      );
    }

    return response.json() as Promise<T>;
  };

  const getAccessToken = async (): Promise<string> => {
    // Return cached token if still valid
    if (cachedToken && cachedToken.expiresAt > Date.now()) {
      return cachedToken.token;
    }

    // Deduplicate concurrent token requests
    if (pendingTokenRequest) {
      return pendingTokenRequest;
    }

    pendingTokenRequest = (async () => {
      try {
        const response = await fetch(endpoints.AUTH, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_id: config.clientId,
            client_version: String(config.clientVersion ?? 1),
            client_secret: config.clientSecret,
            grant_type: 'client_credentials',
          }),
        });

        if (!response.ok) {
          throw createProviderError('Failed to get PhonePe access token', 'AUTH_FAILED', 'PHONEPE');
        }

        const data = await response.json() as {
          access_token: string;
          expires_at: number;
          expires_in: number | null;
        };
        
        // PhonePe returns expires_at as epoch in seconds, expires_in may be null
        const expiresAtMs = data.expires_at
          ? data.expires_at * 1000
          : data.expires_in
            ? Date.now() + data.expires_in * 1000
            : Date.now() + 30 * 60 * 1000; // fallback: 30 minutes

        cachedToken = {
          token: data.access_token,
          expiresAt: expiresAtMs - 60_000, // refresh 1 minute before actual expiry
        };

        return cachedToken.token;
      } finally {
        pendingTokenRequest = null;
      }
    })();

    return pendingTokenRequest;
  };

  return {
    getAccessToken,

    setupSubscription: async (request: PhonePeSetupSubscriptionRequest) => {
      return fetchWithAuth<PhonePeSetupSubscriptionResponse>(
        `${endpoints.BASE}/${setupPath}`,
        {
          method: 'POST',
          body: JSON.stringify(request),
        },
      );
    },

    getSubscriptionStatus: async (merchantSubscriptionId: string) => {
      return fetchWithAuth<PhonePeSubscriptionStatusResponse>(
        `${endpoints.BASE}/${subPrefix}/${merchantSubscriptionId}/status`,
      );
    },

    cancelSubscription: async (merchantSubscriptionId: string) => {
      return fetchWithAuth<{ state: PhonePeSubscriptionState }>(
        `${endpoints.BASE}/${subPrefix}/${merchantSubscriptionId}/cancel`,
        { method: 'POST' },
      );
    },

    pauseSubscription: async (merchantSubscriptionId: string) => {
      return fetchWithAuth<{ state: PhonePeSubscriptionState }>(
        `${endpoints.BASE}/${subPrefix}/${merchantSubscriptionId}/pause`,
        { method: 'POST' },
      );
    },

    unpauseSubscription: async (merchantSubscriptionId: string) => {
      return fetchWithAuth<{ state: PhonePeSubscriptionState }>(
        `${endpoints.BASE}/${subPrefix}/${merchantSubscriptionId}/unpause`,
        { method: 'POST' },
      );
    },

    notifyRedemption: async (request: PhonePeNotifyRedemptionRequest) => {
      return fetchWithAuth<PhonePeNotifyRedemptionResponse>(
        `${endpoints.BASE}/${subPrefix}/notify`,
        {
          method: 'POST',
          body: JSON.stringify(request),
        },
      );
    },

    executeRedemption: async (request: PhonePeExecuteRedemptionRequest) => {
      return fetchWithAuth<PhonePeExecuteRedemptionResponse>(
        `${endpoints.BASE}/${subPrefix}/redeem`,
        {
          method: 'POST',
          body: JSON.stringify(request),
        },
      );
    },

    getRedemptionOrderStatus: async (merchantOrderId: string) => {
      return fetchWithAuth<PhonePeRedemptionOrderStatusResponse>(
        `${endpoints.BASE}/${orderPrefix}/${merchantOrderId}/status`,
      );
    },

    refund: async (params: RefundParams) => {
      return fetchWithAuth<RefundResponse>(
        `${endpoints.BASE}/payments/v2/refund`,
        {
          method: 'POST',
          body: JSON.stringify({
            merchantRefundId: params.merchantRefundId,
            originalMerchantOrderId: params.originalMerchantOrderId,
            amount: params.amount,
          }),
        },
      );
    },
  };
}

// ============================================================================
// Base PhonePe Provider
// ============================================================================

/**
 * Base class for PhonePe providers
 * 
 * Contains shared functionality for both provider-managed and user-managed subscriptions.
 */
abstract class BasePhonePeProvider implements SubscriptionProvider {
  readonly provider: PaymentProvider = 'PHONEPE';
  protected config: PhonePeProviderConfig | null = null;
  protected client: PhonePeClient | null = null;
  protected checkoutMode: PhonePeCheckoutMode = 'API_INTEGRATION';

  abstract readonly subscriptionType: SubscriptionType;

  initialize(config: PhonePeProviderConfig): void {
    this.config = config;
    this.checkoutMode = config.checkoutMode ?? 'API_INTEGRATION';
    this.client = createPhonePeClient(config);
  }

  protected getSetupFlowType(): typeof PhonePePaymentFlowType.SUBSCRIPTION_CHECKOUT_SETUP | typeof PhonePePaymentFlowType.SUBSCRIPTION_SETUP {
    return this.checkoutMode === 'STANDARD_CHECKOUT'
      ? PhonePePaymentFlowType.SUBSCRIPTION_CHECKOUT_SETUP
      : PhonePePaymentFlowType.SUBSCRIPTION_SETUP;
  }

  protected getRedemptionFlowType(): typeof PhonePePaymentFlowType.SUBSCRIPTION_CHECKOUT_REDEMPTION | typeof PhonePePaymentFlowType.SUBSCRIPTION_REDEMPTION {
    return this.checkoutMode === 'STANDARD_CHECKOUT'
      ? PhonePePaymentFlowType.SUBSCRIPTION_CHECKOUT_REDEMPTION
      : PhonePePaymentFlowType.SUBSCRIPTION_REDEMPTION;
  }

  getPublicConfig(): Record<string, unknown> {
    if (!this.config) {
      throw new Error('Provider not initialized');
    }
    return {
      merchantId: this.config.merchantId,
      clientId: this.config.clientId,
      provider: 'PHONEPE',
    };
  }

  protected ensureInitialized(): void {
    if (!this.config || !this.client) {
      throw createProviderError(
        'Provider not initialized',
        'NOT_INITIALIZED',
        'PHONEPE',
      );
    }
  }

  verifyWebhookSignature(
    _payload: string | Record<string, unknown>,
    signature: string,
  ): boolean {
    this.ensureInitialized();
    
    // PhonePe webhook verification uses Authorization header containing SHA256(username:password).
    // The saltKey stores the pre-computed SHA256(username:password) hash.
    // We compare the Authorization header value against this stored hash.
    if (!this.config!.saltKey) return false;
    
    return signature === this.config!.saltKey;
  }

  async healthCheck(): Promise<{ readonly healthy: boolean; readonly message: string | null }> {
    try {
      this.ensureInitialized();
      await this.client!.getAccessToken();
      return { healthy: true, message: null };
    } catch (error) {
      return {
        healthy: false,
        message: error instanceof Error ? error.message : 'Health check failed',
      };
    }
  }

  // ============================================================================
  // Shared Protected Methods
  // ============================================================================

  /**
   * Map PhonePe frequency string to our BillingFrequency type
   */
  protected mapPhonePeFrequencyToFrequency(phonePeFrequency: string): BillingFrequency | null {
    const frequencyMap: Record<string, BillingFrequency> = {
      'DAILY': 'DAILY',
      'WEEKLY': 'WEEKLY',
      'FORTNIGHTLY': 'FORTNIGHTLY',
      'MONTHLY': 'MONTHLY',
      'BIMONTHLY': 'BIMONTHLY',
      'QUARTERLY': 'QUARTERLY',
      'HALFYEARLY': 'HALF_YEARLY',
      'YEARLY': 'YEARLY',
      'ONDEMAND': 'ON_DEMAND',
    };
    return frequencyMap[phonePeFrequency] ?? null;
  }

  /**
   * Map PhonePe order state to our order status
   */
  protected mapPhonePeOrderStateToStatus(state: string): string {
    const stateMap: Record<string, string> = {
      [PhonePeOrderState.PENDING]: 'PENDING',
      [PhonePeOrderState.NOTIFICATION_IN_PROGRESS]: 'PENDING',
      [PhonePeOrderState.NOTIFIED]: 'PENDING',
      [PhonePeOrderState.COMPLETED]: 'CAPTURED',
      [PhonePeOrderState.FAILED]: 'FAILED',
    };
    return stateMap[state] ?? state;
  }

  /**
   * Map PhonePe webhook event type to our normalized event type
   */
  protected mapWebhookEventType(phonePeEvent: string): string {
    const eventMap: Record<string, string> = {
      [PhonePeWebhookEvent.SUBSCRIPTION_SETUP_ORDER_COMPLETED]: 'subscription.setup.completed',
      [PhonePeWebhookEvent.SUBSCRIPTION_SETUP_ORDER_FAILED]: 'subscription.setup.failed',
      [PhonePeWebhookEvent.CHECKOUT_ORDER_COMPLETED]: 'subscription.setup.completed',
      [PhonePeWebhookEvent.CHECKOUT_ORDER_FAILED]: 'subscription.setup.failed',
      [PhonePeWebhookEvent.SUBSCRIPTION_PAUSED]: 'subscription.paused',
      [PhonePeWebhookEvent.SUBSCRIPTION_UNPAUSED]: 'subscription.unpaused',
      [PhonePeWebhookEvent.SUBSCRIPTION_REVOKED]: 'subscription.revoked',
      [PhonePeWebhookEvent.SUBSCRIPTION_CANCELLED]: 'subscription.cancelled',
      [PhonePeWebhookEvent.SUBSCRIPTION_NOTIFICATION_COMPLETED]: 'subscription.notification.completed',
      [PhonePeWebhookEvent.SUBSCRIPTION_NOTIFICATION_FAILED]: 'subscription.notification.failed',
      [PhonePeWebhookEvent.SUBSCRIPTION_REDEMPTION_ORDER_COMPLETED]: 'subscription.redemption.completed',
      [PhonePeWebhookEvent.SUBSCRIPTION_REDEMPTION_ORDER_FAILED]: 'subscription.redemption.failed',
      [PhonePeWebhookEvent.SUBSCRIPTION_REDEMPTION_TRANSACTION_COMPLETED]: 'subscription.transaction.completed',
      [PhonePeWebhookEvent.SUBSCRIPTION_REDEMPTION_TRANSACTION_FAILED]: 'subscription.transaction.failed',
    };
    return eventMap[phonePeEvent] ?? phonePeEvent;
  }

  /**
   * Decode PhonePe webhook payload
   */
  protected decodeWebhookPayload(params: ParseWebhookParams): {
    decoded: PhonePeDecodedWebhookPayload;
    signatureValid: boolean;
  } {
    const payloadStr = typeof params.payload === 'string' 
      ? params.payload 
      : JSON.stringify(params.payload);
    
    let decoded: PhonePeDecodedWebhookPayload;
    try {
      const decodedStr = Buffer.from(payloadStr, 'base64').toString('utf-8');
      decoded = JSON.parse(decodedStr) as unknown as PhonePeDecodedWebhookPayload;
    } catch {
      decoded = typeof params.payload === 'string' 
        ? JSON.parse(params.payload) as unknown as PhonePeDecodedWebhookPayload
        : params.payload as unknown as PhonePeDecodedWebhookPayload;
    }

    const signatureValid = params.signature 
      ? this.verifyWebhookSignature(params.payload, params.signature)
      : false;

    return { decoded, signatureValid };
  }

  /**
   * Build base webhook event from decoded payload
   */
  protected buildWebhookEvent(
    decoded: PhonePeDecodedWebhookPayload,
    signatureValid: boolean,
  ): Omit<WebhookEvent, 'subscriptionType'> {
    const eventType = decoded.event;
    const data = decoded.payload;

    return {
      eventId: data.orderId ?? data.subscriptionId ?? Date.now().toString(),
      eventType,
      mappedEventType: this.mapWebhookEventType(eventType),
      provider: 'PHONEPE',
      appId: null,
      merchantSubscriptionId: data.merchantSubscriptionId ?? data.paymentFlow?.merchantSubscriptionId ?? null,
      providerSubscriptionId: data.subscriptionId ?? data.paymentFlow?.subscriptionId ?? null,
      merchantOrderId: data.merchantOrderId ?? null,
      providerOrderId: data.orderId ?? null,
      paymentId: data.transactionId ?? null,
      timestamp: new Date(),
      status: data.state ?? null,
      amount: data.amount ?? null,
      currency: data.currency ?? 'INR',
      rawPayload: decoded as unknown as Record<string, unknown>,
      signatureValid,
      errorCode: data.errorCode ?? null,
      errorMessage: null,
    };
  }

  /**
   * Build payment details array from PhonePe response
   */
  protected buildPaymentDetails(response: PhonePeRedemptionOrderStatusResponse): PaymentDetail[] {
    const paymentDetails: PaymentDetail[] = [];
    if ('paymentDetails' in response && response.paymentDetails) {
      for (const pd of response.paymentDetails) {
        paymentDetails.push({
          transactionId: pd.transactionId,
          paymentMode: pd.paymentMode,
          timestamp: unixToDate(pd.timestamp),
          amount: pd.amount,
          state: pd.state,
        });
      }
    }
    return paymentDetails;
  }

  /**
   * Create a successful setup result
   */
  protected createSetupSuccessResult(
    params: SetupSubscriptionParams,
    response: PhonePeSetupSubscriptionResponse,
  ): SetupSubscriptionResult {
    return {
      success: true,
      merchantSubscriptionId: params.merchantSubscriptionId,
      merchantOrderId: params.merchantOrderId,
      providerSubscriptionId: params.merchantSubscriptionId,
      providerOrderId: response.orderId,
      intentUrl: null,
      redirectUrl: response.redirectUrl,
      state: response.state,
      expiresAt: unixToDate(response.expireAt),
      providerData: { response },
      error: null,
      errorCode: null,
    };
  }

  /**
   * Create a failed setup result
   */
  protected createSetupFailedResult(
    params: SetupSubscriptionParams,
    error: unknown,
  ): SetupSubscriptionResult {
    const message = error instanceof Error ? error.message : 'Failed to setup subscription';
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
      error: message,
      errorCode: 'SETUP_FAILED',
    };
  }

  /**
   * Create a successful charge result
   */
  protected createChargeSuccessResult(
    params: ChargeSubscriptionParams,
    orderId: string,
    state: string,
    transactionId: string | null = null,
    providerData: Record<string, unknown> = {},
  ): ChargeSubscriptionResult {
    return {
      success: true,
      merchantOrderId: params.merchantOrderId,
      providerOrderId: orderId,
      transactionId,
      amount: params.amount,
      currency: params.currency,
      state,
      paidAt: null,
      providerData,
      error: null,
      errorCode: null,
    };
  }

  /**
   * Create a failed charge result
   */
  protected createChargeFailedResult(
    params: ChargeSubscriptionParams,
    error: unknown,
  ): ChargeSubscriptionResult {
    const message = error instanceof Error ? error.message : 'Failed to charge subscription';
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
      error: message,
      errorCode: 'CHARGE_FAILED',
    };
  }

  /**
   * Create a successful cancel result
   */
  protected createCancelSuccessResult(state: string): CancelSubscriptionResult {
    return {
      success: state === PhonePeSubscriptionState.CANCELLED ||
               state === PhonePeSubscriptionState.CANCEL_IN_PROGRESS,
      state,
      cancelledAt: new Date(),
      error: null,
    };
  }

  /**
   * Create a failed cancel result
   */
  protected createCancelFailedResult(error: unknown): CancelSubscriptionResult {
    const message = error instanceof Error ? error.message : 'Failed to cancel subscription';
    return {
      success: false,
      state: 'cancel_failed',
      cancelledAt: null,
      error: message,
    };
  }

  abstract setupSubscription(params: SetupSubscriptionParams): Promise<SetupSubscriptionResult>;
  abstract chargeSubscription(params: ChargeSubscriptionParams): Promise<ChargeSubscriptionResult>;
  abstract getSubscriptionStatus(params: GetSubscriptionStatusParams): Promise<SubscriptionStatusResult>;
  abstract getOrderStatus(params: GetOrderStatusParams): Promise<OrderStatusResult>;
  abstract cancelSubscription(params: CancelSubscriptionParams): Promise<CancelSubscriptionResult>;
  abstract parseWebhookEvent(params: ParseWebhookParams): Promise<WebhookEvent>;
}

// ============================================================================
// Provider-Managed PhonePe Implementation
// ============================================================================

/**
 * PhonePe Provider-Managed Subscription Provider
 * 
 * PhonePe handles:
 * - Auto-deduction after notify (with autoDebit=true)
 * - Retry logic (STANDARD strategy)
 * 
 * We handle:
 * - Notify for each billing cycle
 * - Webhook events for status updates
 */
export class PhonePeProviderManagedProvider extends BasePhonePeProvider {
  readonly subscriptionType: SubscriptionType = 'PROVIDER_MANAGED';

  async setupSubscription(params: SetupSubscriptionParams): Promise<SetupSubscriptionResult> {
    this.ensureInitialized();

    try {
      const request: PhonePeSetupSubscriptionRequest = {
        merchantOrderId: params.merchantOrderId,
        amount: params.pricing.initialAmount || params.pricing.recurringAmount,
        paymentFlow: {
          type: this.getSetupFlowType(),
          merchantUrls: {
            redirectUrl: params.redirectUrl ?? '',
          },
          subscriptionDetails: {
            subscriptionType: PhonePeSubscriptionType.RECURRING,
            merchantSubscriptionId: params.merchantSubscriptionId,
            authWorkflowType: PhonePeAuthWorkflowType.TRANSACTION,
            amountType: PhonePeAmountType.FIXED,
            maxAmount: params.pricing.recurringAmount,
            frequency: toPhonePeFrequency(params.pricing.frequency),
            productType: PhonePeProductType.UPI_MANDATE,
          },
        },
        metaInfo: {
          udf1: params.planId,
          udf2: params.metadata.customerName,
        },
      };

      const response = await this.client!.setupSubscription(request);
      return this.createSetupSuccessResult(params, response);
    } catch (error) {
      return this.createSetupFailedResult(params, error);
    }
  }

  async chargeSubscription(params: ChargeSubscriptionParams): Promise<ChargeSubscriptionResult> {
    this.ensureInitialized();

    try {
      // For provider-managed, we notify PhonePe about the upcoming charge
      // PhonePe will auto-deduct if autoDebit is true
      const request: PhonePeNotifyRedemptionRequest = {
        merchantOrderId: params.merchantOrderId,
        amount: params.amount,
        paymentFlow: {
          type: this.getRedemptionFlowType(),
          merchantSubscriptionId: params.merchantSubscriptionId,
          autoDebit: true, // Provider-managed: auto deduct
        },
        metaInfo: {
          udf1: params.metadata.planId,
        },
      };

      const response = await this.client!.notifyRedemption(request);
      return this.createChargeSuccessResult(
        params,
        response.orderId,
        response.state,
        null,
        { response },
      );
    } catch (error) {
      return this.createChargeFailedResult(params, error);
    }
  }

  async getSubscriptionStatus(params: GetSubscriptionStatusParams): Promise<SubscriptionStatusResult> {
    this.ensureInitialized();

    try {
      const response = await this.client!.getSubscriptionStatus(params.merchantSubscriptionId);
      const mappedStatus = mapPhonePeSubscriptionState(response.state);

      return {
        merchantSubscriptionId: params.merchantSubscriptionId,
        providerSubscriptionId: response.subscriptionId,
        providerState: response.state,
        mappedStatus,
        maxAmount: response.maxAmount,
        frequency: this.mapPhonePeFrequencyToFrequency(response.frequency),
        nextBillingDate: null, // PhonePe doesn't provide this directly
        paidCount: 0, // Track in our system
        remainingCount: null,
        canCharge: response.state === PhonePeSubscriptionState.ACTIVE,
        providerData: { response },
      };
    } catch (error) {
      throw createProviderError(
        'Failed to get subscription status',
        'STATUS_CHECK_FAILED',
        'PHONEPE',
        error instanceof Error ? error : null,
      );
    }
  }

  async getOrderStatus(params: GetOrderStatusParams): Promise<OrderStatusResult> {
    this.ensureInitialized();

    try {
      const response = await this.client!.getRedemptionOrderStatus(params.merchantOrderId);
      const paymentDetails = this.buildPaymentDetails(response);
      const mappedStatus = this.mapPhonePeOrderStateToStatus(response.state);

      return {
        merchantOrderId: params.merchantOrderId,
        providerOrderId: response.orderId,
        providerState: response.state,
        mappedStatus,
        amount: response.amount,
        currency: 'INR',
        expiresAt: 'expireAt' in response ? unixToDate(response.expireAt as number) : null,
        paymentDetails,
        providerData: { response },
      };
    } catch (error) {
      throw createProviderError(
        'Failed to get order status',
        'ORDER_STATUS_FAILED',
        'PHONEPE',
        error instanceof Error ? error : null,
      );
    }
  }

  async cancelSubscription(params: CancelSubscriptionParams): Promise<CancelSubscriptionResult> {
    this.ensureInitialized();

    try {
      const response = await this.client!.cancelSubscription(params.merchantSubscriptionId);
      return this.createCancelSuccessResult(response.state);
    } catch (error) {
      return this.createCancelFailedResult(error);
    }
  }

  async pauseSubscription(
    merchantSubscriptionId: string,
    providerSubscriptionId: string,
  ): Promise<SubscriptionStatusResult> {
    this.ensureInitialized();

    try {
      const response = await this.client!.pauseSubscription(merchantSubscriptionId);
      const mappedStatus = mapPhonePeSubscriptionState(response.state);

      return {
        merchantSubscriptionId,
        providerSubscriptionId,
        providerState: response.state,
        mappedStatus,
        maxAmount: null,
        frequency: null,
        nextBillingDate: null,
        paidCount: 0,
        remainingCount: null,
        canCharge: false,
        providerData: { response },
      };
    } catch (error) {
      throw createProviderError(
        'Failed to pause subscription',
        'PAUSE_FAILED',
        'PHONEPE',
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
      const response = await this.client!.unpauseSubscription(merchantSubscriptionId);
      const mappedStatus = mapPhonePeSubscriptionState(response.state);

      return {
        merchantSubscriptionId,
        providerSubscriptionId,
        providerState: response.state,
        mappedStatus,
        maxAmount: null,
        frequency: null,
        nextBillingDate: null,
        paidCount: 0,
        remainingCount: null,
        canCharge: response.state === PhonePeSubscriptionState.ACTIVE,
        providerData: { response },
      };
    } catch (error) {
      throw createProviderError(
        'Failed to resume subscription',
        'RESUME_FAILED',
        'PHONEPE',
        error instanceof Error ? error : null,
      );
    }
  }

  async parseWebhookEvent(params: ParseWebhookParams): Promise<WebhookEvent> {
    const { decoded, signatureValid } = this.decodeWebhookPayload(params);
    const baseEvent = this.buildWebhookEvent(decoded, signatureValid);

    return {
      ...baseEvent,
      subscriptionType: 'PROVIDER_MANAGED',
    };
  }
}

// ============================================================================
// User-Managed PhonePe Implementation
// ============================================================================

/**
 * PhonePe User-Managed Subscription Provider
 * 
 * We handle:
 * - Notify for each billing cycle
 * - Execute to trigger the charge (autoDebit=false)
 * - Retry logic with custom retry strategy
 * 
 * PhonePe handles:
 * - Payment processing
 */
export class PhonePeUserManagedProvider extends BasePhonePeProvider {
  readonly subscriptionType: SubscriptionType = 'USER_MANAGED';

  async setupSubscription(params: SetupSubscriptionParams): Promise<SetupSubscriptionResult> {
    this.ensureInitialized();

    try {
      const request: PhonePeSetupSubscriptionRequest = {
        merchantOrderId: params.merchantOrderId,
        amount: params.pricing.initialAmount || params.pricing.recurringAmount,
        paymentFlow: {
          type: this.getSetupFlowType(),
          merchantUrls: {
            redirectUrl: params.redirectUrl ?? '',
          },
          subscriptionDetails: {
            subscriptionType: PhonePeSubscriptionType.RECURRING,
            merchantSubscriptionId: params.merchantSubscriptionId,
            authWorkflowType: PhonePeAuthWorkflowType.TRANSACTION,
            amountType: PhonePeAmountType.VARIABLE, // User-managed can have variable amounts
            maxAmount: params.pricing.recurringAmount,
            frequency: toPhonePeFrequency(params.pricing.frequency),
            productType: PhonePeProductType.UPI_MANDATE,
          },
        },
        metaInfo: {
          udf1: params.planId,
          udf2: params.metadata.customerName,
        },
      };

      const response = await this.client!.setupSubscription(request);
      return this.createSetupSuccessResult(params, response);
    } catch (error) {
      return this.createSetupFailedResult(params, error);
    }
  }

  async chargeSubscription(params: ChargeSubscriptionParams): Promise<ChargeSubscriptionResult> {
    this.ensureInitialized();

    try {
      // Step 1: Notify about the charge
      const notifyRequest: PhonePeNotifyRedemptionRequest = {
        merchantOrderId: params.merchantOrderId,
        amount: params.amount,
        paymentFlow: {
          type: this.getRedemptionFlowType(),
          merchantSubscriptionId: params.merchantSubscriptionId,
          autoDebit: false, // User-managed: we control when to execute
        },
        metaInfo: {
          udf1: params.metadata.planId,
        },
      };

      const notifyResponse = await this.client!.notifyRedemption(notifyRequest);

      // Step 2: Execute the charge immediately (or wait for scheduled time)
      const executeRequest: PhonePeExecuteRedemptionRequest = {
        merchantOrderId: params.merchantOrderId,
      };

      const executeResponse = await this.client!.executeRedemption(executeRequest);

      return this.createChargeSuccessResult(
        params,
        notifyResponse.orderId,
        executeResponse.state,
        executeResponse.transactionId,
        { notifyResponse, executeResponse },
      );
    } catch (error) {
      return this.createChargeFailedResult(params, error);
    }
  }

  async getSubscriptionStatus(params: GetSubscriptionStatusParams): Promise<SubscriptionStatusResult> {
    this.ensureInitialized();

    try {
      const response = await this.client!.getSubscriptionStatus(params.merchantSubscriptionId);
      const mappedStatus = mapPhonePeSubscriptionState(response.state);

      return {
        merchantSubscriptionId: params.merchantSubscriptionId,
        providerSubscriptionId: response.subscriptionId,
        providerState: response.state,
        mappedStatus,
        maxAmount: response.maxAmount,
        frequency: this.mapPhonePeFrequencyToFrequency(response.frequency),
        nextBillingDate: null,
        paidCount: 0,
        remainingCount: null,
        canCharge: response.state === PhonePeSubscriptionState.ACTIVE,
        providerData: { response },
      };
    } catch (error) {
      throw createProviderError(
        'Failed to get subscription status',
        'STATUS_CHECK_FAILED',
        'PHONEPE',
        error instanceof Error ? error : null,
      );
    }
  }

  async getOrderStatus(params: GetOrderStatusParams): Promise<OrderStatusResult> {
    this.ensureInitialized();

    try {
      const response = await this.client!.getRedemptionOrderStatus(params.merchantOrderId);
      const paymentDetails = this.buildPaymentDetails(response);
      const mappedStatus = this.mapPhonePeOrderStateToStatus(response.state);

      return {
        merchantOrderId: params.merchantOrderId,
        providerOrderId: response.orderId,
        providerState: response.state,
        mappedStatus,
        amount: response.amount,
        currency: 'INR',
        expiresAt: 'expireAt' in response ? unixToDate(response.expireAt as number) : null,
        paymentDetails,
        providerData: { response },
      };
    } catch (error) {
      throw createProviderError(
        'Failed to get order status',
        'ORDER_STATUS_FAILED',
        'PHONEPE',
        error instanceof Error ? error : null,
      );
    }
  }

  async cancelSubscription(params: CancelSubscriptionParams): Promise<CancelSubscriptionResult> {
    this.ensureInitialized();

    try {
      const response = await this.client!.cancelSubscription(params.merchantSubscriptionId);
      return this.createCancelSuccessResult(response.state);
    } catch (error) {
      return this.createCancelFailedResult(error);
    }
  }

  async pauseSubscription(
    merchantSubscriptionId: string,
    providerSubscriptionId: string,
  ): Promise<SubscriptionStatusResult> {
    this.ensureInitialized();

    try {
      const response = await this.client!.pauseSubscription(merchantSubscriptionId);
      const mappedStatus = mapPhonePeSubscriptionState(response.state);

      return {
        merchantSubscriptionId,
        providerSubscriptionId,
        providerState: response.state,
        mappedStatus,
        maxAmount: null,
        frequency: null,
        nextBillingDate: null,
        paidCount: 0,
        remainingCount: null,
        canCharge: false,
        providerData: { response },
      };
    } catch (error) {
      throw createProviderError(
        'Failed to pause subscription',
        'PAUSE_FAILED',
        'PHONEPE',
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
      const response = await this.client!.unpauseSubscription(merchantSubscriptionId);
      const mappedStatus = mapPhonePeSubscriptionState(response.state);

      return {
        merchantSubscriptionId,
        providerSubscriptionId,
        providerState: response.state,
        mappedStatus,
        maxAmount: null,
        frequency: null,
        nextBillingDate: null,
        paidCount: 0,
        remainingCount: null,
        canCharge: response.state === PhonePeSubscriptionState.ACTIVE,
        providerData: { response },
      };
    } catch (error) {
      throw createProviderError(
        'Failed to resume subscription',
        'RESUME_FAILED',
        'PHONEPE',
        error instanceof Error ? error : null,
      );
    }
  }

  async parseWebhookEvent(params: ParseWebhookParams): Promise<WebhookEvent> {
    const { decoded, signatureValid } = this.decodeWebhookPayload(params);
    const baseEvent = this.buildWebhookEvent(decoded, signatureValid);

    return {
      ...baseEvent,
      subscriptionType: 'USER_MANAGED',
    };
  }
}

// ============================================================================
// Exports
// ============================================================================

export {
  BasePhonePeProvider,
  createPhonePeClient,
  type PhonePeClient,
  type RefundParams,
  type RefundResponse,
  PHONEPE_ENDPOINTS,
};
