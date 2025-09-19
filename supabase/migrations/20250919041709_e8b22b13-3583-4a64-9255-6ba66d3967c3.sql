-- Update the handle_new_user function to include full_name from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name')
  )
  ON CONFLICT (id)
  DO UPDATE SET
    email = COALESCE(public.profiles.email, EXCLUDED.email),
    full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name);

  RETURN NEW;
END;
$$;