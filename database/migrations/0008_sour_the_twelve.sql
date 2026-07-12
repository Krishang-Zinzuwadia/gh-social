CREATE TABLE "user_feedback" (
	"user_id" uuid NOT NULL,
	"repo_id" uuid NOT NULL,
	"interaction_type" varchar(50) NOT NULL,
	"feedback_score" double precision NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_feedback_user_id_repo_id_interaction_type_pk" PRIMARY KEY("user_id","repo_id","interaction_type"),
	CONSTRAINT "user_feedback_score_range" CHECK ("user_feedback"."feedback_score" >= -1.0 AND "user_feedback"."feedback_score" <= 1.0)
);
--> statement-breakpoint
ALTER TABLE "user_feedback" ADD CONSTRAINT "user_feedback_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_feedback" ADD CONSTRAINT "user_feedback_repo_id_repo_repo_id_fk" FOREIGN KEY ("repo_id") REFERENCES "public"."repo"("repo_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_feedback_user_updated_idx" ON "user_feedback" USING btree ("user_id","updated_at");--> statement-breakpoint
ALTER TABLE "repo" DROP COLUMN "open_issues_count";