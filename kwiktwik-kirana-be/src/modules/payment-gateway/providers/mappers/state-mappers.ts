/**
 * Provider State Mappers
 * 
 * Maps provider-specific subscription and order states to unified states.
 * Based on official Razorpay and PhonePe documentation.
 */

import type { SubscriptionStatus } from '../../types/subscription-status.enum';
import type { OrderStatus } from '../../types/order-status.enum';
import type { PaymentProvider } from '../../types/provider.enum';

// ============================================================================
// Provider State Mapper Interface
// ============================================================================

/**
 * Provider state mapper interface
 */
export interface ProviderStateMapper<TProviderState extends string> {
  /**
   * Map provider state to unified status
   */
  toUnified(providerState: TProviderState): SubscriptionStatus;

  /**
   * Map unified status to provider state
   */
  toProvider(unified: SubscriptionStatus): TProviderState | null;

  /**
   * Check if provider state is terminal
   */
  isTerminal(providerState: TProviderState): boolean;

  /**
   * Check if provider state requires action
   */
  requiresAction(providerState: TProviderState): boolean;

  /**
   * Check if subscription can be charged in this state
   */
  canCharge(providerState: TProviderState): boolean;
}

// ============================================================================
// Razorpay State Mapper
// ============================================================================

/**
 * Razorpay subscription states (from API documentation)
 */
export const RazorpaySubscriptionState = {
  CREATED: 'created',
  AUTHENTICATED: 'authenticated',
  ACTIVE: 'active',
  PENDING: 'pending',
  HALTED: 'halted',
  PAUSED: 'paused',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
  EXPIRED: 'expired',
} as const;

export type RazorpaySubscriptionState = typeof RazorpaySubscriptionState[keyof typeof RazorpaySubscriptionState];

/**
 * Razorpay order states (from API documentation)
 */
export const RazorpayOrderState = {
  CREATED: 'created',
  ATTEMPTED: 'attempted',
  PAID: 'paid',
} as const;

export type RazorpayOrderState = typeof RazorpayOrderState[keyof typeof RazorpayOrderState];

/**
 * Razorpay payment states (from API documentation)
 */
export const RazorpayPaymentState = {
  CREATED: 'created',
  AUTHORIZED: 'authorized',
  CAPTURED: 'captured',
  REFUNDED: 'refunded',
  FAILED: 'failed',
} as const;

export type RazorpayPaymentState = typeof RazorpayPaymentState[keyof typeof RazorpayPaymentState];

/**
 * Razorpay state mapper implementation
 */
export const RazorpayStateMapper: ProviderStateMapper<RazorpaySubscriptionState> = {
  toUnified(razorpayState: RazorpaySubscriptionState): SubscriptionStatus {
    const mapping: Record<RazorpaySubscriptionState, SubscriptionStatus> = {
      [RazorpaySubscriptionState.CREATED]: 'CREATED',
      [RazorpaySubscriptionState.AUTHENTICATED]: 'AUTHENTICATED',
      [RazorpaySubscriptionState.ACTIVE]: 'ACTIVE',
      [RazorpaySubscriptionState.PENDING]: 'PENDING_AUTH',
      [RazorpaySubscriptionState.HALTED]: 'RETRYING',
      [RazorpaySubscriptionState.PAUSED]: 'PAUSED',
      [RazorpaySubscriptionState.CANCELLED]: 'CANCELLED',
      [RazorpaySubscriptionState.COMPLETED]: 'COMPLETED',
      [RazorpaySubscriptionState.EXPIRED]: 'EXPIRED',
    };
    return mapping[razorpayState] ?? 'FAILED';
  },

  toProvider(unified: SubscriptionStatus): RazorpaySubscriptionState | null {
    const mapping: Partial<Record<SubscriptionStatus, RazorpaySubscriptionState>> = {
      CREATED: RazorpaySubscriptionState.CREATED,
      AUTHENTICATED: RazorpaySubscriptionState.AUTHENTICATED,
      ACTIVE: RazorpaySubscriptionState.ACTIVE,
      PENDING_AUTH: RazorpaySubscriptionState.PENDING,
      RETRYING: RazorpaySubscriptionState.HALTED,
      PAUSED: RazorpaySubscriptionState.PAUSED,
      CANCELLED: RazorpaySubscriptionState.CANCELLED,
      COMPLETED: RazorpaySubscriptionState.COMPLETED,
      EXPIRED: RazorpaySubscriptionState.EXPIRED,
    };
    return mapping[unified] ?? null;
  },

  isTerminal(razorpayState: RazorpaySubscriptionState): boolean {
    const terminalStates: RazorpaySubscriptionState[] = [
      RazorpaySubscriptionState.CANCELLED,
      RazorpaySubscriptionState.COMPLETED,
      RazorpaySubscriptionState.EXPIRED,
    ];
    return terminalStates.includes(razorpayState);
  },

  requiresAction(razorpayState: RazorpaySubscriptionState): boolean {
    const actionStates: RazorpaySubscriptionState[] = [
      RazorpaySubscriptionState.CREATED,
      RazorpaySubscriptionState.AUTHENTICATED,
      RazorpaySubscriptionState.PENDING,
    ];
    return actionStates.includes(razorpayState);
  },

  canCharge(razorpayState: RazorpaySubscriptionState): boolean {
    return razorpayState === RazorpaySubscriptionState.ACTIVE;
  },
};

