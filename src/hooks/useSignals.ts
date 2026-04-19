import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  signals as seedSignals,
  interventions as seedInterventions,
  type Signal,
  type Intervention,
} from "@/data/signals";

type DbSignalRow = {
  id: string;
  location: string;
  lat: number;
  lng: number;
  type: string;
  severity: string;
  severity_score: number;
  estimated_affected: number;
  summary: string;
  recommended_action: string;
  matched_actor: string;
  estimated_cost: number;
  execution_days: number;
  impact_score: number;
  created_at: string;
};

function rowToSignal(r: DbSignalRow): Signal {
  return {
    id: r.id,
    location: r.location,
    region: r.location.split(",").pop()?.trim() || r.location,
    coords: [r.lng, r.lat],
    type: r.type as Signal["type"],
    severity: r.severity as Signal["severity"],
    severityScore: r.severity_score,
    affected: r.estimated_affected,
    reportedAt: relativeTime(r.created_at),
    source: "community",
    summary: r.summary,
  };
}

function rowToIntervention(r: DbSignalRow): Intervention {
  return {
    signalId: r.id,
    recommendedAction: r.recommended_action,
    estimatedCost: r.estimated_cost,
    impactScore: r.impact_score,
    matchedActor: r.matched_actor,
    fundingSource: "Community Pool · Pending review",
    executionDays: r.execution_days,
  };
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function useDbSignals() {
  const [rows, setRows] = useState<DbSignalRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("signals")
        .select("*")
        .order("created_at", { ascending: false });
      if (!cancelled && !error && data) setRows(data as DbSignalRow[]);
    })();

    const channel = supabase
      .channel("signals-feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "signals" },
        (payload) => {
          setRows((prev) => [payload.new as DbSignalRow, ...prev]);
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  return rows;
}

export function useAllSignals() {
  const rows = useDbSignals();
  const live = rows.map(rowToSignal);
  return [...live, ...seedSignals];
}

export function useAllInterventions() {
  const rows = useDbSignals();
  const live: Record<string, Intervention> = {};
  for (const r of rows) live[r.id] = rowToIntervention(r);
  return { ...seedInterventions, ...live };
}
