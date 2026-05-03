CREATE TYPE "public"."plan_type" AS ENUM('ONE_TIME', 'SUBSCRIPTION');--> statement-breakpoint
ALTER TABLE "plans" ALTER COLUMN "recurring_amount" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN "plan_type" "plan_type" DEFAULT 'SUBSCRIPTION' NOT NULL;--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN "amount" integer;--> statement-breakpoint
CREATE INDEX "plans_plan_type_idx" ON "plans" USING btree ("plan_type");--> statement-breakpoint
ALTER TABLE "plans" ADD CONSTRAINT "plans_subscription_recurring_check" CHECK ("plans"."plan_type" != 'SUBSCRIPTION' OR "plans"."recurring_amount" IS NOT NULL);--> statement-breakpoint
ALTER TABLE "plans" ADD CONSTRAINT "plans_one_time_amount_check" CHECK ("plans"."plan_type" != 'ONE_TIME' OR "plans"."amount" IS NOT NULL);--> statement-breakpoint
ALTER TABLE "plans" ADD CONSTRAINT "plans_one_time_frequency_check" CHECK ("plans"."plan_type" != 'ONE_TIME' OR "plans"."frequency" = 'ONE_TIME');