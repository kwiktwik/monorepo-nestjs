import { Injectable, Inject, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { DRIZZLE_TOKEN } from '../../database/drizzle.module';
import * as schema from '../../database/schema';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, desc, sql } from 'drizzle-orm';
import type {
  CreateFeatureFlagDto,
  UpdateFeatureFlagDto,
  CreateExperimentDto,
  UpdateExperimentDto,
  FeatureFlagResponseDto,
  ExperimentResponseDto,
  ExperimentResultsResponseDto,
  CohortDto,
} from './dto/feature-toggle-admin.dto';
// Import REGISTERED_APPS for auto-creating apps
import { REGISTERED_APPS } from '../../common/config/apps.config';

@Injectable()
export class FeatureToggleAdminService {
  private readonly logger = new Logger(FeatureToggleAdminService.name);

  constructor(
    @Inject(DRIZZLE_TOKEN)
    private db: NodePgDatabase<typeof schema>,
  ) {}

  // ============================================================================
  // FEATURE FLAGS
  // ============================================================================

  async listFeatureFlags(appId?: string): Promise<FeatureFlagResponseDto[]> {
    const query = this.db.select().from(schema.featureFlags);

    const flags = appId
      ? await query.where(eq(schema.featureFlags.appId, appId))
      : await query.orderBy(desc(schema.featureFlags.createdAt));

    return flags.map((ff: any) => ({
      ...ff,
      createdAt: ff.createdAt.toISOString(),
      updatedAt: ff.updatedAt.toISOString(),
    })) as FeatureFlagResponseDto[];
  }

  async getFeatureFlag(id: number): Promise<FeatureFlagResponseDto> {
    const result = await this.db
      .select()
      .from(schema.featureFlags)
      .where(eq(schema.featureFlags.id, id))
      .limit(1);

    if (!result[0]) {
      throw new NotFoundException(`Feature flag with id ${id} not found`);
    }

    const ff = result[0];
    return {
      ...ff,
      createdAt: ff.createdAt.toISOString(),
      updatedAt: ff.updatedAt.toISOString(),
    } as FeatureFlagResponseDto;
  }

  async createFeatureFlag(dto: CreateFeatureFlagDto): Promise<FeatureFlagResponseDto> {
    // Ensure the app exists in the apps table (auto-create if missing)
    await this.ensureAppExists(dto.appId);

    // Check for duplicate key+appId
    const existing = await this.db
      .select()
      .from(schema.featureFlags)
      .where(
        and(
          eq(schema.featureFlags.key, dto.key),
          eq(schema.featureFlags.appId, dto.appId),
        ),
      )
      .limit(1);

    if (existing[0]) {
      throw new BadRequestException(
        `Feature flag with key "${dto.key}" already exists for app "${dto.appId}"`,
      );
    }

    const [created] = await this.db
      .insert(schema.featureFlags)
      .values({
        key: dto.key,
        appId: dto.appId,
        description: dto.description,
        defaultValue: dto.defaultValue || { enabled: false },
        isEnabled: dto.isEnabled ?? true,
      })
      .returning();

    this.logger.log(`Created feature flag ${dto.key} for app ${dto.appId}`);
    return {
      ...created,
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    } as FeatureFlagResponseDto;
  }

  /**
   * Ensure an app exists in the apps table.
   * If not, create a minimal entry so foreign keys work.
   */
  private async ensureAppExists(appId: string): Promise<void> {
    const existing = await this.db
      .select()
      .from(schema.apps)
      .where(eq(schema.apps.id, appId))
      .limit(1);

    if (existing[0]) {
      return; // App already exists
    }

    // Auto-create app from REGISTERED_APPS if available, else minimal
    const registered = REGISTERED_APPS[appId];

    await this.db.insert(schema.apps).values({
      id: appId,
      name: registered?.name || appId,
      slug: appId.toLowerCase().replace(/\./g, '-'),
      description: registered?.description || null,
      isActive: true,
      settings: {},
    });

    this.logger.log(`Auto-created app entry for ${appId}`);
  }

