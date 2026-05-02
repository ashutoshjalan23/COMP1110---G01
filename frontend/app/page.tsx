"use client";

import dynamic from "next/dynamic";
import { startTransition, useCallback, useEffect, useState } from "react";
import JourneyPanel from "./components/JourneyPanel";
import EtaPanel from "./components/EtaPanel";
import { backendUrl } from "./lib/backend";
import { MODE_LEGEND } from "./lib/constants";
import type { Journey, NetworkResponse, NetworkSummary, Segment, Stop } from "./lib/types";

const MapClient = dynamic(() => import("./components/MapClient"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#060610]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
        <span className="text-xs text-white/30">Loading map...</span>
      </div>
    </div>
  ),
});

export default function Home() {
  const [originId, setOriginId] = useState<string | null>(null);
  const [destId, setDestId] = useState<string | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<Journey | null>(null);
  const [clickedStop, setClickedStop] = useState<Stop | null>(null);
  const [etaStop, setEtaStop] = useState<Stop | null>(null);
  const [activeTab, setActiveTab] = useState<"plan" | "eta">("plan");
  const [stops, setStops] = useState<Stop[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [summary, setSummary] = useState<NetworkSummary | null>(null);
  const [networkLoading, setNetworkLoading] = useState(true);
  const [networkError, setNetworkError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadNetwork() {
      setNetworkLoading(true);
      setNetworkError(null);

      try {
        const response = await fetch(backendUrl("/network"), { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Backend returned ${response.status}`);
        }

        const data: NetworkResponse = await response.json();
        startTransition(() => {
          setStops(data.stops);
          setSegments(data.segments);
          setSummary(data.summary);
        });
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }
        setNetworkError(error instanceof Error ? error.message : "Unable to load the transport network.");
      } finally {
        if (!controller.signal.aborted) {
          setNetworkLoading(false);
        }
      }
    }

    loadNetwork();
    return () => controller.abort();
  }, []);

  const handleStopClick = useCallback((stop: Stop) => {
    setClickedStop(stop);
    setEtaStop(stop);
    setTimeout(() => setClickedStop(null), 0);
  }, []);

  const networkReady = stops.length > 0 && segments.length > 0 && !networkLoading && !networkError;
  const networkSummaryItems = [
    {
      label: networkError ? "backend" : "stops",
      value: networkError ? "issue" : networkLoading ? "..." : (summary?.numberOfStops ?? stops.length).toString(),
    },
    {
      label: "segments",
      value: networkLoading ? "..." : (summary?.numberOfSegments ?? segments.length).toString(),
    },
    {
      label: "avg min",
      value: networkLoading ? "..." : summary ? summary.averageCommuteTime.toFixed(1) : "--",
    },
    {
      label: "avg HK$",
      value: networkLoading ? "..." : summary ? summary.averageCost.toFixed(1) : "--",
    },
  ];

  return (
    <div className="h-screen flex flex-col bg-[#060610] overflow-hidden">
      <header className="flex-shrink-0 flex items-center gap-3 px-4 py-3 glass-strong border-b border-white/[0.06] z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 via-violet-500 to-pink-500 flex items-center justify-center text-base font-bold shadow-lg shadow-cyan-500/30 animate-float">
            T
          </div>
          <div>
            <div className="text-sm font-bold text-shimmer leading-none">Open Transit</div>
            <div className="text-[10px] text-white/30 leading-none">Live HK Journey Planner</div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 ml-4">
          {MODE_LEGEND.map((mode) => (
            <div key={mode.key} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06]">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: mode.color, boxShadow: `0 0 6px ${mode.color}` }}
              />
              <span className="text-[10px] text-white/50 font-medium">{mode.key}</span>
            </div>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass border border-emerald-500/20 bg-emerald-500/5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] text-emerald-400 font-semibold tracking-wide">
              {networkReady ? "PYTHON BACKEND" : "CONNECTING"}
            </span>
          </div>
          <div className="text-[11px] text-white/25 hidden lg:block">
            MTR · KMB · TDAS
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-80 flex-shrink-0 flex flex-col glass-strong border-r border-white/[0.06] z-30 animate-slide-left">
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
                {tab === "plan" ? "Plan Journey" : "Live ETAs"}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === "plan" ? (
              <JourneyPanel
                stops={stops}
                originId={originId}
                destId={destId}
                onSetOrigin={setOriginId}
                onSetDest={setDestId}
                onSelectRoute={setSelectedRoute}
                clickedStop={clickedStop}
                networkLoading={networkLoading}
                networkError={networkError}
              />
            ) : (
              <EtaPanel stop={etaStop} backendReady={networkReady} />
            )}
          </div>
        </aside>

        <main className="flex-1 relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 z-10">
            <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-cyan-500/5 blur-[100px]" />
            <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-violet-500/5 blur-[100px]" />
          </div>

          <MapClient
            stops={stops}
            segments={segments}
            selectedRoute={selectedRoute}
            onStopClick={handleStopClick}
            originId={originId}
            destId={destId}
          />

          {selectedRoute && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 animate-fade-in">
              <div className="glass-strong rounded-2xl px-5 py-3 flex items-center gap-4 border border-white/[0.08] shadow-xl">
                <div className="flex items-center gap-1.5">
                  {selectedRoute.stops.map((stop, index) => (
                    <span key={stop.id + index} className="flex items-center gap-1">
                      <span className="text-xs text-white/70 font-medium">{stop.name}</span>
                      {index < selectedRoute.stops.length - 1 && (
                        <span
                          className="text-xs font-bold"
                          style={{ color: "#00D4FF" }}
                        >
                          →
                        </span>
                      )}
                    </span>
                  ))}
                </div>
                <div className="w-px h-5 bg-white/10" />
                <div className="flex items-center gap-3 text-xs font-semibold">
                  <span className="text-emerald-400">HK${selectedRoute.totalCost.toFixed(1)}</span>
                  <span className="text-yellow-400">{selectedRoute.adjustedTime} min</span>
                  <span className="text-white/40">{selectedRoute.numHops} hops</span>
                </div>
                <button
                  onClick={() => setSelectedRoute(null)}
                  className="text-white/30 hover:text-white/70 transition-colors text-xs ml-1"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          <div className="absolute top-4 right-4 z-20">
            <div className="glass rounded-xl px-3 py-2 grid grid-cols-2 gap-x-4 gap-y-2 min-w-[11rem] text-center">
              {networkSummaryItems.map((item) => (
                <div key={item.label}>
                  <div className="text-base font-bold text-shimmer leading-none">{item.value}</div>
                  <div className="text-[10px] text-white/30">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          {!originId && networkReady && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 animate-fade-in pointer-events-none">
              <div className="glass rounded-full px-4 py-2 text-xs text-white/40 border border-white/[0.07]">
                Click any stop to begin planning your journey
              </div>
            </div>
          )}

          {(networkLoading || networkError) && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#060610]/60 backdrop-blur-sm">
              <div className="glass-strong rounded-2xl px-5 py-4 text-center max-w-sm">
                <div className="text-sm font-semibold text-white mb-1">
                  {networkLoading ? "Loading Python backend..." : "Backend unavailable"}
                </div>
                <p className="text-xs text-white/45">
                  {networkLoading
                    ? "Fetching stops and segments from the Python transport engine."
                    : networkError}
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
