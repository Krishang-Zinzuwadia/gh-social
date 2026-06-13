-- Onboarding & profile columns for public.users
-- Safe to re-run: uses IF NOT EXISTS for every column.

ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS skills JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS tech_stack JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS interests JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS full_name VARCHAR(100);

ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS bio TEXT;

ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(512);

ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS github_handle VARCHAR(100);

ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS github_url VARCHAR(512);

-- Ensure JSONB array columns never store null
UPDATE public.users
SET
    skills = COALESCE(skills, '[]'::jsonb),
    tech_stack = COALESCE(tech_stack, '[]'::jsonb),
    interests = COALESCE(interests, '[]'::jsonb)
WHERE
    skills IS NULL
    OR tech_stack IS NULL
    OR interests IS NULL;
