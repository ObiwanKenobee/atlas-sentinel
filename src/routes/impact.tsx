import { createFileRoute } from "@tanstack/react-router";
import { impactRecords } from "@/data/signals";

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
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <p className="text-xs uppercase tracking-[0.2em] text-clay">Layer 06 · Verification</p>
        <h1 className="mt-2 font-serif text-4xl text-foreground md:text-5xl">Impact feed</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Every closed intervention leaves a receipt: geo-tagged proof, measured outcomes, and a hash anchored on Polygon.
        </p>

        <ol className="mt-12 space-y-10 border-l border-border pl-6">
          {impactRecords.map((r, i) => (
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
                    <div className="text-muted-foreground">Polygon tx</div>
                    <code className="mt-0.5 inline-block rounded bg-muted px-2 py-0.5 font-mono text-foreground">
                      {r.txHash}
                    </code>
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
                    On-chain verified
                  </span>
                </footer>
              </article>
              {i === impactRecords.length - 1 && null}
            </li>
          ))}
        </ol>
      </div>
    </main>
  );
}
