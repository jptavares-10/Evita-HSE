-- 1. Drop unrestricted anon storage policies on supplier-documents
DROP POLICY IF EXISTS "Anon can upload supplier portal files" ON storage.objects;
DROP POLICY IF EXISTS "Anon can view supplier portal files" ON storage.objects;

-- 2. Create trigger to enforce user seat limit server-side
CREATE OR REPLACE FUNCTION public.check_user_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_max int;
  v_current int;
BEGIN
  SELECT max_users INTO v_max FROM companies WHERE id = NEW.company_id;
  SELECT COUNT(*) INTO v_current FROM profiles WHERE company_id = NEW.company_id;
  IF v_current >= v_max THEN
    RAISE EXCEPTION 'Limite de usuários atingido para este plano.';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_user_limit
  BEFORE INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.check_user_limit();