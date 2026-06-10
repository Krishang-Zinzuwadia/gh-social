CREATE TABLE public.refresh_tokens (
    token_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
    
    -- SECURITY: Store the SHA-256 hash of the token
    refresh_token_hash TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    is_revoked BOOLEAN DEFAULT FALSE,
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES: Crucial for performance
CREATE INDEX idx_refresh_tokens_hash ON public.refresh_tokens(refresh_token_hash);
CREATE INDEX idx_refresh_tokens_user_id ON public.refresh_tokens(user_id);