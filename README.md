# Smart Public Transport Advisor

Topic B project for COMP1110, Semester 2 2025-2026.

This project models Hong Kong public transport as a graph of stops and directed travel segments. It loads a hand-crafted CSV network, accepts an origin, destination, and preference mode, generates candidate journeys with depth-limited DFS, then ranks them by cheapest, fastest, or fewest hops.

## Language And Environment

- Main program: Python 3.12
- Python dependency for optional live ETA helpers: `requests`
- Optional visual frontend: Next.js in `frontend/`
- Persistent data files: CSV files in `data/`

Install the Python dependency:

```bash
python -m pip install -r requirements.txt
```

## Project Layout

- `main.py`: terminal menu for journey planning, stop listing, network summary, and case studies
- `network.py`: `Stop`, `Segment`, and `Network` graph classes plus DFS path search
- `journey.py`: journey totals, hop counting, single and combined preference ranking, optional live-time adjustment helpers
- `file_io.py`: CSV loading/saving with validation for missing, empty, malformed, and inconsistent files
- `ui.py`: terminal display helpers
- `check.py`: optional live transport API helper functions
- `backend_api.py`: small HTTP API used by the optional frontend
- `data/stops.csv`: stop IDs, names, coordinates, and available transport lines
- `data/segments.csv`: directed connections with mode, duration, and cost
- `tests/`: unit and stress tests for graph, ranking, file I/O, backend, and edge cases
- `frontend/`: optional Next.js map interface

## CSV Format

`data/stops.csv`

```csv
id,name,latitude,longitude,lines
S01,Central,22.2819,114.1584,MTR;Ferry;Tram;Bus
```

`data/segments.csv`

```csv
seg_id,from_stop,to_stop,mode,duration,cost
SEG01,S01,S02,MTR,2,5.2
```

Each segment is directed and must reference existing stop IDs. Duration is in minutes and cost is in HKD. Empty files, missing columns, duplicate IDs, non-numeric durations/costs, negative values, and unknown stop references are reported as clear data-format errors.

## Run The Terminal Program

```bash
python main.py
```

Menu options include:

- plan a journey
- view all stops
- view a text network map
- run four built-in case studies
- show help/about

## Run The Backend

```bash
python backend_api.py
```

The backend runs at `http://127.0.0.1:8000` by default and exposes:

- `GET /health`
- `GET /network`
- `GET /eta?stopId=S01`
- `POST /plan`

## Run The Optional Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The frontend uses `NEXT_PUBLIC_BACKEND_URL` if set, otherwise `http://127.0.0.1:8000`.

## Run Tests

```bash
python -m unittest discover -s tests -v
```

Optional frontend checks:

```bash
cd frontend
npm run lint
npm run build
```

## Topic B Coverage

- Network data model: 15 stops and 54 directed segments in CSV, exceeding the minimum of 10 stops and 20 segments.
- Text menu: implemented in `main.py`.
- Input validation: unknown stops, same origin/destination, invalid menu choices, invalid preferences, malformed CSV data, empty files, and missing files are handled.
- File I/O: network CSV loading and journey result saving are implemented in `file_io.py`.
- Candidate generation: DFS with a configurable depth limit in `network.py`.
- Scoring/ranking: total cost, total duration, and hop count in `journey.py`.
- Case studies: four built-in scenarios are available through the terminal menu and documented in `CASE_STUDIES.md`.
- Test data: unit tests plus an all-origin/destination stress test are in `tests/`.

