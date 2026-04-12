"use client";

import { useEffect, useRef } from "react";
import type { Map as LeafletMap } from "leaflet";
import { STOPS, SEGMENTS, MODE_COLORS } from "@/app/lib/data";
import type { Stop } from "@/app/lib/data";
import type { Journey } from "@/app/lib/dfs";

interface Props {
  selectedRoute: Journey | null;
  onStopClick: (stop: Stop) => void;
  originId: string | null;
  destId: string | null;
}

export default function MapClient({ selectedRoute, onStopClick, originId, destId }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<LeafletMap | null>(null);
  const polylinesRef = useRef<any[]>([]);
  // Keep a stable ref to onStopClick to avoid re-binding markers
  const onStopClickRef = useRef(onStopClick);
  onStopClickRef.current = onStopClick;

  // ── Initialize map once ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return;

    // cancelled flag prevents the async import callback from running
    // after the cleanup (React Strict Mode double-invoke guard)
    let cancelled = false;

    import("leaflet").then((L) => {
      if (cancelled || !containerRef.current) return;

      // Guard against "container already initialized" if HMR re-runs this
      if ((containerRef.current as any)._leaflet_id) return;

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl:       "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl:     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      const map = L.map(containerRef.current!, {
        center: [22.3193, 114.1694],
        zoom: 12,
        zoomControl: false,
        attributionControl: false,
      });
      mapRef.current = map;

      // Dark Carto tiles
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        subdomains: "abcd",
        maxZoom: 19,
      }).addTo(map);

      L.control.attribution({ prefix: false, position: "bottomright" })
        .addAttribution('© <a href="https://carto.com/">CARTO</a>')
        .addTo(map);

      L.control.zoom({ position: "bottomright" }).addTo(map);

      // Background network lines (static, drawn once)
      for (const seg of SEGMENTS) {
        const from = STOPS.find((s) => s.id === seg.fromStop);
        const to   = STOPS.find((s) => s.id === seg.toStop);
        if (!from || !to) continue;
        L.polyline([[from.lat, from.lon], [to.lat, to.lon]], {
          color: MODE_COLORS[seg.mode] ?? "#888",
          weight: 2,
          opacity: 0.18,
          dashArray: seg.mode === "Ferry" ? "6 6" : undefined,
        }).addTo(map);
      }

      // Stop markers (static, use data-id for dynamic styling)
      for (const stop of STOPS) {
        const icon = L.divIcon({
          className: "",
          html: `<div class="stop-marker" data-id="${stop.id}"><div class="pulse-ring"></div><div class="dot"></div></div>`,
          iconSize:   [20, 20],
          iconAnchor: [10, 10],
        });

        L.marker([stop.lat, stop.lon], { icon })
          .addTo(map)
          .on("click", () => onStopClickRef.current(stop))
          .bindTooltip(
            `<div class="stop-tooltip">
               <span class="stop-name">${stop.name}</span>
               <span class="stop-lines">${stop.lines.join(" · ")}</span>
             </div>`,
            { className: "leaflet-tooltip-custom", direction: "top", offset: [0, -14] }
          );
      }
    });

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Highlight selected route ────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove previous route overlays
    polylinesRef.current.forEach((p) => p.remove());
    polylinesRef.current = [];

    if (!selectedRoute) return;

    import("leaflet").then((L) => {
      if (!mapRef.current) return;
      for (const seg of selectedRoute.segments) {
        const from = STOPS.find((s) => s.id === seg.fromStop);
        const to   = STOPS.find((s) => s.id === seg.toStop);
        if (!from || !to) continue;
        const color = MODE_COLORS[seg.mode] ?? "#fff";
        const coords: [number, number][] = [[from.lat, from.lon], [to.lat, to.lon]];

        // Glow halo
        polylinesRef.current.push(
          L.polyline(coords, { color, weight: 14, opacity: 0.12 }).addTo(mapRef.current!)
        );
        // Sharp line
        polylinesRef.current.push(
          L.polyline(coords, {
            color, weight: 3.5, opacity: 0.95,
            dashArray: seg.mode === "Ferry" ? "8 6" : undefined,
          }).addTo(mapRef.current!)
        );
      }

      if (selectedRoute.stops.length > 1) {
        const bounds = selectedRoute.stops.map((s) => [s.lat, s.lon] as [number, number]);
        mapRef.current!.fitBounds(bounds, { padding: [70, 70], maxZoom: 14 });
      }
    });
  }, [selectedRoute]);

  // ── Update origin / dest marker classes via DOM ─────────────────────────────
  useEffect(() => {
    document.querySelectorAll<HTMLElement>(".stop-marker").forEach((el) => {
      el.classList.toggle("origin", el.dataset.id === originId);
      el.classList.toggle("dest",   el.dataset.id === destId);
    });
  }, [originId, destId]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ minHeight: 400 }}
    />
  );
}
