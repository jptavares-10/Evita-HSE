-- =============================================
-- SECURITY AUDIT FIX: Storage Policies & Buckets
-- =============================================

-- 1. DROP old permissive storage policies that lack company_id isolation
DROP POLICY IF EXISTS "Users can delete occurrence files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view occurrence files" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload occurrence files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete training certs" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view training certs" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload training certs" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete mtr files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view mtr files" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload mtr files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update mtr files" ON storage.objects;
DROP POLICY IF EXISTS "Only authenticated can access supplier-documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own company supplier files" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own company supplier files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own company supplier files" ON storage.objects;

-- 2. Set file_size_limit (20MB) on all buckets
UPDATE storage.buckets SET file_size_limit = 20971520 WHERE name IN ('service-attachments','training-certificates','mtr-files','supplier-documents','occurrence-files','company-logos','avatars');

-- 3. Fix invitations UPDATE policy to include with_check
DROP POLICY IF EXISTS "Users can update invitations in own company" ON public.invitations;
CREATE POLICY "Users can update invitations in own company"
  ON public.invitations FOR UPDATE TO authenticated
  USING (company_id = get_user_company_id())
  WITH CHECK (company_id = get_user_company_id());

-- 4. Update RPCs to use generic error messages and validate inputs
CREATE OR REPLACE FUNCTION public.get_supplier_portal_data(p_token uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
DECLARE
  v_supplier record;
  v_company_name text;
  v_folders jsonb;
  v_documents jsonb;
BEGIN
  IF p_token IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Link inválido ou expirado');
  END IF;

  SELECT s.* INTO v_supplier
  FROM suppliers s
  WHERE s.portal_token = p_token
    AND s.portal_enabled = true
    AND s.status = 'active';

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Link inválido ou expirado');
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

CREATE OR REPLACE FUNCTION public.upload_supplier_document(
  p_token uuid, p_folder_id uuid DEFAULT NULL, p_description text DEFAULT '',
  p_reference_name text DEFAULT NULL, p_file_url text DEFAULT '',
  p_file_name text DEFAULT '', p_file_type text DEFAULT ''
)
 RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE
  v_supplier record;
  v_company record;
BEGIN
  IF p_token IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Link inválido ou expirado');
  END IF;

  SELECT s.* INTO v_supplier
  FROM suppliers s
  WHERE s.portal_token = p_token AND s.portal_enabled = true AND s.status = 'active';

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Link inválido ou expirado');
  END IF;

  SELECT c.* INTO v_company FROM companies c WHERE c.id = v_supplier.company_id;
  IF v_company.plan = 'expired' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Portal temporariamente indisponível.');
  END IF;

  INSERT INTO supplier_documents (supplier_id, folder_id, company_id, description, reference_name, file_url, file_name, file_type, uploaded_by_supplier)
  VALUES (v_supplier.id, p_folder_id, v_supplier.company_id, p_description, p_reference_name, p_file_url, p_file_name, p_file_type, true);

  RETURN jsonb_build_object('success', true);
END;
$$;

CREATE OR REPLACE FUNCTION public.create_supplier_folder_portal(
  p_token uuid, p_name text, p_parent_folder_id uuid DEFAULT NULL
)
 RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE
  v_supplier record;
  v_parent record;
  v_new_folder_id uuid;
BEGIN
  IF p_token IS NULL OR p_name IS NULL OR trim(p_name) = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Dados inválidos');
  END IF;

  SELECT s.* INTO v_supplier
  FROM suppliers s
  WHERE s.portal_token = p_token AND s.portal_enabled = true AND s.status = 'active';

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Link inválido ou expirado');
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
  VALUES (v_supplier.id, v_supplier.company_id, trim(p_name), p_parent_folder_id, true)
  RETURNING id INTO v_new_folder_id;

  RETURN jsonb_build_object('success', true, 'folder_id', v_new_folder_id);
END;
$$;