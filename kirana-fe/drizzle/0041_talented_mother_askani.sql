CREATE TABLE "cron_notification_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"app_id" text NOT NULL,
	"segment" text NOT NULL,
	"notification_type" text NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"status" text NOT NULL,
	"sent_at" timestamp with time zone DEFAULT now() NOT NULL,
	"error_message" text,
	"fcm_message_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_rate_limits" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"app_id" text NOT NULL,
	"date" text NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	"last_notification_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cron_notification_logs" ADD CONSTRAINT "cron_notification_logs_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_rate_limits" ADD CONSTRAINT "notification_rate_limits_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cron_notification_logs_userId_idx" ON "cron_notification_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "cron_notification_logs_appId_idx" ON "cron_notification_logs" USING btree ("app_id");--> statement-breakpoint
CREATE INDEX "cron_notification_logs_segment_idx" ON "cron_notification_logs" USING btree ("segment");--> statement-breakpoint
CREATE INDEX "cron_notification_logs_status_idx" ON "cron_notification_logs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "cron_notification_logs_sent_at_idx" ON "cron_notification_logs" USING btree ("sent_at");--> statement-breakpoint
CREATE INDEX "cron_notification_logs_user_segment_date_idx" ON "cron_notification_logs" USING btree ("user_id","segment","sent_at");--> statement-breakpoint
CREATE INDEX "notification_rate_limits_userId_idx" ON "notification_rate_limits" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notification_rate_limits_appId_idx" ON "notification_rate_limits" USING btree ("app_id");--> statement-breakpoint
CREATE INDEX "notification_rate_limits_date_idx" ON "notification_rate_limits" USING btree ("date");--> statement-breakpoint
CREATE INDEX "notification_rate_limits_user_date_idx" ON "notification_rate_limits" USING btree ("user_id","date");--> statement-breakpoint
CREATE UNIQUE INDEX "notification_rate_limits_user_app_date_unique" ON "notification_rate_limits" USING btree ("user_id","app_id","date");