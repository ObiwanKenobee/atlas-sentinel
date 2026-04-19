-- Signals table for community-submitted suffering reports
CREATE TABLE public.signals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  location TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  type TEXT NOT NULL,
  severity TEXT NOT NULL,
  severity_score DOUBLE PRECISION NOT NULL,
  estimated_affected INTEGER NOT NULL DEFAULT 0,
  summary TEXT NOT NULL,
  recommended_action TEXT NOT NULL,
  matched_actor TEXT NOT NULL,
  estimated_cost INTEGER NOT NULL DEFAULT 0,
  execution_days INTEGER NOT NULL DEFAULT 0,
  impact_score DOUBLE PRECISION NOT NULL DEFAULT 0,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.signals ENABLE ROW LEVEL SECURITY;

-- Public read: humanitarian transparency
CREATE POLICY "Signals are publicly viewable"
  ON public.signals FOR SELECT
  USING (true);

-- Open insert: anonymous community reporting
CREATE POLICY "Anyone can submit a signal"
  ON public.signals FOR INSERT
  WITH CHECK (true);

-- No update / delete policies = immutable from the client

CREATE INDEX idx_signals_created_at ON public.signals (created_at DESC);
CREATE INDEX idx_signals_status ON public.signals (status);