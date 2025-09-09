-- Fix signup failure: remove references to non-existent columns and align wallet model

-- 1) Ensure a generic credits balance exists to satisfy existing trigger functions
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS credits bigint NOT NULL DEFAULT 0;

-- 2) Update BEFORE INSERT topup function to stop referencing missing updated_at and use credits
CREATE OR REPLACE FUNCTION public.apply_credit_topup_before_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_profile_id UUID;
BEGIN
  SELECT id INTO v_profile_id FROM public.profiles WHERE lower(email) = lower(NEW.email) LIMIT 1;
  IF v_profile_id IS NOT NULL THEN
    UPDATE public.profiles
    SET credits = COALESCE(credits, 0) + NEW.credits_added
    WHERE id = v_profile_id;
    NEW.applied := TRUE;
  END IF;
  RETURN NEW;
END;
$function$;

-- 3) Update AFTER INSERT profile function to stop referencing missing updated_at and use credits
CREATE OR REPLACE FUNCTION public.apply_pending_topups_on_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_total INTEGER;
BEGIN
  SELECT COALESCE(SUM(credits_added), 0) INTO v_total
  FROM public.credit_topups
  WHERE applied = FALSE AND lower(email) = lower(NEW.email);

  IF v_total > 0 THEN
    UPDATE public.profiles
    SET credits = COALESCE(credits, 0) + v_total
    WHERE id = NEW.id;

    UPDATE public.credit_topups
    SET applied = TRUE
    WHERE applied = FALSE AND lower(email) = lower(NEW.email);
  END IF;
  RETURN NEW;
END;
$function$;

-- 4) Ensure the trigger to insert profiles on new auth user exists (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
  END IF;
END $$;

-- 5) Ensure the trigger to apply pending topups on profile creation exists (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'apply_pending_topups_on_profile_trg'
  ) THEN
    CREATE TRIGGER apply_pending_topups_on_profile_trg
      AFTER INSERT ON public.profiles
      FOR EACH ROW EXECUTE FUNCTION public.apply_pending_topups_on_profile();
  END IF;
END $$;