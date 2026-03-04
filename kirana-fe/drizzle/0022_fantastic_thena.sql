CREATE TYPE "public"."payment_provider" AS ENUM('razorpay', 'phonepe');--> statement-breakpoint
CREATE TYPE "public"."phonepe_subscription_state" AS ENUM('CREATED', 'AUTHENTICATED', 'ACTIVE', 'PAUSED', 'CANCELLED', 'COMPLETED', 'FAILED');--> statement-breakpoint
CREATE TABLE "phonepe_orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" varchar(10) NOT NULL,
	"phonepe_order_id" text NOT NULL,
	"state" text,
	"response_code" text,
	"payment_instrument" jsonb,
	"redirect_url" text,
	"merchant_user_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "phonepe_orders_phonepe_order_id_unique" UNIQUE("phonepe_order_id")
);
--> statement-breakpoint
CREATE TABLE "phonepe_subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"subscription_id" varchar(10) NOT NULL,
	"phonepe_subscription_id" text,
	"state" "phonepe_subscription_state",
	"auth_request_id" text,
	"amount_type" text,
	"amount" integer,
	"frequency" text,
	"recurring_count" integer,
	"mobile_number" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "phonepe_subscriptions_phonepe_subscription_id_unique" UNIQUE("phonepe_subscription_id")
);
--> statement-breakpoint
ALTER TABLE "phonepe_orders" ADD CONSTRAINT "phonepe_orders_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "phonepe_subscriptions" ADD CONSTRAINT "phonepe_subscriptions_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "phonepe_orders_order_id_idx" ON "phonepe_orders" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "phonepe_orders_phonepe_order_id_idx" ON "phonepe_orders" USING btree ("phonepe_order_id");--> statement-breakpoint
CREATE INDEX "phonepe_subscriptions_subscription_id_idx" ON "phonepe_subscriptions" USING btree ("subscription_id");--> statement-breakpoint
CREATE INDEX "phonepe_subscriptions_phonepe_id_idx" ON "phonepe_subscriptions" USING btree ("phonepe_subscription_id");