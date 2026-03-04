ALTER TABLE "orders" ADD COLUMN "app_id" text DEFAULT 'alertpay-default' NOT NULL;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "app_id" text DEFAULT 'alertpay-default' NOT NULL;--> statement-breakpoint
CREATE INDEX "orders_appId_idx" ON "orders" USING btree ("app_id");--> statement-breakpoint
CREATE INDEX "orders_userId_appId_idx" ON "orders" USING btree ("user_id","app_id");--> statement-breakpoint
CREATE INDEX "subscriptions_appId_idx" ON "subscriptions" USING btree ("app_id");--> statement-breakpoint
CREATE INDEX "subscriptions_userId_appId_idx" ON "subscriptions" USING btree ("user_id","app_id");