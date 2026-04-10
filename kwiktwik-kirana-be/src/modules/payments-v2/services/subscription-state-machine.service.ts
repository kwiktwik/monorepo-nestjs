/**
 * Subscription State Machine Service
 * 
 * Manages subscription state transitions with proper validation and event handling.
 * Supports both provider-managed and user-managed subscription types.
 */

import { Injectable, Logger } from '@nestjs/common';
import {
  SubscriptionStatus,
  StateMachineEvent,
  StateTransitionResult,
  StateTransitionError,
  attemptTransition,
  isValidTransition,
  getValidTargetStatuses,
  getTransitionEvent,
  isTerminalStatus,
  canCharge,
  isPremiumStatus,
  getStatusCategory,
} from '../types/subscription-status.enum';
import type { SubscriptionType } from '../types/subscription-type.enum';
import type { Subscription } from '../domain/entities/subscription.entity';
import { transitionSubscriptionStatus } from '../domain/entities/subscription.entity';

// ============================================================================
// Types
// ============================================================================

/**
 * State transition context
 */
export interface StateTransitionContext {
  /** Subscription being transitioned */
  readonly subscription: Subscription;
  /** Event triggering the transition */
  readonly event: StateMachineEvent;
  /** Additional metadata for the transition */
  readonly metadata?: Record<string, unknown>;
  /** Timestamp of the transition */
  readonly timestamp: Date;
  /** Who initiated the transition */
  readonly initiatedBy?: string;
}

/**
 * State transition result with subscription
 */
export interface StateMachineResult {
  /** Whether the transition was successful */
  readonly success: boolean;
  /** Updated subscription (or original if failed) */
  readonly subscription: Subscription;
  /** Previous status */
  readonly previousStatus: SubscriptionStatus;
  /** New status (same as previous if failed) */
  readonly newStatus: SubscriptionStatus;
  /** Event that triggered the transition */
  readonly event: StateMachineEvent;
  /** Error if transition failed */
  readonly error?: StateTransitionError;
}

/**
 * State transition handler function type
 */
export type StateTransitionHandler = (
  context: StateTransitionContext,
  result: StateMachineResult,
) => Promise<void> | void;

/**
 * State machine configuration
 */
export interface StateMachineConfig {
  /** Whether to log transitions */
  readonly enableLogging: boolean;
  /** Handlers to call before transition */
  readonly preTransitionHandlers: readonly StateTransitionHandler[];
  /** Handlers to call after successful transition */
  readonly postTransitionHandlers: readonly StateTransitionHandler[];
  /** Handlers to call on transition failure */
  readonly errorHandlers: readonly StateTransitionHandler[];
}

// ============================================================================
// Default Configuration
// ============================================================================

const DEFAULT_CONFIG: StateMachineConfig = {
  enableLogging: true,
  preTransitionHandlers: [],
  postTransitionHandlers: [],
  errorHandlers: [],
};

// ============================================================================
// Service
// ============================================================================

/**
 * Subscription State Machine Service
 * 
 * Provides a clean API for managing subscription state transitions.
 */
@Injectable()
export class SubscriptionStateMachineService {
  private readonly logger = new Logger(SubscriptionStateMachineService.name);
  private config: StateMachineConfig = DEFAULT_CONFIG;
  private readonly preTransitionHandlers: StateTransitionHandler[] = [];
  private readonly postTransitionHandlers: StateTransitionHandler[] = [];
  private readonly errorHandlers: StateTransitionHandler[] = [];

