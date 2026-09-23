import assert from "node:assert/strict";
import test from "node:test";
import { ApiError, createApiClient } from "./src/index.js";
test("adds a base URL and parses JSON", async () => {
  const client = createApiClient({ baseUrl: "https://api.example.com/v1/", fetch: async (url) => { assert.equal(url, "https://api.example.com/v1/users"); return new Response(JSON.stringify({ id: "u1" }), { headers: { "content-type": "application/json" } }); } });
  assert.deepEqual(await client.get("users"), { id: "u1" });
});
test("serializes JSON request bodies", async () => {
  const client = createApiClient({ baseUrl: "https://api.example.com", fetch: async (_, options) => { assert.equal(options.body, '{"name":"Ada"}'); return new Response(null, { status: 204 }); } });
  assert.equal(await client.post("/users", { name: "Ada" }), "");
});
test("exposes failed responses as ApiError", async () => {
  const client = createApiClient({ baseUrl: "https://api.example.com", retries: 0, fetch: async () => new Response(JSON.stringify({ error: "missing" }), { status: 404, headers: { "content-type": "application/json" } }) });
  await assert.rejects(() => client.get("/users/nope"), (error) => error instanceof ApiError && error.status === 404 && error.body.error === "missing");
});
