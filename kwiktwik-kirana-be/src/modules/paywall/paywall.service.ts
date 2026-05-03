import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';
import { DRIZZLE_TOKEN } from '../../database/drizzle.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { and, eq, SQL } from 'drizzle-orm';
import {
  plans,
  type Plan,
} from '../payment-gateway/database/schema';
import * as schema from '../../database/schema';
import type {
  PlanDisplayMetadata,
  PaywallPlanResponse,
  PaywallConfigResponse,
  PaywallScreenConfig,
} from './dto/get-plans.dto';
import type { AppSettings } from '../app-config/types/app-config.types';

export type PlanTypeFilter = 'ONE_TIME' | 'SUBSCRIPTION';

const FREQUENCY_TO_INTERVAL: Record<string, string> = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  BIWEEKLY: 'biweekly',
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  SEMIANNUALLY: 'semiannually',
  YEARLY: 'yearly',
  ONDEMAND: 'ondemand',
  ONE_TIME: 'one_time',
};

@Injectable()
export class PaywallService {
  private readonly logger = new Logger(PaywallService.name);

  constructor(
    @Inject(DRIZZLE_TOKEN)
    private readonly db: NodePgDatabase,
  ) {}

  // ------------------------------------------------------------------
  // Existing raw-data endpoints (unchanged)
  // ------------------------------------------------------------------

  async getPlans(appId: string, planType?: PlanTypeFilter): Promise<Plan[]> {
    this.logger.debug(
      `Fetching active plans for appId: ${appId}, planType: ${planType ?? 'all'}`,
    );

    const conditions: SQL[] = [
      eq(plans.appId, appId),
      eq(plans.isActive, true),
    ];

    if (planType) {
      conditions.push(eq(plans.planType, planType));
    }

    const rows = await this.db
      .select()
      .from(plans)
      .where(and(...conditions));

    return rows;
  }

  async getPlanById(appId: string, planId: string): Promise<Plan> {
    this.logger.debug(`Fetching plan ${planId} for appId: ${appId}`);

    const rows = await this.db
      .select()
      .from(plans)
      .where(and(eq(plans.id, planId), eq(plans.appId, appId)));

    if (rows.length === 0) {
      throw new NotFoundException(`Plan ${planId} not found for app ${appId}`);
    }

    return rows[0];
  }

  // ------------------------------------------------------------------
  // Backend-driven paywall config
  // ------------------------------------------------------------------

  /**
   * Returns the full paywall configuration: screen-level text + all
   * active plans with display metadata. The client renders entirely
   * from this response — no hardcoded plan data needed.
   */
  async getPaywallConfig(
    appId: string,
    language: string = 'en',
    planType?: PlanTypeFilter,
  ): Promise<PaywallConfigResponse> {
    const [rawPlans, screenConfig] = await Promise.all([
      this.getPlans(appId, planType),
      this.getScreenConfig(appId, language),
    ]);

    const sorted = [...rawPlans].sort((a, b) => {
      const orderA = ((a.metadata ?? {}) as PlanDisplayMetadata).sortOrder ?? 0;
      const orderB = ((b.metadata ?? {}) as PlanDisplayMetadata).sortOrder ?? 0;
      return orderA - orderB;
    });

    const planResponses = sorted.map((p) => this.toPlanResponse(p, language));

    return {
      screen: screenConfig,
      plans: planResponses,
    };
  }

  // ------------------------------------------------------------------
  // Private helpers
  // ------------------------------------------------------------------

  private toPlanResponse(plan: Plan, language: string): PaywallPlanResponse {
    const meta = (plan.metadata ?? {}) as PlanDisplayMetadata;
    const loc = meta.i18n?.[language];

    const amountInPaise = plan.amount ?? plan.initialAmount;
    const price = meta.price ?? amountInPaise / 100;
    const interval = FREQUENCY_TO_INTERVAL[plan.frequency] ?? 'one_time';

    return {
      id: plan.id,
      name: loc?.name ?? plan.name,
      title: loc?.title ?? meta.title ?? null,
      price,
      currency: plan.currency,
      interval,
      pricePerMonth: meta.pricePerMonth ?? null,
      amountInPaise,
      features: loc?.features ?? meta.features ?? [],
      badge: loc?.badge ?? meta.badge ?? null,
      backgroundImageUrl: meta.backgroundImageUrl ?? null,
      ctaText: loc?.ctaText ?? meta.ctaText ?? 'Buy Now',
      isPopular: meta.isPopular ?? false,
    };
  }

  /**
   * Fetch screen-level paywall text from the app settings.
   * Falls back to sensible defaults if not configured.
   */
  private async getScreenConfig(
    appId: string,
    language: string,
  ): Promise<PaywallScreenConfig> {
    const rows = await this.db
      .select()
      .from(schema.apps)
      .where(eq(schema.apps.id, appId))
      .limit(1);

    const settings = (rows[0]?.settings ?? {}) as AppSettings;
    const translations = settings.translations?.[language] ??
      settings.translations?.['en'];
    const videoUrl =
      settings.videos?.[language]?.paywall_video ??
      settings.videos?.['en']?.paywall_video ??
      null;

    return {
      heading: translations?.heading ?? 'Upgrade to Premium',
      subheading: translations?.description ?? 'Choose a plan that works for you',
      videoUrl,
      footerText: translations?.videoDescription ?? null,
    };
  }
}