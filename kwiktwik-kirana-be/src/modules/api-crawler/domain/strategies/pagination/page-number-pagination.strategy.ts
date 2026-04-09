import {
  PaginationStrategy,
  PaginationContext,
} from './pagination-strategy.interface';
import { PageNumberConfig } from '../../entities/crawl-endpoint.entity';

export class PageNumberPaginationStrategy implements PaginationStrategy {
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
    config?: PageNumberConfig,
  ): Record<string, any> {
    if (!config) return baseParams;

    const page =
      context.currentPage === 0 ? config.startPage : context.currentPage + 1;

    return {
      ...baseParams,
      [config.pageParam]: page,
      [config.perPageParam]: config.perPageValue,
    };
  }

  updateContext(
    context: PaginationContext,
    response: any,
    config?: PageNumberConfig,
  ): PaginationContext {
    const items = this.extractItems(response) || [];
    const nextPage = config
      ? context.currentPage === 0
        ? config.startPage + 1
        : context.currentPage + 1
      : context.currentPage + 1;

    return {
      ...context,
      currentPage: nextPage,
      itemsFetched: context.itemsFetched + items.length,
      hasMore: config ? items.length === config.perPageValue : false,
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
