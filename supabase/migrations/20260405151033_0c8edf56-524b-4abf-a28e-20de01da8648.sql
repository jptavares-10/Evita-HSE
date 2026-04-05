-- Add attachment columns to epi_deliveries
ALTER TABLE public.epi_deliveries
  ADD COLUMN IF NOT EXISTS attachment_url text,
  ADD COLUMN IF NOT EXISTS attachment_name text;

-- Add index on employee_id for ficha queries
CREATE INDEX IF NOT EXISTS idx_epi_deliveries_employee_id
  ON public.epi_deliveries(employee_id);

-- Create epi-files bucket (private)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('epi-files', 'epi-files', false, 20971520)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for epi-files bucket
CREATE POLICY "Auth users can upload epi files to own company folder"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'epi-files'
  AND (storage.foldername(name))[1] = (SELECT company_id::text FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Auth users can view epi files from own company"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'epi-files'
  AND (storage.foldername(name))[1] = (SELECT company_id::text FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Auth users can update epi files in own company folder"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'epi-files'
  AND (storage.foldername(name))[1] = (SELECT company_id::text FROM public.profiles WHERE id = auth.uid())
)
WITH CHECK (
  bucket_id = 'epi-files'
  AND (storage.foldername(name))[1] = (SELECT company_id::text FROM public.profiles WHERE id = auth.uid())
);