-- Add RLS policy for superadmin to view all profiles
CREATE POLICY "Superadmin can view all profiles"
ON public.profiles
FOR SELECT
USING (is_superadmin());

-- Drop duplicate foreign key constraint if exists
ALTER TABLE public.subscribers 
DROP CONSTRAINT IF EXISTS subscribers_user_id_fkey;