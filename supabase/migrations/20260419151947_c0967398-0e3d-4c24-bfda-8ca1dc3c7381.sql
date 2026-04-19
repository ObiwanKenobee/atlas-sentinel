ALTER PUBLICATION supabase_realtime ADD TABLE public.signals;
ALTER TABLE public.signals REPLICA IDENTITY FULL;