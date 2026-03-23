
ALTER TABLE public.service_history
  ADD COLUMN IF NOT EXISTS notes_edited_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS notes_edited_by uuid REFERENCES auth.users(id);

-- Allow UPDATE on service_history for editing notes
CREATE POLICY "Users can update own company history"
ON public.service_history
FOR UPDATE
TO authenticated
USING (company_id = get_user_company_id())
WITH CHECK (company_id = get_user_company_id());
