# Payment Module V2 - Implementation Plan

## Quick Start Guide

### Prerequisites
- Node.js 18+
- TypeScript 5+
- NestJS 10+
- Drizzle ORM

### Environment Variables Template

```bash
# =============================================================================
# PAYMENT MODULE V2 CONFIGURATION
# =============================================================================

# Razorpay Configuration (per app, per account)
# Format: RAZORPAY_{APP_ID}_{ACCOUNT_ID}_KEY_ID
RAZORPAY_COM_PAYMENTALERT_APP_DEFAULT_KEY_ID=rzp_test_xxx
RAZORPAY_com_paymentalert_app_DEFAULT_KEY_SECRET=xxx
RAZORPAY_com_paymentalert_app_DEFAULT_WEBHOOK_SECRET=xxx

# Multiple accounts for same app
RAZORPAY_COM_PAYMENTALERT_APP_ALT_KEY_ID=rzp_test_yyy
RAZORPAY_com_paymentalert_app_ALT_KEY_SECRET=yyy
RAZORPAY_com_paymentalert_app_ALT_WEBHOOK_SECRET=yyy

# PhonePe Configuration (per app, per account)
# Format: PHONEPE_{APP_ID}_{ACCOUNT_ID}_CLIENT_ID
PHONEPE_com_paymentalert_app_DEFAULT_CLIENT_ID=xxx
PHONEPE_com_paymentalert_app_DEFAULT_CLIENT_SECRET=xxx
PHONEPE_com_paymentalert_app_DEFAULT_MERCHANT_ID=PGTESTPAYUAT
PHONEPE_com_paymentalert_app_DEFAULT_CLIENT_VERSION=1

# Default provider for each app
PAYMENT_com_paymentalert_app_DEFAULT_PROVIDER=RAZORPAY
PAYMENT_com_paymentalert_app_DEFAULT_SUBSCRIPTION_TYPE=PROVIDER_MANAGED
```

---

## Implementation Order

### Step 1: Core Types (Day 1)

Create all type definitions first. These are pure TypeScript with no dependencies.

| File | Purpose | Dependencies |
|------|---------|--------------|
| `types/provider.enum.ts` | Payment provider enum | None |
| `types/subscription-type.enum.ts` | Subscription type enum | None |
| `types/subscription-status.enum.ts` | Subscription status enum | None |
| `types/order-status.enum.ts` | Order status enum | None |
| `types/frequency.enum.ts` | Billing frequency enum | None |
| `types/config.types.ts` | Configuration types | provider.enum.ts |
| `types/plan.types.ts` | Plan types | frequency.enum.ts, provider.enum.ts |
| `types/webhook.types.ts` | Webhook types | provider.enum.ts |
| `types/index.ts` | Export all types | All above |

### Step 2: Domain Entities (Day 1-2)

Create domain entities and repository interfaces.

| File | Purpose | Dependencies |
|------|---------|--------------|
| `domain/value-objects/money.vo.ts` | Money value object | None |
| `domain/value-objects/billing-cycle.vo.ts` | Billing cycle VO | frequency.enum.ts |
| `domain/entities/subscription.entity.ts` | Subscription entity | All types |
| `domain/entities/order.entity.ts` | Order entity | All types |
| `domain/repositories/subscription.repository.interface.ts` | Repository interface | subscription.entity.ts |
| `domain/repositories/order.repository.interface.ts` | Repository interface | order.entity.ts |
| `domain/index.ts` | Export domain | All above |

### Step 3: Configuration System (Day 2)

Create configuration loading and registry.

| File | Purpose | Dependencies |
|------|---------|--------------|
| `config/config-loader.ts` | Load configs from env | config.types.ts |
| `config/config-registry.ts` | Config registry | config.types.ts, config-loader.ts |
| `config/plan-registry.ts` | Plan definitions | plan.types.ts |
| `config/app-payment-config.ts` | App-specific config | config.types.ts |
| `config/index.ts` | Export config | All above |

### Step 4: Provider Interfaces (Day 2-3)

