import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { severityColor } from "@/data/signals";
import type { LiveSignal } from "@/hooks/useSignals";

const TOKEN = import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN as string | undefined;

interface Props {
  signals: LiveSignal[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function MapboxWorld({ signals, selectedId, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const selectedIdRef = useRef(selectedId);
  const onSelectRef = useRef(onSelect);

  // Keep refs in sync so map handlers always see the latest values
  useEffect(() => {
    selectedIdRef.current = selectedId;
    onSelectRef.current = onSelect;
  }, [selectedId, onSelect]);

  // Initialize map once
  useEffect(() => {
    if (!TOKEN || !containerRef.current || mapRef.current) return;

    mapboxgl.accessToken = TOKEN;
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

    map.on("load", () => {
      // Source — we set features later
      map.addSource("signals", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
        cluster: true,
        clusterMaxZoom: 5,
        clusterRadius: 45,
      });

      // Cluster bubbles
      map.addLayer({
        id: "clusters",
        type: "circle",
        source: "signals",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": [
            "step",
            ["get", "point_count"],
            "#c47b50",
            5,
            "#b35d2e",
            15,
            "#8c3c12",
          ],
          "circle-radius": [
            "step",
            ["get", "point_count"],
            16,
            5,
            22,
            15,
            30,
          ],
          "circle-opacity": 0.85,
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 2,
        },
      });

      map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "signals",
        filter: ["has", "point_count"],
        layout: {
          "text-field": ["get", "point_count_abbreviated"],
          "text-font": ["DIN Pro Medium", "Arial Unicode MS Bold"],
          "text-size": 12,
        },
        paint: { "text-color": "#ffffff" },
      });

      // Individual unclustered points
      map.addLayer({
        id: "unclustered-point",
        type: "circle",
        source: "signals",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": ["get", "color"],
          "circle-radius": [
            "case",
            ["==", ["get", "id"], selectedIdRef.current],
            10,
            6,
          ],
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 2,
        },
      });

      // Click on a cluster — zoom in
      map.on("click", "clusters", (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ["clusters"] });
        const clusterId = features[0]?.properties?.cluster_id;
        const source = map.getSource("signals") as mapboxgl.GeoJSONSource;
        if (clusterId == null) return;
        source.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) return;
          const geom = features[0].geometry as GeoJSON.Point;
          map.easeTo({ center: geom.coordinates as [number, number], zoom: zoom ?? 5 });
        });
      });

      // Click an individual pin — select it
      map.on("click", "unclustered-point", (e) => {
        const id = e.features?.[0]?.properties?.id as string | undefined;
        if (id) onSelectRef.current(id);
      });

      // Hover popup on individual points
      map.on("mouseenter", "unclustered-point", (e) => {
        map.getCanvas().style.cursor = "pointer";
        const f = e.features?.[0];
        if (!f) return;
        const props = f.properties as {
          id: string;
          location: string;
          severity: string;
          status: string;
        };
        const coords = (f.geometry as GeoJSON.Point).coordinates.slice() as [number, number];
        popupRef.current?.remove();
        popupRef.current = new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: false,
          offset: 12,
          className: "atlas-popup",
        })
          .setLngLat(coords)
          .setHTML(
            `<div style="font-family:Inter,system-ui,sans-serif;min-width:180px">
              <div style="font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#7c6f63">
                ${escapeHtml(props.severity)} · ${escapeHtml(props.status)}
              </div>
              <div style="font-family:Fraunces,serif;font-size:15px;color:#23201d;margin-top:2px">
                ${escapeHtml(props.location)}
              </div>
              <a href="/dashboard?id=${encodeURIComponent(props.id)}"
                 style="display:inline-block;margin-top:6px;font-size:11px;color:#b35d2e;text-decoration:underline">
                Open in dashboard →
              </a>
            </div>`,
          )
          .addTo(map);
      });

      map.on("mouseleave", "unclustered-point", () => {
        map.getCanvas().style.cursor = "";
        popupRef.current?.remove();
        popupRef.current = null;
      });
      map.on("mouseenter", "clusters", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "clusters", () => {
        map.getCanvas().style.cursor = "";
      });
    });

    return () => {
      popupRef.current?.remove();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Sync features when signals change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const apply = () => {
      const src = map.getSource("signals") as mapboxgl.GeoJSONSource | undefined;
      if (!src) return;
      const fc: GeoJSON.FeatureCollection = {
        type: "FeatureCollection",
        features: signals.map((s) => ({
          type: "Feature",
          geometry: { type: "Point", coordinates: s.coords },
          properties: {
            id: s.id,
            location: s.location,
            severity: s.severity,
            status: s.status,
            color: severityColor[s.severity],
          },
        })),
      };
      src.setData(fc);
    };
    if (map.isStyleLoaded()) apply();
    else map.once("load", apply);
  }, [signals]);

  // Update selected pin styling + fly
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const apply = () => {
      if (map.getLayer("unclustered-point")) {
        map.setPaintProperty("unclustered-point", "circle-radius", [
          "case",
          ["==", ["get", "id"], selectedId],
          10,
          6,
        ]);
      }
      const sel = signals.find((s) => s.id === selectedId);
      if (sel) {
        map.flyTo({ center: sel.coords, zoom: Math.max(map.getZoom(), 3.2), duration: 800 });
      }
    };
    if (map.isStyleLoaded()) apply();
    else map.once("load", apply);
  }, [selectedId, signals]);

  if (!TOKEN) {
    return (
      <div className="flex h-full items-center justify-center bg-sand p-8 text-center">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-clay">Mapbox basemap</p>
          <h3 className="mt-2 font-serif text-2xl text-foreground">Map token not configured</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Add <code className="font-mono">VITE_MAPBOX_PUBLIC_TOKEN</code> as a secret to render the basemap.
          </p>
        </div>
      </div>
    );
  }

  return <div ref={containerRef} className="h-full w-full" />;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
