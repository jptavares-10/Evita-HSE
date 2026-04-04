
-- Fix 1: Restrict invitations SELECT to admin-only (hides tokens from non-admin members)
DROP POLICY IF EXISTS "Users can view invitations in own company" ON public.invitations;
CREATE POLICY "Only admins can view invitations"
  ON public.invitations
  FOR SELECT
  TO authenticated
  USING (
    company_id = get_user_company_id()
    AND (SELECT p.role FROM profiles p WHERE p.id = auth.uid()) = 'admin'
  );

-- Fix 2: Enforce role='member' on the permissive INSERT policy for invited users
DROP POLICY IF EXISTS "Allow profile creation for invited users" ON public.profiles;
CREATE POLICY "Allow profile creation for invited users"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    id = auth.uid()
    AND role = 'member'
    AND email = lower(TRIM(BOTH FROM COALESCE(auth.jwt() ->> 'email', '')))
    AND (
      has_pending_invitation(company_id, lower(TRIM(BOTH FROM COALESCE(auth.jwt() ->> 'email', ''))))
      OR NOT EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid())
    )
  );
