import { MigrationState } from '../interfaces/migration.interfaces';

/**
 * Migration State Machine
 * Manages state transitions and validates allowed transitions
 */
export class MigrationStateMachine {
  private currentState: MigrationState;
  private stateHistory: MigrationState[] = [];

  constructor(initialState: MigrationState = MigrationState.PENDING) {
    this.currentState = initialState;
    this.stateHistory.push(initialState);
  }

  /**
   * Get current state
   */
  getCurrentState(): MigrationState {
    return this.currentState;
  }

  /**
   * Get state history
   */
  getStateHistory(): MigrationState[] {
    return [...this.stateHistory];
  }

  /**
   * Transition to a new state
   * Returns true if transition is valid, false otherwise
   */
  transitionTo(newState: MigrationState): boolean {
    if (!this.isValidTransition(this.currentState, newState)) {
      return false;
    }

    this.currentState = newState;
    this.stateHistory.push(newState);
    return true;
  }

  /**
   * Force transition (bypass validation)
   */
  forceTransition(newState: MigrationState): void {
    this.currentState = newState;
    this.stateHistory.push(newState);
  }

  /**
   * Check if current state is a final state
   */
  isFinalState(): boolean {
    return [
      MigrationState.COMPLETED,
      MigrationState.FAILED,
      MigrationState.PARTIAL_DATA_DETECTED,
      MigrationState.TIMEOUT,
      MigrationState.MAX_RETRIES_EXCEEDED,
    ].includes(this.currentState);
  }

  /**
   * Check if current state is a success state
   */
  isSuccessState(): boolean {
    return this.currentState === MigrationState.COMPLETED;
  }

  /**
   * Check if current state is an error state
   */
  isErrorState(): boolean {
    return [
      MigrationState.FAILED,
      MigrationState.PARTIAL_DATA_DETECTED,
      MigrationState.TIMEOUT,
      MigrationState.MAX_RETRIES_EXCEEDED,
    ].includes(this.currentState);
  }

  /**
   * Get next logical states
   */
  getNextValidStates(): MigrationState[] {
    return this.getAllowedTransitions(this.currentState);
  }

  /**
   * Validate if transition is allowed
   */
  private isValidTransition(from: MigrationState, to: MigrationState): boolean {
    const allowedTransitions = this.getAllowedTransitions(from);
    return allowedTransitions.includes(to);
  }

  /**
   * Get allowed transitions from a state
   */
  private getAllowedTransitions(state: MigrationState): MigrationState[] {
    const transitionMap: Record<MigrationState, MigrationState[]> = {
      // Initial state
      [MigrationState.PENDING]: [
        MigrationState.VALIDATING_SESSION,
        MigrationState.FAILED,
      ],

      // Validation states
      [MigrationState.VALIDATING_SESSION]: [
        MigrationState.FETCHING_SOURCE_DATA,
        MigrationState.FAILED,
      ],

      [MigrationState.FETCHING_SOURCE_DATA]: [
        MigrationState.CHECKING_PARTIAL_DATA,
        MigrationState.FAILED,
      ],

      [MigrationState.CHECKING_PARTIAL_DATA]: [
        MigrationState.CALCULATING_HASH,
        MigrationState.PARTIAL_DATA_DETECTED,
        MigrationState.FAILED,
      ],

      [MigrationState.CALCULATING_HASH]: [
        MigrationState.MIGRATING_METADATA,
        MigrationState.FAILED,
      ],

      // Level 1 migration states
      [MigrationState.MIGRATING_METADATA]: [
        MigrationState.MIGRATING_ACCOUNTS,
        MigrationState.FAILED,
      ],

      [MigrationState.MIGRATING_ACCOUNTS]: [
        MigrationState.MIGRATING_PUSH_TOKENS,
        MigrationState.FAILED,
      ],

      [MigrationState.MIGRATING_PUSH_TOKENS]: [
        MigrationState.MIGRATING_DEVICE_SESSIONS,
        MigrationState.FAILED,
      ],

      // Level 2 migration states
      [MigrationState.MIGRATING_DEVICE_SESSIONS]: [
        MigrationState.MIGRATING_USER_IMAGES,
        MigrationState.FAILED,
      ],

      [MigrationState.MIGRATING_USER_IMAGES]: [
        MigrationState.MIGRATING_PLAYSTORE_RATINGS,
        MigrationState.FAILED,
      ],

      [MigrationState.MIGRATING_PLAYSTORE_RATINGS]: [
        MigrationState.MIGRATING_SUBSCRIPTIONS,
        MigrationState.FAILED,
      ],

      // Level 3 migration states
      [MigrationState.MIGRATING_SUBSCRIPTIONS]: [
        MigrationState.MIGRATING_ORDERS,
        MigrationState.FAILED,
      ],

      [MigrationState.MIGRATING_ORDERS]: [
        MigrationState.MIGRATING_ABANDONED_CHECKOUTS,
        MigrationState.FAILED,
      ],

      [MigrationState.MIGRATING_ABANDONED_CHECKOUTS]: [
        MigrationState.MIGRATING_SUBSCRIPTION_LOGS,
        MigrationState.FAILED,
      ],

      // Level 4 migration states
      [MigrationState.MIGRATING_SUBSCRIPTION_LOGS]: [
        MigrationState.MIGRATING_PHONEPE_ORDERS,
        MigrationState.FAILED,
      ],

      [MigrationState.MIGRATING_PHONEPE_ORDERS]: [
        MigrationState.MIGRATING_PHONEPE_SUBSCRIPTIONS,
        MigrationState.FAILED,
      ],

      [MigrationState.MIGRATING_PHONEPE_SUBSCRIPTIONS]: [
        MigrationState.VERIFYING_HASH,
        MigrationState.FAILED,
      ],

      // Verification
      [MigrationState.VERIFYING_HASH]: [
        MigrationState.COMPLETED,
        MigrationState.FAILED,
      ],

      // Final states (no outgoing transitions)
      [MigrationState.COMPLETED]: [],
      [MigrationState.FAILED]: [],
      [MigrationState.PARTIAL_DATA_DETECTED]: [],
      [MigrationState.TIMEOUT]: [],
      [MigrationState.MAX_RETRIES_EXCEEDED]: [],
    };

    return transitionMap[state] || [];
  }
}
