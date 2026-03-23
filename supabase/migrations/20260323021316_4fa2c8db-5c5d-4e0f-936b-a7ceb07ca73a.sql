
-- Companies table
CREATE TABLE public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  cnpj text,
  segment text,
  logo_url text,
  plan text NOT NULL DEFAULT 'trial' CHECK (plan IN ('trial', 'basic', 'pro', 'expired')),
  trial_started_at timestamptz DEFAULT now(),
  trial_ends_at timestamptz DEFAULT (now() + interval '14 days'),
  max_users integer NOT NULL DEFAULT 2,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Invitations table
CREATE TABLE public.invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  email text NOT NULL,
  token uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  invited_by uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days')
);

-- RLS helper: get current user's company_id
CREATE OR REPLACE FUNCTION public.get_user_company_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT company_id FROM public.profiles WHERE id = auth.uid()
$$;

-- RLS Policies for companies
CREATE POLICY "Users can view own company"
  ON public.companies FOR SELECT
  TO authenticated
  USING (id = public.get_user_company_id());

CREATE POLICY "Users can update own company"
  ON public.companies FOR UPDATE
  TO authenticated
  USING (id = public.get_user_company_id())
  WITH CHECK (id = public.get_user_company_id());

-- Allow insert for signup (no company_id yet)
CREATE POLICY "Allow insert for new companies"
  ON public.companies FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for profiles
CREATE POLICY "Users can view profiles in own company"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (company_id = public.get_user_company_id());

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can delete profiles in own company"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (company_id = public.get_user_company_id() AND id != auth.uid());

-- RLS Policies for invitations
CREATE POLICY "Users can view invitations in own company"
  ON public.invitations FOR SELECT
  TO authenticated
  USING (company_id = public.get_user_company_id());

CREATE POLICY "Users can create invitations in own company"
  ON public.invitations FOR INSERT
  TO authenticated
  WITH CHECK (company_id = public.get_user_company_id());

CREATE POLICY "Users can update invitations in own company"
  ON public.invitations FOR UPDATE
  TO authenticated
  USING (company_id = public.get_user_company_id());

CREATE POLICY "Users can delete invitations in own company"
  ON public.invitations FOR DELETE
  TO authenticated
  USING (company_id = public.get_user_company_id());

-- Allow anonymous read of invitations by token (for invite accept flow)
CREATE POLICY "Anyone can read invitation by token"
  ON public.invitations FOR SELECT
  TO anon
  USING (true);

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('company-logos', 'company-logos', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Storage policies
CREATE POLICY "Authenticated users can upload company logos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'company-logos');

CREATE POLICY "Anyone can view company logos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'company-logos');

CREATE POLICY "Authenticated users can upload avatars"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can update company logos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'company-logos');
