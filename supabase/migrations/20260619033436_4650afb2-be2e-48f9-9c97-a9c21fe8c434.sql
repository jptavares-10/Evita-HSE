
-- Auth-only RPCs: drop PUBLIC default, grant only to authenticated
REVOKE EXECUTE ON FUNCTION public.get_user_company_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_user_company_id() TO authenticated;

REVOKE EXECUTE ON FUNCTION public.get_user_permissions(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_user_permissions(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.set_user_permission(uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_user_permission(uuid, text, text) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.remove_member(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.remove_member(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.update_company_safe_fields(text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_company_safe_fields(text, text, text, text) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.get_company_access_status() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_company_access_status() TO authenticated;

REVOKE EXECUTE ON FUNCTION public.get_pending_invitation_for_current_user() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_pending_invitation_for_current_user() TO authenticated;

REVOKE EXECUTE ON FUNCTION public.accept_invitation_membership(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.accept_invitation_membership(uuid, text) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.create_company_and_admin(text, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_company_and_admin(text, text, text, text, text) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.has_pending_invitation(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_pending_invitation(uuid, text) TO authenticated;

-- Internal event-trigger helper: not callable from API
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;
