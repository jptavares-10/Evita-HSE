
-- Occurrences table
CREATE TABLE public.occurrences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  type text NOT NULL,
  severity text NOT NULL,
  occurred_at timestamp with time zone NOT NULL,
  location text NOT NULL,
  description text NOT NULL,
  cause_analysis text,
  body_part_affected text,
  with_leave boolean,
  status text NOT NULL DEFAULT 'open',
  registered_by uuid REFERENCES public.profiles(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.occurrences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own company occurrences" ON public.occurrences FOR SELECT TO authenticated USING (company_id = get_user_company_id());
CREATE POLICY "Users can insert own company occurrences" ON public.occurrences FOR INSERT TO authenticated WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can update own company occurrences" ON public.occurrences FOR UPDATE TO authenticated USING (company_id = get_user_company_id()) WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can delete own company occurrences" ON public.occurrences FOR DELETE TO authenticated USING (company_id = get_user_company_id());

-- Occurrence employees
CREATE TABLE public.occurrence_employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  occurrence_id uuid NOT NULL REFERENCES public.occurrences(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id uuid REFERENCES public.employees(id) ON DELETE SET NULL,
  employee_name text NOT NULL
);

ALTER TABLE public.occurrence_employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own company occurrence employees" ON public.occurrence_employees FOR SELECT TO authenticated USING (company_id = get_user_company_id());
CREATE POLICY "Users can insert own company occurrence employees" ON public.occurrence_employees FOR INSERT TO authenticated WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can update own company occurrence employees" ON public.occurrence_employees FOR UPDATE TO authenticated USING (company_id = get_user_company_id()) WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can delete own company occurrence employees" ON public.occurrence_employees FOR DELETE TO authenticated USING (company_id = get_user_company_id());

-- Occurrence attachments
CREATE TABLE public.occurrence_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  occurrence_id uuid NOT NULL REFERENCES public.occurrences(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  file_url text NOT NULL,
  file_name text NOT NULL,
  file_type text NOT NULL DEFAULT 'document',
  uploaded_by uuid REFERENCES public.profiles(id),
  uploaded_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.occurrence_attachments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own company occurrence attachments" ON public.occurrence_attachments FOR SELECT TO authenticated USING (company_id = get_user_company_id());
CREATE POLICY "Users can insert own company occurrence attachments" ON public.occurrence_attachments FOR INSERT TO authenticated WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can update own company occurrence attachments" ON public.occurrence_attachments FOR UPDATE TO authenticated USING (company_id = get_user_company_id()) WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can delete own company occurrence attachments" ON public.occurrence_attachments FOR DELETE TO authenticated USING (company_id = get_user_company_id());

-- Corrective actions
CREATE TABLE public.corrective_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  occurrence_id uuid NOT NULL REFERENCES public.occurrences(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  evidence_url text,
  evidence_name text,
  completion_notes text,
  completed_at timestamp with time zone,
  completed_by uuid REFERENCES public.profiles(id),
  created_by uuid NOT NULL REFERENCES public.profiles(id),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.corrective_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own company corrective actions" ON public.corrective_actions FOR SELECT TO authenticated USING (company_id = get_user_company_id());
CREATE POLICY "Users can insert own company corrective actions" ON public.corrective_actions FOR INSERT TO authenticated WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can update own company corrective actions" ON public.corrective_actions FOR UPDATE TO authenticated USING (company_id = get_user_company_id()) WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can delete own company corrective actions" ON public.corrective_actions FOR DELETE TO authenticated USING (company_id = get_user_company_id());

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('occurrence-files', 'occurrence-files', true);

CREATE POLICY "Users can upload occurrence files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'occurrence-files');
CREATE POLICY "Users can view occurrence files" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'occurrence-files');
CREATE POLICY "Users can delete occurrence files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'occurrence-files');
CREATE POLICY "Public can view occurrence files" ON storage.objects FOR SELECT TO anon USING (bucket_id = 'occurrence-files');
