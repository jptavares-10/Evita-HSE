
ALTER TABLE public.service_categories ADD COLUMN is_default boolean NOT NULL DEFAULT false;

UPDATE public.service_categories SET is_default = true WHERE name IN ('Segurança', 'Predial', 'Ambiental', 'Equipamentos');
