DROP TRIGGER IF EXISTS tr_evaluate_onboarding ON public.users;

ALTER TABLE public.users
  ALTER COLUMN username TYPE text,
  ALTER COLUMN full_name TYPE text;

CREATE TRIGGER tr_evaluate_onboarding
BEFORE INSERT OR UPDATE OF username, full_name, github_handle, interests, skills, tech_stack
ON public.users
FOR EACH ROW EXECUTE FUNCTION public.evaluate_onboarding_status();
