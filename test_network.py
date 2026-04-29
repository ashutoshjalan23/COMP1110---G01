import unittest

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
        self.assertEqual(self.network.get_stop_id_by_name("alpha"), "A")
        self.assertEqual(self.network.get_stop_id_by_name("BETA"), "B")
        self.assertIsNone(self.network.get_stop_id_by_name("missing"))

    def test_find_all_paths_returns_all_simple_paths(self):
        paths = self.network.find_all_paths("A", "C", max_depth=4)
        route_ids = sorted(tuple(segment.seg_id for segment in path) for path in paths)
        self.assertEqual(route_ids, [("S1", "S2"), ("S1", "S4", "S5"), ("S3",)])

    def test_find_paths_with_stats_summarises_each_route(self):
        enriched = self.network.find_paths_with_stats("A", "C", max_depth=4)
        summary = {
            tuple(segment.seg_id for segment in route["segments"]): (
                route["duration"],
                route["cost"],
                route["transfers"],
            )
            for route in enriched
        }
        self.assertEqual(summary[("S3",)], (15, 2.5, 0))
        self.assertEqual(summary[("S1", "S2")], (12, 7.5, 1))
        self.assertEqual(summary[("S1", "S4", "S5")], (15, 7.5, 2))


if __name__ == "__main__":
    unittest.main()
