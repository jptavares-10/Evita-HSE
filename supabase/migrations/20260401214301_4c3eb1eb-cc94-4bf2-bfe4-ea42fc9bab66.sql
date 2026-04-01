
-- Add 'epi' to all three permission functions

CREATE OR REPLACE FUNCTION public.get_user_permissions(p_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_caller_company uuid;
  v_target_company uuid;
  v_target_role text;
  v_result jsonb := '{}'::jsonb;
  v_modules text[] := ARRAY['periodic_services','trainings','mtr','suppliers','ic_nc','environmental_licenses','document_library','inspections','aso','epi'];
  v_module text;
  v_perm text;
BEGIN
  SELECT company_id INTO v_caller_company FROM profiles WHERE id = auth.uid();
  SELECT company_id, role INTO v_target_company, v_target_role FROM profiles WHERE id = p_user_id;

  IF v_caller_company IS NULL OR v_target_company IS NULL OR v_caller_company != v_target_company THEN
    RETURN jsonb_build_object('error', 'Usuário não pertence à mesma empresa.');
  END IF;

  FOREACH v_module IN ARRAY v_modules LOOP
    SELECT permission INTO v_perm FROM user_permissions
    WHERE user_id = p_user_id AND company_id = v_caller_company AND module = v_module;

    IF v_perm IS NULL THEN
      IF v_target_role = 'admin' THEN
        v_perm := 'editor';
      ELSE
        v_perm := 'viewer';
      END IF;
    END IF;

    v_result := v_result || jsonb_build_object(v_module, v_perm);
  END LOOP;

  RETURN v_result;
END;
$function$;

CREATE OR REPLACE FUNCTION public.set_user_permission(p_user_id uuid, p_module text, p_permission text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_caller record;
  v_target record;
  v_valid_modules text[] := ARRAY['periodic_services','trainings','mtr','suppliers','ic_nc','environmental_licenses','document_library','inspections','aso','epi'];
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Não autenticado.');
  END IF;

  SELECT id, company_id, role INTO v_caller FROM profiles WHERE id = auth.uid();
  IF v_caller.role != 'admin' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Apenas administradores podem alterar permissões.');
  END IF;

  SELECT id, company_id INTO v_target FROM profiles WHERE id = p_user_id;
  IF v_target.company_id != v_caller.company_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'Usuário não pertence à mesma empresa.');
  END IF;

  IF NOT (p_module = ANY(v_valid_modules)) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Módulo inválido.');
  END IF;

  IF p_permission NOT IN ('editor', 'viewer') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Permissão inválida.');
  END IF;

  INSERT INTO user_permissions (company_id, user_id, module, permission, updated_by, updated_at)
  VALUES (v_caller.company_id, p_user_id, p_module, p_permission, auth.uid(), now())
  ON CONFLICT (company_id, user_id, module)
  DO UPDATE SET permission = p_permission, updated_by = auth.uid(), updated_at = now();

  RETURN jsonb_build_object('success', true);
END;
$function$;

CREATE OR REPLACE FUNCTION public.seed_viewer_permissions()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_modules text[] := ARRAY['periodic_services','trainings','mtr','suppliers','ic_nc','environmental_licenses','document_library','inspections','aso','epi'];
  v_module text;
BEGIN
  IF NEW.role = 'member' THEN
    FOREACH v_module IN ARRAY v_modules LOOP
      INSERT INTO user_permissions (company_id, user_id, module, permission, updated_by, updated_at)
      VALUES (NEW.company_id, NEW.id, v_module, 'viewer', NEW.id, now())
      ON CONFLICT (company_id, user_id, module) DO NOTHING;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$function$;
