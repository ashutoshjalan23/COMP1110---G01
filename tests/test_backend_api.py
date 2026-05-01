import json
import sys
import threading
import unittest
import urllib.error
import urllib.request
from http.server import ThreadingHTTPServer
from pathlib import Path
from unittest.mock import patch

# Add parent directory to path to allow imports from root
sys.path.insert(0, str(Path(__file__).parent.parent))

import backend_api


class BackendFunctionTests(unittest.TestCase):
    def test_build_plan_payload_returns_ranked_routes(self):
        print("\n--- test_build_plan_payload_returns_ranked_routes ---")
        origin, dest, pref, rt = "S11", "S10", "fastest", False
        print(f"  Input: build_plan_payload(origin='{origin}', dest='{dest}', preference='{pref}', realtime={rt})")
        payload = backend_api.build_plan_payload(origin, dest, pref, rt)

        print(f"  Output: total={payload['total']}, shown={payload['shown']}, realtime={payload['realtime']}")
        print(f"  Output: {len(payload['routes'])} routes returned")
        for i, route in enumerate(payload["routes"]):
            print(f"    Route {i+1}: segments={[s['segId'] for s in route['segments']]}, stops={route['stops']}")

        self.assertGreater(payload["total"], 0)
        print(f"  PASS: total = {payload['total']} > 0")
        self.assertLessEqual(payload["shown"], 5)
        print(f"  PASS: shown = {payload['shown']} <= 5")
        self.assertFalse(payload["realtime"])
        print(f"  PASS: realtime = {payload['realtime']} (expected False)")
        self.assertIn("segments", payload["routes"][0])
        self.assertIn("stops", payload["routes"][0])
        print(f"  PASS: routes[0] contains 'segments' and 'stops' keys")

    def test_build_eta_payload_merges_mode_entries(self):
        print("\n--- test_build_eta_payload_merges_mode_entries ---")
        stop_id = "S01"
        print(f"  Input: build_eta_payload(stop_id='{stop_id}')")
        print(f"  Mocked: parse_mtr_entries -> [{{mode: MTR, label: 'mock mtr', times: ['2 min']}}]")
        print(f"  Mocked: parse_kmb_entries -> [{{mode: Bus, label: 'mock bus', times: ['5 min']}}]")

        with (
            patch.object(backend_api, "parse_mtr_entries", return_value=[{"mode": "MTR", "label": "mock mtr", "times": ["2 min"]}]),
            patch.object(backend_api, "parse_kmb_entries", return_value=[{"mode": "Bus", "label": "mock bus", "times": ["5 min"]}]),
        ):
            payload = backend_api.build_eta_payload(stop_id)

        print(f"  Output: stopId='{payload['stopId']}', {len(payload['entries'])} entries")
        for entry in payload["entries"]:
            print(f"    Entry: mode={entry['mode']}, label='{entry['label']}', times={entry['times']}")

        self.assertEqual(payload["stopId"], "S01")
        print(f"  PASS: stopId = '{payload['stopId']}' (expected 'S01')")
        self.assertEqual(len(payload["entries"]), 2)
        print(f"  PASS: entries count = {len(payload['entries'])} (expected 2)")
        self.assertEqual(payload["entries"][0]["mode"], "MTR")
        self.assertEqual(payload["entries"][1]["mode"], "Bus")
        print(f"  PASS: entry modes = [{payload['entries'][0]['mode']}, {payload['entries'][1]['mode']}] (expected [MTR, Bus])")


class BackendHttpTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = ThreadingHTTPServer(("127.0.0.1", 0), backend_api.TransitRequestHandler)
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()
        cls.base_url = f"http://127.0.0.1:{cls.server.server_port}"
        print(f"\n  [Setup] Test server started at {cls.base_url}")

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()
        cls.thread.join(timeout=2)
        print(f"  [Teardown] Test server stopped")

    def fetch_json(self, path, method="GET", body=None):
        request = urllib.request.Request(
            url=f"{self.base_url}{path}",
            method=method,
            data=None if body is None else json.dumps(body).encode("utf-8"),
            headers={"Content-Type": "application/json"},
        )
        with urllib.request.urlopen(request, timeout=15) as response:
            return response.status, json.loads(response.read().decode("utf-8"))

    def test_health_endpoint(self):
        print("\n--- test_health_endpoint ---")
        print(f"  Input: GET /health")
        status, payload = self.fetch_json("/health")
        print(f"  Output: status={status}, payload={payload}")
        self.assertEqual(status, 200)
        self.assertEqual(payload, {"ok": True})
        print(f"  PASS: status=200, payload={{'ok': True}}")

    def test_network_endpoint_returns_stops_and_segments(self):
        print("\n--- test_network_endpoint_returns_stops_and_segments ---")
        print(f"  Input: GET /network")
        status, payload = self.fetch_json("/network")
        print(f"  Output: status={status}, {len(payload['stops'])} stops, {len(payload['segments'])} segments")
        print(f"  Sample stop: {payload['stops'][0]}")
        self.assertEqual(status, 200)
        self.assertEqual(len(payload["stops"]), 15)
        print(f"  PASS: stops count = {len(payload['stops'])} (expected 15)")
        self.assertEqual(len(payload["segments"]), 54)
        print(f"  PASS: segments count = {len(payload['segments'])} (expected 54)")

    def test_plan_endpoint_accepts_static_route_request(self):
        print("\n--- test_plan_endpoint_accepts_static_route_request ---")
        body = {"originId": "S11", "destId": "S10", "preference": "fastest", "realtime": False}
        print(f"  Input: POST /plan with body={body}")
        status, payload = self.fetch_json("/plan", method="POST", body=body)
        print(f"  Output: status={status}, total={payload['total']}, shown={payload['shown']}, realtime={payload['realtime']}")
        print(f"  Output: {len(payload['routes'])} routes returned")
        self.assertEqual(status, 200)
        print(f"  PASS: status = {status} (expected 200)")
        self.assertGreater(payload["total"], 0)
        print(f"  PASS: total = {payload['total']} > 0")
        self.assertFalse(payload["realtime"])
        print(f"  PASS: realtime = {payload['realtime']} (expected False)")

    def test_eta_endpoint_requires_stop_id(self):
        print("\n--- test_eta_endpoint_requires_stop_id ---")
        print(f"  Input: GET /eta (no stopId parameter)")
        with self.assertRaises(urllib.error.HTTPError) as context:
            self.fetch_json("/eta")

        print(f"  Output: HTTPError with code={context.exception.code}")
        self.assertEqual(context.exception.code, 400)
        print(f"  PASS: error code = {context.exception.code} (expected 400 - missing stopId)")


if __name__ == "__main__":
    unittest.main(verbosity=2)