  /**
   * Configure the state machine
   */
  configure(config: Partial<StateMachineConfig>): void {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Register a pre-transition handler
   */
  onPreTransition(handler: StateTransitionHandler): void {
    this.preTransitionHandlers.push(handler);
  }

  /**
   * Register a post-transition handler
   */
  onPostTransition(handler: StateTransitionHandler): void {
    this.postTransitionHandlers.push(handler);
  }

  /**
   * Register an error handler
   */
  onError(handler: StateTransitionHandler): void {
    this.errorHandlers.push(handler);
  }

  /**
   * Transition subscription based on event
   */
  async transition(
    subscription: Subscription,
    event: StateMachineEvent,
    metadata?: Record<string, unknown>,
  ): Promise<StateMachineResult> {
    const targetStatus = this.getTargetStatusForEvent(subscription.status, event);
    
    if (!targetStatus) {
      return this.createFailedResult(
        subscription,
        event,
        {
          type: 'INVALID_TRANSITION',
          message: `Event ${event} cannot be applied to status ${subscription.status}`,
          from: subscription.status,
          to: subscription.status,
        },
      );
    }

    return this.transitionTo(subscription, targetStatus, event, metadata);
  }

  /**
   * Transition subscription to a specific status
   */
  async transitionTo(
    subscription: Subscription,
    targetStatus: SubscriptionStatus,
    event?: StateMachineEvent,
    metadata?: Record<string, unknown>,
  ): Promise<StateMachineResult> {
    const context: StateTransitionContext = {
      subscription,
      event: event ?? StateMachineEvent.ACTIVATE,
      metadata,
      timestamp: new Date(),
    };

    // Execute pre-transition handlers
    await this.executeHandlers(this.preTransitionHandlers, context);

    // Attempt the transition
    const result = attemptTransition(subscription.status, targetStatus);

    if (!result.success) {
      const failedResult = this.createFailedResult(subscription, context.event, result.error);
      
      // Execute error handlers
      await this.executeHandlers(this.errorHandlers, context, failedResult);
      
      return failedResult;
    }

    // Apply the transition to the subscription
    const transitionResult = transitionSubscriptionStatus(subscription, targetStatus);
    
    const successResult: StateMachineResult = {
      success: true,
      subscription: transitionResult.subscription,
      previousStatus: result.previousStatus,
      newStatus: result.newStatus,
      event: context.event,
    };

    // Log if enabled
    if (this.config.enableLogging) {
      this.logTransition(successResult, metadata);
    }

    // Execute post-transition handlers
    await this.executeHandlers(this.postTransitionHandlers, context, successResult);

    return successResult;
  }

  /**
   * Check if a transition is valid
   */
  canTransition(subscription: Subscription, targetStatus: SubscriptionStatus): boolean {
    return isValidTransition(subscription.status, targetStatus);
  }

  /**
   * Check if an event can be applied
   */
  canApplyEvent(subscription: Subscription, event: StateMachineEvent): boolean {
    const targetStatus = this.getTargetStatusForEvent(subscription.status, event);
    return targetStatus !== null;
  }

  /**
   * Get valid target statuses for a subscription
   */
  getValidTransitions(subscription: Subscription): readonly SubscriptionStatus[] {
    return getValidTargetStatuses(subscription.status);
  }

  /**
   * Get the event that would cause a specific transition
   */
  getTransitionEvent(from: SubscriptionStatus, to: SubscriptionStatus): StateMachineEvent | null {
    return getTransitionEvent(from, to);
  }

  /**
   * Check if subscription is in a terminal state
   */
  isTerminal(subscription: Subscription): boolean {
    return isTerminalStatus(subscription.status);
  }

  /**
   * Check if subscription can be charged
   */
  canCharge(subscription: Subscription): boolean {
    return canCharge(subscription.status);
  }

  /**
   * Check if subscription provides premium access
   */
  isPremium(subscription: Subscription): boolean {
    return isPremiumStatus(subscription.status);
  }

  /**
   * Get the category of subscription status
   */
  getStatusCategory(subscription: Subscription): string {
    return getStatusCategory(subscription.status);
  }

  // ============================================================================
  // Event-Based Transition Helpers
  // ============================================================================

  /**
   * Activate subscription
   */
  async activate(
    subscription: Subscription,
    metadata?: Record<string, unknown>,
  ): Promise<StateMachineResult> {
    return this.transition(subscription, StateMachineEvent.ACTIVATE, metadata);
  }

  /**
   * Authorize subscription
   */
  async authorize(
    subscription: Subscription,
    metadata?: Record<string, unknown>,
  ): Promise<StateMachineResult> {
    return this.transition(subscription, StateMachineEvent.AUTHORIZE, metadata);
  }

  /**
   * Mark payment as successful
   */
  async paymentSuccess(
    subscription: Subscription,
    metadata?: Record<string, unknown>,
  ): Promise<StateMachineResult> {
    return this.transition(subscription, StateMachineEvent.PAYMENT_SUCCESS, metadata);
  }

  /**
   * Mark payment as failed
   */
  async paymentFailed(
    subscription: Subscription,
    metadata?: Record<string, unknown>,
  ): Promise<StateMachineResult> {
    return this.transition(subscription, StateMachineEvent.PAYMENT_FAIL, metadata);
  }

  /**
   * Start retry
   */
  async startRetry(
    subscription: Subscription,
    metadata?: Record<string, unknown>,
  ): Promise<StateMachineResult> {
    return this.transition(subscription, StateMachineEvent.RETRY, metadata);
  }

  /**
   * Mark retries as exhausted
   */
  async retryExhausted(
    subscription: Subscription,
    metadata?: Record<string, unknown>,
  ): Promise<StateMachineResult> {
    return this.transition(subscription, StateMachineEvent.RETRY_EXHAUSTED, metadata);
  }

  /**
   * Cancel subscription
   */
  async cancel(
    subscription: Subscription,
    metadata?: Record<string, unknown>,
  ): Promise<StateMachineResult> {
    return this.transition(subscription, StateMachineEvent.CANCEL, metadata);
  }

  /**
   * Complete cancellation
   */
  async cancelComplete(
    subscription: Subscription,
    metadata?: Record<string, unknown>,
  ): Promise<StateMachineResult> {
    return this.transition(subscription, StateMachineEvent.CANCEL_COMPLETE, metadata);
  }

  /**
   * Revoke subscription
   */
  async revoke(
    subscription: Subscription,
    metadata?: Record<string, unknown>,
  ): Promise<StateMachineResult> {
    return this.transition(subscription, StateMachineEvent.REVOKE, metadata);
  }

  /**
   * Pause subscription
   */
  async pause(
    subscription: Subscription,
    metadata?: Record<string, unknown>,
  ): Promise<StateMachineResult> {
    return this.transition(subscription, StateMachineEvent.PAUSE, metadata);
  }

  /**
   * Resume subscription
   */
  async resume(
    subscription: Subscription,
    metadata?: Record<string, unknown>,
  ): Promise<StateMachineResult> {
    return this.transition(subscription, StateMachineEvent.RESUME, metadata);
  }

  /**
   * Expire subscription
   */
  async expire(
    subscription: Subscription,
    metadata?: Record<string, unknown>,
  ): Promise<StateMachineResult> {
    return this.transition(subscription, StateMachineEvent.EXPIRE, metadata);
  }

  /**
   * Mark setup as failed
   */
  async setupFailed(
    subscription: Subscription,
    metadata?: Record<string, unknown>,
  ): Promise<StateMachineResult> {
    return this.transition(subscription, StateMachineEvent.SETUP_FAIL, metadata);
  }

  /**
   * Complete subscription (all cycles done)
   */
  async complete(
    subscription: Subscription,
    metadata?: Record<string, unknown>,
  ): Promise<StateMachineResult> {
    return this.transition(subscription, StateMachineEvent.COMPLETE, metadata);
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  /**
   * Get target status for an event based on current status
   */
  private getTargetStatusForEvent(
    currentStatus: SubscriptionStatus,
    event: StateMachineEvent,
  ): SubscriptionStatus | null {
    const eventMap = this.getEventToStatusMap();
    const mapping = eventMap[event];
    
    if (!mapping) {
      return null;
    }

    if (mapping.from.includes(currentStatus)) {
      return mapping.to;
    }

    return null;
  }

  /**
   * Get event to status mapping
   */
  private getEventToStatusMap(): Record<StateMachineEvent, {
    readonly from: readonly SubscriptionStatus[];
    readonly to: SubscriptionStatus;
  }> {
    return {
      [StateMachineEvent.CREATE]: {
        from: [SubscriptionStatus.FAILED],
        to: SubscriptionStatus.CREATED,
      },
      [StateMachineEvent.AUTHORIZE]: {
        from: [SubscriptionStatus.CREATED, SubscriptionStatus.PENDING_AUTH],
        to: SubscriptionStatus.AUTHENTICATED,
      },
      [StateMachineEvent.ACTIVATE]: {
        from: [
          SubscriptionStatus.CREATED,
          SubscriptionStatus.PENDING_AUTH,
          SubscriptionStatus.ACTIVATION_IN_PROGRESS,
          SubscriptionStatus.AUTHENTICATED,
          SubscriptionStatus.EXPIRED,
          SubscriptionStatus.RETRYING,
        ],
        to: SubscriptionStatus.ACTIVE,
      },
      [StateMachineEvent.SETUP_FAIL]: {
        from: [SubscriptionStatus.CREATED, SubscriptionStatus.PENDING_AUTH, SubscriptionStatus.ACTIVATION_IN_PROGRESS],
        to: SubscriptionStatus.FAILED,
      },
      [StateMachineEvent.PAUSE]: {
        from: [SubscriptionStatus.ACTIVE],
        to: SubscriptionStatus.PAUSED,
      },
      [StateMachineEvent.RESUME]: {
        from: [SubscriptionStatus.PAUSED],
        to: SubscriptionStatus.ACTIVE,
      },
      [StateMachineEvent.CANCEL]: {
        from: [
          SubscriptionStatus.CREATED,
          SubscriptionStatus.PENDING_AUTH,
          SubscriptionStatus.ACTIVATION_IN_PROGRESS,
          SubscriptionStatus.AUTHENTICATED,
          SubscriptionStatus.ACTIVE,
          SubscriptionStatus.PAUSED,
        ],
        to: SubscriptionStatus.CANCEL_IN_PROGRESS,
      },
      [StateMachineEvent.CANCEL_COMPLETE]: {
        from: [SubscriptionStatus.CANCEL_IN_PROGRESS],
        to: SubscriptionStatus.CANCELLED,
      },
      [StateMachineEvent.REVOKE]: {
        from: [SubscriptionStatus.ACTIVE],
        to: SubscriptionStatus.REVOKED,
      },
      [StateMachineEvent.COMPLETE]: {
        from: [SubscriptionStatus.ACTIVE],
        to: SubscriptionStatus.COMPLETED,
      },
      [StateMachineEvent.PAYMENT_SUCCESS]: {
        from: [SubscriptionStatus.RETRYING],
        to: SubscriptionStatus.ACTIVE,
      },
      [StateMachineEvent.PAYMENT_FAIL]: {
        from: [SubscriptionStatus.ACTIVE],
        to: SubscriptionStatus.RETRYING,
      },
      [StateMachineEvent.RETRY]: {
        from: [SubscriptionStatus.ACTIVE, SubscriptionStatus.RETRYING],
        to: SubscriptionStatus.RETRYING,
      },
      [StateMachineEvent.RETRY_EXHAUSTED]: {
        from: [SubscriptionStatus.RETRYING],
        to: SubscriptionStatus.EXPIRED,
      },
      [StateMachineEvent.EXPIRE]: {
        from: [SubscriptionStatus.ACTIVE, SubscriptionStatus.RETRYING],
        to: SubscriptionStatus.EXPIRED,
      },
    };
  }

  /**
   * Create a failed result
   */
  private createFailedResult(
    subscription: Subscription,
    event: StateMachineEvent,
    error?: StateTransitionError,
  ): StateMachineResult {
    return {
      success: false,
      subscription,
      previousStatus: subscription.status,
      newStatus: subscription.status,
      event,
      error,
    };
  }

  /**
   * Execute handlers
   */
  private async executeHandlers(
    handlers: readonly StateTransitionHandler[],
    context: StateTransitionContext,
    result?: StateMachineResult,
  ): Promise<void> {
    for (const handler of handlers) {
      try {
        if (result) {
          await handler(context, result);
        } else {
          // Create a pending result for pre-transition handlers
          const pendingResult: StateMachineResult = {
            success: false,
            subscription: context.subscription,
            previousStatus: context.subscription.status,
            newStatus: context.subscription.status,
            event: context.event,
          };
          await handler(context, pendingResult);
        }
      } catch (error) {
        this.logger.error(
          `Handler error during transition: ${error instanceof Error ? error.message : 'Unknown error'}`,
          error instanceof Error ? error.stack : undefined,
        );
      }
    }
  }

  /**
   * Log a transition
   */
  private logTransition(
    result: StateMachineResult,
    metadata?: Record<string, unknown>,
  ): void {
    this.logger.log({
      message: `Subscription transition: ${result.previousStatus} → ${result.newStatus}`,
      subscriptionId: result.subscription.id,
      event: result.event,
      previousStatus: result.previousStatus,
      newStatus: result.newStatus,
      metadata,
      timestamp: new Date().toISOString(),
    });
  }
}
