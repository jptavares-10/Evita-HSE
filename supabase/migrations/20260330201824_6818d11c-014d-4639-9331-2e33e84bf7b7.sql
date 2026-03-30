
-- Fix documents-library storage policies to scope by company_id

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Users can view own docs" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own docs" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own docs" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload docs" ON storage.objects;

-- Recreate with company_id folder scoping
CREATE POLICY "Users can view own company docs"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'documents-library'
  AND (storage.foldername(name))[1] = (get_user_company_id())::text
);

CREATE POLICY "Users can upload own company docs"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'documents-library'
  AND (storage.foldername(name))[1] = (get_user_company_id())::text
);

CREATE POLICY "Users can update own company docs"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'documents-library'
  AND (storage.foldername(name))[1] = (get_user_company_id())::text
)
WITH CHECK (
  bucket_id = 'documents-library'
  AND (storage.foldername(name))[1] = (get_user_company_id())::text
);

CREATE POLICY "Users can delete own company docs"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'documents-library'
  AND (storage.foldername(name))[1] = (get_user_company_id())::text
);
