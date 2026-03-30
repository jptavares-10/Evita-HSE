
-- Recreate suppliers_safe view with security_invoker = true
-- This makes it inherit the RLS policies from the underlying suppliers table
CREATE OR REPLACE VIEW public.suppliers_safe
WITH (security_invoker = true)
AS
SELECT 
  id,
  company_id,
  name,
  category_id,
  contact_name,
  contact_phone,
  contact_email,
  status,
  notes,
  created_by,
  portal_enabled,
  created_at,
  CASE
    WHEN EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    ) THEN portal_token
    ELSE NULL::uuid
  END AS portal_token
FROM suppliers;
