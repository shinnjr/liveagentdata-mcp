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

## Option 2: 1-Line Node.js STDIO MCP Server (`npx` Directly From GitHub)

Requires Node.js 18+:

```json
{
  "mcpServers": {
    "liveagentdata": {
      "command": "npx",
      "args": ["--yes", "github:shinnjr/liveagentdata-mcp", "--mcp"]
    }
  }
}
```

## Option 3: 1-Line Python STDIO MCP Server (`uvx` / `pip`)

```json
{
  "mcpServers": {
    "liveagentdata": {
      "command": "uvx",
      "args": ["--from", "git+https://github.com/shinnjr/liveagentdata-mcp.git", "liveagentdata", "--mcp"]
    }
  }
}
```

## Tools Exposed

1. `search_live_feeds(q)` - Searches live US federal procurement, SEC EDGAR, OpenFDA, CISA, and prediction market feeds.
2. `check_supply_chain_trust(q)` - Audits agent/MCP supply-chain trust status via AgentWhitelist.
