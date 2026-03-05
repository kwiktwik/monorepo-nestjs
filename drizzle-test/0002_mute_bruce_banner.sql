ALTER TABLE "account" ADD COLUMN "appId" text;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_providerId_appId_unique" UNIQUE("userId","providerId","appId");