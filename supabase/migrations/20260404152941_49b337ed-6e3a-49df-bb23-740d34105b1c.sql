-- Clean duplicate CNPJs: nullify on newer duplicates
UPDATE public.companies SET cnpj = NULL
WHERE id IN ('851e47d8-d814-44df-a47a-d2dcda635308', 'd1bedef8-a6e2-4ab0-95a4-c29b40fa40f2');

-- 1. Unique partial index on cnpj
CREATE UNIQUE INDEX IF NOT EXISTS idx_companies_cnpj_unique
  ON public.companies (cnpj)
  WHERE cnpj IS NOT NULL AND cnpj != '';

-- 2. Recreate create_company_and_admin with CNPJ check
CREATE OR REPLACE FUNCTION public.create_company_and_admin(p_company_name text, p_cnpj text DEFAULT NULL::text, p_segment text DEFAULT NULL::text, p_full_name text DEFAULT NULL::text, p_email text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid;
  v_company_id uuid;
  v_existing_profile record;
  v_auth_email text;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Usuário não autenticado');
  END IF;

  v_auth_email := lower(trim(coalesce(auth.jwt() ->> 'email', coalesce(p_email, ''))));

  IF EXISTS (
    SELECT 1
    FROM public.invitations i
    WHERE lower(i.email) = v_auth_email
      AND i.status = 'pending'
      AND i.expires_at > now()
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Você possui um convite pendente. Use o link do convite para entrar na empresa.');
  END IF;

  SELECT p.id, p.company_id INTO v_existing_profile
  FROM public.profiles p WHERE p.id = v_user_id;

  IF FOUND THEN
    RETURN jsonb_build_object('success', true, 'company_id', v_existing_profile.company_id);
  END IF;

  -- Check for duplicate CNPJ
  IF p_cnpj IS NOT NULL AND p_cnpj != '' THEN
    IF EXISTS (SELECT 1 FROM public.companies WHERE cnpj = p_cnpj) THEN
      RETURN jsonb_build_object('success', false, 'error', 'Já existe uma empresa cadastrada com este CNPJ.');
    END IF;
  END IF;

  INSERT INTO public.companies (name, cnpj, segment, plan, max_users)
  VALUES (p_company_name, p_cnpj, p_segment, 'trial', 2)
  RETURNING id INTO v_company_id;

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
$function$;

-- 3. Recreate update_company_safe_fields with CNPJ check
CREATE OR REPLACE FUNCTION public.update_company_safe_fields(p_name text, p_cnpj text DEFAULT NULL::text, p_segment text DEFAULT NULL::text, p_logo_url text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_company_id uuid;
  v_role text;
BEGIN
  SELECT company_id, role INTO v_company_id, v_role
  FROM public.profiles WHERE id = auth.uid();

  IF v_company_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Empresa não encontrada');
  END IF;

  IF v_role != 'admin' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Apenas administradores podem editar os dados da empresa.');
  END IF;

  -- Check for duplicate CNPJ (excluding own company)
  IF p_cnpj IS NOT NULL AND p_cnpj != '' THEN
    IF EXISTS (SELECT 1 FROM public.companies WHERE cnpj = p_cnpj AND id != v_company_id) THEN
      RETURN jsonb_build_object('success', false, 'error', 'Já existe uma empresa cadastrada com este CNPJ.');
    END IF;
  END IF;

  UPDATE public.companies
  SET name = p_name,
      cnpj = p_cnpj,
      segment = p_segment,
      logo_url = COALESCE(p_logo_url, logo_url)
  WHERE id = v_company_id;

  RETURN jsonb_build_object('success', true, 'company_id', v_company_id);
END;
$function$;