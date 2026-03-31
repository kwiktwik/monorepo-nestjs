ALTER TABLE "phonepe_redemptions" ADD COLUMN "attempt_count" integer DEFAULT 1;--> statement-breakpoint
ALTER TABLE "phonepe_redemptions" ADD COLUMN "processed_at" timestamp;--> statement-breakpoint
ALTER TABLE "phonepe_redemptions" ADD COLUMN "correlation_id" varchar(50);--> statement-breakpoint
ALTER TABLE "phonepe_subscriptions" ADD COLUMN "consecutive_failures" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "phonepe_subscriptions" ADD COLUMN "last_failure_at" timestamp;--> statement-breakpoint
ALTER TABLE "phonepe_subscriptions" ADD COLUMN "last_failure_reason" varchar(100);--> statement-breakpoint
ALTER TABLE "phonepe_subscriptions" ADD COLUMN "grace_period_end_at" timestamp;--> statement-breakpoint
ALTER TABLE "phonepe_subscriptions" ADD COLUMN "is_premium" boolean DEFAULT false;--> statement-breakpoint
CREATE INDEX "phonepe_subscriptions_retry_idx" ON "phonepe_subscriptions" USING btree ("next_billing_date","state","is_premium");--> statement-breakpoint
CREATE INDEX "phonepe_subscriptions_premium_idx" ON "phonepe_subscriptions" USING btree ("user_id","is_premium");