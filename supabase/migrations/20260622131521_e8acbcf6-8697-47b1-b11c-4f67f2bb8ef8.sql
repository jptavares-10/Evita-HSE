
-- =========================================================
-- 1) company-logos: remove ALL write/delete; read-only for company members
-- =========================================================
DROP POLICY IF EXISTS "Users can update company logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload company logos" ON storage.objects;
DROP POLICY IF EXISTS "Users can insert company logos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete company logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update company logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete company logos" ON storage.objects;

-- =========================================================
-- 2) Drop existing write policies on private module buckets (will be recreated with editor check)
-- =========================================================

-- combined-array policies
DROP POLICY IF EXISTS "Authenticated users can upload own company files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete own company files" ON storage.objects;

-- aso-files
DROP POLICY IF EXISTS "Company members can upload aso files" ON storage.objects;
DROP POLICY IF EXISTS "Company members can update aso files" ON storage.objects;
DROP POLICY IF EXISTS "Company members can delete aso files" ON storage.objects;

-- inspection-files
DROP POLICY IF EXISTS "Authenticated users can upload inspection files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own company inspection files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own company inspection files" ON storage.objects;

-- environmental-licenses
DROP POLICY IF EXISTS "Users can upload license files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own company license files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own company license files" ON storage.objects;

-- epi-certificates
DROP POLICY IF EXISTS "Authenticated users can upload epi certs" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update epi certs" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete epi certs" ON storage.objects;

-- epi-files
DROP POLICY IF EXISTS "Auth users can upload epi files to own company folder" ON storage.objects;
DROP POLICY IF EXISTS "Auth users can update epi files in own company folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own company epi files" ON storage.objects;

-- review-attachments
DROP POLICY IF EXISTS "Users can upload own company review attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own company review attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own company review attachments" ON storage.objects;

-- documents-library
DROP POLICY IF EXISTS "Users can upload own company docs" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own company docs" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own company docs" ON storage.objects;

-- service-attachments
DROP POLICY IF EXISTS "Users can upload service attachments" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update service attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete service attachments" ON storage.objects;

-- mtr-files (UPDATE has a dedicated policy)
DROP POLICY IF EXISTS "Authenticated users can update own company mtr files" ON storage.objects;

-- occurrence-files
DROP POLICY IF EXISTS "Authenticated users can update own company occurrence files" ON storage.objects;

-- training-certificates
DROP POLICY IF EXISTS "Authenticated users can update own company training files" ON storage.objects;

-- supplier-documents
DROP POLICY IF EXISTS "Authenticated users can update own company supplier files" ON storage.objects;

-- =========================================================
-- 3) Recreate write policies with module editor permission check
-- Helper: storage.foldername(name)[1] must match user's company_id
-- =========================================================

-- aso-files (module: aso)
CREATE POLICY "Editors upload aso files" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'aso-files' AND (storage.foldername(name))[1] = public.get_user_company_id()::text AND public.has_module_editor_permission('aso'));
CREATE POLICY "Editors update aso files" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'aso-files' AND (storage.foldername(name))[1] = public.get_user_company_id()::text AND public.has_module_editor_permission('aso'))
  WITH CHECK (bucket_id = 'aso-files' AND (storage.foldername(name))[1] = public.get_user_company_id()::text AND public.has_module_editor_permission('aso'));
CREATE POLICY "Editors delete aso files" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'aso-files' AND (storage.foldername(name))[1] = public.get_user_company_id()::text AND public.has_module_editor_permission('aso'));

-- inspection-files (module: inspections)
CREATE POLICY "Editors upload inspection files" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'inspection-files' AND (storage.foldername(name))[1] = public.get_user_company_id()::text AND public.has_module_editor_permission('inspections'));
CREATE POLICY "Editors update inspection files" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'inspection-files' AND (storage.foldername(name))[1] = public.get_user_company_id()::text AND public.has_module_editor_permission('inspections'))
  WITH CHECK (bucket_id = 'inspection-files' AND (storage.foldername(name))[1] = public.get_user_company_id()::text AND public.has_module_editor_permission('inspections'));
