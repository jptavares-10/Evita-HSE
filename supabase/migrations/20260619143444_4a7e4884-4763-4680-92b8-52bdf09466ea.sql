
-- 1) Editor permission checks on document review tables
DROP POLICY IF EXISTS "Users can insert own company review cycles" ON public.document_review_cycles;
DROP POLICY IF EXISTS "Users can update own company review cycles" ON public.document_review_cycles;
DROP POLICY IF EXISTS "Users can delete own company review cycles" ON public.document_review_cycles;
CREATE POLICY "Editors insert review cycles" ON public.document_review_cycles FOR INSERT TO authenticated
  WITH CHECK (company_id = get_user_company_id() AND has_module_editor_permission('document_library'));
CREATE POLICY "Editors update review cycles" ON public.document_review_cycles FOR UPDATE TO authenticated
  USING (company_id = get_user_company_id() AND has_module_editor_permission('document_library'))
  WITH CHECK (company_id = get_user_company_id() AND has_module_editor_permission('document_library'));
CREATE POLICY "Editors delete review cycles" ON public.document_review_cycles FOR DELETE TO authenticated
  USING (company_id = get_user_company_id() AND has_module_editor_permission('document_library'));

DROP POLICY IF EXISTS "Users can insert own company review assignments" ON public.document_review_assignments;
DROP POLICY IF EXISTS "Users can update own company review assignments" ON public.document_review_assignments;
DROP POLICY IF EXISTS "Users can delete own company review assignments" ON public.document_review_assignments;
CREATE POLICY "Editors insert review assignments" ON public.document_review_assignments FOR INSERT TO authenticated
  WITH CHECK (company_id = get_user_company_id() AND has_module_editor_permission('document_library'));
CREATE POLICY "Editors update review assignments" ON public.document_review_assignments FOR UPDATE TO authenticated
  USING (company_id = get_user_company_id() AND has_module_editor_permission('document_library'))
  WITH CHECK (company_id = get_user_company_id() AND has_module_editor_permission('document_library'));
CREATE POLICY "Editors delete review assignments" ON public.document_review_assignments FOR DELETE TO authenticated
  USING (company_id = get_user_company_id() AND has_module_editor_permission('document_library'));

DROP POLICY IF EXISTS "Users can insert own company review comments" ON public.document_review_comments;
DROP POLICY IF EXISTS "Users can update own company review comments" ON public.document_review_comments;
DROP POLICY IF EXISTS "Users can delete own company review comments" ON public.document_review_comments;
CREATE POLICY "Editors insert review comments" ON public.document_review_comments FOR INSERT TO authenticated
  WITH CHECK (company_id = get_user_company_id() AND has_module_editor_permission('document_library'));
CREATE POLICY "Editors update review comments" ON public.document_review_comments FOR UPDATE TO authenticated
  USING (company_id = get_user_company_id() AND has_module_editor_permission('document_library'))
  WITH CHECK (company_id = get_user_company_id() AND has_module_editor_permission('document_library'));
CREATE POLICY "Editors delete review comments" ON public.document_review_comments FOR DELETE TO authenticated
  USING (company_id = get_user_company_id() AND has_module_editor_permission('document_library'));

-- 2) Editor permission checks on sectors and job_positions (Trainings module governs these)
DROP POLICY IF EXISTS "Users can insert own company sectors" ON public.sectors;
DROP POLICY IF EXISTS "Users can update own company sectors" ON public.sectors;
DROP POLICY IF EXISTS "Users can delete own company sectors" ON public.sectors;
CREATE POLICY "Editors insert sectors" ON public.sectors FOR INSERT TO authenticated
  WITH CHECK (company_id = get_user_company_id() AND has_module_editor_permission('trainings'));
CREATE POLICY "Editors update sectors" ON public.sectors FOR UPDATE TO authenticated
  USING (company_id = get_user_company_id() AND has_module_editor_permission('trainings'))
  WITH CHECK (company_id = get_user_company_id() AND has_module_editor_permission('trainings'));
CREATE POLICY "Editors delete sectors" ON public.sectors FOR DELETE TO authenticated
  USING (company_id = get_user_company_id() AND has_module_editor_permission('trainings'));

DROP POLICY IF EXISTS "Users can insert own company positions" ON public.job_positions;
DROP POLICY IF EXISTS "Users can update own company positions" ON public.job_positions;
DROP POLICY IF EXISTS "Users can delete own company positions" ON public.job_positions;
CREATE POLICY "Editors insert positions" ON public.job_positions FOR INSERT TO authenticated
  WITH CHECK (company_id = get_user_company_id() AND has_module_editor_permission('trainings'));
CREATE POLICY "Editors update positions" ON public.job_positions FOR UPDATE TO authenticated
  USING (company_id = get_user_company_id() AND has_module_editor_permission('trainings'))
  WITH CHECK (company_id = get_user_company_id() AND has_module_editor_permission('trainings'));
CREATE POLICY "Editors delete positions" ON public.job_positions FOR DELETE TO authenticated
  USING (company_id = get_user_company_id() AND has_module_editor_permission('trainings'));

-- 3) Revoke EXECUTE from anon/authenticated on internal helper / Stripe / trigger functions
REVOKE EXECUTE ON FUNCTION public.handle_new_company_aso_types() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_company_categories() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.seed_default_aso_exam_types(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.seed_viewer_permissions() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.check_user_limit() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.activate_plan_from_stripe(text, text, text, text, text, uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.cancel_plan_from_stripe(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.renew_plan_from_stripe(text, text) FROM PUBLIC, anon, authenticated;
