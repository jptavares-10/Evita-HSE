
-- =============================================
-- Módulo: Biblioteca de Documentos
-- =============================================

-- 1. document_types
CREATE TABLE public.document_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.document_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company document types" ON public.document_types FOR SELECT TO authenticated USING (company_id = get_user_company_id());
CREATE POLICY "Users can insert own company document types" ON public.document_types FOR INSERT TO authenticated WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can update own company document types" ON public.document_types FOR UPDATE TO authenticated USING (company_id = get_user_company_id()) WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can delete own company document types" ON public.document_types FOR DELETE TO authenticated USING (company_id = get_user_company_id());

-- 2. documents
CREATE TABLE public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  code text,
  title text NOT NULL,
  document_type_id uuid REFERENCES public.document_types(id) ON DELETE SET NULL,
  description text,
  responsible text,
  area text,
  status text NOT NULL DEFAULT 'active',
  current_revision text NOT NULL,
  current_revision_date date NOT NULL,
  current_file_url text,
  current_file_name text,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company documents" ON public.documents FOR SELECT TO authenticated USING (company_id = get_user_company_id());
CREATE POLICY "Users can insert own company documents" ON public.documents FOR INSERT TO authenticated WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can update own company documents" ON public.documents FOR UPDATE TO authenticated USING (company_id = get_user_company_id()) WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can delete own company documents" ON public.documents FOR DELETE TO authenticated USING (company_id = get_user_company_id());

-- 3. document_revisions
CREATE TABLE public.document_revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  revision_number text NOT NULL,
  revision_date date NOT NULL,
  file_url text NOT NULL,
  file_name text NOT NULL,
  notes text,
  uploaded_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  uploaded_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.document_revisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company doc revisions" ON public.document_revisions FOR SELECT TO authenticated USING (company_id = get_user_company_id());
CREATE POLICY "Users can insert own company doc revisions" ON public.document_revisions FOR INSERT TO authenticated WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can update own company doc revisions" ON public.document_revisions FOR UPDATE TO authenticated USING (company_id = get_user_company_id()) WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can delete own company doc revisions" ON public.document_revisions FOR DELETE TO authenticated USING (company_id = get_user_company_id());

-- 4. document_service_links
CREATE TABLE public.document_service_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES public.periodic_services(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  linked_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  linked_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (document_id, service_id)
);

ALTER TABLE public.document_service_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company doc service links" ON public.document_service_links FOR SELECT TO authenticated USING (company_id = get_user_company_id());
CREATE POLICY "Users can insert own company doc service links" ON public.document_service_links FOR INSERT TO authenticated WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can delete own company doc service links" ON public.document_service_links FOR DELETE TO authenticated USING (company_id = get_user_company_id());

-- 5. Indexes
CREATE INDEX IF NOT EXISTS idx_documents_company_id ON public.documents(company_id);
CREATE INDEX IF NOT EXISTS idx_documents_type_id ON public.documents(document_type_id);
CREATE INDEX IF NOT EXISTS idx_document_revisions_document_id ON public.document_revisions(document_id);
CREATE INDEX IF NOT EXISTS idx_document_service_links_service_id ON public.document_service_links(service_id);
CREATE INDEX IF NOT EXISTS idx_document_service_links_document_id ON public.document_service_links(document_id);

-- 6. Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('documents-library', 'documents-library', false) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated users can upload docs" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'documents-library');
CREATE POLICY "Users can view own docs" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'documents-library');
CREATE POLICY "Users can update own docs" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'documents-library');
CREATE POLICY "Users can delete own docs" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'documents-library');

-- 7. Seed function
CREATE OR REPLACE FUNCTION public.seed_default_document_types(p_company_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.document_types WHERE company_id = p_company_id) THEN
    INSERT INTO public.document_types (company_id, name, is_default) VALUES
      (p_company_id, 'Instrução de Trabalho (IT)', true),
      (p_company_id, 'Análise Preliminar de Risco (APR)', true),
      (p_company_id, 'PGR / PPRA', true),
      (p_company_id, 'PCMSO', true);
  END IF;
END;
$$;
