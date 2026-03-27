"""
main.py - Smart Public Transport Advisor
COMP1110 | Semester 2, 2025-2026 | Group G-01

An interactive, terminal-based journey planner for Hong Kong's public
transport network. Uses DFS to enumerate all candidate routes and ranks
them transparently by user-chosen preference (cheapest / fastest / fewest).

Usage:  python main.py
"""

import sys
import os

# Ensure imports work when running from any directory
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from network import Network
from journey import build_journeys, rank_journeys, rank_journeys_multi, PREFERENCE_KEYS
from file_io import load_network, save_journey_results
from ui import (
    clear_screen, banner, section_header, menu_option, success, error,
    warning, info, print_journey_comparison, print_stop_table,
    print_dfs_trace, hline, hline_bottom, framed_line, framed_center,
    BOLD, RESET, CYAN, YELLOW, GREEN, DIM, WIDTH, format_cost, format_time,
    mode_label, hline_mid,
)

# ── Global state ─────────────────────────────────────────────────────────────
network = None


def load_data():
    """Load the transport network from CSV files."""
    global network
    try:
        network = load_network()
        return True
    except FileNotFoundError as e:
        print(error(f"Data file not found: {e}"))
        return False
    except Exception as e:
        print(error(f"Failed to load network: {e}"))
        return False


# ── Menu Screens ─────────────────────────────────────────────────────────────

def show_main_menu():
    """Display the main menu and return user choice."""
    print(banner(
        "SMART PUBLIC TRANSPORT ADVISOR",
        "Hong Kong  |  COMP1110  |  G-01"
    ))
    print()
    print(menu_option("1", "Plan a Journey"))
    print(menu_option("2", "View All Stops"))
    print(menu_option("3", "View Network Map"))
    print(menu_option("4", "Run Case Studies"))
    print(menu_option("5", "About / Help"))
    print(menu_option("Q", "Quit"))
    print()


def get_valid_input(prompt, valid_options):
    """Prompt user until they enter a valid option."""
    while True:
        choice = input(f"  {BOLD}{prompt}{RESET} ").strip()
        if choice.upper() in [v.upper() for v in valid_options]:
            return choice.upper()
        print(error(f"Invalid choice. Please enter one of: {', '.join(valid_options)}"))


def get_stop_input(prompt_text):
    """Get a valid stop from user (by name or ID). Returns stop_id or None."""
    while True:
        raw = input(f"  {BOLD}{prompt_text}{RESET} ").strip()
        if raw.upper() == "B":
            return None

        # Try as stop ID first
        if raw.upper() in [s.upper() for s in network.stops]:
            for sid in network.stops:
                if sid.upper() == raw.upper():
                    return sid

        # Try as stop name
        sid = network.get_stop_id_by_name(raw)
        if sid:
            return sid

        print(error("Stop not found. Enter a stop name or ID (or 'B' to go back)."))
        # Show suggestions
        matches = [
            (s.id, s.name) for s in network.stops.values()
            if raw.lower() in s.name.lower()
        ]
        if matches:
            print(info("Did you mean:"))
            for mid, mname in matches[:5]:
                print(f"      {DIM}{mid}{RESET} - {mname}")


def get_preference():
    """Ask user for preference mode(s). Supports single or combined."""
    pref_map = {"1": "cheapest", "2": "fastest", "3": "fewest"}
    print()
    print(section_header("SELECT PREFERENCE MODE"))
    print()
    print(menu_option("1", f"Cheapest   {DIM}(rank by total cost){RESET}"))
    print(menu_option("2", f"Fastest    {DIM}(rank by total time){RESET}"))
    print(menu_option("3", f"Fewest     {DIM}(rank by number of segments){RESET}"))
    print()
    print(info(f"You can combine multiple preferences!"))
    print(info(f"Examples: {BOLD}1{RESET}  or  {BOLD}1,2{RESET}  or  {BOLD}1,2,3{RESET}"))
    print()

    while True:
        raw = input(f"  {BOLD}Preference(s) [1/2/3 or comma-separated]: {RESET}").strip()
        tokens = [t.strip() for t in raw.replace(" ", ",").split(",") if t.strip()]
        if all(t in pref_map for t in tokens) and len(tokens) >= 1:
            # Remove duplicates while preserving order
            seen = set()
            unique = []
            for t in tokens:
                if t not in seen:
                    seen.add(t)
                    unique.append(t)
            preferences = [pref_map[t] for t in unique]
            return preferences
        print(error("Invalid choice. Enter 1, 2, 3 or combine them (e.g. 1,2)."))


