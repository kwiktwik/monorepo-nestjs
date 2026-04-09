import { Module, DynamicModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

// Constants
import {
  CRAWL_ENDPOINT_REPOSITORY,
  CRAWL_JOB_REPOSITORY,
  CRAWL_RESULT_REPOSITORY,
  HTTP_CLIENT,
  RESPONSE_STORAGE,
  DEDUPLICATION_SERVICE,
} from './constants';

// Repositories
import { DrizzleCrawlEndpointRepository } from './infrastructure/persistence/drizzle-crawl-endpoint.repository';
import { DrizzleCrawlJobRepository } from './infrastructure/persistence/drizzle-crawl-job.repository';

// Storage
import { MockS3StorageStrategy } from './infrastructure/storage/mock-s3-storage.service';

// Services
import { CrawlerOrchestratorService } from './application/services/crawler-orchestrator.service';
import { CrawlEndpointService } from './application/services/crawl-endpoint.service';
import { CrawlSchedulerService } from './application/services/crawl-scheduler.service';

// Controller
import { ApiCrawlerController } from './presentation/api-crawler.controller';

export interface ApiCrawlerModuleOptions {
  useMockStorage?: boolean;
  mockStorageBucket?: string;
}

@Module({})
export class ApiCrawlerModule {
  static forRootAsync(options?: ApiCrawlerModuleOptions): DynamicModule {
    return {
      module: ApiCrawlerModule,
      imports: [ConfigModule, ScheduleModule.forRoot()],
      controllers: [ApiCrawlerController],
      providers: [
        // Repositories
        {
          provide: CRAWL_ENDPOINT_REPOSITORY,
          useClass: DrizzleCrawlEndpointRepository,
        },
        {
          provide: CRAWL_JOB_REPOSITORY,
          useClass: DrizzleCrawlJobRepository,
        },

        // Storage - using Mock S3 for development
        {
          provide: RESPONSE_STORAGE,
          useClass: MockS3StorageStrategy,
        },

        // Services
        CrawlEndpointService,
        CrawlerOrchestratorService,
        CrawlSchedulerService,
      ],
      exports: [
        CRAWL_ENDPOINT_REPOSITORY,
        CrawlEndpointService,
        CrawlerOrchestratorService,
      ],
    };
  }
}
