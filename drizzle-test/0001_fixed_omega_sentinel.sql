CREATE TYPE "public"."team_notification_status" AS ENUM('SUCCESS', 'FAILED');--> statement-breakpoint
CREATE TABLE "abandoned_checkouts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"app_id" text NOT NULL,
	"checkout_started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"offer_expires_at" timestamp with time zone,
	"discount_notification_sent" boolean DEFAULT false NOT NULL,
	"discount_notification_sent_at" timestamp with time zone,
	"notifications_sent" integer DEFAULT 0 NOT NULL,
	"last_notification_sent_at" timestamp with time zone,
	"next_notification_scheduled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "abandoned_checkouts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "team_notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"notification_log_id" integer NOT NULL,
	"transaction_key" text NOT NULL,
	"sent_at" timestamp with time zone DEFAULT now() NOT NULL,
	"recipient_count" integer DEFAULT 0 NOT NULL,
	"status" "team_notification_status" DEFAULT 'SUCCESS' NOT NULL,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "team_notifications_transactionKey_unique" UNIQUE("transaction_key")
);
--> statement-breakpoint
ALTER TABLE "team_notifications" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "abandoned_checkouts" ADD CONSTRAINT "abandoned_checkouts_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_notifications" ADD CONSTRAINT "team_notifications_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_notifications" ADD CONSTRAINT "team_notifications_notification_log_id_notification_logs_id_fk" FOREIGN KEY ("notification_log_id") REFERENCES "public"."notification_logs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "abandoned_checkouts_userId_idx" ON "abandoned_checkouts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "abandoned_checkouts_appId_idx" ON "abandoned_checkouts" USING btree ("app_id");--> statement-breakpoint
CREATE INDEX "abandoned_checkouts_user_app_idx" ON "abandoned_checkouts" USING btree ("user_id","app_id");--> statement-breakpoint
CREATE INDEX "abandoned_checkouts_time_idx" ON "abandoned_checkouts" USING btree ("checkout_started_at");--> statement-breakpoint
CREATE INDEX "abandoned_checkouts_expiry_idx" ON "abandoned_checkouts" USING btree ("offer_expires_at");--> statement-breakpoint
CREATE INDEX "abandoned_checkouts_next_notif_idx" ON "abandoned_checkouts" USING btree ("next_notification_scheduled_at");--> statement-breakpoint
CREATE INDEX "team_notifications_userId_idx" ON "team_notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "team_notifications_logId_idx" ON "team_notifications" USING btree ("notification_log_id");--> statement-breakpoint
CREATE INDEX "team_notifications_transactionKey_idx" ON "team_notifications" USING btree ("transaction_key");