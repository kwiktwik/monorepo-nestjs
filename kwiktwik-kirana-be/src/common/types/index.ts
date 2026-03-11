/**
 * Common types exports
 * Import types from here for consistency across the application
 *
 * @example
 * import { AuthenticatedUser, ApiResponse, CacheProvider } from '@common/types';
 */

// Request types (decorators, guards, controllers)
export * from './request.types';

// API types (external services, webhooks)
export * from './api.types';

// Cache types (Redis, in-memory)
export * from './cache.types';

// Test types (fixtures, mocks)
export * from './test.types';
