-- Remove write policies on company-logos bucket since logo upload UI is being removed.
-- Keep SELECT policy so existing logos remain viewable to company members.
DROP POLICY IF EXISTS "Company admins can upload logo" ON storage.objects;
DROP POLICY IF EXISTS "Company admins can update logo" ON storage.objects;
DROP POLICY IF EXISTS "Company admins can delete logo" ON storage.objects;
DROP POLICY IF EXISTS "Company members can upload logo" ON storage.objects;
DROP POLICY IF EXISTS "Company members can update logo" ON storage.objects;
DROP POLICY IF EXISTS "Company members can delete logo" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own company logo" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own company logo" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own company logo" ON storage.objects;
DROP POLICY IF EXISTS "Company users can upload logos" ON storage.objects;
DROP POLICY IF EXISTS "Company users can update logos" ON storage.objects;
DROP POLICY IF EXISTS "Company users can delete logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload company logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update company logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete company logos" ON storage.objects;