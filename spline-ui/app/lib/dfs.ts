import { STOPS, SEGMENTS, STOP_MAP } from "./data";
import type { Segment, Stop } from "./data";

export interface Journey {
  segments: Segment[];
  stops: Stop[];
  totalCost: number;
  totalTime: number;     // static baseline
  adjustedTime: number;  // real-time adjusted
  numHops: number;
}

// Build adjacency list
function buildAdj(): Record<string, Segment[]> {
  const adj: Record<string, Segment[]> = {};
  for (const seg of SEGMENTS) {
    if (!adj[seg.fromStop]) adj[seg.fromStop] = [];
    adj[seg.fromStop].push(seg);
  }
  return adj;
}

const ADJ = buildAdj();

// DFS: enumerate all simple paths up to maxDepth
export function findAllPaths(
  originId: string,
  destId: string,
  maxDepth = 8
): Segment[][] {
  const allPaths: Segment[][] = [];
  const visited = new Set<string>();

  function dfs(current: string, path: Segment[]) {
    if (current === destId) {
      allPaths.push([...path]);
      return;
    }
    if (path.length >= maxDepth) return;

    visited.add(current);
    for (const seg of ADJ[current] || []) {
      if (!visited.has(seg.toStop)) {
        path.push(seg);
        dfs(seg.toStop, path);
        path.pop();
      }
    }
    visited.delete(current);
  }

  dfs(originId, []);
  return allPaths;
}

// Build Journey objects from paths, optionally applying realtime adjustments
export function buildJourneys(
  paths: Segment[][],
  realtimeAdjustments?: Record<string, number> // stopId → wait minutes
): Journey[] {
  return paths.map((segs) => {
    const stopIds = [segs[0].fromStop, ...segs.map((s) => s.toStop)];
    const stops = stopIds.map((id) => STOP_MAP[id]).filter(Boolean);
    const totalCost = segs.reduce((a, s) => a + s.cost, 0);
    const totalTime = segs.reduce((a, s) => a + s.duration, 0);

    let adjustedTime = 0;
    for (const seg of segs) {
      let t = seg.duration;
      if (realtimeAdjustments) {
        const wait = realtimeAdjustments[seg.fromStop] ?? defaultWait(seg.mode);
        t += wait;
      }
      adjustedTime += t;
    }

    return {
      segments: segs,
      stops,
      totalCost: Math.round(totalCost * 10) / 10,
      totalTime,
      adjustedTime: Math.round(adjustedTime * 10) / 10,
      numHops: segs.length,
    };
  });
}

function defaultWait(mode: string): number {
  switch (mode) {
    case "MTR":     return 3;
    case "Bus":     return 5;
    case "Minibus": return 4;
    case "Ferry":   return 8;
    case "Tram":    return 2;
    default:        return 3;
  }
}

export type Preference = "cheapest" | "fastest" | "fewest";

export function rankJourneys(journeys: Journey[], pref: Preference): Journey[] {
  return [...journeys].sort((a, b) => {
    if (pref === "cheapest") return a.totalCost - b.totalCost;
    if (pref === "fastest")  return a.adjustedTime - b.adjustedTime;
    return a.numHops - b.numHops;
  });
}
