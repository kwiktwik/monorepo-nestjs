CREATE TYPE "public"."phonepe_redemption_state" AS ENUM('NOTIFICATION_IN_PROGRESS', 'NOTIFIED', 'PENDING', 'COMPLETED', 'FAILED');--> statement-breakpoint
CREATE TABLE "phonepe_redemptions" (
	"id" varchar(10) PRIMARY KEY NOT NULL,
	"merchant_order_id" text NOT NULL,
	"merchant_subscription_id" text NOT NULL,
	"phonepe_order_id" text,
	"user_id" text NOT NULL,
	"app_id" text DEFAULT 'alertpay-default' NOT NULL,
	"amount" integer NOT NULL,
	"state" "phonepe_redemption_state" NOT NULL,
	"auto_debit" boolean DEFAULT true NOT NULL,
	"transaction_id" text,
	"notified_at" timestamp,
	"valid_after" timestamp,
	"valid_upto" timestamp,
	"error_code" text,
	"detailed_error_code" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "phonepe_redemptions_merchant_order_id_unique" UNIQUE("merchant_order_id")
);
--> statement-breakpoint
ALTER TABLE "phonepe_redemptions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "phonepe_subscriptions" ALTER COLUMN "state" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."phonepe_subscription_state";--> statement-breakpoint
CREATE TYPE "public"."phonepe_subscription_state" AS ENUM('CREATED', 'ACTIVATION_IN_PROGRESS', 'ACTIVE', 'PAUSED', 'CANCEL_IN_PROGRESS', 'CANCELLED', 'REVOKED', 'EXPIRED', 'FAILED');--> statement-breakpoint
ALTER TABLE "phonepe_subscriptions" ALTER COLUMN "state" SET DATA TYPE "public"."phonepe_subscription_state" USING "state"::"public"."phonepe_subscription_state";--> statement-breakpoint
ALTER TABLE "phonepe_subscriptions" ADD COLUMN "max_amount" integer;--> statement-breakpoint
ALTER TABLE "phonepe_subscriptions" ADD COLUMN "auth_workflow_type" varchar(20);--> statement-breakpoint
ALTER TABLE "phonepe_subscriptions" ADD COLUMN "product_type" varchar(20);--> statement-breakpoint
ALTER TABLE "phonepe_subscriptions" ADD COLUMN "expire_at" timestamp;--> statement-breakpoint
ALTER TABLE "phonepe_subscriptions" ADD COLUMN "activated_at" timestamp;--> statement-breakpoint
ALTER TABLE "phonepe_subscriptions" ADD COLUMN "cancelled_at" timestamp;--> statement-breakpoint
ALTER TABLE "phonepe_subscriptions" ADD COLUMN "metadata" jsonb;--> statement-breakpoint
ALTER TABLE "phonepe_redemptions" ADD CONSTRAINT "phonepe_redemptions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "phonepe_redemptions_order_id_idx" ON "phonepe_redemptions" USING btree ("merchant_order_id");--> statement-breakpoint
CREATE INDEX "phonepe_redemptions_subscription_id_idx" ON "phonepe_redemptions" USING btree ("merchant_subscription_id");--> statement-breakpoint
CREATE INDEX "phonepe_redemptions_userId_idx" ON "phonepe_redemptions" USING btree ("user_id");