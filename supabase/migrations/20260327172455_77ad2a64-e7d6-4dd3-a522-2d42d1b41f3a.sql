
-- MELHORIA 1: has_expiry + nullable validity_months
ALTER TABLE public.trainings
  ADD COLUMN IF NOT EXISTS has_expiry boolean NOT NULL DEFAULT true;

ALTER TABLE public.trainings
  ALTER COLUMN validity_months DROP NOT NULL;

-- MELHORIA 2: sectors table
CREATE TABLE IF NOT EXISTS public.sectors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.sectors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company sectors" ON public.sectors
  FOR SELECT TO authenticated USING (company_id = get_user_company_id());
CREATE POLICY "Users can insert own company sectors" ON public.sectors
  FOR INSERT TO authenticated WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can update own company sectors" ON public.sectors
  FOR UPDATE TO authenticated USING (company_id = get_user_company_id()) WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can delete own company sectors" ON public.sectors
  FOR DELETE TO authenticated USING (company_id = get_user_company_id());

-- Add sector_id to employees (keep old sector column for now)
ALTER TABLE public.employees
  ADD COLUMN IF NOT EXISTS sector_id uuid REFERENCES public.sectors(id) ON DELETE SET NULL;

-- Add sector_id to job_positions
ALTER TABLE public.job_positions
  ADD COLUMN IF NOT EXISTS sector_id uuid REFERENCES public.sectors(id) ON DELETE SET NULL;

-- MELHORIA 3: training_sector_rules
CREATE TABLE IF NOT EXISTS public.training_sector_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  training_id uuid NOT NULL REFERENCES public.trainings(id) ON DELETE CASCADE,
  sector_id uuid NOT NULL REFERENCES public.sectors(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (training_id, sector_id)
);

ALTER TABLE public.training_sector_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company training sector rules" ON public.training_sector_rules
  FOR SELECT TO authenticated USING (company_id = get_user_company_id());
CREATE POLICY "Users can insert own company training sector rules" ON public.training_sector_rules
  FOR INSERT TO authenticated WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can update own company training sector rules" ON public.training_sector_rules
  FOR UPDATE TO authenticated USING (company_id = get_user_company_id()) WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can delete own company training sector rules" ON public.training_sector_rules
  FOR DELETE TO authenticated USING (company_id = get_user_company_id());
