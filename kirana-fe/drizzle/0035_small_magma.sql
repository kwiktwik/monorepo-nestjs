CREATE TABLE "abandoned_checkouts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"app_id" text NOT NULL,
	"checkout_started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "abandoned_checkouts" ADD CONSTRAINT "abandoned_checkouts_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "abandoned_checkouts_userId_idx" ON "abandoned_checkouts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "abandoned_checkouts_appId_idx" ON "abandoned_checkouts" USING btree ("app_id");--> statement-breakpoint
CREATE INDEX "abandoned_checkouts_user_app_idx" ON "abandoned_checkouts" USING btree ("user_id","app_id");--> statement-breakpoint
CREATE INDEX "abandoned_checkouts_time_idx" ON "abandoned_checkouts" USING btree ("checkout_started_at");