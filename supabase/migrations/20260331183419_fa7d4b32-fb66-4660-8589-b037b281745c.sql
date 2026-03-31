ALTER TABLE public.documents
  ADD COLUMN has_revision_cycle boolean NOT NULL DEFAULT false,
  ADD COLUMN revision_frequency_days integer,
  ADD COLUMN next_revision_at date;