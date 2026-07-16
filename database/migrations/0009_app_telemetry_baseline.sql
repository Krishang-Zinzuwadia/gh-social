-- Runs after the legacy interaction-event migration from dev.
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;
CREATE SCHEMA IF NOT EXISTS app;
CREATE SCHEMA IF NOT EXISTS telemetry;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS app.users (
  user_id uuid PRIMARY KEY,
  username citext NOT NULL UNIQUE,
  full_name varchar(100), bio text, github_id text UNIQUE, github_handle text,
  avatar_url text, status text NOT NULL DEFAULT 'active', profile_version bigint NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT users_status_check CHECK (status IN ('active','suspended','deleted'))
);
CREATE TABLE IF NOT EXISTS app.user_stats (
  user_id uuid PRIMARY KEY REFERENCES app.users(user_id) ON DELETE CASCADE,
  followers_count integer NOT NULL DEFAULT 0, following_count integer NOT NULL DEFAULT 0,
  likes_given_count integer NOT NULL DEFAULT 0, saved_repos_count integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS app.user_feed_state (
  user_id uuid PRIMARY KEY REFERENCES app.users(user_id) ON DELETE CASCADE,
  feed_version bigint NOT NULL DEFAULT 1, feedback_version bigint NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS app.topics (
  topic_id bigserial PRIMARY KEY, slug citext NOT NULL UNIQUE, display_name text NOT NULL
);
CREATE TABLE IF NOT EXISTS app.user_topics (
  user_id uuid NOT NULL REFERENCES app.users(user_id) ON DELETE CASCADE,
  topic_id bigint NOT NULL REFERENCES app.topics(topic_id) ON DELETE CASCADE,
  strength double precision NOT NULL DEFAULT 1,
  PRIMARY KEY (user_id, topic_id)
);
CREATE TABLE IF NOT EXISTS app.repos (
  repo_id uuid PRIMARY KEY DEFAULT gen_random_uuid(), github_id bigint NOT NULL UNIQUE,
  github_node_id text UNIQUE, full_name citext NOT NULL UNIQUE, owner text NOT NULL, name text NOT NULL,
  url text NOT NULL, status text NOT NULL DEFAULT 'active', created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT repos_github_id_positive CHECK (github_id > 0),
  CONSTRAINT repos_status_check CHECK (status IN ('active','archived','deleted','blocked'))
);
CREATE TABLE IF NOT EXISTS app.repo_content (
  repo_id uuid PRIMARY KEY REFERENCES app.repos(repo_id) ON DELETE CASCADE,
  description text, readme text, primary_language text, languages jsonb NOT NULL DEFAULT '[]'::jsonb,
  content_hash text NOT NULL, content_version integer NOT NULL DEFAULT 1,
  source_updated_at timestamptz, updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS app.repo_stat_snapshots (
  snapshot_id uuid PRIMARY KEY DEFAULT gen_random_uuid(), repo_id uuid NOT NULL REFERENCES app.repos(repo_id) ON DELETE CASCADE,
  star_count integer NOT NULL DEFAULT 0, fork_count integer NOT NULL DEFAULT 0,
  open_issues_count integer NOT NULL DEFAULT 0, observed_at timestamptz NOT NULL,
  UNIQUE (repo_id, observed_at)
);
CREATE TABLE IF NOT EXISTS app.repo_engagement (
  repo_id uuid PRIMARY KEY REFERENCES app.repos(repo_id) ON DELETE CASCADE,
  likes_count integer NOT NULL DEFAULT 0, dislikes_count integer NOT NULL DEFAULT 0,
  saves_count integer NOT NULL DEFAULT 0, comments_count integer NOT NULL DEFAULT 0,
  views_count bigint NOT NULL DEFAULT 0, updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT repo_engagement_nonnegative CHECK (
    likes_count >= 0 AND dislikes_count >= 0 AND saves_count >= 0 AND comments_count >= 0 AND views_count >= 0
  )
);
CREATE TABLE IF NOT EXISTS app.repo_topics (
  repo_id uuid NOT NULL REFERENCES app.repos(repo_id) ON DELETE CASCADE,
  topic_id bigint NOT NULL REFERENCES app.topics(topic_id) ON DELETE CASCADE,
  PRIMARY KEY (repo_id, topic_id)
);
CREATE TABLE IF NOT EXISTS app.repo_card_summaries (
  summary_id uuid PRIMARY KEY DEFAULT gen_random_uuid(), repo_id uuid NOT NULL REFERENCES app.repos(repo_id) ON DELETE CASCADE,
  content_version integer NOT NULL, model_version text NOT NULL, summary text NOT NULL,
  active boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (repo_id, content_version, model_version)
);
CREATE UNIQUE INDEX IF NOT EXISTS repo_card_summaries_one_active_uidx ON app.repo_card_summaries(repo_id) WHERE active;
CREATE TABLE IF NOT EXISTS app.reactions (
  user_id uuid NOT NULL REFERENCES app.users(user_id) ON DELETE CASCADE,
  repo_id uuid NOT NULL REFERENCES app.repos(repo_id) ON DELETE CASCADE,
  reaction text NOT NULL CHECK (reaction IN ('like','dislike')), updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, repo_id)
);
CREATE TABLE IF NOT EXISTS app.saves (
  user_id uuid NOT NULL REFERENCES app.users(user_id) ON DELETE CASCADE,
  repo_id uuid NOT NULL REFERENCES app.repos(repo_id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY (user_id, repo_id)
);
CREATE TABLE IF NOT EXISTS app.follows (
  follower_id uuid NOT NULL REFERENCES app.users(user_id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES app.users(user_id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY (follower_id, following_id),
  CONSTRAINT follows_no_self CHECK (follower_id <> following_id)
);
CREATE TABLE IF NOT EXISTS app.comments (
  comment_id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES app.users(user_id) ON DELETE CASCADE,
  repo_id uuid NOT NULL REFERENCES app.repos(repo_id) ON DELETE CASCADE, parent_comment_id uuid,
  body text NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT comments_parent_fk FOREIGN KEY (parent_comment_id) REFERENCES app.comments(comment_id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS app.board_collections (
  collection_id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES app.users(user_id) ON DELETE CASCADE,
  name text NOT NULL, description text, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE (user_id, name)
);
CREATE TABLE IF NOT EXISTS app.boards (
  board_id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES app.users(user_id) ON DELETE CASCADE,
  collection_id uuid REFERENCES app.board_collections(collection_id) ON DELETE SET NULL, name text NOT NULL,
  description text, visibility text NOT NULL DEFAULT 'private' CHECK (visibility IN ('private','public','unlisted')),
  created_at timestamptz NOT NULL DEFAULT now(), UNIQUE (user_id, name)
);
CREATE TABLE IF NOT EXISTS app.board_repos (
  board_id uuid NOT NULL REFERENCES app.boards(board_id) ON DELETE CASCADE,
  repo_id uuid NOT NULL REFERENCES app.repos(repo_id) ON DELETE CASCADE,
  added_by uuid REFERENCES app.users(user_id) ON DELETE SET NULL, added_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (board_id, repo_id)
);
CREATE TABLE IF NOT EXISTS app.trending_snapshots (
  snapshot_id uuid PRIMARY KEY, period text NOT NULL, source text NOT NULL, computed_at timestamptz NOT NULL,
  activated_at timestamptz, complete boolean NOT NULL DEFAULT false, active boolean NOT NULL DEFAULT false
);
CREATE UNIQUE INDEX IF NOT EXISTS trending_one_active_period_uidx ON app.trending_snapshots(period) WHERE active;
CREATE TABLE IF NOT EXISTS app.trending_snapshot_items (
  snapshot_id uuid NOT NULL REFERENCES app.trending_snapshots(snapshot_id) ON DELETE CASCADE,
  position smallint NOT NULL CHECK (position >= 0), repo_id uuid NOT NULL REFERENCES app.repos(repo_id),
  score double precision, features jsonb NOT NULL DEFAULT '{}'::jsonb,
  PRIMARY KEY (snapshot_id, position), UNIQUE (snapshot_id, repo_id)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS telemetry.sessions (
  session_id uuid PRIMARY KEY, user_id uuid NOT NULL REFERENCES app.users(user_id) ON DELETE CASCADE,
  platform text, app_version text, started_at timestamptz NOT NULL DEFAULT now(), ended_at timestamptz
);
CREATE TABLE IF NOT EXISTS telemetry.feed_serves (
  serve_id uuid PRIMARY KEY DEFAULT gen_random_uuid(), feed_request_id uuid NOT NULL UNIQUE,
  user_id uuid NOT NULL REFERENCES app.users(user_id) ON DELETE CASCADE, session_id uuid NOT NULL,
  feed_version bigint NOT NULL, generation_id uuid, source text NOT NULL, model_version text,
  status text NOT NULL DEFAULT 'prepared' CHECK (status IN ('prepared','response_started','expired')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS feed_serves_user_created_idx ON telemetry.feed_serves(user_id, created_at DESC);
CREATE TABLE IF NOT EXISTS telemetry.feed_serve_items (
  serve_id uuid NOT NULL REFERENCES telemetry.feed_serves(serve_id) ON DELETE CASCADE,
  position smallint NOT NULL CHECK (position >= 0), repo_id uuid NOT NULL REFERENCES app.repos(repo_id),
  score double precision, source text NOT NULL, model_version text, summary_id uuid,
  PRIMARY KEY (serve_id, position), UNIQUE (serve_id, repo_id)
);
CREATE TABLE IF NOT EXISTS telemetry.interaction_events (
  event_id uuid PRIMARY KEY, schema_version smallint NOT NULL, user_id uuid NOT NULL REFERENCES app.users(user_id) ON DELETE CASCADE,
  session_id uuid NOT NULL, serve_id uuid REFERENCES telemetry.feed_serves(serve_id), repo_id uuid NOT NULL REFERENCES app.repos(repo_id),
  position smallint, event_type text NOT NULL, dwell_ms integer, feedback_version bigint,
  client_occurred_at timestamptz NOT NULL, server_received_at timestamptz NOT NULL DEFAULT now(), context jsonb NOT NULL DEFAULT '{}'::jsonb,
  CONSTRAINT interaction_dwell_check CHECK (
    (event_type = 'dwell' AND dwell_ms BETWEEN 3000 AND 300000) OR (event_type <> 'dwell' AND dwell_ms IS NULL)
  )
);
CREATE INDEX IF NOT EXISTS interaction_events_user_received_idx ON telemetry.interaction_events(user_id, server_received_at DESC);
CREATE INDEX IF NOT EXISTS interaction_events_serve_repo_idx ON telemetry.interaction_events(serve_id, repo_id);
CREATE TABLE IF NOT EXISTS telemetry.user_repo_engagement (
  user_id uuid NOT NULL REFERENCES app.users(user_id) ON DELETE CASCADE,
  repo_id uuid NOT NULL REFERENCES app.repos(repo_id) ON DELETE CASCADE,
  impressions integer NOT NULL DEFAULT 0, readme_opens integer NOT NULL DEFAULT 0,
  github_opens integer NOT NULL DEFAULT 0, shares integer NOT NULL DEFAULT 0,
  total_dwell_ms bigint NOT NULL DEFAULT 0, feedback_score double precision NOT NULL DEFAULT 0,
  last_event_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY (user_id, repo_id)
);
CREATE TABLE IF NOT EXISTS telemetry.ml_outbox (
  outbox_id uuid PRIMARY KEY DEFAULT gen_random_uuid(), job_type text NOT NULL,
  aggregate_id uuid NOT NULL, idempotency_key text NOT NULL UNIQUE, payload jsonb NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','claimed','delivered','dead')),
  attempts integer NOT NULL DEFAULT 0, available_at timestamptz NOT NULL DEFAULT now(),
  claimed_at timestamptz, claim_token uuid, delivered_at timestamptz, last_error text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ml_outbox_ready_idx ON telemetry.ml_outbox(status, available_at) WHERE status IN ('pending','claimed');
CREATE TABLE IF NOT EXISTS telemetry.generation_attempts (
  generation_id uuid PRIMARY KEY, user_id uuid NOT NULL REFERENCES app.users(user_id) ON DELETE CASCADE,
  feed_version bigint NOT NULL, mode text NOT NULL, status text NOT NULL, latency_ms integer,
  result_count integer, error_code text, created_at timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE OR REPLACE FUNCTION app.enforce_comment_parent_repo() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.parent_comment_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM app.comments parent WHERE parent.comment_id = NEW.parent_comment_id AND parent.repo_id = NEW.repo_id
  ) THEN RAISE EXCEPTION 'parent comment must belong to the same repository'; END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS comments_parent_repo_trigger ON app.comments;
CREATE TRIGGER comments_parent_repo_trigger BEFORE INSERT OR UPDATE ON app.comments
FOR EACH ROW EXECUTE FUNCTION app.enforce_comment_parent_repo();
CREATE OR REPLACE FUNCTION app.activate_repo_summary(target_summary uuid) RETURNS void LANGUAGE plpgsql AS $$
DECLARE target_repo uuid;
BEGIN
  SELECT repo_id INTO STRICT target_repo FROM app.repo_card_summaries WHERE summary_id = target_summary FOR UPDATE;
  UPDATE app.repo_card_summaries SET active = false WHERE repo_id = target_repo AND active;
  UPDATE app.repo_card_summaries SET active = true WHERE summary_id = target_summary;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'auth')
     AND EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='auth' AND c.relname='users')
     AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='app_users_auth_fk') THEN
    ALTER TABLE app.users ADD CONSTRAINT app_users_auth_fk FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='ghsocial_backend') THEN CREATE ROLE ghsocial_backend NOLOGIN; END IF; END $$;
REVOKE ALL ON SCHEMA app, telemetry FROM PUBLIC;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname='anon') THEN EXECUTE 'REVOKE ALL ON SCHEMA app, telemetry FROM anon'; END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname='authenticated') THEN EXECUTE 'REVOKE ALL ON SCHEMA app, telemetry FROM authenticated'; END IF;
END $$;
GRANT USAGE ON SCHEMA app, telemetry TO ghsocial_backend;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA app TO ghsocial_backend;
GRANT SELECT, INSERT ON ALL TABLES IN SCHEMA telemetry TO ghsocial_backend;
GRANT UPDATE (status, attempts, available_at, claimed_at, claim_token, delivered_at, last_error) ON telemetry.ml_outbox TO ghsocial_backend;
ALTER DEFAULT PRIVILEGES IN SCHEMA app GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO ghsocial_backend;
ALTER DEFAULT PRIVILEGES IN SCHEMA telemetry GRANT SELECT, INSERT ON TABLES TO ghsocial_backend;
