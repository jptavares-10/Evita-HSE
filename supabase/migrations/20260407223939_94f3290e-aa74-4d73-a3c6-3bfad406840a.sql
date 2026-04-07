
-- Table: document_review_cycles
CREATE TABLE public.document_review_cycles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  document_id uuid NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  revision_id uuid NOT NULL REFERENCES public.document_revisions(id) ON DELETE CASCADE,
  title text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  due_date date,
  message text,
  require_all_responses boolean NOT NULL DEFAULT false,
  comments_visible boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES public.profiles(id),
  approved_by uuid REFERENCES public.profiles(id),
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.document_review_cycles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company review cycles" ON public.document_review_cycles FOR SELECT TO authenticated USING (company_id = get_user_company_id());
CREATE POLICY "Users can insert own company review cycles" ON public.document_review_cycles FOR INSERT TO authenticated WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can update own company review cycles" ON public.document_review_cycles FOR UPDATE TO authenticated USING (company_id = get_user_company_id()) WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can delete own company review cycles" ON public.document_review_cycles FOR DELETE TO authenticated USING (company_id = get_user_company_id());

CREATE INDEX idx_review_cycles_document_id ON public.document_review_cycles(document_id);

-- Table: document_review_assignments
CREATE TABLE public.document_review_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id uuid NOT NULL REFERENCES public.document_review_cycles(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  reviewer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  read_at timestamptz,
  responded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.document_review_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company review assignments" ON public.document_review_assignments FOR SELECT TO authenticated USING (company_id = get_user_company_id());
CREATE POLICY "Users can insert own company review assignments" ON public.document_review_assignments FOR INSERT TO authenticated WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can update own company review assignments" ON public.document_review_assignments FOR UPDATE TO authenticated USING (company_id = get_user_company_id()) WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can delete own company review assignments" ON public.document_review_assignments FOR DELETE TO authenticated USING (company_id = get_user_company_id());

CREATE INDEX idx_review_assignments_reviewer_id ON public.document_review_assignments(reviewer_id);
CREATE INDEX idx_review_assignments_cycle_id ON public.document_review_assignments(cycle_id);

-- Table: document_review_comments
CREATE TABLE public.document_review_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id uuid NOT NULL REFERENCES public.document_review_cycles(id) ON DELETE CASCADE,
  assignment_id uuid NOT NULL REFERENCES public.document_review_assignments(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES public.profiles(id),
  content text NOT NULL,
  attachment_url text,
  attachment_name text,
  comment_type text NOT NULL DEFAULT 'comment',
  is_resolved boolean NOT NULL DEFAULT false,
  resolved_by uuid REFERENCES public.profiles(id),
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.document_review_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company review comments" ON public.document_review_comments FOR SELECT TO authenticated USING (company_id = get_user_company_id());
CREATE POLICY "Users can insert own company review comments" ON public.document_review_comments FOR INSERT TO authenticated WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can update own company review comments" ON public.document_review_comments FOR UPDATE TO authenticated USING (company_id = get_user_company_id()) WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can delete own company review comments" ON public.document_review_comments FOR DELETE TO authenticated USING (company_id = get_user_company_id());

CREATE INDEX idx_review_comments_cycle_id ON public.document_review_comments(cycle_id);

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('review-attachments', 'review-attachments', false) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can view own company review attachments" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'review-attachments' AND (storage.foldername(name))[1] = (SELECT company_id::text FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Users can upload own company review attachments" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'review-attachments' AND (storage.foldername(name))[1] = (SELECT company_id::text FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Users can update own company review attachments" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'review-attachments' AND (storage.foldername(name))[1] = (SELECT company_id::text FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Users can delete own company review attachments" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'review-attachments' AND (storage.foldername(name))[1] = (SELECT company_id::text FROM public.profiles WHERE id = auth.uid()));
