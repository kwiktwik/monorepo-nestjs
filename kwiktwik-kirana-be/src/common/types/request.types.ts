/**
 * Core request types used across the application
 * These types define the structure of requests from decorators and guards
 */

import { Request } from 'express';

/**
 * Authenticated user structure from JWT token
 */
export interface AuthenticatedUser {
  userId: string;
  appId: string;
  phoneNumber?: string;
}

/**
 * Extended Express Request with authenticated user
 * Used by CurrentUser decorator and JWT authentication
 */
export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

/**
 * Extended Express Request with app ID
 * Used by AppId decorator and AppIdGuard
 */
export interface AppIdRequest extends Request {
  appId?: string;
}

/**
 * Extended Express Request with both user and app ID
 * Used by controllers that need both authentication and app context
 */
export interface AppRequest extends Request {
  user?: AuthenticatedUser;
  appId?: string;
}

/**
 * HTTP headers for app identification
 */
export interface AppIdHeaders {
  'x-app-id'?: string | string[];
  'X-App-ID'?: string | string[];
  'x-app-identifier'?: string | string[];
  'X-App-Identifier'?: string | string[];
}

/**
 * Generic API response structure
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * Paginated response structure
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

/**
 * JSON-serializable record type
 * Use this instead of `any` for objects that will be JSON stringified
 */
export type JsonRecord = Record<string, unknown>;

/**
 * Nullable type helper
 */
export type Nullable<T> = T | null;

/**
 * Optional type helper
 */
export type Optional<T> = T | undefined;
