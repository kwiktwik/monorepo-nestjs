/**
 * Webhook Processor Service
 * 
 * Processes incoming webhooks from payment providers with:
 * - Signature verification
 * - Idempotency checking
 * - Event routing to handlers
 * - Error handling and retry logic
 */

import { Injectable, Logger } from '@nestjs/common';
import type { PaymentProvider } from '../types/provider.enum';
import {
  type NormalizedWebhookEvent,
  type WebhookHeaders,
  type WebhookHandler,
  type WebhookHandlerResult,
  type WebhookAction,
  getEventCategory,
  WebhookEventCategory,
} from './webhook-types';
import { webhookParserRegistry, WebhookParserRegistry } from './webhook-parsers';

// ============================================================================
// Process Webhook Parameters
// ============================================================================

/**
 * Parameters for processing a webhook
 */
export interface ProcessWebhookParams {
  /** Payment provider that sent the webhook */
  readonly provider: PaymentProvider;
  /** Raw webhook payload */
  readonly payload: string | Buffer;
  /** Webhook headers */
  readonly headers: WebhookHeaders;
  /** Webhook secret for signature verification */
  readonly secret?: string;
  /** Whether to skip signature verification */
  readonly skipSignatureVerification?: boolean;
}

// ============================================================================
// Process Webhook Result
// ============================================================================

/**
 * Result of processing a webhook
 */
export interface ProcessWebhookResult {
  /** Whether processing was successful */
  readonly success: boolean;
  /** Parsed and normalized event */
  readonly event?: NormalizedWebhookEvent;
  /** Whether this was a duplicate event */
  readonly duplicate?: boolean;
  /** Results from handlers */
  readonly handlerResults?: readonly WebhookHandlerResult[];
  /** Error message if failed */
  readonly error?: string;
  /** Error code if failed */
  readonly errorCode?: string;
}

// ============================================================================
// Idempotency Store Interface
// ============================================================================

/**
 * Interface for idempotency checking
 */
export interface IdempotencyStore {
  /**
   * Check if event has been processed
   */
  isProcessed(eventId: string): Promise<boolean>;

  /**
   * Mark event as processed
   */
  markProcessed(eventId: string): Promise<void>;
}

/**
 * In-memory idempotency store (for development/testing)
 */
export class InMemoryIdempotencyStore implements IdempotencyStore {
  private readonly processedEvents = new Set<string>();

  async isProcessed(eventId: string): Promise<boolean> {
    return this.processedEvents.has(eventId);
  }

  async markProcessed(eventId: string): Promise<void> {
    this.processedEvents.add(eventId);
  }
}

// ============================================================================
// Webhook Secret Provider
// ============================================================================

/**
 * Interface for providing webhook secrets
 */
export interface WebhookSecretProvider {
  /**
   * Get webhook secret for provider and app
   */
  getSecret(provider: PaymentProvider, appId: string | null): Promise<string | null>;
}

// ============================================================================
// Webhook Processor Service
// ============================================================================

/**
 * Webhook processor service
 * 
 * Handles incoming webhooks from payment providers:
 * 1. Parse and normalize the webhook
 * 2. Verify signature
 * 3. Check idempotency
 * 4. Route to appropriate handlers
 * 5. Track processing status
 */
@Injectable()
export class WebhookProcessorService {
  private readonly logger = new Logger(WebhookProcessorService.name);
  private readonly handlers: Map<string, WebhookHandler[]> = new Map();
  private readonly wildcardHandlers: WebhookHandler[] = [];
  private idempotencyStore: IdempotencyStore = new InMemoryIdempotencyStore();
  private secretProvider: WebhookSecretProvider | null = null;
  private readonly parserRegistry: WebhookParserRegistry;

  constructor() {
    this.parserRegistry = webhookParserRegistry;
  }

  /**
   * Set idempotency store
   */
  setIdempotencyStore(store: IdempotencyStore): void {
    this.idempotencyStore = store;
  }

