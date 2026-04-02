
-- 0. DROP constraint first (allows any value temporarily)
ALTER TABLE public.companies DROP CONSTRAINT IF EXISTS companies_plan_check;

-- 1. Migrate data (some may already be migrated from partial runs)
UPDATE public.companies SET plan = 'starter', max_users = 5 WHERE plan = 'basic';
UPDATE public.companies SET plan = 'professional', max_users = 10 WHERE plan = 'pro';

-- 2. Re-add constraint with new values
ALTER TABLE public.companies ADD CONSTRAINT companies_plan_check CHECK (plan = ANY (ARRAY['trial','starter','professional','enterprise','expired']));

-- 3. Add new columns
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS plan_billing text,
  ADD COLUMN IF NOT EXISTS plan_started_at timestamptz,
  ADD COLUMN IF NOT EXISTS plan_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS storage_gb integer NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
  ADD COLUMN IF NOT EXISTS stripe_price_id text;

-- Set migrated data
UPDATE public.companies SET storage_gb = 5, plan_expires_at = now() + interval '30 days' WHERE plan = 'starter' AND plan_expires_at IS NULL;
UPDATE public.companies SET storage_gb = 20, plan_expires_at = now() + interval '30 days' WHERE plan = 'professional' AND plan_expires_at IS NULL;
UPDATE public.companies SET plan = 'expired' WHERE plan = 'trial' AND trial_ends_at < now();

-- 4. plan_definitions
CREATE TABLE IF NOT EXISTS public.plan_definitions (
  plan_key text PRIMARY KEY,
  name text NOT NULL,
  price_monthly numeric NOT NULL DEFAULT 0,
  price_annual numeric NOT NULL DEFAULT 0,
  max_users integer NOT NULL DEFAULT 2,
  storage_gb integer NOT NULL DEFAULT 5,
  modules text[] NOT NULL DEFAULT '{}'
);
ALTER TABLE public.plan_definitions ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'plan_definitions' AND policyname = 'Anyone can read plan definitions') THEN
    CREATE POLICY "Anyone can read plan definitions" ON public.plan_definitions FOR SELECT TO authenticated USING (true);
  END IF;
END $$;
INSERT INTO public.plan_definitions (plan_key, name, price_monthly, price_annual, max_users, storage_gb, modules) VALUES
  ('trial', 'Trial', 0, 0, 2, 5, '{periodic_services,trainings,ic_nc,aso,mtr,environmental_licenses,suppliers,document_library,inspections,user_permissions,epi}'),
  ('starter', 'Starter', 97, 970, 5, 5, '{periodic_services,trainings,ic_nc,aso}'),
  ('professional', 'Professional', 247, 2470, 10, 20, '{periodic_services,trainings,ic_nc,aso,mtr,environmental_licenses,suppliers,document_library,inspections,user_permissions,epi}'),
  ('enterprise', 'Enterprise', 497, 4970, 999, 100, '{periodic_services,trainings,ic_nc,aso,mtr,environmental_licenses,suppliers,document_library,inspections,user_permissions,epi}')
ON CONFLICT (plan_key) DO NOTHING;

-- 5. plan_change_history
CREATE TABLE IF NOT EXISTS public.plan_change_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  from_plan text NOT NULL,
  to_plan text NOT NULL,
  billing_type text,
  changed_at timestamptz NOT NULL DEFAULT now(),
  changed_by uuid REFERENCES public.profiles(id),
  reason text
);
ALTER TABLE public.plan_change_history ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'plan_change_history' AND policyname = 'Users can view own company plan history') THEN
    CREATE POLICY "Users can view own company plan history" ON public.plan_change_history FOR SELECT TO authenticated USING (company_id = get_user_company_id());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'plan_change_history' AND policyname = 'Users can insert own company plan history') THEN
    CREATE POLICY "Users can insert own company plan history" ON public.plan_change_history FOR INSERT TO authenticated WITH CHECK (company_id = get_user_company_id());
  END IF;
END $$;

-- 6. payment_intents
CREATE TABLE IF NOT EXISTS public.payment_intents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  stripe_payment_intent_id text,
  amount numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'BRL',
  status text NOT NULL DEFAULT 'pending',
  plan_key text NOT NULL,
  billing_type text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.payment_intents ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payment_intents' AND policyname = 'Users can view own company payment intents') THEN
    CREATE POLICY "Users can view own company payment intents" ON public.payment_intents FOR SELECT TO authenticated USING (company_id = get_user_company_id());
  END IF;
END $$;

