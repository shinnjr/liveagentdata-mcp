# liveagentdata-mcp

Lightweight open-source MCP bridge for **[LiveAgentData.com](https://liveagentdata.com)** and **[LiveEndpoints.com](https://liveendpoints.com)**.

```bash
node bin/liveagentdata-mcp.mjs --discover --query edgar
```

Claude Desktop / Cursor config:

```json
{
  "mcpServers": {
    "liveagentdata": {
      "command": "node",
      "args": ["./bin/liveagentdata-mcp.mjs"]
    }
  }
}
```
