
-- Drop the existing UPDATE policy
DROP POLICY IF EXISTS "Only admins can update own company" ON public.companies;

-- Recreate with billing field protection
CREATE POLICY "Only admins can update own company"
ON public.companies
FOR UPDATE
TO authenticated
USING (
  id = get_user_company_id()
  AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
)
WITH CHECK (
  id = get_user_company_id()
  AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  AND plan = (SELECT plan FROM companies WHERE id = get_user_company_id())
  AND max_users = (SELECT max_users FROM companies WHERE id = get_user_company_id())
  AND trial_ends_at IS NOT DISTINCT FROM (SELECT trial_ends_at FROM companies WHERE id = get_user_company_id())
  AND trial_started_at IS NOT DISTINCT FROM (SELECT trial_started_at FROM companies WHERE id = get_user_company_id())
);
