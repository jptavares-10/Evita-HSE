
CREATE OR REPLACE FUNCTION public.tg_set_updated_at() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
REVOKE EXECUTE ON FUNCTION public.tg_set_updated_at() FROM PUBLIC, anon, authenticated;

CREATE TYPE public.calendar_area AS ENUM ('meio_ambiente','seguranca','saude','geral');
CREATE TYPE public.calendar_category AS ENUM ('evento','campanha','auditoria','reuniao','treinamento_interno','outro');
CREATE TYPE public.calendar_event_status AS ENUM ('planejado','concluido','cancelado');

CREATE TABLE public.calendar_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  title text NOT NULL CHECK (length(title) BETWEEN 1 AND 200),
  description text CHECK (description IS NULL OR length(description) <= 2000),
  area public.calendar_area NOT NULL DEFAULT 'geral',
  category public.calendar_category NOT NULL DEFAULT 'evento',
  starts_at timestamptz NOT NULL,
  ends_at timestamptz,
  all_day boolean NOT NULL DEFAULT false,
  location text CHECK (location IS NULL OR length(location) <= 300),
  color text CHECK (color IS NULL OR color ~ '^#[0-9A-Fa-f]{6}$'),
  status public.calendar_event_status NOT NULL DEFAULT 'planejado',
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_calendar_events_company_starts ON public.calendar_events(company_id, starts_at);
CREATE INDEX idx_calendar_events_area ON public.calendar_events(area);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.calendar_events TO authenticated;
GRANT ALL ON public.calendar_events TO service_role;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members read calendar events" ON public.calendar_events FOR SELECT TO authenticated
  USING (company_id = get_user_company_id());
CREATE POLICY "Editors insert calendar events" ON public.calendar_events FOR INSERT TO authenticated
  WITH CHECK (company_id = get_user_company_id() AND has_module_editor_permission('calendar'));
CREATE POLICY "Editors update calendar events" ON public.calendar_events FOR UPDATE TO authenticated
  USING (company_id = get_user_company_id() AND has_module_editor_permission('calendar'))
  WITH CHECK (company_id = get_user_company_id() AND has_module_editor_permission('calendar'));
CREATE POLICY "Editors delete calendar events" ON public.calendar_events FOR DELETE TO authenticated
  USING (company_id = get_user_company_id() AND has_module_editor_permission('calendar'));

