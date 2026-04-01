
CREATE OR REPLACE FUNCTION public.validate_invitation_token(p_token uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_invitation record;
BEGIN
  SELECT * INTO v_invitation
  FROM invitations
  WHERE token = p_token AND status = 'pending';

  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'error', 'not_found');
  END IF;

  IF v_invitation.expires_at < now() THEN
    RETURN jsonb_build_object('valid', false, 'error', 'expired');
  END IF;

  RETURN jsonb_build_object(
    'valid', true,
    'id', v_invitation.id,
    'email', v_invitation.email,
    'company_id', v_invitation.company_id
  );
END;
$$;
