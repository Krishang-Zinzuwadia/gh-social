CREATE TABLE public.refresh_tokens (
    token_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Links to your main users table. If the user is deleted, their tokens vanish.
    user_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
    
    -- SECURITY: Store the bcrypt hash of the token, NEVER the raw token string
    refresh_token_hash TEXT NOT NULL,
    
    -- Expiration date for the long-lived token (e.g., 30 days from creation)
    expires_at TIMESTAMPTZ NOT NULL,
    
    -- Used for "Log out of all devices" or if a user suspects they were hacked
    is_revoked BOOLEAN DEFAULT FALSE,
    
    -- Tracking when they last asked for a new JWT
    last_used_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES: Crucial for performance so your login/refresh APIs don't lag
-- 1. For looking up a specific token when the frontend tries to refresh
CREATE INDEX idx_refresh_tokens_hash ON public.refresh_tokens(refresh_token_hash);

-- 2. For wiping all tokens when a user clicks "Log out everywhere"
CREATE INDEX idx_refresh_tokens_user_id ON public.refresh_tokens(user_id);