CREATE POLICY "Editors delete inspection files" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'inspection-files' AND (storage.foldername(name))[1] = public.get_user_company_id()::text AND public.has_module_editor_permission('inspections'));

-- environmental-licenses (module: environmental_licenses)
CREATE POLICY "Editors upload license files" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'environmental-licenses' AND (storage.foldername(name))[1] = public.get_user_company_id()::text AND public.has_module_editor_permission('environmental_licenses'));
CREATE POLICY "Editors update license files" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'environmental-licenses' AND (storage.foldername(name))[1] = public.get_user_company_id()::text AND public.has_module_editor_permission('environmental_licenses'))
  WITH CHECK (bucket_id = 'environmental-licenses' AND (storage.foldername(name))[1] = public.get_user_company_id()::text AND public.has_module_editor_permission('environmental_licenses'));
CREATE POLICY "Editors delete license files" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'environmental-licenses' AND (storage.foldername(name))[1] = public.get_user_company_id()::text AND public.has_module_editor_permission('environmental_licenses'));

-- epi-certificates (module: epi)
CREATE POLICY "Editors upload epi certs" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'epi-certificates' AND (storage.foldername(name))[1] = public.get_user_company_id()::text AND public.has_module_editor_permission('epi'));
CREATE POLICY "Editors update epi certs" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'epi-certificates' AND (storage.foldername(name))[1] = public.get_user_company_id()::text AND public.has_module_editor_permission('epi'))
  WITH CHECK (bucket_id = 'epi-certificates' AND (storage.foldername(name))[1] = public.get_user_company_id()::text AND public.has_module_editor_permission('epi'));
CREATE POLICY "Editors delete epi certs" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'epi-certificates' AND (storage.foldername(name))[1] = public.get_user_company_id()::text AND public.has_module_editor_permission('epi'));

-- epi-files (module: epi)
CREATE POLICY "Editors upload epi files" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'epi-files' AND (storage.foldername(name))[1] = public.get_user_company_id()::text AND public.has_module_editor_permission('epi'));
CREATE POLICY "Editors update epi files" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'epi-files' AND (storage.foldername(name))[1] = public.get_user_company_id()::text AND public.has_module_editor_permission('epi'))
  WITH CHECK (bucket_id = 'epi-files' AND (storage.foldername(name))[1] = public.get_user_company_id()::text AND public.has_module_editor_permission('epi'));
CREATE POLICY "Editors delete epi files" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'epi-files' AND (storage.foldername(name))[1] = public.get_user_company_id()::text AND public.has_module_editor_permission('epi'));

-- review-attachments (module: document_library)
CREATE POLICY "Editors upload review attachments" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'review-attachments' AND (storage.foldername(name))[1] = public.get_user_company_id()::text AND public.has_module_editor_permission('document_library'));
CREATE POLICY "Editors update review attachments" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'review-attachments' AND (storage.foldername(name))[1] = public.get_user_company_id()::text AND public.has_module_editor_permission('document_library'))
  WITH CHECK (bucket_id = 'review-attachments' AND (storage.foldername(name))[1] = public.get_user_company_id()::text AND public.has_module_editor_permission('document_library'));
CREATE POLICY "Editors delete review attachments" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'review-attachments' AND (storage.foldername(name))[1] = public.get_user_company_id()::text AND public.has_module_editor_permission('document_library'));

-- documents-library (module: document_library)
CREATE POLICY "Editors upload library docs" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'documents-library' AND (storage.foldername(name))[1] = public.get_user_company_id()::text AND public.has_module_editor_permission('document_library'));
CREATE POLICY "Editors update library docs" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'documents-library' AND (storage.foldername(name))[1] = public.get_user_company_id()::text AND public.has_module_editor_permission('document_library'))
  WITH CHECK (bucket_id = 'documents-library' AND (storage.foldername(name))[1] = public.get_user_company_id()::text AND public.has_module_editor_permission('document_library'));
CREATE POLICY "Editors delete library docs" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'documents-library' AND (storage.foldername(name))[1] = public.get_user_company_id()::text AND public.has_module_editor_permission('document_library'));

