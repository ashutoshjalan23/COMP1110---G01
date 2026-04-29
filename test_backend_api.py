import json
import threading
import unittest
import urllib.error
import urllib.request
from http.server import ThreadingHTTPServer
from unittest.mock import patch

import backend_api


class BackendFunctionTests(unittest.TestCase):
    def test_build_plan_payload_returns_ranked_routes(self):
        payload = backend_api.build_plan_payload("S11", "S10", "fastest", False)

        self.assertGreater(payload["total"], 0)
        self.assertLessEqual(payload["shown"], 5)
        self.assertFalse(payload["realtime"])
        self.assertIn("segments", payload["routes"][0])
        self.assertIn("stops", payload["routes"][0])

    def test_build_eta_payload_merges_mode_entries(self):
        with (
            patch.object(backend_api, "parse_mtr_entries", return_value=[{"mode": "MTR", "label": "mock mtr", "times": ["2 min"]}]),
            patch.object(backend_api, "parse_kmb_entries", return_value=[{"mode": "Bus", "label": "mock bus", "times": ["5 min"]}]),
        ):
            payload = backend_api.build_eta_payload("S01")

        self.assertEqual(payload["stopId"], "S01")
        self.assertEqual(len(payload["entries"]), 2)
        self.assertEqual(payload["entries"][0]["mode"], "MTR")
        self.assertEqual(payload["entries"][1]["mode"], "Bus")


class BackendHttpTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = ThreadingHTTPServer(("127.0.0.1", 0), backend_api.TransitRequestHandler)
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()
        cls.base_url = f"http://127.0.0.1:{cls.server.server_port}"

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()
        cls.thread.join(timeout=2)

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
        status, payload = self.fetch_json("/health")
        self.assertEqual(status, 200)
        self.assertEqual(payload, {"ok": True})

    def test_network_endpoint_returns_stops_and_segments(self):
        status, payload = self.fetch_json("/network")
        self.assertEqual(status, 200)
        self.assertEqual(len(payload["stops"]), 15)
        self.assertEqual(len(payload["segments"]), 54)

    def test_plan_endpoint_accepts_static_route_request(self):
        status, payload = self.fetch_json(
            "/plan",
            method="POST",
            body={
                "originId": "S11",
                "destId": "S10",
                "preference": "fastest",
                "realtime": False,
            },
        )
        self.assertEqual(status, 200)
        self.assertGreater(payload["total"], 0)
        self.assertFalse(payload["realtime"])

    def test_eta_endpoint_requires_stop_id(self):
        with self.assertRaises(urllib.error.HTTPError) as context:
            self.fetch_json("/eta")

        self.assertEqual(context.exception.code, 400)


if __name__ == "__main__":
    unittest.main()
