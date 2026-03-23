
-- 1. service_categories
CREATE TABLE public.service_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  color text NOT NULL DEFAULT '#3B82F6',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE POLICY "Users can view own company categories" ON public.service_categories FOR SELECT TO authenticated USING (company_id = get_user_company_id());
CREATE POLICY "Users can insert own company categories" ON public.service_categories FOR INSERT TO authenticated WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can update own company categories" ON public.service_categories FOR UPDATE TO authenticated USING (company_id = get_user_company_id()) WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can delete own company categories" ON public.service_categories FOR DELETE TO authenticated USING (company_id = get_user_company_id());

-- 2. periodic_services
CREATE TABLE public.periodic_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  category_id uuid REFERENCES public.service_categories(id) ON DELETE SET NULL,
  frequency_type text NOT NULL DEFAULT 'fixed',
  frequency_preset text,
  frequency_days integer,
  last_done_at date NOT NULL,
  next_due_at date NOT NULL,
  alert_days_before integer NOT NULL DEFAULT 30,
  supplier text,
  notes text,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE POLICY "Users can view own company services" ON public.periodic_services FOR SELECT TO authenticated USING (company_id = get_user_company_id());
CREATE POLICY "Users can insert own company services" ON public.periodic_services FOR INSERT TO authenticated WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can update own company services" ON public.periodic_services FOR UPDATE TO authenticated USING (company_id = get_user_company_id()) WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can delete own company services" ON public.periodic_services FOR DELETE TO authenticated USING (company_id = get_user_company_id());

-- 3. service_attachments
CREATE TABLE public.service_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid NOT NULL REFERENCES public.periodic_services(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_type text NOT NULL DEFAULT 'other',
  uploaded_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  uploaded_at timestamptz NOT NULL DEFAULT now()
);

CREATE POLICY "Users can view own company attachments" ON public.service_attachments FOR SELECT TO authenticated USING (company_id = get_user_company_id());
CREATE POLICY "Users can insert own company attachments" ON public.service_attachments FOR INSERT TO authenticated WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can update own company attachments" ON public.service_attachments FOR UPDATE TO authenticated USING (company_id = get_user_company_id()) WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can delete own company attachments" ON public.service_attachments FOR DELETE TO authenticated USING (company_id = get_user_company_id());

-- 4. service_history
CREATE TABLE public.service_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid NOT NULL REFERENCES public.periodic_services(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  done_at date NOT NULL,
  supplier text,
  notes text,
  registered_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE POLICY "Users can view own company history" ON public.service_history FOR SELECT TO authenticated USING (company_id = get_user_company_id());
CREATE POLICY "Users can insert own company history" ON public.service_history FOR INSERT TO authenticated WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can delete own company history" ON public.service_history FOR DELETE TO authenticated USING (company_id = get_user_company_id());

-- 5. Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('service-attachments', 'service-attachments', true);

CREATE POLICY "Users can upload service attachments" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'service-attachments' AND (storage.foldername(name))[1] = get_user_company_id()::text);
CREATE POLICY "Users can view service attachments" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'service-attachments' AND (storage.foldername(name))[1] = get_user_company_id()::text);
CREATE POLICY "Users can delete service attachments" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'service-attachments' AND (storage.foldername(name))[1] = get_user_company_id()::text);
CREATE POLICY "Public can view service attachments" ON storage.objects FOR SELECT TO anon USING (bucket_id = 'service-attachments');

-- 6. Seed function
CREATE OR REPLACE FUNCTION public.seed_default_categories(p_company_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.service_categories WHERE company_id = p_company_id) THEN
    INSERT INTO public.service_categories (company_id, name, color) VALUES
      (p_company_id, 'Segurança', '#EF4444'),
      (p_company_id, 'Predial', '#F59E0B'),
      (p_company_id, 'Ambiental', '#10B981'),
      (p_company_id, 'Equipamentos', '#3B82F6');
  END IF;
END;
$$;

-- 7. Trigger on company creation
CREATE OR REPLACE FUNCTION public.handle_new_company_categories()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.seed_default_categories(NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_company_created
  AFTER INSERT ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_company_categories();
