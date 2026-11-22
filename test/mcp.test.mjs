import test from "node:test";
import assert from "node:assert/strict";
import { handleJsonRpcMessage, VERTICAL_HOSTS } from "../bin/liveagentdata-mcp.mjs";

test("VERTICAL_HOSTS lists 12 domains without consumer property domains", () => {
  assert.equal(VERTICAL_HOSTS.length, 12);
  assert.equal(VERTICAL_HOSTS.some((h) => h.includes("shinnlist") || h.includes("shinnslist")), false);
});

test("handleJsonRpcMessage responds cleanly to initialize, tools/list, and tools/call", async () => {
  const initRes = await handleJsonRpcMessage({ jsonrpc: "2.0", id: 1, method: "initialize" });
  assert.equal(initRes.result.serverInfo.name, "liveagentdata-mcp");

  const listRes = await handleJsonRpcMessage({ jsonrpc: "2.0", id: 2, method: "tools/list" });
  assert.equal(listRes.result.tools[0].name, "search_live_feeds");

  const fakeFetch = async (url) => {
    assert.match(url, /\/v1\/apis\/search\?q=edgar/);
    return new Response(JSON.stringify({ ok: true, count: 5 }), { status: 200 });
  };
  const callRes = await handleJsonRpcMessage(
    { jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "search_live_feeds", arguments: { q: "edgar" } } },
    {},
    fakeFetch
  );
  assert.match(callRes.result.content[0].text, /"count":5/);

  const trustRes = await handleJsonRpcMessage(
    { jsonrpc: "2.0", id: 4, method: "tools/call", params: { name: "check_supply_chain_trust", arguments: { q: "claude-code" } } },
    {},
    async (url) => {
      assert.match(url, /https:\/\/agentwhitelist\.com\/v1\/check\?q=claude-code/);
      return new Response(JSON.stringify({ verdict: "GO", trust_points: 95 }), { status: 200 });
    }
  );
  assert.match(trustRes.result.content[0].text, /"verdict":"GO"/);
  assert.equal(await handleJsonRpcMessage({ jsonrpc: "2.0", method: "notifications/initialized" }), null);
});
