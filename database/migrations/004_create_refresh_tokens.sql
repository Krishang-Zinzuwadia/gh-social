CREATE TABLE public.refresh_tokens (
    token_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    user_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
    
    -- SECURITY: Store the SHA-256 hash of the token, NEVER the raw token string.
    refresh_token_hash TEXT NOT NULL UNIQUE,
    
    expires_at TIMESTAMPTZ NOT NULL,
    
    -- Used for "Log out of all devices" or if a user suspects they were hacked
    is_revoked BOOLEAN DEFAULT FALSE,
    
    -- Tracking when they last asked for a new JWT
    last_used_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_hash ON public.refresh_tokens(refresh_token_hash);

CREATE INDEX idx_refresh_tokens_user_id ON public.refresh_tokens(user_id);