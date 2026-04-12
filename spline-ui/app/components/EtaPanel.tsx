"use client";

import { useEffect, useState } from "react";
import { MODE_COLORS, MODE_EMOJI } from "@/app/lib/data";
import type { Stop } from "@/app/lib/data";

interface Props {
  stop: Stop | null;
}

const MTR_LINE_MAP: Record<string, { line: string; code: string }> = {
  S01: { line: "ISL", code: "CEN" },
  S02: { line: "ISL", code: "ADM" },
  S03: { line: "ISL", code: "WAC" },
  S04: { line: "ISL", code: "CAB" },
  S05: { line: "TWL", code: "TST" },
  S06: { line: "TWL", code: "JOR" },
  S07: { line: "TWL", code: "MOK" },
  S08: { line: "TWL", code: "PRE" },
  S09: { line: "KTL", code: "KOT" },
  S10: { line: "EAL", code: "SHT" },
  S11: { line: "ISL", code: "HKU" },
  S12: { line: "ISL", code: "KET" },
  S13: { line: "ISL", code: "NOP" },
  S14: { line: "ISL", code: "QUB" },
  S15: { line: "TWL", code: "TSW" },
};

interface EtaEntry { mode: string; label: string; times: string[] }

function fmtMins(isoStr: string): string | null {
  try {
    const eta = new Date(isoStr);
    const mins = Math.round((eta.getTime() - Date.now()) / 60000);
    if (mins < -1) return null;
    if (mins <= 0) return "Arriving";
    return `${mins} min`;
  } catch { return null; }
}

export default function EtaPanel({ stop }: Props) {
  const [etas,    setEtas]    = useState<EtaEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [ts,      setTs]      = useState<string>("");

  useEffect(() => {
    if (!stop) { setEtas([]); return; }
    let cancelled = false;
    setLoading(true);
    setEtas([]);

    async function fetch_all() {
      const results: EtaEntry[] = [];

      // MTR
      const mtr = MTR_LINE_MAP[stop!.id];
      if (mtr) {
        try {
          const r = await fetch(`/api/eta/mtr?line=${mtr.line}&sta=${mtr.code}`);
          const d = await r.json();
          if (d.status !== 0) {
            const stData = d?.data?.[mtr.code] ?? {};
            for (const [dir, trains] of Object.entries(stData)) {
              if (!Array.isArray(trains)) continue;
              const times = (trains as any[])
                .map((t: any) => fmtMins(t.time))
                .filter((x): x is string => x !== null)
                .slice(0, 3);
              if (times.length) {
                results.push({ mode: "MTR", label: `MTR → ${dir}`, times });
              }
            }
          }
        } catch {}
      }

      if (!cancelled) {
        setEtas(results);
        setTs(new Date().toLocaleTimeString("en-HK", { hour: "2-digit", minute: "2-digit" }));
        setLoading(false);
      }
    }

    fetch_all();
    const interval = setInterval(fetch_all, 30_000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [stop?.id]);

  if (!stop) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-8 text-center">
        <div className="text-4xl mb-3 opacity-30">📡</div>
        <p className="text-xs text-white/25">Click any stop on the map<br />to see live arrivals</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Stop header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-white">{stop.name}</h3>
          <div className="flex gap-1 flex-wrap mt-1">
            {stop.lines.map((l) => (
              <span
                key={l}
                className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold"
                style={{ background: `${MODE_COLORS[l] ?? "#fff"}22`, color: MODE_COLORS[l] ?? "#aaa", border: `1px solid ${MODE_COLORS[l] ?? "#aaa"}40` }}
              >
                {MODE_EMOJI[l] ?? "🚌"} {l}
              </span>
            ))}
          </div>
        </div>
        {ts && <span className="text-[10px] text-white/25 flex-shrink-0">{ts}</span>}
      </div>

      {loading && (
        <div className="flex items-center gap-2 py-2">
          <span className="w-3 h-3 border border-white/20 border-t-cyan-400 rounded-full animate-spin" />
          <span className="text-xs text-white/30">Loading live data…</span>
        </div>
      )}

      {!loading && etas.length === 0 && (
        <div className="text-xs text-white/30 py-2 text-center">
          No live ETA data available right now
        </div>
      )}

      {etas.map((entry, i) => (
        <div key={i} className="px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.07]">
          <div className="text-[10px] text-white/40 mb-1.5 font-semibold uppercase tracking-wider">{entry.label}</div>
          <div className="flex gap-2 flex-wrap">
            {entry.times.map((t, j) => (
              <span
                key={j}
                className={`px-2 py-1 rounded-lg text-xs font-bold
                  ${t === "Arriving"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse"
                    : "bg-white/[0.06] text-white/80 border border-white/[0.08]"}`}
              >{t}</span>
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
