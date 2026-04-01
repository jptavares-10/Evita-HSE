CREATE OR REPLACE FUNCTION public.has_pending_invitation(p_company_id uuid, p_email text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.invitations i
    WHERE i.company_id = p_company_id
      AND lower(i.email) = lower(trim(p_email))
      AND i.status = 'pending'
      AND i.expires_at > now()
  );
$$;

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (
  id = auth.uid()
  AND role = 'member'
  AND public.has_pending_invitation(company_id, email)
);

CREATE OR REPLACE FUNCTION public.get_pending_invitation_for_current_user()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text;
  v_invitation record;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('found', false, 'error', 'not_authenticated');
  END IF;

  v_email := lower(trim(coalesce(auth.jwt() ->> 'email', '')));
  IF v_email = '' THEN
    RETURN jsonb_build_object('found', false, 'error', 'missing_email');
  END IF;

  SELECT i.id, i.token, i.company_id, i.email, i.expires_at
    INTO v_invitation
  FROM public.invitations i
  WHERE lower(i.email) = v_email
    AND i.status = 'pending'
    AND i.expires_at > now()
  ORDER BY i.created_at DESC
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('found', false);
  END IF;

  RETURN jsonb_build_object(
    'found', true,
    'id', v_invitation.id,
    'token', v_invitation.token,
    'company_id', v_invitation.company_id,
    'email', v_invitation.email,
    'expires_at', v_invitation.expires_at
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.accept_invitation_membership(p_token uuid, p_full_name text DEFAULT NULL::text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_email text;
  v_invitation record;
  v_existing_profile record;
  v_full_name text;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'not_authenticated');
  END IF;

  IF p_token IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'invalid_token');
  END IF;

  v_email := lower(trim(coalesce(auth.jwt() ->> 'email', '')));
  IF v_email = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'missing_email');
  END IF;

  SELECT *
    INTO v_invitation
  FROM public.invitations
  WHERE token = p_token
    AND status = 'pending';

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'invitation_not_found');
  END IF;

  IF v_invitation.expires_at <= now() THEN
    RETURN jsonb_build_object('success', false, 'error', 'invitation_expired');
  END IF;

  IF lower(v_invitation.email) <> v_email THEN
    RETURN jsonb_build_object('success', false, 'error', 'email_mismatch');
  END IF;

  SELECT p.id, p.company_id, p.email, p.role
    INTO v_existing_profile
  FROM public.profiles p
  WHERE p.id = v_user_id;

  IF FOUND THEN
    IF v_existing_profile.company_id = v_invitation.company_id THEN
      UPDATE public.profiles
      SET full_name = COALESCE(NULLIF(trim(p_full_name), ''), full_name),
          email = v_email
      WHERE id = v_user_id;

      UPDATE public.invitations
      SET status = 'accepted'
      WHERE id = v_invitation.id;

      RETURN jsonb_build_object(
        'success', true,
        'company_id', v_invitation.company_id,
        'already_joined', true
      );
    END IF;

    RETURN jsonb_build_object('success', false, 'error', 'account_already_linked_other_company');
  END IF;

  v_full_name := NULLIF(trim(coalesce(p_full_name, '')), '');
  IF v_full_name IS NULL THEN
    v_full_name := split_part(v_email, '@', 1);
  END IF;

  INSERT INTO public.profiles (id, company_id, full_name, email, role)
  VALUES (v_user_id, v_invitation.company_id, v_full_name, v_email, 'member');

  UPDATE public.invitations
  SET status = 'accepted'
  WHERE id = v_invitation.id;

  RETURN jsonb_build_object('success', true, 'company_id', v_invitation.company_id);
EXCEPTION
  WHEN unique_violation THEN
    RETURN jsonb_build_object('success', false, 'error', 'profile_already_exists');
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

CREATE OR REPLACE FUNCTION public.create_company_and_admin(p_company_name text, p_cnpj text DEFAULT NULL::text, p_segment text DEFAULT NULL::text, p_full_name text DEFAULT NULL::text, p_email text DEFAULT NULL::text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid;
  v_company_id uuid;
  v_existing_profile record;
  v_auth_email text;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Usuário não autenticado');
  END IF;

  v_auth_email := lower(trim(coalesce(auth.jwt() ->> 'email', coalesce(p_email, ''))));

  IF EXISTS (
    SELECT 1
    FROM public.invitations i
    WHERE lower(i.email) = v_auth_email
      AND i.status = 'pending'
      AND i.expires_at > now()
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Você possui um convite pendente. Use o link do convite para entrar na empresa.');
  END IF;

  SELECT p.id, p.company_id INTO v_existing_profile
  FROM public.profiles p WHERE p.id = v_user_id;

  IF FOUND THEN
    RETURN jsonb_build_object('success', true, 'company_id', v_existing_profile.company_id);
  END IF;

  INSERT INTO public.companies (name, cnpj, segment, plan, max_users)
  VALUES (p_company_name, p_cnpj, p_segment, 'trial', 2)
  RETURNING id INTO v_company_id;

  INSERT INTO public.profiles (id, company_id, full_name, email, role)
  VALUES (
    v_user_id,
    v_company_id,
    COALESCE(p_full_name, ''),
    COALESCE(p_email, ''),
    'admin'
  );

  RETURN jsonb_build_object('success', true, 'company_id', v_company_id);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$function$;