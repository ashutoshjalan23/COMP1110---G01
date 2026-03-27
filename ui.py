"""
ui.py - ASCII terminal interface helpers.

Provides decorative frames, tables, banners, and colour constants
for a polished terminal experience. Pure Python, no external deps.
"""

import os
import sys

# ── Box-drawing characters (ASCII-safe) ──────────────────────────────────────
TL = "+"   # top-left
TR = "+"   # top-right
BL = "+"   # bottom-left
BR = "+"   # bottom-right
HZ = "-"   # horizontal
VT = "|"   # vertical
TJ = "+"   # T-junction down
BJ = "+"   # T-junction up
LJ = "+"   # T-junction right
RJ = "+"   # T-junction left
CR = "+"   # cross

# ── ANSI colours (gracefully degrades if not supported) ──────────────────────
RESET = "\033[0m"
BOLD = "\033[1m"
DIM = "\033[2m"
CYAN = "\033[36m"
GREEN = "\033[32m"
YELLOW = "\033[33m"
RED = "\033[31m"
MAGENTA = "\033[35m"
BLUE = "\033[34m"
WHITE = "\033[37m"

# Transport mode colours
MODE_COLOURS = {
    "MTR": CYAN,
    "Bus": GREEN,
    "Minibus": YELLOW,
    "Ferry": BLUE,
    "Tram": MAGENTA,
    "Walking": DIM,
}

WIDTH = 72  # default frame width


def clear_screen():
    os.system("cls" if sys.platform == "win32" else "clear")


def hline(width=WIDTH, char=HZ):
    return TL + char * (width - 2) + TR


def hline_bottom(width=WIDTH, char=HZ):
    return BL + char * (width - 2) + BR


def hline_mid(width=WIDTH, char=HZ):
    return LJ + char * (width - 2) + RJ


def framed_line(text, width=WIDTH):
    inner = width - 4
    return f"{VT} {text:<{inner}} {VT}"


def framed_center(text, width=WIDTH):
    inner = width - 4
    return f"{VT} {text:^{inner}} {VT}"


def banner(title, subtitle="", width=WIDTH):
    """Print a decorative banner box."""
    lines = [hline(width)]
    lines.append(framed_center("", width))
    lines.append(framed_center(f"{BOLD}{CYAN}{title}{RESET}", width))
    if subtitle:
        lines.append(framed_center(f"{DIM}{subtitle}{RESET}", width))
    lines.append(framed_center("", width))
    lines.append(hline_bottom(width))
    return "\n".join(lines)


def section_header(title, width=WIDTH):
    """Print a section separator."""
    pad = width - 6 - len(title)
    return f"\n{BOLD}{CYAN}== {title} {'=' * max(pad, 2)}{RESET}"


def menu_option(key, text):
    return f"  {BOLD}{YELLOW}[{key}]{RESET} {text}"


def success(msg):
    return f"  {GREEN}[OK]{RESET} {msg}"


def error(msg):
    return f"  {RED}[!!]{RESET} {msg}"


def warning(msg):
    return f"  {YELLOW}[**]{RESET} {msg}"


def info(msg):
    return f"  {CYAN}[i]{RESET} {msg}"


def mode_label(mode):
    """Return coloured transport mode label."""
    colour = MODE_COLOURS.get(mode, WHITE)
    return f"{colour}{mode}{RESET}"


def format_cost(cost):
    return f"HK${cost:.1f}"


def format_time(minutes):
    if minutes >= 60:
        h = int(minutes // 60)
        m = int(minutes % 60)
        return f"{h}h {m}m"
    return f"{int(minutes)}m"


# ── Journey display ──────────────────────────────────────────────────────────

def print_journey(journey, rank, preference, width=WIDTH):
    """Pretty-print a single ranked journey."""
    s = journey.summary_dict()
    stops = s["stops"]
    modes = s["modes"]

    # Determine which metric is the "winning" one
    pref_labels = {
        "cheapest": f"Cost: {BOLD}{GREEN}{format_cost(s['total_cost'])}{RESET}",
        "fastest": f"Time: {BOLD}{GREEN}{format_time(s['total_time'])}{RESET}",
        "fewest": f"Hops: {BOLD}{GREEN}{s['num_hops']}{RESET}",
    }
    # For combined preferences, show all three metrics highlighted
    if preference not in pref_labels:
        pref_labels[preference] = (
            f"Cost: {BOLD}{GREEN}{format_cost(s['total_cost'])}{RESET}  "
            f"Time: {BOLD}{GREEN}{format_time(s['total_time'])}{RESET}  "
            f"Hops: {BOLD}{GREEN}{s['num_hops']}{RESET}"
        )

    print(hline(width))
    rank_str = f"  Route #{rank}"
    print(framed_line(f"{BOLD}{rank_str}{RESET}", width))
    print(hline_mid(width))

    # Metrics row
    metrics = (
        f"Cost: {format_cost(s['total_cost'])}  {VT}  "
        f"Time: {format_time(s['total_time'])}  {VT}  "
        f"Segments: {s['num_hops']}"
    )
    print(framed_line(metrics, width))
    print(framed_line(f"Ranked by: {pref_labels.get(preference, '')}", width))
    print(hline_mid(width))

    # Route visualisation
    print(framed_line(f"{BOLD}Route:{RESET}", width))
    for i, (stop, mode) in enumerate(zip(stops[:-1], modes)):
        seg = s["segments"][i]
        print(framed_line(
            f"  {BOLD}{stop}{RESET}", width
        ))
        print(framed_line(
            f"    {DIM}|{RESET}  {mode_label(mode)}  "
            f"({format_time(seg.duration)}, {format_cost(seg.cost)})", width
        ))
    print(framed_line(f"  {BOLD}{stops[-1]}{RESET}", width))

    print(hline_bottom(width))


def print_journey_comparison(journeys, preference, width=WIDTH):
    """Print all ranked journeys with comparison."""
    if not journeys:
        print(error("No routes found between these stops."))
        return

    print(section_header(
        f"FOUND {len(journeys)} ROUTE(S)  |  Preference: {preference.upper()}", width
    ))
    print()

    for i, j in enumerate(journeys, 1):
        print_journey(j, i, preference, width)
        print()


# ── Stop list table ──────────────────────────────────────────────────────────

def print_stop_table(stop_list, width=WIDTH):
    """Print stops in a nice table. stop_list = [(id, name), ...]"""
    print(hline(width))
    print(framed_line(f"{BOLD}{'ID':<6} {'Stop Name':<40} {'Lines'}{RESET}", width))
    print(hline_mid(width))
    for sid, name in stop_list:
        print(framed_line(f"{sid:<6} {name:<40}", width))
    print(hline_bottom(width))


# ── DFS trace display ────────────────────────────────────────────────────────

def print_dfs_trace(origin, dest, paths_count):
    """Show a brief summary of the DFS execution."""
    print(info(f"DFS search from {BOLD}{origin}{RESET} to {BOLD}{dest}{RESET}"))
    print(info(f"Paths explored: {BOLD}{paths_count}{RESET} candidate route(s) found"))
    print()
