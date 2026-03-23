
-- Trainings catalog
CREATE TABLE public.trainings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  validity_months integer NOT NULL,
  alert_days_before integer NOT NULL DEFAULT 30,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE POLICY "Users can view own company trainings" ON public.trainings FOR SELECT TO authenticated USING (company_id = get_user_company_id());
CREATE POLICY "Users can insert own company trainings" ON public.trainings FOR INSERT TO authenticated WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can update own company trainings" ON public.trainings FOR UPDATE TO authenticated USING (company_id = get_user_company_id()) WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can delete own company trainings" ON public.trainings FOR DELETE TO authenticated USING (company_id = get_user_company_id());

-- Job positions
CREATE TABLE public.job_positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE POLICY "Users can view own company positions" ON public.job_positions FOR SELECT TO authenticated USING (company_id = get_user_company_id());
CREATE POLICY "Users can insert own company positions" ON public.job_positions FOR INSERT TO authenticated WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can update own company positions" ON public.job_positions FOR UPDATE TO authenticated USING (company_id = get_user_company_id()) WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can delete own company positions" ON public.job_positions FOR DELETE TO authenticated USING (company_id = get_user_company_id());

-- Training matrix
CREATE TABLE public.training_matrix (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  job_position_id uuid NOT NULL REFERENCES public.job_positions(id) ON DELETE CASCADE,
  training_id uuid NOT NULL REFERENCES public.trainings(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (company_id, job_position_id, training_id)
);

CREATE POLICY "Users can view own company matrix" ON public.training_matrix FOR SELECT TO authenticated USING (company_id = get_user_company_id());
CREATE POLICY "Users can insert own company matrix" ON public.training_matrix FOR INSERT TO authenticated WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can delete own company matrix" ON public.training_matrix FOR DELETE TO authenticated USING (company_id = get_user_company_id());

-- Employees
CREATE TABLE public.employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  job_position_id uuid REFERENCES public.job_positions(id) ON DELETE SET NULL,
  sector text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE POLICY "Users can view own company employees" ON public.employees FOR SELECT TO authenticated USING (company_id = get_user_company_id());
CREATE POLICY "Users can insert own company employees" ON public.employees FOR INSERT TO authenticated WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can update own company employees" ON public.employees FOR UPDATE TO authenticated USING (company_id = get_user_company_id()) WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can delete own company employees" ON public.employees FOR DELETE TO authenticated USING (company_id = get_user_company_id());

-- Employee training records
CREATE TABLE public.employee_training_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  training_id uuid NOT NULL REFERENCES public.trainings(id) ON DELETE CASCADE,
  done_at date NOT NULL,
  expires_at date NOT NULL,
  certificate_url text,
  certificate_name text,
  notes text,
  registered_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE POLICY "Users can view own company records" ON public.employee_training_records FOR SELECT TO authenticated USING (company_id = get_user_company_id());
CREATE POLICY "Users can insert own company records" ON public.employee_training_records FOR INSERT TO authenticated WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can update own company records" ON public.employee_training_records FOR UPDATE TO authenticated USING (company_id = get_user_company_id()) WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can delete own company records" ON public.employee_training_records FOR DELETE TO authenticated USING (company_id = get_user_company_id());

-- Storage bucket for training certificates
INSERT INTO storage.buckets (id, name, public) VALUES ('training-certificates', 'training-certificates', true);

-- Storage RLS
CREATE POLICY "Authenticated users can upload training certs" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'training-certificates');
CREATE POLICY "Authenticated users can view training certs" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'training-certificates');
CREATE POLICY "Authenticated users can delete training certs" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'training-certificates');
