ALTER TABLE "session" ADD COLUMN "appId" text;--> statement-breakpoint
ALTER TABLE "user_metadata" ADD COLUMN "app_id" text DEFAULT 'alertpay-default' NOT NULL;--> statement-breakpoint
CREATE INDEX "session_appId_idx" ON "session" USING btree ("appId");--> statement-breakpoint
CREATE INDEX "user_metadata_appId_idx" ON "user_metadata" USING btree ("app_id");