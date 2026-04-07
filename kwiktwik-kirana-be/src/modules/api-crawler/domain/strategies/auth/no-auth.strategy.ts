import { AuthStrategy, AuthContext } from './auth-strategy.interface';
import { CrawlRequest } from '../../entities/crawl-job.entity';

export class NoAuthStrategy implements AuthStrategy {
  applyAuth(
    config: CrawlRequest,
    authConfig: any,
    context?: AuthContext
  ): CrawlRequest {
    return config;
  }
}
