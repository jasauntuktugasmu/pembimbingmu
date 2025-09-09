-- Create RPC function to check if email is authorized
-- This allows unauthenticated users to check email authorization without exposing the table
CREATE OR REPLACE FUNCTION public.is_email_authorized(email_to_check text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.authorized_emails 
    WHERE lower(email) = lower(email_to_check)
  );
$$;

-- Grant execute permission to anonymous and authenticated users
GRANT EXECUTE ON FUNCTION public.is_email_authorized(text) TO anon, authenticated;