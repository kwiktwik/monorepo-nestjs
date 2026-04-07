CREATE TABLE "user_notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"app_id" text NOT NULL,
	"notification_id" text NOT NULL,
	"event_type" text NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"data" jsonb DEFAULT '{}'::jsonb,
	"is_read" boolean DEFAULT false NOT NULL,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_notifications_notification_id_unique" UNIQUE("notification_id")
);
--> statement-breakpoint
ALTER TABLE "user_notifications" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "user_notifications" ADD CONSTRAINT "user_notifications_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_notifications_userId_idx" ON "user_notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_notifications_appId_idx" ON "user_notifications" USING btree ("app_id");--> statement-breakpoint
CREATE INDEX "user_notifications_eventType_idx" ON "user_notifications" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "user_notifications_isRead_idx" ON "user_notifications" USING btree ("is_read");--> statement-breakpoint
CREATE INDEX "user_notifications_createdAt_idx" ON "user_notifications" USING btree ("created_at");