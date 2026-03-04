CREATE TYPE "public"."subscription_status" AS ENUM('created', 'authenticated', 'active', 'pending', 'halted', 'cancelled', 'completed', 'expired');--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" varchar(10) PRIMARY KEY NOT NULL,
	"razorpay_subscription_id" text,
	"razorpay_plan_id" text NOT NULL,
	"user_id" text NOT NULL,
	"customer_id" text NOT NULL,
	"razorpay_customer_id" text,
	"status" "subscription_status" DEFAULT 'created' NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"total_count" integer,
	"paid_count" integer DEFAULT 0 NOT NULL,
	"remaining_count" integer,
	"start_at" timestamp,
	"end_at" timestamp,
	"charge_at" timestamp,
	"current_start" timestamp,
	"current_end" timestamp,
	"notes" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subscriptions_razorpay_subscription_id_unique" UNIQUE("razorpay_subscription_id")
);
--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "subscriptions_userId_idx" ON "subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "subscriptions_razorpay_id_idx" ON "subscriptions" USING btree ("razorpay_subscription_id");