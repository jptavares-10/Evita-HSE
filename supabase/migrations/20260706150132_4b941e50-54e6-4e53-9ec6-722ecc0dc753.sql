
-- Fase 1: estrutura de campo (ativos + QR, checklist estruturado, assinatura no fechamento)

-- 1) Ativos inspecionáveis
CREATE TABLE public.inspection_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  tag_code text NOT NULL,
  name text NOT NULL,
  asset_type text NOT NULL DEFAULT 'other',
  sector_id uuid REFERENCES public.sectors(id) ON DELETE SET NULL,
  location_description text,
  qr_token uuid NOT NULL DEFAULT gen_random_uuid(),
  status text NOT NULL DEFAULT 'active',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX inspection_assets_company_tag_uk ON public.inspection_assets(company_id, tag_code);
CREATE UNIQUE INDEX inspection_assets_qr_token_uk ON public.inspection_assets(qr_token);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inspection_assets TO authenticated;
GRANT ALL ON public.inspection_assets TO service_role;
ALTER TABLE public.inspection_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "assets_company_all" ON public.inspection_assets FOR ALL
  USING (company_id = public.get_user_company_id())
  WITH CHECK (company_id = public.get_user_company_id());
CREATE TRIGGER inspection_assets_updated BEFORE UPDATE ON public.inspection_assets
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 2) Itens do checklist (por modelo)
CREATE TABLE public.inspection_checklist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  model_id uuid NOT NULL REFERENCES public.inspection_models(id) ON DELETE CASCADE,
  position int NOT NULL DEFAULT 0,
  question text NOT NULL,
  response_type text NOT NULL DEFAULT 'yes_no_na',
  is_critical boolean NOT NULL DEFAULT false,
  photo_required boolean NOT NULL DEFAULT false,
  reference text,
  expected_answer text,
  help_text text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX inspection_checklist_items_model_idx ON public.inspection_checklist_items(model_id, position);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inspection_checklist_items TO authenticated;
GRANT ALL ON public.inspection_checklist_items TO service_role;
ALTER TABLE public.inspection_checklist_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "checklist_items_company_all" ON public.inspection_checklist_items FOR ALL
  USING (company_id = public.get_user_company_id())
  WITH CHECK (company_id = public.get_user_company_id());
CREATE TRIGGER inspection_checklist_items_updated BEFORE UPDATE ON public.inspection_checklist_items
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 3) Respostas por item, por execução
CREATE TABLE public.inspection_execution_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  execution_id uuid NOT NULL REFERENCES public.inspection_executions(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES public.inspection_checklist_items(id) ON DELETE CASCADE,
  answer_value text,
  is_conformant boolean,
  note text,
  photo_urls text[] NOT NULL DEFAULT '{}',
  location_lat numeric,
  location_lng numeric,
  location_accuracy numeric,
  answered_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  answered_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX inspection_answer_exec_item_uk ON public.inspection_execution_answers(execution_id, item_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inspection_execution_answers TO authenticated;
GRANT ALL ON public.inspection_execution_answers TO service_role;
ALTER TABLE public.inspection_execution_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "answers_company_all" ON public.inspection_execution_answers FOR ALL
  USING (company_id = public.get_user_company_id())
  WITH CHECK (company_id = public.get_user_company_id());
CREATE TRIGGER inspection_answers_updated BEFORE UPDATE ON public.inspection_execution_answers
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 4) Colunas de fechamento com assinatura e georreferência em executions
ALTER TABLE public.inspection_executions
  ADD COLUMN asset_id uuid REFERENCES public.inspection_assets(id) ON DELETE SET NULL,
  ADD COLUMN started_at timestamptz,
  ADD COLUMN signature_url text,
  ADD COLUMN signer_name text,
  ADD COLUMN signer_role text,
  ADD COLUMN signed_at timestamptz,
  ADD COLUMN signed_location_lat numeric,
  ADD COLUMN signed_location_lng numeric,
  ADD COLUMN signed_user_agent text;

-- 5) Vínculo opcional de ação corretiva ao item que a originou
ALTER TABLE public.inspection_corrective_actions
  ADD COLUMN answer_id uuid REFERENCES public.inspection_execution_answers(id) ON DELETE SET NULL;
