
-- 1. occurrence_causes
CREATE TABLE public.occurrence_causes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  occurrence_id uuid NOT NULL REFERENCES public.occurrences(id) ON DELETE CASCADE,
  company_id uuid NOT NULL,
  cause_type text NOT NULL CHECK (cause_type IN ('immediate','basic','root')),
  category_6m text CHECK (category_6m IN ('man','machine','method','material','environment','measurement')),
  description text NOT NULL,
  source_method text CHECK (source_method IN ('5whys','ishikawa','bowtie','manual')),
  parent_cause_id uuid REFERENCES public.occurrence_causes(id) ON DELETE CASCADE,
  order_index int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.occurrence_causes TO authenticated;
GRANT ALL ON public.occurrence_causes TO service_role;
ALTER TABLE public.occurrence_causes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own company occurrence causes" ON public.occurrence_causes FOR SELECT USING (company_id = get_user_company_id());
CREATE POLICY "mod_editor_insert_occurrence_causes" ON public.occurrence_causes FOR INSERT WITH CHECK (company_id = get_user_company_id() AND has_module_editor_permission('ic_nc'));
CREATE POLICY "mod_editor_update_occurrence_causes" ON public.occurrence_causes FOR UPDATE USING (company_id = get_user_company_id() AND has_module_editor_permission('ic_nc')) WITH CHECK (company_id = get_user_company_id() AND has_module_editor_permission('ic_nc'));
CREATE POLICY "mod_editor_delete_occurrence_causes" ON public.occurrence_causes FOR DELETE USING (company_id = get_user_company_id() AND has_module_editor_permission('ic_nc'));
CREATE INDEX idx_occurrence_causes_occ ON public.occurrence_causes(occurrence_id);

-- 2. occurrence_bowtie
CREATE TABLE public.occurrence_bowtie (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  occurrence_id uuid NOT NULL REFERENCES public.occurrences(id) ON DELETE CASCADE,
  company_id uuid NOT NULL,
  hazard text,
  node_type text NOT NULL CHECK (node_type IN ('threat','consequence','preventive_barrier','mitigating_barrier')),
  description text NOT NULL,
  linked_to uuid REFERENCES public.occurrence_bowtie(id) ON DELETE CASCADE,
  order_index int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.occurrence_bowtie TO authenticated;
GRANT ALL ON public.occurrence_bowtie TO service_role;
ALTER TABLE public.occurrence_bowtie ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own company bowtie" ON public.occurrence_bowtie FOR SELECT USING (company_id = get_user_company_id());
CREATE POLICY "mod_editor_insert_bowtie" ON public.occurrence_bowtie FOR INSERT WITH CHECK (company_id = get_user_company_id() AND has_module_editor_permission('ic_nc'));
CREATE POLICY "mod_editor_update_bowtie" ON public.occurrence_bowtie FOR UPDATE USING (company_id = get_user_company_id() AND has_module_editor_permission('ic_nc')) WITH CHECK (company_id = get_user_company_id() AND has_module_editor_permission('ic_nc'));
CREATE POLICY "mod_editor_delete_bowtie" ON public.occurrence_bowtie FOR DELETE USING (company_id = get_user_company_id() AND has_module_editor_permission('ic_nc'));
CREATE INDEX idx_bowtie_occ ON public.occurrence_bowtie(occurrence_id);

-- 3. occurrence_witnesses
CREATE TABLE public.occurrence_witnesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  occurrence_id uuid NOT NULL REFERENCES public.occurrences(id) ON DELETE CASCADE,
  company_id uuid NOT NULL,
  employee_id uuid REFERENCES public.employees(id) ON DELETE SET NULL,
  witness_name text NOT NULL,
  statement text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.occurrence_witnesses TO authenticated;
GRANT ALL ON public.occurrence_witnesses TO service_role;
ALTER TABLE public.occurrence_witnesses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own company witnesses" ON public.occurrence_witnesses FOR SELECT USING (company_id = get_user_company_id());
CREATE POLICY "mod_editor_insert_witnesses" ON public.occurrence_witnesses FOR INSERT WITH CHECK (company_id = get_user_company_id() AND has_module_editor_permission('ic_nc'));
CREATE POLICY "mod_editor_update_witnesses" ON public.occurrence_witnesses FOR UPDATE USING (company_id = get_user_company_id() AND has_module_editor_permission('ic_nc')) WITH CHECK (company_id = get_user_company_id() AND has_module_editor_permission('ic_nc'));
CREATE POLICY "mod_editor_delete_witnesses" ON public.occurrence_witnesses FOR DELETE USING (company_id = get_user_company_id() AND has_module_editor_permission('ic_nc'));
CREATE INDEX idx_witnesses_occ ON public.occurrence_witnesses(occurrence_id);

-- 4. Extend corrective_actions with 5W2H
ALTER TABLE public.corrective_actions
  ADD COLUMN cause_id uuid REFERENCES public.occurrence_causes(id) ON DELETE SET NULL,
  ADD COLUMN why text,
  ADD COLUMN where_location text,
  ADD COLUMN due_date date,
  ADD COLUMN responsible_profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN responsible_employee_id uuid REFERENCES public.employees(id) ON DELETE SET NULL,
  ADD COLUMN how_method text,
  ADD COLUMN cost_estimated numeric(12,2),
  ADD COLUMN control_hierarchy text CHECK (control_hierarchy IS NULL OR control_hierarchy IN ('elimination','substitution','engineering','administrative','ppe')),
  ADD COLUMN effectiveness_check_date date,
  ADD COLUMN effectiveness_result text CHECK (effectiveness_result IS NULL OR effectiveness_result IN ('effective','ineffective','reopened'));

-- 5. Extend occurrences
ALTER TABLE public.occurrences
  ADD COLUMN investigation_method text CHECK (investigation_method IS NULL OR investigation_method IN ('five_whys','ishikawa','bowtie')),
  ADD COLUMN cat_required boolean NOT NULL DEFAULT false,
  ADD COLUMN cat_number text,
  ADD COLUMN cat_issued_at date,
  ADD COLUMN cost_estimated numeric(12,2),
  ADD COLUMN published_as_lesson boolean NOT NULL DEFAULT false,
  ADD COLUMN lesson_title text,
  ADD COLUMN lesson_summary text,
  ADD COLUMN lesson_tags text[];

-- 6. Trigger to auto-flag CAT requirement
CREATE OR REPLACE FUNCTION public.set_occurrence_cat_required()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.type = 'incident' AND (COALESCE(NEW.lost_days, 0) > 0 OR NEW.severity = 'critical') THEN
    NEW.cat_required := true;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_cat_required ON public.occurrences;
CREATE TRIGGER trg_set_cat_required
BEFORE INSERT OR UPDATE OF type, severity, lost_days ON public.occurrences
FOR EACH ROW EXECUTE FUNCTION public.set_occurrence_cat_required();
