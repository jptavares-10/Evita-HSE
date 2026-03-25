-- 1. Revoke UPDATE on billing columns from authenticated role
REVOKE UPDATE (plan, max_users, trial_ends_at, trial_started_at) ON public.companies FROM authenticated;

-- 2. Remove anon storage policies on sensitive buckets
DROP POLICY IF EXISTS "Public can view occurrence files" ON storage.objects;
DROP POLICY IF EXISTS "Public can view service attachments" ON storage.objects;

-- 3. Update sensitive buckets to private
UPDATE storage.buckets SET public = false WHERE id IN (
  'occurrence-files', 'mtr-files', 'training-certificates', 'supplier-documents', 'service-attachments'
);