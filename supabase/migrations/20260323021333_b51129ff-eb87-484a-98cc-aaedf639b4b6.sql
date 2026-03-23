
-- Make the company insert policy more restrictive - still needs to allow signup
-- Drop and recreate with a note that this is intentional for signup
DROP POLICY "Allow insert for new companies" ON public.companies;
CREATE POLICY "Authenticated users can create companies"
  ON public.companies FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);
