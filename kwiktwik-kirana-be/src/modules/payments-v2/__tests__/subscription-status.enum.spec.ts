/**
 * Tests for Subscription Status State Machine
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  SubscriptionStatus,
  StateMachineEvent,
  attemptTransition,
  isValidTransition,
  getValidTargetStatuses,
  isTerminalStatus,
  canCharge,
  isPremiumStatus,
  getStatusCategory,
  getTransitionEvent,
} from '../types/subscription-status.enum';

describe('SubscriptionStatus Enum', () => {
  it('should have all expected status values', () => {
    expect(SubscriptionStatus.CREATED).toBe('CREATED');
    expect(SubscriptionStatus.PENDING_AUTH).toBe('PENDING_AUTH');
    expect(SubscriptionStatus.ACTIVATION_IN_PROGRESS).toBe('ACTIVATION_IN_PROGRESS');
    expect(SubscriptionStatus.AUTHENTICATED).toBe('AUTHENTICATED');
    expect(SubscriptionStatus.ACTIVE).toBe('ACTIVE');
    expect(SubscriptionStatus.PAUSED).toBe('PAUSED');
    expect(SubscriptionStatus.RETRYING).toBe('RETRYING');
    expect(SubscriptionStatus.CANCEL_IN_PROGRESS).toBe('CANCEL_IN_PROGRESS');
    expect(SubscriptionStatus.CANCELLED).toBe('CANCELLED');
    expect(SubscriptionStatus.EXPIRED).toBe('EXPIRED');
    expect(SubscriptionStatus.FAILED).toBe('FAILED');
    expect(SubscriptionStatus.REVOKED).toBe('REVOKED');
    expect(SubscriptionStatus.COMPLETED).toBe('COMPLETED');
  });
});

describe('Status Category', () => {
  it('should categorize initial states correctly', () => {
    expect(getStatusCategory(SubscriptionStatus.CREATED)).toBe('INITIAL');
    expect(getStatusCategory(SubscriptionStatus.PENDING_AUTH)).toBe('INITIAL');
    expect(getStatusCategory(SubscriptionStatus.ACTIVATION_IN_PROGRESS)).toBe('INITIAL');
  });

  it('should categorize active states correctly', () => {
    expect(getStatusCategory(SubscriptionStatus.AUTHENTICATED)).toBe('ACTIVE');
    expect(getStatusCategory(SubscriptionStatus.ACTIVE)).toBe('ACTIVE');
    expect(getStatusCategory(SubscriptionStatus.PAUSED)).toBe('ACTIVE');
    expect(getStatusCategory(SubscriptionStatus.RETRYING)).toBe('ACTIVE');
  });

  it('should categorize transition states correctly', () => {
    expect(getStatusCategory(SubscriptionStatus.CANCEL_IN_PROGRESS)).toBe('TRANSITION');
  });

  it('should categorize terminal states correctly', () => {
    expect(getStatusCategory(SubscriptionStatus.CANCELLED)).toBe('TERMINAL');
    expect(getStatusCategory(SubscriptionStatus.EXPIRED)).toBe('TERMINAL');
    expect(getStatusCategory(SubscriptionStatus.FAILED)).toBe('TERMINAL');
    expect(getStatusCategory(SubscriptionStatus.REVOKED)).toBe('TERMINAL');
    expect(getStatusCategory(SubscriptionStatus.COMPLETED)).toBe('TERMINAL');
  });
});

describe('isTerminalStatus', () => {
  it('should return true for terminal states', () => {
    expect(isTerminalStatus(SubscriptionStatus.CANCELLED)).toBe(true);
    expect(isTerminalStatus(SubscriptionStatus.REVOKED)).toBe(true);
    expect(isTerminalStatus(SubscriptionStatus.COMPLETED)).toBe(true);
  });

  it('should return false for non-terminal states', () => {
    expect(isTerminalStatus(SubscriptionStatus.CREATED)).toBe(false);
    expect(isTerminalStatus(SubscriptionStatus.ACTIVE)).toBe(false);
    expect(isTerminalStatus(SubscriptionStatus.RETRYING)).toBe(false);
  });

  it('should return false for EXPIRED and FAILED (they can transition)', () => {
    expect(isTerminalStatus(SubscriptionStatus.EXPIRED)).toBe(true);
    expect(isTerminalStatus(SubscriptionStatus.FAILED)).toBe(true);
  });
});

describe('canCharge', () => {
  it('should return true for chargeable states', () => {
    expect(canCharge(SubscriptionStatus.ACTIVE)).toBe(true);
    expect(canCharge(SubscriptionStatus.RETRYING)).toBe(true);
  });

  it('should return false for non-chargeable states', () => {
    expect(canCharge(SubscriptionStatus.CREATED)).toBe(false);
    expect(canCharge(SubscriptionStatus.PENDING_AUTH)).toBe(false);
    expect(canCharge(SubscriptionStatus.PAUSED)).toBe(false);
    expect(canCharge(SubscriptionStatus.CANCELLED)).toBe(false);
    expect(canCharge(SubscriptionStatus.EXPIRED)).toBe(false);
  });
});

describe('isPremiumStatus', () => {
  it('should return true for premium states', () => {
    expect(isPremiumStatus(SubscriptionStatus.ACTIVE)).toBe(true);
    expect(isPremiumStatus(SubscriptionStatus.PAUSED)).toBe(true);
    expect(isPremiumStatus(SubscriptionStatus.AUTHENTICATED)).toBe(true);
    expect(isPremiumStatus(SubscriptionStatus.RETRYING)).toBe(true);
  });

  it('should return false for non-premium states', () => {
    expect(isPremiumStatus(SubscriptionStatus.CREATED)).toBe(false);
    expect(isPremiumStatus(SubscriptionStatus.CANCELLED)).toBe(false);
    expect(isPremiumStatus(SubscriptionStatus.EXPIRED)).toBe(false);
    expect(isPremiumStatus(SubscriptionStatus.FAILED)).toBe(false);
  });
});

describe('isValidTransition', () => {
  describe('Initial States', () => {
    it('should allow CREATED → PENDING_AUTH', () => {
      expect(isValidTransition(SubscriptionStatus.CREATED, SubscriptionStatus.PENDING_AUTH)).toBe(true);
    });

    it('should allow CREATED → ACTIVATION_IN_PROGRESS', () => {
      expect(isValidTransition(SubscriptionStatus.CREATED, SubscriptionStatus.ACTIVATION_IN_PROGRESS)).toBe(true);
    });

    it('should allow CREATED → FAILED', () => {
      expect(isValidTransition(SubscriptionStatus.CREATED, SubscriptionStatus.FAILED)).toBe(true);
    });

    it('should allow CREATED → CANCELLED', () => {
      expect(isValidTransition(SubscriptionStatus.CREATED, SubscriptionStatus.CANCELLED)).toBe(true);
    });

    it('should not allow CREATED → ACTIVE directly', () => {
      expect(isValidTransition(SubscriptionStatus.CREATED, SubscriptionStatus.ACTIVE)).toBe(false);
    });
  });

  describe('Active States', () => {
    it('should allow ACTIVE → PAUSED', () => {
      expect(isValidTransition(SubscriptionStatus.ACTIVE, SubscriptionStatus.PAUSED)).toBe(true);
    });

    it('should allow ACTIVE → CANCEL_IN_PROGRESS', () => {
      expect(isValidTransition(SubscriptionStatus.ACTIVE, SubscriptionStatus.CANCEL_IN_PROGRESS)).toBe(true);
    });

    it('should allow ACTIVE → RETRYING (payment failed)', () => {
      expect(isValidTransition(SubscriptionStatus.ACTIVE, SubscriptionStatus.RETRYING)).toBe(true);
    });

    it('should allow ACTIVE → EXPIRED', () => {
      expect(isValidTransition(SubscriptionStatus.ACTIVE, SubscriptionStatus.EXPIRED)).toBe(true);
    });

    it('should allow ACTIVE → REVOKED', () => {
      expect(isValidTransition(SubscriptionStatus.ACTIVE, SubscriptionStatus.REVOKED)).toBe(true);
    });

    it('should allow ACTIVE → COMPLETED', () => {
      expect(isValidTransition(SubscriptionStatus.ACTIVE, SubscriptionStatus.COMPLETED)).toBe(true);
    });
  });

  describe('Retry Flow', () => {
    it('should allow RETRYING → ACTIVE (payment succeeded)', () => {
      expect(isValidTransition(SubscriptionStatus.RETRYING, SubscriptionStatus.ACTIVE)).toBe(true);
    });

    it('should allow RETRYING → EXPIRED (max retries exceeded)', () => {
      expect(isValidTransition(SubscriptionStatus.RETRYING, SubscriptionStatus.EXPIRED)).toBe(true);
    });

    it('should allow RETRYING → CANCELLED', () => {
      expect(isValidTransition(SubscriptionStatus.RETRYING, SubscriptionStatus.CANCELLED)).toBe(true);
    });
  });

  describe('Reactivation Flow', () => {
    it('should allow EXPIRED → ACTIVE (reactivation)', () => {
      expect(isValidTransition(SubscriptionStatus.EXPIRED, SubscriptionStatus.ACTIVE)).toBe(true);
    });

    it('should allow EXPIRED → ACTIVATION_IN_PROGRESS', () => {
      expect(isValidTransition(SubscriptionStatus.EXPIRED, SubscriptionStatus.ACTIVATION_IN_PROGRESS)).toBe(true);
    });

    it('should allow FAILED → CREATED (retry from beginning)', () => {
      expect(isValidTransition(SubscriptionStatus.FAILED, SubscriptionStatus.CREATED)).toBe(true);
    });

    it('should allow FAILED → ACTIVATION_IN_PROGRESS', () => {
      expect(isValidTransition(SubscriptionStatus.FAILED, SubscriptionStatus.ACTIVATION_IN_PROGRESS)).toBe(true);
    });
  });

  describe('Terminal States', () => {
    it('should not allow transitions from CANCELLED', () => {
      expect(isValidTransition(SubscriptionStatus.CANCELLED, SubscriptionStatus.ACTIVE)).toBe(false);
      expect(isValidTransition(SubscriptionStatus.CANCELLED, SubscriptionStatus.CREATED)).toBe(false);
    });

    it('should not allow transitions from REVOKED', () => {
      expect(isValidTransition(SubscriptionStatus.REVOKED, SubscriptionStatus.ACTIVE)).toBe(false);
    });

    it('should not allow transitions from COMPLETED', () => {
      expect(isValidTransition(SubscriptionStatus.COMPLETED, SubscriptionStatus.ACTIVE)).toBe(false);
    });
  });
});

describe('getValidTargetStatuses', () => {
  it('should return all valid targets for CREATED', () => {
    const targets = getValidTargetStatuses(SubscriptionStatus.CREATED);
    expect(targets).toContain(SubscriptionStatus.PENDING_AUTH);
    expect(targets).toContain(SubscriptionStatus.ACTIVATION_IN_PROGRESS);
    expect(targets).toContain(SubscriptionStatus.FAILED);
    expect(targets).toContain(SubscriptionStatus.CANCELLED);
    expect(targets).toHaveLength(4);
  });

  it('should return empty array for CANCELLED', () => {
    const targets = getValidTargetStatuses(SubscriptionStatus.CANCELLED);
    expect(targets).toHaveLength(0);
  });

  it('should return reactivation targets for EXPIRED', () => {
    const targets = getValidTargetStatuses(SubscriptionStatus.EXPIRED);
    expect(targets).toContain(SubscriptionStatus.ACTIVE);
    expect(targets).toContain(SubscriptionStatus.ACTIVATION_IN_PROGRESS);
  });
});

describe('attemptTransition', () => {
  it('should succeed for valid transition', () => {
    const result = attemptTransition(SubscriptionStatus.CREATED, SubscriptionStatus.PENDING_AUTH);
    expect(result.success).toBe(true);
    expect(result.previousStatus).toBe(SubscriptionStatus.CREATED);
    expect(result.newStatus).toBe(SubscriptionStatus.PENDING_AUTH);
    expect(result.error).toBeUndefined();
  });

  it('should succeed when already in target state', () => {
    const result = attemptTransition(SubscriptionStatus.ACTIVE, SubscriptionStatus.ACTIVE);
    expect(result.success).toBe(true);
    expect(result.previousStatus).toBe(SubscriptionStatus.ACTIVE);
    expect(result.newStatus).toBe(SubscriptionStatus.ACTIVE);
  });

  it('should fail for invalid transition', () => {
    const result = attemptTransition(SubscriptionStatus.CREATED, SubscriptionStatus.ACTIVE);
    expect(result.success).toBe(false);
    expect(result.previousStatus).toBe(SubscriptionStatus.CREATED);
    expect(result.newStatus).toBe(SubscriptionStatus.CREATED);
    expect(result.error).toBeDefined();
    expect(result.error?.type).toBe('INVALID_TRANSITION');
  });

  it('should fail for terminal state transition', () => {
    const result = attemptTransition(SubscriptionStatus.CANCELLED, SubscriptionStatus.ACTIVE);
    expect(result.success).toBe(false);
    expect(result.error?.type).toBe('TERMINAL_STATE');
  });

  it('should allow EXPIRED → ACTIVE transition', () => {
    const result = attemptTransition(SubscriptionStatus.EXPIRED, SubscriptionStatus.ACTIVE);
    expect(result.success).toBe(true);
  });

  it('should allow FAILED → CREATED transition', () => {
    const result = attemptTransition(SubscriptionStatus.FAILED, SubscriptionStatus.CREATED);
    expect(result.success).toBe(true);
  });
});

describe('getTransitionEvent', () => {
  it('should return AUTHORIZE event for CREATED → AUTHENTICATED', () => {
    const event = getTransitionEvent(SubscriptionStatus.CREATED, SubscriptionStatus.AUTHENTICATED);
    expect(event).toBe(StateMachineEvent.AUTHORIZE);
  });

  it('should return ACTIVATE event for PENDING_AUTH → ACTIVE', () => {
    const event = getTransitionEvent(SubscriptionStatus.PENDING_AUTH, SubscriptionStatus.ACTIVE);
    expect(event).toBe(StateMachineEvent.ACTIVATE);
  });

  it('should return CANCEL event for ACTIVE → CANCEL_IN_PROGRESS', () => {
    const event = getTransitionEvent(SubscriptionStatus.ACTIVE, SubscriptionStatus.CANCEL_IN_PROGRESS);
    expect(event).toBe(StateMachineEvent.CANCEL);
  });

  it('should return RETRY_EXHAUSTED for RETRYING → EXPIRED', () => {
    const event = getTransitionEvent(SubscriptionStatus.RETRYING, SubscriptionStatus.EXPIRED);
    expect(event).toBe(StateMachineEvent.RETRY_EXHAUSTED);
  });

  it('should return null for invalid transition', () => {
    const event = getTransitionEvent(SubscriptionStatus.CREATED, SubscriptionStatus.ACTIVE);
    expect(event).toBeNull();
  });
});

describe('StateMachineEvent', () => {
  it('should have all expected event values', () => {
    expect(StateMachineEvent.CREATE).toBe('CREATE');
    expect(StateMachineEvent.AUTHORIZE).toBe('AUTHORIZE');
    expect(StateMachineEvent.ACTIVATE).toBe('ACTIVATE');
    expect(StateMachineEvent.SETUP_FAIL).toBe('SETUP_FAIL');
    expect(StateMachineEvent.PAUSE).toBe('PAUSE');
    expect(StateMachineEvent.RESUME).toBe('RESUME');
    expect(StateMachineEvent.CANCEL).toBe('CANCEL');
    expect(StateMachineEvent.CANCEL_COMPLETE).toBe('CANCEL_COMPLETE');
    expect(StateMachineEvent.REVOKE).toBe('REVOKE');
    expect(StateMachineEvent.COMPLETE).toBe('COMPLETE');
    expect(StateMachineEvent.PAYMENT_SUCCESS).toBe('PAYMENT_SUCCESS');
    expect(StateMachineEvent.PAYMENT_FAIL).toBe('PAYMENT_FAIL');
    expect(StateMachineEvent.RETRY).toBe('RETRY');
    expect(StateMachineEvent.RETRY_EXHAUSTED).toBe('RETRY_EXHAUSTED');
    expect(StateMachineEvent.EXPIRE).toBe('EXPIRE');
  });
});
