
-- 1. Enable RLS on companies_safe view
ALTER VIEW public.companies_safe SET (security_invoker = true);

-- The view already has security_invoker = true, which means it inherits
-- the RLS policies from the underlying 'companies' table.
-- But we need to make sure the view respects RLS by enabling it explicitly.
-- Views with security_invoker=true already use the caller's permissions,
-- so the companies RLS policy "Users can view own company" applies.

-- 2. Fix profiles INSERT policy to validate email matches authenticated user
-- First drop the existing INSERT policy
DROP POLICY IF EXISTS "Users can create own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow profile creation for invited users" ON public.profiles;

-- Recreate with email validation from auth session
CREATE POLICY "Allow profile creation for invited users"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (
  id = auth.uid()
  AND email = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
  AND (
    has_pending_invitation(company_id, lower(trim(coalesce(auth.jwt() ->> 'email', ''))))
    OR NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid())
  )
);
