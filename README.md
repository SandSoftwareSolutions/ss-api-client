# @sandsoftwaresolutions/api-client

[![CI](https://github.com/SandSoftwareSolutions/ss-api-client/actions/workflows/ci.yml/badge.svg)](https://github.com/SandSoftwareSolutions/ss-api-client/actions/workflows/ci.yml)

A dependency-free fetch client for browsers, Node.js 18+, workers and edge runtimes. It handles JSON, base URLs, time-outs, retries and useful API errors.

## Install

```bash
npm install @sandsoftwaresolutions/api-client
```

Works with `import` and `require()`, and ships TypeScript types for both.

## Usage

```js
import { ApiError, createApiClient } from "@sandsoftwaresolutions/api-client";

const api = createApiClient({
  baseUrl: "https://api.example.com/v1/",
  headers: { authorization: `Bearer ${token}` },
  timeout: 10_000,
  retries: 2,
});

const user = await api.get("users/me");
const invoice = await api.post("invoices", { customerId: "cus_1" });

try { await api.delete("invoices/unknown"); }
catch (error) { if (error instanceof ApiError) console.log(error.status, error.body); }
```

## API

The returned client exposes `request`, `get`, `post`, `put`, and `delete`. Object request bodies are sent as JSON; JSON responses are parsed automatically. Non-2xx results raise `ApiError` with `status`, `body`, and `response`.

Only network failures and HTTP `408`, `429`, and `5xx` responses are retried with a small exponential backoff. Keep mutating requests idempotent before enabling retries, and never place server secrets in browser-side headers.
