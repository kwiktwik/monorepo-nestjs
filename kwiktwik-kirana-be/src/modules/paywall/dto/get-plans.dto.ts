import { IsOptional, IsString, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetPlansDto {
  @ApiPropertyOptional({
    description: 'Filter by plan ID',
    example: 'plan_S3FaBrk7sjPQEU',
  })
  @IsOptional()
  @IsString()
  plan_id?: string;
}

export class GetPaywallConfigDto {
  @ApiPropertyOptional({
    description: 'Language for localized content',
    example: 'en',
  })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({
    description: 'Filter by plan type',
    enum: ['ONE_TIME', 'SUBSCRIPTION'],
  })
  @IsOptional()
  @IsIn(['ONE_TIME', 'SUBSCRIPTION'])
  type?: 'ONE_TIME' | 'SUBSCRIPTION';
}

// ------------------------------------------------------------------
// Plan metadata shape (stored in plans.metadata JSONB)
// ------------------------------------------------------------------

export interface PlanDisplayMetadata {
  /** Hero title above features, e.g. "Get Premium for unlimited photos" */
  title?: string;
  /** Display price in rupees (e.g. 399.0). Derived from amount if not set */
  price?: number;
  /** Per-month breakdown price (e.g. 33.25). Hidden on client if null */
  pricePerMonth?: number;
  /** Feature checklist rows below the title */
  features?: string[];
  /** Green pill badge above plan card, e.g. "Cheapest Limited Period Offer". Hidden if null */
  badge?: string;
  /** Full-screen background image URL. Client falls back to default if null */
  backgroundImageUrl?: string;
  /** CTA button label, e.g. "Unlock full experience" */
  ctaText?: string;
  /** Whether this plan is the primary/popular one */
  isPopular?: boolean;
  /** Sort order (lower = first). Default 0 */
  sortOrder?: number;
  /** Per-language overrides keyed by language code */
  i18n?: Record<
    string,
    {
      name?: string;
      title?: string;
      ctaText?: string;
      badge?: string;
      features?: string[];
    }
  >;
}

// ------------------------------------------------------------------
// Paywall API response — flat shape matching mobile app contract
// ------------------------------------------------------------------

export interface PaywallPlanResponse {
  /** Internal plan ID, e.g. "yearly_399" */
  id: string;
  /** Plan card title + fallback for hero title */
  name: string;
  /** Hero title above features. Falls back to name if null */
  title: string | null;
  /** Display price in rupees, e.g. 399.0 */
  price: number;
  /** Currency code, e.g. "INR" */
  currency: string;
  /** Billing interval for analytics, e.g. "yearly", "monthly", "one_time" */
  interval: string;
  /** Per-month breakdown, e.g. 33.25. Null if not applicable */
  pricePerMonth: number | null;
  /** Amount in paise sent to payment gateway */
  amountInPaise: number;
  /** Feature checklist rows below the title */
  features: string[];
  /** Green pill badge above the plan card. Null = hidden */
  badge: string | null;
  /** Full-screen background image URL. Null = use default */
  backgroundImageUrl: string | null;
  /** CTA button label */
  ctaText: string;
  /** Whether this is the primary/popular plan */
  isPopular: boolean;
}

export interface PaywallScreenConfig {
  heading: string;
  subheading: string;
  videoUrl: string | null;
  footerText: string | null;
}

export interface PaywallConfigResponse {
  screen: PaywallScreenConfig;
  plans: PaywallPlanResponse[];
}