# ── Core Features ────────────────────────────────────────────────────────────

def plan_journey():
    """Main journey planning flow."""
    clear_screen()
    print(banner("JOURNEY PLANNER", "Find your best route across Hong Kong"))
    print()

    # Show available stops
    print(info("Available stops:"))
    stops = network.list_stop_names()
    for sid, name in stops:
        print(f"      {DIM}{sid}{RESET}  {name}")
    print()

    # Get origin
    origin_id = get_stop_input("Origin (name or ID, 'B' to go back): ")
    if origin_id is None:
        return
    origin_name = network.get_stop_name(origin_id)
    print(success(f"Origin: {origin_name}"))

    # Get destination
    dest_id = get_stop_input("Destination (name or ID, 'B' to go back): ")
    if dest_id is None:
        return
    dest_name = network.get_stop_name(dest_id)
    print(success(f"Destination: {dest_name}"))

    if origin_id == dest_id:
        print(error("Origin and destination cannot be the same."))
        input(f"\n  {DIM}Press Enter to continue...{RESET}")
        return

    # Get preference(s)
    preferences = get_preference()
    pref_label = " + ".join(p.upper() for p in preferences)
    print(success(f"Preference(s): {pref_label}"))
    print()

    # ── Run DFS ──────────────────────────────────────────────────────────
    print(section_header("DFS ROUTE SEARCH"))
    print()
    print(info("Running Depth-First Search..."))
    print()

    paths = network.find_all_paths(origin_id, dest_id)
    print_dfs_trace(origin_name, dest_name, len(paths))

    if not paths:
        print(error(f"No routes found from {origin_name} to {dest_name}."))
        input(f"\n  {DIM}Press Enter to continue...{RESET}")
        return

    # ── Build, score, rank ───────────────────────────────────────────────
    journeys = build_journeys(paths, network)

    explanations = {
        "cheapest": "Total cost (sum of all segment fares) in HKD.",
        "fastest":  "Total time (sum of all segment durations) in minutes.",
        "fewest":   "Number of segments (transfers + 1).",
    }

    if len(preferences) == 1:
        # ── Single preference mode ───────────────────────────────────────
        preference = preferences[0]
        ranked = rank_journeys(journeys, preference)

        print(section_header("SCORING EXPLANATION"))
        print()
        print(info(f"Ranking by: {BOLD}{preference.upper()}{RESET}"))
        print(info(explanations[preference]))
        print()

        display_count = min(len(ranked), 5)
        if len(ranked) > 5:
            print(warning(f"Showing top {display_count} of {len(ranked)} routes."))
        print_journey_comparison(ranked[:display_count], preference)

        try:
            filepath = save_journey_results(ranked, preference, origin_name, dest_name)
            print(success(f"Results saved to: {filepath}"))
        except Exception as e:
            print(warning(f"Could not save results: {e}"))

    else:
        # ── Multi-preference combined mode ───────────────────────────────
        ranked, scores, breakdowns = rank_journeys_multi(journeys, preferences)

        print(section_header("SCORING EXPLANATION (COMBINED)"))
        print()
        print(info("Multiple preferences selected. Scores are combined as follows:"))
        print()
        weight = 1.0 / len(preferences)
        for pref in preferences:
            print(info(f"  {BOLD}{pref.upper()}{RESET} (weight {weight:.0%}): {explanations[pref]}"))
        print()
        print(info("Each metric is normalised to [0-1], then weighted and summed."))
        print(info("Formula: score = " + " + ".join(
            f"{weight:.2f} x norm({p})" for p in preferences
        )))
        print()

        display_count = min(len(ranked), 5)
        if len(ranked) > 5:
            print(warning(f"Showing top {display_count} of {len(ranked)} routes."))

        combined_label = " + ".join(p.upper() for p in preferences)
        print_journey_comparison(ranked[:display_count], combined_label)

        # Show the composite score breakdown table
        print(section_header("COMPOSITE SCORE BREAKDOWN"))
        print()
        # Header
        hdr = f"  {'#':<4}"
        for p in preferences:
            hdr += f" {p[:5].upper():>8} {'norm':>5} {'w*n':>5}  {BOLD}{DIM}|{RESET}"
        hdr += f"  {'SCORE':>7}"
        print(hdr)
        print(f"  {'-' * (len(preferences) * 23 + 14)}")

        for i in range(min(display_count, len(breakdowns))):
            bd = breakdowns[i]
            row = f"  {BOLD}#{i+1:<3}{RESET}"
            for p in preferences:
                d = bd[p]
                unit = format_cost(d["raw"]) if p == "cheapest" else (
                    format_time(d["raw"]) if p == "fastest" else str(int(d["raw"]))
                )
                row += f" {unit:>8} {d['normalised']:>5.2f} {d['weighted']:>5.3f}  {DIM}|{RESET}"
            row += f"  {BOLD}{scores[i]:>7.3f}{RESET}"
            print(row)
        print()

        try:
            filepath = save_journey_results(ranked, combined_label, origin_name, dest_name)
            print(success(f"Results saved to: {filepath}"))
        except Exception as e:
            print(warning(f"Could not save results: {e}"))

    input(f"\n  {DIM}Press Enter to continue...{RESET}")


