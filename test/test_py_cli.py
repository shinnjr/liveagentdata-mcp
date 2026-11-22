import io
import unittest
from unittest.mock import patch

from liveagentdata.cli import VERTICAL_HOSTS, check_trust_gate, discover_endpoints, handle_mcp_message


class FakeResp(io.BytesIO):
    def __enter__(self):
        return self

    def __exit__(self, *args):
        return False


class TestLiveAgentDataPy(unittest.TestCase):
    def test_hosts_exclude_consumer_property(self):
        self.assertEqual(len(VERTICAL_HOSTS), 12)
        self.assertFalse(any("shinnslist" in h or "shinnlist" in h for h in VERTICAL_HOSTS))

    def test_mcp_protocol_handlers(self):
        init_res = handle_mcp_message({"jsonrpc": "2.0", "id": 1, "method": "initialize"})
        self.assertEqual(init_res["result"]["serverInfo"]["name"], "liveagentdata-py")
        list_res = handle_mcp_message({"jsonrpc": "2.0", "id": 2, "method": "tools/list"})
        self.assertEqual(len(list_res["result"]["tools"]), 2)
        self.assertIsNone(handle_mcp_message({"jsonrpc": "2.0", "method": "notifications/initialized"}))

    def test_mocked_discovery_and_trust(self):
        with patch("urllib.request.urlopen", return_value=FakeResp(b'{"ok":true,"count":5}')):
            out = discover_endpoints("edgar")
            self.assertEqual(out["count"], 5)
        with patch("urllib.request.urlopen", return_value=FakeResp(b'{"verdict":"GO"}')):
            out = check_trust_gate("claude-code")
            self.assertEqual(out["verdict"], "GO")


if __name__ == "__main__":
    unittest.main()
