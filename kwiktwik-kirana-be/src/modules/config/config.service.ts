import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { getConfigForAppId, USER_TYPES, DEEPLINK_CAMPAIGNS, UserType, DeeplinkCampaign } from './config.data';
import { PaywallEngineService } from './paywall-engine.service';

export interface PaywallContext {
  appId: string;
  userType: UserType;
  deeplink: DeeplinkCampaign;
}

@Injectable()
export class ConfigService {
  private readonly logger = new Logger(ConfigService.name);

  constructor(private readonly paywallEngine: PaywallEngineService) {}

  /**
   * Get configuration for a specific app with dynamic paywall based on context
   */
  async getConfig(appId: string, context: PaywallContext): Promise<Record<string, any>> {
    const config = getConfigForAppId(appId);

    if (!config) {
      throw new NotFoundException(
        `Configuration not found for app ID: ${appId}`,
      );
    }

    // Deep clone the config to avoid mutating the original
    const dynamicConfig = JSON.parse(JSON.stringify(config));

    // Use the rules engine to determine the appropriate plan
    const paywallResult = await this.paywallEngine.determinePlan(context);

    this.logger.log(
      `App: ${appId}, User: ${context.userType}, Deeplink: ${context.deeplink} -> Plan: ${paywallResult.plan.plan_id} (${paywallResult.ruleName})`,
    );

    // Update the config with the selected plan
    dynamicConfig.features.subscription.plan_id = paywallResult.plan.plan_id;
    dynamicConfig.ui.paywall.pricing = paywallResult.plan.pricing;
    dynamicConfig.ui.paywall.heading = paywallResult.plan.heading;
    dynamicConfig.ui.paywall.description = paywallResult.plan.description;
    dynamicConfig.ui.paywall.buttonText = paywallResult.plan.buttonText;

    // Add metadata about why this plan was selected
    dynamicConfig._paywallMeta = {
      ruleName: paywallResult.ruleName,
      reason: paywallResult.reason,
      context: {
        appId: context.appId,
        userType: context.userType,
        deeplink: context.deeplink,
      },
    };

    return dynamicConfig;
  }

  /**
   * Legacy method for backward compatibility
   * @deprecated Use getConfig with PaywallContext instead
   */
  getConfigLegacy(appId: string, user: any): Record<string, any> {
    const config = getConfigForAppId(appId);

    if (!config) {
      throw new NotFoundException(
        `Configuration not found for app ID: ${appId}`,
      );
    }

    // Deep clone the config to avoid mutating the original
    const dynamicConfig = JSON.parse(JSON.stringify(config));

    // Default context
    let userType: UserType = USER_TYPES.NEW;
    let deeplink: DeeplinkCampaign = DEEPLINK_CAMPAIGNS.NONE;

    // Map legacy user properties to new context
    if (user) {
      if (user.userType && Object.values(USER_TYPES).includes(user.userType)) {
        userType = user.userType;
      }
      if (user.deeplink && Object.values(DEEPLINK_CAMPAIGNS).includes(user.deeplink)) {
        deeplink = user.deeplink;
      }
    }

    // For synchronous compatibility, use a simplified mapping
    // In production, this should use the async paywall engine
    const selectedPlan = this.getLegacyPlan(userType, deeplink);

    dynamicConfig.features.subscription.plan_id = selectedPlan.plan_id;
    dynamicConfig.ui.paywall.pricing = selectedPlan.pricing;
    dynamicConfig.ui.paywall.heading = selectedPlan.heading;
    dynamicConfig.ui.paywall.description = selectedPlan.description;
    dynamicConfig.ui.paywall.buttonText = selectedPlan.buttonText;

    return dynamicConfig;
  }

  /**
   * Simplified plan selection for legacy synchronous calls
   */
  private getLegacyPlan(userType: UserType, deeplink: DeeplinkCampaign) {
    const { PAYWALL_PLANS } = require('./config.data');

    // Priority: Deeplink > User Type
    if (deeplink === DEEPLINK_CAMPAIGNS.MARKETING_50_PERCENT || 
        deeplink === DEEPLINK_CAMPAIGNS.SEASONAL) {
      return PAYWALL_PLANS.MARKETING_CAMPAIGN;
    }

    if (deeplink === DEEPLINK_CAMPAIGNS.REFERRAL) {
      return PAYWALL_PLANS.NEW_USER_WELCOME;
    }

    if (deeplink === DEEPLINK_CAMPAIGNS.RETARGETING && userType === USER_TYPES.CHURNED) {
      return PAYWALL_PLANS.ABANDONED_CHECKOUT;
    }

    // User type based
    switch (userType) {
      case USER_TYPES.ABANDONED:
        return PAYWALL_PLANS.ABANDONED_CHECKOUT;
      case USER_TYPES.TRIAL_EXPIRED:
        return PAYWALL_PLANS.TRIAL_EXPIRED;
      case USER_TYPES.CHURNED:
      case USER_TYPES.EXPIRED:
        return PAYWALL_PLANS.LOYAL_USER;
      case USER_TYPES.NEW:
        return PAYWALL_PLANS.NEW_USER_WELCOME;
      default:
        return PAYWALL_PLANS.STANDARD;
    }
  }
}
