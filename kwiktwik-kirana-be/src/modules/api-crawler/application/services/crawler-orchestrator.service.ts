import { Injectable, Logger, Inject } from '@nestjs/common';
import * as crypto from 'crypto';
import {
  CRAWL_ENDPOINT_REPOSITORY,
  CRAWL_JOB_REPOSITORY,
  RESPONSE_STORAGE,
} from '../../constants';
import type { ICrawlEndpointRepository } from '../../domain/repositories/crawl-endpoint.repository.interface';
import type { ICrawlJobRepository } from '../../domain/repositories/crawl-job.repository.interface';
import type { StorageStrategy } from '../../domain/entities/crawl-result.entity';
import type { CrawlEndpoint } from '../../domain/entities/crawl-endpoint.entity';
import { PaginationStrategyFactory } from '../../domain/strategies/pagination';
import { AuthStrategyFactory } from '../../domain/strategies/auth';
import { ContentHandlerFactory } from '../../domain/strategies/content';
import type { CrawlRequest } from '../../domain/entities/crawl-job.entity';

@Injectable()
export class CrawlerOrchestratorService {
  private readonly logger = new Logger(CrawlerOrchestratorService.name);
  private readonly contentHandlerFactory = new ContentHandlerFactory();

  constructor(
    @Inject(CRAWL_ENDPOINT_REPOSITORY)
    private endpointRepository: ICrawlEndpointRepository,
    @Inject(CRAWL_JOB_REPOSITORY)
    private jobRepository: ICrawlJobRepository,
    @Inject(RESPONSE_STORAGE)
    private storageService: StorageStrategy,
  ) {}

  async crawlEndpoint(endpointId: number): Promise<string[]> {
    const endpoint = await this.endpointRepository.findById(endpointId);
    if (!endpoint) {
      throw new Error(`Endpoint ${endpointId} not found`);
    }
    if (!endpoint.isActive) {
      throw new Error(`Endpoint ${endpointId} is inactive`);
    }

    this.logger.log(`Starting crawl for endpoint: ${endpoint.name}`);

    const jobIds: string[] = [];
    const paginationStrategy = PaginationStrategyFactory.create(
      endpoint.pagination.type,
    );
    let context = paginationStrategy.getInitialContext();
    let pageCount = 0;

    // Track deduplication keys within this crawl session
    const processedDedupKeys = new Set<string>();

    while (
      context.hasMore &&
      pageCount < (endpoint.pagination.maxPages || 1000)
    ) {
      // Build request
      const request = await this.buildRequest(
        endpoint,
        context,
        paginationStrategy,
      );

      // Check deduplication
      const dedupKey = this.generateDedupKey(
        request,
        endpoint.deduplication.keyFields,
      );

      // Skip if deduplication is enabled and we've seen this key before
      if (endpoint.deduplication?.enabled && dedupKey) {
        // Check in-memory session cache first
        if (processedDedupKeys.has(dedupKey)) {
          this.logger.debug(
            `Skipping duplicate request (session cache): ${dedupKey.slice(0, 16)}...`,
          );
          // Still need to update context to avoid infinite loop
          const mockResponse = this.createMockResponse(
            endpoint,
            pageCount,
            context,
          );
          context = paginationStrategy.updateContext(
            context,
            mockResponse,
            endpoint.pagination.config,
          );
          pageCount++;
          continue;
        }

        // Check database for existing job with same dedup key
        const existingJob = await this.jobRepository.findByDedupKey(
          endpoint.id,
          dedupKey,
        );
        if (existingJob) {
          this.logger.debug(
            `Skipping duplicate request (database): ${dedupKey.slice(0, 16)}..., existing job: ${existingJob.id}`,
          );
          // Still need to update context to avoid infinite loop
          const mockResponse = this.createMockResponse(
            endpoint,
            pageCount,
            context,
          );
          context = paginationStrategy.updateContext(
            context,
            mockResponse,
            endpoint.pagination.config,
          );
          pageCount++;
          continue;
        }

        processedDedupKeys.add(dedupKey);
      }

      this.logger.debug(
        `Processing page ${pageCount + 1}, dedupKey: ${dedupKey?.slice(0, 16)}...`,
      );

      // Simulate HTTP request and store response
      const jobId = this.generateUlid();

      try {
        // Create mock response based on endpoint configuration
        const mockResponse = this.createMockResponse(
          endpoint,
          pageCount,
          context,
        );

        // Process and store response
        await this.processAndStoreResponse(jobId, endpoint, mockResponse);

        jobIds.push(jobId);

        // Update pagination context
        context = paginationStrategy.updateContext(
          context,
          mockResponse,
          endpoint.pagination.config,
        );
        pageCount++;

        // Delay between requests if configured
        if (endpoint.rateLimit.delayBetweenRequestsMs > 0) {
          await this.sleep(endpoint.rateLimit.delayBetweenRequestsMs);
        }
      } catch (error) {
        this.logger.error(`Failed to process job ${jobId}:`, error);
        throw error;
      }
    }

    // Update endpoint metadata
    await this.endpointRepository.updateLastCrawlTime(endpointId);

    this.logger.log(
      `Completed crawl for endpoint ${endpoint.name}: ${jobIds.length} jobs processed`,
    );
    return jobIds;
  }

