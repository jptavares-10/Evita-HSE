ALTER TABLE public.service_history
  ADD COLUMN IF NOT EXISTS realization_type text NOT NULL DEFAULT 'scheduled',
  ADD COLUMN IF NOT EXISTS failure_description text;