-- Update the trigger logic to evaluate onboarding completion
-- Make github_handle optional for onboarding completion since users can sign up with email

CREATE OR REPLACE FUNCTION public.evaluate_onboarding_status() RETURNS TRIGGER AS $$
BEGIN
    NEW.onboarding_completed := (
        (NEW.username IS NOT NULL AND TRIM(NEW.username) <> '' AND NEW.username !~ '^user_[0-9a-f]{8}$') AND
        (NEW.full_name IS NOT NULL AND TRIM(NEW.full_name) <> '') AND
        (NEW.interests IS NOT NULL AND jsonb_typeof(NEW.interests) = 'array' AND jsonb_array_length(NEW.interests) > 0) AND
        (NEW.skills IS NOT NULL AND jsonb_typeof(NEW.skills) = 'array' AND jsonb_array_length(NEW.skills) > 0) AND
        (NEW.tech_stack IS NOT NULL AND jsonb_typeof(NEW.tech_stack) = 'array' AND jsonb_array_length(NEW.tech_stack) > 0)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
