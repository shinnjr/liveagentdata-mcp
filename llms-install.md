# Installing LiveAgentData MCP in Cline, Cursor, or Claude Desktop

Supports 28 live public-record telemetry tools via Streamable HTTP MCP or local STDIO bridge.

## Option 1: Remote Streamable HTTP MCP (No Local Process Required)

- URL: `https://liveagentdata.com/mcp`

```json
{
  "mcpServers": {
    "liveagentdata": {
      "url": "https://liveagentdata.com/mcp"
    }
  }
}
```

## Option 2: Local Node.js STDIO MCP Server

Requires Node.js 18+:

```bash
git clone https://github.com/shinnjr/liveagentdata-mcp.git
cd liveagentdata-mcp
node bin/liveagentdata-mcp.mjs --mcp
```

Add to `cline_mcp_settings.json`, `claude_desktop_config.json`, or `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "liveagentdata": {
      "command": "node",
      "args": ["/path/to/liveagentdata-mcp/bin/liveagentdata-mcp.mjs", "--mcp"]
    }
  }
}
```

## Tools Exposed

1. `search_live_feeds(q)` - Searches live US federal procurement, SEC EDGAR, OpenFDA, CISA, and prediction market feeds.
2. `check_supply_chain_trust(q)` - Audits agent/MCP supply-chain trust status via AgentWhitelist.
