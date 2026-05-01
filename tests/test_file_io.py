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
        print("\n--- test_load_network_reads_sample_dataset ---")
        print(f"  Input: load_network() using default data/stops.csv and data/segments.csv")
        network = load_network()

        print(f"  Output: {len(network.stops)} stops, {len(network.segments)} segments")
        print(f"  Sample stops: {list(network.stops.keys())[:5]}...")
        stop_name = network.get_stop_name("S11")
        print(f"  Output: get_stop_name('S11') -> '{stop_name}'")

        self.assertEqual(len(network.stops), 15)
        print(f"  PASS: stops count = {len(network.stops)} (expected 15)")
        self.assertEqual(len(network.segments), 54)
        print(f"  PASS: segments count = {len(network.segments)} (expected 54)")
        self.assertEqual(stop_name, "HKU")
        print(f"  PASS: stop S11 name = '{stop_name}' (expected 'HKU')")

    def test_save_journey_results_writes_expected_summary(self):
        print("\n--- test_save_journey_results_writes_expected_summary ---")
        network = Network()
        network.add_stop(Stop("A", "Alpha"))
        network.add_stop(Stop("B", "Beta"))
        network.add_segment(Segment("S1", "A", "B", "MTR", 5, 4.0))
        print(f"  Input network: stops=['Alpha','Beta'], segment=S1 (A->B, MTR, 5min, HK.0)")

        journeys = build_journeys([[network.segments["S1"]]], network)
        ranked = rank_journeys(journeys, "cheapest")
        print(f"  Input: {len(ranked)} journey(s), preference='cheapest', origin='Alpha', dest='Beta'")

        with tempfile.TemporaryDirectory() as temp_dir:
            output_path = os.path.join(temp_dir, "results.txt")
            save_journey_results(ranked, "cheapest", "Alpha", "Beta", filepath=output_path)
            print(f"  Output file: {output_path}")

            with open(output_path, "r", encoding="utf-8") as handle:
                content = handle.read()

        print(f"  Output content preview:")
        for line in content.strip().split('\n')[:8]:
            print(f"    | {line}")

        expected_strings = [
            "Smart Public Transport Advisor - Journey Results",
            "Origin:      Alpha",
            "Destination: Beta",
            "Path:     Alpha -> Beta",
        ]
        for expected in expected_strings:
            self.assertIn(expected, content)
            print(f"  PASS: Found '{expected}' in output")


if __name__ == "__main__":
    unittest.main(verbosity=2)
