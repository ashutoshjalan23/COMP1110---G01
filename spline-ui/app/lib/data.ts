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
  mode: "MTR" | "Bus" | "Minibus" | "Ferry" | "Tram";
  duration: number;
  cost: number;
}

export const STOPS: Stop[] = [
  { id: "S01", name: "Central",       lat: 22.2819, lon: 114.1584, lines: ["MTR","Ferry","Tram","Bus"] },
  { id: "S02", name: "Admiralty",     lat: 22.2793, lon: 114.1654, lines: ["MTR","Bus"] },
  { id: "S03", name: "Wan Chai",      lat: 22.2775, lon: 114.1734, lines: ["MTR","Tram","Bus"] },
  { id: "S04", name: "Causeway Bay",  lat: 22.2802, lon: 114.1841, lines: ["MTR","Tram","Bus"] },
  { id: "S05", name: "Tsim Sha Tsui", lat: 22.2974, lon: 114.1722, lines: ["MTR","Bus","Ferry"] },
  { id: "S06", name: "Jordan",        lat: 22.3049, lon: 114.1718, lines: ["MTR","Bus","Minibus"] },
  { id: "S07", name: "Mong Kok",      lat: 22.3192, lon: 114.1694, lines: ["MTR","Bus","Minibus"] },
  { id: "S08", name: "Prince Edward", lat: 22.3245, lon: 114.1682, lines: ["MTR","Bus"] },
  { id: "S09", name: "Kowloon Tong",  lat: 22.3372, lon: 114.1762, lines: ["MTR","Bus","Minibus"] },
  { id: "S10", name: "Sha Tin",       lat: 22.3828, lon: 114.1879, lines: ["MTR","Bus","Minibus"] },
  { id: "S11", name: "HKU",           lat: 22.2840, lon: 114.1350, lines: ["MTR","Bus"] },
  { id: "S12", name: "Kennedy Town",  lat: 22.2813, lon: 114.1285, lines: ["MTR","Tram","Bus"] },
  { id: "S13", name: "North Point",   lat: 22.2913, lon: 114.2000, lines: ["MTR","Ferry","Tram","Bus"] },
  { id: "S14", name: "Quarry Bay",    lat: 22.2880, lon: 114.2090, lines: ["MTR","Bus"] },
  { id: "S15", name: "Tsuen Wan",     lat: 22.3733, lon: 114.1178, lines: ["MTR","Bus","Minibus"] },
];

