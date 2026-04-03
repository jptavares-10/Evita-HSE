-- 1. Set file_size_limit on buckets missing it (20MB)
UPDATE storage.buckets
SET file_size_limit = 20971520
WHERE id IN ('aso-files', 'documents-library', 'environmental-licenses', 'epi-certificates', 'inspection-files')
  AND (file_size_limit IS NULL OR file_size_limit != 20971520);

-- 2. Fix storage UPDATE policies missing WITH CHECK

-- Fix: Company members can update aso files
DROP POLICY IF EXISTS "Company members can update aso files" ON storage.objects;
CREATE POLICY "Company members can update aso files"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'aso-files'
  AND (storage.foldername(name))[1] = (
    SELECT (profiles.company_id)::text FROM profiles WHERE profiles.id = (select auth.uid())
  )
)
WITH CHECK (
  bucket_id = 'aso-files'
  AND (storage.foldername(name))[1] = (
    SELECT (profiles.company_id)::text FROM profiles WHERE profiles.id = (select auth.uid())
  )
);

-- Fix: Users can update own company inspection files
DROP POLICY IF EXISTS "Users can update own company inspection files" ON storage.objects;
CREATE POLICY "Users can update own company inspection files"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'inspection-files'
  AND (storage.foldername(name))[1] = (
    SELECT (p.company_id)::text FROM profiles p WHERE p.id = (select auth.uid())
  )
)
WITH CHECK (
  bucket_id = 'inspection-files'
  AND (storage.foldername(name))[1] = (
    SELECT (p.company_id)::text FROM profiles p WHERE p.id = (select auth.uid())
  )
);

-- Fix: Authenticated users can update epi certs
DROP POLICY IF EXISTS "Authenticated users can update epi certs" ON storage.objects;
CREATE POLICY "Authenticated users can update epi certs"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'epi-certificates'
  AND (storage.foldername(name))[1] = (
    SELECT (profiles.company_id)::text FROM profiles WHERE profiles.id = (select auth.uid())
  )
)
WITH CHECK (
  bucket_id = 'epi-certificates'
  AND (storage.foldername(name))[1] = (
    SELECT (profiles.company_id)::text FROM profiles WHERE profiles.id = (select auth.uid())
  )
);