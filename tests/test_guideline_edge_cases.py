import os
import tempfile
import unittest

from file_io import DataFormatError, load_network, load_segments, load_stops
from journey import build_journeys, rank_journeys, rank_journeys_multi
from network import Network, Segment, Stop


class GuidelineEdgeCaseTests(unittest.TestCase):
    def test_dfs_handles_cycles_without_revisiting_stops(self):
        network = Network()
        for stop_id in ["A", "B", "C", "D"]:
            network.add_stop(Stop(stop_id, stop_id))

        for segment in [
            Segment("AB", "A", "B", "MTR", 1, 1),
            Segment("BC", "B", "C", "MTR", 1, 1),
            Segment("CA", "C", "A", "MTR", 1, 1),
            Segment("CD", "C", "D", "Bus", 1, 1),
        ]:
            network.add_segment(segment)

        paths = network.find_all_paths("A", "D", max_depth=5)

        self.assertEqual([[segment.seg_id for segment in path] for path in paths], [["AB", "BC", "CD"]])
        for path in paths:
            visited_stops = [path[0].from_stop, *[segment.to_stop for segment in path]]
            self.assertEqual(len(visited_stops), len(set(visited_stops)))

    def test_dfs_respects_depth_limit_and_unknown_stops(self):
        network = Network()
        for stop_id in ["A", "B", "C", "D"]:
            network.add_stop(Stop(stop_id, stop_id))
        for segment in [
            Segment("AB", "A", "B", "MTR", 1, 1),
            Segment("BC", "B", "C", "MTR", 1, 1),
            Segment("CD", "C", "D", "MTR", 1, 1),
        ]:
            network.add_segment(segment)

        self.assertEqual(network.find_all_paths("A", "D", max_depth=2), [])
        self.assertEqual(len(network.find_all_paths("A", "D", max_depth=3)), 1)
        self.assertEqual(network.find_all_paths("missing", "D"), [])
        self.assertEqual(network.find_all_paths("A", "missing"), [])

    def test_ranking_rejects_invalid_preference_modes(self):
        network = Network()
        network.add_stop(Stop("A", "Alpha"))
        network.add_stop(Stop("B", "Beta"))
        route = [Segment("AB", "A", "B", "MTR", 5, 4)]
        journeys = build_journeys([route], network)

        with self.assertRaisesRegex(ValueError, "Unknown preference"):
            rank_journeys(journeys, "quietest")

        with self.assertRaisesRegex(ValueError, "At least one"):
            rank_journeys_multi(journeys, [])

        with self.assertRaisesRegex(ValueError, "Unknown preference"):
            rank_journeys_multi(journeys, ["fastest", "quietest"])

    def test_stop_id_resolution_accepts_obvious_user_inputs(self):
        network = load_network()

        examples = {
            "S01": "S01",
            "s01": "S01",
            "so1": "S01",
            "1": "S01",
            "01": "S01",
            "central": "S01",
        }

        for raw, expected in examples.items():
            with self.subTest(raw=raw):
                self.assertEqual(network.resolve_stop_id(raw), expected)

    def test_file_io_reports_empty_and_malformed_files(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            empty_file = os.path.join(temp_dir, "empty.csv")
            with open(empty_file, "w", encoding="utf-8") as handle:
                handle.write("")

            malformed_segments = os.path.join(temp_dir, "segments.csv")
            with open(malformed_segments, "w", encoding="utf-8") as handle:
                handle.write("seg_id,from_stop,to_stop,mode,duration,cost\nS1,A,B,MTR,not-a-number,5\n")

            with self.assertRaisesRegex(DataFormatError, "empty|header"):
                load_stops(empty_file)
            with self.assertRaisesRegex(DataFormatError, "duration"):
                load_segments(malformed_segments)

    def test_file_io_rejects_segments_with_unknown_stops(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            stops_file = os.path.join(temp_dir, "stops.csv")
            segments_file = os.path.join(temp_dir, "segments.csv")

            with open(stops_file, "w", encoding="utf-8") as handle:
                handle.write("id,name,latitude,longitude,lines\nA,Alpha,22.1,114.1,MTR\n")
            with open(segments_file, "w", encoding="utf-8") as handle:
                handle.write("seg_id,from_stop,to_stop,mode,duration,cost\nS1,A,Z,MTR,5,4\n")

            with self.assertRaisesRegex(DataFormatError, "unknown"):
                load_network(stops_file, segments_file)

    def test_real_dataset_survives_all_origin_destination_queries(self):
        network = load_network()
        stop_ids = list(network.stops)

        for origin in stop_ids:
            for dest in stop_ids:
                if origin == dest:
                    continue

                paths = network.find_all_paths(origin, dest, max_depth=8)
                journeys = build_journeys(paths, network, realtime=False)
                self.assertEqual(len(paths), len(journeys))

                for preference in ["cheapest", "fastest", "fewest"]:
                    ranked = rank_journeys(journeys, preference)
                    self.assertEqual(len(ranked), len(journeys))
                    self.assertTrue(all(j.total_cost >= 0 and j.total_time >= 0 for j in ranked))


if __name__ == "__main__":
    unittest.main()