def view_stops():
    """Display all stops in the network."""
    clear_screen()
    print(banner("NETWORK STOPS", f"{len(network.stops)} stops loaded"))
    print()
    print_stop_table(network.list_stop_names())
    print()
    input(f"  {DIM}Press Enter to continue...{RESET}")


def view_network_map():
    """Display an ASCII visualization of the network graph."""
    clear_screen()
    print(banner("NETWORK MAP", "Connections between stops"))
    print()

    # Group segments by from_stop
    for sid, stop in sorted(network.stops.items()):
        outgoing = network.adj.get(sid, [])
        if not outgoing:
            continue

        print(f"  {BOLD}{CYAN}{stop.name}{RESET} ({sid})")
        for seg in outgoing:
            dest_name = network.get_stop_name(seg.to_stop)
            print(
                f"    {DIM}|-->{RESET} {dest_name:<20} "
                f"{mode_label(seg.mode):<20} "
                f"{format_time(seg.duration):>5}  "
                f"{format_cost(seg.cost):>8}"
            )
        print()

    print(f"  {DIM}Total segments: {len(network.segments)}{RESET}")
    print()
    input(f"  {DIM}Press Enter to continue...{RESET}")


def run_case_studies():
    """Run predefined case studies demonstrating the system."""
    clear_screen()
    print(banner("CASE STUDIES", "Demonstrating the advisor with real scenarios"))
    print()

    cases = [
        {
            "title": "Case 1: Budget Student (HKU to Sha Tin)",
            "desc": "A university student wants the cheapest route from HKU to Sha Tin.",
            "origin": "S11",
            "dest": "S10",
            "pref": "cheapest",
        },
        {
            "title": "Case 2: Rush-Hour Commuter (Tsim Sha Tsui to Causeway Bay)",
            "desc": "An office worker needs the fastest route from TST to Causeway Bay.",
            "origin": "S05",
            "dest": "S04",
            "pref": "fastest",
        },
        {
            "title": "Case 3: Tourist with Luggage (Kennedy Town to Mong Kok)",
            "desc": "A tourist with heavy luggage prefers fewest transfers.",
            "origin": "S12",
            "dest": "S07",
            "pref": "fewest",
        },
        {
            "title": "Case 4: Weekend Explorer (North Point to Tsuen Wan)",
            "desc": "A family wants the cheapest weekend trip across the harbour.",
            "origin": "S13",
            "dest": "S15",
            "pref": "cheapest",
        },
    ]

    for i, case in enumerate(cases, 1):
        print(section_header(case["title"]))
        print(info(case["desc"]))
        print()

        origin_name = network.get_stop_name(case["origin"])
        dest_name = network.get_stop_name(case["dest"])

        paths = network.find_all_paths(case["origin"], case["dest"])
        print_dfs_trace(origin_name, dest_name, len(paths))

        if paths:
            journeys = build_journeys(paths, network)
            ranked = rank_journeys(journeys, case["pref"])
            # Show top 3 for case studies
            print_journey_comparison(ranked[:3], case["pref"])
        else:
            print(error("No routes found."))

        if i < len(cases):
            input(f"\n  {DIM}Press Enter for next case study...{RESET}")
            print()

    input(f"\n  {DIM}Press Enter to return to main menu...{RESET}")


