DROP POLICY IF EXISTS "Users without profile can create a company" ON public.companies;

CREATE POLICY "Users without profile can create a company"
ON public.companies
FOR INSERT
TO authenticated
WITH CHECK (
  NOT (EXISTS ( SELECT 1 FROM profiles WHERE profiles.id = auth.uid()))
  AND plan = 'trial'
  AND max_users = 2
  AND trial_ends_at <= (now() + interval '15 days')
);