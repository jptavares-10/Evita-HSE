DROP POLICY IF EXISTS "Authenticated users can read own company files" ON storage.objects;

CREATE POLICY "Company members read mtr files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'mtr-files' AND (storage.foldername(name))[1] = (public.get_user_company_id())::text);

CREATE POLICY "Company members read occurrence files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'occurrence-files' AND (storage.foldername(name))[1] = (public.get_user_company_id())::text);

CREATE POLICY "Company members read training certs"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'training-certificates' AND (storage.foldername(name))[1] = (public.get_user_company_id())::text);

CREATE POLICY "Company members read supplier docs"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'supplier-documents' AND (storage.foldername(name))[1] = (public.get_user_company_id())::text);

CREATE POLICY "Company members read service attachments"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'service-attachments' AND (storage.foldername(name))[1] = (public.get_user_company_id())::text);