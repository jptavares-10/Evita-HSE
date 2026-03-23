
-- Create idempotent, transactional RPC for company+profile creation
CREATE OR REPLACE FUNCTION public.create_company_and_admin(
  p_company_name text,
  p_cnpj text DEFAULT NULL,
  p_segment text DEFAULT NULL,
  p_full_name text DEFAULT NULL,
  p_email text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id uuid;
  v_company_id uuid;
  v_existing_profile record;
BEGIN
  -- 1. Check auth
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Usuário não autenticado');
  END IF;

  -- 2. Check if profile already exists (idempotent)
  SELECT p.id, p.company_id INTO v_existing_profile
  FROM public.profiles p WHERE p.id = v_user_id;

  IF FOUND THEN
    RETURN jsonb_build_object('success', true, 'company_id', v_existing_profile.company_id);
  END IF;

  -- 3. Create company
  INSERT INTO public.companies (name, cnpj, segment, plan, max_users)
  VALUES (p_company_name, p_cnpj, p_segment, 'trial', 2)
  RETURNING id INTO v_company_id;

  -- 4. Create profile
  INSERT INTO public.profiles (id, company_id, full_name, email, role)
  VALUES (
    v_user_id,
    v_company_id,
    COALESCE(p_full_name, ''),
    COALESCE(p_email, ''),
    'admin'
  );

  RETURN jsonb_build_object('success', true, 'company_id', v_company_id);

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;