/**
 * Map Razorpay order state to unified order status
 */
export function mapRazorpayOrderState(state: RazorpayOrderState): OrderStatus {
  const mapping: Record<RazorpayOrderState, OrderStatus> = {
    [RazorpayOrderState.CREATED]: 'CREATED',
    [RazorpayOrderState.ATTEMPTED]: 'PENDING',
    [RazorpayOrderState.PAID]: 'CAPTURED',
  };
  return mapping[state] ?? 'FAILED';
}

/**
 * Map Razorpay payment state to unified order status
 */
export function mapRazorpayPaymentState(state: RazorpayPaymentState): OrderStatus {
  const mapping: Record<RazorpayPaymentState, OrderStatus> = {
    [RazorpayPaymentState.CREATED]: 'CREATED',
    [RazorpayPaymentState.AUTHORIZED]: 'AUTHORIZED',
    [RazorpayPaymentState.CAPTURED]: 'CAPTURED',
    [RazorpayPaymentState.REFUNDED]: 'REFUNDED',
    [RazorpayPaymentState.FAILED]: 'FAILED',
  };
  return mapping[state] ?? 'FAILED';
}

// ============================================================================
// PhonePe State Mapper
// ============================================================================

/**
 * PhonePe subscription states (from API documentation)
 */
export const PhonePeSubscriptionState = {
  CREATED: 'CREATED',
  ACTIVATION_IN_PROGRESS: 'ACTIVATION_IN_PROGRESS',
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  CANCEL_IN_PROGRESS: 'CANCEL_IN_PROGRESS',
  CANCELLED: 'CANCELLED',
  REVOKED: 'REVOKED',
  EXPIRED: 'EXPIRED',
  FAILED: 'FAILED',
  // Additional states from documentation
  REVOKE_IN_PROGRESS: 'REVOKE_IN_PROGRESS',
  PAUSE_IN_PROGRESS: 'PAUSE_IN_PROGRESS',
  UNPAUSE_IN_PROGRESS: 'UNPAUSE_IN_PROGRESS',
} as const;

export type PhonePeSubscriptionState = typeof PhonePeSubscriptionState[keyof typeof PhonePeSubscriptionState];

/**
 * PhonePe order/transaction states (from API documentation)
 */
export const PhonePeOrderState = {
  PENDING: 'PENDING',
  NOTIFICATION_IN_PROGRESS: 'NOTIFICATION_IN_PROGRESS',
  NOTIFIED: 'NOTIFIED',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
} as const;

export type PhonePeOrderState = typeof PhonePeOrderState[keyof typeof PhonePeOrderState];

/**
 * PhonePe payment transaction states
 */
export const PhonePeTransactionState = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
} as const;

export type PhonePeTransactionState = typeof PhonePeTransactionState[keyof typeof PhonePeTransactionState];

/**
 * PhonePe state mapper implementation
 */
