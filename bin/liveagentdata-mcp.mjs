#!/usr/bin/env node
export const VERTICAL_HOSTS = [
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
];

export async function discoverEndpoints(baseUrl = "https://liveagentdata.com", query = "", fetchImpl = fetch) {
  const endpoint = query
    ? `${baseUrl}/v1/apis/search?q=${encodeURIComponent(query)}`
    : `${baseUrl}/v1/discover`;
  const res = await fetchImpl(endpoint, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Discovery HTTP ${res.status}`);
  return res.json();
}

export async function handleJsonRpcMessage(msg, env = {}, fetchImpl = fetch) {
  const id = msg?.id ?? null;
  if (msg?.method === "initialize") {
    return {
      jsonrpc: "2.0",
      id,
      result: {
        protocolVersion: "2024-11-05",
        serverInfo: { name: "liveagentdata-mcp", version: "1.0.0" },
        capabilities: { tools: {} },
      },
    };
  }
  if (msg?.method === "tools/list") {
    return {
      jsonrpc: "2.0",
      id,
      result: {
        tools: [
          {
            name: "search_live_feeds",
            description: "Search callable telemetry APIs across LiveAgentData & LiveEndpoints.",
            inputSchema: { type: "object", properties: { q: { type: "string" } }, required: ["q"] },
          },
        ],
      },
    };
  }
  if (msg?.method === "tools/call" && msg?.params?.name === "search_live_feeds") {
    const q = String(msg?.params?.arguments?.q || "");
    const data = await discoverEndpoints(env.LIVEAGENTDATA_URL || "https://liveagentdata.com", q, fetchImpl);
    return {
      jsonrpc: "2.0",
      id,
      result: { content: [{ type: "text", text: JSON.stringify(data) }] },
    };
  }
  return { jsonrpc: "2.0", id, error: { code: -32601, message: "Method not found" } };
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes("--discover")) {
    const qIdx = args.indexOf("--query");
    const q = qIdx !== -1 ? args[qIdx + 1] : "";
    const data = await discoverEndpoints("https://liveagentdata.com", q);
    console.log(JSON.stringify(data, null, 2));
    return;
  }
  console.log("liveagentdata-mcp ready. Run with --discover [--query sec] or pipe MCP JSON-RPC over stdio.");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}