Define provider contracts.

| File | Purpose | Dependencies |
|------|---------|--------------|
| `providers/interfaces/subscription-provider.interface.ts` | Core interface | All types |
| `providers/interfaces/provider-managed.interface.ts` | Provider-managed | subscription-provider.interface.ts |
| `providers/interfaces/user-managed.interface.ts` | User-managed | subscription-provider.interface.ts |
| `providers/interfaces/index.ts` | Export interfaces | All above |

### Step 5: Base Provider (Day 3)

Create shared provider utilities.

| File | Purpose | Dependencies |
|------|---------|--------------|
| `providers/base/provider-utils.ts` | Shared utilities | types |
| `providers/base/base-provider.ts` | Base class | interfaces |

### Step 6: Razorpay Provider (Day 3-4)

Implement Razorpay support.

| File | Purpose | Dependencies |
|------|---------|--------------|
| `providers/razorpay/razorpay.types.ts` | Razorpay types | None |
| `providers/razorpay/razorpay-mapper.ts` | Map types | razorpay.types.ts, types |
| `providers/razorpay/razorpay-provider-managed.ts` | Provider-managed impl | base, interfaces |
| `providers/razorpay/razorpay-user-managed.ts` | User-managed impl | base, interfaces |
| `providers/razorpay/index.ts` | Export | All above |

### Step 7: PhonePe Provider (Day 4-5)

Implement PhonePe support.

| File | Purpose | Dependencies |
|------|---------|--------------|
| `providers/phonepe/phonepe.types.ts` | PhonePe types | None |
| `providers/phonepe/phonepe-mapper.ts` | Map types | phonepe.types.ts, types |
| `providers/phonepe/phonepe-provider-managed.ts` | Provider-managed impl | base, interfaces |
| `providers/phonepe/phonepe-user-managed.ts` | User-managed impl | base, interfaces |
| `providers/phonepe/index.ts` | Export | All above |

### Step 8: Provider Factory (Day 5)

Create factory for provider instantiation.

| File | Purpose | Dependencies |
|------|---------|--------------|
| `providers/factory/provider-factory.ts` | Create providers | All providers, config |
| `providers/factory/index.ts` | Export | provider-factory.ts |
| `providers/index.ts` | Export all providers | All above |

### Step 9: Services (Day 5-6)

Implement business logic services.

| File | Purpose | Dependencies |
|------|---------|--------------|
| `services/interfaces/subscription-manager.interface.ts` | Service interface | domain |
| `services/retry-strategy.service.ts` | Retry logic | types |
| `services/subscription-manager.service.ts` | Subscription management | All above |
| `services/order-manager.service.ts` | Order management | All above |
| `services/billing-scheduler.service.ts` | Billing scheduler | All above |
| `services/premium-status.service.ts` | Premium status | All above |
| `services/index.ts` | Export services | All above |

### Step 10: Webhooks (Day 6-7)

Implement webhook handling.

| File | Purpose | Dependencies |
|------|---------|--------------|
| `webhooks/event-types.ts` | Event definitions | types |
| `webhooks/mappers/razorpay-event.mapper.ts` | Map Razorpay events | event-types.ts |
| `webhooks/mappers/phonepe-event.mapper.ts` | Map PhonePe events | event-types.ts |
| `webhooks/handlers/base.handler.ts` | Base handler | types |
| `webhooks/handlers/handler.registry.ts` | Handler registry | types |
| `webhooks/handlers/subscription-*.handler.ts` | Subscription handlers | base.handler.ts |
| `webhooks/handlers/payment-*.handler.ts` | Payment handlers | base.handler.ts |
| `webhooks/webhook.service.ts` | Webhook processing | All above |
| `webhooks/webhook.controller.ts` | HTTP endpoint | webhook.service.ts |
| `webhooks/index.ts` | Export webhooks | All above |

### Step 11: Infrastructure (Day 7-8)

Implement persistence and queues.

