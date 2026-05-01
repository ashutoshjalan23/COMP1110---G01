"use client";

import { useEffect, useRef } from "react";
import type { Map as LeafletMap, Polyline } from "leaflet";
import { MODE_COLORS } from "@/app/lib/constants";
import type { Journey, Segment, Stop } from "@/app/lib/types";

interface Props {
  stops: Stop[];
  segments: Segment[];
  selectedRoute: Journey | null;
  onStopClick: (stop: Stop) => void;
  originId: string | null;
  destId: string | null;
}

export default function MapClient({
  stops,
  segments,
  selectedRoute,
  onStopClick,
  originId,
  destId,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const polylinesRef = useRef<Polyline[]>([]);
  const onStopClickRef = useRef(onStopClick);
  onStopClickRef.current = onStopClick;

  useEffect(() => {
    if (!containerRef.current || mapRef.current || stops.length === 0 || segments.length === 0) {
      return;
    }

    let cancelled = false;

    import("leaflet").then((L) => {
      if (cancelled || !containerRef.current) return;
      if ((containerRef.current as { _leaflet_id?: number })._leaflet_id) return;

      delete (L.Icon.Default.prototype as { _getIconUrl?: string })._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      const map = L.map(containerRef.current, {
        center: [22.3193, 114.1694],
        zoom: 12,
        zoomControl: false,
        attributionControl: false,
      });
      mapRef.current = map;

      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        subdomains: "abcd",
        maxZoom: 19,
      }).addTo(map);

      L.control.attribution({ prefix: false, position: "bottomright" })
        .addAttribution('© <a href="https://carto.com/">CARTO</a>')
        .addTo(map);

      L.control.zoom({ position: "bottomright" }).addTo(map);

      const stopById = new Map(stops.map((stop) => [stop.id, stop]));

      for (const segment of segments) {
        const from = stopById.get(segment.fromStop);
        const to = stopById.get(segment.toStop);
        if (!from || !to) continue;

        L.polyline([[from.lat, from.lon], [to.lat, to.lon]], {
          color: MODE_COLORS[segment.mode] ?? "#888",
          weight: 2,
          opacity: 0.18,
          dashArray: segment.mode === "Ferry" ? "6 6" : undefined,
        }).addTo(map);
      }

      for (const stop of stops) {
        const icon = L.divIcon({
          className: "",
          html: `<div class="stop-marker" data-id="${stop.id}"><div class="pulse-ring"></div><div class="dot"></div></div>`,
          iconSize: [20, 20],
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
  }, [segments, stops]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    polylinesRef.current.forEach((polyline) => polyline.remove());
    polylinesRef.current = [];

    if (!selectedRoute) return;

    import("leaflet").then((L) => {
      if (!mapRef.current) return;

      const stopById = new Map(stops.map((stop) => [stop.id, stop]));

      for (const segment of selectedRoute.segments) {
        const from = stopById.get(segment.fromStop);
        const to = stopById.get(segment.toStop);
        if (!from || !to) continue;

        const color = MODE_COLORS[segment.mode] ?? "#fff";
        const coords: [number, number][] = [[from.lat, from.lon], [to.lat, to.lon]];

        polylinesRef.current.push(
          L.polyline(coords, { color, weight: 14, opacity: 0.12 }).addTo(mapRef.current)
        );
        polylinesRef.current.push(
          L.polyline(coords, {
            color,
            weight: 3.5,
            opacity: 0.95,
            dashArray: segment.mode === "Ferry" ? "8 6" : undefined,
          }).addTo(mapRef.current)
        );
      }

      if (selectedRoute.stops.length > 1) {
        const bounds = selectedRoute.stops.map((stop) => [stop.lat, stop.lon] as [number, number]);
        mapRef.current.fitBounds(bounds, { padding: [70, 70], maxZoom: 14 });
      }
    });
  }, [selectedRoute, stops]);

  useEffect(() => {
    document.querySelectorAll<HTMLElement>(".stop-marker").forEach((element) => {
      element.classList.toggle("origin", element.dataset.id === originId);
      element.classList.toggle("dest", element.dataset.id === destId);
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
