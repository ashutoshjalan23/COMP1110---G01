"""
file_io.py - File I/O for loading and saving transport network data.

File format (CSV):
  stops.csv   -> id,name,latitude,longitude,lines
  segments.csv -> seg_id,from_stop,to_stop,mode,duration,cost
  journeys.txt -> saved journey results (human-readable)
"""

import csv
import os
from network import Stop, Segment, Network


DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")


def load_stops(filepath):
    """Load stops from CSV. Returns dict {id: Stop}."""
    stops = {}
    with open(filepath, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            sid = row["id"].strip()
            lines = [l.strip() for l in row.get("lines", "").split(";") if l.strip()]
            stop = Stop(
                stop_id=sid,
                name=row["name"].strip(),
                latitude=float(row.get("latitude", 0)),
                longitude=float(row.get("longitude", 0)),
                available_lines=lines,
            )
            stops[sid] = stop
    return stops


def load_segments(filepath):
    """Load segments from CSV. Returns list of Segment objects."""
    segments = []
    with open(filepath, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            seg = Segment(
                seg_id=row["seg_id"].strip(),
                from_stop=row["from_stop"].strip(),
                to_stop=row["to_stop"].strip(),
                mode=row["mode"].strip(),
                duration=float(row["duration"]),
                cost=float(row["cost"]),
            )
            segments.append(seg)
    return segments


def load_network(stops_file=None, segments_file=None):
    """Build a Network from CSV files."""
    if stops_file is None:
        stops_file = os.path.join(DATA_DIR, "stops.csv")
    if segments_file is None:
        segments_file = os.path.join(DATA_DIR, "segments.csv")

    net = Network()

    for stop in load_stops(stops_file).values():
        net.add_stop(stop)

    for seg in load_segments(segments_file):
        net.add_segment(seg)

    return net


def save_journey_results(journeys, preference, origin, dest, filepath=None):
    """Save ranked journey results to a human-readable text file."""
    if filepath is None:
        filepath = os.path.join(DATA_DIR, "last_results.txt")

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(f"Smart Public Transport Advisor - Journey Results\n")
        f.write(f"{'=' * 55}\n")
        f.write(f"Origin:      {origin}\n")
        f.write(f"Destination: {dest}\n")
        f.write(f"Preference:  {preference}\n")
        f.write(f"Routes found: {len(journeys)}\n")
        f.write(f"{'=' * 55}\n\n")

        for i, j in enumerate(journeys, 1):
            s = j.summary_dict()
            f.write(f"Route #{i}\n")
            f.write(f"  Cost:     HK${s['total_cost']:.1f}\n")
            f.write(f"  Time:     {s['total_time']:.0f} min\n")
            f.write(f"  Segments: {s['num_hops']}\n")
            f.write(f"  Path:     {' -> '.join(s['stops'])}\n")
            f.write(f"  Modes:    {' -> '.join(s['modes'])}\n")
            f.write(f"{'-' * 55}\n")

    return filepath


def save_stops(stops_dict, filepath=None):
    """Save stops to CSV."""
    if filepath is None:
        filepath = os.path.join(DATA_DIR, "stops.csv")

    with open(filepath, "w", encoding="utf-8", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["id", "name", "latitude", "longitude", "lines"])
        for s in sorted(stops_dict.values(), key=lambda x: x.id):
            writer.writerow([
                s.id, s.name, s.latitude, s.longitude,
                ";".join(s.available_lines)
            ])


def save_segments(segments_list, filepath=None):
    """Save segments to CSV."""
    if filepath is None:
        filepath = os.path.join(DATA_DIR, "segments.csv")

    with open(filepath, "w", encoding="utf-8", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["seg_id", "from_stop", "to_stop", "mode", "duration", "cost"])
        for seg in segments_list:
            writer.writerow([
                seg.seg_id, seg.from_stop, seg.to_stop,
                seg.mode, seg.duration, seg.cost
            ])
