-- The v2 interaction transaction inserts an event, then assigns its durable
-- feedback version before committing the matching ML outbox row.
GRANT UPDATE (feedback_version)
ON telemetry.interaction_events
TO ghsocial_backend;

-- The same transaction maintains the per-user/repository projection with an
-- INSERT ... ON CONFLICT DO UPDATE statement.
GRANT UPDATE (
  impressions,
  readme_opens,
  github_opens,
  shares,
  total_dwell_ms,
  feedback_score,
  last_event_at
)
ON telemetry.user_repo_engagement
TO ghsocial_backend;
