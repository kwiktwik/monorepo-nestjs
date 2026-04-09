import {
  pgTable,
  text,
  timestamp,
  integer,
  jsonb,
  pgEnum,
  index,
  uniqueIndex,
  serial,
  varchar,
  boolean,
  bigserial,
} from 'drizzle-orm/pg-core';

// Enums
export const crawlJobStatusEnum = pgEnum('crawl_job_status', [
  'pending',
  'queued',
  'running',
  'completed',
  'failed',
  'cancelled',
  'deduplicated',
]);

export const crawlPriorityEnum = pgEnum('crawl_priority', [
  'critical',
  'high',
  'normal',
  'low',
]);

// Crawl Endpoints Configuration
export const crawlEndpoints = pgTable(
  'crawl_endpoints',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 100 }).notNull().unique(),
    description: text('description'),
    tags: text('tags').array(),
    baseUrl: text('base_url').notNull(),
    method: varchar('method', { length: 10 }).notNull().default('GET'),
    headers: jsonb('headers').$type<Record<string, string>>().default({}),
    timeoutMs: integer('timeout_ms').notNull().default(30000),

    // Auth
    authType: varchar('auth_type', { length: 50 }).notNull().default('none'),
    authConfig: jsonb('auth_config').$type<Record<string, any>>().default({}),

    // Pagination
    paginationType: varchar('pagination_type', { length: 50 })
      .notNull()
      .default('none'),
    paginationConfig: jsonb('pagination_config').$type<Record<string, any>>(),
    paginationMaxPages: integer('pagination_max_pages').default(1000),
    paginationStopOnEmpty: boolean('pagination_stop_on_empty')
      .notNull()
      .default(true),

    // Request
    requestBodyTemplate: jsonb('request_body_template'),
    requestDynamicParams: text('request_dynamic_params').array(),
    requestStaticQueryParams: jsonb('request_static_query_params').default({}),

    // Response
    responseContentHandling: varchar('response_content_handling', {
      length: 50,
    })
      .notNull()
      .default('auto'),
    responseExtractFields: text('response_extract_fields').array(),
    responseMaxDbSizeBytes: integer('response_max_db_size_bytes')
      .notNull()
      .default(102400),
    responseStorage: varchar('response_storage', { length: 50 })
      .notNull()
      .default('hybrid'),

    // Schedule
    scheduleEnabled: boolean('schedule_enabled').notNull().default(true),
    scheduleCron: text('schedule_cron'),
    scheduleIntervalMinutes: integer('schedule_interval_minutes'),
    scheduleRunOnStart: boolean('schedule_run_on_start')
      .notNull()
      .default(false),

    // Rate Limit
    rateLimitRequestsPerMinute: integer('rate_limit_requests_per_minute')
      .notNull()
      .default(60),
    rateLimitMaxConcurrent: integer('rate_limit_max_concurrent')
      .notNull()
      .default(1),
    rateLimitDelayBetweenRequestsMs: integer(
      'rate_limit_delay_between_requests_ms',
    )
      .notNull()
      .default(1000),

    // Retry
    retryMaxAttempts: integer('retry_max_attempts').notNull().default(3),
    retryBackoffMultiplier: integer('retry_backoff_multiplier')
      .notNull()
      .default(2),
    retryInitialDelayMs: integer('retry_initial_delay_ms')
      .notNull()
      .default(1000),
    retryOnStatusCodes: integer('retry_on_status_codes')
      .array()
      .default([429, 500, 502, 503, 504]),

    // Deduplication
    dedupEnabled: boolean('dedup_enabled').notNull().default(true),
    dedupKeyFields: text('dedup_key_fields')
      .array()
      .default(['url', 'method', 'query_params']),
    dedupTtlMinutes: integer('dedup_ttl_minutes').notNull().default(60),

    // Status
    isActive: boolean('is_active').notNull().default(true),
    lastCrawlAt: timestamp('last_crawl_at'),
    nextCrawlAt: timestamp('next_crawl_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    nameIdx: index('crawl_endpoints_name_idx').on(table.name),
    isActiveIdx: index('crawl_endpoints_is_active_idx').on(table.isActive),
    tagsIdx: index('crawl_endpoints_tags_idx').on(table.tags),
  }),
);

