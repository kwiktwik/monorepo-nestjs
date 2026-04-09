import { AuthStrategy, AuthContext } from './auth-strategy.interface';
import { CrawlRequest } from '../../entities/crawl-job.entity';

export interface ApiKeyAuthConfig {
  keyName: string;
  keyValue: string;
  placement: 'header' | 'query';
}

export class ApiKeyAuthStrategy implements AuthStrategy {
  applyAuth(
    config: CrawlRequest,
    authConfig: ApiKeyAuthConfig,
    context?: AuthContext,
  ): CrawlRequest {
    const newConfig: CrawlRequest = {
      ...config,
      headers: { ...config.headers },
      queryParams: { ...config.queryParams },
    };

    if (authConfig.placement === 'header') {
      newConfig.headers = {
        ...newConfig.headers,
        [authConfig.keyName]: authConfig.keyValue,
      };
    } else {
      newConfig.queryParams = {
        ...newConfig.queryParams,
        [authConfig.keyName]: authConfig.keyValue,
      };
    }

    return newConfig;
  }
}
