UPDATE public.plan_definitions
SET modules = array_append(array_append(modules, 'license_conditionants'), 'document_review')
WHERE plan_key IN ('trial', 'enterprise')
  AND NOT ('license_conditionants' = ANY(modules));

CREATE OR REPLACE FUNCTION public.get_company_storage_usage()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, storage
AS $$
DECLARE
  v_company_id uuid;
  v_storage_gb integer;
  v_used bigint;
BEGIN
  SELECT p.company_id, c.storage_gb
    INTO v_company_id, v_storage_gb
  FROM public.profiles p
  JOIN public.companies c ON c.id = p.company_id
  WHERE p.id = auth.uid();

  IF v_company_id IS NULL THEN
    RETURN jsonb_build_object('error', 'not_found');
  END IF;

  SELECT COALESCE(SUM(COALESCE((o.metadata->>'size')::bigint, 0)), 0)
    INTO v_used
  FROM storage.objects o
  WHERE o.name LIKE v_company_id::text || '/%';

  RETURN jsonb_build_object(
    'used_bytes', v_used,
    'limit_bytes', COALESCE(v_storage_gb, 5)::bigint * 1024 * 1024 * 1024,
    'storage_gb', COALESCE(v_storage_gb, 5)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_company_storage_usage() TO authenticated;