/**
 * Subscription Status Types and State Machine
 * 
 * Defines all possible subscription states and valid transitions.
 * The state machine is designed to handle both provider-managed and user-managed subscriptions.
 */

/**
 * Subscription status values
 * 
 * State Categories:
 * - Initial: CREATED, PENDING_AUTH, ACTIVATION_IN_PROGRESS
 * - Active: AUTHENTICATED, ACTIVE, PAUSED, RETRYING
 * - Transition: CANCEL_IN_PROGRESS
 * - Terminal: CANCELLED, EXPIRED, FAILED, REVOKED, COMPLETED
 */
export const SubscriptionStatus = {
  // === Initial States ===
  /** Subscription created but not yet authorized */
  CREATED: 'CREATED',
  /** Waiting for user authorization (e.g., UPI mandate approval) */
  PENDING_AUTH: 'PENDING_AUTH',
  /** Activation in progress (e.g., mandate setup) */
  ACTIVATION_IN_PROGRESS: 'ACTIVATION_IN_PROGRESS',

  // === Active States ===
  /** Authorization completed, waiting for first charge */
  AUTHENTICATED: 'AUTHENTICATED',
  /** Subscription is active and billing */
  ACTIVE: 'ACTIVE',
  /** Subscription is paused */
  PAUSED: 'PAUSED',
  /** Payment failed, retrying (user-managed subscriptions) */
  RETRYING: 'RETRYING',

  // === Transition States ===
  /** Cancellation in progress */
  CANCEL_IN_PROGRESS: 'CANCEL_IN_PROGRESS',

  // === Terminal States ===
  /** Subscription cancelled */
  CANCELLED: 'CANCELLED',
  /** Subscription expired (e.g., max cycles reached, payment failure timeout) */
  EXPIRED: 'EXPIRED',
  /** Subscription setup failed */
  FAILED: 'FAILED',
  /** Subscription revoked by user */
  REVOKED: 'REVOKED',
  /** Subscription completed all cycles */
  COMPLETED: 'COMPLETED',
} as const;

export type SubscriptionStatus = typeof SubscriptionStatus[keyof typeof SubscriptionStatus];

/**
 * All subscription statuses as a readonly array
 */
export const ALL_SUBSCRIPTION_STATUSES: readonly SubscriptionStatus[] = [
  SubscriptionStatus.CREATED,
  SubscriptionStatus.PENDING_AUTH,
  SubscriptionStatus.ACTIVATION_IN_PROGRESS,
  SubscriptionStatus.AUTHENTICATED,
  SubscriptionStatus.ACTIVE,
  SubscriptionStatus.PAUSED,
  SubscriptionStatus.RETRYING,
  SubscriptionStatus.CANCEL_IN_PROGRESS,
  SubscriptionStatus.CANCELLED,
  SubscriptionStatus.EXPIRED,
  SubscriptionStatus.FAILED,
  SubscriptionStatus.REVOKED,
  SubscriptionStatus.COMPLETED,
] as const;

/**
 * Check if a value is a valid subscription status
 */
export function isSubscriptionStatus(value: string): value is SubscriptionStatus {
  return ALL_SUBSCRIPTION_STATUSES.includes(value as SubscriptionStatus);
}

/**
 * Subscription status categories
 */
export const StatusCategory = {
  INITIAL: 'INITIAL',
  ACTIVE: 'ACTIVE',
  TRANSITION: 'TRANSITION',
  TERMINAL: 'TERMINAL',
} as const;

export type StatusCategory = typeof StatusCategory[keyof typeof StatusCategory];

/**
 * Get the category of a subscription status
 */
export function getStatusCategory(status: SubscriptionStatus): StatusCategory {
  switch (status) {
    case SubscriptionStatus.CREATED:
    case SubscriptionStatus.PENDING_AUTH:
    case SubscriptionStatus.ACTIVATION_IN_PROGRESS:
      return StatusCategory.INITIAL;

    case SubscriptionStatus.AUTHENTICATED:
    case SubscriptionStatus.ACTIVE:
    case SubscriptionStatus.PAUSED:
    case SubscriptionStatus.RETRYING:
      return StatusCategory.ACTIVE;

    case SubscriptionStatus.CANCEL_IN_PROGRESS:
      return StatusCategory.TRANSITION;

    case SubscriptionStatus.CANCELLED:
    case SubscriptionStatus.EXPIRED:
    case SubscriptionStatus.FAILED:
    case SubscriptionStatus.REVOKED:
    case SubscriptionStatus.COMPLETED:
      return StatusCategory.TERMINAL;

    default:
      // Exhaustive check
      const _exhaustive: never = status;
      return _exhaustive;
  }
}

