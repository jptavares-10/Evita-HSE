

## Problem

The `remove_member` RPC function fails with a **foreign key constraint violation** (HTTP 409). The error:

```
Key (id)=(e77735a4-...) is still referenced from table "corrective_actions"
```

Multiple tables reference `profiles.id` via foreign keys, and several of them lack `ON DELETE` actions (defaulting to `RESTRICT`), which blocks the DELETE.

### Foreign keys that block deletion (no ON DELETE clause = RESTRICT):

| Table | Column | Current ON DELETE |
|---|---|---|
| `corrective_actions` | `completed_by` | RESTRICT |
| `corrective_actions` | `created_by` | RESTRICT |
| `employee_training_records` | `registered_by` | RESTRICT |
| `mtrs` | `registered_by` | RESTRICT |
| `occurrences` | `registered_by` | RESTRICT |
| `occurrence_attachments` | `uploaded_by` | RESTRICT |

### Foreign keys that already handle deletion:
- `invitations.invited_by` → ON DELETE CASCADE
- `periodic_services.created_by` → ON DELETE SET NULL
- `service_attachments.uploaded_by` → ON DELETE SET NULL
- `service_history.registered_by` → ON DELETE SET NULL
- `service_history.notes_edited_by` → (need to check, but likely RESTRICT)
- `suppliers.created_by` → ON DELETE SET NULL

## Fix

**One migration** to alter the 6+ blocking foreign keys to use `ON DELETE SET NULL`. This preserves the data records (corrective actions, MTRs, occurrences, etc.) while allowing the member profile to be deleted. The `registered_by`/`completed_by`/`uploaded_by` columns are already nullable, so SET NULL is safe.

### Migration SQL

```sql
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

-- service_history.notes_edited_by (also likely RESTRICT)
ALTER TABLE public.service_history DROP CONSTRAINT service_history_notes_edited_by_fkey;
ALTER TABLE public.service_history ADD CONSTRAINT service_history_notes_edited_by_fkey
  FOREIGN KEY (notes_edited_by) REFERENCES public.profiles(id) ON DELETE SET NULL;
```

Additionally, improve the `remove_member` function error handling to surface the actual DB error message to the frontend, and update the frontend toast to show it.

### Frontend change (Usuarios.tsx)

Update `handleRemoveUser` to also read the Supabase `error.message` when the RPC returns a non-success response, so the user sees a meaningful error instead of a generic message.

### Files changed
1. **New migration** — alter 7 foreign key constraints to `ON DELETE SET NULL`
2. **src/pages/Usuarios.tsx** — improve error message display in `handleRemoveUser`

