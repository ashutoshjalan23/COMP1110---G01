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
        journeys = journey.build_journeys(self.paths, self.network, realtime=False)
        by_route = {tuple(segment.seg_id for segment in item.segments): item for item in journeys}

        self.assertEqual(by_route[("S3",)].total_cost, 2.5)
        self.assertEqual(by_route[("S3",)].total_time, 15)
        self.assertEqual(by_route[("S1", "S2")].num_hops, 2)
        self.assertEqual(by_route[("S1", "S4", "S5")].summary_dict()["stops"], ["Alpha", "Beta", "Delta", "Gamma"])

    def test_consecutive_mtr_segments_count_as_one_hop(self):
        route = journey.Journey([
            Segment("M1", "A", "B", "MTR", 5, 4.0),
            Segment("M2", "B", "D", "MTR", 4, 3.0),
            Segment("B1", "D", "C", "Bus", 7, 3.5),
        ], self.network)

        self.assertEqual(route.num_hops, 2)
        self.assertEqual(route.summary_dict()["num_hops"], 2)

    def test_rank_journeys_orders_by_requested_preference(self):
        journeys = journey.build_journeys(self.paths, self.network, realtime=False)

        cheapest = journey.rank_journeys(journeys, "cheapest")
        fastest = journey.rank_journeys(journeys, "fastest")
        fewest = journey.rank_journeys(journeys, "fewest")

        self.assertEqual(tuple(segment.seg_id for segment in cheapest[0].segments), ("S3",))
        self.assertEqual(tuple(segment.seg_id for segment in fastest[0].segments), ("S1", "S2"))
        self.assertEqual(tuple(segment.seg_id for segment in fewest[0].segments), ("S3",))

    def test_rank_journeys_multi_returns_scores_and_breakdowns(self):
        journeys = journey.build_journeys(self.paths, self.network, realtime=False)
        ranked, scores, breakdowns = journey.rank_journeys_multi(journeys, ["cheapest", "fewest"])

        self.assertEqual(len(ranked), len(journeys))
        self.assertEqual(len(scores), len(journeys))
        self.assertEqual(len(breakdowns), len(journeys))
        self.assertIn("cheapest", breakdowns[0])
        self.assertIn("fewest", breakdowns[0])

    def test_build_journeys_realtime_applies_waits_and_traffic(self):
        path = [[
            Segment("M1", "A", "B", "MTR", 5, 4.0),
            Segment("B1", "B", "C", "Bus", 10, 6.0),
            Segment("T1", "C", "D", "Tram", 6, 2.0),
            Segment("F1", "D", "A", "Ferry", 8, 3.0),
        ]]

        with (
            patch.object(journey, "_RT", True),
            patch.object(journey, "_live_mtr_wait", return_value=2.0),
            patch.object(journey, "_live_bus_wait", return_value=3.0),
            patch.object(journey, "_traffic_multiplier", return_value=1.5),
        ):
            journeys = journey.build_journeys(path, self.network, realtime=True)

        self.assertEqual(journeys[0].adjusted_time, 46.0)


if __name__ == "__main__":
    unittest.main(verbosity=2)
