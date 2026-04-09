import { AuthStrategy, AuthContext } from './auth-strategy.interface';
import { CrawlRequest } from '../../entities/crawl-job.entity';

export interface CustomHeaderAuthConfig {
  headers: Record<string, string>;
}

export class CustomHeaderAuthStrategy implements AuthStrategy {
  applyAuth(
    config: CrawlRequest,
    authConfig: CustomHeaderAuthConfig,
    context?: AuthContext,
  ): CrawlRequest {
    return {
      ...config,
      headers: {
        ...config.headers,
        ...authConfig.headers,
      },
    };
  }
}