-- service-attachments (module: periodic_services)
CREATE POLICY "Editors upload service attachments" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'service-attachments' AND (storage.foldername(name))[1] = public.get_user_company_id()::text AND public.has_module_editor_permission('periodic_services'));
CREATE POLICY "Editors update service attachments" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'service-attachments' AND (storage.foldername(name))[1] = public.get_user_company_id()::text AND public.has_module_editor_permission('periodic_services'))
  WITH CHECK (bucket_id = 'service-attachments' AND (storage.foldername(name))[1] = public.get_user_company_id()::text AND public.has_module_editor_permission('periodic_services'));
CREATE POLICY "Editors delete service attachments" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'service-attachments' AND (storage.foldername(name))[1] = public.get_user_company_id()::text AND public.has_module_editor_permission('periodic_services'));

-- mtr-files (module: mtr)
CREATE POLICY "Editors upload mtr files" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'mtr-files' AND (storage.foldername(name))[1] = public.get_user_company_id()::text AND public.has_module_editor_permission('mtr'));
CREATE POLICY "Editors update mtr files" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'mtr-files' AND (storage.foldername(name))[1] = public.get_user_company_id()::text AND public.has_module_editor_permission('mtr'))
  WITH CHECK (bucket_id = 'mtr-files' AND (storage.foldername(name))[1] = public.get_user_company_id()::text AND public.has_module_editor_permission('mtr'));
CREATE POLICY "Editors delete mtr files" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'mtr-files' AND (storage.foldername(name))[1] = public.get_user_company_id()::text AND public.has_module_editor_permission('mtr'));

-- occurrence-files (module: ic_nc)
CREATE POLICY "Editors upload occurrence files" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'occurrence-files' AND (storage.foldername(name))[1] = public.get_user_company_id()::text AND public.has_module_editor_permission('ic_nc'));
CREATE POLICY "Editors update occurrence files" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'occurrence-files' AND (storage.foldername(name))[1] = public.get_user_company_id()::text AND public.has_module_editor_permission('ic_nc'))
  WITH CHECK (bucket_id = 'occurrence-files' AND (storage.foldername(name))[1] = public.get_user_company_id()::text AND public.has_module_editor_permission('ic_nc'));
CREATE POLICY "Editors delete occurrence files" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'occurrence-files' AND (storage.foldername(name))[1] = public.get_user_company_id()::text AND public.has_module_editor_permission('ic_nc'));

-- training-certificates (module: trainings)
CREATE POLICY "Editors upload training certs" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'training-certificates' AND (storage.foldername(name))[1] = public.get_user_company_id()::text AND public.has_module_editor_permission('trainings'));
CREATE POLICY "Editors update training certs" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'training-certificates' AND (storage.foldername(name))[1] = public.get_user_company_id()::text AND public.has_module_editor_permission('trainings'))
  WITH CHECK (bucket_id = 'training-certificates' AND (storage.foldername(name))[1] = public.get_user_company_id()::text AND public.has_module_editor_permission('trainings'));
CREATE POLICY "Editors delete training certs" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'training-certificates' AND (storage.foldername(name))[1] = public.get_user_company_id()::text AND public.has_module_editor_permission('trainings'));

-- supplier-documents (module: suppliers) — note: supplier portal uses service_role via edge functions, so bypasses these
CREATE POLICY "Editors upload supplier docs" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'supplier-documents' AND (storage.foldername(name))[1] = public.get_user_company_id()::text AND public.has_module_editor_permission('suppliers'));
CREATE POLICY "Editors update supplier docs" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'supplier-documents' AND (storage.foldername(name))[1] = public.get_user_company_id()::text AND public.has_module_editor_permission('suppliers'))
  WITH CHECK (bucket_id = 'supplier-documents' AND (storage.foldername(name))[1] = public.get_user_company_id()::text AND public.has_module_editor_permission('suppliers'));
CREATE POLICY "Editors delete supplier docs" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'supplier-documents' AND (storage.foldername(name))[1] = public.get_user_company_id()::text AND public.has_module_editor_permission('suppliers'));
