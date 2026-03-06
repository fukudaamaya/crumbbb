ALTER TABLE public.bakes ADD COLUMN add_ins jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.recipes ADD COLUMN add_ins jsonb NOT NULL DEFAULT '[]'::jsonb;