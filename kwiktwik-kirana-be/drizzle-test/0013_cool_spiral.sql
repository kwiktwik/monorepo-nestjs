CREATE TYPE "public"."experiment_event_type" AS ENUM('exposure', 'conversion', 'custom');--> statement-breakpoint
CREATE TYPE "public"."experiment_status" AS ENUM('draft', 'running', 'paused', 'concluded');--> statement-breakpoint
CREATE TYPE "public"."identity_type" AS ENUM('firebaseInstallationId', 'deviceId', 'userId');--> statement-breakpoint
CREATE TABLE "experiment_cohorts" (
	"id" serial PRIMARY KEY NOT NULL,
	"experiment_id" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"weight" integer DEFAULT 50 NOT NULL,
	"config" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "experiment_cohorts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "experiment_events" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"experiment_id" integer NOT NULL,
	"subject_id" text NOT NULL,
	"app_id" text NOT NULL,
	"cohort_id" integer NOT NULL,
	"event_type" "experiment_event_type" NOT NULL,
	"event_name" varchar(100),
	"properties" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "experiment_events" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "experiments" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"app_id" text NOT NULL,
	"feature_flag_id" integer,
	"status" "experiment_status" DEFAULT 'draft' NOT NULL,
	"traffic_allocation" integer DEFAULT 100 NOT NULL,
	"start_date" timestamp,
	"end_date" timestamp,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "experiments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "feature_flags" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar(100) NOT NULL,
	"app_id" text NOT NULL,
	"description" text,
	"default_value" jsonb DEFAULT '{"enabled":false}'::jsonb NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "feature_flags_key_app_unique" UNIQUE("key","app_id")
);
--> statement-breakpoint
ALTER TABLE "feature_flags" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "user_experiment_assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"subject_id" text NOT NULL,
	"subject_type" "identity_type" NOT NULL,
	"app_id" text NOT NULL,
	"experiment_id" integer NOT NULL,
	"cohort_id" integer NOT NULL,
	"assigned_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "uea_subject_experiment_unique" UNIQUE("subject_id","experiment_id")
);
--> statement-breakpoint
ALTER TABLE "user_experiment_assignments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "experiment_cohorts" ADD CONSTRAINT "experiment_cohorts_experiment_id_experiments_id_fk" FOREIGN KEY ("experiment_id") REFERENCES "public"."experiments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "experiment_events" ADD CONSTRAINT "experiment_events_experiment_id_experiments_id_fk" FOREIGN KEY ("experiment_id") REFERENCES "public"."experiments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "experiment_events" ADD CONSTRAINT "experiment_events_cohort_id_experiment_cohorts_id_fk" FOREIGN KEY ("cohort_id") REFERENCES "public"."experiment_cohorts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "experiments" ADD CONSTRAINT "experiments_app_id_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."apps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "experiments" ADD CONSTRAINT "experiments_feature_flag_id_feature_flags_id_fk" FOREIGN KEY ("feature_flag_id") REFERENCES "public"."feature_flags"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feature_flags" ADD CONSTRAINT "feature_flags_app_id_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."apps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_experiment_assignments" ADD CONSTRAINT "user_experiment_assignments_experiment_id_experiments_id_fk" FOREIGN KEY ("experiment_id") REFERENCES "public"."experiments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_experiment_assignments" ADD CONSTRAINT "user_experiment_assignments_cohort_id_experiment_cohorts_id_fk" FOREIGN KEY ("cohort_id") REFERENCES "public"."experiment_cohorts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "experiment_cohorts_experiment_idx" ON "experiment_cohorts" USING btree ("experiment_id");--> statement-breakpoint
CREATE INDEX "exp_events_experiment_idx" ON "experiment_events" USING btree ("experiment_id");--> statement-breakpoint
CREATE INDEX "exp_events_subject_idx" ON "experiment_events" USING btree ("subject_id");--> statement-breakpoint
CREATE INDEX "exp_events_created_idx" ON "experiment_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "exp_events_experiment_type_idx" ON "experiment_events" USING btree ("experiment_id","event_type");--> statement-breakpoint
CREATE INDEX "experiments_app_idx" ON "experiments" USING btree ("app_id");--> statement-breakpoint
CREATE INDEX "experiments_status_idx" ON "experiments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "experiments_app_status_idx" ON "experiments" USING btree ("app_id","status");--> statement-breakpoint
CREATE INDEX "feature_flags_app_idx" ON "feature_flags" USING btree ("app_id");--> statement-breakpoint
CREATE INDEX "uea_subject_idx" ON "user_experiment_assignments" USING btree ("subject_id");--> statement-breakpoint
CREATE INDEX "uea_subject_app_idx" ON "user_experiment_assignments" USING btree ("subject_id","app_id");--> statement-breakpoint
CREATE INDEX "uea_experiment_idx" ON "user_experiment_assignments" USING btree ("experiment_id");