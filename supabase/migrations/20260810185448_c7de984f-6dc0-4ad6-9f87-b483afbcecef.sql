CREATE POLICY "cond_files_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'license-conditionants' AND (storage.foldername(name))[1] = public.get_user_company_id()::text);

CREATE POLICY "cond_files_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'license-conditionants' AND (storage.foldername(name))[1] = public.get_user_company_id()::text AND public.has_module_editor_permission('environmental_licenses'));

CREATE POLICY "cond_files_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'license-conditionants' AND (storage.foldername(name))[1] = public.get_user_company_id()::text AND public.has_module_editor_permission('environmental_licenses'));