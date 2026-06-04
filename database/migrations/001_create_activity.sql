CREATE TABLE activity (
    activity_id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    repo_id UUID NOT NULL,
    time_spent TIMESTAMP,
    likelihood_count INT DEFAULT 0,
    is_saved BOOL DEFAULT FALSE
);
