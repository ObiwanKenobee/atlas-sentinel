import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { classifyReport } from "@/utils/classify.functions";
import { liveSignalStore } from "@/data/liveSignalStore";
import { SeverityBadge } from "@/components/SeverityBadge";
import { severityColor, type Signal, type Intervention } from "@/data/signals";

export const Route = createFileRoute("/report")({
  head: () => ({
    meta: [
      { title: "Submit a Report — Atlas Sanctum" },
      { name: "description", content: "Report a real-world signal of suffering. Atlas Sanctum's discernment engine will classify and route it." },
    ],
  }),
  component: ReportPage,
});

// Rough geocoding fallback so submissions land somewhere on the map.
const REGION_COORDS: Array<{ keys: string[]; coords: [number, number] }> = [
  { keys: ["nigeria", "lagos", "abuja", "kano", "maiduguri"], coords: [8.7, 9.1] },
  { keys: ["kenya", "nairobi", "kibera", "mombasa", "turkana"], coords: [37.9, -0.02] },
  { keys: ["congo", "drc", "goma", "kinshasa"], coords: [23.6, -2.9] },
  { keys: ["india", "delhi", "mumbai", "kolkata", "chennai"], coords: [78.9, 20.6] },
  { keys: ["pakistan", "karachi", "lahore", "quetta"], coords: [69.3, 30.4] },
  { keys: ["bangladesh", "dhaka", "cox"], coords: [90.4, 23.7] },
  { keys: ["philippines", "manila", "tacloban"], coords: [121.8, 12.9] },
  { keys: ["chile", "santiago", "antofagasta"], coords: [-71.5, -35.7] },
  { keys: ["brazil", "rio", "manaus", "sao paulo"], coords: [-51.9, -14.2] },
  { keys: ["mexico", "oaxaca"], coords: [-102.5, 23.6] },
  { keys: ["yemen", "sanaa"], coords: [48.5, 15.5] },
  { keys: ["syria", "damascus", "aleppo"], coords: [38.9, 34.8] },
  { keys: ["sudan", "khartoum", "darfur"], coords: [30.2, 12.9] },
  { keys: ["niger", "sahel"], coords: [8.0, 17.6] },
  { keys: ["mozambique", "beira"], coords: [35.5, -18.7] },
  { keys: ["haiti", "port-au-prince"], coords: [-72.3, 18.97] },
  { keys: ["ukraine", "kyiv", "kharkiv"], coords: [31.2, 48.4] },
];

function geocode(text: string): [number, number] {
  const t = text.toLowerCase();
  for (const r of REGION_COORDS) if (r.keys.some((k) => t.includes(k))) return r.coords;
  // Random plausible land position as fallback
  return [Math.random() * 60 - 10, Math.random() * 40 - 5];
}

function ReportPage() {
  const navigate = useNavigate();
  const classify = useServerFn(classifyReport);

  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ signal: Signal; intervention: Intervention } | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await classify({ data: { location, description } });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      const r = res.result;
      const id = `usr-${Date.now().toString(36)}`;
      const signal: Signal = {
        id,
        location,
        region: location.split(",").pop()?.trim() || location,
        coords: geocode(location),
        type: r.type,
        severity: r.severity,
        severityScore: r.severityScore,
        affected: r.estimatedAffected,
        reportedAt: "just now",
        source: "community",
        summary: r.summary,
      };
      const intervention: Intervention = {
        signalId: id,
        recommendedAction: r.recommendedAction,
        estimatedCost: r.estimatedCost,
        impactScore: r.impactScore,
        matchedActor: r.matchedActor,
        fundingSource: "Community Pool · Pending review",
        executionDays: r.executionDays,
      };
      liveSignalStore.add(signal, intervention);
      setResult({ signal, intervention });
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setResult(null);
    setLocation("");
    setDescription("");
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <p className="text-xs uppercase tracking-[0.2em] text-clay">Layers 01 + 02 · Ingestion & Detection</p>
        <h1 className="mt-2 font-serif text-4xl text-foreground md:text-5xl">Submit a community report</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Describe what is happening, where, and to whom. The discernment engine will classify the signal,
          score its urgency, and propose an intervention.
        </p>

        {!result ? (
          <form onSubmit={onSubmit} className="mt-10 space-y-6 rounded-2xl border border-border bg-card p-7 shadow-soft">
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-foreground">
                Location
              </label>
              <input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                minLength={2}
                maxLength={120}
                placeholder="e.g. Kakuma, Kenya"
                className="mt-2 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground/60 focus:border-clay focus:outline-none focus:ring-2 focus:ring-clay/20"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-foreground">
                What is happening?
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                minLength={10}
                maxLength={2000}
                rows={6}
                placeholder="Describe the situation. Who is affected, since when, and what is most urgently needed?"
                className="mt-2 w-full resize-y rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground/60 focus:border-clay focus:outline-none focus:ring-2 focus:ring-clay/20"
              />
              <div className="mt-1 text-right text-xs text-muted-foreground">
                {description.length}/2000
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Reports are processed by the discernment engine. No personal data is stored.
              </p>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center rounded-full bg-foreground px-6 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {submitting ? "Discerning…" : "Submit report →"}
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-10 space-y-5">
            <div className="rounded-2xl border border-clay/30 bg-gradient-dawn p-7 shadow-warm fade-up">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wider text-clay">Signal received & classified</p>
                  <h2 className="mt-1 font-serif text-3xl text-foreground">{result.signal.location}</h2>
                </div>
                <SeverityBadge severity={result.signal.severity} />
              </div>
              <p className="mt-4 text-foreground/85">{result.signal.summary}</p>

              <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
                <Stat label="Type" value={result.signal.type} />
                <Stat label="Severity score" value={result.signal.severityScore.toFixed(2)} />
                <Stat label="Est. affected" value={result.signal.affected.toLocaleString()} />
              </div>

              <div className="mt-6 rounded-xl border border-border bg-card/70 p-5">
                <p className="text-xs uppercase tracking-wider text-clay">Recommended action</p>
                <p className="mt-2 font-serif text-xl text-foreground">{result.intervention.recommendedAction}</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 text-sm">
                  <Stat label="Matched actor" value={result.intervention.matchedActor} />
                  <Stat label="Est. cost" value={`$${result.intervention.estimatedCost.toLocaleString()}`} />
                  <Stat label="Execution time" value={`${result.intervention.executionDays} days`} />
                  <Stat label="Projected impact" value={result.intervention.impactScore.toFixed(2)} />
                </div>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full"
                    style={{
                      width: `${result.signal.severityScore * 100}%`,
                      backgroundColor: severityColor[result.signal.severity],
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => navigate({ to: "/dashboard", search: { id: result.signal.id } })}
                className="inline-flex items-center rounded-full bg-foreground px-6 py-2.5 text-sm font-medium text-background hover:opacity-90"
              >
                Open in dashboard →
              </button>
              <button
                onClick={() => navigate({ to: "/map" })}
                className="inline-flex items-center rounded-full border border-border bg-card px-6 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
              >
                See it on the map
              </button>
              <button
                onClick={reset}
                className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Submit another report
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 capitalize text-foreground">{value}</div>
    </div>
  );
}
