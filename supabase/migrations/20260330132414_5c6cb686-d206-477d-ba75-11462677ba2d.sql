
-- Restrict companies UPDATE policy to admin-only
DROP POLICY IF EXISTS "Users can update own company safe fields only" ON public.companies;

CREATE POLICY "Only admins can update own company"
ON public.companies
FOR UPDATE
TO authenticated
USING (
  id = get_user_company_id()
  AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
)
WITH CHECK (
  id = get_user_company_id()
  AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);
