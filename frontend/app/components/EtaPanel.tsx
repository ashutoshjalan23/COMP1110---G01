"use client";

import { useEffect, useState } from "react";
import { backendUrl } from "@/app/lib/backend";
import { MODE_COLORS, MODE_EMOJI } from "@/app/lib/constants";
import type { EtaEntry, EtaResponse, Stop } from "@/app/lib/types";

interface Props {
  stop: Stop | null;
  backendReady: boolean;
}

export default function EtaPanel({ stop, backendReady }: Props) {
  const [etas, setEtas] = useState<EtaEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [ts, setTs] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!stop || !backendReady) {
      setEtas([]);
      setTs("");
      setError(null);
      return;
    }

    const stopId = stop.id;
    let cancelled = false;
    setLoading(true);
    setEtas([]);
    setError(null);

    async function fetchAll() {
      try {
        const response = await fetch(backendUrl(`/eta?stopId=${encodeURIComponent(stopId)}`));
        const data: EtaResponse | { error?: string } = await response.json();
        if (!response.ok) {
          throw new Error("error" in data ? data.error : "Unable to load ETAs.");
        }
        const payload = data as EtaResponse;

        if (!cancelled) {
          setEtas(payload.entries);
          setTs(payload.timestamp);
          setLoading(false);
        }
      } catch (fetchError) {
        if (!cancelled) {
          setEtas([]);
          setTs("");
          setError(fetchError instanceof Error ? fetchError.message : "Unable to load ETAs.");
          setLoading(false);
        }
      }
    }

    fetchAll();
    const interval = setInterval(fetchAll, 30_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [backendReady, stop]);

  if (!stop) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-8 text-center">
        <div className="text-4xl mb-3 opacity-30">📡</div>
        <p className="text-xs text-white/25">Click any stop on the map<br />to see live arrivals</p>
      </div>
    );
  }

  if (!backendReady) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-8 text-center">
        <div className="text-4xl mb-3 opacity-30">📡</div>
        <p className="text-xs text-white/25">Start the Python backend<br />to see live arrivals</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-white">{stop.name}</h3>
          <div className="flex gap-1 flex-wrap mt-1">
            {stop.lines.map((line) => (
              <span
                key={line}
                className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold"
                style={{
                  background: `${MODE_COLORS[line] ?? "#fff"}22`,
                  color: MODE_COLORS[line] ?? "#aaa",
                  border: `1px solid ${MODE_COLORS[line] ?? "#aaa"}40`,
                }}
              >
                {MODE_EMOJI[line] ?? "🚌"} {line}
              </span>
            ))}
          </div>
        </div>
        {ts && <span className="text-[10px] text-white/25 flex-shrink-0">{ts}</span>}
      </div>

      {loading && (
        <div className="flex items-center gap-2 py-2">
          <span className="w-3 h-3 border border-white/20 border-t-cyan-400 rounded-full animate-spin" />
          <span className="text-xs text-white/30">Loading live data...</span>
        </div>
      )}

      {!loading && error && (
        <div className="text-xs text-rose-200 py-2 text-center rounded-xl border border-rose-500/30 bg-rose-500/10">
          {error}
        </div>
      )}

      {!loading && !error && etas.length === 0 && (
        <div className="text-xs text-white/30 py-2 text-center">
          No live ETA data available right now
        </div>
      )}

      {etas.map((entry, index) => (
        <div key={`${entry.label}-${index}`} className="px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.07]">
          <div className="text-[10px] text-white/40 mb-1.5 font-semibold uppercase tracking-wider">{entry.label}</div>
          <div className="flex gap-2 flex-wrap">
            {entry.times.map((time, timeIndex) => (
              <span
                key={`${time}-${timeIndex}`}
                className={`px-2 py-1 rounded-lg text-xs font-bold
                  ${time === "Arriving"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse"
                    : "bg-white/[0.06] text-white/80 border border-white/[0.08]"}`}
              >
                {time}
              </span>
            ))}
          </div>
        </div>
      ))}

      <div className="flex items-center gap-1 mt-1">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-[10px] text-white/25">Auto-refreshes every 30s</span>
      </div>
    </div>
  );
}
