
-- Supplier Categories
CREATE TABLE public.supplier_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE POLICY "Users can view own company supplier categories" ON public.supplier_categories FOR SELECT TO authenticated USING (company_id = get_user_company_id());
CREATE POLICY "Users can insert own company supplier categories" ON public.supplier_categories FOR INSERT TO authenticated WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can update own company supplier categories" ON public.supplier_categories FOR UPDATE TO authenticated USING (company_id = get_user_company_id()) WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can delete own company supplier categories" ON public.supplier_categories FOR DELETE TO authenticated USING (company_id = get_user_company_id());

-- Suppliers
CREATE TABLE public.suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  category_id uuid REFERENCES public.supplier_categories(id) ON DELETE SET NULL,
  contact_name text,
  contact_phone text,
  contact_email text,
  status text NOT NULL DEFAULT 'active',
  notes text,
  portal_token uuid NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  portal_enabled boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE POLICY "Users can view own company suppliers" ON public.suppliers FOR SELECT TO authenticated USING (company_id = get_user_company_id());
CREATE POLICY "Users can insert own company suppliers" ON public.suppliers FOR INSERT TO authenticated WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can update own company suppliers" ON public.suppliers FOR UPDATE TO authenticated USING (company_id = get_user_company_id()) WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can delete own company suppliers" ON public.suppliers FOR DELETE TO authenticated USING (company_id = get_user_company_id());

-- Supplier Folders
CREATE TABLE public.supplier_folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  parent_folder_id uuid REFERENCES public.supplier_folders(id) ON DELETE CASCADE,
  created_by_supplier boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE POLICY "Users can view own company supplier folders" ON public.supplier_folders FOR SELECT TO authenticated USING (company_id = get_user_company_id());
CREATE POLICY "Users can insert own company supplier folders" ON public.supplier_folders FOR INSERT TO authenticated WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can update own company supplier folders" ON public.supplier_folders FOR UPDATE TO authenticated USING (company_id = get_user_company_id()) WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can delete own company supplier folders" ON public.supplier_folders FOR DELETE TO authenticated USING (company_id = get_user_company_id());

-- Supplier Documents
CREATE TABLE public.supplier_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  folder_id uuid REFERENCES public.supplier_folders(id) ON DELETE SET NULL,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  description text NOT NULL,
  reference_name text,
  file_url text NOT NULL,
  file_name text NOT NULL,
  file_type text NOT NULL DEFAULT '',
  uploaded_by_supplier boolean NOT NULL DEFAULT false,
  uploaded_at timestamptz NOT NULL DEFAULT now()
);

CREATE POLICY "Users can view own company supplier documents" ON public.supplier_documents FOR SELECT TO authenticated USING (company_id = get_user_company_id());
CREATE POLICY "Users can insert own company supplier documents" ON public.supplier_documents FOR INSERT TO authenticated WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can update own company supplier documents" ON public.supplier_documents FOR UPDATE TO authenticated USING (company_id = get_user_company_id()) WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can delete own company supplier documents" ON public.supplier_documents FOR DELETE TO authenticated USING (company_id = get_user_company_id());

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('supplier-documents', 'supplier-documents', true);

CREATE POLICY "Users can view own company supplier files" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'supplier-documents' AND (storage.foldername(name))[1] = (get_user_company_id())::text);
CREATE POLICY "Users can upload own company supplier files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'supplier-documents' AND (storage.foldername(name))[1] = (get_user_company_id())::text);
CREATE POLICY "Users can delete own company supplier files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'supplier-documents' AND (storage.foldername(name))[1] = (get_user_company_id())::text);
CREATE POLICY "Anon can upload supplier portal files" ON storage.objects FOR INSERT TO anon WITH CHECK (bucket_id = 'supplier-documents');
CREATE POLICY "Anon can view supplier portal files" ON storage.objects FOR SELECT TO anon USING (bucket_id = 'supplier-documents');

