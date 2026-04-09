import { Injectable, Inject } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { ICrawlEndpointRepository } from '../../domain/repositories/crawl-endpoint.repository.interface';
import type {
  CrawlEndpoint,
  CreateCrawlEndpointInput,
  UpdateCrawlEndpointInput,
} from '../../domain/entities/crawl-endpoint.entity';
import {
  crawlEndpoints,
  crawlJobs,
  crawlResults,
  crawlJobHistory,
} from './crawler.schema';

@Injectable()
export class DrizzleCrawlEndpointRepository implements ICrawlEndpointRepository {
  constructor(@Inject('DRIZZLE_DB') private db: NodePgDatabase) {}

  async create(input: CreateCrawlEndpointInput): Promise<CrawlEndpoint> {
    const result = await this.db
      .insert(crawlEndpoints)
      .values({
        name: input.name,
        description: input.description,
        tags: input.tags,
        baseUrl: input.baseUrl,
        method: input.method || 'GET',
        headers: input.headers || {},
        timeoutMs: input.timeoutMs || 30000,
        authType: input.auth.type,
        authConfig: input.auth.config,
        paginationType: input.pagination.type,
        paginationConfig: input.pagination.config,
        paginationMaxPages: input.pagination.maxPages,
        paginationStopOnEmpty: input.pagination.stopOnEmpty ?? true,
        requestBodyTemplate: input.request?.bodyTemplate,
        requestDynamicParams: input.request?.dynamicParams,
        requestStaticQueryParams: input.request?.staticQueryParams || {},
        responseContentHandling: input.response.contentHandling || 'auto',
        responseExtractFields: input.response.extractFields,
        responseMaxDbSizeBytes: input.response.maxDbSizeBytes || 102400,
        responseStorage: input.response.storage || 'hybrid',
        scheduleEnabled: input.schedule.enabled ?? true,
        scheduleCron: input.schedule.cron,
        scheduleIntervalMinutes: input.schedule.intervalMinutes,
        scheduleRunOnStart: input.schedule.runOnStart ?? false,
        rateLimitRequestsPerMinute: input.rateLimit.requestsPerMinute,
        rateLimitMaxConcurrent: input.rateLimit.maxConcurrent || 1,
        rateLimitDelayBetweenRequestsMs:
          input.rateLimit.delayBetweenRequestsMs || 1000,
        retryMaxAttempts: input.retry?.maxAttempts || 3,
        retryBackoffMultiplier: input.retry?.backoffMultiplier || 2,
        retryInitialDelayMs: input.retry?.initialDelayMs || 1000,
        retryOnStatusCodes: input.retry?.retryOnStatusCodes || [
          429, 500, 502, 503, 504,
        ],
        dedupEnabled: input.deduplication?.enabled ?? true,
        dedupKeyFields: input.deduplication?.keyFields || [
          'url',
          'method',
          'query_params',
        ],
        dedupTtlMinutes: input.deduplication?.ttlMinutes || 60,
      })
      .returning();

    return this.mapToEntity(result[0]);
  }

  async findById(id: number): Promise<CrawlEndpoint | null> {
    const result = await this.db
      .select()
      .from(crawlEndpoints)
      .where(eq(crawlEndpoints.id, id))
      .limit(1);
    return result.length > 0 ? this.mapToEntity(result[0]) : null;
  }

  async findByName(name: string): Promise<CrawlEndpoint | null> {
    const result = await this.db
      .select()
      .from(crawlEndpoints)
      .where(eq(crawlEndpoints.name, name))
      .limit(1);
    return result.length > 0 ? this.mapToEntity(result[0]) : null;
  }

  async findAll(filters?: {
    active?: boolean;
    tag?: string;
  }): Promise<CrawlEndpoint[]> {
    let query = this.db.select().from(crawlEndpoints);

    if (filters?.active !== undefined) {
      query = query.where(eq(crawlEndpoints.isActive, filters.active)) as any;
    }

    if (filters?.tag) {
      query = query.where(
        sql`${crawlEndpoints.tags} @> ARRAY[${filters.tag}]::text[]`,
      ) as any;
    }

    const results = await query;
    return results.map((r) => this.mapToEntity(r));
  }

