
UPDATE public.inspection_models SET default_responsible_id = NULL;

ALTER TABLE public.inspection_models
  DROP CONSTRAINT inspection_models_default_responsible_id_fkey;

ALTER TABLE public.inspection_models
  ADD CONSTRAINT inspection_models_default_responsible_id_fkey
  FOREIGN KEY (default_responsible_id) REFERENCES public.employees(id);