/**
 * Check if status is terminal (no further transitions possible)
 */
export function isTerminalStatus(status: SubscriptionStatus): boolean {
  return getStatusCategory(status) === StatusCategory.TERMINAL;
}

/**
 * Check if subscription is in a premium/active state
 */
export function isPremiumStatus(status: SubscriptionStatus): boolean {
  return (
    status === SubscriptionStatus.ACTIVE ||
    status === SubscriptionStatus.PAUSED ||
    status === SubscriptionStatus.AUTHENTICATED ||
    status === SubscriptionStatus.RETRYING
  );
}

/**
 * Check if subscription can be charged
 */
export function canCharge(status: SubscriptionStatus): boolean {
  return status === SubscriptionStatus.ACTIVE || status === SubscriptionStatus.RETRYING;
}

/**
 * Valid state transitions map
 * 
 * This defines all valid transitions in the state machine.
 * Each key maps to an array of valid target states.
 */
export const ValidStateTransitions: Readonly<Record<SubscriptionStatus, readonly SubscriptionStatus[]>> = {
  // Initial states
  [SubscriptionStatus.CREATED]: [
    SubscriptionStatus.PENDING_AUTH,
    SubscriptionStatus.AUTHENTICATED,
    SubscriptionStatus.ACTIVATION_IN_PROGRESS,
    SubscriptionStatus.FAILED,
    SubscriptionStatus.CANCELLED,
  ] as const,

  [SubscriptionStatus.PENDING_AUTH]: [
    SubscriptionStatus.AUTHENTICATED,
    SubscriptionStatus.ACTIVE,
    SubscriptionStatus.FAILED,
    SubscriptionStatus.CANCELLED,
  ] as const,

  [SubscriptionStatus.ACTIVATION_IN_PROGRESS]: [
    SubscriptionStatus.ACTIVE,
    SubscriptionStatus.AUTHENTICATED,
    SubscriptionStatus.FAILED,
    SubscriptionStatus.CANCELLED,
  ] as const,

  // Active states
  [SubscriptionStatus.AUTHENTICATED]: [
    SubscriptionStatus.ACTIVE,
    SubscriptionStatus.FAILED,
    SubscriptionStatus.CANCELLED,
  ] as const,

  [SubscriptionStatus.ACTIVE]: [
    SubscriptionStatus.PAUSED,
    SubscriptionStatus.CANCEL_IN_PROGRESS,
    SubscriptionStatus.CANCELLED,
    SubscriptionStatus.EXPIRED,
    SubscriptionStatus.REVOKED,
    SubscriptionStatus.COMPLETED,
    SubscriptionStatus.RETRYING, // Payment failed, retrying
  ] as const,

  [SubscriptionStatus.PAUSED]: [
    SubscriptionStatus.ACTIVE,
    SubscriptionStatus.CANCEL_IN_PROGRESS,
    SubscriptionStatus.CANCELLED,
  ] as const,

  [SubscriptionStatus.RETRYING]: [
    SubscriptionStatus.ACTIVE, // Payment succeeded
    SubscriptionStatus.EXPIRED, // Max retries exceeded
    SubscriptionStatus.CANCELLED, // User cancelled during retry
  ] as const,

  // Transition states
  [SubscriptionStatus.CANCEL_IN_PROGRESS]: [
    SubscriptionStatus.CANCELLED,
    SubscriptionStatus.ACTIVE, // Cancellation failed
  ] as const,

  // Terminal states - no transitions allowed
  [SubscriptionStatus.CANCELLED]: [] as const,
  [SubscriptionStatus.EXPIRED]: [
    SubscriptionStatus.ACTIVE, // Can reactivate after payment (user-managed)
    SubscriptionStatus.ACTIVATION_IN_PROGRESS, // Can retry setup
  ] as const,
  [SubscriptionStatus.FAILED]: [
    SubscriptionStatus.CREATED, // Can retry from beginning
    SubscriptionStatus.ACTIVATION_IN_PROGRESS, // Can retry activation
  ] as const,
  [SubscriptionStatus.REVOKED]: [] as const,
  [SubscriptionStatus.COMPLETED]: [] as const,
} as const;

/**
 * Check if a state transition is valid
 */
export function isValidTransition(from: SubscriptionStatus, to: SubscriptionStatus): boolean {
  const validTargets = ValidStateTransitions[from];
  return validTargets.includes(to);
}

