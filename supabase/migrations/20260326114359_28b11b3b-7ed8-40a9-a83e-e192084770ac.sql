-- Fix 1: Use column-level REVOKE to prevent role/company_id changes
REVOKE UPDATE (role, company_id) ON public.profiles FROM authenticated;

-- Fix 2: Restrict company creation - only users without a profile can create
-- (this is the registration flow only)
DROP POLICY IF EXISTS "Authenticated users can create companies" ON public.companies;
CREATE POLICY "Users without profile can create a company"
  ON public.companies FOR INSERT TO authenticated
  WITH CHECK (
    NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid())
  );