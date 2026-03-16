import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import {
  USER_TYPES,
  DEEPLINK_CAMPAIGNS,
  UserType,
  DeeplinkCampaign,
} from './config.data';
import { PaywallEngineService } from './paywall-engine.service';
import {
  getSafeConfigForAppId,
  ConfigSyncError,
} from '../../common/config/config-validator';

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
   * Get simple configuration for a specific app (original v2 logic)
   *
   * @throws NotFoundException - If app is not registered (guard should prevent this)
   * @throws ConfigSyncError - If app is registered but config is missing (500 error)
   */
  getConfigSimple(appId: string): Record<string, any> {
    try {
      const config = getSafeConfigForAppId(appId);

      if (!config) {
        // This should not happen if guard is working correctly
        throw new NotFoundException(
          `App "${appId}" is not registered. Please register the app first.`,
        );
      }

      return config;
    } catch (error) {
      // Re-throw ConfigSyncError (500) as-is
      if (
        error instanceof ConfigSyncError ||
        error.name === 'ConfigSyncError'
      ) {
        throw error;
      }
      throw error;
    }
  }

  /**
   * Get configuration for a specific app with dynamic paywall based on context
   *
   * @throws NotFoundException - If app is not registered (guard should prevent this)
   * @throws ConfigSyncError - If app is registered but config is missing (500 error)
   */
  async getConfig(
    appId: string,
    context: PaywallContext,
  ): Promise<Record<string, any>> {
    try {
      const config = getSafeConfigForAppId(appId);

      if (!config) {
        // This should not happen if guard is working correctly
        throw new NotFoundException(
          `App "${appId}" is not registered. Please register the app first.`,
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
    } catch (error) {
      // Re-throw ConfigSyncError (500) as-is
      if (
        error instanceof ConfigSyncError ||
        error.name === 'ConfigSyncError'
      ) {
        throw error;
      }
      throw error;
    }
  }

  /**
   * Legacy method for backward compatibility
   * @deprecated Use getConfig with PaywallContext instead
   *
   * @throws NotFoundException - If app is not registered
   * @throws ConfigSyncError - If app is registered but config is missing (500 error)
   */
  getConfigLegacy(appId: string, user: any): Record<string, any> {
    try {
      const config = getSafeConfigForAppId(appId);

      if (!config) {
        throw new NotFoundException(
          `App "${appId}" is not registered. Please register the app first.`,
        );
      }

      // Deep clone the config to avoid mutating the original
      const dynamicConfig = JSON.parse(JSON.stringify(config));

      // Default context
      let userType: UserType = USER_TYPES.NEW;
      let deeplink: DeeplinkCampaign = DEEPLINK_CAMPAIGNS.NONE;

      // Map legacy user properties to new context
      if (user) {
        if (
          user.userType &&
          Object.values(USER_TYPES).includes(user.userType)
        ) {
          userType = user.userType;
        }
        if (
          user.deeplink &&
          Object.values(DEEPLINK_CAMPAIGNS).includes(user.deeplink)
        ) {
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
    } catch (error) {
      // Re-throw ConfigSyncError (500) as-is
      if (
        error instanceof ConfigSyncError ||
        error.name === 'ConfigSyncError'
      ) {
        throw error;
      }
      throw error;
    }
  }

  /**
   * Simplified plan selection for legacy synchronous calls
   */
  private getLegacyPlan(userType: UserType, deeplink: DeeplinkCampaign) {
    const { PAYWALL_PLANS } = require('./config.data');

    // Priority: Deeplink > User Type
    if (
      deeplink === DEEPLINK_CAMPAIGNS.MARKETING_50_PERCENT ||
      deeplink === DEEPLINK_CAMPAIGNS.SEASONAL
    ) {
      return PAYWALL_PLANS.MARKETING_CAMPAIGN;
    }

    if (deeplink === DEEPLINK_CAMPAIGNS.REFERRAL) {
      return PAYWALL_PLANS.NEW_USER_WELCOME;
    }

    if (
      deeplink === DEEPLINK_CAMPAIGNS.RETARGETING &&
      userType === USER_TYPES.CHURNED
    ) {
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
