import {
  Injectable,
  Inject,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { DRIZZLE_TOKEN } from '../../database/drizzle.module';
import * as schema from '../../database/schema';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and } from 'drizzle-orm';
import {
  REGISTERED_APPS,
  type AppConfig,
} from '../../common/config/apps.config';

// Infer type from schema
export type AppFromDb = typeof schema.apps.$inferSelect;

export interface SupportedAppResponse {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  features?: {
    otpLogin?: boolean;
    truecallerLogin?: boolean;
    googleLogin?: boolean;
  };
  settings: Record<string, any>;
}

@Injectable()
export class AppsService implements OnModuleInit {
  private readonly logger = new Logger(AppsService.name);

  // Cached apps from database (populated on startup)
  private cachedApps: Map<string, AppFromDb> = new Map();
  private cacheInitialized = false;

  constructor(
    @Inject(DRIZZLE_TOKEN)
    private db: NodePgDatabase<typeof schema>,
  ) {}

  /**
   * Fetch and cache apps from database on module initialization (server startup)
   */
  async onModuleInit(): Promise<void> {
    this.logger.log('Initializing apps cache from database...');
    await this.refreshCache();
  }

  /**
   * Refresh the apps cache from database
   * Call this manually if apps are updated in DB and you want immediate refresh
   */
  async refreshCache(): Promise<void> {
    try {
      const apps = await this.db.select().from(schema.apps);

      this.cachedApps.clear();
      for (const app of apps) {
        this.cachedApps.set(app.id, app as AppFromDb);
      }

      this.cacheInitialized = true;
      this.logger.log(
        `Apps cache refreshed: ${apps.length} apps loaded from database`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to fetch apps from database: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      this.logger.warn('Falling back to hardcoded REGISTERED_APPS constant');
      // Cache will remain empty or with old data, fallback methods will use REGISTERED_APPS
    }
  }

  /**
   * Get all apps (from cache, falls back to hardcoded if DB unavailable)
   */
  getAllApps(): AppFromDb[] | AppConfig[] {
    if (this.cacheInitialized && this.cachedApps.size > 0) {
      return Array.from(this.cachedApps.values());
    }

    // Fallback to hardcoded apps
    this.logger.debug('Using hardcoded REGISTERED_APPS as fallback');
    return Object.values(REGISTERED_APPS);
  }

  /**
   * Get only active/supported apps (from cache, falls back to hardcoded)
   * This is the main method for fetching supported apps
   */
  getSupportedApps(): SupportedAppResponse[] {
    // Try cache first
    if (this.cacheInitialized && this.cachedApps.size > 0) {
      return Array.from(this.cachedApps.values())
        .filter((app) => app.isActive)
        .map((app) => ({
          id: app.id,
          name: app.name,
          slug: app.slug,
          description: app.description,
          isActive: app.isActive,
          features: (app.settings as Record<string, any>)?.features || {
            otpLogin: true,
            truecallerLogin: true,
            googleLogin: true,
          },
          settings: (app.settings as Record<string, any>) || {},
        }));
    }

    // Fallback to hardcoded enabled apps
    this.logger.debug('Using hardcoded REGISTERED_APPS for supported apps');
    return Object.values(REGISTERED_APPS)
      .filter((app) => app.enabled)
      .map((app) => ({
        id: app.id,
        name: app.name,
        slug: app.id.toLowerCase().replace(/\./g, '-'),
        description: app.description || null,
        isActive: app.enabled,
        features: app.features || {
          otpLogin: true,
          truecallerLogin: true,
          googleLogin: true,
        },
        settings: {
          features: app.features,
          rateLimit: app.rateLimit,
        },
      }));
  }

  /**
   * Get a single app by ID (from cache, falls back to hardcoded)
   */
  getAppById(appId: string): AppFromDb | AppConfig | null {
    // Try cache first
    if (this.cacheInitialized && this.cachedApps.has(appId)) {
      return this.cachedApps.get(appId)!;
    }

    // Fallback to hardcoded
    return REGISTERED_APPS[appId] || null;
  }

  /**
   * Get a single app by slug (from cache only, no slug in hardcoded)
   */
  async getAppBySlug(slug: string): Promise<AppFromDb | null> {
    // Try cache first
    if (this.cacheInitialized) {
      const app = Array.from(this.cachedApps.values()).find(
        (a) => a.slug === slug,
      );
      if (app) return app;
    }

    // Query database directly if not in cache
    try {
      const result = await this.db
        .select()
        .from(schema.apps)
        .where(eq(schema.apps.slug, slug))
        .limit(1);

      return (result[0] as AppFromDb) || null;
    } catch (error) {
      this.logger.error(`Failed to fetch app by slug: ${error}`);
      return null;
    }
  }

  /**
   * Check if an app exists and is active (from cache, falls back to hardcoded)
   */
  isValidApp(appId: string): boolean {
    // Try cache first
    if (this.cacheInitialized && this.cachedApps.has(appId)) {
      return this.cachedApps.get(appId)!.isActive;
    }

    // Fallback to hardcoded
    const app = REGISTERED_APPS[appId];
    return app !== undefined && app.enabled;
  }

  /**
   * Get registered app IDs (from cache, falls back to hardcoded)
   */
  getRegisteredAppIds(): string[] {
    if (this.cacheInitialized && this.cachedApps.size > 0) {
      return Array.from(this.cachedApps.keys());
    }

    return Object.keys(REGISTERED_APPS);
  }

  /**
   * Get enabled apps (from cache, falls back to hardcoded)
   */
  getEnabledApps(): AppConfig[] | SupportedAppResponse[] {
    return this.getSupportedApps();
  }

  /**
   * Create or update an app in the database
   * Also refreshes the cache after modification
   */
  async upsertApp(
    appId: string,
    appData: Partial<AppConfig>,
  ): Promise<AppFromDb> {
    const existing = await this.db
      .select()
      .from(schema.apps)
      .where(eq(schema.apps.id, appId))
      .limit(1);

    const slug = appId.toLowerCase().replace(/\./g, '-');
    const settings: Record<string, any> = {
      features: appData.features || {
        otpLogin: true,
        truecallerLogin: true,
        googleLogin: true,
      },
      rateLimit: appData.rateLimit || {
        maxRequests: 100,
        windowMs: 15 * 60 * 1000,
      },
      ...(appData.enabled !== undefined && { enabled: appData.enabled }),
    };

    let result: AppFromDb;

    if (existing[0]) {
      // Update existing app
      const [updated] = await this.db
        .update(schema.apps)
        .set({
          name: appData.name || existing[0].name,
          description: appData.description ?? existing[0].description,
          isActive: appData.enabled ?? existing[0].isActive,
          settings,
          updatedAt: new Date(),
        })
        .where(eq(schema.apps.id, appId))
        .returning();

      result = updated as AppFromDb;
      this.logger.log(`Updated app: ${appId}`);
    } else {
      // Create new app
      const [created] = await this.db
        .insert(schema.apps)
        .values({
          id: appId,
          name: appData.name || appId,
          slug,
          description: appData.description || null,
          isActive: appData.enabled ?? true,
          settings,
        })
        .returning();

      result = created as AppFromDb;
      this.logger.log(`Created app: ${appId}`);
    }

    // Update cache
    this.cachedApps.set(appId, result);

    return result;
  }

  /**
   * Sync hardcoded apps with the database
   * Call this during startup or via admin endpoint
   */
  async syncAppsWithDatabase(): Promise<{
    created: number;
    updated: number;
    errors: string[];
  }> {
    const result = { created: 0, updated: 0, errors: [] as string[] };

    for (const [appId, appConfig] of Object.entries(REGISTERED_APPS)) {
      try {
        const existing = await this.db
          .select()
          .from(schema.apps)
          .where(eq(schema.apps.id, appId))
          .limit(1);

        await this.upsertApp(appId, appConfig);

        if (existing[0]) {
          result.updated++;
        } else {
          result.created++;
        }
      } catch (error) {
        const errorMsg = `Failed to sync app ${appId}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        this.logger.error(errorMsg);
        result.errors.push(errorMsg);
      }
    }

    this.logger.log(
      `Synced ${result.created} new apps, updated ${result.updated} existing apps`,
    );
    return result;
  }

  /**
   * Check if cache is initialized
   */
  isCacheInitialized(): boolean {
    return this.cacheInitialized;
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { initialized: boolean; count: number } {
    return {
      initialized: this.cacheInitialized,
      count: this.cachedApps.size,
    };
  }
}
