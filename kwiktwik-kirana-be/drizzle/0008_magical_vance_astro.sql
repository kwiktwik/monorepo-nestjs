CREATE TYPE "public"."token_status" AS ENUM('CREATED', 'CONFIRMED', 'REJECTED', 'PAUSED', 'CANCELLED', 'EXPIRED');--> statement-breakpoint
CREATE TABLE "payment_tokens" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"app_id" text NOT NULL,
	"subscription_id" text,
	"provider" "payment_provider_v2" NOT NULL,
	"config_id" text NOT NULL,
	"provider_token_id" varchar(100) NOT NULL,
	"provider_customer_id" varchar(100) NOT NULL,
	"payment_method" "payment_method_type",
	"status" "token_status" DEFAULT 'CREATED' NOT NULL,
	"max_amount" integer,
	"auth_payment_id" varchar(100),
	"customer_email" varchar(255),
	"customer_contact" varchar(20),
	"provider_data" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"confirmed_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"revoked_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "payment_tokens" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "subscriptions_v2" ALTER COLUMN "provider_data" SET DEFAULT '{"subscriptionId":"","orderId":null,"customerId":null,"planId":"","mandateId":null,"raw":{},"lastSyncedAt":"2026-05-19T10:26:05.280Z"}'::jsonb;--> statement-breakpoint
CREATE INDEX "payment_tokens_user_app_idx" ON "payment_tokens" USING btree ("user_id","app_id");--> statement-breakpoint
CREATE INDEX "payment_tokens_subscription_idx" ON "payment_tokens" USING btree ("subscription_id");--> statement-breakpoint
CREATE INDEX "payment_tokens_provider_token_idx" ON "payment_tokens" USING btree ("provider_token_id");--> statement-breakpoint
CREATE INDEX "payment_tokens_status_idx" ON "payment_tokens" USING btree ("status");--> statement-breakpoint
CREATE INDEX "payment_tokens_provider_customer_idx" ON "payment_tokens" USING btree ("provider_customer_id");