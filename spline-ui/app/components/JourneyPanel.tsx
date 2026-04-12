"use client";

import { useState, useCallback, useEffect } from "react";
import { STOPS, MODE_COLORS, MODE_EMOJI } from "@/app/lib/data";
import type { Stop } from "@/app/lib/data";
import type { Journey } from "@/app/lib/dfs";

interface Props {
  originId:      string | null;
  destId:        string | null;
  onSetOrigin:   (id: string | null) => void;
  onSetDest:     (id: string | null) => void;
  onSelectRoute: (route: Journey | null) => void;
  clickedStop:   Stop | null;
}

type Pref = "cheapest" | "fastest" | "fewest";

interface PlanResult {
  total:    number;
  shown:    number;
  realtime: boolean;
  routes:   Journey[];
}

export default function JourneyPanel({
  originId, destId, onSetOrigin, onSetDest, onSelectRoute, clickedStop,
}: Props) {
  const [pref,        setPref]        = useState<Pref>("fastest");
  const [realtime,    setRealtime]    = useState(true);
  const [loading,     setLoading]     = useState(false);
  const [result,      setResult]      = useState<PlanResult | null>(null);
  const [activeRoute, setActiveRoute] = useState<number | null>(null);
  const [assigning,   setAssigning]   = useState<"origin" | "dest" | null>("origin");

  // Handle map stop clicks via useEffect (never call setState during render)
  useEffect(() => {
    if (!clickedStop) return;
    if (assigning === "origin") {
      onSetOrigin(clickedStop.id);
      setAssigning("dest");
    } else if (assigning === "dest") {
      onSetDest(clickedStop.id);
      setAssigning(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clickedStop]);

  const originName = originId ? STOPS.find((s) => s.id === originId)?.name : null;
  const destName   = destId   ? STOPS.find((s) => s.id === destId)?.name   : null;

  const plan = useCallback(async () => {
    if (!originId || !destId) return;
    setLoading(true);
    setResult(null);
    setActiveRoute(null);
    onSelectRoute(null);
    try {
      const r = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ originId, destId, preference: pref, realtime }),
      });
      const data = await r.json();
      setResult(data);
    } catch {
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, [originId, destId, pref, realtime, onSelectRoute]);

  const selectRoute = (idx: number) => {
    setActiveRoute(idx);
    onSelectRoute(result?.routes[idx] ?? null);
  };

  const swap = () => {
    onSetOrigin(destId);
    onSetDest(originId);
    setResult(null);
    setActiveRoute(null);
    onSelectRoute(null);
  };

  const clearOrigin = () => { onSetOrigin(null); setResult(null); setActiveRoute(null); onSelectRoute(null); };
  const clearDest   = () => { onSetDest(null);   setResult(null); setActiveRoute(null); onSelectRoute(null); };

  const prefInfo: Record<Pref, { label: string; icon: string; color: string }> = {
    cheapest: { label: "Cheapest",    icon: "💰", color: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/40" },
    fastest:  { label: "Fastest",     icon: "⚡", color: "from-yellow-500/20 to-yellow-500/5 border-yellow-500/40"  },
    fewest:   { label: "Fewest hops", icon: "🎯", color: "from-violet-500/20 to-violet-500/5 border-violet-500/40" },
  };

  // Shared class for stop selector rows (div, not button, to allow inner buttons)
  const stopRowClass = (active: boolean) =>
    `flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-sm transition-all cursor-pointer select-none
     ${active
       ? "border-cyan-400/60 bg-cyan-500/10 shadow-[0_0_12px_rgba(34,211,238,0.2)]"
       : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"}`;

  return (
    <div className="flex flex-col gap-3 h-full overflow-y-auto pr-0.5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center text-sm font-bold shadow-lg shadow-cyan-500/30">
          🚦
        </div>
        <span className="font-bold text-white text-sm tracking-wide">HK Transit Planner</span>
        <div className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] text-emerald-400 font-medium">LIVE</span>
        </div>
      </div>

      {/* Origin / Dest selectors — use <div> not <button> to allow inner clear buttons */}
      <div className="relative flex flex-col gap-2">

        {/* Origin row */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setAssigning("origin")}
          onKeyDown={(e) => e.key === "Enter" && setAssigning("origin")}
          className={stopRowClass(assigning === "origin")}
        >
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${originId ? "bg-cyan-400" : "bg-white/20 border border-white/30"}`} />
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">From</span>
            <span className={originName ? "text-white font-medium truncate" : "text-white/30"}>
              {originName ?? (assigning === "origin" ? "Click a stop on the map…" : "Select origin")}
            </span>
          </div>
          {originId && (
            <button
              type="button"
              className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full text-white/30 hover:text-white/80 hover:bg-white/10 transition-all text-xs"
              onClick={(e) => { e.stopPropagation(); clearOrigin(); }}
              aria-label="Clear origin"
            >✕</button>
          )}
        </div>

        {/* Swap button */}
        <button
          type="button"
          onClick={swap}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white/80 transition-all text-xs"
          title="Swap origin and destination"
        >⇅</button>

        {/* Destination row */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setAssigning("dest")}
          onKeyDown={(e) => e.key === "Enter" && setAssigning("dest")}
          className={stopRowClass(assigning === "dest")}
        >
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${destId ? "bg-violet-400" : "bg-white/20 border border-white/30"}`} />
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">To</span>
            <span className={destName ? "text-white font-medium truncate" : "text-white/30"}>
              {destName ?? (assigning === "dest" ? "Click a stop on the map…" : "Select destination")}
            </span>
          </div>
          {destId && (
            <button
              type="button"
              className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full text-white/30 hover:text-white/80 hover:bg-white/10 transition-all text-xs"
              onClick={(e) => { e.stopPropagation(); clearDest(); }}
              aria-label="Clear destination"
            >✕</button>
          )}
        </div>
      </div>

      {/* Quick-pick stop chips */}
      <div className="flex flex-wrap gap-1">
        {STOPS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => {
              if (assigning === "origin") { onSetOrigin(s.id); setAssigning("dest"); }
              else                        { onSetDest(s.id);   setAssigning(null);   }
            }}
            className="px-2 py-1 text-[10px] rounded-lg bg-white/[0.04] border border-white/[0.08] text-white/50 hover:text-white/90 hover:border-white/20 hover:bg-white/[0.07] transition-all"
          >{s.name}</button>
        ))}
      </div>

      {/* Preference picker */}
      <div className="flex gap-1.5">
        {(["cheapest", "fastest", "fewest"] as Pref[]).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPref(p)}
            className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-all
              ${pref === p
                ? `bg-gradient-to-b ${prefInfo[p].color} text-white shadow-lg`
                : "border-white/[0.08] bg-white/[0.03] text-white/40 hover:text-white/70 hover:border-white/20"}`}
          >
            <div className="text-base leading-none mb-0.5">{prefInfo[p].icon}</div>
            {prefInfo[p].label}
          </button>
        ))}
      </div>

      {/* Realtime toggle (plain div, no nested form elements) */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setRealtime((v) => !v)}
        onKeyDown={(e) => e.key === "Enter" && setRealtime((v) => !v)}
        className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] cursor-pointer hover:bg-white/[0.05] transition-colors select-none"
      >
        <div className={`relative w-8 h-4 rounded-full transition-colors flex-shrink-0 ${realtime ? "bg-cyan-500" : "bg-white/10"}`}>
          <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform ${realtime ? "translate-x-4" : "translate-x-0.5"}`} />
        </div>
        <div>
          <div className="text-xs text-white/70 font-medium">Live traffic &amp; ETAs</div>
          <div className="text-[10px] text-white/30">Adjusts fastest times with real data</div>
        </div>
      </div>

      {/* Plan button */}
      <button
        type="button"
        onClick={plan}
        disabled={!originId || !destId || loading}
        className={`w-full py-3 rounded-xl text-sm font-bold transition-all
          ${originId && destId && !loading
            ? "bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-400 hover:to-violet-400 text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:-translate-y-0.5"
            : "bg-white/[0.05] text-white/20 cursor-not-allowed"}`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Finding routes…
          </span>
        ) : "Find Best Route →"}
      </button>

      {/* Results */}
      {result && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/40 font-medium">
              {result.total} route{result.total !== 1 ? "s" : ""} found
              {result.realtime && <span className="ml-2 text-cyan-400">· live ⚡</span>}
            </span>
            <span className="text-xs text-white/30">Top {result.shown}</span>
          </div>

          {result.routes.map((route, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => selectRoute(idx)}
              className={`text-left w-full px-3 py-3 rounded-xl border transition-all
                ${activeRoute === idx
                  ? "border-cyan-400/50 bg-cyan-500/10 shadow-[0_0_16px_rgba(34,211,238,0.15)]"
                  : "border-white/[0.07] bg-white/[0.03] hover:border-white/15 hover:bg-white/[0.05]"}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0
                  ${activeRoute === idx ? "bg-cyan-500 text-white" : "bg-white/10 text-white/50"}`}>
                  {idx + 1}
                </span>
                <div className="flex gap-1 flex-wrap">
                  {[...new Set(route.segments.map((s) => s.mode))].map((mode) => (
                    <span
                      key={mode}
                      className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold"
                      style={{
                        background: `${MODE_COLORS[mode]}22`,
                        color: MODE_COLORS[mode],
                        border: `1px solid ${MODE_COLORS[mode]}40`,
                      }}
                    >
                      {MODE_EMOJI[mode]} {mode}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 text-xs mb-2">
                <span className="text-emerald-400 font-semibold">HK${route.totalCost.toFixed(1)}</span>
                <span className="text-yellow-400 font-semibold">{route.adjustedTime} min</span>
                <span className="text-white/40">{route.numHops} hop{route.numHops !== 1 ? "s" : ""}</span>
              </div>

              <div className="flex items-center gap-1 flex-wrap">
                {route.stops.map((stop, si) => (
                  <span key={si} className="flex items-center gap-1">
                    <span className="text-[10px] text-white/60 font-medium">{stop.name}</span>
                    {si < route.stops.length - 1 && (
                      <span className="text-white/20 text-[10px]">→</span>
                    )}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!result && !loading && (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="text-3xl mb-2 opacity-40">🗺️</div>
          <p className="text-xs text-white/25">
            {!originId ? "Click a stop to set your starting point" :
             !destId   ? "Now click a stop for your destination"   :
                         "Press Find Best Route to plan your journey"}
          </p>
        </div>
      )}
    </div>
  );
}