// Crawl Jobs
export const crawlJobs = pgTable(
  'crawl_jobs',
  {
    id: varchar('id', { length: 26 }).primaryKey(), // ULID
    endpointId: integer('endpoint_id')
      .notNull()
      .references(() => crawlEndpoints.id, { onDelete: 'cascade' }),

    // Request details
    url: text('url').notNull(),
    method: varchar('method', { length: 10 }).notNull(),
    headers: jsonb('headers').$type<Record<string, string>>().default({}),
    queryParams: jsonb('query_params').$type<Record<string, any>>().default({}),
    body: jsonb('body').$type<Record<string, any>>(),

    // Pagination tracking
    pageNumber: integer('page_number'),
    paginationCursor: text('pagination_cursor'),

    // Deduplication
    dedupKey: varchar('dedup_key', { length: 64 }),
    dedupTtlExpiresAt: timestamp('dedup_ttl_expires_at'),

    // Job status
    status: crawlJobStatusEnum('status').notNull().default('pending'),
    priority: crawlPriorityEnum('priority').notNull().default('normal'),

    // Scheduling
    scheduledAt: timestamp('scheduled_at'),
    startedAt: timestamp('started_at'),
    completedAt: timestamp('completed_at'),

    // Retry tracking
    attemptCount: integer('attempt_count').notNull().default(0),
    lastError: text('last_error'),
    lastErrorAt: timestamp('last_error_at'),

    // Result reference
    resultId: varchar('result_id', { length: 26 }),

    // Metadata
    metadata: jsonb('metadata').$type<Record<string, any>>().default({}),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    endpointIdIdx: index('crawl_jobs_endpoint_id_idx').on(table.endpointId),
    statusIdx: index('crawl_jobs_status_idx').on(table.status),
    priorityIdx: index('crawl_jobs_priority_idx').on(table.priority),
    dedupKeyIdx: uniqueIndex('crawl_jobs_dedup_key_idx').on(
      table.dedupKey,
      table.endpointId,
    ),
    scheduledAtIdx: index('crawl_jobs_scheduled_at_idx').on(table.scheduledAt),
    statusPriorityCreatedIdx: index(
      'crawl_jobs_status_priority_created_idx',
    ).on(table.status, table.priority, table.createdAt),
  }),
);

// Crawl Results
export const crawlResults = pgTable(
  'crawl_results',
  {
    id: varchar('id', { length: 26 }).primaryKey(),
    jobId: varchar('job_id', { length: 26 })
      .notNull()
      .references(() => crawlJobs.id, { onDelete: 'cascade' }),
    endpointId: integer('endpoint_id')
      .notNull()
      .references(() => crawlEndpoints.id, { onDelete: 'cascade' }),

    // Response metadata
    statusCode: integer('status_code').notNull(),
    responseHeaders: jsonb('response_headers')
      .$type<Record<string, string>>()
      .default({}),
    responseSizeBytes: integer('response_size_bytes').notNull(),
    contentType: varchar('content_type', { length: 255 }).notNull(),

    // Content deduplication
    contentHash: varchar('content_hash', { length: 64 }).notNull(),
    contentRefCount: integer('content_ref_count').notNull().default(1),

    // Extracted fields for indexing
    extractedFields: jsonb('extracted_fields').$type<Record<string, any>>(),

    // Storage location
    storageProvider: varchar('storage_provider', { length: 50 })
      .notNull()
      .default('database'),
    storageBucket: varchar('storage_bucket', { length: 255 }),
    storageKey: varchar('storage_key', { length: 1024 }).notNull(),
    storageRegion: varchar('storage_region', { length: 50 }),

    // For small content stored directly in DB
    rawContent: text('raw_content'),

    // TTL for cleanup
    expiresAt: timestamp('expires_at'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    jobIdIdx: uniqueIndex('crawl_results_job_id_idx').on(table.jobId),
    contentHashIdx: index('crawl_results_content_hash_idx').on(
      table.contentHash,
    ),
    endpointIdIdx: index('crawl_results_endpoint_id_idx').on(table.endpointId),
    expiresAtIdx: index('crawl_results_expires_at_idx').on(table.expiresAt),
  }),
);

// Crawl Job History (for analytics)
export const crawlJobHistory = pgTable(
  'crawl_job_history',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    jobId: varchar('job_id', { length: 26 }).notNull(),
    endpointId: integer('endpoint_id').notNull(),
    status: crawlJobStatusEnum('status').notNull(),
    durationMs: integer('duration_ms'),
    attemptCount: integer('attempt_count').notNull(),
    errorType: varchar('error_type', { length: 50 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    jobIdIdx: index('crawl_history_job_id_idx').on(table.jobId),
    endpointIdIdx: index('crawl_history_endpoint_id_idx').on(table.endpointId),
    createdAtIdx: index('crawl_history_created_at_idx').on(table.createdAt),
  }),
);
