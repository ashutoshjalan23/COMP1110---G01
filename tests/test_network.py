import sys
import unittest
from pathlib import Path

# Add parent directory to path to allow imports from root
sys.path.insert(0, str(Path(__file__).parent.parent))

from network import Network, Segment, Stop


def build_sample_network():
    network = Network()
    for stop_id, name in [
        ("A", "Alpha"),
        ("B", "Beta"),
        ("C", "Gamma"),
        ("D", "Delta"),
    ]:
        network.add_stop(Stop(stop_id, name))

    for segment in [
        Segment("S1", "A", "B", "MTR", 5, 4.0),
        Segment("S2", "B", "C", "Bus", 7, 3.5),
        Segment("S3", "A", "C", "Ferry", 15, 2.5),
        Segment("S4", "B", "D", "Minibus", 4, 2.0),
        Segment("S5", "D", "C", "Tram", 6, 1.5),
    ]:
        network.add_segment(segment)

    return network


class NetworkTests(unittest.TestCase):
    def setUp(self):
        self.network = build_sample_network()

    def test_get_stop_id_by_name_is_case_insensitive(self):
        print("\n--- test_get_stop_id_by_name_is_case_insensitive ---")
        test_cases = [
            ("alpha", "A"),
            ("BETA", "B"),
            ("missing", None),
        ]
        for name_input, expected in test_cases:
            result = self.network.get_stop_id_by_name(name_input)
            print(f"  Input: get_stop_id_by_name('{name_input}') -> Output: {repr(result)} (expected {repr(expected)})")
            if expected is None:
                self.assertIsNone(result)
            else:
                self.assertEqual(result, expected)
            print(f"  PASS")

    def test_find_all_paths_returns_all_simple_paths(self):
        print("\n--- test_find_all_paths_returns_all_simple_paths ---")
        origin, dest, max_depth = "A", "C", 4
        print(f"  Input: find_all_paths(origin='{origin}', dest='{dest}', max_depth={max_depth})")
        paths = self.network.find_all_paths(origin, dest, max_depth=max_depth)
        route_ids = sorted(tuple(segment.seg_id for segment in path) for path in paths)

        print(f"  Output: {len(paths)} paths found")
        for i, route in enumerate(route_ids):
            print(f"    Path {i+1}: {route}")

        expected = [("S1", "S2"), ("S1", "S4", "S5"), ("S3",)]
        self.assertEqual(route_ids, expected)
        print(f"  PASS: route_ids = {route_ids} (expected {expected})")

    def test_find_paths_with_stats_summarises_each_route(self):
        print("\n--- test_find_paths_with_stats_summarises_each_route ---")
        origin, dest, max_depth = "A", "C", 4
        print(f"  Input: find_paths_with_stats(origin='{origin}', dest='{dest}', max_depth={max_depth})")
        enriched = self.network.find_paths_with_stats(origin, dest, max_depth=max_depth)
        summary = {
            tuple(segment.seg_id for segment in route["segments"]): (
                route["duration"],
                route["cost"],
                route["transfers"],
            )
            for route in enriched
        }

        print(f"  Output: {len(enriched)} routes with stats")
        for route_key, (duration, cost, transfers) in summary.items():
            print(f"    Route {route_key}: duration={duration} min, cost=HK, transfers={transfers}")

        expected = {
            ("S3",): (15, 2.5, 0),
            ("S1", "S2"): (12, 7.5, 1),
            ("S1", "S4", "S5"): (15, 7.5, 2),
        }
        for route_key, expected_vals in expected.items():
            self.assertEqual(summary[route_key], expected_vals)
            print(f"  PASS: {route_key} = {summary[route_key]} (expected {expected_vals})")


if __name__ == "__main__":
    unittest.main(verbosity=2)
