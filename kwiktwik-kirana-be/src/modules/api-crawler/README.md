# API Crawler Module

A flexible, scalable API crawler built for the KwikTwik Kirana BE system. Designed for easy extraction into a standalone microservice.

## Features

- **Multiple Pagination Strategies**: Offset, Cursor, Page Number, and No Pagination
- **Authentication Support**: API Key, Bearer Token, Custom Headers
- **Content Type Handling**: JSON, Text, Binary (Images, PDFs)
- **Smart Storage**: Small content → Database, Large/Binary → Mock S3 (configurable)
- **Deduplication**: Configurable request deduplication with TTL
- **Rate Limiting**: Per-endpoint rate limiting and delays
- **Scheduling**: Cron-based or interval-based scheduling
- **Retry Logic**: Exponential backoff with configurable retry conditions

## Architecture

```
api-crawler/
├── domain/           # Pure business logic, no external dependencies
│   ├── entities/     # Domain entities (CrawlEndpoint, CrawlJob, CrawlResult)
│   ├── repositories/ # Repository interfaces
│   └── strategies/   # Auth, Pagination, Content handling strategies
├── application/      # Use cases and orchestration
│   └── services/     # CrawlerOrchestrator, CrawlScheduler, etc.
├── infrastructure/   # External concerns (DB, Storage, HTTP)
│   ├── persistence/  # Drizzle repositories and schema
│   ├── storage/      # Mock S3 storage implementation
│   └── http/         # HTTP client implementations
└── presentation/     # API controllers and DTOs
```

## Quick Start

### 1. Run Database Migration

```bash
cd kwiktwik-kirana-be
npx drizzle-kit migrate
```

### 2. Register the Module

```typescript
// app.module.ts
import { ApiCrawlerModule } from './modules/api-crawler';

@Module({
  imports: [
    // ... other modules
    ApiCrawlerModule.forRootAsync(),
  ],
})
export class AppModule {}
```

### 3. Create an Endpoint

```bash
curl -X POST http://localhost:3000/api-crawler/endpoints \
  -H "Content-Type: application/json" \
  -d '{
    "name": "user-api",
    "baseUrl": "https://api.example.com/users",
    "auth": { "type": "none", "config": {} },
    "pagination": { "type": "offset", "config": { "offsetParam": "offset", "limitParam": "limit", "limitValue": 100, "offsetStart": 0 } },
    "response": { "contentHandling": "json", "storage": "database" },
    "schedule": { "enabled": true, "cron": "0 */6 * * *" },
    "rateLimit": { "requestsPerMinute": 60 }
  }'
```

### 4. Trigger a Crawl

```bash
curl -X POST http://localhost:3000/api-crawler/endpoints/1/trigger
```

## Configuration Options

### Pagination Types

| Type | Description | Config Required |
|------|-------------|-----------------|
| `none` | Single request, no pagination | None |
| `offset` | Skip-based pagination | offsetParam, limitParam, limitValue |
| `cursor` | Token-based pagination | cursorParam, limitParam, cursorPath |
| `page_number` | Page number pagination | pageParam, perPageParam, perPageValue |

### Authentication Types

| Type | Description | Config |
|------|-------------|--------|
| `none` | No authentication | `{}` |
| `api_key` | API key in header or query | `{ keyName, keyValue, placement }` |
| `bearer_token` | JWT/Bearer token | `{ token }` |
| `custom_header` | Custom headers | `{ headers: Record<string, string> }` |

### Storage Options

| Type | Description |
|------|-------------|
| `database` | Store in PostgreSQL |
| `s3` | Store in S3 (mock for dev) |
| `hybrid` | Auto-decide based on size |

## Testing

### Unit Tests

```bash
npm test -- --testPathPattern="crawler.unit"
```

### Integration Tests

```bash
npm test -- --testPathPattern="crawler.integration"
```

The integration tests will:
1. Create 10 different endpoint configurations
2. Trigger crawls for each
3. Verify storage contains expected data
4. Print a comprehensive test report

## Future Extraction

To extract this module into a standalone service:

1. Copy `src/modules/api-crawler/domain/` - 100% portable
2. Copy `src/modules/api-crawler/application/` - 100% portable
3. Reimplement infrastructure with new tech choices
4. Create new module entry point

Effort: ~1-2 days

## Database Schema

### crawl_endpoints
Stores endpoint configurations with full flexibility for auth, pagination, rate limiting, etc.

### crawl_jobs
Tracks individual crawl jobs with status, retry counts, and pagination state.

### crawl_results
Stores crawl results with storage location references and content hashes for deduplication.

### crawl_job_history
Analytics table for tracking job execution over time.
