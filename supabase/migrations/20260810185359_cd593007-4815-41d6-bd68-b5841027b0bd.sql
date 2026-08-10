-- Condicionantes
CREATE TABLE public.license_conditionants (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  license_id uuid NOT NULL REFERENCES public.environmental_licenses(id) ON DELETE CASCADE,
  item_code text,
  description text NOT NULL,
  responsible_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  criticality text NOT NULL DEFAULT 'media',
  deadline_type text NOT NULL DEFAULT 'single',
  due_date date,
  recurrence text,
  days_before_license_expiry integer,
  alert_days_before integer NOT NULL DEFAULT 30,
  status text NOT NULL DEFAULT 'pending',
  notes text,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.license_conditionants TO authenticated;
GRANT ALL ON public.license_conditionants TO service_role;
ALTER TABLE public.license_conditionants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "conditionants_select" ON public.license_conditionants
  FOR SELECT TO authenticated USING (company_id = public.get_user_company_id());
CREATE POLICY "conditionants_insert" ON public.license_conditionants
  FOR INSERT TO authenticated WITH CHECK (company_id = public.get_user_company_id() AND public.has_module_editor_permission('environmental_licenses'));
CREATE POLICY "conditionants_update" ON public.license_conditionants
  FOR UPDATE TO authenticated USING (company_id = public.get_user_company_id() AND public.has_module_editor_permission('environmental_licenses'))
  WITH CHECK (company_id = public.get_user_company_id());
CREATE POLICY "conditionants_delete" ON public.license_conditionants
  FOR DELETE TO authenticated USING (company_id = public.get_user_company_id() AND public.has_module_editor_permission('environmental_licenses'));

CREATE TRIGGER license_conditionants_updated_at BEFORE UPDATE ON public.license_conditionants
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE INDEX idx_conditionants_company ON public.license_conditionants(company_id);
CREATE INDEX idx_conditionants_license ON public.license_conditionants(license_id);

-- Cumprimentos
CREATE TABLE public.conditionant_compliances (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conditionant_id uuid NOT NULL REFERENCES public.license_conditionants(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  fulfilled_at date NOT NULL DEFAULT CURRENT_DATE,
  reference_due_date date,
  notes text,
  protocol_number text,
  protocol_date date,
  protocol_body text,
  protocol_channel text,
  registered_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.conditionant_compliances TO authenticated;
GRANT ALL ON public.conditionant_compliances TO service_role;
ALTER TABLE public.conditionant_compliances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cond_compliances_select" ON public.conditionant_compliances
  FOR SELECT TO authenticated USING (company_id = public.get_user_company_id());
CREATE POLICY "cond_compliances_insert" ON public.conditionant_compliances
  FOR INSERT TO authenticated WITH CHECK (company_id = public.get_user_company_id() AND public.has_module_editor_permission('environmental_licenses'));
CREATE POLICY "cond_compliances_update" ON public.conditionant_compliances
  FOR UPDATE TO authenticated USING (company_id = public.get_user_company_id() AND public.has_module_editor_permission('environmental_licenses'))
  WITH CHECK (company_id = public.get_user_company_id());
CREATE POLICY "cond_compliances_delete" ON public.conditionant_compliances
  FOR DELETE TO authenticated USING (company_id = public.get_user_company_id() AND public.has_module_editor_permission('environmental_licenses'));

CREATE INDEX idx_cond_compliances_cond ON public.conditionant_compliances(conditionant_id);

-- Arquivos de evidência
CREATE TABLE public.conditionant_evidence_files (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  compliance_id uuid NOT NULL REFERENCES public.conditionant_compliances(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  file_url text NOT NULL,
  file_name text NOT NULL,
  file_type text,
  uploaded_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.conditionant_evidence_files TO authenticated;
GRANT ALL ON public.conditionant_evidence_files TO service_role;
ALTER TABLE public.conditionant_evidence_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cond_evidence_select" ON public.conditionant_evidence_files
  FOR SELECT TO authenticated USING (company_id = public.get_user_company_id());
CREATE POLICY "cond_evidence_insert" ON public.conditionant_evidence_files
  FOR INSERT TO authenticated WITH CHECK (company_id = public.get_user_company_id() AND public.has_module_editor_permission('environmental_licenses'));
CREATE POLICY "cond_evidence_delete" ON public.conditionant_evidence_files
  FOR DELETE TO authenticated USING (company_id = public.get_user_company_id() AND public.has_module_editor_permission('environmental_licenses'));

CREATE INDEX idx_cond_evidence_compliance ON public.conditionant_evidence_files(compliance_id);

-- Vínculos com biblioteca de documentos
CREATE TABLE public.conditionant_document_links (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  compliance_id uuid NOT NULL REFERENCES public.conditionant_compliances(id) ON DELETE CASCADE,
  document_id uuid NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (compliance_id, document_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.conditionant_document_links TO authenticated;
GRANT ALL ON public.conditionant_document_links TO service_role;
ALTER TABLE public.conditionant_document_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cond_doclinks_select" ON public.conditionant_document_links
  FOR SELECT TO authenticated USING (company_id = public.get_user_company_id());
CREATE POLICY "cond_doclinks_insert" ON public.conditionant_document_links
  FOR INSERT TO authenticated WITH CHECK (company_id = public.get_user_company_id() AND public.has_module_editor_permission('environmental_licenses'));
CREATE POLICY "cond_doclinks_delete" ON public.conditionant_document_links
  FOR DELETE TO authenticated USING (company_id = public.get_user_company_id() AND public.has_module_editor_permission('environmental_licenses'));

-- Calendário: incluir condicionantes
CREATE OR REPLACE VIEW public.calendar_due_items
WITH (security_invoker = true) AS
SELECT 'periodic_service'::text AS source_module, ps.id AS source_id, ps.name AS title, ps.next_due_at AS due_date, ps.company_id, '/servicos'::text AS deep_link, ps.supplier AS subtitle
  FROM periodic_services ps WHERE ps.next_due_at IS NOT NULL AND ps.status <> 'inactive'::text
UNION ALL
SELECT 'environmental_license'::text, el.id, COALESCE(el.title, el.license_number), el.expires_at, el.company_id, '/licencas'::text, el.license_number
  FROM environmental_licenses el WHERE el.has_expiry = true AND el.expires_at IS NOT NULL
UNION ALL
SELECT 'license_renewal'::text, lr.id, 'Renovação '::text || COALESCE(lr.license_number, ''::text), lr.expires_at, lr.company_id, '/licencas'::text, lr.license_number
  FROM license_renewals lr WHERE lr.expires_at IS NOT NULL
UNION ALL
SELECT 'mtr'::text, m.id, 'MTR '::text || m.mtr_number, m.cdf_deadline_at, m.company_id, '/mtr'::text, m.transporter
  FROM mtrs m WHERE m.cdf_deadline_at IS NOT NULL AND m.cdf_status <> 'received'::text
UNION ALL
SELECT 'inspection_execution'::text, ie.id, COALESCE(ie.reference, 'Inspeção'::text), ie.due_date, ie.company_id, '/inspecoes/'::text || ie.id::text, NULL::text
  FROM inspection_executions ie WHERE ie.due_date IS NOT NULL AND ie.status <> 'completed'::text
UNION ALL
SELECT 'document_review_cycle'::text, drc.id, COALESCE(drc.title, 'Ciclo de revisão'::text), drc.due_date, drc.company_id, '/revisoes'::text, NULL::text
  FROM document_review_cycles drc WHERE drc.due_date IS NOT NULL AND (drc.status <> ALL (ARRAY['completed'::text, 'cancelled'::text]))
UNION ALL
SELECT 'license_conditionant'::text, lc.id, 'Condicionante '::text || COALESCE(lc.item_code, ''::text) AS title, lc.due_date, lc.company_id, '/licencas/condicionantes'::text, left(lc.description, 80)
  FROM license_conditionants lc
  WHERE lc.due_date IS NOT NULL AND lc.status NOT IN ('fulfilled', 'not_applicable');