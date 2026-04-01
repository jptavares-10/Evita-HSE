
-- Drop existing permissive write policies on invitations
DROP POLICY IF EXISTS "Users can create invitations in own company" ON invitations;
DROP POLICY IF EXISTS "Users can update invitations in own company" ON invitations;
DROP POLICY IF EXISTS "Users can delete invitations in own company" ON invitations;

-- Recreate with admin role check
CREATE POLICY "Only admins can create invitations"
ON invitations FOR INSERT
TO authenticated
WITH CHECK (
  company_id = get_user_company_id()
  AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Only admins can update invitations"
ON invitations FOR UPDATE
TO authenticated
USING (
  company_id = get_user_company_id()
  AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
)
WITH CHECK (
  company_id = get_user_company_id()
  AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Only admins can delete invitations"
ON invitations FOR DELETE
TO authenticated
USING (
  company_id = get_user_company_id()
  AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);