/**
 * Get all valid target states from a given status
 */
export function getValidTargetStatuses(status: SubscriptionStatus): readonly SubscriptionStatus[] {
  return ValidStateTransitions[status];
}

/**
 * State transition result
 */
export interface StateTransitionResult {
  readonly success: boolean;
  readonly previousStatus: SubscriptionStatus;
  readonly newStatus: SubscriptionStatus;
  readonly error?: StateTransitionError;
}

/**
 * State transition error types
 */
export const StateTransitionErrorType = {
  INVALID_TRANSITION: 'INVALID_TRANSITION',
  TERMINAL_STATE: 'TERMINAL_STATE',
  ALREADY_IN_STATE: 'ALREADY_IN_STATE',
} as const;

export type StateTransitionErrorType = typeof StateTransitionErrorType[keyof typeof StateTransitionErrorType];

/**
 * State transition error
 */
export interface StateTransitionError {
  readonly type: StateTransitionErrorType;
  readonly message: string;
  readonly from: SubscriptionStatus;
  readonly to: SubscriptionStatus;
}

/**
 * Attempt a state transition
 */
export function attemptTransition(
  currentStatus: SubscriptionStatus,
  targetStatus: SubscriptionStatus,
): StateTransitionResult {
  // Already in target state
  if (currentStatus === targetStatus) {
    return {
      success: true,
      previousStatus: currentStatus,
      newStatus: targetStatus,
    };
  }

  // Check if current state is terminal
  if (isTerminalStatus(currentStatus)) {
    // Special case: EXPIRED and FAILED can have transitions
    if (currentStatus !== SubscriptionStatus.EXPIRED && currentStatus !== SubscriptionStatus.FAILED) {
      return {
        success: false,
        previousStatus: currentStatus,
        newStatus: currentStatus,
        error: {
          type: StateTransitionErrorType.TERMINAL_STATE,
          message: `Cannot transition from terminal state: ${currentStatus}`,
          from: currentStatus,
          to: targetStatus,
        },
      };
    }
  }

  // Check if transition is valid
  if (!isValidTransition(currentStatus, targetStatus)) {
    return {
      success: false,
      previousStatus: currentStatus,
      newStatus: currentStatus,
      error: {
        type: StateTransitionErrorType.INVALID_TRANSITION,
        message: `Invalid transition from ${currentStatus} to ${targetStatus}. Valid targets: ${getValidTargetStatuses(currentStatus).join(', ') || 'none'}`,
        from: currentStatus,
        to: targetStatus,
      },
    };
  }

  return {
    success: true,
    previousStatus: currentStatus,
    newStatus: targetStatus,
  };
}

/**
 * State machine event types that trigger transitions
 */
export const StateMachineEvent = {
  // Setup events
  CREATE: 'CREATE',
  AUTHORIZE: 'AUTHORIZE',
  ACTIVATE: 'ACTIVATE',
  SETUP_FAIL: 'SETUP_FAIL',

  // Lifecycle events
  PAUSE: 'PAUSE',
  RESUME: 'RESUME',
  CANCEL: 'CANCEL',
  CANCEL_COMPLETE: 'CANCEL_COMPLETE',
  REVOKE: 'REVOKE',
  COMPLETE: 'COMPLETE',

  // Payment events
  PAYMENT_SUCCESS: 'PAYMENT_SUCCESS',
  PAYMENT_FAIL: 'PAYMENT_FAIL',
  RETRY: 'RETRY',
  RETRY_EXHAUSTED: 'RETRY_EXHAUSTED',
  EXPIRE: 'EXPIRE',
} as const;

export type StateMachineEvent = typeof StateMachineEvent[keyof typeof StateMachineEvent];

/**
 * Event to status transition map
 * Maps events to their resulting status changes
 */
export const EventTransitionMap: Readonly<Record<StateMachineEvent, {
  readonly from: readonly SubscriptionStatus[];
  readonly to: SubscriptionStatus;
}>> = {
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
      SubscriptionStatus.EXPIRED, // Reactivation
      SubscriptionStatus.RETRYING, // After successful retry payment
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
} as const;

/**
 * Get the event that would cause a specific transition
 */
export function getTransitionEvent(from: SubscriptionStatus, to: SubscriptionStatus): StateMachineEvent | null {
  if (!isValidTransition(from, to)) {
    return null;
  }

  for (const [event, transition] of Object.entries(EventTransitionMap)) {
    if (transition.from.includes(from) && transition.to === to) {
      return event as StateMachineEvent;
    }
  }
  return null;
}
