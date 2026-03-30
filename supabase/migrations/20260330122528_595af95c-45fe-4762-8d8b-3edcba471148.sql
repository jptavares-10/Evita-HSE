-- corrective_actions.completed_by
ALTER TABLE public.corrective_actions DROP CONSTRAINT corrective_actions_completed_by_fkey;
ALTER TABLE public.corrective_actions ADD CONSTRAINT corrective_actions_completed_by_fkey
  FOREIGN KEY (completed_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- corrective_actions.created_by
ALTER TABLE public.corrective_actions DROP CONSTRAINT corrective_actions_created_by_fkey;
ALTER TABLE public.corrective_actions ADD CONSTRAINT corrective_actions_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- employee_training_records.registered_by
ALTER TABLE public.employee_training_records DROP CONSTRAINT employee_training_records_registered_by_fkey;
ALTER TABLE public.employee_training_records ADD CONSTRAINT employee_training_records_registered_by_fkey
  FOREIGN KEY (registered_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- mtrs.registered_by
ALTER TABLE public.mtrs DROP CONSTRAINT mtrs_registered_by_fkey;
ALTER TABLE public.mtrs ADD CONSTRAINT mtrs_registered_by_fkey
  FOREIGN KEY (registered_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- occurrences.registered_by
ALTER TABLE public.occurrences DROP CONSTRAINT occurrences_registered_by_fkey;
ALTER TABLE public.occurrences ADD CONSTRAINT occurrences_registered_by_fkey
  FOREIGN KEY (registered_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- occurrence_attachments.uploaded_by
ALTER TABLE public.occurrence_attachments DROP CONSTRAINT occurrence_attachments_uploaded_by_fkey;
ALTER TABLE public.occurrence_attachments ADD CONSTRAINT occurrence_attachments_uploaded_by_fkey
  FOREIGN KEY (uploaded_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- service_history.notes_edited_by
ALTER TABLE public.service_history DROP CONSTRAINT service_history_notes_edited_by_fkey;
ALTER TABLE public.service_history ADD CONSTRAINT service_history_notes_edited_by_fkey
  FOREIGN KEY (notes_edited_by) REFERENCES public.profiles(id) ON DELETE SET NULL;