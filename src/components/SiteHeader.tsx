import { Link } from "@tanstack/react-router";

const links = [
  { to: "/", label: "Home" },
  { to: "/map", label: "Live Map" },
  { to: "/dashboard", label: "Interventions" },
  { to: "/impact", label: "Impact Feed" },
  { to: "/report", label: "Submit Report" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-clay opacity-60 group-hover:animate-ping" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-clay" />
          </span>
          <span className="font-serif text-xl tracking-tight text-foreground">
            Atlas <span className="text-clay">Sanctum</span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/60"
              activeProps={{ className: "rounded-md px-3 py-1.5 text-sm bg-muted text-foreground font-medium" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <Link
          to="/map"
          className="hidden md:inline-flex items-center rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
          Open dashboard →
        </Link>
      </div>
    </header>
  );
}
