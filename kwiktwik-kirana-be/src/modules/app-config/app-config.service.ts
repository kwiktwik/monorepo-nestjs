import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';
import { DRIZZLE_TOKEN } from '../../database/drizzle.module';
import * as schema from '../../database/schema';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import type { AppConfigResponse, AppSettings, UnifiedPlanFromDb } from './types/app-config.types';

@Injectable()
export class AppConfigService {
  private readonly logger = new Logger(AppConfigService.name);

  constructor(
    @Inject(DRIZZLE_TOKEN)
    private db: NodePgDatabase<typeof schema>,
  ) {}

  /**
   * Get app configuration v1 (database-driven)
   * Similar to /api/config/v4 but fetches all data from database
   */
  async getConfig(
    appId: string,
    planId: string | undefined,
    language: string = 'en',
  ): Promise<AppConfigResponse> {
    // 1. Fetch app from database
    const app = await this.getAppFromDb(appId);
    if (!app) {
      throw new NotFoundException(`App "${appId}" is not registered`);
    }

    // 2. Parse app settings
    const settings = (app.settings || {}) as AppSettings;

    // 3. Determine which plan to use
    const selectedPlanId = planId || settings.features?.subscription?.plan_id || 'plan_S3FaBrk7sjPQEU';
    const planSelectionSource = planId ? 'client_override' : 'backend_default';

    // 4. Fetch plan from database
    const plan = await this.getPlanFromDb(selectedPlanId);
    if (!plan) {
      throw new NotFoundException(`Plan "${selectedPlanId}" not found`);
    }

    this.logger.log(
      `Config v1: App=${appId}, Plan=${selectedPlanId}, Provider=${this.getProviderFromPlan(plan)}, Source=${planSelectionSource}`,
    );

    // 5. Get translations for the requested language
    const translations = settings.translations?.[language] || settings.translations?.['en'] || {
      heading: 'Never miss a payment',
      description: 'Start your free trial',
      buttonText: 'Start free trial',
      videoDescription: 'Autopay subscription, cancel anytime',
    };

    // 6. Get plan display content from plan metadata
    const planMetadata = (plan.metadata || {}) as Record<string, unknown>;
    const displayContent = planMetadata.displayContent as Record<string, string> || {};

    // 7. Format pricing amounts
    const initialAmountFormatted = this.formatAmount(plan.initialAmount);
    const recurringAmountFormatted = this.formatAmount(plan.recurringAmount);

    // 8. Build the config response (similar to v4 structure)
    const config: AppConfigResponse = {
      app: {
        name: app.name,
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        id: app.id,
      },
      features: {
        subscription: {
          plan_id: selectedPlanId,
          provider: this.getProviderFromPlan(plan),
          planDetails: {
            plan_id: selectedPlanId,
            provider: this.getProviderFromPlan(plan),
            pricing: {
              initialAmount: initialAmountFormatted,
              recurringAmount: recurringAmountFormatted,
              period: this.formatFrequency(plan.frequency),
            },
            providerConfig: this.extractProviderConfig(plan),
          },
        },
        otpLogin: settings.features?.otpLogin ?? true,
        truecallerLogin: settings.features?.truecallerLogin ?? true,
        googleLogin: settings.features?.googleLogin ?? true,
      },
      limits: {
        maxOrdersPerDay: settings.limits?.maxOrdersPerDay ?? null,
        maxOrdersPerMonth: settings.limits?.maxOrdersPerMonth ?? null,
        maxRecurringOrders: settings.limits?.maxRecurringOrders ?? null,
      },
      ui: {
        theme: settings.ui?.theme || 'light',
        supportedLanguages: settings.ui?.supportedLanguages || ['en', 'hi'],
        defaultLanguage: settings.ui?.defaultLanguage || 'en',
        paywall: {
          pricing: {
            initialAmount: initialAmountFormatted,
            recurringAmount: recurringAmountFormatted,
            period: this.formatFrequency(plan.frequency),
          },
          heading: translations.heading || displayContent.heading || 'Never miss a payment',
          description: translations.description || displayContent.description || `Start your free trial for <s>${recurringAmountFormatted}</s>`,
          videoUrl: settings.videos?.[language]?.paywall_video || settings.videos?.['en']?.paywall_video,
          buttonText: translations.buttonText || displayContent.buttonText || 'Start free trial',
          videoDescription: translations.videoDescription || displayContent.videoDescription || `Autopay ${recurringAmountFormatted} every month, cancel anytime`,
        },
      },
      videos: settings.videos || {},
      api: {
        timeout: settings.api?.timeout || 30000,
        retryAttempts: settings.api?.retryAttempts || 3,
      },
      appUpdate: {
        enabled: settings.appUpdate?.enabled ?? false,
        forceUpdate: settings.appUpdate?.forceUpdate ?? false,
        minVersion: settings.appUpdate?.minVersion || '1.0.0',
        latestVersion: settings.appUpdate?.latestVersion || '1.0.0',
        updateUrl: settings.appUpdate?.updateUrl || '',
        updateTitle: settings.appUpdate?.updateTitle || 'Update Available',
        updateMessage: settings.appUpdate?.updateMessage || 'A new version is available. Please update to continue.',
      },
      _paywallMeta: {
        version: 'v1',
        plan_id: selectedPlanId,
        provider: this.getProviderFromPlan(plan),
        language,
        selectionSource: planSelectionSource,
      },
    };

    return config;
  }

