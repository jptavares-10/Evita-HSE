-- 1. Fix companies_safe: restore security_invoker=true
DROP VIEW IF EXISTS public.companies_safe;

CREATE VIEW public.companies_safe
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
FROM public.companies;

-- 2. Restore companies SELECT for all members (view masks sensitive fields)
DROP POLICY IF EXISTS "Only admins can view own company" ON public.companies;

CREATE POLICY "Users can view own company"
ON public.companies
FOR SELECT
TO authenticated
USING (id = public.get_user_company_id());

-- 3. Add explicit deny policies on payment_intents (false = always deny)
CREATE POLICY "Deny client insert on payment_intents"
ON public.payment_intents
FOR INSERT
TO authenticated
WITH CHECK (false);

CREATE POLICY "Deny client update on payment_intents"
ON public.payment_intents
FOR UPDATE
TO authenticated
USING (false)
WITH CHECK (false);

CREATE POLICY "Deny client delete on payment_intents"
ON public.payment_intents
FOR DELETE
TO authenticated
USING (false);