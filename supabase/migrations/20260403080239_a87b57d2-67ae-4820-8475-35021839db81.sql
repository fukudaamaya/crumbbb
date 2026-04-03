ALTER TABLE public.bakes ADD COLUMN preheat_time_mins integer NOT NULL DEFAULT 0;
ALTER TABLE public.bakes ADD COLUMN lid_on_mins integer NOT NULL DEFAULT 0;
ALTER TABLE public.bakes ADD COLUMN lid_off_mins integer NOT NULL DEFAULT 0;