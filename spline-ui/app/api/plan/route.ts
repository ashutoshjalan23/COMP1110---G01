import { NextRequest, NextResponse } from "next/server";
import { findAllPaths, buildJourneys, rankJourneys } from "@/app/lib/dfs";
import type { Preference } from "@/app/lib/dfs";
import { STOP_MAP } from "@/app/lib/data";

// Live MTR ETA fetch
async function fetchMtrWait(stopId: string): Promise<number> {
  const stop = STOP_MAP[stopId];
  if (!stop) return 3;
  // Use MTR API for direct line stops
  const mtrLineMap: Record<string, { line: string; code: string }> = {
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
  const mapped = mtrLineMap[stopId];
  if (!mapped) return 3;
  try {
    const r = await fetch(
      `https://rt.data.gov.hk/v1/transport/mtr/getSchedule.php?line=${mapped.line}&sta=${mapped.code}`,
      { next: { revalidate: 30 } }
    );
    if (!r.ok) return 3;
    const data = await r.json();
    if (data.status === 0) return 3;
    const stationData = data?.data?.[mapped.code] ?? {};
    const waits: number[] = [];
    for (const trains of Object.values(stationData) as any[]) {
      if (Array.isArray(trains) && trains[0]?.time) {
        const eta = trains[0].time as string;
        const etaDt = new Date(eta.replace("Z", "+00:00"));
        const mins = (etaDt.getTime() - Date.now()) / 60000;
        if (mins >= 0) waits.push(mins);
      }
    }
    return waits.length > 0 ? Math.min(...waits) : 3;
  } catch {
    return 3;
  }
}

// Live KMB wait fetch
async function fetchBusWait(stopId: string): Promise<number> {
  const stop = STOP_MAP[stopId];
  if (!stop) return 5;
  try {
    // Find nearby KMB stops
    const r = await fetch(
      `https://data.etabus.gov.hk/v1/transport/kmb/stop`,
      { next: { revalidate: 300 } }
    );
    if (!r.ok) return 5;
    const data = await r.json();
    const stops: any[] = data?.data ?? [];
    // Find closest stop within 400m
    let best: any = null;
    let bestD = Infinity;
    for (const s of stops) {
      const dlat = (parseFloat(s.lat) - stop.lat) * 111000;
      const dlon = (parseFloat(s.long) - stop.lon) * 111000 * Math.cos((stop.lat * Math.PI) / 180);
      const d = Math.sqrt(dlat * dlat + dlon * dlon);
      if (d < bestD && d < 400) { bestD = d; best = s; }
    }
    if (!best) return 5;
    const etaR = await fetch(
      `https://data.etabus.gov.hk/v1/transport/kmb/stop-eta/${best.stop}`,
      { next: { revalidate: 30 } }
    );
    if (!etaR.ok) return 5;
    const etaData = await etaR.json();
    const etas: any[] = etaData?.data ?? [];
    const waits = etas
      .map((e: any) => {
        if (!e.eta) return null;
        const mins = (new Date(e.eta).getTime() - Date.now()) / 60000;
        return mins >= 0 ? mins : null;
      })
      .filter((m): m is number => m !== null);
    return waits.length > 0 ? Math.min(...waits) : 5;
  } catch {
    return 5;
  }
}

export async function POST(req: NextRequest) {
  const { originId, destId, preference, realtime } = await req.json();

  if (!originId || !destId || !preference) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  if (!STOP_MAP[originId] || !STOP_MAP[destId]) {
    return NextResponse.json({ error: "Invalid stop IDs" }, { status: 400 });
  }
  if (originId === destId) {
    return NextResponse.json({ error: "Origin and destination must differ" }, { status: 400 });
  }

  const paths = findAllPaths(originId, destId);

  // Collect unique stop IDs from all paths
  let rtAdjustments: Record<string, number> | undefined;
  if (realtime && (preference === "fastest")) {
    const stopIds = new Set<string>();
    for (const path of paths) {
      for (const seg of path) stopIds.add(seg.fromStop);
    }
    rtAdjustments = {};
    await Promise.all(
      [...stopIds].map(async (sid) => {
        const stop = STOP_MAP[sid];
        if (!stop) return;
        const isMtr = stop.lines.includes("MTR");
        rtAdjustments![sid] = isMtr
          ? await fetchMtrWait(sid)
          : await fetchBusWait(sid);
      })
    );
  }

  const journeys = buildJourneys(paths, rtAdjustments);
  const ranked = rankJourneys(journeys, preference as Preference).slice(0, 5);

  return NextResponse.json({
    total: paths.length,
    shown: ranked.length,
    realtime: !!realtime,
    routes: ranked,
  });
}
