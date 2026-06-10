-- Migration: create boards and board_repos

CREATE TABLE IF NOT EXISTS boards (
    board_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
    board_name VARCHAR(100) NOT NULL,
    visibility VARCHAR(20) NOT NULL DEFAULT 'public',
    description TEXT,
    repos_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS board_repos (
    board_id UUID NOT NULL REFERENCES boards(board_id) ON DELETE CASCADE,
    repo_id UUID NOT NULL REFERENCES repo(repo_id) ON DELETE CASCADE,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (board_id, repo_id)
);

-- Ensure index on repo_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_board_repos_repo_id ON board_repos(repo_id);

-- Trigger function: verify repo is saved by the board owner before allowing insert/update
CREATE OR REPLACE FUNCTION enforce_repo_saved_for_board()
RETURNS TRIGGER AS $$
DECLARE
    owner_uuid UUID;
    is_saved BOOLEAN;
BEGIN
    SELECT user_id INTO owner_uuid FROM boards WHERE board_id = COALESCE(NEW.board_id, OLD.board_id);

    IF owner_uuid IS NULL THEN
        RAISE EXCEPTION 'Board does not exist';
    END IF;

    SELECT EXISTS (
        SELECT 1 FROM activity
        WHERE user_id = owner_uuid
          AND repo_id = COALESCE(NEW.repo_id, OLD.repo_id)
          AND is_saved = true
    ) INTO is_saved;

    IF NOT is_saved THEN
        RAISE EXCEPTION 'Repo must be saved by the board owner before it can be added to the board';
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_enforce_repo_saved ON board_repos;
CREATE TRIGGER trg_enforce_repo_saved
BEFORE INSERT OR UPDATE ON board_repos
FOR EACH ROW EXECUTE FUNCTION enforce_repo_saved_for_board();

-- Trigger functions to maintain repos_count on boards
CREATE OR REPLACE FUNCTION boards_repos_count_update()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE boards SET repos_count = repos_count + 1 WHERE board_id = NEW.board_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE boards SET repos_count = GREATEST(0, repos_count - 1) WHERE board_id = OLD.board_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_boards_repos_count ON board_repos;
CREATE TRIGGER trg_boards_repos_count
AFTER INSERT OR DELETE ON board_repos
FOR EACH ROW EXECUTE FUNCTION boards_repos_count_update();

-- Optional: ensure users cannot create boards with invalid visibility
ALTER TABLE boards
    ADD CONSTRAINT boards_visibility_check CHECK (visibility IN ('public', 'private'));

-- End of migration
