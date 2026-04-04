
DROP POLICY IF EXISTS "Allow profile creation for invited users" ON public.profiles;
CREATE POLICY "Allow profile creation for invited users"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    id = auth.uid()
    AND role = 'member'
    AND email = lower(TRIM(BOTH FROM COALESCE(auth.jwt() ->> 'email', '')))
    AND has_pending_invitation(company_id, lower(TRIM(BOTH FROM COALESCE(auth.jwt() ->> 'email', ''))))
  );
