-- Extends the v2 app schema created by migration 0009.
CREATE TABLE IF NOT EXISTS app.refresh_tokens (
  token_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES app.users(user_id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_used_at timestamptz
);
CREATE INDEX IF NOT EXISTS app_refresh_tokens_user_idx ON app.refresh_tokens(user_id);

CREATE TABLE IF NOT EXISTS app.oauth_codes (
  code uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES app.users(user_id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE app.comments
  DROP CONSTRAINT IF EXISTS app_comments_parent_comment_id_comments_comment_id_fk;
ALTER TABLE app.comments
  ADD CONSTRAINT app_comments_parent_comment_id_comments_comment_id_fk
  FOREIGN KEY (parent_comment_id) REFERENCES app.comments(comment_id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS app_follows_following_idx ON app.follows(following_id, created_at DESC);
CREATE INDEX IF NOT EXISTS app_follows_follower_idx ON app.follows(follower_id, created_at DESC);
CREATE INDEX IF NOT EXISTS app_comments_repo_idx ON app.comments(repo_id, created_at DESC);
CREATE INDEX IF NOT EXISTS app_comments_user_idx ON app.comments(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS app_boards_user_idx ON app.boards(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS app_board_collections_user_idx ON app.board_collections(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS app_saves_user_idx ON app.saves(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS app_repo_stats_latest_idx ON app.repo_stat_snapshots(repo_id, observed_at DESC);

ALTER TABLE telemetry.ml_outbox DROP CONSTRAINT IF EXISTS ml_outbox_status_check;
ALTER TABLE telemetry.ml_outbox ADD CONSTRAINT ml_outbox_status_check
  CHECK (status IN ('pending','claimed','delivered','dead'));
ALTER TABLE telemetry.ml_outbox DROP CONSTRAINT IF EXISTS ml_outbox_job_type_check;
ALTER TABLE telemetry.ml_outbox ADD CONSTRAINT ml_outbox_job_type_check
  CHECK (job_type IN ('feedback','onboard','repo_index','repo_refresh'));
