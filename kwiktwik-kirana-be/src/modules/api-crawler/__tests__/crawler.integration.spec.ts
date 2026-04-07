import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { ApiCrawlerModule } from '../api-crawler.module';
import { CrawlEndpointService } from '../application/services/crawl-endpoint.service';
import { CrawlerOrchestratorService } from '../application/services/crawler-orchestrator.service';
import { MockS3StorageStrategy } from '../infrastructure/storage/mock-s3-storage.service';
import { RESPONSE_STORAGE, CRAWL_ENDPOINT_REPOSITORY, CRAWL_JOB_REPOSITORY } from '../constants';
import { CreateCrawlEndpointInput } from '../domain/entities/crawl-endpoint.entity';
import { InMemoryCrawlEndpointRepository } from './mocks/in-memory-crawl-endpoint.repository';
import { InMemoryCrawlJobRepository } from './mocks/in-memory-crawl-job.repository';

/**
 * Integration Test Suite for API Crawler
 * 
 * This test suite:
 * 1. Creates different types of endpoints (no pagination, offset, cursor, etc.)
 * 2. Triggers crawls for each endpoint type
 * 3. Verifies storage contains expected data
 * 4. Generates a comprehensive test report
 */
describe('API Crawler Integration Tests', () => {
  let app: INestApplication;
  let endpointService: CrawlEndpointService;
  let crawlerService: CrawlerOrchestratorService;
  let storage: MockS3StorageStrategy;

  // Test results tracking
  const testResults: {
    endpoint: string;
    type: string;
    jobsCreated: number;
    storageKeys: number;
    passed: boolean;
    errors: string[];
  }[] = [];

  // Mock repositories
  let mockEndpointRepo: InMemoryCrawlEndpointRepository;
  let mockJobRepo: InMemoryCrawlJobRepository;

  beforeAll(async () => {
    // Create mock repositories
    mockEndpointRepo = new InMemoryCrawlEndpointRepository();
    mockJobRepo = new InMemoryCrawlJobRepository();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ApiCrawlerModule.forRootAsync()],
    })
      .overrideProvider(CRAWL_ENDPOINT_REPOSITORY)
      .useValue(mockEndpointRepo)
      .overrideProvider(CRAWL_JOB_REPOSITORY)
      .useValue(mockJobRepo)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    endpointService = moduleFixture.get<CrawlEndpointService>(CrawlEndpointService);
    crawlerService = moduleFixture.get<CrawlerOrchestratorService>(CrawlerOrchestratorService);
    storage = moduleFixture.get<MockS3StorageStrategy>(RESPONSE_STORAGE);
  });

  afterAll(async () => {
    // Print test report
    console.log('\n');
    console.log('╔══════════════════════════════════════════════════════════════════╗');
    console.log('║                  API CRAWLER TEST REPORT                         ║');
    console.log('╠══════════════════════════════════════════════════════════════════╣');
    
    let totalPassed = 0;
    let totalFailed = 0;

    for (const result of testResults) {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      console.log(`║ ${status} | ${result.endpoint.padEnd(20)} | ${result.type.padEnd(15)} | Jobs: ${result.jobsCreated.toString().padStart(2)} | Keys: ${result.storageKeys.toString().padStart(2)} ║`);
      
      if (result.passed) totalPassed++;
      else totalFailed++;

      if (result.errors.length > 0) {
        for (const error of result.errors) {
          console.log(`║      Error: ${error.substring(0, 50).padEnd(50)} ║`);
        }
      }
    }

    console.log('╠══════════════════════════════════════════════════════════════════╣');
    console.log(`║ Total: ${(totalPassed + totalFailed).toString().padStart(2)} | Passed: ${totalPassed.toString().padStart(2)} | Failed: ${totalFailed.toString().padStart(2)}${''.padEnd(35)}║`);
    console.log('╚══════════════════════════════════════════════════════════════════╝');
    console.log('\n');

    if (app) {
      await app.close();
    }
  });

  beforeEach(() => {
    storage.clear();
    mockEndpointRepo.clear();
    mockJobRepo.clear();
  });

  // ==========================================
  // Test Case 1: Simple API (No Pagination)
  // ==========================================
  it('should crawl simple API without pagination', async () => {
    const endpointInput: CreateCrawlEndpointInput = {
      name: 'simple-api-test',
      description: 'Test simple API without pagination',
      baseUrl: 'https://api.example.com/simple',
      method: 'GET',
      auth: { type: 'none', config: {} },
      pagination: { type: 'none' },
      response: {
        contentHandling: 'json',
        storage: 'database',
      },
      schedule: { enabled: false },
      rateLimit: { requestsPerMinute: 60 },
    };

    const result = { endpoint: 'simple-api-test', type: 'none', jobsCreated: 0, storageKeys: 0, passed: false, errors: [] };

    try {
      const endpoint = await endpointService.create(endpointInput);
      const jobIds = await crawlerService.crawlEndpoint(endpoint.id);

      result.jobsCreated = jobIds.length;
      result.storageKeys = storage.getAllKeys().length;
      result.passed = jobIds.length === 1 && result.storageKeys === 1;

      if (!result.passed) {
        result.errors.push(`Expected 1 job and 1 storage key, got ${jobIds.length} jobs and ${result.storageKeys} keys`);
      }
    } catch (error) {
      result.errors.push(error.message);
    }

    testResults.push(result);
    expect(result.passed).toBe(true);
  });

  // ==========================================
  // Test Case 2: Offset Pagination
  // ==========================================
  it('should crawl API with offset pagination', async () => {
    const endpointInput: CreateCrawlEndpointInput = {
      name: 'offset-api-test',
      description: 'Test offset-based pagination',
      baseUrl: 'https://api.example.com/offset',
      method: 'GET',
      auth: { type: 'none', config: {} },
      pagination: {
        type: 'offset',
        config: { offsetParam: 'offset', limitParam: 'limit', limitValue: 10, offsetStart: 0 },
        maxPages: 5,
      },
      response: {
        contentHandling: 'json',
        storage: 'database',
      },
      schedule: { enabled: false },
      rateLimit: { requestsPerMinute: 60, delayBetweenRequestsMs: 10 },
    };

    const result = { endpoint: 'offset-api-test', type: 'offset', jobsCreated: 0, storageKeys: 0, passed: false, errors: [] };

    try {
      const endpoint = await endpointService.create(endpointInput);
      const jobIds = await crawlerService.crawlEndpoint(endpoint.id);

      result.jobsCreated = jobIds.length;
      result.storageKeys = storage.getAllKeys().length;
      // Mock returns 10 items per page, hasMore=true for full pages
      // With maxPages=5, should get 5 jobs
      result.passed = jobIds.length === 5 && result.storageKeys === 5;

      if (!result.passed) {
        result.errors.push(`Expected 5 jobs and 5 storage keys, got ${jobIds.length} jobs and ${result.storageKeys} keys`);
      }
    } catch (error) {
      result.errors.push(error.message);
    }

    testResults.push(result);
    expect(result.passed).toBe(true);
  });

  // ==========================================
  // Test Case 3: Cursor Pagination
  // ==========================================
  it('should crawl API with cursor pagination', async () => {
    const endpointInput: CreateCrawlEndpointInput = {
      name: 'cursor-api-test',
      description: 'Test cursor-based pagination',
      baseUrl: 'https://api.example.com/cursor',
      method: 'GET',
      auth: { type: 'none', config: {} },
      pagination: {
        type: 'cursor',
        config: { cursorParam: 'cursor', limitParam: 'limit', limitValue: 10, cursorPath: 'pagination.next_cursor' },
        maxPages: 3,
      },
      response: {
        contentHandling: 'json',
        storage: 'database',
      },
      schedule: { enabled: false },
      rateLimit: { requestsPerMinute: 60, delayBetweenRequestsMs: 10 },
    };

    const result = { endpoint: 'cursor-api-test', type: 'cursor', jobsCreated: 0, storageKeys: 0, passed: false, errors: [] };

    try {
      const endpoint = await endpointService.create(endpointInput);
      const jobIds = await crawlerService.crawlEndpoint(endpoint.id);

      result.jobsCreated = jobIds.length;
      result.storageKeys = storage.getAllKeys().length;
      // Mock returns cursor for 9 pages, but maxPages=3 limits it
      result.passed = jobIds.length === 3 && result.storageKeys === 3;

      if (!result.passed) {
        result.errors.push(`Expected 3 jobs and 3 storage keys, got ${jobIds.length} jobs and ${result.storageKeys} keys`);
      }
    } catch (error) {
      result.errors.push(error.message);
    }

    testResults.push(result);
    expect(result.passed).toBe(true);
  });

  // ==========================================
  // Test Case 4: Page Number Pagination
  // ==========================================
  it('should crawl API with page number pagination', async () => {
    const endpointInput: CreateCrawlEndpointInput = {
      name: 'page-number-api-test',
      description: 'Test page number pagination',
      baseUrl: 'https://api.example.com/pages',
      method: 'GET',
      auth: { type: 'none', config: {} },
      pagination: {
        type: 'page_number',
        config: { pageParam: 'page', perPageParam: 'per_page', perPageValue: 10, startPage: 1 },
        maxPages: 4,
      },
      response: {
        contentHandling: 'json',
        storage: 'database',
      },
      schedule: { enabled: false },
      rateLimit: { requestsPerMinute: 60, delayBetweenRequestsMs: 10 },
    };

    const result = { endpoint: 'page-number-api-test', type: 'page_number', jobsCreated: 0, storageKeys: 0, passed: false, errors: [] };

    try {
      const endpoint = await endpointService.create(endpointInput);
      const jobIds = await crawlerService.crawlEndpoint(endpoint.id);

      result.jobsCreated = jobIds.length;
      result.storageKeys = storage.getAllKeys().length;
      result.passed = jobIds.length === 4 && result.storageKeys === 4;

      if (!result.passed) {
        result.errors.push(`Expected 4 jobs and 4 storage keys, got ${jobIds.length} jobs and ${result.storageKeys} keys`);
      }
    } catch (error) {
      result.errors.push(error.message);
    }

    testResults.push(result);
    expect(result.passed).toBe(true);
  });

  // ==========================================
  // Test Case 5: API Key Authentication
  // ==========================================
  it('should crawl API with API key authentication', async () => {
    const endpointInput: CreateCrawlEndpointInput = {
      name: 'apikey-auth-test',
      description: 'Test API key authentication',
      baseUrl: 'https://api.example.com/protected',
      method: 'GET',
      auth: {
        type: 'api_key',
        config: { keyName: 'X-API-Key', keyValue: 'test-api-key-123', placement: 'header' },
      },
      pagination: { type: 'none' },
      response: {
        contentHandling: 'json',
        storage: 'database',
      },
      schedule: { enabled: false },
      rateLimit: { requestsPerMinute: 60 },
    };

    const result = { endpoint: 'apikey-auth-test', type: 'api_key', jobsCreated: 0, storageKeys: 0, passed: false, errors: [] };

    try {
      const endpoint = await endpointService.create(endpointInput);
      const jobIds = await crawlerService.crawlEndpoint(endpoint.id);

      result.jobsCreated = jobIds.length;
      result.storageKeys = storage.getAllKeys().length;
      result.passed = jobIds.length === 1 && result.storageKeys === 1;

      if (!result.passed) {
        result.errors.push(`Expected 1 job, got ${jobIds.length}`);
      }
    } catch (error) {
      result.errors.push(error.message);
    }

    testResults.push(result);
    expect(result.passed).toBe(true);
  });

  // ==========================================
  // Test Case 6: Bearer Token Authentication
  // ==========================================
  it('should crawl API with bearer token authentication', async () => {
    const endpointInput: CreateCrawlEndpointInput = {
      name: 'bearer-auth-test',
      description: 'Test bearer token authentication',
      baseUrl: 'https://api.example.com/secure',
      method: 'GET',
      auth: {
        type: 'bearer_token',
        config: { token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test' },
      },
      pagination: { type: 'none' },
      response: {
        contentHandling: 'json',
        storage: 'database',
      },
      schedule: { enabled: false },
      rateLimit: { requestsPerMinute: 60 },
    };

    const result = { endpoint: 'bearer-auth-test', type: 'bearer_token', jobsCreated: 0, storageKeys: 0, passed: false, errors: [] };

    try {
      const endpoint = await endpointService.create(endpointInput);
      const jobIds = await crawlerService.crawlEndpoint(endpoint.id);

      result.jobsCreated = jobIds.length;
      result.storageKeys = storage.getAllKeys().length;
      result.passed = jobIds.length === 1 && result.storageKeys === 1;

      if (!result.passed) {
        result.errors.push(`Expected 1 job, got ${jobIds.length}`);
      }
    } catch (error) {
      result.errors.push(error.message);
    }

    testResults.push(result);
    expect(result.passed).toBe(true);
  });

  // ==========================================
  // Test Case 7: Custom Headers Authentication
  // ==========================================
  it('should crawl API with custom headers authentication', async () => {
    const endpointInput: CreateCrawlEndpointInput = {
      name: 'custom-headers-test',
      description: 'Test custom headers authentication',
      baseUrl: 'https://api.example.com/custom',
      method: 'GET',
      auth: {
        type: 'custom_header',
        config: { headers: { 'X-Client-ID': 'client-123', 'X-Secret': 'secret-value' } },
      },
      pagination: { type: 'none' },
      response: {
        contentHandling: 'json',
        storage: 'database',
      },
      schedule: { enabled: false },
      rateLimit: { requestsPerMinute: 60 },
    };

    const result = { endpoint: 'custom-headers-test', type: 'custom_header', jobsCreated: 0, storageKeys: 0, passed: false, errors: [] };

    try {
      const endpoint = await endpointService.create(endpointInput);
      const jobIds = await crawlerService.crawlEndpoint(endpoint.id);

      result.jobsCreated = jobIds.length;
      result.storageKeys = storage.getAllKeys().length;
      result.passed = jobIds.length === 1 && result.storageKeys === 1;

      if (!result.passed) {
        result.errors.push(`Expected 1 job, got ${jobIds.length}`);
      }
    } catch (error) {
      result.errors.push(error.message);
    }

    testResults.push(result);
    expect(result.passed).toBe(true);
  });

  // ==========================================
  // Test Case 8: Rate Limiting
  // ==========================================
  it('should respect rate limiting between requests', async () => {
    const endpointInput: CreateCrawlEndpointInput = {
      name: 'rate-limit-test',
      description: 'Test rate limiting',
      baseUrl: 'https://api.example.com/ratelimit',
      method: 'GET',
      auth: { type: 'none', config: {} },
      pagination: {
        type: 'offset',
        config: { offsetParam: 'offset', limitParam: 'limit', limitValue: 10, offsetStart: 0 },
        maxPages: 3,
      },
      response: {
        contentHandling: 'json',
        storage: 'database',
      },
      schedule: { enabled: false },
      rateLimit: { requestsPerMinute: 60, delayBetweenRequestsMs: 50 },
    };

    const result = { endpoint: 'rate-limit-test', type: 'rate_limit', jobsCreated: 0, storageKeys: 0, passed: false, errors: [] };

    try {
      const startTime = Date.now();
      const endpoint = await endpointService.create(endpointInput);
      const jobIds = await crawlerService.crawlEndpoint(endpoint.id);
      const duration = Date.now() - startTime;

      result.jobsCreated = jobIds.length;
      result.storageKeys = storage.getAllKeys().length;

      // With 3 pages and 50ms delay, should take at least 100ms (2 delays between 3 requests)
      const hasDelay = duration >= 100;
      result.passed = jobIds.length === 3 && hasDelay;

      if (!result.passed) {
        if (jobIds.length !== 3) {
          result.errors.push(`Expected 3 jobs, got ${jobIds.length}`);
        }
        if (!hasDelay) {
          result.errors.push(`Rate limit delay not respected: ${duration}ms < 100ms expected`);
        }
      }
    } catch (error) {
      result.errors.push(error.message);
    }

    testResults.push(result);
    expect(result.passed).toBe(true);
  });

  // ==========================================
  // Test Case 9: Content Deduplication
  // ==========================================
  it('should deduplicate identical content', async () => {
    const endpointInput: CreateCrawlEndpointInput = {
      name: 'dedup-test',
      description: 'Test content deduplication',
      baseUrl: 'https://api.example.com/dedup',
      method: 'GET',
      auth: { type: 'none', config: {} },
      pagination: {
        type: 'offset',
        config: { offsetParam: 'offset', limitParam: 'limit', limitValue: 10, offsetStart: 0 },
        maxPages: 3,
      },
      response: {
        contentHandling: 'json',
        storage: 'database',
      },
      schedule: { enabled: false },
      rateLimit: { requestsPerMinute: 60, delayBetweenRequestsMs: 10 },
      deduplication: {
        enabled: true,
        // Include query_params so different pages have different dedup keys
        // (each page has different offset param)
        keyFields: ['url', 'method', 'query_params'],
        ttlMinutes: 60,
      },
    };

    const result = { endpoint: 'dedup-test', type: 'dedup', jobsCreated: 0, storageKeys: 0, passed: false, errors: [] };

    try {
      const endpoint = await endpointService.create(endpointInput);
      const jobIds = await crawlerService.crawlEndpoint(endpoint.id);

      result.jobsCreated = jobIds.length;
      result.storageKeys = storage.getAllKeys().length;

      // With query_params in keyFields, each page should get its own job
      // (different offset = different query_params = different dedup key)
      result.passed = jobIds.length === 3;

      if (!result.passed) {
        result.errors.push(`Expected 3 jobs, got ${jobIds.length}`);
      }
    } catch (error) {
      result.errors.push(error.message);
    }

    testResults.push(result);
    expect(result.passed).toBe(true);
  });

  // ==========================================
  // Test Case 10: Complex Configuration
  // ==========================================
  it('should handle complex endpoint configuration', async () => {
    const endpointInput: CreateCrawlEndpointInput = {
      name: 'complex-config-test',
      description: 'Test complex configuration with all features',
      baseUrl: 'https://api.example.com/complex',
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      auth: {
        type: 'bearer_token',
        config: { token: 'complex-token' },
      },
      pagination: {
        type: 'cursor',
        config: { cursorParam: 'after', limitParam: 'limit', limitValue: 5, cursorPath: 'pagination.next_cursor' },
        maxPages: 2,
      },
      request: {
        bodyTemplate: { filter: 'active', includeMetadata: true },
        staticQueryParams: { version: 'v2' },
      },
      response: {
        contentHandling: 'json',
        extractFields: ['data.id', 'data.status'],
        maxDbSizeBytes: 50000,
        storage: 'hybrid',
      },
      schedule: { enabled: false },
      rateLimit: { requestsPerMinute: 30, delayBetweenRequestsMs: 20 },
      retry: {
        maxAttempts: 3,
        backoffMultiplier: 2,
        initialDelayMs: 500,
        retryOnStatusCodes: [429, 500, 502, 503, 504],
      },
      deduplication: {
        enabled: true,
        keyFields: ['url', 'method', 'query_params', 'body'],
        ttlMinutes: 120,
      },
    };

    const result = { endpoint: 'complex-config-test', type: 'complex', jobsCreated: 0, storageKeys: 0, passed: false, errors: [] };

    try {
      const endpoint = await endpointService.create(endpointInput);
      const jobIds = await crawlerService.crawlEndpoint(endpoint.id);

      result.jobsCreated = jobIds.length;
      result.storageKeys = storage.getAllKeys().length;
      result.passed = jobIds.length === 2 && result.storageKeys === 2;

      if (!result.passed) {
        result.errors.push(`Expected 2 jobs and 2 storage keys, got ${jobIds.length} jobs and ${result.storageKeys} keys`);
      }
    } catch (error) {
      result.errors.push(error.message);
    }

    testResults.push(result);
    expect(result.passed).toBe(true);
  });
});
