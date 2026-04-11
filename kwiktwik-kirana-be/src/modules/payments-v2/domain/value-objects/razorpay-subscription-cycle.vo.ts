/**
 * Razorpay Subscription Cycle Value Object
 * 
 * Handles subscription cycle calculations specific to Razorpay's billing model.
 * Razorpay uses interval + period for billing frequency.
 * 
 * Key differences from PhonePe:
 * - Uses interval (number) + period (daily/weekly/monthly/yearly)
 * - Handles month-end edge cases (Jan 31 → Feb 28/29)
 * - Tracks current_start and current_end for billing cycle
 */

import type { BillingFrequency } from '../../types/frequency.enum';
import { toRazorpayPeriod } from '../../types/frequency.enum';

// ============================================================================
// Types
// ============================================================================

/**
 * Razorpay plan period types
 */
export type RazorpayPlanPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

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
  readonly nextBillingDate: Date;
  /** Whether this is the last cycle */
  readonly isLastCycle: boolean;
}

/**
 * Razorpay subscription cycle configuration
 */
export interface RazorpayCycleConfig {
  /** Billing interval (e.g., 1 for monthly, 2 for bi-monthly) */
  readonly interval: number;
  /** Billing period */
  readonly period: RazorpayPlanPeriod;
  /** Total number of cycles (null = unlimited) */
  readonly totalCycles: number | null;
  /** Subscription start date */
  readonly startDate: Date;
  /** Subscription end date (optional) */
  readonly endDate: Date | null;
}

// ============================================================================
// Value Object
// ============================================================================

/**
 * Razorpay Subscription Cycle Value Object
 * 
 * Immutable value object that calculates billing cycles based on
 * Razorpay's interval/period model.
 */
export class RazorpaySubscriptionCycle {
  private readonly config: RazorpayCycleConfig;

  constructor(config: RazorpayCycleConfig) {
    this.config = Object.freeze({ ...config });
  }

  /**
   * Create from unified billing frequency
   */
  static fromFrequency(
    frequency: BillingFrequency,
    startDate: Date,
    totalCycles: number | null = null,
  ): RazorpaySubscriptionCycle {
    const periodInfo = toRazorpayPeriod(frequency);
    return new RazorpaySubscriptionCycle({
      interval: periodInfo.interval,
      period: periodInfo.period as RazorpayPlanPeriod,
      totalCycles,
      startDate,
      endDate: null,
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
    };
  }

  /**
   * Get next billing date from a given date
   */
  getNextBillingDate(fromDate: Date = new Date()): Date {
    const cycle = this.getCurrentCycle(fromDate);
    return cycle.nextBillingDate;
  }

  /**
   * Calculate cycle number for a given date
   */
  private calculateCycleNumber(date: Date): number {
    const start = new Date(this.config.startDate);
    start.setHours(0, 0, 0, 0);
    
    const target = new Date(date);
    target.setHours(0, 0, 0, 0);

    if (target < start) {
      return 0;
    }

    let cycles = 1;
    let currentStart = new Date(start);

    while (true) {
      const currentEnd = this.addPeriod(currentStart, this.config.period, this.config.interval);
      
      if (target < currentEnd) {
        return cycles;
      }
      
      cycles++;
      currentStart = currentEnd;

      // Safety check for unlimited cycles
      if (this.config.totalCycles === null && cycles > 1000) {
        return cycles;
      }
    }
  }

  /**
   * Calculate cycle start date
   */
  private calculateCycleStart(cycleNumber: number): Date {
    if (cycleNumber < 1) {
      return new Date(this.config.startDate);
    }

    const start = new Date(this.config.startDate);
    
    // For cycle 1, start date is the subscription start
    if (cycleNumber === 1) {
      return new Date(start);
    }

    // For subsequent cycles, add (cycleNumber - 1) periods
    return this.addPeriod(start, this.config.period, this.config.interval * (cycleNumber - 1));
  }

  /**
   * Calculate cycle end date
   */
  private calculateCycleEnd(cycleNumber: number): Date {
    const cycleStart = this.calculateCycleStart(cycleNumber);
    return this.addPeriod(cycleStart, this.config.period, this.config.interval);
  }

  /**
   * Calculate next billing date
   */
  private calculateNextBillingDate(currentEndDate: Date): Date {
    return new Date(currentEndDate);
  }

  /**
   * Add period to a date with proper month-end handling
   */
  private addPeriod(date: Date, period: RazorpayPlanPeriod, interval: number): Date {
    const result = new Date(date);
    
    switch (period) {
      case 'daily':
        result.setDate(result.getDate() + interval);
        break;
        
      case 'weekly':
        result.setDate(result.getDate() + (interval * 7));
        break;
        
      case 'monthly':
        this.addMonths(result, interval);
        break;
        
      case 'yearly':
        this.addMonths(result, interval * 12);
        break;
    }
    
    return result;
  }

  /**
   * Add months to a date with proper month-end handling
   * 
   * Handles edge cases like:
   * - Jan 31 + 1 month = Feb 28/29 (last day of Feb)
   * - Jan 30 + 1 month = Feb 28/29 (last day of Feb)
   * - Feb 28 + 1 month = Mar 28
   */
  private addMonths(date: Date, months: number): void {
    const originalDay = date.getDate();
    const originalMonth = date.getMonth();
    const originalYear = date.getFullYear();
    
    // Calculate new month and year
    let newMonth = originalMonth + months;
    let newYear = originalYear;
    
    while (newMonth > 11) {
      newMonth -= 12;
      newYear++;
    }
    
    while (newMonth < 0) {
      newMonth += 12;
      newYear--;
    }
    
    // Get last day of new month
    const lastDayOfNewMonth = new Date(newYear, newMonth + 1, 0).getDate();
    
    // If original day is greater than last day of new month, use last day
    const newDay = Math.min(originalDay, lastDayOfNewMonth);
    
    // Avoid JS Date overflow (e.g. Jan 31 -> Mar) by anchoring to day 1 first.
    date.setDate(1);
    date.setFullYear(newYear);
    date.setMonth(newMonth);
    date.setDate(newDay);
  }

  /**
   * Get configuration
   */
  getConfig(): Readonly<RazorpayCycleConfig> {
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
      return null;
    }
    
    const lastCycle = this.getCycle(this.config.totalCycles);
    return lastCycle.endDate;
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Create Razorpay subscription cycle from frequency
 */
export function createRazorpayCycle(
  frequency: BillingFrequency,
  startDate: Date,
  totalCycles: number | null = null,
): RazorpaySubscriptionCycle {
  return RazorpaySubscriptionCycle.fromFrequency(frequency, startDate, totalCycles);
}

/**
 * Create Razorpay subscription cycle from interval and period
 */
export function createRazorpayCycleFromPeriod(
  interval: number,
  period: RazorpayPlanPeriod,
  startDate: Date,
  totalCycles: number | null = null,
): RazorpaySubscriptionCycle {
  return new RazorpaySubscriptionCycle({
    interval,
    period,
    totalCycles,
    startDate,
    endDate: null,
  });
}
