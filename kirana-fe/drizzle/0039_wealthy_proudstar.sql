CREATE TABLE "device_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"app_id" text NOT NULL,
	"device_model" text,
	"os_version" text,
	"app_version" text,
	"platform" text,
	"manufacturer" text,
	"brand" text,
	"locale" text,
	"timezone" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "device_sessions" ADD CONSTRAINT "device_sessions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "device_sessions_userId_idx" ON "device_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "device_sessions_appId_idx" ON "device_sessions" USING btree ("app_id");--> statement-breakpoint
CREATE INDEX "device_sessions_created_at_idx" ON "device_sessions" USING btree ("created_at");