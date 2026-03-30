
-- 1. Fix profiles INSERT policy to restrict company_id to a valid pending invitation
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT TO authenticated
WITH CHECK (
  id = auth.uid()
  AND role = 'member'
  AND EXISTS (
    SELECT 1 FROM public.invitations i
    WHERE i.company_id = profiles.company_id
      AND i.email = profiles.email
      AND i.status = 'pending'
      AND i.expires_at > now()
  )
);

-- 2. Add UPDATE storage policy for service-attachments bucket
CREATE POLICY "Authenticated users can update service attachments"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'service-attachments' AND (storage.foldername(name))[1] = get_user_company_id()::text)
WITH CHECK (bucket_id = 'service-attachments' AND (storage.foldername(name))[1] = get_user_company_id()::text);