| File | Purpose | Dependencies |
|------|---------|--------------|
| `infrastructure/persistence/drizzle-subscription.repository.ts` | DB repository | domain, schema |
| `infrastructure/persistence/drizzle-order.repository.ts` | DB repository | domain, schema |
| `infrastructure/queue/billing.queue.ts` | Billing queue | services |
| `infrastructure/queue/retry.queue.ts` | Retry queue | services |

### Step 12: Controllers (Day 8)

Implement HTTP endpoints.

| File | Purpose | Dependencies |
|------|---------|--------------|
| `controllers/subscription.controller.ts` | Subscription API | services |
| `controllers/order.controller.ts` | Order API | services |
| `controllers/plan.controller.ts` | Plan API | config |
| `controllers/index.ts` | Export controllers | All above |

### Step 13: Module (Day 8)

Wire everything together.

| File | Purpose | Dependencies |
|------|---------|--------------|
| `payments.module.ts` | NestJS module | All above |
| `index.ts` | Module exports | All above |

### Step 14: Tests (Throughout)

Write tests alongside implementation.

| Directory | Purpose |
|-----------|---------|
| `__tests__/unit/types/` | Type tests |
| `__tests__/unit/config/` | Config tests |
| `__tests__/unit/providers/` | Provider tests |
| `__tests__/unit/services/` | Service tests |
| `__tests__/unit/webhooks/` | Webhook tests |
| `__tests__/integration/` | Integration tests |
| `__tests__/mocks/` | Mock implementations |

---

## Test Coverage Requirements

### Unit Tests (Target: 90%)

```typescript
// Example test structure for a provider
describe('RazorpayProviderManaged', () => {
  describe('initialize', () => {
    it('should initialize with valid config', () => {});
    it('should throw on invalid config', () => {});
  });
  
  describe('setupSubscription', () => {
    it('should create subscription with valid params', () => {});
    it('should map subscription type correctly', () => {});
    it('should track provider and subscription type in result', () => {});
    it('should handle provider errors', () => {});
  });
  
  describe('chargeSubscription', () => {
    it('should charge for provider-managed subscription', () => {});
    it('should return charge result with all tracking fields', () => {});
  });
  
  // ... more tests
});
```

### Integration Tests (Target: 80%)

```typescript
describe('Subscription Flow', () => {
  describe('Provider-Managed Subscription', () => {
    it('should create, activate, and cancel subscription', () => {});
    it('should handle webhooks correctly', () => {});
    it('should track all provider-specific data', () => {});
  });
  
  describe('User-Managed Subscription', () => {
    it('should create subscription and charge manually', () => {});
    it('should handle retries on failure', () => {});
    it('should track retry attempts', () => {});
  });
  
  describe('Multi-Provider', () => {
    it('should route to correct provider based on config', () => {});
    it('should track provider in all data', () => {});
  });
});
```

---

## Database Migration