  /**
   * Set secret provider
   */
  setSecretProvider(provider: WebhookSecretProvider): void {
    this.secretProvider = provider;
  }

  /**
   * Register a handler for specific event type
   */
  onEvent(eventType: string, handler: WebhookHandler): void {
    const existing = this.handlers.get(eventType) ?? [];
    this.handlers.set(eventType, [...existing, handler]);
  }

  /**
   * Register a handler for all events
   */
  onAnyEvent(handler: WebhookHandler): void {
    this.wildcardHandlers.push(handler);
  }

  /**
   * Register a handler for event category
   */
  onCategory(category: WebhookEventCategory, handler: WebhookHandler): void {
    this.wildcardHandlers.push(async (event) => {
      if (getEventCategory(event.eventType) === category) {
        return handler(event);
      }
      return { success: true };
    });
  }

  /**
   * Process incoming webhook
   */
  async process(params: ProcessWebhookParams): Promise<ProcessWebhookResult> {
    const { provider, payload, headers, secret, skipSignatureVerification } = params;

    // 1. Parse the webhook
    const parseResult = this.parserRegistry.parse(provider, payload, headers);

    if (!parseResult.success || !parseResult.event) {
      this.logger.error(`Failed to parse webhook from ${provider}: ${parseResult.error}`);
      return {
        success: false,
        error: parseResult.error,
        errorCode: parseResult.errorCode,
      };
    }

    let event = parseResult.event;

    // 2. Verify signature if not skipped
    if (!skipSignatureVerification) {
      const signature = headers.signature ?? headers['X-Signature'] ?? '';
      const webhookSecret = secret ?? (await this.getWebhookSecret(provider, event.appId));

      if (webhookSecret && signature) {
        const isValid = this.parserRegistry.verifySignature(
          provider,
          payload,
          signature,
          webhookSecret,
        );

        event = {
          ...event,
          signatureValid: isValid,
        };

        if (!isValid) {
          this.logger.warn(`Webhook signature verification failed for ${provider}`);
          // Continue processing but mark as invalid
        }
      } else {
        this.logger.debug(`No webhook secret or signature for ${provider}`);
      }
    }

    // 3. Check idempotency
    try {
      const isDuplicate = await this.idempotencyStore.isProcessed(event.eventId);
      if (isDuplicate) {
        this.logger.debug(`Duplicate webhook event: ${event.eventId}`);
        return {
          success: true,
          event,
          duplicate: true,
        };
      }
    } catch (error) {
      this.logger.error(`Idempotency check failed: ${error}`);
      // Continue processing despite idempotency check failure
    }

    // 4. Get handlers for this event
    const handlers = this.getHandlers(event.eventType);

    if (handlers.length === 0) {
      this.logger.debug(`No handlers registered for event: ${event.eventType}`);
    }

    // 5. Execute handlers
    const results: WebhookHandlerResult[] = [];
    for (const handler of handlers) {
      try {
        const result = await handler(event);
        results.push(result);

        if (!result.success) {
          this.logger.warn(
            `Handler failed for event ${event.eventType}: ${result.error}`,
          );
        }
      } catch (error) {
        const result: WebhookHandlerResult = {
          success: false,
          error: error instanceof Error ? error.message : 'Handler threw an error',
        };
        results.push(result);
        this.logger.error(
          `Handler error for event ${event.eventType}: ${error}`,
        );
      }
    }

    // 6. Check if any handler requested a retry
    const anyRetryRequested = results.some((r) => !r.success && r.retry);

    // 7. Mark as processed only if no handler requested a retry
    if (!anyRetryRequested) {
      try {
        await this.idempotencyStore.markProcessed(event.eventId);
      } catch (error) {
        this.logger.error(`Failed to mark event as processed: ${error}`);
      }
    } else {
      this.logger.warn(`Handler requested retry for event ${event.eventId}, not marking as processed`);
    }

    // 8. Determine overall success
    const allSuccessful = results.every((r) => r.success);

    return {
      success: allSuccessful,
      event: {
        ...event,
        processed: true,
      },
      handlerResults: results,
    };
  }

