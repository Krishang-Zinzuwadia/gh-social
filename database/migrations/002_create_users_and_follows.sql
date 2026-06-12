-- Safely add new columns to the existing users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS full_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS github_url TEXT;

-- Update the trigger function so new signups insert the full_name
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
        NEW.raw_user_meta_data->>'provider_id',
        NEW.raw_user_meta_data->>'preferred_username',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$;