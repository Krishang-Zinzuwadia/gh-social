-- Bootstrap script for login / refresh-token auth flow
-- Apply in: Supabase Dashboard → SQL Editor → New query → Run
--
-- Required when API login returns 500 after successful credential validation.
-- Safe to re-run: uses IF NOT EXISTS / ON CONFLICT DO NOTHING.
--
-- Equivalent to running migrations:
--   database/migrations/008_create_users_and_follows.sql
--   database/migrations/009_create_refresh_tokens.sql
-- plus backfill for auth users created before public.users existed.

-- ─── public.users + follows (migration 008) ─────────────────────────────────

CREATE TABLE IF NOT EXISTS public.users (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(100),
    date_of_birth DATE,
    bio TEXT,
    github_url TEXT,
    github_id VARCHAR(100) UNIQUE,
    github_handle VARCHAR(100),
    avatar_url TEXT,
    followers_count INT DEFAULT 0,
    following_count INT DEFAULT 0,
    saved_repos_count INT DEFAULT 0,
    interests JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.follows (
    follower_id UUID REFERENCES public.users(user_id) ON DELETE CASCADE,
    following_id UUID REFERENCES public.users(user_id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (follower_id, following_id),
    CONSTRAINT no_self_follow CHECK (follower_id <> following_id)
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.users (
        user_id,
        username,
        full_name,
        date_of_birth,
        bio,
        github_url,
        github_id,
        github_handle,
        avatar_url
    )
    VALUES (
        NEW.id,
        COALESCE(
            NEW.raw_user_meta_data->>'user_name',
            'user_' || SUBSTRING(NEW.id::text, 1, 8)
        ),
        NEW.raw_user_meta_data->>'full_name',
        NULLIF(NEW.raw_user_meta_data->>'date_of_birth', '')::DATE,
        NEW.raw_user_meta_data->>'bio',
        NEW.raw_user_meta_data->>'github_url',
        NEW.raw_user_meta_data->>'provider_id',
        NEW.raw_user_meta_data->>'preferred_username',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.update_follow_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.users
        SET following_count = following_count + 1
        WHERE user_id = NEW.follower_id;

        UPDATE public.users
        SET followers_count = followers_count + 1
        WHERE user_id = NEW.following_id;

        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.users
        SET following_count = GREATEST(0, following_count - 1)
        WHERE user_id = OLD.follower_id;

        UPDATE public.users
        SET followers_count = GREATEST(0, followers_count - 1)
        WHERE user_id = OLD.following_id;

        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS on_follow_change ON public.follows;

CREATE TRIGGER on_follow_change
AFTER INSERT OR DELETE
ON public.follows
FOR EACH ROW
EXECUTE FUNCTION public.update_follow_counts();

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable" ON public.users;
CREATE POLICY "Public profiles are viewable" ON public.users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can view follows" ON public.follows;
CREATE POLICY "Anyone can view follows" ON public.follows FOR SELECT USING (true);

-- ─── refresh_tokens (migration 009) ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.refresh_tokens (
    token_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
    refresh_token_hash TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    is_revoked BOOLEAN DEFAULT FALSE,
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_hash ON public.refresh_tokens(refresh_token_hash);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON public.refresh_tokens(user_id);

ALTER TABLE public.refresh_tokens ENABLE ROW LEVEL SECURITY;

-- ─── Backfill profiles for existing auth.users ────────────────────────────────
-- Required when users were created via Admin API / dashboard before this schema existed.

INSERT INTO public.users (
    user_id,
    username,
    full_name,
    date_of_birth,
    bio,
    github_url,
    github_id,
    github_handle,
    avatar_url
)
SELECT
    id,
    COALESCE(
        raw_user_meta_data->>'user_name',
        'user_' || SUBSTRING(id::text, 1, 8)
    ),
    raw_user_meta_data->>'full_name',
    NULLIF(raw_user_meta_data->>'date_of_birth', '')::DATE,
    raw_user_meta_data->>'bio',
    raw_user_meta_data->>'github_url',
    raw_user_meta_data->>'provider_id',
    raw_user_meta_data->>'preferred_username',
    raw_user_meta_data->>'avatar_url'
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- Reload PostgREST schema cache so Supabase API recognizes new tables immediately
NOTIFY pgrst, 'reload schema';
