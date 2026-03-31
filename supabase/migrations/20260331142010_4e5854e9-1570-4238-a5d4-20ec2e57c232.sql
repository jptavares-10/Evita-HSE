
-- 1. Tabela de tipos de exame ASO
CREATE TABLE public.aso_exam_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  validity_months INTEGER,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.aso_exam_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company aso exam types" ON public.aso_exam_types FOR SELECT TO authenticated USING (company_id = get_user_company_id());
CREATE POLICY "Users can insert own company aso exam types" ON public.aso_exam_types FOR INSERT TO authenticated WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can update own company aso exam types" ON public.aso_exam_types FOR UPDATE TO authenticated USING (company_id = get_user_company_id()) WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can delete own company aso exam types" ON public.aso_exam_types FOR DELETE TO authenticated USING (company_id = get_user_company_id());

-- 2. Tabela de registros de ASO
CREATE TABLE public.aso_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  exam_type_id UUID NOT NULL REFERENCES public.aso_exam_types(id) ON DELETE RESTRICT,
  exam_date DATE NOT NULL,
  expires_at DATE,
  result TEXT NOT NULL DEFAULT 'apto',
  doctor_name TEXT,
  crm TEXT,
  file_url TEXT,
  file_name TEXT,
  notes TEXT,
  registered_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.aso_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company aso records" ON public.aso_records FOR SELECT TO authenticated USING (company_id = get_user_company_id());
CREATE POLICY "Users can insert own company aso records" ON public.aso_records FOR INSERT TO authenticated WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can update own company aso records" ON public.aso_records FOR UPDATE TO authenticated USING (company_id = get_user_company_id()) WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can delete own company aso records" ON public.aso_records FOR DELETE TO authenticated USING (company_id = get_user_company_id());

-- 3. Função de seed de tipos padrão
CREATE OR REPLACE FUNCTION public.seed_default_aso_exam_types(p_company_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.aso_exam_types WHERE company_id = p_company_id) THEN
    INSERT INTO public.aso_exam_types (company_id, name, validity_months, is_default) VALUES
      (p_company_id, 'Admissional', NULL, true),
      (p_company_id, 'Periódico', 12, true),
      (p_company_id, 'Retorno ao trabalho', NULL, true),
      (p_company_id, 'Mudança de risco', NULL, true),
      (p_company_id, 'Demissional', NULL, true);
  END IF;
END;
$$;

-- 4. Trigger para seed automático quando empresa é criada
CREATE OR REPLACE FUNCTION public.handle_new_company_aso_types()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  PERFORM public.seed_default_aso_exam_types(NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_company_created_seed_aso_types
  AFTER INSERT ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_company_aso_types();

-- 5. Bucket de storage
INSERT INTO storage.buckets (id, name, public) VALUES ('aso-files', 'aso-files', false) ON CONFLICT (id) DO NOTHING;

-- 6. Storage RLS policies
CREATE POLICY "Company members can upload aso files" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'aso-files' AND (storage.foldername(name))[1] = (SELECT company_id::text FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Company members can view aso files" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'aso-files' AND (storage.foldername(name))[1] = (SELECT company_id::text FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Company members can update aso files" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'aso-files' AND (storage.foldername(name))[1] = (SELECT company_id::text FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Company members can delete aso files" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'aso-files' AND (storage.foldername(name))[1] = (SELECT company_id::text FROM public.profiles WHERE id = auth.uid()));
