import { Injectable, Logger } from '@nestjs/common';
import { Engine, Rule } from 'json-rules-engine';
import {
  PAYWALL_RULES,
  PAYWALL_PLANS,
  USER_TYPES,
  DEEPLINK_CAMPAIGNS,
  UserType,
  DeeplinkCampaign,
  PlanType,
} from './config.data';

export interface PaywallContext {
  appId: string;
  userType: UserType;
  deeplink: DeeplinkCampaign;
}

export interface PaywallResult {
  plan: (typeof PAYWALL_PLANS)[PlanType];
  reason: string;
  ruleName: string;
}

@Injectable()
export class PaywallEngineService {
  private readonly logger = new Logger(PaywallEngineService.name);
  private engine: Engine;

  constructor() {
    this.engine = new Engine();
    this.initializeRules();
  }

  private initializeRules() {
    // Add all rules from configuration with proper Rule instances
    for (const ruleConfig of PAYWALL_RULES) {
      const rule = new Rule(ruleConfig as any);
      this.engine.addRule(rule);
    }
    this.logger.log(`Initialized ${PAYWALL_RULES.length} paywall rules`);
  }

  /**
   * Determine the appropriate paywall plan based on context
   */
  async determinePlan(context: PaywallContext): Promise<PaywallResult> {
    const { appId, userType, deeplink } = context;

    this.logger.debug(
      `Determining plan for appId: ${appId}, userType: ${userType}, deeplink: ${deeplink}`,
    );

    // Run the rules engine
    const results = await this.engine.run({
      appId,
      userType,
      deeplink,
    });

    // Get all triggered events
    const events = results.events;

    if (events.length === 0) {
      // Fallback to standard plan
      this.logger.warn('No rules matched, falling back to standard plan');
      return {
        plan: PAYWALL_PLANS.STANDARD,
        reason: 'No matching rule found',
        ruleName: 'fallback',
      };
    }

    // Sort events by priority (higher priority first) and return the best match
    // The engine returns events in the order rules were added, so we need to sort
    const sortedEvents = events.sort((a, b) => {
      const priorityA = (a.params as any)?.priority || 0;
      const priorityB = (b.params as any)?.priority || 0;
      return priorityB - priorityA;
    });

    const matchedEvent = sortedEvents[0];
    const plan = matchedEvent?.params?.plan;
    const reason = matchedEvent?.params?.reason;
    const ruleName = matchedEvent?.type || 'unknown';

    this.logger.log(`Matched rule: ${ruleName}, Plan: ${plan?.plan_id}`);

    return {
      plan,
      reason,
      ruleName,
    };
  }

  /**
   * Get all available plans for reference
   */
  getAllPlans(): typeof PAYWALL_PLANS {
    return PAYWALL_PLANS;
  }

  /**
   * Get all user types for reference
   */
  getUserTypes(): typeof USER_TYPES {
    return USER_TYPES;
  }

  /**
   * Get all deeplink campaigns for reference
   */
  getDeeplinkCampaigns(): typeof DEEPLINK_CAMPAIGNS {
    return DEEPLINK_CAMPAIGNS;
  }
}
