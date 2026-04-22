CREATE TYPE "public"."billing_frequency" AS ENUM('DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY', 'SEMIANNUALLY', 'YEARLY', 'ONDEMAND');--> statement-breakpoint
CREATE TYPE "public"."idempotency_key_status" AS ENUM('IN_PROGRESS', 'COMPLETED', 'FAILED', 'EXPIRED');--> statement-breakpoint
CREATE TYPE "public"."order_status_v2" AS ENUM('CREATED', 'PENDING', 'AUTHORIZED', 'CAPTURED', 'FAILED', 'CANCELLED', 'REFUNDED', 'PARTIALLY_REFUNDED', 'REFUND_PENDING', 'EXPIRED');--> statement-breakpoint
CREATE TYPE "public"."order_type" AS ENUM('ONE_TIME', 'SUBSCRIPTION_SETUP', 'SUBSCRIPTION_RECURRING', 'SUBSCRIPTION_RETRY');--> statement-breakpoint
CREATE TYPE "public"."payment_method_type" AS ENUM('UPI_AUTOPAY', 'UPI_MANDATE', 'CARD_SUBSCRIPTION', 'ENACH', 'PAPER_NACH', 'UPI_QR', 'UPI_INTENT', 'UPI_COLLECT', 'CARD', 'NETBANKING', 'WALLET', 'EMI', 'EDC', 'PAYMENT_LINK');--> statement-breakpoint
CREATE TYPE "public"."payment_provider_v2" AS ENUM('RAZORPAY', 'PHONEPE');--> statement-breakpoint
CREATE TYPE "public"."provider_config_status" AS ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED');--> statement-breakpoint
CREATE TYPE "public"."subscription_status_v2" AS ENUM('CREATED', 'PENDING_AUTH', 'AUTHENTICATED', 'ACTIVATION_IN_PROGRESS', 'ACTIVE', 'PAUSED', 'RETRYING', 'CANCEL_IN_PROGRESS', 'CANCELLED', 'REVOKED', 'EXPIRED', 'FAILED', 'COMPLETED');--> statement-breakpoint
CREATE TYPE "public"."subscription_type" AS ENUM('PROVIDER_MANAGED', 'USER_MANAGED');--> statement-breakpoint
CREATE TYPE "public"."webhook_event_status" AS ENUM('PENDING', 'PROCESSING', 'PROCESSED', 'FAILED', 'DUPLICATE');--> statement-breakpoint
CREATE TABLE "idempotency_keys" (
	"key" varchar(255) PRIMARY KEY NOT NULL,
	"operation_type" varchar(50) NOT NULL,
	"provider" "payment_provider_v2",
	"app_id" text,
	"request_hash" varchar(64) NOT NULL,
	"status" "idempotency_key_status" DEFAULT 'IN_PROGRESS' NOT NULL,
	"result" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders_v2" (
	"id" text PRIMARY KEY NOT NULL,
	"merchant_order_id" varchar(100) NOT NULL,
	"user_id" text NOT NULL,
	"app_id" text NOT NULL,
	"order_type" "order_type" NOT NULL,
	"subscription_type" "subscription_type" NOT NULL,
	"provider" "payment_provider_v2" NOT NULL,
	"config_id" text NOT NULL,
	"environment" varchar(20) NOT NULL,
	"subscription_id" text,
	"amount" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'INR' NOT NULL,
	"status" "order_status_v2" DEFAULT 'CREATED' NOT NULL,
	"payment_method_type" "payment_method_type",
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"paid_at" timestamp with time zone,
	"refunded_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"provider_data" jsonb DEFAULT '{"orderId":"","paymentId":null,"refundId":null,"tokenId":null,"transactionId":null,"raw":{},"intentUrl":null}'::jsonb NOT NULL,
	"metadata" jsonb DEFAULT '{"environment":"SANDBOX","configId":"","description":null,"notes":{}}'::jsonb NOT NULL,
	CONSTRAINT "orders_v2_merchant_order_id_unique" UNIQUE("merchant_order_id")
);
--> statement-breakpoint
CREATE TABLE "payment_transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"subscription_id" text,
	"provider" "payment_provider_v2" NOT NULL,
	"provider_transaction_id" varchar(100) NOT NULL,
	"amount" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'INR' NOT NULL,
	"status" varchar(50) NOT NULL,
	"payment_method" varchar(50),
	"payment_instrument" jsonb,
	"refund_amount" integer DEFAULT 0,
	"refund_id" varchar(100),
	"error_code" varchar(50),
	"error_message" text,
	"provider_data" jsonb,
	"transaction_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_webhook_events" (
	"id" text PRIMARY KEY NOT NULL,
	"provider" "payment_provider_v2" NOT NULL,
	"app_id" text,
	"event_id" varchar(255) NOT NULL,
	"event_type" varchar(100) NOT NULL,
	"normalized_event_type" varchar(100),
	"status" "webhook_event_status" DEFAULT 'PENDING' NOT NULL,
	"merchant_subscription_id" varchar(100),
	"provider_subscription_id" varchar(100),
	"merchant_order_id" varchar(100),
	"provider_order_id" varchar(100),
	"payment_id" varchar(100),
	"parsed_data" jsonb,
	"raw_payload" jsonb NOT NULL,
	"raw_headers" jsonb,
	"signature_valid" boolean DEFAULT false NOT NULL,
	"processing_attempts" integer DEFAULT 0 NOT NULL,
	"last_processing_attempt_at" timestamp with time zone,
	"processing_error" text,
	"event_timestamp" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"processed_at" timestamp with time zone,
	CONSTRAINT "payment_webhook_events_event_id_unique" UNIQUE("provider","event_id")
);
--> statement-breakpoint
CREATE TABLE "plans" (
	"id" text PRIMARY KEY NOT NULL,
	"app_id" text NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"initial_amount" integer NOT NULL,
	"recurring_amount" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'INR' NOT NULL,
	"frequency" "billing_frequency" NOT NULL,
	"total_cycles" integer,
	"provider_plan_ids" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "provider_configs" (
	"id" text PRIMARY KEY NOT NULL,
	"provider" "payment_provider_v2" NOT NULL,
	"app_id" text NOT NULL,
	"environment" varchar(20) NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"status" "provider_config_status" DEFAULT 'ACTIVE' NOT NULL,
	"credentials" jsonb NOT NULL,
	"webhook_secret" text,
	"webhook_url" text,
	"supported_payment_methods" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_used_at" timestamp with time zone,
	CONSTRAINT "provider_configs_provider_app_env_unique" UNIQUE("provider","app_id","environment")
);
--> statement-breakpoint
CREATE TABLE "subscriptions_v2" (
	"id" text PRIMARY KEY NOT NULL,
	"merchant_subscription_id" varchar(100) NOT NULL,
	"user_id" text NOT NULL,
	"app_id" text NOT NULL,
	"subscription_type" "subscription_type" NOT NULL,
	"provider" "payment_provider_v2" NOT NULL,
	"config_id" text NOT NULL,
	"environment" varchar(20) NOT NULL,
	"plan_id" text NOT NULL,
	"initial_amount" integer NOT NULL,
	"recurring_amount" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'INR' NOT NULL,
	"frequency" "billing_frequency" NOT NULL,
	"max_amount" integer,
	"total_cycles" integer,
	"status" "subscription_status_v2" DEFAULT 'CREATED' NOT NULL,
	"previous_status" "subscription_status_v2",
	"billing_cycle_count" integer DEFAULT 0 NOT NULL,
	"next_billing_date" timestamp with time zone,
	"last_billing_date" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"activated_at" timestamp with time zone,
	"cancelled_at" timestamp with time zone,
	"expired_at" timestamp with time zone,
	"provider_data" jsonb DEFAULT '{"subscriptionId":"","orderId":null,"customerId":null,"planId":"","mandateId":null,"raw":{},"lastSyncedAt":"2026-04-22T18:18:56.382Z"}'::jsonb NOT NULL,
	"retry_config" jsonb,
	"payment_failures" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"consecutive_failures" integer DEFAULT 0 NOT NULL,
	"is_premium" boolean DEFAULT false NOT NULL,
	"metadata" jsonb DEFAULT '{"environment":"SANDBOX","configId":"","source":"api","tags":[],"custom":{}}'::jsonb NOT NULL,
	CONSTRAINT "subscriptions_v2_merchant_subscription_id_unique" UNIQUE("merchant_subscription_id")
);
--> statement-breakpoint
CREATE INDEX "idempotency_keys_status_idx" ON "idempotency_keys" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idempotency_keys_expires_at_idx" ON "idempotency_keys" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "idempotency_keys_operation_idx" ON "idempotency_keys" USING btree ("operation_type");--> statement-breakpoint
CREATE INDEX "orders_v2_user_id_idx" ON "orders_v2" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "orders_v2_app_id_idx" ON "orders_v2" USING btree ("app_id");--> statement-breakpoint
CREATE INDEX "orders_v2_provider_idx" ON "orders_v2" USING btree ("provider");--> statement-breakpoint
CREATE INDEX "orders_v2_status_idx" ON "orders_v2" USING btree ("status");--> statement-breakpoint
CREATE INDEX "orders_v2_subscription_idx" ON "orders_v2" USING btree ("subscription_id");--> statement-breakpoint
CREATE INDEX "orders_v2_type_idx" ON "orders_v2" USING btree ("order_type");--> statement-breakpoint
CREATE INDEX "orders_v2_user_app_idx" ON "orders_v2" USING btree ("user_id","app_id");--> statement-breakpoint
CREATE INDEX "orders_v2_merchant_id_idx" ON "orders_v2" USING btree ("merchant_order_id");--> statement-breakpoint
CREATE INDEX "orders_v2_created_at_idx" ON "orders_v2" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "payment_transactions_order_id_idx" ON "payment_transactions" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "payment_transactions_subscription_idx" ON "payment_transactions" USING btree ("subscription_id");--> statement-breakpoint
CREATE INDEX "payment_transactions_provider_idx" ON "payment_transactions" USING btree ("provider");--> statement-breakpoint
CREATE INDEX "payment_transactions_status_idx" ON "payment_transactions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "payment_transactions_transaction_at_idx" ON "payment_transactions" USING btree ("transaction_at");--> statement-breakpoint
CREATE INDEX "payment_transactions_provider_tx_id_idx" ON "payment_transactions" USING btree ("provider_transaction_id");--> statement-breakpoint
CREATE INDEX "payment_webhook_events_provider_idx" ON "payment_webhook_events" USING btree ("provider");--> statement-breakpoint
CREATE INDEX "payment_webhook_events_app_id_idx" ON "payment_webhook_events" USING btree ("app_id");--> statement-breakpoint
CREATE INDEX "payment_webhook_events_event_id_idx" ON "payment_webhook_events" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "payment_webhook_events_event_type_idx" ON "payment_webhook_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "payment_webhook_events_status_idx" ON "payment_webhook_events" USING btree ("status");--> statement-breakpoint
CREATE INDEX "payment_webhook_events_merchant_sub_idx" ON "payment_webhook_events" USING btree ("merchant_subscription_id");--> statement-breakpoint
CREATE INDEX "payment_webhook_events_merchant_order_idx" ON "payment_webhook_events" USING btree ("merchant_order_id");--> statement-breakpoint
CREATE INDEX "payment_webhook_events_created_at_idx" ON "payment_webhook_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "plans_app_id_idx" ON "plans" USING btree ("app_id");--> statement-breakpoint
CREATE INDEX "plans_active_idx" ON "plans" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "provider_configs_provider_app_idx" ON "provider_configs" USING btree ("provider","app_id");--> statement-breakpoint
CREATE INDEX "provider_configs_app_id_idx" ON "provider_configs" USING btree ("app_id");--> statement-breakpoint
CREATE INDEX "provider_configs_status_idx" ON "provider_configs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "provider_configs_default_idx" ON "provider_configs" USING btree ("is_default");--> statement-breakpoint
CREATE INDEX "subscriptions_v2_user_id_idx" ON "subscriptions_v2" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "subscriptions_v2_app_id_idx" ON "subscriptions_v2" USING btree ("app_id");--> statement-breakpoint
CREATE INDEX "subscriptions_v2_provider_idx" ON "subscriptions_v2" USING btree ("provider");--> statement-breakpoint
CREATE INDEX "subscriptions_v2_status_idx" ON "subscriptions_v2" USING btree ("status");--> statement-breakpoint
CREATE INDEX "subscriptions_v2_type_idx" ON "subscriptions_v2" USING btree ("subscription_type");--> statement-breakpoint
CREATE INDEX "subscriptions_v2_next_billing_idx" ON "subscriptions_v2" USING btree ("next_billing_date");--> statement-breakpoint
CREATE INDEX "subscriptions_v2_premium_idx" ON "subscriptions_v2" USING btree ("user_id","is_premium");--> statement-breakpoint
CREATE INDEX "subscriptions_v2_user_app_idx" ON "subscriptions_v2" USING btree ("user_id","app_id");--> statement-breakpoint
CREATE INDEX "subscriptions_v2_merchant_id_idx" ON "subscriptions_v2" USING btree ("merchant_subscription_id");