  async triggerImmediateCrawl(endpointId: number): Promise<string> {
    const jobIds = await this.crawlEndpoint(endpointId);
    return jobIds[0];
  }

  private async buildRequest(
    endpoint: CrawlEndpoint,
    context: any,
    strategy: any,
  ): Promise<CrawlRequest> {
    const baseParams = { ...endpoint.request.staticQueryParams };
    const paginatedParams = strategy.buildNextRequest(
      context,
      baseParams,
      endpoint.pagination.config,
    );

    // Apply authentication
    const authStrategy = AuthStrategyFactory.create(endpoint.auth.type);
    const request: CrawlRequest = {
      url: endpoint.baseUrl,
      method: endpoint.method,
      headers: { ...endpoint.headers },
      queryParams: paginatedParams,
      body: endpoint.request.bodyTemplate,
    };

    const result = authStrategy.applyAuth(request, endpoint.auth.config, {
      endpointId: endpoint.id,
      timestamp: new Date(),
    });

    // Handle both sync and async auth strategies
    return await Promise.resolve(result);
  }

  private async processAndStoreResponse(
    jobId: string,
    endpoint: CrawlEndpoint,
    response: any,
  ): Promise<void> {
    // Serialize response
    const content = JSON.stringify(response);
    const contentBuffer = Buffer.from(content);

    // Get content handler
    const handler = this.contentHandlerFactory.getHandler(
      'application/json',
      contentBuffer,
    );
    const parsed = handler.parse(contentBuffer);
    const serialized = handler.serialize(parsed);

    // Store response
    await this.storageService.store(
      jobId,
      serialized.content,
      serialized.metadata,
    );

    this.logger.debug(
      `Stored response for job ${jobId}, size: ${serialized.metadata.sizeBytes} bytes`,
    );
  }

  private createMockResponse(
    endpoint: CrawlEndpoint,
    pageCount: number,
    context: any,
  ): any {
    // Create different mock responses based on pagination type
    const items = Array.from({ length: 10 }, (_, i) => ({
      id: `item-${pageCount * 10 + i + 1}`,
      name: `Item ${pageCount * 10 + i + 1}`,
      createdAt: new Date().toISOString(),
    }));

    switch (endpoint.pagination.type) {
      case 'offset':
      case 'page_number':
        return {
          data: items,
          total: 100,
          page: pageCount + 1,
        };

      case 'cursor':
        return {
          data: items,
          pagination: {
            next_cursor: pageCount < 9 ? `cursor-${pageCount + 1}` : null,
            has_more: pageCount < 9,
          },
        };

      case 'none':
      default:
        return { data: items };
    }
  }

  private generateDedupKey(
    request: CrawlRequest,
    keyFields: string[],
  ): string | undefined {
    if (!keyFields || keyFields.length === 0) {
      return undefined;
    }

    const keyParts: any = {};
    if (keyFields.includes('url')) keyParts.url = request.url;
    if (keyFields.includes('method')) keyParts.method = request.method;
    if (keyFields.includes('query_params'))
      keyParts.params = this.sortKeys(request.queryParams);
    if (keyFields.includes('body')) keyParts.body = request.body;
    if (keyFields.includes('headers'))
      keyParts.headers = this.sortKeys(request.headers);

    return crypto
      .createHash('sha256')
      .update(JSON.stringify(keyParts))
      .digest('hex');
  }

  private generateUlid(): string {
    const timestamp = Date.now().toString(36).toUpperCase().padStart(10, '0');
    const random = Array.from({ length: 16 }, () =>
      Math.floor(Math.random() * 36)
        .toString(36)
        .toUpperCase(),
    ).join('');
    return timestamp + random;
  }

  private sortKeys(obj?: Record<string, any>): Record<string, any> | undefined {
    if (!obj) return undefined;
    return Object.keys(obj)
      .sort()
      .reduce(
        (result, key) => {
          result[key] = obj[key];
          return result;
        },
        {} as Record<string, any>,
      );
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