```sql
-- Migration: 0044_create_unified_payment_tables.sql

-- Create unified subscriptions table
CREATE TABLE unified_subscriptions (
  id VARCHAR(20) PRIMARY KEY,
  merchant_subscription_id VARCHAR(50) UNIQUE NOT NULL,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  app_id TEXT NOT NULL,
  subscription_type VARCHAR(20) NOT NULL,
  provider VARCHAR(20) NOT NULL,
  config_id VARCHAR(50) NOT NULL,
  environment VARCHAR(20) NOT NULL,
  plan_id VARCHAR(50) NOT NULL,
  pricing JSONB NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'CREATED',
  billing_cycle_count INTEGER DEFAULT 0,
  next_billing_date TIMESTAMP,
  last_billing_date TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  activated_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  expired_at TIMESTAMP,
  provider_data JSONB NOT NULL,
  retry_config JSONB,
  payment_failures JSONB DEFAULT '[]',
  consecutive_failures INTEGER DEFAULT 0,
  is_premium BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'
);

-- Create indexes
CREATE INDEX idx_unified_subscriptions_user_app ON unified_subscriptions(user_id, app_id);
CREATE INDEX idx_unified_subscriptions_merchant_id ON unified_subscriptions(merchant_subscription_id);
CREATE INDEX idx_unified_subscriptions_status ON unified_subscriptions(status);
CREATE INDEX idx_unified_subscriptions_provider_type ON unified_subscriptions(provider, subscription_type);
CREATE INDEX idx_unified_subscriptions_next_billing ON unified_subscriptions(next_billing_date) WHERE status = 'ACTIVE';
CREATE INDEX idx_unified_subscriptions_premium ON unified_subscriptions(user_id, app_id, is_premium);

-- Create unified orders table
CREATE TABLE unified_orders (
  id VARCHAR(20) PRIMARY KEY,
  merchant_order_id VARCHAR(50) UNIQUE NOT NULL,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  app_id TEXT NOT NULL,
  subscription_type VARCHAR(20) NOT NULL,
  provider VARCHAR(20) NOT NULL,
  config_id VARCHAR(50) NOT NULL,
  environment VARCHAR(20) NOT NULL,
  subscription_id VARCHAR(20) REFERENCES unified_subscriptions(id) ON DELETE SET NULL,
  amount INTEGER NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'INR',
  status VARCHAR(20) NOT NULL DEFAULT 'CREATED',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  paid_at TIMESTAMP,
  refunded_at TIMESTAMP,
  provider_data JSONB NOT NULL,
  metadata JSONB DEFAULT '{}'
);

-- Create indexes
CREATE INDEX idx_unified_orders_user_app ON unified_orders(user_id, app_id);
CREATE INDEX idx_unified_orders_merchant_id ON unified_orders(merchant_order_id);
CREATE INDEX idx_unified_orders_subscription ON unified_orders(subscription_id);
CREATE INDEX idx_unified_orders_status ON unified_orders(status);
CREATE INDEX idx_unified_orders_provider_type ON unified_orders(provider, subscription_type);

-- Create webhook events table
CREATE TABLE webhook_events (
  id SERIAL PRIMARY KEY,
  event_id VARCHAR(100) UNIQUE NOT NULL,
  provider VARCHAR(20) NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  app_id TEXT,
  subscription_id VARCHAR(20),
  order_id VARCHAR(20),
  payment_id TEXT,
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMP,
  raw_payload JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_webhook_events_event_id ON webhook_events(event_id);
CREATE INDEX idx_webhook_events_processed ON webhook_events(processed, created_at);
CREATE INDEX idx_webhook_events_subscription ON webhook_events(subscription_id);
```

---

## Configuration Example

```typescript
// config/payment.config.ts

import { PaymentProvider, SubscriptionType } from '../types';

export const appPaymentConfig = {
  'com.paymentalert.app': {
    defaultProvider: PaymentProvider.RAZORPAY,
    defaultSubscriptionType: SubscriptionType.PROVIDER_MANAGED,
    providers: {
      [PaymentProvider.RAZORPAY]: {
        accounts: ['default', 'alt'],
        defaultAccount: 'default',
      },
      [PaymentProvider.PHONEPE]: {
        accounts: ['default'],
        defaultAccount: 'default',
      },
    },
    plans: ['plan_S3FaBrk7sjPQEU', 'plan_PHONEPE_AUTOPAY_001'],
  },
  'com.kiranaapps.app': {
    defaultProvider: PaymentProvider.PHONEPE,
    defaultSubscriptionType: SubscriptionType.USER_MANAGED,
    providers: {
      [PaymentProvider.PHONEPE]: {
        accounts: ['default'],
        defaultAccount: 'default',
      },
    },
    plans: ['plan_PHONEPE_AUTOPAY_001'],
  },
} as const;
```

---

## Usage Examples

### Creating a Subscription

