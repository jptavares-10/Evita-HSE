ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS responsible_user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS terms_accepted_at timestamptz,
  ADD COLUMN IF NOT EXISTS terms_version text,
  ADD COLUMN IF NOT EXISTS deletion_requested_at timestamptz,
  ADD COLUMN IF NOT EXISTS deletion_requested_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL;

CREATE OR REPLACE FUNCTION public.request_account_deletion(p_reason text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_company_id uuid;
  v_role text;
BEGIN
  SELECT company_id, role INTO v_company_id, v_role FROM public.profiles WHERE id = auth.uid();
  IF v_company_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Empresa não encontrada');
  END IF;
  IF v_role <> 'admin' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Apenas administradores podem solicitar a exclusão da conta.');
  END IF;

  UPDATE public.companies
  SET deletion_requested_at = now(),
      deletion_requested_by = auth.uid()
  WHERE id = v_company_id;

  RETURN jsonb_build_object('success', true, 'requested_at', now());
END;
$$;

CREATE OR REPLACE FUNCTION public.cancel_account_deletion()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_company_id uuid;
  v_role text;
BEGIN
  SELECT company_id, role INTO v_company_id, v_role FROM public.profiles WHERE id = auth.uid();
  IF v_company_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Empresa não encontrada');
  END IF;
  IF v_role <> 'admin' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Apenas administradores podem cancelar o pedido.');
  END IF;

  UPDATE public.companies
  SET deletion_requested_at = NULL,
      deletion_requested_by = NULL
  WHERE id = v_company_id;

  RETURN jsonb_build_object('success', true);
END;
$$;

CREATE OR REPLACE FUNCTION public.accept_terms(p_version text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_company_id uuid;
BEGIN
  SELECT company_id INTO v_company_id FROM public.profiles WHERE id = auth.uid();
  IF v_company_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Empresa não encontrada');
  END IF;

  UPDATE public.companies
  SET terms_accepted_at = COALESCE(terms_accepted_at, now()),
      terms_version = COALESCE(terms_version, p_version)
  WHERE id = v_company_id;

  RETURN jsonb_build_object('success', true);
END;
$$;