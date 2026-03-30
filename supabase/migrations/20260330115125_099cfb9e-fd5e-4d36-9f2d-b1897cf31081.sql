
-- Fix avatar storage policies: add path-based ownership checks
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;

CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Fix company-logos storage policies: add path-based ownership checks
DROP POLICY IF EXISTS "Users can update company logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload company logos" ON storage.objects;

CREATE POLICY "Users can update company logos"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'company-logos' AND (storage.foldername(name))[1] = get_user_company_id()::text)
WITH CHECK (bucket_id = 'company-logos' AND (storage.foldername(name))[1] = get_user_company_id()::text);

CREATE POLICY "Authenticated users can upload company logos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'company-logos' AND (storage.foldername(name))[1] = get_user_company_id()::text);