-- RPC: get_supplier_portal_data
CREATE OR REPLACE FUNCTION public.get_supplier_portal_data(p_token uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_supplier record;
  v_company_name text;
  v_folders jsonb;
  v_documents jsonb;
BEGIN
  SELECT s.* INTO v_supplier
  FROM suppliers s
  WHERE s.portal_token = p_token
    AND s.portal_enabled = true
    AND s.status = 'active';

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Link inválido ou desativado');
  END IF;

  SELECT c.name INTO v_company_name FROM companies c WHERE c.id = v_supplier.company_id;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', f.id, 'name', f.name, 'parent_folder_id', f.parent_folder_id,
    'created_by_supplier', f.created_by_supplier
  ) ORDER BY f.name), '[]'::jsonb)
  INTO v_folders
  FROM supplier_folders f WHERE f.supplier_id = v_supplier.id;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', d.id, 'folder_id', d.folder_id, 'description', d.description,
    'reference_name', d.reference_name, 'file_url', d.file_url,
    'file_name', d.file_name, 'file_type', d.file_type,
    'uploaded_by_supplier', d.uploaded_by_supplier, 'uploaded_at', d.uploaded_at
  ) ORDER BY d.uploaded_at DESC), '[]'::jsonb)
  INTO v_documents
  FROM supplier_documents d WHERE d.supplier_id = v_supplier.id;

  RETURN jsonb_build_object(
    'success', true,
    'supplier_id', v_supplier.id,
    'supplier_name', v_supplier.name,
    'company_id', v_supplier.company_id,
    'company_name', v_company_name,
    'folders', v_folders,
    'documents', v_documents
  );
END;
$$;

-- RPC: upload_supplier_document
CREATE OR REPLACE FUNCTION public.upload_supplier_document(
  p_token uuid,
  p_folder_id uuid DEFAULT NULL,
  p_description text DEFAULT '',
  p_reference_name text DEFAULT NULL,
  p_file_url text DEFAULT '',
  p_file_name text DEFAULT '',
  p_file_type text DEFAULT ''
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_supplier record;
  v_company record;
BEGIN
  SELECT s.* INTO v_supplier
  FROM suppliers s
  WHERE s.portal_token = p_token AND s.portal_enabled = true AND s.status = 'active';

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Link inválido ou desativado');
  END IF;

  SELECT c.* INTO v_company FROM companies c WHERE c.id = v_supplier.company_id;
  IF v_company.plan = 'expired' THEN
    RETURN jsonb_build_object('success', false, 'error', 'O portal está temporariamente indisponível. Entre em contato com a empresa contratante.');
  END IF;

  INSERT INTO supplier_documents (supplier_id, folder_id, company_id, description, reference_name, file_url, file_name, file_type, uploaded_by_supplier)
  VALUES (v_supplier.id, p_folder_id, v_supplier.company_id, p_description, p_reference_name, p_file_url, p_file_name, p_file_type, true);

  RETURN jsonb_build_object('success', true);
END;
$$;

-- RPC: create_supplier_folder_portal
CREATE OR REPLACE FUNCTION public.create_supplier_folder_portal(
  p_token uuid,
  p_name text,
  p_parent_folder_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_supplier record;
  v_parent record;
  v_new_folder_id uuid;
BEGIN
  SELECT s.* INTO v_supplier
  FROM suppliers s
  WHERE s.portal_token = p_token AND s.portal_enabled = true AND s.status = 'active';

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Link inválido ou desativado');
  END IF;

  IF p_parent_folder_id IS NOT NULL THEN
    SELECT f.* INTO v_parent FROM supplier_folders f WHERE f.id = p_parent_folder_id AND f.supplier_id = v_supplier.id;
    IF NOT FOUND THEN
      RETURN jsonb_build_object('success', false, 'error', 'Pasta pai não encontrada');
    END IF;
    IF v_parent.parent_folder_id IS NOT NULL THEN
      RETURN jsonb_build_object('success', false, 'error', 'Máximo 2 níveis de profundidade');
    END IF;
  END IF;

  INSERT INTO supplier_folders (supplier_id, company_id, name, parent_folder_id, created_by_supplier)
  VALUES (v_supplier.id, v_supplier.company_id, p_name, p_parent_folder_id, true)
  RETURNING id INTO v_new_folder_id;

  RETURN jsonb_build_object('success', true, 'folder_id', v_new_folder_id);
END;
$$;

-- Grant anon access to RPCs
GRANT EXECUTE ON FUNCTION public.get_supplier_portal_data(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.upload_supplier_document(uuid, uuid, text, text, text, text, text) TO anon;
GRANT EXECUTE ON FUNCTION public.create_supplier_folder_portal(uuid, text, uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.get_supplier_portal_data(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.upload_supplier_document(uuid, uuid, text, text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_supplier_folder_portal(uuid, text, uuid) TO authenticated;
