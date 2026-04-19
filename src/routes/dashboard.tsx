import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { severityColor } from "@/data/signals";
import { useAllSignals, useAllInterventions, type LiveSignal } from "@/hooks/useSignals";
import { SeverityBadge } from "@/components/SeverityBadge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { fakeAmoyTxHash, amoyTxUrl, shortHash } from "@/lib/onchain";
import { z } from "zod";

const searchSchema = z.object({ id: z.string().optional() });

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Intervention Dashboard — Atlas Sanctum" },
      { name: "description", content: "AI-recommended interventions matched to actors and funding pools." },
    ],
  }),
  validateSearch: searchSchema,
  component: Dashboard,
});

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending review",
  approved: "Approved · awaiting funding",
  funded: "Funded · on-chain",
  rejected: "Rejected",
};

function Dashboard() {
  const { id } = Route.useSearch();
  const navigate = useNavigate();
  const { user, isNgoMember, loading } = useAuth();
  const signals = useAllSignals();
  const interventions = useAllInterventions();
  const initial = signals.find((s) => s.id === id) ?? signals[0];
  const [selectedId, setSelectedId] = useState(initial.id);
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const selected: LiveSignal = signals.find((s) => s.id === selectedId) ?? signals[0];
  const intervention = interventions[selected.id];
  const sorted = [...signals].sort((a, b) => b.severityScore - a.severityScore);

  async function approve(sig: LiveSignal) {
    if (!user) return navigate({ to: "/auth" });
    setErr(null);
    setBusy(`approve-${sig.id}`);
    const { error } = await supabase
      .from("signals")
      .update({ status: "approved", approved_by: user.id, approved_at: new Date().toISOString() })
      .eq("id", sig.id);
    setBusy(null);
    if (error) setErr(error.message);
  }

  async function fund(sig: LiveSignal) {
    if (!user) return navigate({ to: "/auth" });
    setErr(null);
    setBusy(`fund-${sig.id}`);
    const txHash = fakeAmoyTxHash(sig.id);
    const { error } = await supabase
      .from("signals")
      .update({
        status: "funded",
        funded_by: user.id,
        funded_at: new Date().toISOString(),
        tx_hash: txHash,
      })
      .eq("id", sig.id);
    setBusy(null);
    if (error) setErr(error.message);
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <p className="text-xs uppercase tracking-[0.2em] text-clay">Layers 03 + 04 · Discernment & Coordination</p>
        <h1 className="mt-2 font-serif text-4xl text-foreground md:text-5xl">Intervention dashboard</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Each signal is paired with a recommended action and a matched actor. NGO members triage signals from
          pending → approved → funded. Funded interventions settle on Polygon Amoy.
        </p>

        {!loading && !user && (
          <div className="mt-6 rounded-2xl border border-clay/30 bg-gradient-dawn p-5 text-sm">
            <strong className="text-foreground">View-only mode.</strong>{" "}
            <span className="text-muted-foreground">
              <Link to="/auth" className="underline underline-offset-4 hover:text-foreground">
                Sign in as an NGO
              </Link>{" "}
              to approve and fund interventions.
            </span>
          </div>
        )}

        {!loading && user && !isNgoMember && (
          <div className="mt-6 rounded-2xl border border-border bg-muted/40 p-5 text-sm text-muted-foreground">
            Your account is not yet authorized as an NGO member. Approval actions are disabled.
          </div>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-[340px_1fr]">
          {/* Queue */}
          <div className="rounded-2xl border border-border bg-card shadow-soft">
            <div className="border-b border-border px-5 py-3 text-xs uppercase tracking-wider text-muted-foreground">
              Priority queue
            </div>
            <ul className="max-h-[640px] overflow-y-auto">
              {sorted.map((s) => {
                const active = s.id === selectedId;
                return (
                  <li key={s.id}>
                    <button
                      onClick={() => setSelectedId(s.id)}
                      className={`flex w-full flex-col gap-1 border-b border-border/60 px-5 py-4 text-left transition-colors hover:bg-muted/50 ${
                        active ? "bg-muted/70" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-foreground">{s.location}</span>
                        <span className="font-mono text-xs" style={{ color: severityColor[s.severity] }}>
                          {s.severityScore.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="capitalize">{s.type} · {s.region}</span>
                        <StatusPill status={s.status} />
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Detail */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-7 shadow-soft">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">{selected.region} · {selected.reportedAt}</p>
                  <h2 className="mt-1 font-serif text-3xl text-foreground">{selected.location}</h2>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <SeverityBadge severity={selected.severity} />
                  <StatusPill status={selected.status} />
                </div>
              </div>
              <p className="mt-4 text-foreground/80">{selected.summary}</p>

              <div className="mt-6 grid grid-cols-3 gap-4 border-t border-border pt-5 text-sm">
                <Stat label="Affected" value={selected.affected.toLocaleString()} />
                <Stat label="Severity" value={selected.severityScore.toFixed(2)} />
                <Stat label="Source" value={selected.source} capitalize />
              </div>

              {selected.txHash && (
                <div className="mt-5 rounded-xl border border-olive/30 bg-olive/5 p-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-1.5 uppercase tracking-wider text-olive">
                      <span className="h-1.5 w-1.5 rounded-full bg-olive" />
                      Verified on Polygonscan
                    </span>
                    <a
                      href={amoyTxUrl(selected.txHash)}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-foreground underline underline-offset-2 hover:text-clay"
                    >
                      {shortHash(selected.txHash)} ↗
                    </a>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-clay/30 bg-gradient-dawn p-7 shadow-warm">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-clay">
                <span className="h-1.5 w-1.5 rounded-full bg-clay" />
                Discernment engine recommends
              </div>
              <h3 className="mt-3 font-serif text-2xl text-foreground">{intervention.recommendedAction}</h3>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Field label="Matched actor" value={intervention.matchedActor} />
                <Field label="Funding source" value={intervention.fundingSource} />
                <Field label="Estimated cost" value={`$${intervention.estimatedCost.toLocaleString()}`} />
                <Field label="Execution time" value={`${intervention.executionDays} days`} />
              </div>

              <div className="mt-6 rounded-xl border border-border bg-card/60 p-4">
                <div className="flex items-center justify-between text-xs uppercase tracking-wider text-muted-foreground">
                  <span>Projected impact</span>
                  <span className="font-mono text-foreground">{intervention.impactScore.toFixed(2)}</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-gradient-warm transition-all"
                    style={{ width: `${intervention.impactScore * 100}%` }}
                  />
                </div>
              </div>

              {err && (
                <div className="mt-5 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                  {err}
                </div>
              )}

              <div className="mt-6 flex flex-wrap items-center gap-3">
                {selected.status === "pending" && (
                  <button
                    onClick={() => approve(selected)}
                    disabled={!isNgoMember || busy === `approve-${selected.id}`}
                    className="inline-flex items-center rounded-full border border-foreground px-5 py-2 text-sm font-medium text-foreground transition-opacity hover:bg-foreground hover:text-background disabled:opacity-50"
                  >
                    {busy === `approve-${selected.id}` ? "Approving…" : "Approve signal"}
                  </button>
                )}
                {selected.status === "approved" && (
                  <button
                    onClick={() => fund(selected)}
                    disabled={!isNgoMember || busy === `fund-${selected.id}`}
                    className="inline-flex items-center rounded-full bg-foreground px-6 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    {busy === `fund-${selected.id}`
                      ? "Settling on Polygon…"
                      : `Approve & fund · $${intervention.estimatedCost.toLocaleString()}`}
                  </button>
                )}
                {selected.status === "funded" && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-olive/15 px-5 py-2 text-sm text-olive">
                    ✓ Funded — anchored on Polygon Amoy
                  </span>
                )}
                {selected.status === "rejected" && (
                  <span className="rounded-full bg-muted px-5 py-2 text-sm text-muted-foreground">Rejected</span>
                )}
                <Link to="/impact" className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
                  See past impact →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function Stat({ label, value, capitalize }: { label: string; value: string; capitalize?: boolean }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-1 text-foreground ${capitalize ? "capitalize" : ""}`}>{value}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card/70 p-4">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 font-medium text-foreground">{value}</div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const tone =
    status === "funded"
      ? "bg-olive/15 text-olive"
      : status === "approved"
        ? "bg-clay/15 text-clay"
        : status === "rejected"
          ? "bg-destructive/10 text-destructive"
          : "bg-muted text-muted-foreground";
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider ${tone}`}>
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}
