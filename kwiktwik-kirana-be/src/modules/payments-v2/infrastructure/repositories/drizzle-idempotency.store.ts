/**
 * Drizzle-backed Idempotency Store
 *
 * Implements IdempotencyStore using the idempotency_keys table.
 * Required for production deployments with multiple server instances.
 */

import { Injectable, Logger, Inject } from '@nestjs/common';
import { eq, and, gt, lt, sql } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import {
  type IdempotencyStore,
  type IdempotencyKey,
  type CreateIdempotencyKeyParams,
  type UpdateIdempotencyKeyParams,
  IdempotencyStatus,
  IdempotencyKeyExistsError,
  IdempotencyKeyNotFoundError,
} from '../../common/idempotency/idempotency.service';
import { idempotencyKeys } from '../../database/schema';
import { DRIZZLE_TOKEN } from '../../../../database/drizzle.module';
import * as schema from '../../../../database/schema';

@Injectable()
export class DrizzleIdempotencyStore implements IdempotencyStore {
  private readonly logger = new Logger(DrizzleIdempotencyStore.name);

  constructor(
    @Inject(DRIZZLE_TOKEN)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async get(key: string): Promise<IdempotencyKey | null> {
    const rows = await this.db
      .select()
      .from(idempotencyKeys)
      .where(
        and(
          eq(idempotencyKeys.key, key),
          gt(idempotencyKeys.expiresAt, new Date()),
        ),
      )
      .limit(1);

    if (rows.length === 0) return null;
    return this.toDomain(rows[0]);
  }

  async create(params: CreateIdempotencyKeyParams): Promise<IdempotencyKey> {
    const now = new Date();
    const ttlMs = params.ttlMs ?? 24 * 60 * 60 * 1000;
    const expiresAt = new Date(now.getTime() + ttlMs);

    try {
      const rows = await this.db
        .insert(idempotencyKeys)
        .values({
          key: params.key,
          operationType: params.operationType,
          provider: params.provider as any,
          appId: params.appId ?? null,
          requestHash: params.requestHash,
          status: 'IN_PROGRESS',
          createdAt: now,
          expiresAt,
        })
        .returning();

      return this.toDomain(rows[0]);
    } catch (error: any) {
      if (error?.code === '23505') {
        throw new IdempotencyKeyExistsError(params.key);
      }
      throw error;
    }
  }

  async update(key: string, updates: UpdateIdempotencyKeyParams): Promise<IdempotencyKey> {
    const rows = await this.db
      .update(idempotencyKeys)
      .set({
        status: updates.status as any,
        result: updates.result as any,
      })
      .where(eq(idempotencyKeys.key, key))
      .returning();

    if (rows.length === 0) {
      throw new IdempotencyKeyNotFoundError(key);
    }

    return this.toDomain(rows[0]);
  }

  async delete(key: string): Promise<void> {
    await this.db
      .delete(idempotencyKeys)
      .where(eq(idempotencyKeys.key, key));
  }

  async exists(key: string): Promise<boolean> {
    const rows = await this.db
      .select({ key: idempotencyKeys.key })
      .from(idempotencyKeys)
      .where(
        and(
          eq(idempotencyKeys.key, key),
          gt(idempotencyKeys.expiresAt, new Date()),
        ),
      )
      .limit(1);

    return rows.length > 0;
  }

  async cleanupExpired(): Promise<number> {
    const result = await this.db
      .delete(idempotencyKeys)
      .where(lt(idempotencyKeys.expiresAt, new Date()))
      .returning({ key: idempotencyKeys.key });

    return result.length;
  }

  private toDomain(row: typeof idempotencyKeys.$inferSelect): IdempotencyKey {
    return {
      key: row.key,
      operationType: row.operationType as any,
      provider: row.provider ?? undefined,
      appId: row.appId ?? undefined,
      requestHash: row.requestHash,
      status: row.status as any,
      result: row.result ?? undefined,
      createdAt: row.createdAt,
      expiresAt: row.expiresAt,
    };
  }
}
