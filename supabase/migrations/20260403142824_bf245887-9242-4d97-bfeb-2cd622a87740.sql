
-- 1. Remove INSERT policy on plan_change_history (prevent non-admin forgery)
DROP POLICY IF EXISTS "Users can insert own company plan history" ON public.plan_change_history;

-- 2. Remove UPDATE/DELETE policies too (only server-side should manage this)
DROP POLICY IF EXISTS "Users can update own company plan history" ON public.plan_change_history;
DROP POLICY IF EXISTS "Users can delete own company plan history" ON public.plan_change_history;

-- 3. Create secure view for companies that masks Stripe fields for non-admins
CREATE OR REPLACE VIEW public.companies_safe
WITH (security_invoker = true)
AS
SELECT
  id,
  name,
  cnpj,
  segment,
  logo_url,
  plan,
  trial_started_at,
  trial_ends_at,
  max_users,
  plan_billing,
  plan_started_at,
  plan_expires_at,
  storage_gb,
  created_at,
  CASE
    WHEN (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    THEN stripe_customer_id
    ELSE NULL
  END AS stripe_customer_id,
  CASE
    WHEN (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    THEN stripe_subscription_id
    ELSE NULL
  END AS stripe_subscription_id,
  CASE
    WHEN (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    THEN stripe_price_id
    ELSE NULL
  END AS stripe_price_id
FROM public.companies;