-- 7. RPC
CREATE OR REPLACE FUNCTION public.get_company_access_status()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_company record;
  v_plan_def record;
  v_status text;
  v_days_remaining integer;
  v_modules text[];
BEGIN
  SELECT c.* INTO v_company
  FROM companies c
  JOIN profiles p ON p.company_id = c.id
  WHERE p.id = auth.uid();

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'not_found');
  END IF;

  SELECT * INTO v_plan_def FROM plan_definitions WHERE plan_key = v_company.plan;

  IF v_company.plan = 'trial' THEN
    IF v_company.trial_ends_at >= now() THEN
      v_status := 'trial';
      v_days_remaining := GREATEST(0, (v_company.trial_ends_at::date - CURRENT_DATE));
      SELECT modules INTO v_modules FROM plan_definitions WHERE plan_key = 'trial';
    ELSE
      v_status := 'expired';
      v_days_remaining := 0;
      v_modules := '{}';
    END IF;
  ELSIF v_company.plan IN ('starter', 'professional', 'enterprise') THEN
    IF v_company.plan_expires_at IS NULL OR v_company.plan_expires_at >= now() THEN
      v_status := 'active';
      v_days_remaining := CASE
        WHEN v_company.plan_expires_at IS NOT NULL THEN GREATEST(0, (v_company.plan_expires_at::date - CURRENT_DATE))
        ELSE 999
      END;
      v_modules := COALESCE(v_plan_def.modules, '{}');
    ELSIF v_company.plan_expires_at >= (now() - interval '7 days') THEN
      v_status := 'grace';
      v_days_remaining := GREATEST(0, 7 - (CURRENT_DATE - v_company.plan_expires_at::date));
      v_modules := COALESCE(v_plan_def.modules, '{}');
    ELSE
      v_status := 'expired';
      v_days_remaining := 0;
      v_modules := '{}';
    END IF;
  ELSE
    v_status := 'expired';
    v_days_remaining := 0;
    v_modules := '{}';
  END IF;

  RETURN jsonb_build_object(
    'plan', v_company.plan,
    'billing', v_company.plan_billing,
    'status', v_status,
    'modules_included', v_modules,
    'days_remaining', v_days_remaining,
    'max_users', v_company.max_users,
    'storage_gb', v_company.storage_gb
  );
END;
$$;

-- 8. Update RLS
DROP POLICY IF EXISTS "Only admins can update own company" ON public.companies;
CREATE POLICY "Only admins can update own company"
  ON public.companies FOR UPDATE TO authenticated
  USING (
    (id = get_user_company_id())
    AND (( SELECT profiles.role FROM profiles WHERE profiles.id = auth.uid()) = 'admin'::text)
  )
  WITH CHECK (
    (id = get_user_company_id())
    AND (( SELECT profiles.role FROM profiles WHERE profiles.id = auth.uid()) = 'admin'::text)
    AND (plan = ( SELECT c.plan FROM companies c WHERE c.id = get_user_company_id()))
    AND (max_users = ( SELECT c.max_users FROM companies c WHERE c.id = get_user_company_id()))
    AND (NOT (trial_ends_at IS DISTINCT FROM ( SELECT c.trial_ends_at FROM companies c WHERE c.id = get_user_company_id())))
    AND (NOT (trial_started_at IS DISTINCT FROM ( SELECT c.trial_started_at FROM companies c WHERE c.id = get_user_company_id())))
    AND (storage_gb = ( SELECT c.storage_gb FROM companies c WHERE c.id = get_user_company_id()))
    AND (NOT (plan_billing IS DISTINCT FROM ( SELECT c.plan_billing FROM companies c WHERE c.id = get_user_company_id())))
    AND (NOT (plan_started_at IS DISTINCT FROM ( SELECT c.plan_started_at FROM companies c WHERE c.id = get_user_company_id())))
    AND (NOT (plan_expires_at IS DISTINCT FROM ( SELECT c.plan_expires_at FROM companies c WHERE c.id = get_user_company_id())))
    AND (NOT (stripe_customer_id IS DISTINCT FROM ( SELECT c.stripe_customer_id FROM companies c WHERE c.id = get_user_company_id())))
    AND (NOT (stripe_subscription_id IS DISTINCT FROM ( SELECT c.stripe_subscription_id FROM companies c WHERE c.id = get_user_company_id())))
    AND (NOT (stripe_price_id IS DISTINCT FROM ( SELECT c.stripe_price_id FROM companies c WHERE c.id = get_user_company_id())))
  );
