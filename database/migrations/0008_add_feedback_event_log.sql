CREATE TABLE IF NOT EXISTS "feedback_event_log" (
    "event_id" uuid PRIMARY KEY,
    "schema_version" integer NOT NULL,
    "user_id" uuid NOT NULL REFERENCES "users"("user_id") ON DELETE CASCADE,
    "repo_id" uuid NOT NULL REFERENCES "repo"("repo_id") ON DELETE CASCADE,
    "action" varchar(32) NOT NULL,
    "dwell_seconds" double precision,
    "model_update" boolean NOT NULL,
    "intent_weight" double precision NOT NULL,
    "intent_strength" varchar(16) NOT NULL,
    "feature_operation" varchar(16) NOT NULL,
    "reverses" varchar(32),
    "occurred_at" timestamp with time zone NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "feedback_event_log_schema_version" CHECK ("schema_version" = 1),
    CONSTRAINT "feedback_event_log_action" CHECK (
        "action" IN (
            'impression', 'dwell', 'readme_open', 'github_open', 'like', 'save',
            'share', 'dislike', 'unlike', 'unsave', 'undislike'
        )
    ),
    CONSTRAINT "feedback_event_log_dwell" CHECK (
        ("action" = 'dwell' AND "dwell_seconds" > 0)
        OR ("action" <> 'dwell' AND "dwell_seconds" IS NULL)
    ),
    CONSTRAINT "feedback_event_log_intent_weight" CHECK (
        "intent_weight" >= -1.0 AND "intent_weight" <= 1.0
    ),
    CONSTRAINT "feedback_event_log_intent_strength" CHECK (
        "intent_strength" IN ('neutral', 'weak', 'strong', 'negative', 'reversal')
    ),
    CONSTRAINT "feedback_event_log_feature_operation" CHECK (
        "feature_operation" IN ('increment', 'accumulate', 'set', 'clear')
    ),
    CONSTRAINT "feedback_event_log_reversal" CHECK (
        ("action" = 'unlike' AND "reverses" = 'like')
        OR ("action" = 'unsave' AND "reverses" = 'save')
        OR ("action" = 'undislike' AND "reverses" = 'dislike')
        OR ("action" NOT IN ('unlike', 'unsave', 'undislike') AND "reverses" IS NULL)
    ),
    CONSTRAINT "feedback_event_log_impression_policy" CHECK (
        "action" <> 'impression' OR ("model_update" = false AND "intent_weight" = 0)
    )
);

CREATE INDEX IF NOT EXISTS "feedback_event_log_user_occurred_idx"
    ON "feedback_event_log" ("user_id", "occurred_at", "event_id");

CREATE INDEX IF NOT EXISTS "feedback_event_log_repo_occurred_idx"
    ON "feedback_event_log" ("repo_id", "occurred_at", "event_id");
