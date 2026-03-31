
-- 1. epi_types
CREATE TABLE public.epi_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  ca_number text,
  ca_expires_at date,
  ca_alert_days_before integer NOT NULL DEFAULT 60,
  ca_file_url text,
  ca_file_name text,
  unit text NOT NULL DEFAULT 'un',
  minimum_stock integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.epi_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company epi types" ON public.epi_types FOR SELECT TO authenticated USING (company_id = get_user_company_id());
CREATE POLICY "Users can insert own company epi types" ON public.epi_types FOR INSERT TO authenticated WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can update own company epi types" ON public.epi_types FOR UPDATE TO authenticated USING (company_id = get_user_company_id()) WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can delete own company epi types" ON public.epi_types FOR DELETE TO authenticated USING (company_id = get_user_company_id());

-- 2. epi_deliveries (must be created before epi_stock_movements because of FK)
CREATE TABLE public.epi_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  epi_type_id uuid NOT NULL REFERENCES public.epi_types(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  delivered_at date NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  reason text,
  returned_at date,
  notes text,
  registered_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.epi_deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company epi deliveries" ON public.epi_deliveries FOR SELECT TO authenticated USING (company_id = get_user_company_id());
CREATE POLICY "Users can insert own company epi deliveries" ON public.epi_deliveries FOR INSERT TO authenticated WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can update own company epi deliveries" ON public.epi_deliveries FOR UPDATE TO authenticated USING (company_id = get_user_company_id()) WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can delete own company epi deliveries" ON public.epi_deliveries FOR DELETE TO authenticated USING (company_id = get_user_company_id());

-- 3. epi_stock_movements
CREATE TABLE public.epi_stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  epi_type_id uuid NOT NULL REFERENCES public.epi_types(id) ON DELETE CASCADE,
  movement_type text NOT NULL DEFAULT 'entry',
  quantity integer NOT NULL,
  notes text,
  moved_at date NOT NULL,
  registered_by uuid REFERENCES public.profiles(id),
  delivery_id uuid REFERENCES public.epi_deliveries(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.epi_stock_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company epi movements" ON public.epi_stock_movements FOR SELECT TO authenticated USING (company_id = get_user_company_id());
CREATE POLICY "Users can insert own company epi movements" ON public.epi_stock_movements FOR INSERT TO authenticated WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can update own company epi movements" ON public.epi_stock_movements FOR UPDATE TO authenticated USING (company_id = get_user_company_id()) WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can delete own company epi movements" ON public.epi_stock_movements FOR DELETE TO authenticated USING (company_id = get_user_company_id());

-- 4. Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('epi-certificates', 'epi-certificates', false);

-- Storage RLS policies
CREATE POLICY "Authenticated users can upload epi certs" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'epi-certificates' AND (storage.foldername(name))[1] = (SELECT company_id::text FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Authenticated users can view epi certs" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'epi-certificates' AND (storage.foldername(name))[1] = (SELECT company_id::text FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Authenticated users can update epi certs" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'epi-certificates' AND (storage.foldername(name))[1] = (SELECT company_id::text FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Authenticated users can delete epi certs" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'epi-certificates' AND (storage.foldername(name))[1] = (SELECT company_id::text FROM public.profiles WHERE id = auth.uid()));
