CREATE TABLE IF NOT EXISTS "user_feedback" (
    "user_id" uuid NOT NULL REFERENCES "users"("user_id") ON DELETE CASCADE,
    "repo_id" uuid NOT NULL REFERENCES "repo"("repo_id") ON DELETE CASCADE,
    "interaction_type" varchar(50) NOT NULL,
    "feedback_score" double precision NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "user_feedback_pkey" PRIMARY KEY ("user_id", "repo_id", "interaction_type"),
    CONSTRAINT "user_feedback_score_range"
        CHECK ("feedback_score" >= -1.0 AND "feedback_score" <= 1.0)
);

CREATE INDEX IF NOT EXISTS "user_feedback_user_updated_idx"
    ON "user_feedback" ("user_id", "updated_at" DESC);
