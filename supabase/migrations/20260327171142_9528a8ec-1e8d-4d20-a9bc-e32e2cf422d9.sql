
-- BUG 3: Create remove_member RPC
CREATE OR REPLACE FUNCTION public.remove_member(p_member_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_admin_profile record;
  v_member_profile record;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Usuário não autenticado.');
  END IF;

  SELECT * INTO v_admin_profile FROM public.profiles WHERE id = auth.uid();
  IF v_admin_profile.role != 'admin' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Apenas administradores podem remover membros.');
  END IF;

  IF p_member_id = auth.uid() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Administradores não podem remover a si mesmos.');
  END IF;

  SELECT * INTO v_member_profile FROM public.profiles WHERE id = p_member_id;
  IF v_member_profile IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Membro não encontrado.');
  END IF;

  IF v_member_profile.company_id IS NULL OR v_member_profile.company_id != v_admin_profile.company_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'Membro não pertence a esta empresa.');
  END IF;

  DELETE FROM public.profiles WHERE id = p_member_id;

  RETURN jsonb_build_object('success', true, 'message', 'Membro removido com sucesso.');
END;
$$;

-- BUG 4: Update update_company_safe_fields to check admin role
CREATE OR REPLACE FUNCTION public.update_company_safe_fields(
  p_name text,
  p_cnpj text DEFAULT NULL,
  p_segment text DEFAULT NULL,
  p_logo_url text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
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

  UPDATE public.companies
  SET name = p_name,
      cnpj = p_cnpj,
      segment = p_segment,
      logo_url = COALESCE(p_logo_url, logo_url)
  WHERE id = v_company_id;

  RETURN jsonb_build_object('success', true, 'company_id', v_company_id);
END;
$$;
