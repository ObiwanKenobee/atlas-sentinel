import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth, signOut } from "@/hooks/useAuth";

const links = [
  { to: "/", label: "Home" },
  { to: "/map", label: "Live Map" },
  { to: "/dashboard", label: "Interventions" },
  { to: "/impact", label: "Impact Feed" },
  { to: "/report", label: "Submit Report" },
] as const;

export function SiteHeader() {
  const { user, isNgoMember } = useAuth();
  const navigate = useNavigate();

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
              className="rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              activeProps={{ className: "rounded-full px-3 py-1.5 text-sm bg-muted text-foreground" }}
            >
              {l.label}
            </Link>
          ))}
          {user ? (
            <div className="ml-3 flex items-center gap-2 border-l border-border pl-3">
              <span className="text-xs text-muted-foreground">
                {isNgoMember && (
                  <span className="mr-1.5 rounded-full bg-olive/15 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-olive">
                    NGO
                  </span>
                )}
                {user.email}
              </span>
              <button
                onClick={async () => {
                  await signOut();
                  navigate({ to: "/" });
                }}
                className="rounded-full px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              className="ml-3 rounded-full bg-foreground px-3.5 py-1.5 text-xs font-medium text-background hover:opacity-90"
            >
              NGO sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
