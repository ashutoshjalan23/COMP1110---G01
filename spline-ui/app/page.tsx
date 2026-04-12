"use client";

import dynamic from "next/dynamic";
import { useState, useCallback } from "react";
import JourneyPanel from "./components/JourneyPanel";
import EtaPanel from "./components/EtaPanel";
import type { Stop } from "./lib/data";
import type { Journey } from "./lib/dfs";

// Leaflet must be client-only
const MapClient = dynamic(() => import("./components/MapClient"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#060610]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
        <span className="text-xs text-white/30">Loading map…</span>
      </div>
    </div>
  ),
});

const MODES = [
  { key: "MTR",     color: "#00D4FF", emoji: "🚇" },
  { key: "Bus",     color: "#FF6B35", emoji: "🚌" },
  { key: "Minibus", color: "#FFD166", emoji: "🚐" },
  { key: "Ferry",   color: "#4CC9F0", emoji: "⛴️" },
  { key: "Tram",    color: "#06D6A0", emoji: "🚋" },
];

export default function Home() {
  const [originId,      setOriginId]      = useState<string | null>(null);
  const [destId,        setDestId]        = useState<string | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<Journey | null>(null);
  const [clickedStop,   setClickedStop]   = useState<Stop | null>(null);
  const [etaStop,       setEtaStop]       = useState<Stop | null>(null);
  const [activeTab,     setActiveTab]     = useState<"plan" | "eta">("plan");

  const handleStopClick = useCallback((stop: Stop) => {
    setClickedStop(stop);
    setEtaStop(stop);
    // Reset clickedStop after one tick so JourneyPanel can handle it
    setTimeout(() => setClickedStop(null), 0);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-[#060610] overflow-hidden">
      {/* ── Top bar ───────────────────────────────────────────────────────── */}
      <header className="flex-shrink-0 flex items-center gap-3 px-4 py-3 glass-strong border-b border-white/[0.06] z-40">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 via-violet-500 to-pink-500 flex items-center justify-center text-base shadow-lg shadow-cyan-500/30 animate-float">
            🚦
          </div>
          <div>
            <div className="text-sm font-bold text-shimmer leading-none">HK Transit</div>
            <div className="text-[10px] text-white/30 leading-none">Live Journey Planner</div>
          </div>
        </div>

        {/* Mode legend */}
        <div className="hidden md:flex items-center gap-2 ml-4">
          {MODES.map((m) => (
            <div key={m.key} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06]">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: m.color, boxShadow: `0 0 6px ${m.color}` }}
              />
              <span className="text-[10px] text-white/50 font-medium">{m.key}</span>
            </div>
          ))}
        </div>

        {/* Live badge */}
        <div className="ml-auto flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass border border-emerald-500/20 bg-emerald-500/5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] text-emerald-400 font-semibold tracking-wide">LIVE DATA</span>
          </div>
          <div className="text-[11px] text-white/25 hidden lg:block">
            KMB · MTR · CTB · TDAS
          </div>
        </div>
      </header>

      {/* ── Main layout ───────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* ── Left panel ──────────────────────────────────────────────────── */}
        <aside className="w-80 flex-shrink-0 flex flex-col glass-strong border-r border-white/[0.06] z-30 animate-slide-left">
          {/* Tabs */}
          <div className="flex border-b border-white/[0.06] flex-shrink-0">
            {(["plan", "eta"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-xs font-semibold transition-all
                  ${activeTab === tab
                    ? "text-cyan-400 border-b-2 border-cyan-400 bg-cyan-500/5"
                    : "text-white/30 hover:text-white/60"}`}
              >
                {tab === "plan" ? "🗺️ Plan Journey" : "📡 Live ETAs"}
              </button>
            ))}
          </div>

          {/* Panel content */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === "plan" ? (
              <JourneyPanel
                originId={originId}
                destId={destId}
                onSetOrigin={setOriginId}
                onSetDest={setDestId}
                onSelectRoute={setSelectedRoute}
                clickedStop={clickedStop}
              />
            ) : (
              <EtaPanel stop={etaStop} />
            )}
          </div>
        </aside>

        {/* ── Map ─────────────────────────────────────────────────────────── */}
        <main className="flex-1 relative overflow-hidden">
          {/* Ambient glow */}
          <div className="pointer-events-none absolute inset-0 z-10">
            <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-cyan-500/5 blur-[100px]" />
            <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-violet-500/5 blur-[100px]" />
          </div>

          <MapClient
            selectedRoute={selectedRoute}
            onStopClick={handleStopClick}
            originId={originId}
            destId={destId}
          />

          {/* Bottom route summary bar */}
          {selectedRoute && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 animate-fade-in">
              <div className="glass-strong rounded-2xl px-5 py-3 flex items-center gap-4 border border-white/[0.08] shadow-xl">
                <div className="flex items-center gap-1.5">
                  {selectedRoute.stops.map((s, i) => (
                    <span key={i} className="flex items-center gap-1">
                      <span className="text-xs text-white/70 font-medium">{s.name}</span>
                      {i < selectedRoute.stops.length - 1 && (
                        <span
                          className="text-xs font-bold"
                          style={{ color: "#00D4FF" }}
                        >→</span>
                      )}
                    </span>
                  ))}
                </div>
                <div className="w-px h-5 bg-white/10" />
                <div className="flex items-center gap-3 text-xs font-semibold">
                  <span className="text-emerald-400">HK${selectedRoute.totalCost.toFixed(1)}</span>
                  <span className="text-yellow-400">⚡ {selectedRoute.adjustedTime} min</span>
                  <span className="text-white/40">{selectedRoute.numHops} hops</span>
                </div>
                <button
                  onClick={() => setSelectedRoute(null)}
                  className="text-white/30 hover:text-white/70 transition-colors text-xs ml-1"
                >✕</button>
              </div>
            </div>
          )}

          {/* Stop count badge */}
          <div className="absolute top-4 right-4 z-20">
            <div className="glass rounded-xl px-3 py-2 text-center">
              <div className="text-lg font-bold text-shimmer leading-none">15</div>
              <div className="text-[10px] text-white/30">stops</div>
            </div>
          </div>

          {/* Click hint */}
          {!originId && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 animate-fade-in pointer-events-none">
              <div className="glass rounded-full px-4 py-2 text-xs text-white/40 border border-white/[0.07]">
                Click any stop to begin planning your journey
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