```typescript
// Controller
@Post('subscriptions')
async createSubscription(
  @Body() dto: CreateSubscriptionDto,
  @Headers('x-app-id') appId: string,
  @User() user: AuthUser,
) {
  return this.subscriptionManager.createSubscription({
    userId: user.id,
    appId,
    planId: dto.planId,
    subscriptionType: dto.subscriptionType,
    provider: dto.provider,
  });
}

// Service
async createSubscription(params: CreateSubscriptionParams): Promise<CreateSubscriptionResult> {
  // 1. Get app config
  const appConfig = this.configRegistry.getAppConfig(params.appId);
  
  // 2. Resolve provider and config
  const provider = params.provider ?? appConfig.defaultProvider;
  const subscriptionType = params.subscriptionType ?? appConfig.defaultSubscriptionType;
  const config = this.configRegistry.getConfig(provider, params.appId, params.configId);
  
  // 3. Get plan
  const plan = this.planRegistry.getPlan(params.planId);
  
  // 4. Create provider instance
  const providerInstance = this.providerFactory.create(provider, subscriptionType, config);
  
  // 5. Setup subscription with provider
  const setupResult = await providerInstance.setupSubscription({
    userId: params.userId,
    appId: params.appId,
    plan,
    merchantSubscriptionId: this.generateMerchantSubscriptionId(),
    merchantOrderId: this.generateMerchantOrderId(),
  });
  
  // 6. Persist subscription
  const subscription = await this.subscriptionRepo.create({
    id: this.generateId(),
    merchantSubscriptionId: setupResult.merchantSubscriptionId,
    userId: params.userId,
    appId: params.appId,
    subscriptionType,
    provider,
    configId: config.configId,
    environment: config.environment,
    planId: params.planId,
    pricing: plan.pricing,
    status: 'CREATED',
    providerData: setupResult.providerData,
  });
  
  // 7. Create order record
  const order = await this.orderRepo.create({
    id: this.generateId(),
    merchantOrderId: setupResult.merchantOrderId,
    userId: params.userId,
    appId: params.appId,
    subscriptionType,
    provider,
    configId: config.configId,
    environment: config.environment,
    subscriptionId: subscription.id,
    amount: plan.pricing.initialAmount,
    currency: plan.pricing.currency,
    status: 'CREATED',
    providerData: setupResult.providerData,
  });
  
  return {
    subscription,
    order,
    paymentIntent: {
      intentUrl: setupResult.intentUrl,
      expiresAt: setupResult.expiresAt,
    },
  };
}
```

### Handling Webhooks

```typescript
// Webhook Controller
@Post('webhooks/:provider')
async handleWebhook(
  @Param('provider') provider: PaymentProvider,
  @Body() body: unknown,
  @Headers() headers: Record<string, string>,
) {
  // 1. Get provider instance
  const providerInstance = this.providerFactory.createByProvider(provider);
  
  // 2. Parse and verify webhook
  const event = await providerInstance.parseWebhookEvent(
    body,
    headers['x-signature'],
    headers,
  );
  
  // 3. Check idempotency
  const existing = await this.webhookRepo.findByEventId(event.eventId);
  if (existing) {
    return { received: true, duplicate: true };
  }
  
  // 4. Get handler
  const handler = this.handlerRegistry.getHandler(event);
  if (!handler) {
    return { received: true, handled: false };
  }
  
  // 5. Handle event
  const result = await handler.handle(event);
  
  // 6. Mark as processed
  await this.webhookRepo.markProcessed(event.eventId);
  
  return { received: true, handled: result.handled };
}
```

---

## Checklist Before Merge

- [ ] All types defined with strict TypeScript (no `any`, no `unknown`)
- [ ] All enums have proper JSDoc comments
- [ ] All interfaces have proper JSDoc comments
- [ ] Unit tests for all providers (>90% coverage)
- [ ] Unit tests for all services (>90% coverage)
- [ ] Unit tests for webhook handlers (>90% coverage)
- [ ] Integration tests for subscription flow
- [ ] Integration tests for webhook flow
- [ ] Database migration tested
- [ ] Environment variable documentation updated
- [ ] API documentation updated
- [ ] Error handling comprehensive
- [ ] Logging comprehensive
- [ ] All provider data tracked in entities
- [ ] Subscription type tracked in all entities
- [ ] Provider tracked in all entities
