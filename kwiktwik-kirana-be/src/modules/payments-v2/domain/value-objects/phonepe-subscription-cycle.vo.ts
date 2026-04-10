/**
 * PhonePe Subscription Cycle Value Object
 * 
 * Handles subscription cycle calculations specific to PhonePe's billing model.
 * PhonePe uses frequency strings (DAILY, WEEKLY, MONTHLY, etc.) and has
 * different workflows for authorization and redemption.
 * 
 * Key differences from Razorpay:
 * - Uses frequency string instead of interval/period
 * - Has auth workflow with debit after X days
 * - Has agreement workflow with mandate-based deductions
 * - Supports ON_DEMAND frequency for manual charges
 */

import { BillingFrequency } from '../../types/frequency.enum';
import { toPhonePeFrequency, mapPhonePeFrequency } from '../../types/frequency.enum';
import type { PhonePeFrequency } from '../../types/phonepe.types';
import { PhonePeFrequency as PhonePeFrequencyValues } from '../../types/phonepe.types';

// ============================================================================
// Types
// ============================================================================

/**
 * PhonePe auth workflow type
 */
export type PhonePeAuthWorkflow = 'TRANSACTION' | 'PENNY_DROP';

/**
 * Subscription cycle information
 */
export interface SubscriptionCycleInfo {
  /** Cycle number (1-indexed) */
  readonly cycleNumber: number;
  /** Start date of current cycle */
  readonly startDate: Date;
  /** End date of current cycle */
  readonly endDate: Date;
  /** Next billing date */
  readonly nextBillingDate: Date | null;
  /** Whether this is the last cycle */
  readonly isLastCycle: boolean;
  /** Whether charge is automatic (provider-managed) or manual (user-managed) */
  readonly isAutoDebit: boolean;
}

/**
 * PhonePe subscription cycle configuration
 */
export interface PhonePeCycleConfig {
  /** Billing frequency */
  readonly frequency: PhonePeFrequency;
  /** Auth workflow type */
  readonly authWorkflow: PhonePeAuthWorkflow;
  /** Total number of cycles (null = unlimited) */
  readonly totalCycles: number | null;
  /** Subscription start date */
  readonly startDate: Date;
  /** Subscription end date (optional, from expireAt) */
  readonly endDate: Date | null;
  /** Whether auto-debit is enabled */
  readonly autoDebit: boolean;
  /** Maximum amount per charge (in paise) */
  readonly maxAmount: number;
}

/**
 * Redemption timing information
 */
export interface RedemptionTiming {
  /** When the charge can be initiated (validAfter) */
  readonly validAfter: Date;
  /** When the charge window expires (validUpto) */
  readonly validUpto: Date;
  /** Duration of the charge window in hours */
  readonly windowDurationHours: number;
}

// ============================================================================
// Value Object
// ============================================================================

/**
 * PhonePe Subscription Cycle Value Object
 * 
 * Immutable value object that calculates billing cycles based on
 * PhonePe's frequency model.
 */
export class PhonePeSubscriptionCycle {
  private readonly config: PhonePeCycleConfig;

  constructor(config: PhonePeCycleConfig) {
    this.config = Object.freeze({ ...config });
  }

  /**
   * Create from unified billing frequency
   */
  static fromFrequency(
    frequency: BillingFrequency,
    startDate: Date,
    totalCycles: number | null = null,
    autoDebit: boolean = true,
    maxAmount: number = 0,
  ): PhonePeSubscriptionCycle {
    const phonePeFrequency = toPhonePeFrequency(frequency) as PhonePeFrequency;
    return new PhonePeSubscriptionCycle({
      frequency: phonePeFrequency,
      authWorkflow: 'TRANSACTION',
      totalCycles,
      startDate,
      endDate: null,
      autoDebit,
      maxAmount,
    });
  }

