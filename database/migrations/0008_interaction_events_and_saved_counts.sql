CREATE TABLE IF NOT EXISTS public.interaction_events (
  event_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  repo_id uuid NOT NULL REFERENCES public.repo(repo_id) ON DELETE CASCADE,
  action varchar(50) NOT NULL,
  dwell_seconds double precision,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT interaction_events_dwell_nonnegative
    CHECK (dwell_seconds IS NULL OR dwell_seconds >= 0)
);

ALTER TABLE public.interaction_events ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS interaction_events_user_created_idx
  ON public.interaction_events (user_id, created_at);

CREATE INDEX IF NOT EXISTS interaction_events_repo_created_idx
  ON public.interaction_events (repo_id, created_at);

CREATE INDEX IF NOT EXISTS interaction_events_action_created_idx
  ON public.interaction_events (action, created_at);

CREATE OR REPLACE FUNCTION update_user_saved_repos_count() RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE target_user_id UUID;
BEGIN
  IF TG_OP = 'INSERT' THEN target_user_id := NEW.user_id;
  ELSIF TG_OP = 'UPDATE' THEN target_user_id := NEW.user_id;
  ELSIF TG_OP = 'DELETE' THEN target_user_id := OLD.user_id;
  END IF;

  UPDATE public.users
  SET saved_repos_count = (
    SELECT COUNT(*)
    FROM public.activity
    WHERE user_id = target_user_id AND is_saved = true
  )
  WHERE user_id = target_user_id;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_user_saved_repos_count ON public.activity;
CREATE TRIGGER trg_user_saved_repos_count
AFTER INSERT OR UPDATE OR DELETE ON public.activity
FOR EACH ROW EXECUTE FUNCTION update_user_saved_repos_count();

UPDATE public.users u
SET likes_given_count = counts.likes_count
FROM (
  SELECT user_id, COUNT(*)::int AS likes_count
  FROM public.activity
  WHERE likelihood_count = 1
  GROUP BY user_id
) counts
WHERE u.user_id = counts.user_id;

UPDATE public.users
SET likes_given_count = 0
WHERE user_id NOT IN (
  SELECT DISTINCT user_id
  FROM public.activity
  WHERE likelihood_count = 1
);

UPDATE public.users u
SET saved_repos_count = counts.saved_count
FROM (
  SELECT user_id, COUNT(*)::int AS saved_count
  FROM public.activity
  WHERE is_saved = true
  GROUP BY user_id
) counts
WHERE u.user_id = counts.user_id;

UPDATE public.users
SET saved_repos_count = 0
WHERE user_id NOT IN (
  SELECT DISTINCT user_id
  FROM public.activity
  WHERE is_saved = true
);

UPDATE public.repo r
SET likes_count = counts.likes_count
FROM (
  SELECT repo_id, COUNT(*)::int AS likes_count
  FROM public.activity
  WHERE likelihood_count = 1
  GROUP BY repo_id
) counts
WHERE r.repo_id = counts.repo_id;

UPDATE public.repo
SET likes_count = 0
WHERE repo_id NOT IN (
  SELECT DISTINCT repo_id
  FROM public.activity
  WHERE likelihood_count = 1
);

UPDATE public.repo r
SET saves_count = counts.saves_count
FROM (
  SELECT repo_id, COUNT(*)::int AS saves_count
  FROM public.activity
  WHERE is_saved = true
  GROUP BY repo_id
) counts
WHERE r.repo_id = counts.repo_id;

UPDATE public.repo
SET saves_count = 0
WHERE repo_id NOT IN (
  SELECT DISTINCT repo_id
  FROM public.activity
  WHERE is_saved = true
);

CREATE OR REPLACE VIEW public.user_feedback_features AS
SELECT
  user_id,
  repo_id,
  COUNT(*) FILTER (WHERE action = 'impression')::int AS impression_count,
  COUNT(*) FILTER (WHERE action = 'readme_open')::int AS readme_open_count,
  COUNT(*) FILTER (WHERE action = 'github_open')::int AS github_open_count,
  COUNT(*) FILTER (WHERE action = 'share')::int AS share_count,
  COUNT(*) FILTER (WHERE action = 'like')::int AS like_event_count,
  COUNT(*) FILTER (WHERE action = 'save')::int AS save_event_count,
  COUNT(*) FILTER (WHERE action = 'dislike')::int AS dislike_event_count,
  COALESCE(SUM(dwell_seconds) FILTER (WHERE action = 'dwell'), 0) AS dwell_total_seconds,
  MAX(created_at) AS last_event_at
FROM public.interaction_events
GROUP BY user_id, repo_id;
