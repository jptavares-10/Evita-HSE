
ALTER TABLE public.trainings 
  ADD COLUMN reference_standard text DEFAULT NULL,
  ADD COLUMN reference_document_id uuid DEFAULT NULL REFERENCES public.documents(id) ON DELETE SET NULL;
