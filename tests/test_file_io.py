import os
import sys
import tempfile
import unittest
from pathlib import Path

# Add parent directory to path to allow imports from root
sys.path.insert(0, str(Path(__file__).parent.parent))

from file_io import load_network, save_journey_results
from journey import build_journeys, rank_journeys
from network import Network, Segment, Stop


class FileIoTests(unittest.TestCase):
    def test_load_network_reads_sample_dataset(self):
        network = load_network()
        self.assertEqual(len(network.stops), 15)
        self.assertEqual(len(network.segments), 54)
        self.assertEqual(network.get_stop_name("S11"), "HKU")

    def test_save_journey_results_writes_expected_summary(self):
        network = Network()
        network.add_stop(Stop("A", "Alpha"))
        network.add_stop(Stop("B", "Beta"))
        network.add_segment(Segment("S1", "A", "B", "MTR", 5, 4.0))

        journeys = build_journeys([[network.segments["S1"]]], network)
        ranked = rank_journeys(journeys, "cheapest")

        with tempfile.TemporaryDirectory() as temp_dir:
            output_path = os.path.join(temp_dir, "results.txt")
            save_journey_results(ranked, "cheapest", "Alpha", "Beta", filepath=output_path)

            with open(output_path, "r", encoding="utf-8") as handle:
                content = handle.read()

        self.assertIn("Smart Public Transport Advisor - Journey Results", content)
        self.assertIn("Origin:      Alpha", content)
        self.assertIn("Destination: Beta", content)
        self.assertIn("Path:     Alpha -> Beta", content)


if __name__ == "__main__":
    unittest.main(verbosity=2)
