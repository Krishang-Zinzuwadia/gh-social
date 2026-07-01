CREATE TABLE IF NOT EXISTS "trending_repositories" (
	"repo_id" uuid PRIMARY KEY NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"name" varchar(200) NOT NULL,
	"owner" varchar(100) NOT NULL,
	"url" varchar(500) NOT NULL,
	"description" text,
	"star_count" integer DEFAULT 0,
	"daily_stars" integer DEFAULT 0,
	"fork_count" integer DEFAULT 0,
	"primary_language" varchar(50),
	"topics" jsonb DEFAULT '[]',
	"readme" text,
	"trending_rank" integer,
	CONSTRAINT "trending_repositories_full_name_unique" UNIQUE("full_name")
);