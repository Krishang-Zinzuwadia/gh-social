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

ALTER TABLE public.users ALTER COLUMN interests SET DEFAULT '[]'::jsonb;
ALTER TABLE public.users ALTER COLUMN interests SET NOT NULL;

ALTER TABLE public.users ALTER COLUMN skills SET DEFAULT '[]'::jsonb;
ALTER TABLE public.users ALTER COLUMN skills SET NOT NULL;

ALTER TABLE public.users ALTER COLUMN tech_stack SET DEFAULT '[]'::jsonb;
ALTER TABLE public.users ALTER COLUMN tech_stack SET NOT NULL;

CREATE OR REPLACE FUNCTION public.evaluate_onboarding_status()
RETURNS TRIGGER AS $$
BEGIN
    NEW.onboarding_completed := (
        (NEW.username IS NOT NULL AND TRIM(NEW.username) <> '' AND NEW.username !~ '^user_[0-9a-f]{8}$') AND
        (NEW.full_name IS NOT NULL AND TRIM(NEW.full_name) <> '') AND
        (NEW.github_handle IS NOT NULL AND TRIM(NEW.github_handle) <> '') AND
        (NEW.interests IS NOT NULL AND jsonb_typeof(NEW.interests) = 'array' AND jsonb_array_length(NEW.interests) > 0) AND
        (NEW.skills IS NOT NULL AND jsonb_typeof(NEW.skills) = 'array' AND jsonb_array_length(NEW.skills) > 0) AND
        (NEW.tech_stack IS NOT NULL AND jsonb_typeof(NEW.tech_stack) = 'array' AND jsonb_array_length(NEW.tech_stack) > 0)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_evaluate_onboarding ON public.users;
CREATE TRIGGER tr_evaluate_onboarding
BEFORE INSERT OR UPDATE OF username, full_name, github_handle, interests, skills, tech_stack
ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.evaluate_onboarding_status();