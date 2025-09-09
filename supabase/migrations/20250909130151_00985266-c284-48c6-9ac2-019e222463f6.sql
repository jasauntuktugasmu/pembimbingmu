-- Clean up duplicate triggers and make profile creation idempotent to fix signup 500 errors

-- 1) Drop duplicate triggers causing double inserts
DROP TRIGGER IF EXISTS buat_profil_otomatis_dengan_kredit ON auth.users;
DROP TRIGGER IF EXISTS trg_apply_pending_topups_on_profile ON public.profiles;

-- 2) Make handle_new_user idempotent (upsert) so duplicate calls won't fail
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id)
  DO UPDATE SET
    email = COALESCE(public.profiles.email, EXCLUDED.email);

  RETURN NEW;
END;
$function$;

-- 3) Ensure the intended triggers exist (idempotent re-create)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'apply_pending_topups_on_profile_trg'
  ) THEN
    CREATE TRIGGER apply_pending_topups_on_profile_trg
      AFTER INSERT ON public.profiles
      FOR EACH ROW EXECUTE FUNCTION public.apply_pending_topups_on_profile();
  END IF;
END $$;