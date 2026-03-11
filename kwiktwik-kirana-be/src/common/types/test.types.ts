/**
 * Test fixture types for better type safety in tests
 * These types help create consistent, type-safe test data
 */

import { AuthenticatedUser } from './request.types';

/**
 * Base test fixture interface
 */
export interface TestFixture<T> {
  build(): T;
  buildMany(count: number): T[];
}

/**
 * User test fixture data
 */
export interface UserFixture {
  id: string;
  phoneNumber: string;
  appId: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

/**
 * Mock authenticated user for testing
 */
export interface MockAuthenticatedUser extends AuthenticatedUser {
  iat?: number;
  exp?: number;
}

/**
 * Test request context
 */
export interface TestRequestContext {
  user?: MockAuthenticatedUser;
  appId?: string;
  headers?: Record<string, string | string[]>;
}

/**
 * Mock service response
 */
export interface MockServiceResponse<T = unknown> {
  data: T;
  success: boolean;
  error?: string;
}

/**
 * Database seed data structure
 */
export interface SeedData<T = unknown> {
  table: string;
  records: T[];
}

/**
 * Test database configuration
 */
export interface TestDatabaseConfig {
  mockMode: boolean;
  seedFile?: string;
  migrationsFolder?: string;
}

/**
 * API test response wrapper
 */
export interface ApiTestResponse<T = unknown> {
  status: number;
  body: T;
  headers: Record<string, string | string[]>;
}

/**
 * Payment test fixtures
 */
export interface PaymentFixture {
  orderId: string;
  amount: number;
  currency: string;
  status: string;
  provider: 'razorpay' | 'phonepe' | 'stripe';
}

/**
 * Subscription test fixture
 */
export interface SubscriptionFixture {
  id: string;
  planId: string;
  status: string;
  startDate: Date;
  endDate?: Date;
  amount: number;
  currency: string;
}

/**
 * Test scenario builder
 */
export interface TestScenario<T = unknown> {
  name: string;
  setup(): Promise<void>;
  execute(): Promise<T>;
  teardown(): Promise<void>;
}

/**
 * Mock repository interface for testing services
 */
export interface MockRepository<T> {
  findOne(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
}
