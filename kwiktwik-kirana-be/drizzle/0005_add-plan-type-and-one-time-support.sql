CREATE TYPE "public"."plan_type" AS ENUM('ONE_TIME', 'SUBSCRIPTION');--> statement-breakpoint
ALTER TYPE "public"."billing_frequency" ADD VALUE 'ONE_TIME';