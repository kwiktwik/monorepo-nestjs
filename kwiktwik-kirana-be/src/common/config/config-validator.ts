import { REGISTERED_APPS, getRegisteredAppIds } from './apps.config';
import {
  APP_CONFIGS,
  getConfigForAppId,
  AppConfigData,
} from '../../modules/config/config.data';
import { Logger, InternalServerErrorException } from '@nestjs/common';
import { validateAppConfig, validateAllAppConfigs } from './config.schemas';

const logger = new Logger('ConfigValidator');

/**
 * Validation result for config synchronization check
 */
export interface ConfigValidationResult {
  valid: boolean;
  missingConfigs: string[];
  registeredApps: string[];
  configuredApps: string[];
  schemaValidation?: {
    valid: boolean;
    validApps: string[];
    invalidApps: { appId: string; errors: string[] }[];
  };
}

/**
 * Custom error class for config sync issues
 * This helps distinguish between "app not found" (404) and "server misconfiguration" (500)
 */
export class ConfigSyncError extends InternalServerErrorException {
  constructor(appId: string) {
    super(
      `Server configuration error: App "${appId}" passed authentication (registered in REGISTERED_APPS) ` +
        `but has no corresponding config entry in APP_CONFIGS. ` +
        `This is a server misconfiguration. Please add the app config in src/modules/config/config.data.ts`,
      'ConfigSyncError',
    );
  }
}

/**
 * Validates that all registered apps have corresponding config entries
 * This ensures the guard and service layers stay in sync
 */
export function validateAppConfigSync(): ConfigValidationResult {
  const registeredAppIds = getRegisteredAppIds();
  const configuredAppIds = Object.keys(APP_CONFIGS);

  const missingConfigs = registeredAppIds.filter(
    (appId) => !APP_CONFIGS[appId as keyof typeof APP_CONFIGS],
  );

  // Also validate schema for all configured apps
  const schemaValidation = validateAllAppConfigs(
    APP_CONFIGS as Record<string, unknown>,
  );

  return {
    valid: missingConfigs.length === 0 && schemaValidation.valid,
    missingConfigs,
    registeredApps: registeredAppIds,
    configuredApps: configuredAppIds,
    schemaValidation,
  };
}

/**
 * Validates config sync and throws detailed error if invalid
 * Use this during application bootstrap to fail fast
 */
export function validateAppConfigSyncOrThrow(): void {
  const result = validateAppConfigSync();

  if (!result.valid) {
    const errors: string[] = [];

    if (result.missingConfigs.length > 0) {
      errors.push(
        'Missing config entries for registered apps:',
        ...result.missingConfigs.map((id) => `  - ${id}`),
      );
    }

    if (result.schemaValidation && !result.schemaValidation.valid) {
      errors.push('', 'Schema validation errors:');
      for (const invalid of result.schemaValidation.invalidApps) {
        errors.push(`  - ${invalid.appId}:`);
        for (const err of invalid.errors) {
          errors.push(`      ${err}`);
        }
      }
    }

    const errorMessage = [
      'Configuration Error: App configuration validation failed',
      ...errors,
      '',
      'To fix this, add config entries for these apps in:',
      '  src/modules/config/config.data.ts',
      '',
      'All registered apps in REGISTERED_APPS must have corresponding entries in APP_CONFIGS.',
      'This ensures the AppIdGuard (authentication) and ConfigService (data) stay synchronized.',
    ].join('\n');

    logger.error(errorMessage);
    throw new Error(errorMessage);
  }

  logger.log(
    `✅ Config sync validated: ${result.registeredApps.length} apps registered and configured`,
  );
}

/**
 * Type-safe config getter that guarantees config exists for registered apps
 * Returns null for unregistered apps (guard should reject these)
 * Throws 500 error if registered app has no config (server misconfiguration)
 */
export function getSafeConfigForAppId(appId: string): AppConfigData | null {
  // Check if app is registered (guard layer)
  if (!REGISTERED_APPS[appId]) {
    return null;
  }

  // Get config (service layer)
  const config = getConfigForAppId(appId);

  // If registered but no config, this is a server misconfiguration
  if (!config) {
    throw new ConfigSyncError(appId);
  }

  // Validate schema at runtime using Zod
  const validation = validateAppConfig(config, appId);
  if (!validation.success) {
    logger.warn(
      `Schema validation warnings for ${appId}: ${validation.errors.join(', ')}`,
    );
    // Don't throw for schema warnings, just log them
    // This allows partial configs during development
  }

  return config;
}

/**
 * Check if there's a config sync mismatch
 * Useful for health checks and monitoring
 */
export function hasConfigSyncMismatch(): boolean {
  return !validateAppConfigSync().valid;
}
