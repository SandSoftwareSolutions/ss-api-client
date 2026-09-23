# @sandsoftwaresolutions/api-client

A tiny fetch wrapper for browser, Node 18+, workers and edge runtimes. It handles base URLs, JSON, timeout, retryable responses and structured failures without a dependency.

```js
import { ApiError, createApiClient } from "@sandsoftwaresolutions/api-client";

const api = createApiClient({ baseUrl: "https://api.example.com", headers: { authorization: `Bearer ${token}` } });
const user = await api.get("/me");

try { await api.post("/invoices", { customerId: "cus_1" }); }
catch (error) { if (error instanceof ApiError) console.log(error.status, error.body); }
```

Only network failures and `408`, `429`, and `5xx` responses are retried. Never put secrets in browser-side client configuration.
