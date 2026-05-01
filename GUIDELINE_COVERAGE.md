# COMP1110 Guideline Coverage

Source checked: `COMP1110 Project Guidelines`, Version 1.2, Feb 27, 2026.

## Selected Topic

Topic B: Smart Public Transport Advisor.

## Code Checklist

| Requirement | Status | Evidence |
| --- | --- | --- |
| Define stop, segment, cost, duration, journey, preference mode | Covered | `network.py`, `journey.py`, `README.md` |
| Minimum 10 stops and 20 segments | Covered | `data/stops.csv` has 15 stops; `data/segments.csv` has 54 directed segments |
| Text menu with list stops, query journeys, summary/map, load data, exit | Covered | `main.py` menu options |
| Input validation for unknown stops, same origin/destination, invalid preference | Covered | `main.py`, `backend_api.py`, `journey.py`, stress tests |
| Load network from text files | Covered | `file_io.py`, `data/*.csv` |
| Handle missing, empty, malformed files gracefully | Covered | `file_io.py`, `tests/test_guideline_edge_cases.py` |
| Candidate journey generation | Covered | DFS in `network.py` |
| Scoring and ranking by cheapest, fastest, fewest segments/hops | Covered | `journey.py` |
| Output top journeys with cost/time/hop breakdown | Covered | `main.py`, `file_io.py`, `backend_api.py` |
| Sample test cases and edge cases | Covered | `tests/`, including all-origin/destination stress test |
| README with language, setup, file purpose, run instructions, CSV format | Covered | `README.md` |

## Unique Feature: Live Transport Data

The guideline only requires a small hand-crafted network and static route ranking, but this project adds a useful real-world extension: live transport data is folded into journey planning while keeping the static CSV model as the reproducible baseline.

- Live MTR and KMB ETA helpers are implemented in `check.py`.
- Fastest-route scoring can include live wait times and TDAS traffic multipliers through `journey.py` and `backend_api.py`.
- The web frontend exposes live arrivals in `frontend/app/components/EtaPanel.tsx`.
- If external APIs are unavailable, the system falls back to static timing assumptions, so the core guideline-required journey planner still works.

This strengthens the Topic B emphasis on transport trade-offs because the system can compare not only static cost, duration, and hops, but also current waiting time and traffic conditions.

## Report And Submission Items To Verify Outside Code

These are required by the project guidelines but cannot be fully verified from the code repository alone:

- public GitHub repository link included in the Group Final Report
- Project Plan with task breakdown, roles, existing tool summary, and timeline
- Group Final Report with research comparison, modeling explanation, case-study outputs, evaluation, limitations, and future work
- Individual Final Reports with each member's contribution and AI-use disclosure
- short video demo showing at least one full case-study workflow
- tutorial attendance requirements

