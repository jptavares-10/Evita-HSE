-- Fix: notes_edited_by FK should point to profiles, not auth.users
ALTER TABLE public.service_history
  DROP CONSTRAINT service_history_notes_edited_by_fkey;

ALTER TABLE public.service_history
  ADD CONSTRAINT service_history_notes_edited_by_fkey
  FOREIGN KEY (notes_edited_by) REFERENCES public.profiles(id);