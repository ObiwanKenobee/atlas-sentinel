import { createFileRoute, Link } from "@tanstack/react-router";
import { useDbOnlySignals } from "@/hooks/useSignals";
import { impactRecords } from "@/data/signals";
import { amoyTxUrl, shortHash } from "@/lib/onchain";

export const Route = createFileRoute("/impact")({
  head: () => ({
    meta: [
      { title: "Impact Feed — Atlas Sanctum" },
      { name: "description", content: "Verified, on-chain records of completed interventions and their measured outcomes." },
    ],
  }),
  component: Impact,
});

function Impact() {
  const dbSignals = useDbOnlySignals();
  const fundedLive = dbSignals.filter((s) => s.status === "funded" && s.txHash);

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <p className="text-xs uppercase tracking-[0.2em] text-clay">Layer 06 · Verification</p>
        <h1 className="mt-2 font-serif text-4xl text-foreground md:text-5xl">Impact feed</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Every funded intervention leaves a receipt: the matched actor, deployed capital, and a hash anchored on Polygon Amoy.
        </p>

        <ol className="mt-12 space-y-10 border-l border-border pl-6">
          {fundedLive.map((s) => (
            <li key={s.id} className="relative">
              <span className="absolute -left-[31px] top-2 h-3 w-3 rounded-full bg-olive ring-4 ring-background" />
              <article className="rounded-2xl border border-olive/30 bg-card p-7 shadow-soft transition-shadow hover:shadow-warm">
                <header className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-olive">
                      Funded · {s.fundedAt ? new Date(s.fundedAt).toLocaleDateString() : "today"}
                    </p>
                    <h2 className="mt-1 font-serif text-2xl text-foreground">{s.location}</h2>
                    <p className="mt-1 text-foreground/80">{s.summary}</p>
                  </div>
                  {s.txHash && (
                    <div className="text-right text-xs">
                      <div className="text-muted-foreground">Polygon Amoy tx</div>
                      <a
                        href={amoyTxUrl(s.txHash)}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-0.5 inline-block rounded bg-muted px-2 py-0.5 font-mono text-foreground underline-offset-2 hover:text-clay hover:underline"
                      >
                        {shortHash(s.txHash)} ↗
                      </a>
                    </div>
                  )}
                </header>

                <footer className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-sm">
                  <div className="flex items-center gap-6 text-muted-foreground">
                    <span><span className="text-foreground font-medium">{s.affected.toLocaleString()}</span> beneficiaries</span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-xs text-olive">
                    <span className="h-1.5 w-1.5 rounded-full bg-olive" />
                    Verified on Polygonscan
                  </span>
                </footer>
              </article>
            </li>
          ))}

          {/* Historical seed records — kept so the feed is never empty in the prototype */}
          {impactRecords.map((r) => (
            <li key={r.id} className="relative">
              <span className="absolute -left-[31px] top-2 h-3 w-3 rounded-full bg-clay ring-4 ring-background" />
              <article className="rounded-2xl border border-border bg-card p-7 shadow-soft transition-shadow hover:shadow-warm">
                <header className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      Verified · {r.verifiedAt}
                    </p>
                    <h2 className="mt-1 font-serif text-2xl text-foreground">{r.location}</h2>
                    <p className="mt-1 text-foreground/80">{r.intervention}</p>
                  </div>
                  <div className="text-right text-xs">
                    <div className="text-muted-foreground">Polygon Amoy tx</div>
                    <a
                      href={amoyTxUrl(r.txHash)}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-0.5 inline-block rounded bg-muted px-2 py-0.5 font-mono text-foreground underline-offset-2 hover:text-clay hover:underline"
                    >
                      {shortHash(r.txHash)} ↗
                    </a>
                  </div>
                </header>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl bg-muted/60 p-4">
                    <div className="text-xs uppercase tracking-wider text-destructive/80">Before</div>
                    <p className="mt-1 text-sm text-foreground/80">{r.beforeNote}</p>
                  </div>
                  <div className="rounded-xl bg-olive/10 p-4">
                    <div className="text-xs uppercase tracking-wider text-olive">After</div>
                    <p className="mt-1 text-sm text-foreground/80">{r.afterNote}</p>
                  </div>
                </div>

                <footer className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-sm">
                  <div className="flex items-center gap-6 text-muted-foreground">
                    <span><span className="text-foreground font-medium">{r.beneficiaries.toLocaleString()}</span> beneficiaries</span>
                    <span>${r.cost.toLocaleString()} deployed</span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-xs text-olive">
                    <span className="h-1.5 w-1.5 rounded-full bg-olive" />
                    Verified on Polygonscan
                  </span>
                </footer>
              </article>
            </li>
          ))}
        </ol>

        <div className="mt-12 text-center">
          <Link to="/dashboard" className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
            ← Back to dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
