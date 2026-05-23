
-- 1) Tighten INSERT policy on companies to lock billing/stripe fields
DROP POLICY IF EXISTS "Users without profile can create a company" ON public.companies;

CREATE POLICY "Users without profile can create a company"
ON public.companies
FOR INSERT
TO authenticated
WITH CHECK (
  NOT EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid())
  AND plan = 'trial'
  AND max_users = 2
  AND trial_ends_at <= (now() + interval '15 days')
  AND stripe_customer_id IS NULL
  AND stripe_subscription_id IS NULL
  AND stripe_price_id IS NULL
  AND plan_started_at IS NULL
  AND plan_expires_at IS NULL
  AND plan_billing IS NULL
  AND subscription_cancel_at IS NULL
  AND storage_gb = 5
);

-- 2) Revoke direct column-level SELECT on Stripe fields from authenticated users.
--    Access remains available exclusively via the companies_safe view (admin-only masking).
REVOKE SELECT (stripe_customer_id, stripe_subscription_id, stripe_price_id)
ON public.companies FROM authenticated;

-- 3) Recreate companies_safe as SECURITY DEFINER so it can still expose those columns
--    (after the column-level revoke) — masking logic restricts them to admins only.
DROP VIEW IF EXISTS public.companies_safe;

CREATE VIEW public.companies_safe
WITH (security_invoker = false) AS
SELECT
  c.id,
  c.name,
  c.cnpj,
  c.segment,
  c.logo_url,
  c.plan,
  c.trial_started_at,
  c.trial_ends_at,
  c.max_users,
  c.plan_billing,
  c.plan_started_at,
  c.plan_expires_at,
  c.storage_gb,
  c.created_at,
  c.subscription_cancel_at,
  CASE WHEN (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid()) = 'admin'
       THEN c.stripe_customer_id ELSE NULL END AS stripe_customer_id,
  CASE WHEN (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid()) = 'admin'
       THEN c.stripe_subscription_id ELSE NULL END AS stripe_subscription_id,
  CASE WHEN (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid()) = 'admin'
       THEN c.stripe_price_id ELSE NULL END AS stripe_price_id
FROM public.companies c
WHERE c.id = public.get_user_company_id();

GRANT SELECT ON public.companies_safe TO authenticated;
