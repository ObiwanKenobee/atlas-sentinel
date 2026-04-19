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

// Project lng/lat onto a flat rectangle (-180..180, -60..75)
function project(coords: [number, number]): { left: string; top: string } {
  const [lng, lat] = coords;
  const x = ((lng + 180) / 360) * 100;
  const y = ((75 - lat) / 135) * 100;
  return { left: `${x}%`, top: `${y}%` };
}

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
            <WorldGrid />
            {signals.map((sig) => {
              const { left, top } = project(sig.coords);
              const isActive = selected.id === sig.id;
              return (
                <button
                  key={sig.id}
                  onClick={() => setSelectedId(sig.id)}
                  className="absolute -translate-x-1/2 -translate-y-1/2 focus:outline-none"
                  style={{ left, top }}
                  aria-label={`${sig.location} — ${sig.severity}`}
                >
                  <span
                    className="pulse-dot block rounded-full transition-transform hover:scale-125"
                    style={{
                      width: isActive ? 18 : 12,
                      height: isActive ? 18 : 12,
                      backgroundColor: severityColor[sig.severity],
                      color: severityColor[sig.severity],
                      outline: isActive ? "2px solid var(--background)" : "none",
                      outlineOffset: 2,
                    }}
                  />
                </button>
              );
            })}
            <div className="absolute bottom-4 left-4 rounded-full bg-background/80 px-3 py-1 text-[10px] uppercase tracking-widest text-muted-foreground backdrop-blur">
              Atlas projection · {signals.length} active signals
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

function WorldGrid() {
  // Subtle decorative grid + continental smear so the map reads as a map without a real basemap dependency
  return (
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1600 900" preserveAspectRatio="none">
      <defs>
        <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
          <path d="M 80 0 L 0 0 0 80" fill="none" stroke="oklch(0.85 0.03 70)" strokeWidth="0.5" />
        </pattern>
        <radialGradient id="land" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="oklch(0.86 0.05 75)" />
          <stop offset="100%" stopColor="oklch(0.92 0.04 80)" />
        </radialGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#grid)" opacity="0.6" />
      {/* Continental blobs (very abstract) */}
      <g fill="url(#land)" opacity="0.85">
        <ellipse cx="450" cy="380" rx="220" ry="160" />
        <ellipse cx="820" cy="430" rx="170" ry="220" />
        <ellipse cx="1080" cy="380" rx="240" ry="180" />
        <ellipse cx="1280" cy="540" rx="150" ry="120" />
        <ellipse cx="380" cy="650" rx="120" ry="180" />
        <ellipse cx="900" cy="700" rx="80" ry="60" />
      </g>
      <g stroke="oklch(0.7 0.05 65)" strokeWidth="0.5" opacity="0.4" fill="none">
        <line x1="0" y1="450" x2="1600" y2="450" />
        <line x1="800" y1="0" x2="800" y2="900" />
      </g>
    </svg>
  );
}
