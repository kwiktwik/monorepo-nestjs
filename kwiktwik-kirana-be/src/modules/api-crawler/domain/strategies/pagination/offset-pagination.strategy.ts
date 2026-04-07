import { PaginationStrategy, PaginationContext } from './pagination-strategy.interface';
import { OffsetPaginationConfig } from '../../entities/crawl-endpoint.entity';

export class OffsetPaginationStrategy implements PaginationStrategy {
  getInitialContext(): PaginationContext {
    return {
      currentPage: 0,
      currentOffset: 0,
      hasMore: true,
      itemsFetched: 0,
    };
  }

  buildNextRequest(
    context: PaginationContext,
    baseParams: Record<string, any>,
    config?: OffsetPaginationConfig
  ): Record<string, any> {
    if (!config) return baseParams;
    return {
      ...baseParams,
      [config.offsetParam]: context.currentOffset,
      [config.limitParam]: config.limitValue,
    };
  }

  updateContext(
    context: PaginationContext,
    response: any,
    config?: OffsetPaginationConfig
  ): PaginationContext {
    const items = this.extractItems(response) || [];
    const newOffset = context.currentOffset + items.length;
    
    return {
      ...context,
      currentOffset: newOffset,
      itemsFetched: context.itemsFetched + items.length,
      hasMore: config ? items.length === config.limitValue : false,
      lastResponse: response,
    };
  }

  extractItems(response: any): any[] {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response.data)) return response.data;
    if (Array.isArray(response.results)) return response.results;
    if (Array.isArray(response.items)) return response.items;
    return [];
  }
}
