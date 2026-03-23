ALTER TABLE "phonepe_subscriptions" ADD COLUMN "next_billing_date" timestamp;--> statement-breakpoint
ALTER TABLE "phonepe_subscriptions" ADD COLUMN "billing_cycle_count" integer DEFAULT 0;--> statement-breakpoint
CREATE INDEX "phonepe_subscriptions_next_billing_date_idx" ON "phonepe_subscriptions" USING btree ("next_billing_date");