CREATE TRIGGER calendar_events_set_updated_at
BEFORE UPDATE ON public.calendar_events
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE TABLE public.calendar_event_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.calendar_events(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  file_url text NOT NULL,
  file_name text NOT NULL,
  file_type text,
  file_size bigint,
  uploaded_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  uploaded_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_calendar_attachments_event ON public.calendar_event_attachments(event_id);

GRANT SELECT, INSERT, DELETE ON public.calendar_event_attachments TO authenticated;
GRANT ALL ON public.calendar_event_attachments TO service_role;
ALTER TABLE public.calendar_event_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members read calendar attachments" ON public.calendar_event_attachments FOR SELECT TO authenticated
  USING (company_id = get_user_company_id());
CREATE POLICY "Editors insert calendar attachments" ON public.calendar_event_attachments FOR INSERT TO authenticated
  WITH CHECK (company_id = get_user_company_id() AND has_module_editor_permission('calendar'));
CREATE POLICY "Editors delete calendar attachments" ON public.calendar_event_attachments FOR DELETE TO authenticated
  USING (company_id = get_user_company_id() AND has_module_editor_permission('calendar'));

CREATE OR REPLACE FUNCTION public.enforce_max_calendar_attachments() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_count int;
BEGIN
  SELECT COUNT(*) INTO v_count FROM public.calendar_event_attachments WHERE event_id = NEW.event_id;
  IF v_count >= 5 THEN
    RAISE EXCEPTION 'Limite de 5 anexos por evento atingido.';
  END IF;
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.enforce_max_calendar_attachments() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER trg_enforce_max_calendar_attachments
BEFORE INSERT ON public.calendar_event_attachments
FOR EACH ROW EXECUTE FUNCTION public.enforce_max_calendar_attachments();

CREATE OR REPLACE VIEW public.calendar_due_items
WITH (security_invoker = true) AS
SELECT 'periodic_service'::text AS source_module, ps.id AS source_id, ps.name AS title,
       ps.next_due_at::date AS due_date, ps.company_id, '/servicos'::text AS deep_link,
       ps.supplier AS subtitle
FROM public.periodic_services ps
WHERE ps.next_due_at IS NOT NULL AND ps.status != 'inactive'
UNION ALL
SELECT 'environmental_license'::text, el.id, COALESCE(el.title, el.license_number),
       el.expires_at::date, el.company_id, '/licencas'::text, el.license_number
FROM public.environmental_licenses el
WHERE el.has_expiry = true AND el.expires_at IS NOT NULL
UNION ALL
SELECT 'license_renewal'::text, lr.id, ('Renovação ' || COALESCE(lr.license_number,''))::text,
       lr.expires_at::date, lr.company_id, '/licencas'::text, lr.license_number
FROM public.license_renewals lr
WHERE lr.expires_at IS NOT NULL
UNION ALL
SELECT 'mtr'::text, m.id, ('MTR ' || m.mtr_number)::text,
       m.cdf_deadline_at::date, m.company_id, '/mtr'::text, m.transporter
FROM public.mtrs m
WHERE m.cdf_deadline_at IS NOT NULL AND m.cdf_status != 'received'
UNION ALL
SELECT 'inspection_execution'::text, ie.id, COALESCE(ie.reference, 'Inspeção'),
       ie.due_date, ie.company_id, '/inspecoes/' || ie.id::text, NULL
FROM public.inspection_executions ie
WHERE ie.due_date IS NOT NULL AND ie.status != 'completed'
UNION ALL
SELECT 'document_review_cycle'::text, drc.id, COALESCE(drc.title, 'Ciclo de revisão'),
       drc.due_date, drc.company_id, '/revisoes'::text, NULL
FROM public.document_review_cycles drc
WHERE drc.due_date IS NOT NULL AND drc.status NOT IN ('completed','cancelled');

GRANT SELECT ON public.calendar_due_items TO authenticated;

CREATE OR REPLACE FUNCTION public.seed_viewer_permissions() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_modules text[] := ARRAY['periodic_services','trainings','mtr','suppliers','ic_nc','environmental_licenses','document_library','inspections','aso','epi','calendar'];
  v_module text;
BEGIN
  IF NEW.role = 'member' THEN
    FOREACH v_module IN ARRAY v_modules LOOP
      INSERT INTO user_permissions (company_id, user_id, module, permission, updated_by, updated_at)
      VALUES (NEW.company_id, NEW.id, v_module, 'viewer', NEW.id, now())
      ON CONFLICT (company_id, user_id, module) DO NOTHING;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.seed_viewer_permissions() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_user_permissions(p_user_id uuid) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_caller_company uuid;
  v_target_company uuid;
  v_target_role text;
  v_result jsonb := '{}'::jsonb;
  v_modules text[] := ARRAY['periodic_services','trainings','mtr','suppliers','ic_nc','environmental_licenses','document_library','inspections','aso','epi','calendar'];
  v_module text;
  v_perm text;
BEGIN
  SELECT company_id INTO v_caller_company FROM profiles WHERE id = auth.uid();
  SELECT company_id, role INTO v_target_company, v_target_role FROM profiles WHERE id = p_user_id;
  IF v_caller_company IS NULL OR v_target_company IS NULL OR v_caller_company != v_target_company THEN
    RETURN jsonb_build_object('error', 'Usuário não pertence à mesma empresa.');
  END IF;
  FOREACH v_module IN ARRAY v_modules LOOP
    SELECT permission INTO v_perm FROM user_permissions
    WHERE user_id = p_user_id AND company_id = v_caller_company AND module = v_module;
    IF v_perm IS NULL THEN
      IF v_target_role = 'admin' THEN v_perm := 'editor'; ELSE v_perm := 'viewer'; END IF;
    END IF;
    v_result := v_result || jsonb_build_object(v_module, v_perm);
  END LOOP;
  RETURN v_result;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_user_permission(p_user_id uuid, p_module text, p_permission text) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_caller record;
  v_target record;
  v_valid_modules text[] := ARRAY['periodic_services','trainings','mtr','suppliers','ic_nc','environmental_licenses','document_library','inspections','aso','epi','calendar'];
BEGIN
  IF auth.uid() IS NULL THEN RETURN jsonb_build_object('success', false, 'error', 'Não autenticado.'); END IF;
  SELECT id, company_id, role INTO v_caller FROM profiles WHERE id = auth.uid();
  IF v_caller.role != 'admin' THEN RETURN jsonb_build_object('success', false, 'error', 'Apenas administradores podem alterar permissões.'); END IF;
  SELECT id, company_id INTO v_target FROM profiles WHERE id = p_user_id;
  IF v_target.company_id != v_caller.company_id THEN RETURN jsonb_build_object('success', false, 'error', 'Usuário não pertence à mesma empresa.'); END IF;
  IF NOT (p_module = ANY(v_valid_modules)) THEN RETURN jsonb_build_object('success', false, 'error', 'Módulo inválido.'); END IF;
  IF p_permission NOT IN ('editor', 'viewer') THEN RETURN jsonb_build_object('success', false, 'error', 'Permissão inválida.'); END IF;
  INSERT INTO user_permissions (company_id, user_id, module, permission, updated_by, updated_at)
  VALUES (v_caller.company_id, p_user_id, p_module, p_permission, auth.uid(), now())
  ON CONFLICT (company_id, user_id, module)
  DO UPDATE SET permission = p_permission, updated_by = auth.uid(), updated_at = now();
  RETURN jsonb_build_object('success', true);
END;
$$;

CREATE POLICY "Members view calendar attachments storage" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'calendar-attachments' AND (storage.foldername(name))[1] = get_user_company_id()::text);
CREATE POLICY "Editors upload calendar attachments storage" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'calendar-attachments'
    AND (storage.foldername(name))[1] = get_user_company_id()::text
    AND has_module_editor_permission('calendar')
  );
CREATE POLICY "Editors delete calendar attachments storage" ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'calendar-attachments'
    AND (storage.foldername(name))[1] = get_user_company_id()::text
    AND has_module_editor_permission('calendar')
  );

INSERT INTO public.user_permissions (company_id, user_id, module, permission, updated_by, updated_at)
SELECT p.company_id, p.id, 'calendar', 'viewer', p.id, now()
FROM public.profiles p
WHERE p.role = 'member'
ON CONFLICT (company_id, user_id, module) DO NOTHING;
