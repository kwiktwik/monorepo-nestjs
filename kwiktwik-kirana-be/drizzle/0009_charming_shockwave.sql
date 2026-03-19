ALTER TABLE "subscription_logs" RENAME TO "webhook_logs";--> statement-breakpoint
ALTER TABLE "webhook_logs" DROP CONSTRAINT "subscription_logs_user_id_user_id_fk";
--> statement-breakpoint
DROP INDEX "subscription_logs_userId_idx";--> statement-breakpoint
DROP INDEX "subscription_logs_appId_idx";--> statement-breakpoint
DROP INDEX "subscription_logs_sub_id_idx";--> statement-breakpoint
DROP INDEX "subscription_logs_action_idx";--> statement-breakpoint
ALTER TABLE "device_sessions" ALTER COLUMN "device_model" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "device_sessions" ALTER COLUMN "app_version" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "device_sessions" ADD COLUMN "build_number" text NOT NULL;--> statement-breakpoint
ALTER TABLE "webhook_logs" ADD COLUMN "entity_type" text NOT NULL;--> statement-breakpoint
ALTER TABLE "webhook_logs" ADD COLUMN "entity_id" text;--> statement-breakpoint
ALTER TABLE "webhook_logs" ADD COLUMN "order_id" text;--> statement-breakpoint
ALTER TABLE "webhook_logs" ADD CONSTRAINT "webhook_logs_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "webhook_logs_userId_idx" ON "webhook_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "webhook_logs_appId_idx" ON "webhook_logs" USING btree ("app_id");--> statement-breakpoint
CREATE INDEX "webhook_logs_entity_type_idx" ON "webhook_logs" USING btree ("entity_type");--> statement-breakpoint
CREATE INDEX "webhook_logs_entity_id_idx" ON "webhook_logs" USING btree ("entity_id");--> statement-breakpoint
CREATE INDEX "webhook_logs_sub_id_idx" ON "webhook_logs" USING btree ("subscription_id");--> statement-breakpoint
CREATE INDEX "webhook_logs_order_id_idx" ON "webhook_logs" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "webhook_logs_action_idx" ON "webhook_logs" USING btree ("action");