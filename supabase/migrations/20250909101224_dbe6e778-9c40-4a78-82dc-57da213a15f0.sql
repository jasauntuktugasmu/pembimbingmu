-- Harden function: set search_path to avoid linter warning
CREATE OR REPLACE FUNCTION public.is_email_authorized(email_to_check text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.authorized_emails 
    WHERE lower(email) = lower(email_to_check)
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_email_authorized(text) TO anon, authenticated;