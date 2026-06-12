-- Migration: create boards_containers and container_boards

CREATE TABLE IF NOT EXISTS boards_containers (
    container_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
    container_name VARCHAR(100) NOT NULL DEFAULT 'boards_container',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS container_boards (
    container_id UUID NOT NULL REFERENCES boards_containers(container_id) ON DELETE CASCADE,
    board_id UUID NOT NULL REFERENCES boards(board_id) ON DELETE CASCADE,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (container_id, board_id)
);

-- Index for faster lookups by board_id
CREATE INDEX IF NOT EXISTS idx_container_boards_board_id ON container_boards(board_id);

-- End of migration
