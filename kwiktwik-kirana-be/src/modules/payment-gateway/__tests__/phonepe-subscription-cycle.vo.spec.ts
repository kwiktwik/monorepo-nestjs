/**
 * Tests for PhonePe Subscription Cycle Value Object
 */

import { describe, it, expect } from '@jest/globals';
import {
  PhonePeSubscriptionCycle,
  createPhonePeCycle,
  createPhonePeCycleFromFrequency,
} from '../domain/value-objects/phonepe-subscription-cycle.vo';
import { BillingFrequency } from '../types/frequency.enum';
import type { PhonePeFrequency } from '../types/phonepe.types';

describe('PhonePeSubscriptionCycle', () => {
  describe('fromFrequency', () => {
    it('should create cycle from MONTHLY frequency', () => {
      const startDate = new Date('2024-01-15');
      const cycle = PhonePeSubscriptionCycle.fromFrequency(BillingFrequency.MONTHLY, startDate);

      const config = cycle.getConfig();
      expect(config.frequency).toBe('MONTHLY');
      expect(config.startDate).toEqual(startDate);
      expect(config.autoDebit).toBe(true);
    });

    it('should create cycle from ON_DEMAND frequency', () => {
      const startDate = new Date('2024-01-15');
      const cycle = PhonePeSubscriptionCycle.fromFrequency(BillingFrequency.ON_DEMAND, startDate);

      const config = cycle.getConfig();
      expect(config.frequency).toBe('ONDEMAND');
    });

    it('should create cycle with autoDebit=false for user-managed', () => {
      const startDate = new Date('2024-01-15');
      const cycle = PhonePeSubscriptionCycle.fromFrequency(
        BillingFrequency.MONTHLY,
        startDate,
        null,
        false, // autoDebit
      );

      const config = cycle.getConfig();
      expect(config.autoDebit).toBe(false);
    });

    it('should create cycle with maxAmount', () => {
      const startDate = new Date('2024-01-15');
      const cycle = PhonePeSubscriptionCycle.fromFrequency(
        BillingFrequency.MONTHLY,
        startDate,
        null,
        true,
        50000, // 500 rupees in paise
      );

      const config = cycle.getConfig();
      expect(config.maxAmount).toBe(50000);
    });
  });

  describe('getCurrentCycle', () => {
    it('should return correct cycle for first month', () => {
      const startDate = new Date('2024-01-15');
      const cycle = createPhonePeCycle(BillingFrequency.MONTHLY, startDate);
      
      const currentDate = new Date('2024-01-20');
      const currentCycle = cycle.getCurrentCycle(currentDate);

      expect(currentCycle.cycleNumber).toBe(1);
      expect(currentCycle.isLastCycle).toBe(false);
      expect(currentCycle.isAutoDebit).toBe(true);
    });

    it('should return correct cycle for second month', () => {
      const startDate = new Date('2024-01-15');
      const cycle = createPhonePeCycle(BillingFrequency.MONTHLY, startDate);
      
      const currentDate = new Date('2024-02-20');
      const currentCycle = cycle.getCurrentCycle(currentDate);

      expect(currentCycle.cycleNumber).toBe(2);
    });

    it('should return cycle 0 for date before start', () => {
      const startDate = new Date('2024-01-15');
      const cycle = createPhonePeCycle(BillingFrequency.MONTHLY, startDate);
      
      const currentDate = new Date('2024-01-10');
      const currentCycle = cycle.getCurrentCycle(currentDate);

      expect(currentCycle.cycleNumber).toBe(0);
    });

    it('should always return cycle 1 for ON_DEMAND', () => {
      const startDate = new Date('2024-01-15');
      const cycle = createPhonePeCycle(BillingFrequency.ON_DEMAND, startDate);
      
      const currentDate = new Date('2024-06-20');
      const currentCycle = cycle.getCurrentCycle(currentDate);

      expect(currentCycle.cycleNumber).toBe(1);
    });
  });

  describe('getCycle', () => {
    it('should return correct cycle for specific number', () => {
      const startDate = new Date('2024-01-15');
      const cycle = createPhonePeCycle(BillingFrequency.MONTHLY, startDate);
      
      const cycle2 = cycle.getCycle(2);

      expect(cycle2.cycleNumber).toBe(2);
    });

    it('should throw for cycle number less than 1', () => {
      const startDate = new Date('2024-01-15');
      const cycle = createPhonePeCycle(BillingFrequency.MONTHLY, startDate);

      expect(() => cycle.getCycle(0)).toThrow('Cycle number must be at least 1');
    });
  });

  describe('getNextBillingDate', () => {
    it('should return next billing date for regular frequency', () => {
      const startDate = new Date('2024-01-15');
      const cycle = createPhonePeCycle(BillingFrequency.MONTHLY, startDate);
      
      const fromDate = new Date('2024-01-20');
      const nextBilling = cycle.getNextBillingDate(fromDate);

      expect(nextBilling).not.toBeNull();
    });

    it('should return null for ON_DEMAND frequency', () => {
      const startDate = new Date('2024-01-15');
      const cycle = createPhonePeCycle(BillingFrequency.ON_DEMAND, startDate);
      
      const nextBilling = cycle.getNextBillingDate();

      expect(nextBilling).toBeNull();
    });
  });

  describe('getRedemptionTiming', () => {
    it('should return valid redemption timing', () => {
      const startDate = new Date('2024-01-15');
      const cycle = createPhonePeCycle(BillingFrequency.MONTHLY, startDate);
      
      const timing = cycle.getRedemptionTiming();

      expect(timing.validAfter).toBeDefined();
      expect(timing.validUpto).toBeDefined();
      expect(timing.windowDurationHours).toBeGreaterThan(0);
      expect(timing.validUpto > timing.validAfter).toBe(true);
    });

    it('should have longer window for ON_DEMAND', () => {
      const startDate = new Date('2024-01-15');
      const cycle = createPhonePeCycle(BillingFrequency.ON_DEMAND, startDate);
      
      const timing = cycle.getRedemptionTiming();

      expect(timing.windowDurationHours).toBe(720); // 30 days
    });

    it('should have 24 hour window for DAILY', () => {
      const startDate = new Date('2024-01-15');
      const cycle = createPhonePeCycle(BillingFrequency.DAILY, startDate);
      
      const timing = cycle.getRedemptionTiming();

      expect(timing.windowDurationHours).toBe(24);
    });
  });

  describe('isComplete', () => {
    it('should return false for unlimited cycles', () => {
      const startDate = new Date('2024-01-15');
      const cycle = createPhonePeCycle(BillingFrequency.MONTHLY, startDate, null);

      expect(cycle.isComplete(100)).toBe(false);
    });

    it('should return true when cycles completed', () => {
      const startDate = new Date('2024-01-15');
      const cycle = createPhonePeCycle(BillingFrequency.MONTHLY, startDate, 12);

      expect(cycle.isComplete(12)).toBe(true);
    });
  });

  describe('getRemainingCycles', () => {
    it('should return null for unlimited cycles', () => {
      const startDate = new Date('2024-01-15');
      const cycle = createPhonePeCycle(BillingFrequency.MONTHLY, startDate, null);

      expect(cycle.getRemainingCycles(5)).toBeNull();
    });

    it('should return remaining cycles', () => {
      const startDate = new Date('2024-01-15');
      const cycle = createPhonePeCycle(BillingFrequency.MONTHLY, startDate, 12);

      expect(cycle.getRemainingCycles(5)).toBe(7);
    });
  });

  describe('isChargeNeeded', () => {
    it('should return true when no previous charge', () => {
      const startDate = new Date('2024-01-15');
      const cycle = createPhonePeCycle(BillingFrequency.MONTHLY, startDate);
      
      const currentDate = new Date('2024-01-20');

      expect(cycle.isChargeNeeded(currentDate, null)).toBe(true);
    });

    it('should return false for ON_DEMAND', () => {
      const startDate = new Date('2024-01-15');
      const cycle = createPhonePeCycle(BillingFrequency.ON_DEMAND, startDate);
      
      const currentDate = new Date('2024-01-20');

      expect(cycle.isChargeNeeded(currentDate, null)).toBe(false);
    });

    it('should return true when in new cycle', () => {
      const startDate = new Date('2024-01-15');
      const cycle = createPhonePeCycle(BillingFrequency.MONTHLY, startDate);
      
      const currentDate = new Date('2024-02-20');
      const lastChargeDate = new Date('2024-01-20');

      expect(cycle.isChargeNeeded(currentDate, lastChargeDate)).toBe(true);
    });

    it('should return false when in same cycle', () => {
      const startDate = new Date('2024-01-15');
      const cycle = createPhonePeCycle(BillingFrequency.MONTHLY, startDate);
      
      const currentDate = new Date('2024-01-20');
      const lastChargeDate = new Date('2024-01-18');

      expect(cycle.isChargeNeeded(currentDate, lastChargeDate)).toBe(false);
    });
  });

  describe('getPhonePeFrequency', () => {
    it('should return PhonePe frequency string', () => {
      const startDate = new Date('2024-01-15');
      const cycle = createPhonePeCycle(BillingFrequency.MONTHLY, startDate);

      expect(cycle.getPhonePeFrequency()).toBe('MONTHLY');
    });

    it('should return ONDEMAND for ON_DEMAND', () => {
      const startDate = new Date('2024-01-15');
      const cycle = createPhonePeCycle(BillingFrequency.ON_DEMAND, startDate);

      expect(cycle.getPhonePeFrequency()).toBe('ONDEMAND');
    });
  });

  describe('getBillingFrequency', () => {
    it('should return unified billing frequency', () => {
      const startDate = new Date('2024-01-15');
      const cycle = createPhonePeCycle(BillingFrequency.MONTHLY, startDate);

      expect(cycle.getBillingFrequency()).toBe('MONTHLY');
    });
  });

  describe('calculateSubscriptionEndDate', () => {
    it('should return null for unlimited cycles', () => {
      const startDate = new Date('2024-01-15');
      const cycle = createPhonePeCycle(BillingFrequency.MONTHLY, startDate, null);

      expect(cycle.calculateSubscriptionEndDate()).toBeNull();
    });

    it('should calculate end date for fixed cycles', () => {
      const startDate = new Date('2024-01-15');
      const cycle = createPhonePeCycle(BillingFrequency.MONTHLY, startDate, 12);

      const endDate = cycle.calculateSubscriptionEndDate();
      expect(endDate).not.toBeNull();
    });
  });

  describe('Different frequencies', () => {
    it('should handle DAILY frequency', () => {
      const startDate = new Date('2024-01-15');
      const cycle = createPhonePeCycle(BillingFrequency.DAILY, startDate);
      
      const cycle1 = cycle.getCycle(1);
      const cycle2 = cycle.getCycle(2);
      
      const dayDiff = Math.floor(
        (cycle2.startDate.getTime() - cycle1.startDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      expect(dayDiff).toBe(1);
    });

    it('should handle WEEKLY frequency', () => {
      const startDate = new Date('2024-01-15');
      const cycle = createPhonePeCycle(BillingFrequency.WEEKLY, startDate);
      
      const cycle1 = cycle.getCycle(1);
      const cycle2 = cycle.getCycle(2);
      
      const dayDiff = Math.floor(
        (cycle2.startDate.getTime() - cycle1.startDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      expect(dayDiff).toBe(7);
    });

    it('should handle FORTNIGHTLY frequency', () => {
      const startDate = new Date('2024-01-15');
      const cycle = createPhonePeCycle(BillingFrequency.FORTNIGHTLY, startDate);
      
      const cycle1 = cycle.getCycle(1);
      const cycle2 = cycle.getCycle(2);
      
      const dayDiff = Math.floor(
        (cycle2.startDate.getTime() - cycle1.startDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      expect(dayDiff).toBe(14);
    });

    it('should handle QUARTERLY frequency', () => {
      const startDate = new Date('2024-01-15');
      const cycle = createPhonePeCycle(BillingFrequency.QUARTERLY, startDate);

      const config = cycle.getConfig();
      expect(config.frequency).toBe('QUARTERLY');
    });

    it('should handle HALF_YEARLY frequency', () => {
      const startDate = new Date('2024-01-15');
      const cycle = createPhonePeCycle(BillingFrequency.HALF_YEARLY, startDate);

      const config = cycle.getConfig();
      expect(config.frequency).toBe('HALFYEARLY');
    });

    it('should handle YEARLY frequency', () => {
      const startDate = new Date('2024-01-15');
      const cycle = createPhonePeCycle(BillingFrequency.YEARLY, startDate);

      const config = cycle.getConfig();
      expect(config.frequency).toBe('YEARLY');
    });
  });
});

describe('createPhonePeCycleFromFrequency', () => {
  it('should create cycle from PhonePe frequency string', () => {
    const startDate = new Date('2024-01-15');
    const cycle = createPhonePeCycleFromFrequency('MONTHLY' as PhonePeFrequency, startDate);

    const config = cycle.getConfig();
    expect(config.frequency).toBe('MONTHLY');
  });
});
