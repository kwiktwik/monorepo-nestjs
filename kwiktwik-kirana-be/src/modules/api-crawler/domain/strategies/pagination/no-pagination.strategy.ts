import { PaginationStrategy, PaginationContext } from './pagination-strategy.interface';
import { PaginationConfig } from '../../entities/crawl-endpoint.entity';

export class NoPaginationStrategy implements PaginationStrategy {
  getInitialContext(): PaginationContext {
    return {
      currentPage: 1,
      currentOffset: 0,
      hasMore: true,
      itemsFetched: 0,
    };
  }

  buildNextRequest(
    context: PaginationContext,
    baseParams: Record<string, any>,
    config?: PaginationConfig
  ): Record<string, any> {
    return baseParams;
  }

  updateContext(
    context: PaginationContext,
    response: any,
    config?: PaginationConfig
  ): PaginationContext {
    return {
      ...context,
      hasMore: false,
      itemsFetched: 1,
      lastResponse: response,
    };
  }
}
