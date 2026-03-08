CREATE TABLE "webhook_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"provider" varchar(50) DEFAULT 'razorpay' NOT NULL,
	"event_type" text NOT NULL,
	"app_id" text NOT NULL,
	"processed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "webhook_events_event_id_unique" UNIQUE("event_id")
);
--> statement-breakpoint
ALTER TABLE "webhook_events" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE INDEX "webhook_events_provider_idx" ON "webhook_events" USING btree ("provider");--> statement-breakpoint
CREATE INDEX "webhook_events_app_id_idx" ON "webhook_events" USING btree ("app_id");--> statement-breakpoint
CREATE INDEX "webhook_events_processed_at_idx" ON "webhook_events" USING btree ("processed_at");