  async update(
    id: number,
    input: UpdateCrawlEndpointInput,
  ): Promise<CrawlEndpoint> {
    const updates: any = { updatedAt: new Date() };

    if (input.name) updates.name = input.name;
    if (input.description) updates.description = input.description;
    if (input.tags) updates.tags = input.tags;
    if (input.baseUrl) updates.baseUrl = input.baseUrl;
    if (input.method) updates.method = input.method;
    if (input.headers) updates.headers = input.headers;
    if (input.timeoutMs) updates.timeoutMs = input.timeoutMs;
    if (input.auth) {
      updates.authType = input.auth.type;
      updates.authConfig = input.auth.config;
    }
    if (input.pagination) {
      updates.paginationType = input.pagination.type;
      updates.paginationConfig = input.pagination.config;
      if (input.pagination.maxPages)
        updates.paginationMaxPages = input.pagination.maxPages;
      if (input.pagination.stopOnEmpty !== undefined)
        updates.paginationStopOnEmpty = input.pagination.stopOnEmpty;
    }
    if (input.isActive !== undefined) updates.isActive = input.isActive;

    const result = await this.db
      .update(crawlEndpoints)
      .set(updates)
      .where(eq(crawlEndpoints.id, id))
      .returning();

    return this.mapToEntity(result[0]);
  }

  async delete(id: number): Promise<void> {
    await this.db.delete(crawlEndpoints).where(eq(crawlEndpoints.id, id));
  }

  async updateLastCrawlTime(id: number): Promise<void> {
    await this.db
      .update(crawlEndpoints)
      .set({ lastCrawlAt: new Date(), updatedAt: new Date() })
      .where(eq(crawlEndpoints.id, id));
  }

  async updateNextCrawlTime(id: number, nextRun: Date): Promise<void> {
    await this.db
      .update(crawlEndpoints)
      .set({ nextCrawlAt: nextRun, updatedAt: new Date() })
      .where(eq(crawlEndpoints.id, id));
  }

  private mapToEntity(raw: any): CrawlEndpoint {
    return {
      id: raw.id,
      name: raw.name,
      description: raw.description,
      tags: raw.tags,
      baseUrl: raw.baseUrl,
      method: raw.method,
      headers: raw.headers,
      timeoutMs: raw.timeoutMs,
      auth: {
        type: raw.authType,
        config: raw.authConfig,
      },
      pagination: {
        type: raw.paginationType,
        config: raw.paginationConfig,
        maxPages: raw.paginationMaxPages,
        stopOnEmpty: raw.paginationStopOnEmpty,
      },
      request: {
        bodyTemplate: raw.requestBodyTemplate,
        dynamicParams: raw.requestDynamicParams,
        staticQueryParams: raw.requestStaticQueryParams,
      },
      response: {
        contentHandling: raw.responseContentHandling,
        extractFields: raw.responseExtractFields,
        maxDbSizeBytes: raw.responseMaxDbSizeBytes,
        storage: raw.responseStorage,
      },
      schedule: {
        enabled: raw.scheduleEnabled,
        cron: raw.scheduleCron,
        intervalMinutes: raw.scheduleIntervalMinutes,
        runOnStart: raw.scheduleRunOnStart,
      },
      rateLimit: {
        requestsPerMinute: raw.rateLimitRequestsPerMinute,
        maxConcurrent: raw.rateLimitMaxConcurrent,
        delayBetweenRequestsMs: raw.rateLimitDelayBetweenRequestsMs,
      },
      retry: {
        maxAttempts: raw.retryMaxAttempts,
        backoffMultiplier: raw.retryBackoffMultiplier,
        initialDelayMs: raw.retryInitialDelayMs,
        retryOnStatusCodes: raw.retryOnStatusCodes,
      },
      deduplication: {
        enabled: raw.dedupEnabled,
        keyFields: raw.dedupKeyFields,
        ttlMinutes: raw.dedupTtlMinutes,
      },
      isActive: raw.isActive,
      lastCrawlAt: raw.lastCrawlAt,
      nextCrawlAt: raw.nextCrawlAt,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }
}
