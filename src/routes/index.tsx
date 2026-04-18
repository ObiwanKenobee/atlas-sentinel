import { createFileRoute, Link } from "@tanstack/react-router";
import heroImage from "@/assets/hero-village.jpg";
import { signals } from "@/data/signals";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Atlas Sanctum — See the world's suffering. Respond." },
      {
        name: "description",
        content:
          "A living atlas that turns scattered signals of suffering into clear, fundable, verifiable interventions.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const critical = signals.filter((s) => s.severity === "critical").length;
  const totalAffected = signals.reduce((sum, s) => sum + s.affected, 0);

  return (
    <main className="bg-background">
      {/* HERO */}
      <section className="relative isolate overflow-hidden">
        <img
          src={heroImage}
          alt="Aerial view of a village at golden hour"
          width={1920}
          height={1080}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="relative mx-auto max-w-7xl px-6 pt-28 pb-32 md:pt-40 md:pb-48">
          <p className="fade-up text-xs uppercase tracking-[0.25em] text-background/80">
            A living atlas
          </p>
          <h1 className="fade-up mt-5 max-w-3xl font-serif text-5xl leading-[1.05] text-background md:text-7xl">
            See the world's suffering.<br />
            <span className="italic text-background/85">Respond with discernment.</span>
          </h1>
          <p className="fade-up mt-6 max-w-xl text-lg text-background/85">
            Atlas Sanctum gathers signals from communities, satellites, and sensors — then
            recommends what should actually be done, by whom, and at what cost.
          </p>
          <div className="fade-up mt-10 flex flex-wrap items-center gap-3">
            <Link
              to="/map"
              className="inline-flex items-center rounded-full bg-background px-6 py-3 text-sm font-medium text-foreground shadow-warm transition-transform hover:scale-[1.02]"
            >
              Open the live map →
            </Link>
            <Link
              to="/impact"
              className="inline-flex items-center rounded-full border border-background/40 px-6 py-3 text-sm font-medium text-background backdrop-blur-sm transition-colors hover:bg-background/10"
            >
              See verified impact
            </Link>
          </div>
        </div>
      </section>

      {/* STAT BAND */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px bg-border md:grid-cols-4">
          {[
            { k: signals.length.toString(), v: "Active signals" },
            { k: critical.toString(), v: "Critical right now" },
            { k: totalAffected.toLocaleString(), v: "People affected" },
            { k: "7", v: "Verified interventions" },
          ].map((s) => (
            <div key={s.v} className="bg-card p-8">
              <div className="font-serif text-4xl text-foreground">{s.k}</div>
              <div className="mt-1 text-sm text-muted-foreground">{s.v}</div>
            </div>
          ))}
        </div>
      </section>

      {/* THE FIVE LAYERS */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.2em] text-clay">The architecture of response</p>
          <h2 className="mt-4 font-serif text-4xl text-foreground md:text-5xl">
            From signal to verified impact, in one continuous loop.
          </h2>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              n: "01",
              t: "Ingest",
              d: "Community reports, satellite feeds, and edge sensors flow into a single timeline.",
            },
            {
              n: "02",
              t: "Detect",
              d: "AI classifies each signal — water, health, climate, food, infrastructure — and scores urgency.",
            },
            {
              n: "03",
              t: "Discern",
              d: "Severity, population, cost, and context combine into a recommended action.",
            },
            {
              n: "04",
              t: "Coordinate",
              d: "Need is matched to the closest capable actor and a ready funding pool.",
            },
            {
              n: "05",
              t: "Verify",
              d: "Geo-tagged proof and on-chain records turn promises into receipts.",
            },
            {
              n: "06",
              t: "Reflect",
              d: "Every closed loop teaches the next response. The atlas grows wiser.",
            },
          ].map((step) => (
            <div
              key={step.n}
              className="group rounded-2xl border border-border bg-card p-7 shadow-soft transition-all hover:shadow-warm hover:-translate-y-0.5"
            >
              <div className="font-serif text-sm text-clay">{step.n}</div>
              <h3 className="mt-3 font-serif text-2xl text-foreground">{step.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-dawn">
        <div className="mx-auto max-w-7xl px-6 py-24 text-center">
          <h2 className="mx-auto max-w-3xl font-serif text-4xl text-foreground md:text-5xl">
            The world doesn't lack compassion. It lacks coordination.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-muted-foreground">
            Atlas Sanctum is the connective tissue between those who see and those who can act.
          </p>
          <Link
            to="/dashboard"
            className="mt-10 inline-flex items-center rounded-full bg-foreground px-7 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            Step inside the dashboard →
          </Link>
        </div>
      </section>

      <footer className="border-t border-border bg-background">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-3 px-6 py-8 text-sm text-muted-foreground md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} Atlas Sanctum. A living atlas.</p>
          <p className="font-serif italic">Discern. Coordinate. Verify.</p>
        </div>
      </footer>
    </main>
  );
}
