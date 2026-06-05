-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE Repo (
    repo_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    github_repo_url VARCHAR(200) NOT NULL UNIQUE,

    owner_id VARCHAR(100) NOT NULL,

    repo_name VARCHAR(200) NOT NULL,

    full_name VARCHAR(255) NOT NULL,

    description TEXT,

    language_used JSONB DEFAULT '[]'::jsonb,

    topics JSONB DEFAULT '[]'::jsonb,

    readme_summary TEXT,

    likes_count INT DEFAULT 0,

    comments_count INT DEFAULT 0,

    saves_count INT DEFAULT 0,

    views_count INT DEFAULT 0,

    forks_count INT DEFAULT 0,

    pr_count INT DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);