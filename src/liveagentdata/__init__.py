"""LiveAgentData Python client, CLI, and STDIO MCP server (zero dependencies)."""
__version__ = "1.2.0"
from .cli import VERTICAL_HOSTS, check_trust_gate, discover_endpoints, handle_mcp_message

__all__ = [
    "VERTICAL_HOSTS",
    "check_trust_gate",
    "discover_endpoints",
    "handle_mcp_message",
    "__version__",
]
