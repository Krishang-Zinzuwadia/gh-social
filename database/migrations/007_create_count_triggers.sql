-- Migration: auto-maintain Repo count columns via triggers

-- ─── Comments count ──────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_repo_comments_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE Repo
    SET comments_count = (
      SELECT COUNT(*) FROM comment WHERE repo_id = NEW.repo_id
    )
    WHERE repo_id = NEW.repo_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE Repo
    SET comments_count = (
      SELECT COUNT(*) FROM comment WHERE repo_id = OLD.repo_id
    )
    WHERE repo_id = OLD.repo_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_repo_comments_count ON comment;
CREATE TRIGGER trg_repo_comments_count
AFTER INSERT OR DELETE ON comment
FOR EACH ROW
EXECUTE FUNCTION update_repo_comments_count();

-- ─── Likes count (activity.likelihood_count = 1) ─────────────────────────────

CREATE OR REPLACE FUNCTION update_repo_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  target_repo_id UUID;
BEGIN
  IF TG_OP = 'INSERT' THEN
    target_repo_id := NEW.repo_id;
  ELSIF TG_OP = 'UPDATE' THEN
    target_repo_id := NEW.repo_id;
  ELSIF TG_OP = 'DELETE' THEN
    target_repo_id := OLD.repo_id;
  END IF;

  UPDATE Repo
  SET likes_count = (
    SELECT COUNT(*) FROM activity
    WHERE repo_id = target_repo_id AND likelihood_count = 1
  )
  WHERE repo_id = target_repo_id;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_repo_likes_count ON activity;
CREATE TRIGGER trg_repo_likes_count
AFTER INSERT OR UPDATE OR DELETE ON activity
FOR EACH ROW
EXECUTE FUNCTION update_repo_likes_count();

-- ─── Saves count (activity.is_saved = true) ──────────────────────────────────

CREATE OR REPLACE FUNCTION update_repo_saves_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  target_repo_id UUID;
BEGIN
  IF TG_OP = 'INSERT' THEN
    target_repo_id := NEW.repo_id;
  ELSIF TG_OP = 'UPDATE' THEN
    target_repo_id := NEW.repo_id;
  ELSIF TG_OP = 'DELETE' THEN
    target_repo_id := OLD.repo_id;
  END IF;

  UPDATE Repo
  SET saves_count = (
    SELECT COUNT(*) FROM activity
    WHERE repo_id = target_repo_id AND is_saved = true
  )
  WHERE repo_id = target_repo_id;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_repo_saves_count ON activity;
CREATE TRIGGER trg_repo_saves_count
AFTER INSERT OR UPDATE OR DELETE ON activity
FOR EACH ROW
EXECUTE FUNCTION update_repo_saves_count();

-- ─── Views count (increment from backend) ────────────────────────────────────

CREATE OR REPLACE FUNCTION increment_repo_views(rid UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE Repo
  SET views_count = views_count + 1
  WHERE repo_id = rid;
END;
$$;
