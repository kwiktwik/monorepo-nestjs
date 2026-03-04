ALTER TABLE "phonepe_subscriptions" RENAME COLUMN "subscription_id" TO "user_id";--> statement-breakpoint
ALTER TABLE "phonepe_subscriptions" DROP CONSTRAINT "phonepe_subscriptions_subscription_id_subscriptions_id_fk";
--> statement-breakpoint
DROP INDEX "phonepe_subscriptions_subscription_id_idx";--> statement-breakpoint
ALTER TABLE "phonepe_subscriptions" ADD COLUMN "app_id" text DEFAULT 'alertpay-default' NOT NULL;--> statement-breakpoint
ALTER TABLE "phonepe_subscriptions" ADD COLUMN "merchant_subscription_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "phonepe_subscriptions" ADD COLUMN "start_date" timestamp;--> statement-breakpoint
ALTER TABLE "phonepe_subscriptions" ADD COLUMN "end_date" timestamp;--> statement-breakpoint
ALTER TABLE "phonepe_subscriptions" ADD COLUMN "next_charge_date" timestamp;--> statement-breakpoint
ALTER TABLE "phonepe_subscriptions" ADD CONSTRAINT "phonepe_subscriptions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "phonepe_subscriptions_userId_idx" ON "phonepe_subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "phonepe_subscriptions_merchant_id_idx" ON "phonepe_subscriptions" USING btree ("merchant_subscription_id");--> statement-breakpoint
ALTER TABLE "phonepe_subscriptions" ADD CONSTRAINT "phonepe_subscriptions_merchant_subscription_id_unique" UNIQUE("merchant_subscription_id");