/**
 * Payments V2 Module
 * 
 * A unified payment module supporting multiple payment providers
 * with both provider-managed and user-managed subscription types.
 * 
 * Key Features:
 * - Clear state machine with valid transitions
 * - Provider-specific types from documentation (no any/unknown)
 * - Support for Razorpay and PhonePe
 * - Correct subscription cycle mapping for both providers
 */

// ============================================================================
// Module Exports
// ============================================================================

// NestJS Module
export { PaymentsV2Module } from './payments-v2.module';

// Types
export * from './types';

// Domain
export * from './domain';

// Providers
export * from './providers';

// Services
export * from './services';

// Config
export * from './config';

// Controllers
export * from './controllers';

// Infrastructure
export * from './infrastructure';
