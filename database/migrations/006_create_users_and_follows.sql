
CREATE TABLE public.users (
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

-- 2. FOLLOWS TABLE
CREATE TABLE public.follows (
    follower_id UUID REFERENCES public.users(user_id) ON DELETE CASCADE,
    following_id UUID REFERENCES public.users(user_id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (follower_id, following_id),
    CONSTRAINT no_self_follow CHECK (follower_id <> following_id)
);

-- 3. NEW USER TRIGGER (Updated to extract full_name)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.users (
        user_id,
        username,
        full_name,                -- NEW
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
        NEW.raw_user_meta_data->>'full_name',  -- NEW
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

-- 4. FOLLOW COUNTS TRIGGER
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

-- 5. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable" ON public.users FOR SELECT USING (true);
CREATE POLICY "Anyone can view follows" ON public.follows FOR SELECT USING (true);