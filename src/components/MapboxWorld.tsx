import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { severityColor, type Signal } from "@/data/signals";

const TOKEN_KEY = "atlas_mapbox_token";

interface Props {
  signals: Signal[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function MapboxWorld({ signals, selectedId, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Record<string, mapboxgl.Marker>>({});
  const [token, setToken] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem(TOKEN_KEY) ?? "";
  });
  const [draftToken, setDraftToken] = useState("");

  // Initialize map once we have a token
  useEffect(() => {
    if (!token || !containerRef.current || mapRef.current) return;

    mapboxgl.accessToken = token;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [20, 15],
      zoom: 1.4,
      projection: "mercator",
      attributionControl: true,
    });
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current = {};
    };
  }, [token]);

  // Sync markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const apply = () => {
      // Remove markers no longer present
      Object.keys(markersRef.current).forEach((id) => {
        if (!signals.find((s) => s.id === id)) {
          markersRef.current[id].remove();
          delete markersRef.current[id];
        }
      });

      signals.forEach((sig) => {
        const isActive = sig.id === selectedId;
        const size = isActive ? 18 : 12;
        const color = severityColor[sig.severity];
        let marker = markersRef.current[sig.id];
        if (!marker) {
          const el = document.createElement("button");
          el.setAttribute("aria-label", `${sig.location} — ${sig.severity}`);
          el.style.cursor = "pointer";
          el.style.border = "none";
          el.style.background = "transparent";
          el.style.padding = "0";
          const dot = document.createElement("span");
          dot.className = "pulse-dot block rounded-full";
          el.appendChild(dot);
          el.addEventListener("click", (e) => {
            e.stopPropagation();
            onSelect(sig.id);
          });
          marker = new mapboxgl.Marker({ element: el, anchor: "center" })
            .setLngLat(sig.coords)
            .addTo(map);
          markersRef.current[sig.id] = marker;
        } else {
          marker.setLngLat(sig.coords);
        }
        const dot = marker.getElement().firstElementChild as HTMLElement;
        dot.style.width = `${size}px`;
        dot.style.height = `${size}px`;
        dot.style.backgroundColor = color;
        dot.style.color = color;
        dot.style.outline = isActive ? "2px solid hsl(var(--background, 0 0% 100%))" : "none";
        dot.style.outlineOffset = "2px";
        dot.style.borderRadius = "9999px";
      });
    };

    if (map.loaded()) apply();
    else map.once("load", apply);
  }, [signals, selectedId, onSelect]);

  // Fly to selected
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const sel = signals.find((s) => s.id === selectedId);
    if (!sel) return;
    map.flyTo({ center: sel.coords, zoom: Math.max(map.getZoom(), 3.2), duration: 900 });
  }, [selectedId, signals]);

  if (!token) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 bg-sand p-8 text-center">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-clay">Mapbox basemap</p>
          <h3 className="mt-2 font-serif text-2xl text-foreground">Connect a Mapbox token</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Paste your Mapbox <em>public</em> token (starts with <code className="font-mono">pk.</code>). It is stored in your browser only and used to render the basemap.
            Get one free at{" "}
            <a
              href="https://account.mapbox.com/access-tokens/"
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              account.mapbox.com
            </a>
            .
          </p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const t = draftToken.trim();
            if (!t.startsWith("pk.")) return;
            localStorage.setItem(TOKEN_KEY, t);
            setToken(t);
          }}
          className="flex w-full max-w-md gap-2"
        >
          <input
            type="text"
            value={draftToken}
            onChange={(e) => setDraftToken(e.target.value)}
            placeholder="pk.eyJ1Ijoi..."
            className="flex-1 rounded-full border border-border bg-background px-4 py-2 text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-clay/40"
          />
          <button
            type="submit"
            className="rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background hover:opacity-90"
          >
            Load map
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />
      <button
        onClick={() => {
          localStorage.removeItem(TOKEN_KEY);
          setToken("");
          setDraftToken("");
        }}
        className="absolute bottom-3 right-3 rounded-full bg-background/80 px-3 py-1 text-[10px] uppercase tracking-widest text-muted-foreground backdrop-blur hover:text-foreground"
      >
        Reset token
      </button>
    </div>
  );
}
