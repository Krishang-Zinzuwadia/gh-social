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

-- ─── Atomic toggle functions for like/save (TOCTOU-safe) ─────────────────────

CREATE OR REPLACE FUNCTION toggle_repo_like(uid UUID, rid UUID)
RETURNS SETOF activity
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  INSERT INTO activity (user_id, repo_id, likelihood_count)
  VALUES (uid, rid, 1)
  ON CONFLICT (user_id, repo_id) DO UPDATE
    SET likelihood_count = CASE WHEN activity.likelihood_count = 1 THEN 0 ELSE 1 END
  RETURNING *;
END;
$$;

CREATE OR REPLACE FUNCTION toggle_repo_save(uid UUID, rid UUID)
RETURNS SETOF activity
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  INSERT INTO activity (user_id, repo_id, is_saved)
  VALUES (uid, rid, true)
  ON CONFLICT (user_id, repo_id) DO UPDATE
    SET is_saved = NOT activity.is_saved
  RETURNING *;
END;
$$;

-- ─── Views count (increment from backend) ────────────────────────────────────

CREATE OR REPLACE FUNCTION increment_repo_views(rid UUID)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE Repo
  SET views_count = views_count + 1
  WHERE repo_id = rid;

  RETURN FOUND;
END;
$$;

-- ─── Atomic container-with-boards creation (transactional) ──────────────────

CREATE OR REPLACE FUNCTION create_container_with_defaults(
  uid UUID,
  container_name TEXT DEFAULT 'Default Boards Container'
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_container JSONB;
  v_board1    JSONB;
  v_board2    JSONB;
BEGIN
  INSERT INTO boards_containers (user_id, container_name, description)
  VALUES (uid, container_name, NULL)
  RETURNING row_to_json(boards_containers.*)::JSONB INTO v_container;

  INSERT INTO boards (user_id, board_name, visibility, description)
  VALUES (uid, 'Saved Repos', 'public', NULL)
  RETURNING row_to_json(boards.*)::JSONB INTO v_board1;

  INSERT INTO boards (user_id, board_name, visibility, description)
  VALUES (uid, 'GitHub Repos', 'public', NULL)
  RETURNING row_to_json(boards.*)::JSONB INTO v_board2;

  INSERT INTO container_boards (container_id, board_id)
  VALUES
    ((v_container->>'container_id')::UUID, (v_board1->>'board_id')::UUID),
    ((v_container->>'container_id')::UUID, (v_board2->>'board_id')::UUID);

  RETURN jsonb_build_object(
    'container', v_container,
    'boards', jsonb_build_array(v_board1, v_board2)
  );
END;
$$;
