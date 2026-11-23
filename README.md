# liveagentdata-mcp

[![MCPWhitelist Verified](https://mcpwhitelist.com/v1/badge/gh-claude-code.svg)](https://mcpwhitelist.com/agent/gh-claude-code)

Open-source STDIO & Streamable HTTP MCP bridge for **[LiveAgentData.com](https://liveagentdata.com)**, **[LiveEndpoints.com](https://liveendpoints.com)**, **[LiveGovContracts.com](https://livegovcontracts.com)**, **[EnterpriseSalesData.com](https://enterprisesalesdata.com)**, and **[TinkerMCP Studio](https://tinkermcp.com)**.

- Discover live public-record APIs across US federal procurement, SEC EDGAR corporate registries, OpenFDA healthcare surveillance, CISA security feeds, and prediction markets
- Inspect verified MCP supply-chain verdicts via `agentwhitelist.com`

## Instant Zero-Account Install (Node & Python Directly From GitHub)

```bash
# Node.js CLI
npx --yes github:shinnjr/liveagentdata-mcp --discover --query edgar

# Python CLI via uvx or pip
uvx --from git+https://github.com/shinnjr/liveagentdata-mcp.git liveagentdata --discover --query edgar
pip install git+https://github.com/shinnjr/liveagentdata-mcp.git
```

Prebuilt `.whl`, `.tar.gz`, and `.tgz` release archives are attached on every [GitHub Release](https://github.com/shinnjr/liveagentdata-mcp/releases).

## Claude Desktop / Cursor / Cline Configuration

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

Or connect directly via Streamable HTTP MCP: `https://liveagentdata.com/mcp`.
