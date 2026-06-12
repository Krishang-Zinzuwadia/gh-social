CREATE TABLE activity (
    activity_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    repo_id UUID NOT NULL,
    time_spent INTERVAL,
    likelihood_count INT DEFAULT 0,
    is_saved BOOL DEFAULT FALSE,
    CONSTRAINT activity_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE,
    CONSTRAINT activity_repo_id_fkey FOREIGN KEY (repo_id) REFERENCES repo(repo_id) ON DELETE CASCADE,
    CONSTRAINT activity_user_repo_unique UNIQUE (user_id, repo_id)
);
