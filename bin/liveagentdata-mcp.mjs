#!/usr/bin/env node
import readline from "node:readline";

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

export async function checkTrustGate(query, baseUrl = "https://agentwhitelist.com", fetchImpl = fetch) {
  const res = await fetchImpl(`${baseUrl}/v1/check?q=${encodeURIComponent(String(query || ""))}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Trust Check HTTP ${res.status}`);
  return res.json();
}

export async function handleJsonRpcMessage(msg, env = {}, fetchImpl = fetch) {
  const id = msg?.id ?? null;
  if (msg?.method === "notifications/initialized" || msg?.method === "notifications/cancelled") {
    return null;
  }
  if (msg?.method === "initialize") {
    return {
      jsonrpc: "2.0",
      id,
      result: {
        protocolVersion: "2024-11-05",
        serverInfo: { name: "liveagentdata-mcp", version: "1.1.0" },
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
          {
            name: "check_supply_chain_trust",
            description: "Inspect SHA-512 verification and security verdict for an MCP server or AI package.",
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
  if (msg?.method === "tools/call" && msg?.params?.name === "check_supply_chain_trust") {
    const q = String(msg?.params?.arguments?.q || "");
    const data = await checkTrustGate(q, env.AGENTWHITELIST_URL || "https://agentwhitelist.com", fetchImpl);
    return {
      jsonrpc: "2.0",
      id,
      result: { content: [{ type: "text", text: JSON.stringify(data) }] },
    };
  }
  return id !== null ? { jsonrpc: "2.0", id, error: { code: -32601, message: "Method not found" } } : null;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) {
    console.log("Usage: liveagentdata-mcp [--discover [--query <q>]] [--mcp]");
    return;
  }
  if (args.includes("--discover")) {
    const qIdx = args.indexOf("--query");
    const q = qIdx !== -1 ? args[qIdx + 1] : "";
    const data = await discoverEndpoints("https://liveagentdata.com", q);
    console.log(JSON.stringify(data, null, 2));
    return;
  }
  if (args.includes("--mcp") || !process.stdin.isTTY) {
    const rl = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });
    for await (const line of rl) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        const msg = JSON.parse(trimmed);
        const reply = await handleJsonRpcMessage(msg);
        if (reply) process.stdout.write(JSON.stringify(reply) + "\n");
      } catch (err) {
        process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id: null, error: { code: -32700, message: err.message } }) + "\n");
      }
    }
    return;
  }
  console.log("liveagentdata-mcp ready. Pipe MCP JSON-RPC over stdin or run --discover --query edgar");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}
