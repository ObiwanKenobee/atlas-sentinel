
ALTER TABLE public.signals REPLICA IDENTITY FULL;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.signals;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
