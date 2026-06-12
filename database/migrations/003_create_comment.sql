CREATE TABLE comment (
    comment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    repo_id UUID NOT NULL,
    parent_comment_id UUID,
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT comment_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE,
    CONSTRAINT comment_repo_id_fkey FOREIGN KEY (repo_id) REFERENCES repo(repo_id) ON DELETE CASCADE,
    CONSTRAINT comment_parent_comment_id_fkey
        FOREIGN KEY (parent_comment_id)
        REFERENCES comment(comment_id)
        ON DELETE CASCADE
);

CREATE INDEX comment_user_id_idx ON comment(user_id);
CREATE INDEX comment_repo_id_idx ON comment(repo_id);
CREATE INDEX comment_parent_comment_id_idx ON comment(parent_comment_id);