export const SEGMENTS: Segment[] = [
  { segId:"SEG01", fromStop:"S01", toStop:"S02", mode:"MTR",     duration:2,  cost:5.2  },
  { segId:"SEG02", fromStop:"S02", toStop:"S01", mode:"MTR",     duration:2,  cost:5.2  },
  { segId:"SEG03", fromStop:"S02", toStop:"S03", mode:"MTR",     duration:2,  cost:5.2  },
  { segId:"SEG04", fromStop:"S03", toStop:"S02", mode:"MTR",     duration:2,  cost:5.2  },
  { segId:"SEG05", fromStop:"S03", toStop:"S04", mode:"MTR",     duration:3,  cost:5.2  },
  { segId:"SEG06", fromStop:"S04", toStop:"S03", mode:"MTR",     duration:3,  cost:5.2  },
  { segId:"SEG07", fromStop:"S01", toStop:"S05", mode:"MTR",     duration:7,  cost:11.5 },
  { segId:"SEG08", fromStop:"S05", toStop:"S01", mode:"MTR",     duration:7,  cost:11.5 },
  { segId:"SEG09", fromStop:"S05", toStop:"S06", mode:"MTR",     duration:2,  cost:4.9  },
  { segId:"SEG10", fromStop:"S06", toStop:"S05", mode:"MTR",     duration:2,  cost:4.9  },
  { segId:"SEG11", fromStop:"S06", toStop:"S07", mode:"MTR",     duration:3,  cost:4.9  },
  { segId:"SEG12", fromStop:"S07", toStop:"S06", mode:"MTR",     duration:3,  cost:4.9  },
  { segId:"SEG13", fromStop:"S07", toStop:"S08", mode:"MTR",     duration:2,  cost:4.5  },
  { segId:"SEG14", fromStop:"S08", toStop:"S07", mode:"MTR",     duration:2,  cost:4.5  },
  { segId:"SEG15", fromStop:"S08", toStop:"S09", mode:"MTR",     duration:5,  cost:6.2  },
  { segId:"SEG16", fromStop:"S09", toStop:"S08", mode:"MTR",     duration:5,  cost:6.2  },
  { segId:"SEG17", fromStop:"S09", toStop:"S10", mode:"MTR",     duration:10, cost:10.5 },
  { segId:"SEG18", fromStop:"S10", toStop:"S09", mode:"MTR",     duration:10, cost:10.5 },
  { segId:"SEG19", fromStop:"S11", toStop:"S01", mode:"MTR",     duration:4,  cost:6.0  },
  { segId:"SEG20", fromStop:"S01", toStop:"S11", mode:"MTR",     duration:4,  cost:6.0  },
  { segId:"SEG21", fromStop:"S11", toStop:"S12", mode:"MTR",     duration:3,  cost:5.2  },
  { segId:"SEG22", fromStop:"S12", toStop:"S11", mode:"MTR",     duration:3,  cost:5.2  },
  { segId:"SEG23", fromStop:"S04", toStop:"S13", mode:"MTR",     duration:4,  cost:5.8  },
  { segId:"SEG24", fromStop:"S13", toStop:"S04", mode:"MTR",     duration:4,  cost:5.8  },
  { segId:"SEG25", fromStop:"S13", toStop:"S14", mode:"MTR",     duration:3,  cost:5.2  },
  { segId:"SEG26", fromStop:"S14", toStop:"S13", mode:"MTR",     duration:3,  cost:5.2  },
  { segId:"SEG27", fromStop:"S02", toStop:"S09", mode:"MTR",     duration:12, cost:13.8 },
  { segId:"SEG28", fromStop:"S09", toStop:"S02", mode:"MTR",     duration:12, cost:13.8 },
  { segId:"SEG29", fromStop:"S01", toStop:"S05", mode:"Ferry",   duration:25, cost:3.7  },
  { segId:"SEG30", fromStop:"S05", toStop:"S01", mode:"Ferry",   duration:25, cost:3.7  },
  { segId:"SEG31", fromStop:"S13", toStop:"S05", mode:"Ferry",   duration:18, cost:4.2  },
  { segId:"SEG32", fromStop:"S05", toStop:"S13", mode:"Ferry",   duration:18, cost:4.2  },
  { segId:"SEG33", fromStop:"S12", toStop:"S01", mode:"Tram",    duration:15, cost:3.0  },
  { segId:"SEG34", fromStop:"S01", toStop:"S12", mode:"Tram",    duration:15, cost:3.0  },
  { segId:"SEG35", fromStop:"S01", toStop:"S03", mode:"Tram",    duration:10, cost:3.0  },
  { segId:"SEG36", fromStop:"S03", toStop:"S01", mode:"Tram",    duration:10, cost:3.0  },
  { segId:"SEG37", fromStop:"S03", toStop:"S04", mode:"Tram",    duration:8,  cost:3.0  },
  { segId:"SEG38", fromStop:"S04", toStop:"S03", mode:"Tram",    duration:8,  cost:3.0  },
  { segId:"SEG39", fromStop:"S04", toStop:"S13", mode:"Tram",    duration:12, cost:3.0  },
  { segId:"SEG40", fromStop:"S13", toStop:"S04", mode:"Tram",    duration:12, cost:3.0  },
  { segId:"SEG41", fromStop:"S01", toStop:"S05", mode:"Bus",     duration:30, cost:6.5  },
  { segId:"SEG42", fromStop:"S05", toStop:"S01", mode:"Bus",     duration:30, cost:6.5  },
  { segId:"SEG43", fromStop:"S05", toStop:"S07", mode:"Bus",     duration:15, cost:5.8  },
  { segId:"SEG44", fromStop:"S07", toStop:"S05", mode:"Bus",     duration:15, cost:5.8  },
  { segId:"SEG45", fromStop:"S07", toStop:"S10", mode:"Bus",     duration:25, cost:9.2  },
  { segId:"SEG46", fromStop:"S10", toStop:"S07", mode:"Bus",     duration:25, cost:9.2  },
  { segId:"SEG47", fromStop:"S07", toStop:"S15", mode:"Bus",     duration:20, cost:7.5  },
  { segId:"SEG48", fromStop:"S15", toStop:"S07", mode:"Bus",     duration:20, cost:7.5  },
  { segId:"SEG49", fromStop:"S05", toStop:"S15", mode:"Minibus", duration:35, cost:8.0  },
  { segId:"SEG50", fromStop:"S15", toStop:"S05", mode:"Minibus", duration:35, cost:8.0  },
  { segId:"SEG51", fromStop:"S09", toStop:"S10", mode:"Minibus", duration:15, cost:6.5  },
  { segId:"SEG52", fromStop:"S10", toStop:"S09", mode:"Minibus", duration:15, cost:6.5  },
  { segId:"SEG53", fromStop:"S06", toStop:"S07", mode:"Minibus", duration:5,  cost:4.5  },
  { segId:"SEG54", fromStop:"S07", toStop:"S06", mode:"Minibus", duration:5,  cost:4.5  },
];

export const STOP_MAP: Record<string, Stop> = Object.fromEntries(STOPS.map(s => [s.id, s]));

export const MODE_COLORS: Record<string, string> = {
  MTR:     "#00D4FF",
  Bus:     "#FF6B35",
  Minibus: "#FFD166",
  Ferry:   "#4CC9F0",
  Tram:    "#06D6A0",
};

export const MODE_EMOJI: Record<string, string> = {
  MTR:     "🚇",
  Bus:     "🚌",
  Minibus: "🚐",
  Ferry:   "⛴️",
  Tram:    "🚋",
};
