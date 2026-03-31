
-- =============================================
-- Módulo: Inspeções de Segurança / CIPA
-- =============================================

-- 1. Tabela de inspeções (cadastro)
CREATE TABLE public.inspections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  location text,
  frequency_type text NOT NULL DEFAULT 'fixed',
  frequency_preset text,
  frequency_days integer,
  alert_days_before integer NOT NULL DEFAULT 1,
  is_periodic boolean NOT NULL DEFAULT true,
  responsible text,
  last_done_at date,
  next_due_at date,
  status text NOT NULL DEFAULT 'active',
  notes text,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company inspections" ON public.inspections FOR SELECT TO authenticated USING (company_id = get_user_company_id());
CREATE POLICY "Users can insert own company inspections" ON public.inspections FOR INSERT TO authenticated WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can update own company inspections" ON public.inspections FOR UPDATE TO authenticated USING (company_id = get_user_company_id()) WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can delete own company inspections" ON public.inspections FOR DELETE TO authenticated USING (company_id = get_user_company_id());

-- 2. Tabela de execuções
CREATE TABLE public.inspection_executions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  inspection_id uuid NOT NULL REFERENCES public.inspections(id) ON DELETE CASCADE,
  executed_at date NOT NULL,
  result text NOT NULL DEFAULT 'conforme',
  observations text,
  executed_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.inspection_executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company inspection executions" ON public.inspection_executions FOR SELECT TO authenticated USING (company_id = get_user_company_id());
CREATE POLICY "Users can insert own company inspection executions" ON public.inspection_executions FOR INSERT TO authenticated WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can update own company inspection executions" ON public.inspection_executions FOR UPDATE TO authenticated USING (company_id = get_user_company_id()) WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can delete own company inspection executions" ON public.inspection_executions FOR DELETE TO authenticated USING (company_id = get_user_company_id());

-- 3. Tabela de anexos
CREATE TABLE public.inspection_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  inspection_id uuid NOT NULL REFERENCES public.inspections(id) ON DELETE CASCADE,
  execution_id uuid REFERENCES public.inspection_executions(id) ON DELETE CASCADE,
  file_url text NOT NULL,
  file_name text NOT NULL,
  file_type text NOT NULL DEFAULT 'other',
  uploaded_by uuid REFERENCES public.profiles(id),
  uploaded_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.inspection_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company inspection attachments" ON public.inspection_attachments FOR SELECT TO authenticated USING (company_id = get_user_company_id());
CREATE POLICY "Users can insert own company inspection attachments" ON public.inspection_attachments FOR INSERT TO authenticated WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can update own company inspection attachments" ON public.inspection_attachments FOR UPDATE TO authenticated USING (company_id = get_user_company_id()) WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can delete own company inspection attachments" ON public.inspection_attachments FOR DELETE TO authenticated USING (company_id = get_user_company_id());

-- 4. Tabela de ações corretivas
CREATE TABLE public.inspection_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  inspection_id uuid NOT NULL REFERENCES public.inspections(id) ON DELETE CASCADE,
  execution_id uuid REFERENCES public.inspection_executions(id) ON DELETE CASCADE,
  description text NOT NULL,
  responsible text,
  due_date date,
  status text NOT NULL DEFAULT 'pending',
  completed_at timestamptz,
  completed_by uuid REFERENCES public.profiles(id),
  completion_notes text,
  evidence_url text,
  evidence_name text,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.inspection_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company inspection actions" ON public.inspection_actions FOR SELECT TO authenticated USING (company_id = get_user_company_id());
CREATE POLICY "Users can insert own company inspection actions" ON public.inspection_actions FOR INSERT TO authenticated WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can update own company inspection actions" ON public.inspection_actions FOR UPDATE TO authenticated USING (company_id = get_user_company_id()) WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can delete own company inspection actions" ON public.inspection_actions FOR DELETE TO authenticated USING (company_id = get_user_company_id());

-- 5. Tabela de vínculos com documentos
CREATE TABLE public.inspection_document_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  inspection_id uuid NOT NULL REFERENCES public.inspections(id) ON DELETE CASCADE,
  document_id uuid NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  linked_by uuid REFERENCES public.profiles(id),
  linked_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.inspection_document_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company inspection doc links" ON public.inspection_document_links FOR SELECT TO authenticated USING (company_id = get_user_company_id());
CREATE POLICY "Users can insert own company inspection doc links" ON public.inspection_document_links FOR INSERT TO authenticated WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can delete own company inspection doc links" ON public.inspection_document_links FOR DELETE TO authenticated USING (company_id = get_user_company_id());

-- 6. Storage bucket para anexos de inspeções
INSERT INTO storage.buckets (id, name, public) VALUES ('inspection-files', 'inspection-files', false);

CREATE POLICY "Authenticated users can upload inspection files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'inspection-files' AND (storage.foldername(name))[1] = (SELECT p.company_id::text FROM public.profiles p WHERE p.id = auth.uid()));
CREATE POLICY "Users can view own company inspection files" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'inspection-files' AND (storage.foldername(name))[1] = (SELECT p.company_id::text FROM public.profiles p WHERE p.id = auth.uid()));
CREATE POLICY "Users can update own company inspection files" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'inspection-files' AND (storage.foldername(name))[1] = (SELECT p.company_id::text FROM public.profiles p WHERE p.id = auth.uid()));
CREATE POLICY "Users can delete own company inspection files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'inspection-files' AND (storage.foldername(name))[1] = (SELECT p.company_id::text FROM public.profiles p WHERE p.id = auth.uid()));
