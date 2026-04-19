import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { severityColor, severityLabel, type Signal } from "@/data/signals";
import { useAllSignals } from "@/hooks/useSignals";
import { SeverityBadge } from "@/components/SeverityBadge";
import { MapboxWorld } from "@/components/MapboxWorld";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Live Suffering Map — Atlas Sanctum" },
      { name: "description", content: "A real-time map of active suffering signals from communities, satellites, and sensors." },
    ],
  }),
  component: MapPage,
});

// Mapbox basemap renders pins from signal coords directly.

function MapPage() {
  const signals = useAllSignals();
  const [selectedId, setSelectedId] = useState<string>(signals[0].id);
  const selected: Signal = signals.find((s) => s.id === selectedId) ?? signals[0];

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-clay">Layer 01 · Ingestion</p>
            <h1 className="mt-2 font-serif text-4xl text-foreground md:text-5xl">Live signal map</h1>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Each pulse is a real-world signal of suffering. Color reflects severity. Click any pin to see the discernment engine's recommendation.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            {(["low", "medium", "high", "critical"] as const).map((s) => (
              <div key={s} className="flex items-center gap-1.5 text-muted-foreground">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: severityColor[s] }} />
                {severityLabel[s]}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
          {/* Map */}
          <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-border bg-sand shadow-soft">
            <MapboxWorld signals={signals} selectedId={selected.id} onSelect={setSelectedId} />
            <div className="pointer-events-none absolute bottom-4 left-4 rounded-full bg-background/80 px-3 py-1 text-[10px] uppercase tracking-widest text-muted-foreground backdrop-blur">
              Mapbox · {signals.length} active signals
            </div>
          </div>

          {/* Detail panel */}
          <aside className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{selected.region}</p>
                <h2 className="mt-1 font-serif text-2xl text-foreground">{selected.location}</h2>
              </div>
              <SeverityBadge severity={selected.severity} />
            </div>

            <p className="mt-4 text-sm leading-relaxed text-foreground/80">{selected.summary}</p>

            <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-wider text-muted-foreground">Type</dt>
                <dd className="mt-1 capitalize text-foreground">{selected.type}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-muted-foreground">Affected</dt>
                <dd className="mt-1 text-foreground">{selected.affected.toLocaleString()}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-muted-foreground">Source</dt>
                <dd className="mt-1 capitalize text-foreground">{selected.source}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-muted-foreground">Reported</dt>
                <dd className="mt-1 text-foreground">{selected.reportedAt}</dd>
              </div>
            </dl>

            <div className="mt-6 rounded-xl bg-muted/60 p-4">
              <div className="flex items-center justify-between text-xs uppercase tracking-wider text-muted-foreground">
                <span>Severity score</span>
                <span className="font-mono text-foreground">{selected.severityScore.toFixed(2)}</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-background">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${selected.severityScore * 100}%`,
                    backgroundColor: severityColor[selected.severity],
                  }}
                />
              </div>
            </div>

            <Link
              to="/dashboard"
              search={{ id: selected.id }}
              className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
            >
              View intervention →
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
}
