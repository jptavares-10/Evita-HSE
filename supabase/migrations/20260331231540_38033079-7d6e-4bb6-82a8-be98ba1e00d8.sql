
-- Drop old inspection tables (no production data yet)
DROP TABLE IF EXISTS public.inspection_document_links CASCADE;
DROP TABLE IF EXISTS public.inspection_actions CASCADE;
DROP TABLE IF EXISTS public.inspection_attachments CASCADE;
DROP TABLE IF EXISTS public.inspection_executions CASCADE;
DROP TABLE IF EXISTS public.inspections CASCADE;

-- ============================================
-- inspection_models
-- ============================================
CREATE TABLE public.inspection_models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  related_nr text,
  sector_id uuid REFERENCES public.sectors(id) ON DELETE SET NULL,
  frequency_type text NOT NULL DEFAULT 'daily',
  frequency_days integer,
  default_responsible_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  document_id uuid REFERENCES public.documents(id) ON DELETE SET NULL,
  alert_hours_before integer NOT NULL DEFAULT 24,
  status text NOT NULL DEFAULT 'active',
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.inspection_models ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company inspection models" ON public.inspection_models FOR SELECT TO authenticated USING (company_id = get_user_company_id());
CREATE POLICY "Users can insert own company inspection models" ON public.inspection_models FOR INSERT TO authenticated WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can update own company inspection models" ON public.inspection_models FOR UPDATE TO authenticated USING (company_id = get_user_company_id()) WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can delete own company inspection models" ON public.inspection_models FOR DELETE TO authenticated USING (company_id = get_user_company_id());

CREATE INDEX idx_inspection_models_company_id ON public.inspection_models(company_id);

-- ============================================
-- inspection_executions
-- ============================================
CREATE TABLE public.inspection_executions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  model_id uuid NOT NULL REFERENCES public.inspection_models(id) ON DELETE CASCADE,
  reference text NOT NULL DEFAULT '',
  due_date date NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  completed_at timestamptz,
  completed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.inspection_executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company inspection executions" ON public.inspection_executions FOR SELECT TO authenticated USING (company_id = get_user_company_id());
CREATE POLICY "Users can insert own company inspection executions" ON public.inspection_executions FOR INSERT TO authenticated WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can update own company inspection executions" ON public.inspection_executions FOR UPDATE TO authenticated USING (company_id = get_user_company_id()) WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can delete own company inspection executions" ON public.inspection_executions FOR DELETE TO authenticated USING (company_id = get_user_company_id());

CREATE INDEX idx_inspection_executions_model_id ON public.inspection_executions(model_id);
CREATE INDEX idx_inspection_executions_company_id ON public.inspection_executions(company_id);
CREATE INDEX idx_inspection_executions_due_date ON public.inspection_executions(due_date);

-- ============================================
-- inspection_entries
-- ============================================
CREATE TABLE public.inspection_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id uuid NOT NULL REFERENCES public.inspection_executions(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id uuid REFERENCES public.employees(id) ON DELETE SET NULL,
  employee_name text NOT NULL,
  executed_at timestamptz NOT NULL DEFAULT now(),
  file_url text NOT NULL,
  file_name text NOT NULL,
  notes text,
  registered_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.inspection_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company inspection entries" ON public.inspection_entries FOR SELECT TO authenticated USING (company_id = get_user_company_id());
CREATE POLICY "Users can insert own company inspection entries" ON public.inspection_entries FOR INSERT TO authenticated WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can update own company inspection entries" ON public.inspection_entries FOR UPDATE TO authenticated USING (company_id = get_user_company_id()) WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can delete own company inspection entries" ON public.inspection_entries FOR DELETE TO authenticated USING (company_id = get_user_company_id());

CREATE INDEX idx_inspection_entries_execution_id ON public.inspection_entries(execution_id);

-- ============================================
-- inspection_corrective_actions
-- ============================================
CREATE TABLE public.inspection_corrective_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id uuid NOT NULL REFERENCES public.inspection_executions(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  description text NOT NULL,
  responsible_employee_id uuid REFERENCES public.employees(id) ON DELETE SET NULL,
  responsible_name text,
  due_date date NOT NULL,
  priority text NOT NULL DEFAULT 'medium',
  status text NOT NULL DEFAULT 'open',
  evidence_url text,
  evidence_name text,
  completion_notes text,
  completed_at timestamptz,
  completed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.inspection_corrective_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company inspection corrective actions" ON public.inspection_corrective_actions FOR SELECT TO authenticated USING (company_id = get_user_company_id());
CREATE POLICY "Users can insert own company inspection corrective actions" ON public.inspection_corrective_actions FOR INSERT TO authenticated WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can update own company inspection corrective actions" ON public.inspection_corrective_actions FOR UPDATE TO authenticated USING (company_id = get_user_company_id()) WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can delete own company inspection corrective actions" ON public.inspection_corrective_actions FOR DELETE TO authenticated USING (company_id = get_user_company_id());

CREATE INDEX idx_inspection_corrective_actions_execution_id ON public.inspection_corrective_actions(execution_id);
