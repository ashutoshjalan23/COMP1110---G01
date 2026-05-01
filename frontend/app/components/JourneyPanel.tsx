"use client";

import { useCallback, useEffect, useState } from "react";
import { backendUrl } from "@/app/lib/backend";
import { MODE_COLORS, MODE_EMOJI } from "@/app/lib/constants";
import type { Journey, PlanResult, Stop } from "@/app/lib/types";

interface Props {
  stops: Stop[];
  originId: string | null;
  destId: string | null;
  onSetOrigin: (id: string | null) => void;
  onSetDest: (id: string | null) => void;
  onSelectRoute: (route: Journey | null) => void;
  clickedStop: Stop | null;
  networkLoading: boolean;
  networkError: string | null;
}

type Pref = "cheapest" | "fastest" | "fewest";

export default function JourneyPanel({
  stops,
  originId,
  destId,
  onSetOrigin,
  onSetDest,
  onSelectRoute,
  clickedStop,
  networkLoading,
  networkError,
}: Props) {
  const [pref, setPref] = useState<Pref>("fastest");
  const [realtime, setRealtime] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PlanResult | null>(null);
  const [activeRoute, setActiveRoute] = useState<number | null>(null);
  const [assigning, setAssigning] = useState<"origin" | "dest" | null>("origin");
  const [requestError, setRequestError] = useState<string | null>(null);

  useEffect(() => {
    if (!clickedStop) return;

    if (assigning === "origin") {
      onSetOrigin(clickedStop.id);
      setAssigning("dest");
    } else if (assigning === "dest") {
      onSetDest(clickedStop.id);
      setAssigning(null);
    }
  }, [assigning, clickedStop, onSetDest, onSetOrigin]);

  const originName = originId ? stops.find((stop) => stop.id === originId)?.name : null;
  const destName = destId ? stops.find((stop) => stop.id === destId)?.name : null;
  const networkReady = !networkLoading && !networkError && stops.length > 0;

  const plan = useCallback(async () => {
    if (!originId || !destId) return;

    setLoading(true);
    setResult(null);
    setRequestError(null);
    setActiveRoute(null);
    onSelectRoute(null);

    try {
      const response = await fetch(backendUrl("/plan"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ originId, destId, preference: pref, realtime }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to plan this journey.");
      }

      setResult(data);
    } catch (error) {
      setResult(null);
      setRequestError(error instanceof Error ? error.message : "Unable to reach the Python backend.");
    } finally {
      setLoading(false);
    }
  }, [destId, onSelectRoute, originId, pref, realtime]);

  const selectRoute = (index: number) => {
    setActiveRoute(index);
    onSelectRoute(result?.routes[index] ?? null);
  };

  const resetSelection = () => {
    setResult(null);
    setRequestError(null);
    setActiveRoute(null);
    onSelectRoute(null);
  };

  const swap = () => {
    onSetOrigin(destId);
    onSetDest(originId);
    resetSelection();
  };

  const clearOrigin = () => {
    onSetOrigin(null);
    resetSelection();
  };

  const clearDest = () => {
    onSetDest(null);
    resetSelection();
  };

  const prefInfo: Record<Pref, { label: string; icon: string; color: string }> = {
    cheapest: { label: "Cheapest", icon: "💰", color: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/40" },
    fastest: { label: "Fastest", icon: "⚡", color: "from-yellow-500/20 to-yellow-500/5 border-yellow-500/40" },
    fewest: { label: "Fewest hops", icon: "🎯", color: "from-violet-500/20 to-violet-500/5 border-violet-500/40" },
  };

  const stopRowClass = (active: boolean) =>
    `flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-sm transition-all cursor-pointer select-none
     ${active
       ? "border-cyan-400/60 bg-cyan-500/10 shadow-[0_0_12px_rgba(34,211,238,0.2)]"
       : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"}`;

  return (
    <div className="flex flex-col gap-3 h-full overflow-y-auto pr-0.5">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center text-sm font-bold shadow-lg shadow-cyan-500/30">
          T
        </div>
        <span className="font-bold text-white text-sm tracking-wide">Open Transit Planner</span>
        <div className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] text-emerald-400 font-medium">LIVE</span>
        </div>
      </div>

      <div className="relative flex flex-col gap-2">
        <div
          role="button"
          tabIndex={0}
          onClick={() => networkReady && setAssigning("origin")}
          onKeyDown={(event) => event.key === "Enter" && networkReady && setAssigning("origin")}
          className={stopRowClass(assigning === "origin")}
        >
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${originId ? "bg-cyan-400" : "bg-white/20 border border-white/30"}`} />
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">From</span>
            <span className={originName ? "text-white font-medium truncate" : "text-white/30"}>
              {originName ?? (
                networkLoading
                  ? "Loading backend stops..."
                  : assigning === "origin"
                    ? "Click a stop on the map..."
                    : "Select origin"
              )}
            </span>
          </div>
          {originId && (
            <button
              type="button"
              className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full text-white/30 hover:text-white/80 hover:bg-white/10 transition-all text-xs"
              onClick={(event) => {
                event.stopPropagation();
                clearOrigin();
              }}
              aria-label="Clear origin"
            >
              ✕
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={swap}
          disabled={!networkReady}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white/80 transition-all text-xs disabled:opacity-40"
          title="Swap origin and destination"
        >
          ⇄
        </button>

        <div
          role="button"
          tabIndex={0}
          onClick={() => networkReady && setAssigning("dest")}
          onKeyDown={(event) => event.key === "Enter" && networkReady && setAssigning("dest")}
          className={stopRowClass(assigning === "dest")}
        >
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${destId ? "bg-violet-400" : "bg-white/20 border border-white/30"}`} />
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">To</span>
            <span className={destName ? "text-white font-medium truncate" : "text-white/30"}>
              {destName ?? (
                networkLoading
                  ? "Loading backend stops..."
                  : assigning === "dest"
                    ? "Click a stop on the map..."
                    : "Select destination"
              )}
            </span>
          </div>
          {destId && (
            <button
              type="button"
              className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full text-white/30 hover:text-white/80 hover:bg-white/10 transition-all text-xs"
              onClick={(event) => {
                event.stopPropagation();
                clearDest();
              }}
              aria-label="Clear destination"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-1">
        {stops.map((stop) => (
          <button
            key={stop.id}
            type="button"
            disabled={!networkReady}
            onClick={() => {
              if (assigning === "origin") {
                onSetOrigin(stop.id);
                setAssigning("dest");
              } else {
                onSetDest(stop.id);
                setAssigning(null);
              }
            }}
            className="px-2 py-1 text-[10px] rounded-lg bg-white/[0.04] border border-white/[0.08] text-white/50 hover:text-white/90 hover:border-white/20 hover:bg-white/[0.07] transition-all disabled:opacity-40"
          >
            {stop.name}
          </button>
        ))}
      </div>

      <div className="flex gap-1.5">
        {(["cheapest", "fastest", "fewest"] as Pref[]).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setPref(value)}
            className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-all
              ${pref === value
                ? `bg-gradient-to-b ${prefInfo[value].color} text-white shadow-lg`
                : "border-white/[0.08] bg-white/[0.03] text-white/40 hover:text-white/70 hover:border-white/20"}`}
          >
            <div className="text-base leading-none mb-0.5">{prefInfo[value].icon}</div>
            {prefInfo[value].label}
          </button>
        ))}
      </div>

      <div
        role="button"
        tabIndex={0}
        aria-disabled={!networkReady}
        onClick={() => networkReady && setRealtime((value) => !value)}
        onKeyDown={(event) => event.key === "Enter" && networkReady && setRealtime((value) => !value)}
        className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] cursor-pointer hover:bg-white/[0.05] transition-colors select-none"
      >
        <div className={`relative w-8 h-4 rounded-full transition-colors flex-shrink-0 ${realtime ? "bg-cyan-500" : "bg-white/10"}`}>
          <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform ${realtime ? "translate-x-4" : "translate-x-0.5"}`} />
        </div>
        <div>
          <div className="text-xs text-white/70 font-medium">Live traffic and ETAs</div>
          <div className="text-[10px] text-white/30">Calculated by the Python journey engine</div>
        </div>
      </div>

      <button
        type="button"
        onClick={plan}
        disabled={!networkReady || !originId || !destId || loading}
        className={`w-full py-3 rounded-xl text-sm font-bold transition-all
          ${networkReady && originId && destId && !loading
            ? "bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-400 hover:to-violet-400 text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:-translate-y-0.5"
            : "bg-white/[0.05] text-white/20 cursor-not-allowed"}`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Finding routes...
          </span>
        ) : "Find Best Route →"}
      </button>

      {networkError && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
          {networkError}
        </div>
      )}

      {requestError && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
          {requestError}
        </div>
      )}

      {result && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/40 font-medium">
              {result.total} route{result.total !== 1 ? "s" : ""} found
              {result.realtime && <span className="ml-2 text-cyan-400">· live</span>}
            </span>
            <span className="text-xs text-white/30">Top {result.shown}</span>
          </div>

          {result.routes.map((route, index) => (
            <button
              key={`${route.totalCost}-${route.adjustedTime}-${index}`}
              type="button"
              onClick={() => selectRoute(index)}
              className={`text-left w-full px-3 py-3 rounded-xl border transition-all
                ${activeRoute === index
                  ? "border-cyan-400/50 bg-cyan-500/10 shadow-[0_0_16px_rgba(34,211,238,0.15)]"
                  : "border-white/[0.07] bg-white/[0.03] hover:border-white/15 hover:bg-white/[0.05]"}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0
                  ${activeRoute === index ? "bg-cyan-500 text-white" : "bg-white/10 text-white/50"}`}>
                  {index + 1}
                </span>
                <div className="flex gap-1 flex-wrap">
                  {[...new Set(route.segments.map((segment) => segment.mode))].map((mode) => (
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
                {route.stops.map((stop, stopIndex) => (
                  <span key={`${stop.id}-${stopIndex}`} className="flex items-center gap-1">
                    <span className="text-[10px] text-white/60 font-medium">{stop.name}</span>
                    {stopIndex < route.stops.length - 1 && (
                      <span className="text-white/20 text-[10px]">→</span>
                    )}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      )}

      {!result && !loading && !networkError && (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="text-3xl mb-2 opacity-40">🗺️</div>
          <p className="text-xs text-white/25">
            {networkLoading
              ? "Loading stops from the Python backend"
              : !originId
                ? "Click a stop to set your starting point"
                : !destId
                  ? "Now click a stop for your destination"
                  : "Press Find Best Route to plan your journey"}
          </p>
        </div>
      )}
    </div>
  );
}