  /**
   * Get handlers for an event type
   */
  private getHandlers(eventType: string): WebhookHandler[] {
    const specificHandlers = this.handlers.get(eventType) ?? [];
    return [...specificHandlers, ...this.wildcardHandlers];
  }

  /**
   * Get webhook secret for provider
   */
  private async getWebhookSecret(
    provider: PaymentProvider,
    appId: string | null,
  ): Promise<string | null> {
    if (this.secretProvider) {
      return this.secretProvider.getSecret(provider, appId);
    }

    // Fallback to environment variables
    const envKey = `${provider}_WEBHOOK_SECRET`;
    return process.env[envKey] ?? null;
  }
}

// ============================================================================
// Built-in Handlers
// ============================================================================

/**
 * Create a logging handler
 */
export function createLoggingHandler(logger: Logger): WebhookHandler {
  return async (event) => {
    logger.log({
      message: `Webhook event received: ${event.eventType}`,
      eventId: event.eventId,
      provider: event.provider,
      providerEventType: event.providerEventType,
      merchantSubscriptionId: event.merchantSubscriptionId,
      merchantOrderId: event.merchantOrderId,
      amount: event.amount,
      status: event.currentStatus,
      signatureValid: event.signatureValid,
    });
    return { success: true };
  };
}

/**
 * Create a subscription status update handler
 */
export function createSubscriptionStatusHandler(
  updateFn: (subscriptionId: string, status: string) => Promise<void>,
): WebhookHandler {
  return async (event) => {
    if (!event.merchantSubscriptionId || !event.unifiedSubscriptionStatus) {
      return { success: true }; // Not a subscription event
    }

    try {
      await updateFn(
        event.merchantSubscriptionId,
        event.unifiedSubscriptionStatus,
      );
      return {
        success: true,
        actions: [
          {
            type: 'UPDATE_SUBSCRIPTION_STATUS',
            subscriptionId: event.merchantSubscriptionId,
            status: event.unifiedSubscriptionStatus,
          },
        ],
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update subscription',
      };
    }
  };
}

/**
 * Create an order status update handler
 */
export function createOrderStatusHandler(
  updateFn: (orderId: string, status: string, paymentId?: string) => Promise<void>,
): WebhookHandler {
  return async (event) => {
    if (!event.merchantOrderId || !event.unifiedOrderStatus) {
      return { success: true }; // Not an order event
    }

    try {
      await updateFn(
        event.merchantOrderId,
        event.unifiedOrderStatus,
        event.paymentId ?? undefined,
      );
      return {
        success: true,
        actions: [
          {
            type: 'UPDATE_ORDER_STATUS',
            orderId: event.merchantOrderId,
            status: event.unifiedOrderStatus,
          },
        ],
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update order',
      };
    }
  };
}

/**
 * Create a payment recording handler
 */
export function createPaymentRecordHandler(
  recordFn: (orderId: string, paymentDetails: unknown) => Promise<void>,
): WebhookHandler {
  return async (event) => {
    if (
      event.eventType !== 'payment.captured' &&
      event.eventType !== 'redemption.transaction.completed'
    ) {
      return { success: true };
    }

    if (!event.merchantOrderId || event.paymentDetails.length === 0) {
      return { success: true };
    }

    try {
      await recordFn(event.merchantOrderId, event.paymentDetails);
      return {
        success: true,
        actions: event.paymentDetails.map((pd) => ({
          type: 'RECORD_PAYMENT' as const,
          orderId: event.merchantOrderId!,
          paymentId: pd.transactionId,
          amount: pd.amount,
        })),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to record payment',
      };
    }
  };
}
