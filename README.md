# Smart Public Transport Advisor

This repository is currently an early-stage Next.js prototype for a Hong Kong public transport visualizer.
We want to build a website that uses Hong Kong Government transport data to help users explore and compare route options clearly and transparently.

Right now, this project should be treated as roughly 10% complete.

## Current state

What exists today:

- a Python prototype for route search
- a small sample CSV dataset
- basic scoring for cheapest, fastest, and fewest segments
- an early Next.js website visualizer with a map, controls, and route results

## Project direction

The goal is to gather official Hong Kong transport data and turn it into a smart advisor that can:

- compare route options
- explain trade-offs between time, cost, and transfers
- surface more practical travel suggestions over time

## Files

Python prototype (root):
- `main.py` contains the terminal prototype entry point
- `network.py` contains the graph model and DFS search
- `journey.py` contains journey scoring and ranking
- `file_io.py` loads and saves CSV data
- `ui.py` contains terminal UI helpers
- `check.py` contains validation utilities
- `dashboard.html` contains a web dashboard
- `data/` holds the sample development dataset (CSV files and results)

Next.js website (in `spline-ui/`):
- `spline-ui/app/` contains the main Next.js App Router pages and API routes
- `spline-ui/app/components/` contains React UI components (map, panels, etc.)
- `spline-ui/app/lib/` contains route logic and utilities
- `spline-ui/package.json` defines dependencies and scripts
- `spline-ui/public/` contains static assets

## Run locally

Terminal prototype (from root):

```bash
python main.py
```

Website prototype (from `spline-ui/` directory):

```bash
npm install
npm run dev
```
