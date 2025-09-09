-- Harden functions: set stable search_path and fix missing column reference

-- 1) Fix decrement_credits to remove non-existent updated_at and set search_path
CREATE OR REPLACE FUNCTION public.decrement_credits()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_remaining INTEGER;
BEGIN
  UPDATE public.profiles
  SET credits = credits - 1
  WHERE id = auth.uid() AND credits > 0
  RETURNING credits INTO v_remaining;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient credits' USING ERRCODE = 'P0001';
  END IF;

  RETURN v_remaining;
END;
$function$;

-- 2) Ensure search_path is set on credit deduction helpers
CREATE OR REPLACE FUNCTION public.kurangi_cv_credit(user_id_input uuid, jumlah integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  UPDATE public.profiles
  SET cv_credits = cv_credits - jumlah
  WHERE id = user_id_input AND cv_credits >= jumlah;
END;
$function$;

CREATE OR REPLACE FUNCTION public.kurangi_skripsi_credit(user_id_input uuid, jumlah integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  UPDATE public.profiles
  SET skripsi_credits = skripsi_credits - jumlah
  WHERE id = user_id_input AND skripsi_credits >= jumlah;
END;
$function$;