  async updateFeatureFlag(
    id: number,
    dto: UpdateFeatureFlagDto,
  ): Promise<FeatureFlagResponseDto> {
    const existing = await this.getFeatureFlag(id); // throws if not found

    const [updated] = await this.db
      .update(schema.featureFlags)
      .set({
        description: dto.description ?? existing.description,
        defaultValue: dto.defaultValue ?? existing.defaultValue,
        isEnabled: dto.isEnabled ?? existing.isEnabled,
        updatedAt: new Date(),
      })
      .where(eq(schema.featureFlags.id, id))
      .returning();

    this.logger.log(`Updated feature flag ${id}`);
    return {
      ...updated,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    } as FeatureFlagResponseDto;
  }

  async deleteFeatureFlag(id: number): Promise<{ success: boolean; message: string }> {
    await this.getFeatureFlag(id); // throws if not found

    await this.db.delete(schema.featureFlags).where(eq(schema.featureFlags.id, id));
    this.logger.log(`Deleted feature flag ${id}`);
    return { success: true, message: 'Feature flag deleted' };
  }

  // ============================================================================
  // EXPERIMENTS
  // ============================================================================

  async listExperiments(appId?: string, status?: string): Promise<ExperimentResponseDto[]> {
    const conditions: any[] = [];

    if (appId) {
      conditions.push(eq(schema.experiments.appId, appId));
    }
    if (status) {
      conditions.push(eq(schema.experiments.status, status as any));
    }

    let query = this.db.select().from(schema.experiments);

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const experiments = await query.orderBy(desc(schema.experiments.createdAt));

    // Fetch cohorts for each experiment
    const result: ExperimentResponseDto[] = [];
    for (const exp of experiments) {
      const cohorts = await this.db
        .select()
        .from(schema.experimentCohorts)
        .where(eq(schema.experimentCohorts.experimentId, exp.id));

      result.push({
        ...exp,
        startDate: exp.startDate ? exp.startDate.toISOString() : undefined,
        endDate: exp.endDate ? exp.endDate.toISOString() : undefined,
        createdAt: exp.createdAt.toISOString(),
        updatedAt: exp.updatedAt.toISOString(),
        cohorts: cohorts as CohortDto[],
      } as ExperimentResponseDto);
    }

    return result;
  }

  async getExperiment(id: number): Promise<ExperimentResponseDto> {
    const expResult = await this.db
      .select()
      .from(schema.experiments)
      .where(eq(schema.experiments.id, id))
      .limit(1);

    if (!expResult[0]) {
      throw new NotFoundException(`Experiment with id ${id} not found`);
    }

    const cohorts = await this.db
      .select()
      .from(schema.experimentCohorts)
      .where(eq(schema.experimentCohorts.experimentId, id));

    const exp = expResult[0];
    return {
      ...exp,
      startDate: exp.startDate ? exp.startDate.toISOString() : undefined,
      endDate: exp.endDate ? exp.endDate.toISOString() : undefined,
      createdAt: exp.createdAt.toISOString(),
      updatedAt: exp.updatedAt.toISOString(),
      cohorts: cohorts as CohortDto[],
    } as ExperimentResponseDto;
  }

  async createExperiment(dto: CreateExperimentDto): Promise<ExperimentResponseDto> {
    // Validate cohorts weights sum to 100 (or close)
    const totalWeight = dto.cohorts.reduce((sum, c) => sum + c.weight, 0);
    if (totalWeight !== 100) {
      this.logger.warn(`Experiment cohorts weights sum to ${totalWeight}, expected 100`);
    }

    // Ensure app exists (auto-create if missing)
    await this.ensureAppExists(dto.appId);

    // Validate featureFlagId if provided (must exist, cannot auto-create with specific ID)
    if (dto.featureFlagId) {
      const flag = await this.db
        .select()
        .from(schema.featureFlags)
        .where(eq(schema.featureFlags.id, dto.featureFlagId))
        .limit(1);

      if (!flag[0]) {
        throw new BadRequestException(
          `Feature flag with id ${dto.featureFlagId} not found. Create the feature flag first via POST /api/admin/feature-toggle/flags, then reference its id.`,
        );
      }
    }

    // Insert experiment
    const [experiment] = await this.db
      .insert(schema.experiments)
      .values({
        name: dto.name,
        appId: dto.appId,
        featureFlagId: dto.featureFlagId ?? null,
        status: 'draft',
        trafficAllocation: dto.trafficAllocation ?? 100,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        metadata: dto.metadata || {},
      })
      .returning();

    // Insert cohorts
    for (const cohort of dto.cohorts) {
      await this.db.insert(schema.experimentCohorts).values({
        experimentId: experiment.id,
        name: cohort.name,
        weight: cohort.weight,
        config: cohort.config || {},
      });
    }

    this.logger.log(`Created experiment "${dto.name}" with ${dto.cohorts.length} cohorts`);

    return this.getExperiment(experiment.id);
  }

