
-- 1) Fix Security Definer View: set security_invoker on companies_safe
ALTER VIEW public.companies_safe SET (security_invoker = true);

-- 2) Lock down SECURITY DEFINER functions: revoke broad EXECUTE, then grant only where needed.

-- Stripe webhook RPCs (called only by edge functions via service_role)
REVOKE EXECUTE ON FUNCTION public.activate_plan_from_stripe(text, text, text, text, text, uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.cancel_plan_from_stripe(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.renew_plan_from_stripe(text, text) FROM PUBLIC, anon, authenticated;

-- Trigger / internal helpers (must not be callable from the API)
REVOKE EXECUTE ON FUNCTION public.check_user_limit() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_company_aso_types() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_company_categories() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.seed_viewer_permissions() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.seed_default_aso_exam_types(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.seed_default_categories(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.seed_default_document_types(uuid) FROM PUBLIC, anon, authenticated;

-- Auth-only RPCs (revoke anon; authenticated keeps access via in-function checks)
REVOKE EXECUTE ON FUNCTION public.get_user_company_id() FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_user_permissions(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.set_user_permission(uuid, text, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.remove_member(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.update_company_safe_fields(text, text, text, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_company_access_status() FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_pending_invitation_for_current_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.accept_invitation_membership(uuid, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.create_company_and_admin(text, text, text, text, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_pending_invitation(uuid, text) FROM anon, authenticated;

-- Note: validate_invitation_token, get_supplier_portal_data, upload_supplier_document,
-- create_supplier_folder_portal intentionally remain callable by anon — the supplier portal
-- and invitation acceptance flow rely on anonymous token-based access. The functions
-- enforce their own token + status checks internally.

-- 3) Public bucket listing: remove broad SELECT on storage.objects for public buckets.
-- The buckets remain public for direct URL access; listing the contents now requires
-- an authenticated user from the same company / owner of the folder.
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view company logos" ON storage.objects;

CREATE POLICY "Authenticated users can list own avatar"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = (auth.uid())::text
  );

CREATE POLICY "Authenticated users can list own company logos"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'company-logos'
    AND (storage.foldername(name))[1] = (public.get_user_company_id())::text
  );
