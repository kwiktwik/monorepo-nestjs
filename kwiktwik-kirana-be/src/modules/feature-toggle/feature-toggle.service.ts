import {
  Injectable,
  BadRequestException,
  Logger,
  Inject,
} from '@nestjs/common';
import { eq, and, desc } from 'drizzle-orm';
import * as crypto from 'crypto';
import { DRIZZLE_TOKEN } from '../../database/drizzle.module';
import * as schema from '../../database/schema';
import {
  FeatureToggleRequest,
  ExtractedIdentity,
  FeatureEvaluation,
  EvaluateFeatureInput,
} from './dto/feature-toggle.schema';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

/**
 * Feature Toggle Service
 *
 * Evaluates feature flags / experiments for a given app + identity.
 *
 * Identity resolution (strict, no defaults):
 *   firebaseInstallationId > deviceId > userId
 *
 * If no identity can be resolved, throws BadRequestException.
 */
@Injectable()
export class FeatureToggleService {
  private readonly logger = new Logger(FeatureToggleService.name);

  constructor(
    @Inject(DRIZZLE_TOKEN)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  /**
   * Get all feature flags for an app.
   * Used by GET /feature-toggle/flags endpoint.
   */
  async getAllFlags(appId: string): Promise<
    Array<{
      key: string;
      description: string | null;
      isEnabled: boolean;
      defaultValue: { enabled: boolean; value?: unknown } | null;
    }>
  > {
    const flags = await this.db
      .select({
        key: schema.featureFlags.key,
        description: schema.featureFlags.description,
        isEnabled: schema.featureFlags.isEnabled,
        defaultValue: schema.featureFlags.defaultValue,
      })
      .from(schema.featureFlags)
      .where(eq(schema.featureFlags.appId, appId));

    return flags.map((flag) => ({
      key: flag.key,
      description: flag.description,
      isEnabled: flag.isEnabled,
      defaultValue: flag.defaultValue as {
        enabled: boolean;
        value?: unknown;
      } | null,
    }));
  }

  /**
   * Evaluate a feature flag for the given request context.
   *
   * Flow:
   * 1. Resolve identity (strict - no defaults)
   * 2. Look up feature flag by appId + featureKey
   * 3. If no flag exists → return default disabled
   * 4. If flag exists but disabled → return enabled=false
   * 5. Look for active experiment linked to flag
   * 6. If no active experiment → return flag's defaultValue
   * 7. If experiment exists:
   *    a. Check user_experiment_assignments for existing cohort (sticky)
   *    b. If none, compute hash bucket, assign cohort by weight, persist
   * 8. Return evaluation with enabled, variant, config
   *
   * @throws BadRequestException if identity cannot be resolved
   */
  async evaluateFeature(
    appId: string,
    featureKey: string,
    identity: {
      firebaseInstallationId?: string;
      deviceId?: string;
      userId?: string;
    },
    context?: Record<string, unknown>,
  ): Promise<FeatureEvaluation> {
    // ─────────────────────────────────────────────────────────────
    // 1. Resolve effective identity (strict - no fallbacks)
    // ─────────────────────────────────────────────────────────────
    const resolvedIdentity = this.resolveIdentity(identity);

    if (!resolvedIdentity) {
      this.logger.warn(
        `[FeatureToggle] Failed to resolve identity for appId=${appId}, featureKey=${featureKey}`,
      );
      throw new BadRequestException({
        success: false,
        error:
          'Unable to resolve identity: at least one of firebaseInstallationId, deviceId, or userId is required',
        code: 'MISSING_IDENTITY',
      });
    }

    const subjectId = resolvedIdentity.value;
    this.logger.log(
      `[FeatureToggle] Evaluating featureKey=${featureKey} for appId=${appId}, identityType=${resolvedIdentity.type}, identityValue=${subjectId.substring(0, 8)}...`,
    );

    // ─────────────────────────────────────────────────────────────
    // 2. Look up feature flag
    // ─────────────────────────────────────────────────────────────
    const flags = await this.db
      .select()
      .from(schema.featureFlags)
      .where(
        and(
          eq(schema.featureFlags.appId, appId),
          eq(schema.featureFlags.key, featureKey),
        ),
      )
      .limit(1);

    if (!flags[0]) {
      // No flag configured → return disabled (safe default)
      return {
        success: true,
        appId,
        featureKey,
        identity: resolvedIdentity,
        enabled: false,
        reason: 'Feature flag not found - default disabled',
      };
    }

    const flag = flags[0];

    // If flag is globally disabled, return disabled
    if (!flag.isEnabled) {
      return {
        success: true,
        appId,
        featureKey,
        identity: resolvedIdentity,
        enabled: false,
        reason: 'Feature flag is disabled',
      };
    }

    // ─────────────────────────────────────────────────────────────
    // 3. Look for active experiment linked to this flag
    // ─────────────────────────────────────────────────────────────
    const experiments = await this.db
      .select()
      .from(schema.experiments)
      .where(
        and(
          eq(schema.experiments.featureFlagId, flag.id),
          eq(schema.experiments.status, 'running'),
        ),
      )
      .orderBy(desc(schema.experiments.createdAt))
      .limit(1);

    if (!experiments[0]) {
      // No active experiment → return flag's defaultValue
      const defaultVal = flag.defaultValue as {
        enabled?: boolean;
        value?: unknown;
      } | null;
      return {
        success: true,
        appId,
        featureKey,
        identity: resolvedIdentity,
        enabled: defaultVal?.enabled ?? false,
        reason: 'No active experiment - using flag default',
      };
    }

    const experiment = experiments[0];

    // ─────────────────────────────────────────────────────────────
    // 4. Check for existing assignment (sticky!)
    // ─────────────────────────────────────────────────────────────
    const existingAssignments = await this.db
      .select()
      .from(schema.userExperimentAssignments)
      .where(
        and(
          eq(schema.userExperimentAssignments.subjectId, subjectId),
          eq(schema.userExperimentAssignments.experimentId, experiment.id),
        ),
      )
      .limit(1);

    let cohort: {
      id: number;
      name: string;
      weight: number;
      config: Record<string, unknown> | null;
    } | null = null;

    if (existingAssignments[0]) {
      // Reuse existing cohort (sticky)
      const assignment = existingAssignments[0];
      const cohorts = await this.db
        .select()
        .from(schema.experimentCohorts)
        .where(eq(schema.experimentCohorts.id, assignment.cohortId))
        .limit(1);

      if (cohorts[0]) {
        cohort = cohorts[0];
        this.logger.log(
          `[FeatureToggle] Reused sticky assignment: experiment=${experiment.id}, cohort=${cohort.name}, subject=${subjectId.substring(0, 8)}...`,
        );
      }
    } else {
      // ─────────────────────────────────────────────────────────────
      // 5. No assignment → compute bucket and assign cohort by weight
      // ─────────────────────────────────────────────────────────────
      const bucket = this.computeBucket(subjectId, experiment.id);

      // Fetch all cohorts for this experiment
      const cohorts = await this.db
        .select()
        .from(schema.experimentCohorts)
        .where(eq(schema.experimentCohorts.experimentId, experiment.id))
        .orderBy(schema.experimentCohorts.id); // stable order

      if (cohorts.length === 0) {
        // No cohorts configured → fallback to flag default
        const defaultVal = flag.defaultValue as { enabled?: boolean } | null;
        return {
          success: true,
          appId,
          featureKey,
          identity: resolvedIdentity,
          enabled: defaultVal?.enabled ?? false,
          reason: 'Experiment has no cohorts - using flag default',
        };
      }

      // Assign cohort by cumulative weight
      // e.g., control: 50, variant_a: 50 → control: 0-49, variant_a: 50-99
      let cumulative = 0;
      let assigned = cohorts[0];

      for (const c of cohorts) {
        cumulative += c.weight;
        if (bucket < cumulative) {
          assigned = c;
          break;
        }
      }

      cohort = assigned;

      // Persist assignment for future consistency (sticky)
      try {
        await this.db.insert(schema.userExperimentAssignments).values({
          subjectId,
          subjectType: resolvedIdentity.type,
          appId,
          experimentId: experiment.id,
          cohortId: cohort.id,
        });
        this.logger.log(
          `[FeatureToggle] Assigned cohort: experiment=${experiment.id}, cohort=${cohort.name}, bucket=${bucket}, subject=${subjectId.substring(0, 8)}...`,
        );
      } catch (insertErr) {
        // Race condition: another request may have inserted; re-fetch
        const retry = await this.db
          .select()
          .from(schema.userExperimentAssignments)
          .where(
            and(
              eq(schema.userExperimentAssignments.subjectId, subjectId),
              eq(schema.userExperimentAssignments.experimentId, experiment.id),
            ),
          )
          .limit(1);

        if (retry[0]) {
          const retryCohort = await this.db
            .select()
            .from(schema.experimentCohorts)
            .where(eq(schema.experimentCohorts.id, retry[0].cohortId))
            .limit(1);
          if (retryCohort[0]) {
            cohort = retryCohort[0];
          }
        }
      }
    }

    // ─────────────────────────────────────────────────────────────
    // 6. Build and return evaluation
    // ─────────────────────────────────────────────────────────────
    const cohortConfig = cohort?.config ?? {};
    const enabled =
      typeof cohortConfig.enabled === 'boolean' ? cohortConfig.enabled : false;

    const evaluation: FeatureEvaluation = {
      success: true,
      appId,
      featureKey,
      identity: resolvedIdentity,
      enabled,
      variant: cohort?.name,
      config: cohortConfig,
      experimentId: experiment.id,
      reason: `Assigned to cohort "${cohort?.name}" via experiment`,
    };

    return evaluation;
  }

  /**
   * Compute a deterministic bucket (0-99) for a subject+experiment pair.
   * Uses SHA256 hash for uniform distribution.
   */
  private computeBucket(subjectId: string, experimentId: number): number {
    const input = `${subjectId}:${experimentId}`;
    const hash = crypto.createHash('sha256').update(input).digest('hex');
    // Take first 8 hex chars → parse as int → mod 100
    const bucket = parseInt(hash.substring(0, 8), 16) % 100;
    return bucket;
  }

  /**
   * Resolve the effective identity from available sources.
   * Priority: firebaseInstallationId > deviceId > userId
   * Returns null if none available (caller should fail).
   */
  private resolveIdentity(identity: {
    firebaseInstallationId?: string;
    deviceId?: string;
    userId?: string;
  }): ExtractedIdentity | null {
    if (identity.firebaseInstallationId?.trim()) {
      return {
        value: identity.firebaseInstallationId.trim(),
        type: 'firebaseInstallationId',
      };
    }

    if (identity.deviceId?.trim()) {
      return {
        value: identity.deviceId.trim(),
        type: 'deviceId',
      };
    }

    if (identity.userId?.trim()) {
      return {
        value: identity.userId.trim(),
        type: 'userId',
      };
    }

    return null;
  }

  /**
   * Convenience method: evaluate from a full FeatureToggleRequest object.
   */
  async evaluateFromRequest(
    req: FeatureToggleRequest,
    body: EvaluateFeatureInput,
  ): Promise<FeatureEvaluation> {
    if (!req.appId) {
      throw new BadRequestException({
        success: false,
        error: 'appId is required',
        code: 'MISSING_APP_ID',
      });
    }

    if (!body.featureKey?.trim()) {
      throw new BadRequestException({
        success: false,
        error: 'featureKey is required and cannot be empty',
        code: 'INVALID_FEATURE_KEY',
      });
    }

    if (!req.identity) {
      throw new BadRequestException({
        success: false,
        error:
          'Identity is required (firebaseInstallationId, deviceId, or userId)',
        code: 'MISSING_IDENTITY',
      });
    }

    return this.evaluateFeature(
      req.appId,
      body.featureKey.trim(),
      req.identity,
      body.context,
    );
  }
}
