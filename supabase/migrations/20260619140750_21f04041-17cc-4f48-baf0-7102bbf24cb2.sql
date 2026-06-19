
-- 1) Helper: check module editor permission server-side
CREATE OR REPLACE FUNCTION public.has_module_editor_permission(p_module text)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role text;
  v_company uuid;
  v_perm text;
BEGIN
  IF auth.uid() IS NULL THEN RETURN false; END IF;
  SELECT role, company_id INTO v_role, v_company FROM public.profiles WHERE id = auth.uid();
  IF v_role = 'admin' THEN RETURN true; END IF;
  SELECT permission INTO v_perm FROM public.user_permissions
    WHERE user_id = auth.uid() AND company_id = v_company AND module = p_module;
  RETURN COALESCE(v_perm, 'viewer') = 'editor';
END;
$$;

REVOKE ALL ON FUNCTION public.has_module_editor_permission(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_module_editor_permission(text) TO authenticated;

-- 2) Replace write policies on per-module tables to require editor permission
DO $$
DECLARE
  r record;
  mapping jsonb := '{
    "periodic_services": ["periodic_services","service_history","service_attachments","service_categories"],
    "trainings": ["trainings","employee_training_records","training_matrix","training_sector_rules"],
    "mtr": ["mtrs","mtr_waste_items","waste_categories"],
    "suppliers": ["suppliers","supplier_documents","supplier_folders","supplier_categories"],
    "ic_nc": ["occurrences","occurrence_employees","occurrence_attachments","corrective_actions"],
    "environmental_licenses": ["environmental_licenses","license_renewals","license_types"],
    "document_library": ["documents","document_revisions","document_types","document_service_links"],
    "inspections": ["inspection_models","inspection_executions","inspection_entries","inspection_corrective_actions"],
    "aso": ["aso_records","aso_exam_types"],
    "epi": ["epi_types","epi_deliveries","epi_stock_movements"]
  }'::jsonb;
  module_key text;
  tbl text;
  pol record;
BEGIN
  FOR module_key IN SELECT jsonb_object_keys(mapping) LOOP
    FOR tbl IN SELECT jsonb_array_elements_text(mapping->module_key) LOOP
      -- Drop existing INSERT/UPDATE/DELETE policies on this table
      FOR pol IN
        SELECT policyname, cmd FROM pg_policies
        WHERE schemaname='public' AND tablename=tbl AND cmd IN ('INSERT','UPDATE','DELETE')
      LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, tbl);
      END LOOP;

      -- Recreate tightened policies
      EXECUTE format(
        'CREATE POLICY "mod_editor_insert_%1$s" ON public.%1$I FOR INSERT TO authenticated
         WITH CHECK (company_id = public.get_user_company_id() AND public.has_module_editor_permission(%2$L))',
        tbl, module_key
      );
      EXECUTE format(
        'CREATE POLICY "mod_editor_update_%1$s" ON public.%1$I FOR UPDATE TO authenticated
         USING (company_id = public.get_user_company_id() AND public.has_module_editor_permission(%2$L))
         WITH CHECK (company_id = public.get_user_company_id() AND public.has_module_editor_permission(%2$L))',
        tbl, module_key
      );
      EXECUTE format(
        'CREATE POLICY "mod_editor_delete_%1$s" ON public.%1$I FOR DELETE TO authenticated
         USING (company_id = public.get_user_company_id() AND public.has_module_editor_permission(%2$L))',
        tbl, module_key
      );
    END LOOP;
  END LOOP;
END $$;

-- 3) Tighten EXECUTE on SECURITY DEFINER functions
-- Revoke from PUBLIC, then grant explicitly to the role that should call each.

-- Internal helpers / triggers: nothing else needed
REVOKE ALL ON FUNCTION public.handle_new_company_aso_types() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_company_categories() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.seed_default_categories(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.seed_default_aso_exam_types(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.seed_default_document_types(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.seed_viewer_permissions() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.check_user_limit() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.has_pending_invitation(uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_user_company_id() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_user_company_id() TO authenticated;
REVOKE ALL ON FUNCTION public.has_module_editor_permission(text) FROM PUBLIC, anon;

-- Stripe webhook only (service role)
REVOKE ALL ON FUNCTION public.activate_plan_from_stripe(text, text, text, text, text, uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.cancel_plan_from_stripe(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.renew_plan_from_stripe(text, text) FROM PUBLIC, anon, authenticated;

-- Authenticated-only RPCs
REVOKE ALL ON FUNCTION public.get_company_access_status() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_company_access_status() TO authenticated;
REVOKE ALL ON FUNCTION public.get_user_permissions(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_user_permissions(uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.set_user_permission(uuid, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_user_permission(uuid, text, text) TO authenticated;
REVOKE ALL ON FUNCTION public.remove_member(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.remove_member(uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.update_company_safe_fields(text, text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.update_company_safe_fields(text, text, text, text) TO authenticated;
REVOKE ALL ON FUNCTION public.get_pending_invitation_for_current_user() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_pending_invitation_for_current_user() TO authenticated;
REVOKE ALL ON FUNCTION public.accept_invitation_membership(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.accept_invitation_membership(uuid, text) TO authenticated;
REVOKE ALL ON FUNCTION public.create_company_and_admin(text, text, text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_company_and_admin(text, text, text, text, text) TO authenticated;

-- Anon-accessible (portal + invitation lookup) — keep anon explicitly, drop authenticated where not needed
REVOKE ALL ON FUNCTION public.validate_invitation_token(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.validate_invitation_token(uuid) TO anon, authenticated;
REVOKE ALL ON FUNCTION public.get_supplier_portal_data(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_supplier_portal_data(uuid) TO anon, authenticated;
REVOKE ALL ON FUNCTION public.upload_supplier_document(uuid, uuid, text, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.upload_supplier_document(uuid, uuid, text, text, text, text, text) TO anon, authenticated;
REVOKE ALL ON FUNCTION public.create_supplier_folder_portal(uuid, text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_supplier_folder_portal(uuid, text, uuid) TO anon, authenticated;
