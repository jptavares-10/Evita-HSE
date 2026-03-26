-- Fix 1: Prevent role and company_id escalation on profiles
-- Drop the existing overly permissive update policy
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Create a restricted update policy that prevents changing role and company_id
-- Users can only update their own profile AND cannot change role or company_id
CREATE POLICY "Users can update own profile safe fields"
  ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
    AND company_id = (SELECT p.company_id FROM public.profiles p WHERE p.id = auth.uid())
  );

-- Fix 2: Restrict profile deletion to admins only
DROP POLICY IF EXISTS "Users can delete profiles in own company" ON public.profiles;

CREATE POLICY "Admins can delete profiles in own company"
  ON public.profiles FOR DELETE TO authenticated
  USING (
    company_id = get_user_company_id()
    AND id != auth.uid()
    AND (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid()) = 'admin'
  );

-- Fix 3: Fix anon invitation lookup by token
DROP POLICY IF EXISTS "Anon can read own invitation by token" ON public.invitations;