  async updateExperiment(id: number, dto: UpdateExperimentDto): Promise<ExperimentResponseDto> {
    const existing = await this.getExperiment(id);

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (dto.name) updateData.name = dto.name;
    if (dto.status) updateData.status = dto.status;
    if (dto.trafficAllocation !== undefined) updateData.trafficAllocation = dto.trafficAllocation;
    if (dto.startDate) updateData.startDate = new Date(dto.startDate);
    if (dto.endDate) updateData.endDate = new Date(dto.endDate);
    if (dto.metadata) updateData.metadata = dto.metadata;

    await this.db
      .update(schema.experiments)
      .set(updateData)
      .where(eq(schema.experiments.id, id));

    this.logger.log(`Updated experiment ${id}`);
    return this.getExperiment(id);
  }

  async deleteExperiment(id: number): Promise<{ success: boolean; message: string }> {
    await this.getExperiment(id); // throws if not found

    // Delete cohorts first (cascade should handle, but being explicit)
    await this.db.delete(schema.experimentCohorts).where(eq(schema.experimentCohorts.experimentId, id));

    await this.db.delete(schema.experiments).where(eq(schema.experiments.id, id));
    this.logger.log(`Deleted experiment ${id}`);
    return { success: true, message: 'Experiment deleted' };
  }

  // ============================================================================
  // RESULTS / ANALYSIS
  // ============================================================================

  async getExperimentResults(id: number): Promise<ExperimentResultsResponseDto> {
    const experiment = await this.getExperiment(id);

    const cohorts = await this.db
      .select()
      .from(schema.experimentCohorts)
      .where(eq(schema.experimentCohorts.experimentId, id));

    const results: Array<{
      name: string;
      usersExposed: number;
      conversions: number;
      conversionRate: number;
    }> = [];

    for (const cohort of cohorts) {
      // Count exposures
      const exposures = await this.db
        .select({ count: sql<number>`count(*)` })
        .from(schema.experimentEvents)
        .where(
          and(
            eq(schema.experimentEvents.experimentId, id),
            eq(schema.experimentEvents.cohortId, cohort.id),
            eq(schema.experimentEvents.eventType, 'exposure'),
          ),
        );

      // Count conversions
      const conversions = await this.db
        .select({ count: sql<number>`count(*)` })
        .from(schema.experimentEvents)
        .where(
          and(
            eq(schema.experimentEvents.experimentId, id),
            eq(schema.experimentEvents.cohortId, cohort.id),
            eq(schema.experimentEvents.eventType, 'conversion'),
          ),
        );

      const usersExposed = Number(exposures[0]?.count ?? 0);
      const conversionCount = Number(conversions[0]?.count ?? 0);
      const conversionRate = usersExposed > 0 ? (conversionCount / usersExposed) * 100 : 0;

      results.push({
        name: cohort.name,
        usersExposed,
        conversions: conversionCount,
        conversionRate: Number(conversionRate.toFixed(2)),
      });
    }

    // Determine winner (highest conversion rate, must have at least some exposures)
    let winner: string | undefined;
    const sorted = [...results].sort((a, b) => b.conversionRate - a.conversionRate);
    if (sorted.length > 0 && sorted[0].usersExposed > 0) {
      winner = sorted[0].name;
    }

    return {
      experimentId: id,
      experimentName: experiment.name,
      status: experiment.status,
      cohorts: results,
      winner,
      generatedAt: new Date().toISOString(),
    };
  }
}
