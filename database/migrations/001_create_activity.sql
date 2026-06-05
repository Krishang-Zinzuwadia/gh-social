CREATE TABLE activity (
    activity_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    repo_id UUID NOT NULL,
    time_spent INTERVAL,
    likelihood_count INT DEFAULT 0,
    is_saved BOOL DEFAULT FALSE
);
