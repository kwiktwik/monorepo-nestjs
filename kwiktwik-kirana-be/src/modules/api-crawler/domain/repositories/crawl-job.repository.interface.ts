import {
  CrawlJob,
  CreateCrawlJobInput,
  UpdateCrawlJobInput,
} from '../entities/crawl-job.entity';
import { CrawlJobStatus } from '../../constants';

export interface ICrawlJobRepository {
  create(input: CreateCrawlJobInput): Promise<CrawlJob>;
  findById(id: string): Promise<CrawlJob | null>;
  findByDedupKey(
    endpointId: number,
    dedupKey: string,
  ): Promise<CrawlJob | null>;
  findByEndpointId(endpointId: number, limit?: number): Promise<CrawlJob[]>;
  findByStatus(status: CrawlJobStatus, limit?: number): Promise<CrawlJob[]>;
  updateStatus(
    id: string,
    status: CrawlJobStatus,
    metadata?: UpdateCrawlJobInput,
  ): Promise<void>;
  claimNextPending(): Promise<CrawlJob | null>;
  getPendingCount(): Promise<number>;
  getStats(endpointId?: number): Promise<JobStats>;
}

export interface JobStats {
  total: number;
  pending: number;
  running: number;
  completed: number;
  failed: number;
  deduplicated: number;
}
