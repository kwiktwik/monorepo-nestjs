ALTER TABLE "abandoned_checkouts" ADD COLUMN "notifications_sent" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "abandoned_checkouts" ADD COLUMN "last_notification_sent_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "abandoned_checkouts" ADD COLUMN "next_notification_scheduled_at" timestamp with time zone;--> statement-breakpoint
CREATE INDEX "abandoned_checkouts_next_notif_idx" ON "abandoned_checkouts" USING btree ("next_notification_scheduled_at");