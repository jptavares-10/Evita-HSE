CREATE OR REPLACE FUNCTION public.update_company_safe_fields(
  p_name text,
  p_cnpj text DEFAULT NULL,
  p_segment text DEFAULT NULL,
  p_logo_url text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_company_id uuid;
BEGIN
  SELECT company_id INTO v_company_id
  FROM public.profiles WHERE id = auth.uid();

  IF v_company_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Empresa não encontrada');
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