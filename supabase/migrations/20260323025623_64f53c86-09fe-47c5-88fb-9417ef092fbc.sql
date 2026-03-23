
-- Insert company for existing user who had a failed signup
DO $$
DECLARE
  v_company_id uuid;
BEGIN
  -- Only run if this user has no profile yet
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = '76f789c0-18c3-4172-bbda-40d38f0336ca') THEN
    -- Create company
    INSERT INTO public.companies (name, plan, max_users)
    VALUES ('Minha Empresa', 'trial', 2)
    RETURNING id INTO v_company_id;

    -- Create profile
    INSERT INTO public.profiles (id, company_id, full_name, email, role)
    VALUES (
      '76f789c0-18c3-4172-bbda-40d38f0336ca',
      v_company_id,
      'JP Tavares',
      'jp_tavares@id.uff.br',
      'admin'
    );

    -- Seed default categories
    PERFORM public.seed_default_categories(v_company_id);
  END IF;
END $$;