  /**
   * Fetch app from database
   */
  private async getAppFromDb(appId: string) {
    const result = await this.db
      .select()
      .from(schema.apps)
      .where(eq(schema.apps.id, appId))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Fetch plan from database
   */
  private async getPlanFromDb(planId: string) {
    // Import plans from payment-gateway schema
    const { plans } = await import('../payment-gateway/database/schema');
    
    const result = await this.db
      .select()
      .from(plans)
      .where(eq(plans.id, planId))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Get provider from plan (RAZORPAY or PHONEPE)
   */
  private getProviderFromPlan(plan: any): 'RAZORPAY' | 'PHONEPE' {
    const providerPlanIds = plan.providerPlanIds as Record<string, string> || {};
    
    // Check if it's a PhonePe plan based on providerPlanIds or plan ID prefix
    if (providerPlanIds.PHONEPE || plan.id?.startsWith('plan_PHONEPE')) {
      return 'PHONEPE';
    }
    
    // Default to RAZORPAY
    return 'RAZORPAY';
  }

  /**
   * Extract provider-specific config from plan
   */
  private extractProviderConfig(plan: any): Record<string, unknown> {
    const metadata = (plan.metadata || {}) as Record<string, unknown>;
    const providerPlanIds = (plan.providerPlanIds || {}) as Record<string, string>;
    const provider = this.getProviderFromPlan(plan);

    if (provider === 'PHONEPE') {
      return {
        provider: 'PHONEPE',
        maxAmount: plan.recurringAmount,
        frequency: plan.frequency,
        amountType: metadata.amountType || 'VARIABLE',
        authWorkflowType: metadata.authWorkflowType || 'TRANSACTION',
        upiPaymentMode: metadata.upiPaymentMode || 'UPI_INTENT',
        productType: metadata.productType || 'UPI_MANDATE',
      };
    }

    // RAZORPAY
    return {
      provider: 'RAZORPAY',
      razorpayPlanId: providerPlanIds.RAZORPAY || plan.id,
      interval: metadata.interval || 1,
      period: metadata.period || 'monthly',
    };
  }

  /**
   * Format amount from paise to rupees with symbol
   */
  private formatAmount(amountInPaise: number): string {
    const rupees = amountInPaise / 100;
    return `₹${rupees}`;
  }

  /**
   * Format frequency enum to readable string
   */
  private formatFrequency(frequency: string): string {
    const frequencyMap: Record<string, string> = {
      'DAILY': 'day',
      'WEEKLY': 'week',
      'BIWEEKLY': '2 weeks',
      'MONTHLY': 'month',
      'QUARTERLY': '3 months',
      'SEMIANNUALLY': '6 months',
      'YEARLY': 'year',
      'ONDEMAND': 'on demand',
    };
    return frequencyMap[frequency] || 'month';
  }
}
