import { z } from 'zod';

/**
 * Zod schemas for config validation
 * Provides runtime type checking and better error messages
 */

// App metadata schema
const AppMetadataSchema = z.object({
  name: z.string().min(1, 'App name is required'),
  version: z.string().default('1.0.0'),
  environment: z.string().default('development'),
  id: z.string().min(1, 'App ID is required'),
});

// Subscription config schema
const SubscriptionConfigSchema = z.object({
  plan_id: z.string().min(1, 'Plan ID is required'),
  trial_plan_id: z.string().optional(),
  segment_plans: z.record(z.string(), z.string()).optional(),
});

// Features schema
const FeaturesSchema = z.object({
  subscription: SubscriptionConfigSchema,
  gateway: z.enum(['RAZORPAY', 'PHONEPE', 'STRIPE']).default('RAZORPAY'),
  order: z.object({
    amount: z.number().positive(),
    currency: z.string().default('INR'),
    payment_method: z.string().default('upi'),
    isRecurring: z.boolean().default(true),
    token: z.object({
      frequency: z.string(),
      max_amount: z.number().positive(),
      expire_at: z.number().positive(),
    }),
  }),
  otpLogin: z.boolean().default(true),
  truecallerLogin: z.boolean().default(true),
  googleLogin: z.boolean().default(true),
});

// Limits schema
const LimitsSchema = z.object({
  maxOrdersPerDay: z.number().nullable().default(null),
  maxOrdersPerMonth: z.number().nullable().default(null),
  maxRecurringOrders: z.number().nullable().default(null),
});

// Paywall schema
const PaywallSchema = z.object({
  pricing: z.object({
    initialAmount: z.string(),
    recurringAmount: z.string(),
    period: z.string(),
  }),
  heading: z.string(),
  description: z.string(),
  videoUrl: z.string().url().optional(),
  buttonText: z.string(),
});

// UI schema
const UISchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).default('light'),
  supportedLanguages: z
    .array(z.string())
    .min(1, 'At least one language required'),
  defaultLanguage: z.string().default('en'),
  paywall: PaywallSchema,
});

// API schema
const APISchema = z.object({
  timeout: z.number().positive().default(30000),
  retryAttempts: z.number().nonnegative().default(3),
});

// App update schema
const AppUpdateSchema = z.object({
  enabled: z.boolean().default(false),
  forceUpdate: z.boolean().default(false),
  minVersion: z.string().default('1.0.0'),
  latestVersion: z.string().default('1.0.0'),
  updateUrl: z.string().url().optional().or(z.literal('')),
  updateTitle: z.string().default('Update Available'),
  updateMessage: z.string(),
});

// Videos schema - more lenient for URL-encoded strings
const VideoConfigSchema = z.object({
  fallback_video: z.string(),
  paywall_video: z.string(),
});

const VideosSchema = z.record(z.string(), VideoConfigSchema);

// Main app config schema
export const AppConfigDataSchema = z.object({
  app: AppMetadataSchema,
  features: FeaturesSchema,
  limits: LimitsSchema,
  ui: UISchema,
  api: APISchema,
  appUpdate: AppUpdateSchema,
  videos: VideosSchema,
});

// Export types derived from schemas
export type AppConfigDataInput = z.input<typeof AppConfigDataSchema>;
export type AppConfigDataOutput = z.output<typeof AppConfigDataSchema>;

// Validation function
export function validateAppConfig(
  config: unknown,
  appId: string,
):
  | { success: true; data: AppConfigDataOutput }
  | { success: false; errors: string[] } {
  const result = AppConfigDataSchema.safeParse(config);

  if (result.success) {
    return { success: true, data: result.data };
  }

  // Handle ZodError - issues array in Zod 3.x/4.x
  const issues = (result.error as any).issues || [];
  const errors = issues.map(
    (err: any) => `${err.path.join('.')}: ${err.message}`,
  );

  return { success: false, errors };
}

// Validate all app configs
export function validateAllAppConfigs(configs: Record<string, unknown>): {
  valid: boolean;
  validApps: string[];
  invalidApps: { appId: string; errors: string[] }[];
} {
  const validApps: string[] = [];
  const invalidApps: { appId: string; errors: string[] }[] = [];

  for (const [appId, config] of Object.entries(configs)) {
    const result = validateAppConfig(config, appId);

    if (result.success) {
      validApps.push(appId);
    } else {
      invalidApps.push({ appId, errors: result.errors });
    }
  }

  return {
    valid: invalidApps.length === 0,
    validApps,
    invalidApps,
  };
}
