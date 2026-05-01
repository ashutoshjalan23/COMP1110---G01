<div align="center">

```
╔══════════════════════════════════════════════════════════════════╗
║         SMART PUBLIC TRANSPORT ADVISOR · HONG KONG              ║
║                    COMP1110 | Group G-01                        ║
╚══════════════════════════════════════════════════════════════════╝
```

**A transparent, preference-driven journey planner for Hong Kong's public transport network.**  
*Unlike black-box tools — this one shows you exactly why a route was picked.*

[![Python](https://img.shields.io/badge/Python-3.9%2B-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![HKU COMP1110](https://img.shields.io/badge/HKU-COMP1110-003087?style=flat-square)](https://hku.hk)

---

[What It Does](#what-it-does) · [Getting Started](#getting-started) · [File Structure](#file-structure) · [Data Format](#data-format) · [Testing](#testing) · [Project Timeline](#project-timeline) · [Team](#team)

</div>

---

## What It Does

The Smart Public Transport Advisor models Hong Kong's transit network as a graph of **Stops** and **Segments**, then uses **Depth-First Search** to find every possible route between an origin and destination. It ranks those routes by whichever metric you care about — cost, time, or number of transfers — and prints a full scoring breakdown so you can see exactly how every route was evaluated.

Unlike Google Maps or Citymapper, which deliver one optimal route through opaque algorithms, this system exposes all candidate routes and their trade-offs, making it a transparent, explainable planning tool.

Core features:

- DFS path search enumerating all simple paths between any two stops
- Three ranking modes: cheapest (total HKD), fastest (total minutes), fewest (number of hops)
- Multi-preference combined ranking with per-metric normalisation to `[0, 1]` and equal weighting, printed as a composite score breakdown table
- Live ETA enrichment via MTR (`rt.data.gov.hk`), KMB, and TDAS traffic APIs, with graceful fallback to static CSV times
- Stop search accepts stop ID, exact name, partial name match, or any free-text Hong Kong location geocoded to the nearest network stop
- Consecutive MTR segments counted as one hop (not penalised as a transfer)
- Results automatically saved to a timestamped file after each query
- Interactive terminal menu (Plan Journey / View Stops / Network Map / Case Studies / About)
- Next.js web frontend serving stops, segments, route planning, and live ETA from the Python backend over HTTP

---

## Getting Started

### Prerequisites

| Requirement | Version |
|---|---|
| Python | 3.9 or higher |
| Node.js | 18 or higher |
| npm | 9 or higher |

No third-party Python packages are required for the core CLI. The live ETA features in `check.py` use `requests`, which is optional — the system falls back silently if it is not installed or if APIs are unreachable.

### 1 — Clone the repository

```bash
git clone https://github.com/ashutoshjalan23/COMP1110---G01.git
cd COMP1110---G01
```

### 2 — Run the terminal CLI

```bash
python main.py
```

The program loads `data/stops.csv` and `data/segments.csv` on startup and drops you into the interactive main menu.

### 3 — Run the backend API server

```bash
python backend_api.py
```

Starts a lightweight HTTP server at `http://127.0.0.1:8000`. Keep this running while using the web frontend.

### 4 — Run the web frontend

```bash
cd spline-ui
npm install
npm run dev
```

Open `http://localhost:3000`. The frontend fetches all stops, segments, and journey data from the Python backend. To use a different backend address:

```bash
NEXT_PUBLIC_BACKEND_URL=http://your-host:port npm run dev
```

---

## File Structure

```
COMP1110---G01/
│
├── main.py              # Entry point — interactive terminal menu, all 5 views,
│                        # stop search with geocoding fallback, DFS trace display,
│                        # composite score breakdown table, result file export
│
├── network.py           # Stop and Segment data classes, adjacency list graph,
│                        # DFS path finder (find_all_paths), stop name lookup,
│                        # network summary and ASCII map rendering
│
├── journey.py           # Journey class (total_cost, total_time, adjusted_time,
│                        # num_hops), build_journeys(), rank_journeys() for single
│                        # preference, rank_journeys_multi() for combined weighted
│                        # ranking with normalised [0,1] breakdown per metric
│
├── file_io.py           # Loads stops.csv and segments.csv into the Network object,
│                        # saves ranked journey results to timestamped output files,
│                        # handles missing files, empty files, and malformed rows
│
├── check.py             # Live transport API helpers: geocode() for free-text
│                        # location search, nearby_mtr() + mtr_eta() for MTR waits,
│                        # nearby_kmb() + kmb_stop_eta() for bus waits, safe_post()
│                        # + TDAS_ROUTE for traffic speed multiplier, haversine()
│
├── ui.py                # Terminal formatting helpers: banner(), section_header(),
│                        # menu_option(), print_journey_comparison(),
│                        # print_stop_table(), print_dfs_trace(), colour constants
│
├── backend_api.py       # Lightweight HTTP server exposing /stops, /segments,
│                        # and /journey endpoints for the Next.js frontend
│
├── test_network.py      # Unit tests for Stop/Segment creation, adjacency list,
│                        # DFS on linear, branching, and cyclic graphs
│
├── test_journey.py      # Unit tests for Journey construction, single-preference
│                        # ranking, multi-preference normalisation and scoring
│
├── test_file_io.py      # Unit tests for CSV loading, missing file, empty file,
│                        # malformed rows, result export
│
├── test_backend_api.py  # Integration tests for all HTTP endpoints
│
├── data/
│   ├── stops.csv        # Stop definitions: ID, name, lat, lon, available lines
│   └── segments.csv     # Directed connections: from, to, mode, duration, cost
│
└── spline-ui/           # Next.js 14 web frontend
    ├── app/
    │   ├── page.tsx             # Root page, fetches network from backend on load
    │   └── components/
    │       ├── JourneyPlanner.tsx   # Origin / destination / preference form
    │       ├── ETAPanel.tsx         # Live arrival time display panel
    │       └── NetworkMap.tsx       # Leaflet map with stops and journey overlays
    └── lib/
        ├── types.ts             # Shared TypeScript interfaces
        ├── backendUrl.ts        # Backend URL resolution (env var or default)
        └── constants.ts         # Transport mode colours and UI constants
```

---

## Data Format

Both CSV files live in `data/` and are loaded at startup. They are plain text — editable in any spreadsheet or text editor. To model a different network, replace the file contents. No code changes are needed.

### `data/stops.csv`

```csv
id,name,latitude,longitude,available_lines
S01,Central,22.2819,114.1580,MTR-Island;MTR-Tsuen Wan
S02,Admiralty,22.2790,114.1650,MTR-Island;MTR-Tsuen Wan;MTR-South Island
```

| Column | Type | Description |
|---|---|---|
| `id` | string | Unique stop identifier used throughout the codebase (e.g. `S01`) |
| `name` | string | Human-readable stop name shown in menus and results |
| `latitude` | float | WGS-84 latitude, used for geocoding and haversine distance |
| `longitude` | float | WGS-84 longitude |
| `available_lines` | string | Semicolon-separated transit lines at this stop |

### `data/segments.csv`

```csv
seg_id,from_stop,to_stop,mode,duration,cost
SEG001,S01,S02,MTR,4,5.0
SEG002,S02,S03,Bus,12,3.0
```

| Column | Type | Description |
|---|---|---|
| `seg_id` | string | Unique segment identifier |
| `from_stop` | string | Origin stop ID |
| `to_stop` | string | Destination stop ID |
| `mode` | string | One of: `MTR`, `Bus`, `Minibus`, `Ferry`, `Tram`, `Walk` |
| `duration` | int | Static travel time in minutes (used when live APIs are unavailable) |
| `cost` | float | Fare in HKD |

---

## How the Ranking Works

### Single preference

`rank_journeys(journeys, preference)` sorts Journey objects by one key:

- `cheapest` — `journey.total_cost` (sum of all segment fares)
- `fastest` — `journey.adjusted_time` (static duration + live MTR/bus waits + traffic multiplier if `realtime=True`)
- `fewest` — `journey.num_hops` (consecutive MTR segments counted as one hop)

### Combined preferences

`rank_journeys_multi(journeys, preferences)` returns `(ranked, scores, breakdowns)`.

Each metric is normalised to `[0, 1]` across all candidate journeys, then multiplied by equal weight `1 / len(preferences)` and summed into a composite score. Lower score = better. The terminal prints a full breakdown table showing raw value, normalised value, and weighted contribution for each preference for every displayed route.

### Live ETA adjustment

When `fastest` is selected, `build_journeys(..., realtime=True)` queries:

- MTR — soonest departure in minutes from `rt.data.gov.hk` via the nearest MTR station
- Bus / Minibus — soonest KMB arrival via `kmb_stop_eta()`, plus a traffic multiplier derived from TDAS live road speed (baseline 30 km/h; clamped to `[0.5, 3.0]`)
- Ferry — fixed 5-minute boarding buffer
- Tram — fixed 2-minute boarding buffer

If any API is unreachable, the segment falls back to its static CSV duration. The user sees a warning; the program continues.

---

## Testing

```bash
# Run all tests
python -m pytest

# Run individual test files
python -m pytest test_network.py -v
python -m pytest test_journey.py -v
python -m pytest test_file_io.py -v
python -m pytest test_backend_api.py -v
```

| Test file | What it covers |
|---|---|
| `test_network.py` | Stop and Segment creation, adjacency list construction, DFS on linear / branching / cyclic graphs, unknown stop IDs |
| `test_journey.py` | Journey construction from segment lists, single-preference ranking for all three modes, multi-preference normalisation and composite score correctness |
| `test_file_io.py` | Happy-path CSV loading, missing file, empty file, malformed row skipping, timestamped result export |
| `test_backend_api.py` | `/stops`, `/segments`, `/journey` HTTP endpoints, invalid stop IDs, same origin and destination error |

---

## Case Studies

Four scenarios are built into `main.py` and runnable from the menu via option `[4]`.

| # | Scenario | Origin | Destination | Preference |
|---|---|---|---|---|
| 1 | Budget student | HKU (S11) | Sha Tin (S10) | Cheapest |
| 2 | Rush-hour commuter | Tsim Sha Tsui (S05) | Causeway Bay (S04) | Fastest |
| 3 | Tourist with luggage | Kennedy Town (S12) | Mong Kok (S07) | Fewest hops |
| 4 | Weekend explorer | North Point (S13) | Tsuen Wan (S15) | Cheapest |

Each case study runs the full DFS search, prints up to three ranked routes, and saves results to a timestamped file.

---

## Project Timeline

Six-week schedule from group registration (Mar 6) to final submission (May 2, 2026), matching the Gantt chart in the submitted Project Plan.

```
Task                               Owner   Wk 1      Wk 2      Wk 3      Wk 4      Wk 5      Wk 6
                                           Mar 17    Mar 24    Mar 31    Apr 7     Apr 14    Apr 28
──────────────────────────────────────────────────────────────────────────────────────────────────
Group formation & topic selection    PM    ████████
Literature review & tool survey      GA    ████████  ████████
Problem modeling & data model        AS              ████████  ████████
Network handling (10+ stops)         AS                        ████████
File I/O implementation              AG                        ████████  ████████
Algorithm implementation (DFS)       AS                                  ████████  ████████
Scoring & ranking module             AS                                  ████████  ████████
Menu interface & input validation    AG                                            ████████  ████████
Case study design & testing        GA+MS                                           ████████  ████████
Group final report writing           All                                                     ████████
Individual reports                   All                                                     ████████
Video demo recording                 All                                                         ████
──────────────────────────────────────────────────────────────────────────────────────────────────
                                                                                           ^ May 2
```

| Code | Member |
|---|---|
| PM | Jindal Aadi |
| GA | Gupta Akshat |
| AS | Jalan Ashutosh |
| AG | Gupta Aikagra |
| MS | Mathur Shikhar |

---

## Team

| Member | Role | Key deliverables |
|---|---|---|
| Jindal Aadi | Project Manager | Project plan, milestone tracking, group report compilation, GitHub organisation |
| Gupta Akshat | Research Lead | Tool survey, comparative analysis table, case study scenario design, research sections of group report |
| Jalan Ashutosh | Algorithm and UI | `network.py`, `journey.py`, `check.py`, live ETA integration, `spline-ui` frontend, `ui.py` |
| Gupta Aikagra | Backend and I/O | `file_io.py`, `backend_api.py`, `main.py` wiring, input validation |
| Mathur Shikhar | Testing Lead | All four test files, edge-case coverage, case study sample inputs and evaluation writeup |

---

## Academic Context

Developed for **COMP1110: Computing and Data Science in Everyday Life** at the **University of Hong Kong**, Semester 2 2025–2026 (Topic B: Smart Public Transport Advisor). The choice of DFS over Dijkstra's algorithm is intentional: guaranteed optimality is sacrificed in order to enumerate the full candidate route space and make scoring transparent to the user.

---

<div align="center">
Made in Hong Kong &nbsp;·&nbsp; HKU COMP1110 &nbsp;·&nbsp; Group G-01 &nbsp;·&nbsp; 2025–2026
</div>