  /**
   * Get current cycle information
   */
  getCurrentCycle(currentDate: Date = new Date()): SubscriptionCycleInfo {
    const cycleNumber = this.calculateCycleNumber(currentDate);
    const startDate = this.calculateCycleStart(cycleNumber);
    const endDate = this.calculateCycleEnd(cycleNumber);
    const nextBillingDate = this.calculateNextBillingDate(endDate);
    const isLastCycle = this.config.totalCycles !== null && cycleNumber >= this.config.totalCycles;

    return {
      cycleNumber,
      startDate,
      endDate,
      nextBillingDate,
      isLastCycle,
      isAutoDebit: this.config.autoDebit,
    };
  }

  /**
   * Get cycle information for a specific cycle number
   */
  getCycle(cycleNumber: number): SubscriptionCycleInfo {
    if (cycleNumber < 1) {
      throw new Error('Cycle number must be at least 1');
    }

    const startDate = this.calculateCycleStart(cycleNumber);
    const endDate = this.calculateCycleEnd(cycleNumber);
    const nextBillingDate = this.calculateNextBillingDate(endDate);
    const isLastCycle = this.config.totalCycles !== null && cycleNumber >= this.config.totalCycles;

    return {
      cycleNumber,
      startDate,
      endDate,
      nextBillingDate,
      isLastCycle,
      isAutoDebit: this.config.autoDebit,
    };
  }

  /**
   * Get next billing date from a given date
   * Returns null for ON_DEMAND frequency
   */
  getNextBillingDate(fromDate: Date = new Date()): Date | null {
    if (this.config.frequency === 'ONDEMAND') {
      return null;
    }
    
    const cycle = this.getCurrentCycle(fromDate);
    return cycle.nextBillingDate;
  }

  /**
   * Get redemption timing for a charge
   * 
   * PhonePe has a charge window:
   * - validAfter: When the charge can be initiated
   * - validUpto: When the charge window expires
   */
  getRedemptionTiming(chargeDate: Date = new Date()): RedemptionTiming {
    // PhonePe typically allows charges within a 24-48 hour window
    const validAfter = new Date(chargeDate);
    validAfter.setHours(0, 0, 0, 0);
    
    const validUpto = new Date(validAfter);
    validUpto.setHours(validUpto.getHours() + this.getChargeWindowHours());
    
    return {
      validAfter,
      validUpto,
      windowDurationHours: this.getChargeWindowHours(),
    };
  }

  /**
   * Get charge window duration in hours based on frequency
   */
  private getChargeWindowHours(): number {
    switch (this.config.frequency) {
      case 'DAILY':
        return 24;
      case 'WEEKLY':
        return 48;
      case 'FORTNIGHTLY':
        return 72;
      case 'MONTHLY':
      case 'BIMONTHLY':
        return 96;
      case 'QUARTERLY':
      case 'HALFYEARLY':
      case 'YEARLY':
        return 168; // 1 week
      case 'ONDEMAND':
        return 720; // 30 days for on-demand
      default:
        return 48;
    }
  }

