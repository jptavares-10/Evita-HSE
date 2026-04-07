-- 1. Recreate companies_safe WITHOUT security_invoker (runs as owner, bypasses RLS)
--    but WITH explicit company isolation via WHERE clause
DROP VIEW IF EXISTS public.companies_safe;

CREATE VIEW public.companies_safe AS
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
  subscription_cancel_at,
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
FROM public.companies
WHERE id = public.get_user_company_id();

-- 2. Replace the companies SELECT policy: admin-only
DROP POLICY IF EXISTS "Users can view own company" ON public.companies;

CREATE POLICY "Only admins can view own company"
ON public.companies
FOR SELECT
TO authenticated
USING (
  id = public.get_user_company_id()
  AND (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid()) = 'admin'
);