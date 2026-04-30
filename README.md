# Smart Public Transport Advisor

This project combines a Python route-planning engine with a Next.js frontend to explore Hong Kong public transport journeys on a map. The sample network is loaded from CSV files in `data/`, and the website now gets stops, segments, route planning, and live ETA information directly from the Python backend instead of duplicating that logic in TypeScript.

## What it does

- loads a sample Hong Kong transport network from CSV
- finds candidate routes with depth-first search
- ranks journeys by cheapest, fastest, or fewest hops
- applies live MTR and KMB waits plus TDAS traffic adjustments in the Python backend
- visualizes stops, links, and selected journeys in the Next.js map UI

## Project layout

Python backend and CLI (root):
- `backend_api.py` serves the website data on `http://127.0.0.1:8000`
- `main.py` runs the terminal prototype
- `network.py` contains the graph model and DFS path search
- `journey.py` contains scoring, ranking, and real-time adjustments
- `file_io.py` loads and saves CSV data
- `check.py` contains live transport API helpers
- `ui.py` contains terminal UI helpers

Website frontend (`spline-ui/`):
- `spline-ui/app/page.tsx` loads the network from the Python backend
- `spline-ui/app/components/` contains the planner, ETA panel, and map
- `spline-ui/app/lib/` contains shared frontend types, backend URL helpers, and UI constants

Data:
- `data/stops.csv` stores stop IDs, names, coordinates, and available lines
- `data/segments.csv` stores directed links, modes, durations, and fares

## Run locally

1. Start the Python backend from the repo root:

```bash
python backend_api.py
```

2. Start the terminal prototype if you want the CLI:

```bash
python main.py
```

3. Start the website in `spline-ui/`:

```bash
npm install
npm run dev
```

The frontend expects the backend at `http://127.0.0.1:8000` by default. You can override that with `NEXT_PUBLIC_BACKEND_URL`.

## Run tests

The repo now includes a small `unittest` suite for the graph logic, journey ranking, file I/O, and Python backend responses.

```bash
python -m unittest discover -s tests -v
```
