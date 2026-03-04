DROP INDEX "subscriptions_customer_date_idx";--> statement-breakpoint
CREATE INDEX "subscriptions_customer_date_idx" ON "subscriptions" USING btree ("customer_id");