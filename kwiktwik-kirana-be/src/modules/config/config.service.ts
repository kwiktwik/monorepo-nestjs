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
  plan_id?: string;
  language?: string;
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

      let paywallResult;

      // If plan_id is provided, use that plan directly
      if (context.plan_id) {
        const { PAYWALL_PLANS } = require('./config.data');
        const planEntry = Object.entries(PAYWALL_PLANS).find(
          ([, plan]: [string, any]) => plan.plan_id === context.plan_id,
        );

        if (planEntry) {
          const [planName, plan] = planEntry;
          paywallResult = {
            plan: plan as (typeof PAYWALL_PLANS)['PHONEPE_AUTOPAY'],
            reason: `Direct plan selection: ${planName}`,
            ruleName: 'direct_plan_selection',
          };
          this.logger.log(
            `App: ${appId}, Plan ID: ${context.plan_id} -> Direct plan selection: ${planName}`,
          );
        } else {
          // Fallback to rules engine if plan_id not found
          this.logger.warn(
            `Plan ID ${context.plan_id} not found, falling back to rules engine`,
          );
          paywallResult = await this.paywallEngine.determinePlan(context);
        }
      } else {
        // Use the rules engine to determine the appropriate plan
        paywallResult = await this.paywallEngine.determinePlan(context);
      }

      this.logger.log(
        `App: ${appId}, User: ${context.userType}, Deeplink: ${context.deeplink} -> Plan: ${paywallResult.plan.plan_id} (${paywallResult.ruleName})`,
      );

      // Get translations for the requested language
      const { PAYWALL_TRANSLATIONS } = require('./config.data');
      const language = context.language || 'en';
      const translations =
        PAYWALL_TRANSLATIONS[language] || PAYWALL_TRANSLATIONS.en;

      // Update the config with the selected plan
      dynamicConfig.features.subscription.plan_id = paywallResult.plan.plan_id;
      dynamicConfig.ui.paywall.pricing = paywallResult.plan.pricing;

      // Use localized strings
      dynamicConfig.ui.paywall.heading = translations.heading;
      dynamicConfig.ui.paywall.description = translations.description;
      dynamicConfig.ui.paywall.buttonText = translations.buttonText;

      // Include video description if needed by the frontend
      dynamicConfig.ui.paywall.videoDescription = translations.videoDescription;

      // Add metadata about why this plan was selected
      dynamicConfig._paywallMeta = {
        ruleName: paywallResult.ruleName,
        reason: paywallResult.reason,
        context: {
          appId: context.appId,
          userType: context.userType,
          deeplink: context.deeplink,
          plan_id: context.plan_id,
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
   * Get configuration v4 with unified plan structure
   * Works for both PhonePe (local) and Razorpay (provider-fetched) plans
   * Backend controls plan selection, but client can override with plan_id
   *
   * @throws NotFoundException - If app is not registered or plan not found
   * @throws ConfigSyncError - If app is registered but config is missing (500 error)
   */
  async getConfigV4(
    appId: string,
    planId: string | undefined,
    language: string = 'en',
    user?: any,
  ): Promise<Record<string, any>> {
    try {
      const config = getSafeConfigForAppId(appId);

      if (!config) {
        throw new NotFoundException(
          `App "${appId}" is not registered. Please register the app first.`,
        );
      }

      // Deep clone the config to avoid mutating the original
      const dynamicConfig = JSON.parse(JSON.stringify(config));

      // Import unified plans
      const { getUnifiedPlan, UNIFIED_PLANS } = require('./config.data');

      let selectedPlanId: string;
      let planSelectionSource: string;

      if (planId) {
        // Client provided plan_id - use it as override
        selectedPlanId = planId;
        planSelectionSource = 'client_override';
      } else {
        // Backend defaults to Razorpay plan
        selectedPlanId = 'plan_S3FaBrk7sjPQEU';
        planSelectionSource = 'backend_default:razorpay';
      }

      // Get the unified plan
      const unifiedPlan = getUnifiedPlan(selectedPlanId);

      if (!unifiedPlan) {
        this.logger.warn(
          `Config v4: Invalid plan_id="${selectedPlanId}" requested for app="${appId}". Source=${planSelectionSource}. Available plans: ${Object.keys(UNIFIED_PLANS).join(', ')}`,
        );
        throw new NotFoundException(
          `Plan "${selectedPlanId}" not found. Available plans: ${Object.keys(UNIFIED_PLANS).join(', ')}`,
        );
      }

      this.logger.log(
        `Config v4: App=${appId}, Plan=${selectedPlanId}, Provider=${unifiedPlan.provider}, Source=${planSelectionSource}`,
      );

      // Get translations for the requested language
      const { PAYWALL_TRANSLATIONS } = require('./config.data');
      const translations =
        PAYWALL_TRANSLATIONS[language] || PAYWALL_TRANSLATIONS.en;

      // Update the config with unified plan structure
      dynamicConfig.features.subscription = {
        ...dynamicConfig.features.subscription,
        plan_id: unifiedPlan.plan_id,
        provider: unifiedPlan.provider,
      };

      // Add unified plan details
      dynamicConfig.features.subscription.planDetails = {
        plan_id: unifiedPlan.plan_id,
        provider: unifiedPlan.provider,
        pricing: unifiedPlan.localConfig?.pricing,
        providerConfig: unifiedPlan.providerConfig,
      };

      // Update UI paywall
      if (unifiedPlan.localConfig) {
        dynamicConfig.ui.paywall = {
          ...dynamicConfig.ui.paywall,
          heading: unifiedPlan.localConfig.heading,
          description: unifiedPlan.localConfig.description,
          buttonText: unifiedPlan.localConfig.buttonText,
          pricing: unifiedPlan.localConfig.pricing,
        };
      }

      // Use localized strings
      dynamicConfig.ui.paywall.heading = translations.heading;
      dynamicConfig.ui.paywall.description = translations.description;
      dynamicConfig.ui.paywall.buttonText = translations.buttonText;
      dynamicConfig.ui.paywall.videoDescription = translations.videoDescription;

      // Add metadata
      dynamicConfig._paywallMeta = {
        version: 'v4',
        plan_id: unifiedPlan.plan_id,
        provider: unifiedPlan.provider,
        language,
        selectionSource: planSelectionSource,
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

      // Mapping legacy user properties to new context
      const language = user?.language || 'en';
      const { PAYWALL_TRANSLATIONS } = require('./config.data');
      const translations =
        PAYWALL_TRANSLATIONS[language] || PAYWALL_TRANSLATIONS.en;

      dynamicConfig.features.subscription.plan_id = selectedPlan.plan_id;
      dynamicConfig.ui.paywall.pricing = selectedPlan.pricing;

      // Use localized strings
      dynamicConfig.ui.paywall.heading = translations.heading;
      dynamicConfig.ui.paywall.description = translations.description;
      dynamicConfig.ui.paywall.buttonText = translations.buttonText;

      // Include video description
      dynamicConfig.ui.paywall.videoDescription = translations.videoDescription;

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
