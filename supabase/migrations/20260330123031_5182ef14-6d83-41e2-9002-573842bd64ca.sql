-- Create license_types table
CREATE TABLE public.license_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create environmental_licenses table
CREATE TABLE public.environmental_licenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  license_number text NOT NULL,
  title text NOT NULL,
  license_type_id uuid REFERENCES public.license_types(id) ON DELETE SET NULL,
  issuing_body text NOT NULL,
  sphere text NOT NULL,
  issued_at date NOT NULL,
  expires_at date,
  has_expiry boolean NOT NULL DEFAULT true,
  alert_days_before integer NOT NULL DEFAULT 60,
  status text NOT NULL DEFAULT 'active',
  conditionants text,
  notes text,
  file_url text,
  file_name text,
  registered_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create license_renewals table
CREATE TABLE public.license_renewals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  license_id uuid NOT NULL REFERENCES public.environmental_licenses(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  license_number text,
  issued_at date NOT NULL,
  expires_at date,
  file_url text NOT NULL,
  file_name text NOT NULL,
  notes text,
  registered_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  registered_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('environmental-licenses', 'environmental-licenses', false);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_env_licenses_company_id ON public.environmental_licenses(company_id);
CREATE INDEX IF NOT EXISTS idx_env_licenses_type_id ON public.environmental_licenses(license_type_id);
CREATE INDEX IF NOT EXISTS idx_license_renewals_license_id ON public.license_renewals(license_id);

-- RLS: license_types
ALTER TABLE public.license_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company license types" ON public.license_types
  FOR SELECT TO authenticated USING (company_id = get_user_company_id());
CREATE POLICY "Users can insert own company license types" ON public.license_types
  FOR INSERT TO authenticated WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can update own company license types" ON public.license_types
  FOR UPDATE TO authenticated USING (company_id = get_user_company_id()) WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can delete own company license types" ON public.license_types
  FOR DELETE TO authenticated USING (company_id = get_user_company_id());

-- RLS: environmental_licenses
ALTER TABLE public.environmental_licenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company licenses" ON public.environmental_licenses
  FOR SELECT TO authenticated USING (company_id = get_user_company_id());
CREATE POLICY "Users can insert own company licenses" ON public.environmental_licenses
  FOR INSERT TO authenticated WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can update own company licenses" ON public.environmental_licenses
  FOR UPDATE TO authenticated USING (company_id = get_user_company_id()) WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can delete own company licenses" ON public.environmental_licenses
  FOR DELETE TO authenticated USING (company_id = get_user_company_id());

-- RLS: license_renewals
ALTER TABLE public.license_renewals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company renewals" ON public.license_renewals
  FOR SELECT TO authenticated USING (company_id = get_user_company_id());
CREATE POLICY "Users can insert own company renewals" ON public.license_renewals
  FOR INSERT TO authenticated WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can update own company renewals" ON public.license_renewals
  FOR UPDATE TO authenticated USING (company_id = get_user_company_id()) WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can delete own company renewals" ON public.license_renewals
  FOR DELETE TO authenticated USING (company_id = get_user_company_id());

-- Storage RLS for environmental-licenses bucket
CREATE POLICY "Users can upload license files" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'environmental-licenses' AND (storage.foldername(name))[1] = (SELECT company_id::text FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Users can view own company license files" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'environmental-licenses' AND (storage.foldername(name))[1] = (SELECT company_id::text FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Users can delete own company license files" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'environmental-licenses' AND (storage.foldername(name))[1] = (SELECT company_id::text FROM public.profiles WHERE id = auth.uid()));