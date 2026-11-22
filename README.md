# liveagentdata-mcp

[![MCPWhitelist Verified](https://mcpwhitelist.com/v1/badge/gh-claude-code.svg)](https://mcpwhitelist.com/agent/gh-claude-code)

Open-source STDIO & Streamable HTTP MCP bridge for **[LiveAgentData.com](https://liveagentdata.com)**, **[LiveEndpoints.com](https://liveendpoints.com)**, and **[TinkerMCP Studio](https://tinkermcp.com)**.

- Discover live public-record APIs across US federal procurement, SEC EDGAR corporate registries, OpenFDA healthcare surveillance, CISA security feeds, and prediction markets
- Inspect verified MCP supply-chain verdicts via `agentwhitelist.com`

## Discovery & STDIO Server

```bash
node bin/liveagentdata-mcp.mjs --discover --query edgar
```

Claude Desktop / Cursor config:

```json
{
  "mcpServers": {
    "liveagentdata": {
      "command": "node",
      "args": ["./bin/liveagentdata-mcp.mjs", "--mcp"]
    }
  }
}
```

Or connect directly via Streamable HTTP MCP: `https://liveagentdata.com/mcp` ([Glama MCP Servers](https://glama.ai/mcp/servers)).
