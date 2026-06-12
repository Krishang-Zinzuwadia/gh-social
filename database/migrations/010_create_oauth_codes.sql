-- database/migrations/010_create_oauth_codes.sql

CREATE TABLE public.oauth_codes (
    code UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL
);

-- Index for quick lookups
CREATE INDEX idx_oauth_codes_code ON public.oauth_codes(code);
