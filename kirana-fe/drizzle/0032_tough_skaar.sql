CREATE TABLE "subscription_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"app_id" text DEFAULT 'alertpay-default' NOT NULL,
	"subscription_id" text,
	"provider" "payment_provider",
	"action" text NOT NULL,
	"status" text,
	"metadata" jsonb,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "subscription_logs" ADD CONSTRAINT "subscription_logs_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "subscription_logs_userId_idx" ON "subscription_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "subscription_logs_appId_idx" ON "subscription_logs" USING btree ("app_id");--> statement-breakpoint
CREATE INDEX "subscription_logs_sub_id_idx" ON "subscription_logs" USING btree ("subscription_id");--> statement-breakpoint
CREATE INDEX "subscription_logs_action_idx" ON "subscription_logs" USING btree ("action");