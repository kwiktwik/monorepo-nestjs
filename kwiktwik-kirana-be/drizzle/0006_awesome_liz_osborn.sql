CREATE TYPE "public"."entitlement_source_type" AS ENUM('SUBSCRIPTION', 'ONE_TIME_ORDER', 'PROMO', 'ADMIN');--> statement-breakpoint
CREATE TABLE "payment_events" (
	"id" text PRIMARY KEY NOT NULL,
	"event_type" varchar(100) NOT NULL,
	"payload" jsonb NOT NULL,
	"metadata" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "payment_events" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "premium_entitlements" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"app_id" text NOT NULL,
	"source_type" "entitlement_source_type" NOT NULL,
	"source_id" text NOT NULL,
	"plan_id" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"valid_from" timestamp with time zone NOT NULL,
	"valid_until" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"revocation_reason" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "premium_entitlements_source_unique" UNIQUE("source_type","source_id")
);
--> statement-breakpoint
ALTER TABLE "premium_entitlements" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "subscriptions_v2" ALTER COLUMN "provider_data" SET DEFAULT '{"subscriptionId":"","orderId":null,"customerId":null,"planId":"","mandateId":null,"raw":{},"lastSyncedAt":"2026-05-03T08:25:25.598Z"}'::jsonb;--> statement-breakpoint
ALTER TABLE "orders_v2" ADD COLUMN "plan_id" text;--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN "premium_duration_days" integer;--> statement-breakpoint
CREATE INDEX "payment_events_event_type_idx" ON "payment_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "payment_events_created_at_idx" ON "payment_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "premium_entitlements_user_app_active_idx" ON "premium_entitlements" USING btree ("user_id","app_id","is_active");--> statement-breakpoint
CREATE INDEX "premium_entitlements_source_idx" ON "premium_entitlements" USING btree ("source_type","source_id");