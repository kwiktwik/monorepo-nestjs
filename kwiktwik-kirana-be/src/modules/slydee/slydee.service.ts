import { Injectable, Inject, Logger, OnModuleInit } from '@nestjs/common';
import { DRIZZLE_TOKEN } from '../../database/drizzle.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../database/schema';
import { sql } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';
import type { CompanionProfile, CompanionResponse } from './slydee.types';

export const SLYDEE_APP_ID = 'com.kwiktwik.datingai';

@Injectable()
export class SlydeeService implements OnModuleInit {
  private readonly logger = new Logger(SlydeeService.name);
  private companionData: CompanionProfile[] = [];

  constructor(
    @Inject(DRIZZLE_TOKEN) private db: NodePgDatabase<typeof schema>,
  ) {}

  async onModuleInit(): Promise<void> {
    this.loadCompanionData();
    await this.seedAppEntry();
    await this.seedCompanionUsers();
  }

  private loadCompanionData(): void {
    try {
      const dataPath = path.join(
        process.cwd(),
        'data',
        'companion_profile',
        'all_companions.json',
      );

      this.logger.log(`Loading companion data from: ${dataPath}`);

      if (!fs.existsSync(dataPath)) {
        this.logger.error(`Companion data file not found at: ${dataPath}`);
        return;
      }

      const fileContent = fs.readFileSync(dataPath, 'utf-8');
      this.companionData = JSON.parse(fileContent) as CompanionProfile[];

      this.logger.log(
        `Successfully loaded ${this.companionData.length} companion profiles`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to load companion data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      this.companionData = [];
    }
  }

  private async seedAppEntry(): Promise<void> {
    try {
      await this.db
        .insert(schema.apps)
        .values({
          id: SLYDEE_APP_ID,
          name: 'Slydee',
          slug: 'slydee',
          description: 'AI Dating Companion App',
          isActive: true,
        })
        .onConflictDoNothing();
      this.logger.log('Slydee app entry ensured');
    } catch (error) {
      this.logger.warn(
        `App entry seed skipped: ${(error as Error).message}`,
      );
    }
  }

  private async seedCompanionUsers(): Promise<void> {
    if (this.companionData.length === 0) return;

    try {
      const values = this.companionData.map((c) => ({
        id: c.id,
        name: c.name,
        email: `${c.id}@companion.slydee`,
        emailVerified: true,
        isAnonymous: false,
        image: c.imageUrls?.[0] ?? null,
      }));

      await this.db.insert(schema.user).values(values).onConflictDoNothing();
      this.logger.log(
        `Seeded ${values.length} companion user entries (conflicts ignored)`,
      );
    } catch (error) {
      this.logger.warn(
        `Companion user seeding issue: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Get all companion profiles
   */
  getAllCompanions(): CompanionResponse {
    return {
      success: true,
      data: this.companionData,
      count: this.companionData.length,
    };
  }

  /**
   * Get companion by ID
   */
  getCompanionById(id: string): CompanionProfile | null {
    return this.companionData.find((companion) => companion.id === id) || null;
  }

  /**
   * Returns the companion that is auto-matched for free (lowest position).
   */
  getFreeCompanion(): CompanionProfile | null {
    if (this.companionData.length === 0) return null;
    return this.companionData.reduce((min, c) =>
      c.position < min.position ? c : min,
    );
  }

  /**
   * Get a random companion, excluding given IDs.
   * Only returns unlocked companions by default.
   */
  getRandomCompanion(
    excludeIds: string[] = [],
    options?: { safeOnly?: boolean },
  ): CompanionProfile | null {
    let candidates = this.companionData.filter(
      (c) => !c.isLocked && !excludeIds.includes(c.id),
    );

    if (options?.safeOnly) {
      candidates = candidates.filter((c) => c.isSafeCompatible);
    }

    if (candidates.length === 0) {
      // Fall back to all unlocked companions if every one is excluded
      candidates = this.companionData.filter((c) => !c.isLocked);
      if (options?.safeOnly) {
        candidates = candidates.filter((c) => c.isSafeCompatible);
      }
    }

    if (candidates.length === 0) return null;

    const idx = Math.floor(Math.random() * candidates.length);
    return candidates[idx];
  }

  /**
   * Reload companion data from file
   */
  reloadData(): CompanionResponse {
    this.loadCompanionData();
    return this.getAllCompanions();
  }
}
