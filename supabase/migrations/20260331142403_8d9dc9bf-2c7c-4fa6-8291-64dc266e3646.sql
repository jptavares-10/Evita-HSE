
-- Seed default ASO exam types for existing companies
DO $$
DECLARE
  cid UUID;
BEGIN
  FOR cid IN SELECT id FROM companies WHERE id NOT IN (SELECT DISTINCT company_id FROM aso_exam_types) LOOP
    PERFORM seed_default_aso_exam_types(cid);
  END LOOP;
END;
$$;
