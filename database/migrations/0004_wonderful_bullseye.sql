ALTER TABLE "repo" ADD COLUMN IF NOT EXISTS "star_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "repo" ADD COLUMN IF NOT EXISTS "open_issues_count" integer DEFAULT 0;