  /**
   * Calculate cycle number for a given date
   */
  private calculateCycleNumber(date: Date): number {
    if (this.config.frequency === 'ONDEMAND') {
      // ON_DEMAND doesn't have traditional cycles
      return 1;
    }

    const start = new Date(this.config.startDate);
    start.setHours(0, 0, 0, 0);
    
    const target = new Date(date);
    target.setHours(0, 0, 0, 0);

    if (target < start) {
      return 0;
    }

    const daysDiff = Math.floor((target.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const daysPerCycle = this.getDaysPerCycle();

    return Math.floor(daysDiff / daysPerCycle) + 1;
  }

  /**
   * Get approximate days per cycle based on frequency
   */
  private getDaysPerCycle(): number {
    switch (this.config.frequency) {
      case 'DAILY':
        return 1;
      case 'WEEKLY':
        return 7;
      case 'FORTNIGHTLY':
        return 14;
      case 'MONTHLY':
        return 30;
      case 'BIMONTHLY':
        return 15;
      case 'QUARTERLY':
        return 90;
      case 'HALFYEARLY':
        return 180;
      case 'YEARLY':
        return 365;
      case 'ONDEMAND':
        return 0;
      default:
        return 30;
    }
  }

  /**
   * Calculate cycle start date
   */
  private calculateCycleStart(cycleNumber: number): Date {
    if (cycleNumber < 1) {
      return new Date(this.config.startDate);
    }

    if (this.config.frequency === 'ONDEMAND') {
      return new Date(this.config.startDate);
    }

    const start = new Date(this.config.startDate);
    const daysPerCycle = this.getDaysPerCycle();
    const daysToAdd = (cycleNumber - 1) * daysPerCycle;
    
    start.setDate(start.getDate() + daysToAdd);
    return start;
  }

  /**
   * Calculate cycle end date
   */
  private calculateCycleEnd(cycleNumber: number): Date {
    if (this.config.frequency === 'ONDEMAND') {
      // ON_DEMAND has no end date
      return new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year from now
    }

    const cycleStart = this.calculateCycleStart(cycleNumber);
    const daysPerCycle = this.getDaysPerCycle();
    
    const endDate = new Date(cycleStart);
    endDate.setDate(endDate.getDate() + daysPerCycle);
    return endDate;
  }

  /**
   * Calculate next billing date
   */
  private calculateNextBillingDate(currentEndDate: Date): Date | null {
    if (this.config.frequency === 'ONDEMAND') {
      return null;
    }
    return new Date(currentEndDate);
  }

  /**
   * Get configuration
   */
  getConfig(): Readonly<PhonePeCycleConfig> {
    return this.config;
  }

  /**
   * Check if subscription is complete
   */
  isComplete(completedCycles: number): boolean {
    return this.config.totalCycles !== null && completedCycles >= this.config.totalCycles;
  }

  /**
   * Get remaining cycles
   */
  getRemainingCycles(completedCycles: number): number | null {
    if (this.config.totalCycles === null) {
      return null;
    }
    return Math.max(0, this.config.totalCycles - completedCycles);
  }

  /**
   * Calculate subscription end date
   */
  calculateSubscriptionEndDate(): Date | null {
    if (this.config.totalCycles === null) {
      return this.config.endDate;
    }
    
    const lastCycle = this.getCycle(this.config.totalCycles);
    return lastCycle.endDate;
  }

  /**
   * Check if charge is needed for current cycle
   */
  isChargeNeeded(currentDate: Date = new Date(), lastChargeDate: Date | null): boolean {
    if (this.config.frequency === 'ONDEMAND') {
      // ON_DEMAND requires manual trigger
      return false;
    }

    if (!lastChargeDate) {
      return true;
    }

    const currentCycle = this.getCurrentCycle(currentDate);
    const lastChargeCycle = this.getCurrentCycle(lastChargeDate);

    return currentCycle.cycleNumber > lastChargeCycle.cycleNumber;
  }

  /**
   * Get PhonePe frequency string
   */
  getPhonePeFrequency(): PhonePeFrequency {
    return this.config.frequency;
  }

  /**
   * Get unified billing frequency
   */
  getBillingFrequency(): BillingFrequency {
    return mapPhonePeFrequency(this.config.frequency) ?? BillingFrequency.MONTHLY;
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Create PhonePe subscription cycle from frequency
 */
export function createPhonePeCycle(
  frequency: BillingFrequency,
  startDate: Date,
  totalCycles: number | null = null,
  autoDebit: boolean = true,
  maxAmount: number = 0,
): PhonePeSubscriptionCycle {
  return PhonePeSubscriptionCycle.fromFrequency(frequency, startDate, totalCycles, autoDebit, maxAmount);
}

/**
 * Create PhonePe subscription cycle from PhonePe frequency string
 */
export function createPhonePeCycleFromFrequency(
  frequency: PhonePeFrequency,
  startDate: Date,
  totalCycles: number | null = null,
  autoDebit: boolean = true,
  maxAmount: number = 0,
): PhonePeSubscriptionCycle {
  return new PhonePeSubscriptionCycle({
    frequency,
    authWorkflow: 'TRANSACTION',
    totalCycles,
    startDate,
    endDate: null,
    autoDebit,
    maxAmount,
  });
}
