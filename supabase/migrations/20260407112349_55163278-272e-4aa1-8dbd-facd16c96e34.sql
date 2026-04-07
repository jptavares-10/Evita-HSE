DROP VIEW IF EXISTS public.companies_safe;
CREATE VIEW public.companies_safe WITH (security_invoker = true) AS
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
    WHEN (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin' THEN stripe_customer_id
    ELSE NULL
  END AS stripe_customer_id,
  CASE
    WHEN (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin' THEN stripe_subscription_id
    ELSE NULL
  END AS stripe_subscription_id,
  CASE
    WHEN (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin' THEN stripe_price_id
    ELSE NULL
  END AS stripe_price_id
FROM companies;