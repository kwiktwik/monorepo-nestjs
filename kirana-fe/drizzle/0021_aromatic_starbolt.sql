CREATE TABLE "temp_test_notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"payload" jsonb NOT NULL,
	"is_processed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "temp_test_notifications_userId_idx" ON "temp_test_notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "temp_test_notifications_processed_idx" ON "temp_test_notifications" USING btree ("is_processed");