def show_about():
    """Display about / help information."""
    clear_screen()
    print(banner("ABOUT", "Smart Public Transport Advisor"))
    print()
    print(hline())
    print(framed_line(f"{BOLD}Smart Public Transport Advisor{RESET}"))
    print(framed_line(f"COMP1110 | Semester 2, 2025-2026 | Group G-01"))
    print(hline_mid())
    print(framed_line(""))
    print(framed_line(f"{BOLD}What is this?{RESET}"))
    print(framed_line("A transparent journey planner for Hong Kong public"))
    print(framed_line("transport. Unlike black-box tools, this advisor"))
    print(framed_line("shows WHY a route is recommended by exposing the"))
    print(framed_line("scoring and trade-offs for every candidate route."))
    print(framed_line(""))
    print(hline_mid())
    print(framed_line(f"{BOLD}Algorithm:{RESET} Depth-First Search (DFS)"))
    print(framed_line("DFS explores all possible paths from origin to"))
    print(framed_line("destination, generating every candidate route."))
    print(framed_line("This enables transparent comparison of ALL options."))
    print(framed_line(""))
    print(hline_mid())
    print(framed_line(f"{BOLD}Preference Modes:{RESET}"))
    print(framed_line(f"  {GREEN}Cheapest{RESET}  - Rank by total fare (HKD)"))
    print(framed_line(f"  {GREEN}Fastest{RESET}   - Rank by total travel time"))
    print(framed_line(f"  {GREEN}Fewest{RESET}    - Rank by number of segments"))
    print(framed_line(""))
    print(hline_mid())
    print(framed_line(f"{BOLD}Transport Modes:{RESET}"))
    print(framed_line(f"  {mode_label('MTR')}  {mode_label('Bus')}  "
                      f"{mode_label('Minibus')}  {mode_label('Ferry')}  "
                      f"{mode_label('Tram')}"))
    print(framed_line(""))
    print(hline_mid())
    print(framed_line(f"{BOLD}Team G-01:{RESET}"))
    print(framed_line("  Jindal Aadi      - Project Manager"))
    print(framed_line("  Gupta Akshat     - Research Lead"))
    print(framed_line("  Jalan Ashutosh   - Algorithm & UI"))
    print(framed_line("  Gupta Aikagra    - Backend & I/O"))
    print(framed_line("  Mathur Shikhar   - Testing Lead"))
    print(framed_line(""))
    print(hline_bottom())
    print()
    input(f"  {DIM}Press Enter to continue...{RESET}")


# ── Main Loop ────────────────────────────────────────────────────────────────

def main():
    """Application entry point."""
    # Load data
    print(info("Loading transport network..."))
    if not load_data():
        print(error("Cannot start without network data. Exiting."))
        sys.exit(1)
    print(success(f"Loaded {len(network.stops)} stops and {len(network.segments)} segments."))
    print()

    while True:
        clear_screen()
        show_main_menu()

        choice = get_valid_input("Select option: ", ["1", "2", "3", "4", "5", "Q"])

        if choice == "1":
            plan_journey()
        elif choice == "2":
            view_stops()
        elif choice == "3":
            view_network_map()
        elif choice == "4":
            run_case_studies()
        elif choice == "5":
            show_about()
        elif choice == "Q":
            clear_screen()
            print(banner("GOODBYE!", "Thank you for using Smart Public Transport Advisor"))
            print()
            break


if __name__ == "__main__":
    main()
