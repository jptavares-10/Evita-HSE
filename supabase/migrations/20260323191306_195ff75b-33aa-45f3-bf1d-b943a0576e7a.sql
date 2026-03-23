-- Waste categories table
CREATE TABLE public.waste_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  color text NOT NULL DEFAULT '#3B82F6',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.waste_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company waste categories" ON public.waste_categories FOR SELECT TO authenticated USING (company_id = get_user_company_id());
CREATE POLICY "Users can insert own company waste categories" ON public.waste_categories FOR INSERT TO authenticated WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can update own company waste categories" ON public.waste_categories FOR UPDATE TO authenticated USING (company_id = get_user_company_id()) WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can delete own company waste categories" ON public.waste_categories FOR DELETE TO authenticated USING (company_id = get_user_company_id());

-- MTRs table
CREATE TABLE public.mtrs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  mtr_number text NOT NULL,
  issued_at date NOT NULL,
  cdf_deadline_at date NOT NULL,
  alert_at date NOT NULL,
  transporter text,
  mtr_file_url text,
  mtr_file_name text,
  cdf_status text NOT NULL DEFAULT 'pending',
  cdf_number text,
  cdf_received_at date,
  cdf_file_url text,
  cdf_file_name text,
  cdf_notes text,
  notes text,
  registered_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (company_id, mtr_number)
);

ALTER TABLE public.mtrs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company mtrs" ON public.mtrs FOR SELECT TO authenticated USING (company_id = get_user_company_id());
CREATE POLICY "Users can insert own company mtrs" ON public.mtrs FOR INSERT TO authenticated WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can update own company mtrs" ON public.mtrs FOR UPDATE TO authenticated USING (company_id = get_user_company_id()) WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can delete own company mtrs" ON public.mtrs FOR DELETE TO authenticated USING (company_id = get_user_company_id());

-- MTR waste items table
CREATE TABLE public.mtr_waste_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mtr_id uuid NOT NULL REFERENCES public.mtrs(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  waste_category_id uuid NOT NULL REFERENCES public.waste_categories(id),
  quantity_tons numeric(12,3),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.mtr_waste_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company mtr items" ON public.mtr_waste_items FOR SELECT TO authenticated USING (company_id = get_user_company_id());
CREATE POLICY "Users can insert own company mtr items" ON public.mtr_waste_items FOR INSERT TO authenticated WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can update own company mtr items" ON public.mtr_waste_items FOR UPDATE TO authenticated USING (company_id = get_user_company_id()) WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can delete own company mtr items" ON public.mtr_waste_items FOR DELETE TO authenticated USING (company_id = get_user_company_id());

-- Storage bucket for MTR files
INSERT INTO storage.buckets (id, name, public) VALUES ('mtr-files', 'mtr-files', true);

CREATE POLICY "Users can upload mtr files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'mtr-files');
CREATE POLICY "Users can view mtr files" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'mtr-files');
CREATE POLICY "Users can update mtr files" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'mtr-files');
CREATE POLICY "Users can delete mtr files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'mtr-files');