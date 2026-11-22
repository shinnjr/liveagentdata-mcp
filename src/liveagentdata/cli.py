"""Zero-dependency CLI & STDIO MCP server for LiveAgentData and 12 vertical telemetry hosts."""
import argparse
import json
import sys
import urllib.parse
import urllib.request

VERTICAL_HOSTS = (
    "liveagentdata.com",
    "liveendpoints.com",
    "agentdatafeeds.com",
    "livemarketfeeds.com",
    "distressedpropertydata.com",
    "livegovcontracts.com",
    "liveosintfeeds.com",
    "buyingintentdata.com",
    "enterprisesalesdata.com",
    "healthcaredatafeeds.com",
    "altdatafeeds.com",
    "livepoliticaldata.com",
)
USER_AGENT = "liveagentdata-py/1.1.0"


def discover_endpoints(query: str = "", base_url: str = "https://liveagentdata.com", timeout: float = 12.0) -> dict:
    path = f"/v1/apis/search?q={urllib.parse.quote(str(query).strip(), safe='')}" if query else "/v1/discover"
    req = urllib.request.Request(f"{base_url.rstrip('/')}{path}", headers={"Accept": "application/json", "User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode("utf-8"))


def check_trust_gate(query: str, base_url: str = "https://agentwhitelist.com", timeout: float = 12.0) -> dict:
    url = f"{base_url.rstrip('/')}/v1/check?q={urllib.parse.quote(str(query).strip(), safe='')}"
    req = urllib.request.Request(url, headers={"Accept": "application/json", "User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode("utf-8"))


def handle_mcp_message(msg: dict, base_url: str = "https://liveagentdata.com"):
    msg_id = msg.get("id")
    method = msg.get("method")
    if method in ("notifications/initialized", "notifications/cancelled"):
        return None
    if method == "initialize":
        return {
            "jsonrpc": "2.0",
            "id": msg_id,
            "result": {
                "protocolVersion": "2024-11-05",
                "serverInfo": {"name": "liveagentdata-py", "version": "1.1.0"},
                "capabilities": {"tools": {}},
            },
        }
    if method == "tools/list":
        return {
            "jsonrpc": "2.0",
            "id": msg_id,
            "result": {
                "tools": [
                    {
                        "name": "search_live_feeds",
                        "description": "Search live public-record telemetry APIs across LiveAgentData and 12 vertical domains.",
                        "inputSchema": {"type": "object", "properties": {"q": {"type": "string"}}, "required": ["q"]},
                    },
                    {
                        "name": "check_supply_chain_trust",
                        "description": "Inspect SHA-512 verification and security verdict via agentwhitelist.com.",
                        "inputSchema": {"type": "object", "properties": {"q": {"type": "string"}}, "required": ["q"]},
                    },
                ]
            },
        }
    if method == "tools/call":
        params = msg.get("params") or {}
        name = params.get("name")
        args = params.get("arguments") or {}
        if name == "search_live_feeds":
            out = discover_endpoints(args.get("q", ""), base_url=base_url)
            return {"jsonrpc": "2.0", "id": msg_id, "result": {"content": [{"type": "text", "text": json.dumps(out)}]}}
        if name == "check_supply_chain_trust":
            out = check_trust_gate(args.get("q", ""))
            return {"jsonrpc": "2.0", "id": msg_id, "result": {"content": [{"type": "text", "text": json.dumps(out)}]}}
    if msg_id is not None:
        return {"jsonrpc": "2.0", "id": msg_id, "error": {"code": -32601, "message": "Method not found"}}
    return None


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description="Search & connect live public-record feeds across LiveAgentData.")
    parser.add_argument("--discover", action="store_true", help="Discover public-record telemetry APIs")
    parser.add_argument("--query", default="", help="Search keyword (used with --discover)")
    parser.add_argument("--trust", metavar="QUERY", help="Check agent/MCP security verdict via AgentWhitelist")
    parser.add_argument("--mcp", action="store_true", help="Run as a local STDIO MCP JSON-RPC server")
    parser.add_argument("--base-url", default="https://liveagentdata.com", help="Hub base URL")
    args = parser.parse_args(argv)

    if args.mcp:
        for line in sys.stdin:
            line = line.strip()
            if not line:
                continue
            try:
                reply = handle_mcp_message(json.loads(line), base_url=args.base_url)
                if reply is not None:
                    sys.stdout.write(json.dumps(reply) + "\n")
                    sys.stdout.flush()
            except Exception as exc:
                sys.stdout.write(json.dumps({"jsonrpc": "2.0", "id": None, "error": {"code": -32700, "message": str(exc)}}) + "\n")
                sys.stdout.flush()
        return 0

    if args.trust:
        print(json.dumps(check_trust_gate(args.trust), indent=2))
        return 0

    if args.discover:
        print(json.dumps(discover_endpoints(args.query, base_url=args.base_url), indent=2))
        return 0

    parser.print_help()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
