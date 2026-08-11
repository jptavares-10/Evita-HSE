-- 1) employees: require module editor permission for writes
DROP POLICY IF EXISTS "Users can insert own company employees" ON public.employees;
DROP POLICY IF EXISTS "Users can update own company employees" ON public.employees;
DROP POLICY IF EXISTS "Users can delete own company employees" ON public.employees;

CREATE POLICY "mod_editor_insert_employees"
ON public.employees FOR INSERT TO authenticated
WITH CHECK (company_id = public.get_user_company_id() AND public.has_module_editor_permission('trainings'));

CREATE POLICY "mod_editor_update_employees"
ON public.employees FOR UPDATE TO authenticated
USING (company_id = public.get_user_company_id() AND public.has_module_editor_permission('trainings'))
WITH CHECK (company_id = public.get_user_company_id() AND public.has_module_editor_permission('trainings'));

CREATE POLICY "mod_editor_delete_employees"
ON public.employees FOR DELETE TO authenticated
USING (company_id = public.get_user_company_id() AND public.has_module_editor_permission('trainings'));

-- 2) supplier portal tables: no anon PostgREST path at all (defense in depth)
REVOKE ALL ON public.supplier_documents FROM anon;
REVOKE ALL ON public.supplier_folders FROM anon;
REVOKE ALL ON public.suppliers FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.supplier_documents TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.supplier_folders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.suppliers TO authenticated;
GRANT ALL ON public.supplier_documents TO service_role;
GRANT ALL ON public.supplier_folders TO service_role;
GRANT ALL ON public.suppliers TO service_role;