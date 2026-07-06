
-- Extend epi_deliveries with signature audit trail
ALTER TABLE public.epi_deliveries
  ADD COLUMN IF NOT EXISTS signature_url text,
  ADD COLUMN IF NOT EXISTS signature_pdf_url text,
  ADD COLUMN IF NOT EXISTS signature_hash text,
  ADD COLUMN IF NOT EXISTS signed_at timestamptz,
  ADD COLUMN IF NOT EXISTS signed_ip text,
  ADD COLUMN IF NOT EXISTS signed_user_agent text,
  ADD COLUMN IF NOT EXISTS signed_by_profile uuid REFERENCES public.profiles(id) ON DELETE SET NULL;

-- RLS on storage.objects for epi-signatures bucket
CREATE POLICY "epi-signatures read own company"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'epi-signatures'
  AND (storage.foldername(name))[1] = public.get_user_company_id()::text
);

CREATE POLICY "epi-signatures insert own company"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'epi-signatures'
  AND (storage.foldername(name))[1] = public.get_user_company_id()::text
);

CREATE POLICY "epi-signatures update own company"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'epi-signatures'
  AND (storage.foldername(name))[1] = public.get_user_company_id()::text
);

CREATE POLICY "epi-signatures delete own company"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'epi-signatures'
  AND (storage.foldername(name))[1] = public.get_user_company_id()::text
);
