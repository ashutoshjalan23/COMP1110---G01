export type Mode = "MTR" | "Bus" | "Minibus" | "Ferry" | "Tram";

export interface Stop {
  id: string;
  name: string;
  lat: number;
  lon: number;
  lines: string[];
}

export interface Segment {
  segId: string;
  fromStop: string;
  toStop: string;
  mode: Mode;
  duration: number;
  cost: number;
}

export interface Journey {
  segments: Segment[];
  stops: Stop[];
  totalCost: number;
  totalTime: number;
  adjustedTime: number;
  numHops: number;
}

export interface PlanResult {
  total: number;
  shown: number;
  realtime: boolean;
  routes: Journey[];
}

export interface EtaEntry {
  mode: string;
  label: string;
  times: string[];
}

export interface EtaResponse {
  stopId: string;
  timestamp: string;
  entries: EtaEntry[];
}

export interface NetworkSummary {
  numberOfStops: number;
  numberOfSegments: number;
  averageCommuteTime: number;
  averageCost: number;
}

export interface NetworkResponse {
  stops: Stop[];
  segments: Segment[];
  summary: NetworkSummary;
}
