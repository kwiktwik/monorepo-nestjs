import { ICrawlEndpointRepository } from '../../domain/repositories/crawl-endpoint.repository.interface';
import {
  CrawlEndpoint,
  CreateCrawlEndpointInput,
  UpdateCrawlEndpointInput,
  PaginationConfig,
  ResponseConfig,
  ScheduleConfig,
  RateLimitConfig,
  RetryConfig,
  DedupConfig,
  AuthConfig,
} from '../../domain/entities/crawl-endpoint.entity';

/**
 * In-memory mock repository for testing
 * Does NOT require any database - stores data in memory
 */
export class InMemoryCrawlEndpointRepository implements ICrawlEndpointRepository {
  private endpoints: Map<number, CrawlEndpoint> = new Map();
  private nextId = 1;

  async create(input: CreateCrawlEndpointInput): Promise<CrawlEndpoint> {
    const id = this.nextId++;

    // Build pagination config with proper defaults
    const paginationConfig: PaginationConfig = input.pagination.config || {
      pageParam: 'page',
      perPageParam: 'per_page',
      perPageValue: 10,
      startPage: 1,
    };

    // Build auth config with proper defaults
    const authConfig: AuthConfig = input.auth.config || { headers: {} };

    // Build response config with proper defaults
    const responseConfig: ResponseConfig = {
      contentHandling: input.response?.contentHandling || 'json',
      extractFields: input.response?.extractFields,
      maxDbSizeBytes: input.response?.maxDbSizeBytes || 102400,
      storage: input.response?.storage || 'hybrid',
    };

    // Build schedule config with proper defaults
    const scheduleConfig: ScheduleConfig = {
      enabled: input.schedule?.enabled ?? true,
      cron: input.schedule?.cron,
      intervalMinutes: input.schedule?.intervalMinutes,
      runOnStart: input.schedule?.runOnStart ?? false,
    };

    // Build rate limit config with proper defaults
    const rateLimitConfig: RateLimitConfig = {
      requestsPerMinute: input.rateLimit?.requestsPerMinute || 60,
      maxConcurrent: input.rateLimit?.maxConcurrent || 1,
      delayBetweenRequestsMs: input.rateLimit?.delayBetweenRequestsMs || 1000,
    };

    // Build retry config with proper defaults
    const retryConfig: RetryConfig = {
      maxAttempts: input.retry?.maxAttempts || 3,
      backoffMultiplier: input.retry?.backoffMultiplier || 2,
      initialDelayMs: input.retry?.initialDelayMs || 1000,
      retryOnStatusCodes: input.retry?.retryOnStatusCodes || [
        429, 500, 502, 503, 504,
      ],
    };

    // Build dedup config with proper defaults
    const dedupConfig: DedupConfig = {
      enabled: input.deduplication?.enabled ?? true,
      keyFields: (input.deduplication?.keyFields as (
        | 'url'
        | 'method'
        | 'query_params'
        | 'body'
        | 'headers'
      )[]) || ['url', 'method', 'query_params'],
      ttlMinutes: input.deduplication?.ttlMinutes || 60,
    };

    const endpoint: CrawlEndpoint = {
      id,
      name: input.name,
      description: input.description,
      tags: input.tags,
      baseUrl: input.baseUrl,
      method: (input.method || 'GET') as
        | 'GET'
        | 'POST'
        | 'PUT'
        | 'DELETE'
        | 'PATCH',
      headers: input.headers || {},
      timeoutMs: input.timeoutMs || 30000,
      auth: {
        type: input.auth.type,
        config: authConfig,
      },
      pagination: {
        type: input.pagination.type,
        config: paginationConfig,
        maxPages: input.pagination.maxPages,
        stopOnEmpty: input.pagination.stopOnEmpty ?? true,
      },
      request: {
        bodyTemplate: input.request?.bodyTemplate,
        dynamicParams: input.request?.dynamicParams,
        staticQueryParams: input.request?.staticQueryParams,
      },
      response: responseConfig,
      schedule: scheduleConfig,
      rateLimit: rateLimitConfig,
      retry: retryConfig,
      deduplication: dedupConfig,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.endpoints.set(id, endpoint);
    return endpoint;
  }

  async findById(id: number): Promise<CrawlEndpoint | null> {
    return this.endpoints.get(id) || null;
  }

  async findByName(name: string): Promise<CrawlEndpoint | null> {
    for (const endpoint of this.endpoints.values()) {
      if (endpoint.name === name) return endpoint;
    }
    return null;
  }

  async findAll(filters?: {
    active?: boolean;
    tag?: string;
  }): Promise<CrawlEndpoint[]> {
    let results = Array.from(this.endpoints.values());
    if (filters?.active !== undefined) {
      results = results.filter((e) => e.isActive === filters.active);
    }
    if (filters?.tag) {
      results = results.filter((e) => e.tags?.includes(filters.tag!));
    }
    return results;
  }

  async update(
    id: number,
    input: UpdateCrawlEndpointInput,
  ): Promise<CrawlEndpoint> {
    const existing = this.endpoints.get(id);
    if (!existing) throw new Error(`Endpoint ${id} not found`);

    const updated: CrawlEndpoint = {
      ...existing,
      ...(input as Partial<CrawlEndpoint>),
      updatedAt: new Date(),
    };
    this.endpoints.set(id, updated);
    return updated;
  }

  async delete(id: number): Promise<void> {
    this.endpoints.delete(id);
  }

  async updateLastCrawlTime(id: number): Promise<void> {
    const endpoint = this.endpoints.get(id);
    if (endpoint) {
      endpoint.lastCrawlAt = new Date();
      endpoint.updatedAt = new Date();
    }
  }

  async updateNextCrawlTime(id: number, nextRun: Date): Promise<void> {
    const endpoint = this.endpoints.get(id);
    if (endpoint) {
      endpoint.nextCrawlAt = nextRun;
      endpoint.updatedAt = new Date();
    }
  }

  clear(): void {
    this.endpoints.clear();
    this.nextId = 1;
  }
}