export const PhonePeStateMapper: ProviderStateMapper<PhonePeSubscriptionState> = {
  toUnified(phonePeState: PhonePeSubscriptionState): SubscriptionStatus {
    const mapping: Record<PhonePeSubscriptionState, SubscriptionStatus> = {
      [PhonePeSubscriptionState.CREATED]: 'CREATED',
      [PhonePeSubscriptionState.ACTIVATION_IN_PROGRESS]: 'ACTIVATION_IN_PROGRESS',
      [PhonePeSubscriptionState.ACTIVE]: 'ACTIVE',
      [PhonePeSubscriptionState.PAUSED]: 'PAUSED',
      [PhonePeSubscriptionState.CANCEL_IN_PROGRESS]: 'CANCEL_IN_PROGRESS',
      [PhonePeSubscriptionState.CANCELLED]: 'CANCELLED',
      [PhonePeSubscriptionState.REVOKED]: 'REVOKED',
      [PhonePeSubscriptionState.EXPIRED]: 'EXPIRED',
      [PhonePeSubscriptionState.FAILED]: 'FAILED',
      [PhonePeSubscriptionState.REVOKE_IN_PROGRESS]: 'CANCEL_IN_PROGRESS',
      [PhonePeSubscriptionState.PAUSE_IN_PROGRESS]: 'ACTIVE',
      [PhonePeSubscriptionState.UNPAUSE_IN_PROGRESS]: 'PAUSED',
    };
    return mapping[phonePeState] ?? 'FAILED';
  },

  toProvider(unified: SubscriptionStatus): PhonePeSubscriptionState | null {
    const mapping: Partial<Record<SubscriptionStatus, PhonePeSubscriptionState>> = {
      CREATED: PhonePeSubscriptionState.CREATED,
      ACTIVATION_IN_PROGRESS: PhonePeSubscriptionState.ACTIVATION_IN_PROGRESS,
      ACTIVE: PhonePeSubscriptionState.ACTIVE,
      PAUSED: PhonePeSubscriptionState.PAUSED,
      CANCEL_IN_PROGRESS: PhonePeSubscriptionState.CANCEL_IN_PROGRESS,
      CANCELLED: PhonePeSubscriptionState.CANCELLED,
      REVOKED: PhonePeSubscriptionState.REVOKED,
      EXPIRED: PhonePeSubscriptionState.EXPIRED,
      FAILED: PhonePeSubscriptionState.FAILED,
    };
    return mapping[unified] ?? null;
  },

  isTerminal(phonePeState: PhonePeSubscriptionState): boolean {
    const terminalStates: PhonePeSubscriptionState[] = [
      PhonePeSubscriptionState.CANCELLED,
      PhonePeSubscriptionState.REVOKED,
      PhonePeSubscriptionState.EXPIRED,
      PhonePeSubscriptionState.FAILED,
    ];
    return terminalStates.includes(phonePeState);
  },

  requiresAction(phonePeState: PhonePeSubscriptionState): boolean {
    const actionStates: PhonePeSubscriptionState[] = [
      PhonePeSubscriptionState.CREATED,
      PhonePeSubscriptionState.ACTIVATION_IN_PROGRESS,
    ];
    return actionStates.includes(phonePeState);
  },

  canCharge(phonePeState: PhonePeSubscriptionState): boolean {
    return phonePeState === PhonePeSubscriptionState.ACTIVE;
  },
};

/**
 * Map PhonePe order state to unified order status
 */
export function mapPhonePeOrderState(state: PhonePeOrderState): OrderStatus {
  const mapping: Record<PhonePeOrderState, OrderStatus> = {
    [PhonePeOrderState.PENDING]: 'CREATED',
    [PhonePeOrderState.NOTIFICATION_IN_PROGRESS]: 'PENDING',
    [PhonePeOrderState.NOTIFIED]: 'PENDING',
    [PhonePeOrderState.COMPLETED]: 'CAPTURED',
    [PhonePeOrderState.FAILED]: 'FAILED',
  };
  return mapping[state] ?? 'FAILED';
}

/**
 * Map PhonePe transaction state to unified order status
 */
export function mapPhonePeTransactionState(state: PhonePeTransactionState): OrderStatus {
  const mapping: Record<PhonePeTransactionState, OrderStatus> = {
    [PhonePeTransactionState.PENDING]: 'PENDING',
    [PhonePeTransactionState.COMPLETED]: 'CAPTURED',
    [PhonePeTransactionState.FAILED]: 'FAILED',
  };
  return mapping[state] ?? 'FAILED';
}

// ============================================================================
// State Mapper Registry
// ============================================================================

/**
 * State mapper registry for managing mappers by provider
 */
export class StateMapperRegistry {
  private readonly mappers: Map<PaymentProvider, ProviderStateMapper<string>> = new Map();

  constructor() {
    // Register default mappers
    this.mappers.set('RAZORPAY', RazorpayStateMapper as unknown as ProviderStateMapper<string>);
    this.mappers.set('PHONEPE', PhonePeStateMapper as unknown as ProviderStateMapper<string>);
  }

  /**
   * Get mapper for provider
   */
  getMapper(provider: PaymentProvider): ProviderStateMapper<string> {
    const mapper = this.mappers.get(provider);
    if (!mapper) {
      throw new Error(`No state mapper registered for provider: ${provider}`);
    }
    return mapper;
  }

  /**
   * Map provider state to unified status
   */
  toUnified(provider: PaymentProvider, providerState: string): SubscriptionStatus {
    return this.getMapper(provider).toUnified(providerState);
  }

  /**
   * Map unified status to provider state
   */
  toProvider(provider: PaymentProvider, unified: SubscriptionStatus): string | null {
    return this.getMapper(provider).toProvider(unified);
  }

  /**
   * Check if provider state is terminal
   */
  isTerminal(provider: PaymentProvider, providerState: string): boolean {
    return this.getMapper(provider).isTerminal(providerState);
  }

  /**
   * Check if provider state requires action
   */
  requiresAction(provider: PaymentProvider, providerState: string): boolean {
    return this.getMapper(provider).requiresAction(providerState);
  }

  /**
   * Check if subscription can be charged
   */
  canCharge(provider: PaymentProvider, providerState: string): boolean {
    return this.getMapper(provider).canCharge(providerState);
  }
}

/**
 * Default state mapper registry instance
 */
export const stateMapperRegistry = new StateMapperRegistry();
