import sys
import unittest
from pathlib import Path
from unittest.mock import patch

# Add parent directory to path to allow imports from root
sys.path.insert(0, str(Path(__file__).parent.parent))

import journey
from network import Network, Segment, Stop


def build_sample_network():
    network = Network()
    for stop_id, name in [
        ("A", "Alpha"),
        ("B", "Beta"),
        ("C", "Gamma"),
        ("D", "Delta"),
    ]:
        network.add_stop(Stop(stop_id, name, 22.3, 114.1))

    for segment in [
        Segment("S1", "A", "B", "MTR", 5, 4.0),
        Segment("S2", "B", "C", "Bus", 7, 3.5),
        Segment("S3", "A", "C", "Ferry", 15, 2.5),
        Segment("S4", "B", "D", "Minibus", 4, 2.0),
        Segment("S5", "D", "C", "Tram", 6, 1.5),
    ]:
        network.add_segment(segment)

    return network


class JourneyTests(unittest.TestCase):
    def setUp(self):
        self.network = build_sample_network()
        self.paths = self.network.find_all_paths("A", "C", max_depth=4)

    def test_build_journeys_computes_static_totals(self):
        print("\n--- test_build_journeys_computes_static_totals ---")
        print(f"  Input: paths from A->C (found {len(self.paths)} paths), realtime=False")
        journeys = journey.build_journeys(self.paths, self.network, realtime=False)
        by_route = {tuple(segment.seg_id for segment in item.segments): item for item in journeys}

        for route_key, j in by_route.items():
            print(f"  Route {route_key}: cost={j.total_cost}, time={j.total_time}, hops={j.num_hops}")
            print(f"    summary_dict stops: {j.summary_dict()['stops']}")

        self.assertEqual(by_route[("S3",)].total_cost, 2.5)
        print(f"  PASS: Route ('S3',) total_cost = {by_route[('S3',)].total_cost} (expected 2.5)")
        self.assertEqual(by_route[("S3",)].total_time, 15)
        print(f"  PASS: Route ('S3',) total_time = {by_route[('S3',)].total_time} (expected 15)")
        self.assertEqual(by_route[("S1", "S2")].num_hops, 2)
        print(f"  PASS: Route ('S1','S2') num_hops = {by_route[('S1', 'S2')].num_hops} (expected 2)")
        self.assertEqual(by_route[("S1", "S4", "S5")].summary_dict()["stops"], ["Alpha", "Beta", "Delta", "Gamma"])
        print(f"  PASS: Route ('S1','S4','S5') stops = {by_route[('S1', 'S4', 'S5')].summary_dict()['stops']} (expected ['Alpha', 'Beta', 'Delta', 'Gamma'])")

    def test_consecutive_mtr_segments_count_as_one_hop(self):
        print("\n--- test_consecutive_mtr_segments_count_as_one_hop ---")
        segments = [
            Segment("M1", "A", "B", "MTR", 5, 4.0),
            Segment("M2", "B", "D", "MTR", 4, 3.0),
            Segment("B1", "D", "C", "Bus", 7, 3.5),
        ]
        print(f"  Input segments: {[(s.seg_id, s.mode) for s in segments]}")
        route = journey.Journey(segments, self.network)

        print(f"  Output: num_hops = {route.num_hops}")
        print(f"  Output: summary_dict num_hops = {route.summary_dict()['num_hops']}")
        self.assertEqual(route.num_hops, 2)
        print(f"  PASS: num_hops = {route.num_hops} (expected 2, MTR->MTR counts as 1 hop)")
        self.assertEqual(route.summary_dict()["num_hops"], 2)
        print(f"  PASS: summary_dict num_hops = {route.summary_dict()['num_hops']} (expected 2)")

    def test_rank_journeys_orders_by_requested_preference(self):
        print("\n--- test_rank_journeys_orders_by_requested_preference ---")
        journeys = journey.build_journeys(self.paths, self.network, realtime=False)
        print(f"  Input: {len(journeys)} journeys, testing preferences: cheapest, fastest, fewest")

        for pref in ["cheapest", "fastest", "fewest"]:
            ranked = journey.rank_journeys(journeys, pref)
            top_route = tuple(segment.seg_id for segment in ranked[0].segments)
            print(f"  Preference '{pref}': top route = {top_route} (cost={ranked[0].total_cost}, time={ranked[0].adjusted_time}, hops={ranked[0].num_hops})")

        cheapest = journey.rank_journeys(journeys, "cheapest")
        fastest = journey.rank_journeys(journeys, "fastest")
        fewest = journey.rank_journeys(journeys, "fewest")

        self.assertEqual(tuple(segment.seg_id for segment in cheapest[0].segments), ("S3",))
        print(f"  PASS: cheapest[0] = ('S3',) (expected ('S3',))")
        self.assertEqual(tuple(segment.seg_id for segment in fastest[0].segments), ("S1", "S2"))
        print(f"  PASS: fastest[0] = ('S1', 'S2') (expected ('S1', 'S2'))")
        self.assertEqual(tuple(segment.seg_id for segment in fewest[0].segments), ("S3",))
        print(f"  PASS: fewest[0] = ('S3',) (expected ('S3',))")

    def test_rank_journeys_multi_returns_scores_and_breakdowns(self):
        print("\n--- test_rank_journeys_multi_returns_scores_and_breakdowns ---")
        preferences = ["cheapest", "fewest"]
        print(f"  Input: preferences = {preferences}")
        journeys = journey.build_journeys(self.paths, self.network, realtime=False)
        ranked, scores, breakdowns = journey.rank_journeys_multi(journeys, preferences)

        print(f"  Output: {len(ranked)} ranked journeys, {len(scores)} scores, {len(breakdowns)} breakdowns")
        for i, (r, s, b) in enumerate(zip(ranked, scores, breakdowns)):
            route = tuple(seg.seg_id for seg in r.segments)
            print(f"    Rank {i+1}: route={route}, score={s:.4f}, breakdown={b}")

        self.assertEqual(len(ranked), len(journeys))
        self.assertEqual(len(scores), len(journeys))
        self.assertEqual(len(breakdowns), len(journeys))
        self.assertIn("cheapest", breakdowns[0])
        self.assertIn("fewest", breakdowns[0])
        print(f"  PASS: All lengths match ({len(journeys)}), breakdowns contain 'cheapest' and 'fewest' keys")

    def test_build_journeys_realtime_applies_waits_and_traffic(self):
        print("\n--- test_build_journeys_realtime_applies_waits_and_traffic ---")
        path = [[
            Segment("M1", "A", "B", "MTR", 5, 4.0),
            Segment("B1", "B", "C", "Bus", 10, 6.0),
            Segment("T1", "C", "D", "Tram", 6, 2.0),
            Segment("F1", "D", "A", "Ferry", 8, 3.0),
        ]]
        print(f"  Input segments: {[(s.seg_id, s.mode, f'dur={s.duration}') for s in path[0]]}")
        print(f"  Mocked: _live_mtr_wait=2.0, _live_bus_wait=3.0, _traffic_multiplier=1.5")

        with (
            patch.object(journey, "_RT", True),
            patch.object(journey, "_live_mtr_wait", return_value=2.0),
            patch.object(journey, "_live_bus_wait", return_value=3.0),
            patch.object(journey, "_traffic_multiplier", return_value=1.5),
        ):
            journeys = journey.build_journeys(path, self.network, realtime=True)

        print(f"  Output: adjusted_time = {journeys[0].adjusted_time}")
        print(f"  Calculation: MTR(5+2) + Bus(10*1.5+3) + Tram(6+2) + Ferry(8+5) = 7+18+8+13 = 46.0")
        self.assertEqual(journeys[0].adjusted_time, 46.0)
        print(f"  PASS: adjusted_time = {journeys[0].adjusted_time} (expected 46.0)")


if __name__ == "__main__":
    unittest.main(verbosity=2)
