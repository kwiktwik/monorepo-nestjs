import { CrawlRequest } from '../../entities/crawl-job.entity';

export interface AuthContext {
  endpointId: number;
  jobId?: string;
  timestamp: Date;
}

export interface AuthStrategy {
  applyAuth(
    config: CrawlRequest,
    authConfig: any,
    context?: AuthContext,
  ): CrawlRequest | Promise<CrawlRequest>;
}
