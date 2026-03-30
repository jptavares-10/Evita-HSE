

## Problem

The `corrective_actions.created_by` column is `NOT NULL`, but the FK constraint was changed to `ON DELETE SET NULL`. When deleting a profile, Postgres tries to set `created_by = NULL` but the NOT NULL constraint blocks it.

## Fix

One migration to alter `corrective_actions.created_by` to be nullable:

```sql
ALTER TABLE public.corrective_actions
  ALTER COLUMN created_by DROP NOT NULL;
```

No frontend changes needed. No other columns have this mismatch — all other `registered_by`/`uploaded_by`/`completed_by` columns are already nullable.

### Files changed
1. New migration — drop NOT NULL on `corrective_actions.created_by`

