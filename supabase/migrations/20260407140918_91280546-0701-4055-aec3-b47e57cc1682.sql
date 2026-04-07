CREATE POLICY "Users can delete own company epi files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'epi-files'
  AND (storage.foldername(name))[1] = (SELECT get_user_company_id())::text
);