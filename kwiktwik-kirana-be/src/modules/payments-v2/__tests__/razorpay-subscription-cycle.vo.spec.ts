/**
 * Tests for Razorpay Subscription Cycle Value Object
 */

import { describe, it, expect } from '@jest/globals';
import {
  RazorpaySubscriptionCycle,
  createRazorpayCycle,
  createRazorpayCycleFromPeriod,
  type RazorpayPlanPeriod,
} from '../domain/value-objects/razorpay-subscription-cycle.vo';
import { BillingFrequency } from '../types/frequency.enum';

describe('RazorpaySubscriptionCycle', () => {
  describe('fromFrequency', () => {
    it('should create cycle from MONTHLY frequency', () => {
      const startDate = new Date('2024-01-15');
      const cycle = RazorpaySubscriptionCycle.fromFrequency(BillingFrequency.MONTHLY, startDate);

      const config = cycle.getConfig();
      expect(config.period).toBe('monthly');
      expect(config.interval).toBe(1);
      expect(config.startDate).toEqual(startDate);
    });

    it('should create cycle from WEEKLY frequency', () => {
      const startDate = new Date('2024-01-15');
      const cycle = RazorpaySubscriptionCycle.fromFrequency(BillingFrequency.WEEKLY, startDate);

      const config = cycle.getConfig();
      expect(config.period).toBe('weekly');
      expect(config.interval).toBe(1);
    });

    it('should create cycle from QUARTERLY frequency', () => {
      const startDate = new Date('2024-01-15');
      const cycle = RazorpaySubscriptionCycle.fromFrequency(BillingFrequency.QUARTERLY, startDate);

      const config = cycle.getConfig();
      expect(config.period).toBe('monthly');
      expect(config.interval).toBe(3);
    });

    it('should create cycle with total cycles', () => {
      const startDate = new Date('2024-01-15');
      const cycle = RazorpaySubscriptionCycle.fromFrequency(
        BillingFrequency.MONTHLY,
        startDate,
        12,
      );

      const config = cycle.getConfig();
      expect(config.totalCycles).toBe(12);
    });
  });

  describe('getCurrentCycle', () => {
    it('should return correct cycle for first month', () => {
      const startDate = new Date('2024-01-15');
      const cycle = createRazorpayCycle(BillingFrequency.MONTHLY, startDate);
      
      const currentDate = new Date('2024-01-20');
      const currentCycle = cycle.getCurrentCycle(currentDate);

      expect(currentCycle.cycleNumber).toBe(1);
      expect(currentCycle.startDate).toEqual(new Date('2024-01-15'));
      expect(currentCycle.endDate).toEqual(new Date('2024-02-15'));
      expect(currentCycle.isLastCycle).toBe(false);
    });

    it('should return correct cycle for second month', () => {
      const startDate = new Date('2024-01-15');
      const cycle = createRazorpayCycle(BillingFrequency.MONTHLY, startDate);
      
      const currentDate = new Date('2024-02-20');
      const currentCycle = cycle.getCurrentCycle(currentDate);

      expect(currentCycle.cycleNumber).toBe(2);
      expect(currentCycle.startDate).toEqual(new Date('2024-02-15'));
      expect(currentCycle.endDate).toEqual(new Date('2024-03-15'));
    });

    it('should return cycle 0 for date before start', () => {
      const startDate = new Date('2024-01-15');
      const cycle = createRazorpayCycle(BillingFrequency.MONTHLY, startDate);
      
      const currentDate = new Date('2024-01-10');
      const currentCycle = cycle.getCurrentCycle(currentDate);

      expect(currentCycle.cycleNumber).toBe(0);
    });

    it('should correctly identify last cycle', () => {
      const startDate = new Date('2024-01-15');
      const cycle = createRazorpayCycle(BillingFrequency.MONTHLY, startDate, 3);
      
      const currentDate = new Date('2024-03-20');
      const currentCycle = cycle.getCurrentCycle(currentDate);

      expect(currentCycle.cycleNumber).toBe(3);
      expect(currentCycle.isLastCycle).toBe(true);
    });
  });

  describe('getCycle', () => {
    it('should return correct cycle for specific number', () => {
      const startDate = new Date('2024-01-15');
      const cycle = createRazorpayCycle(BillingFrequency.MONTHLY, startDate);
      
      const cycle2 = cycle.getCycle(2);

      expect(cycle2.cycleNumber).toBe(2);
      expect(cycle2.startDate).toEqual(new Date('2024-02-15'));
      expect(cycle2.endDate).toEqual(new Date('2024-03-15'));
    });

    it('should throw for cycle number less than 1', () => {
      const startDate = new Date('2024-01-15');
      const cycle = createRazorpayCycle(BillingFrequency.MONTHLY, startDate);

      expect(() => cycle.getCycle(0)).toThrow('Cycle number must be at least 1');
    });
  });

  describe('Month-end handling', () => {
    it('should handle Jan 31 → Feb correctly', () => {
      const startDate = new Date('2024-01-31');
      const cycle = createRazorpayCycle(BillingFrequency.MONTHLY, startDate);
      
      const cycle1 = cycle.getCycle(1);
      expect(cycle1.endDate.getDate()).toBe(29); // 2024 is a leap year, Feb 29
      expect(cycle1.endDate.getMonth()).toBe(1); // February
    });

    it('should handle Jan 31 → Feb → Mar correctly (non-leap year)', () => {
      const startDate = new Date('2023-01-31');
      const cycle = createRazorpayCycle(BillingFrequency.MONTHLY, startDate);
      
      const cycle1 = cycle.getCycle(1);
      expect(cycle1.endDate.getDate()).toBe(28); // 2023 Feb 28
      expect(cycle1.endDate.getMonth()).toBe(1); // February

      const cycle2 = cycle.getCycle(2);
      expect(cycle2.startDate.getDate()).toBe(28);
      expect(cycle2.endDate.getDate()).toBe(28); // Mar 28
    });

    it('should handle Jan 30 → Feb correctly', () => {
      const startDate = new Date('2024-01-30');
      const cycle = createRazorpayCycle(BillingFrequency.MONTHLY, startDate);
      
      const cycle1 = cycle.getCycle(1);
      expect(cycle1.endDate.getDate()).toBe(29); // Feb 29 (leap year)
    });

    it('should preserve day when possible', () => {
      const startDate = new Date('2024-02-15');
      const cycle = createRazorpayCycle(BillingFrequency.MONTHLY, startDate);
      
      const cycle1 = cycle.getCycle(1);
      expect(cycle1.endDate.getDate()).toBe(15);
      expect(cycle1.endDate.getMonth()).toBe(2); // March
    });
  });

  describe('getNextBillingDate', () => {
    it('should return next billing date', () => {
      const startDate = new Date('2024-01-15');
      const cycle = createRazorpayCycle(BillingFrequency.MONTHLY, startDate);
      
      const fromDate = new Date('2024-01-20');
      const nextBilling = cycle.getNextBillingDate(fromDate);

      expect(nextBilling.getDate()).toBe(15);
      expect(nextBilling.getMonth()).toBe(1); // February
    });
  });

  describe('isComplete', () => {
    it('should return false for unlimited cycles', () => {
      const startDate = new Date('2024-01-15');
      const cycle = createRazorpayCycle(BillingFrequency.MONTHLY, startDate, null);

      expect(cycle.isComplete(100)).toBe(false);
    });

    it('should return true when cycles completed', () => {
      const startDate = new Date('2024-01-15');
      const cycle = createRazorpayCycle(BillingFrequency.MONTHLY, startDate, 12);

      expect(cycle.isComplete(12)).toBe(true);
      expect(cycle.isComplete(13)).toBe(true);
    });

    it('should return false when cycles not completed', () => {
      const startDate = new Date('2024-01-15');
      const cycle = createRazorpayCycle(BillingFrequency.MONTHLY, startDate, 12);

      expect(cycle.isComplete(11)).toBe(false);
    });
  });

  describe('getRemainingCycles', () => {
    it('should return null for unlimited cycles', () => {
      const startDate = new Date('2024-01-15');
      const cycle = createRazorpayCycle(BillingFrequency.MONTHLY, startDate, null);

      expect(cycle.getRemainingCycles(5)).toBeNull();
    });

    it('should return remaining cycles', () => {
      const startDate = new Date('2024-01-15');
      const cycle = createRazorpayCycle(BillingFrequency.MONTHLY, startDate, 12);

      expect(cycle.getRemainingCycles(5)).toBe(7);
      expect(cycle.getRemainingCycles(12)).toBe(0);
    });
  });

  describe('calculateSubscriptionEndDate', () => {
    it('should return null for unlimited cycles', () => {
      const startDate = new Date('2024-01-15');
      const cycle = createRazorpayCycle(BillingFrequency.MONTHLY, startDate, null);

      expect(cycle.calculateSubscriptionEndDate()).toBeNull();
    });

    it('should calculate end date for fixed cycles', () => {
      const startDate = new Date('2024-01-15');
      const cycle = createRazorpayCycle(BillingFrequency.MONTHLY, startDate, 12);

      const endDate = cycle.calculateSubscriptionEndDate();
      expect(endDate?.getMonth()).toBe(0); // January 2025
      expect(endDate?.getFullYear()).toBe(2025);
    });
  });

  describe('Weekly cycles', () => {
    it('should correctly calculate weekly cycles', () => {
      const startDate = new Date('2024-01-15'); // Monday
      const cycle = createRazorpayCycle(BillingFrequency.WEEKLY, startDate);
      
      const cycle1 = cycle.getCycle(1);
      expect(cycle1.endDate.getDate()).toBe(22); // +7 days
    });
  });

  describe('Daily cycles', () => {
    it('should correctly calculate daily cycles', () => {
      const startDate = new Date('2024-01-15');
      const cycle = createRazorpayCycle(BillingFrequency.DAILY, startDate);
      
      const cycle1 = cycle.getCycle(1);
      expect(cycle1.endDate.getDate()).toBe(16); // +1 day
    });
  });

  describe('Yearly cycles', () => {
    it('should correctly calculate yearly cycles', () => {
      const startDate = new Date('2024-01-15');
      const cycle = createRazorpayCycle(BillingFrequency.YEARLY, startDate);
      
      const cycle1 = cycle.getCycle(1);
      expect(cycle1.endDate.getFullYear()).toBe(2025);
      expect(cycle1.endDate.getMonth()).toBe(0); // January
      expect(cycle1.endDate.getDate()).toBe(15);
    });

    it('should handle leap year in yearly cycle', () => {
      const startDate = new Date('2024-02-29');
      const cycle = createRazorpayCycle(BillingFrequency.YEARLY, startDate);
      
      const cycle1 = cycle.getCycle(1);
      // 2025 is not a leap year, so Feb 29 becomes Feb 28
      expect(cycle1.endDate.getDate()).toBe(28);
      expect(cycle1.endDate.getMonth()).toBe(1); // February
    });
  });
});

describe('createRazorpayCycleFromPeriod', () => {
  it('should create cycle from interval and period', () => {
    const startDate = new Date('2024-01-15');
    const cycle = createRazorpayCycleFromPeriod(2, 'weekly', startDate, 10);

    const config = cycle.getConfig();
    expect(config.interval).toBe(2);
    expect(config.period).toBe('weekly');
    expect(config.totalCycles).toBe(10);
  });
});
