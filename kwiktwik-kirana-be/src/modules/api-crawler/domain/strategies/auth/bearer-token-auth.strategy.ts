import { AuthStrategy, AuthContext } from './auth-strategy.interface';
import { CrawlRequest } from '../../entities/crawl-job.entity';

export interface BearerTokenAuthConfig {
  token: string;
}

export class BearerTokenAuthStrategy implements AuthStrategy {
  applyAuth(
    config: CrawlRequest,
    authConfig: BearerTokenAuthConfig,
    context?: AuthContext
  ): CrawlRequest {
    return {
      ...config,
      headers: {
        ...config.headers,
        'Authorization': `Bearer ${authConfig.token}`,
      },
    };
  }
}
