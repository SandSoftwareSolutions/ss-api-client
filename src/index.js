export class ApiError extends Error {
  constructor(message, { status, body, response } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
    this.response = response;
  }
}

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const retryable = (status) => status === 408 || status === 429 || status >= 500;

export function createApiClient({ baseUrl = "", headers = {}, fetch: fetchImplementation = globalThis.fetch, timeout = 10_000, retries = 1 } = {}) {
  if (typeof fetchImplementation !== "function") throw new TypeError("fetch must be available");
  if (!Number.isSafeInteger(timeout) || timeout < 1) throw new TypeError("timeout must be a positive integer");
  if (!Number.isSafeInteger(retries) || retries < 0) throw new TypeError("retries must be a non-negative integer");

  async function request(path, { method = "GET", headers: requestHeaders, body, signal, ...options } = {}) {
    const url = new URL(path, baseUrl || globalThis.location?.origin).toString();
    const payload = body && typeof body === "object" && !(body instanceof FormData) ? JSON.stringify(body) : body;
    const mergedHeaders = { accept: "application/json", ...headers, ...requestHeaders };
    if (payload && !mergedHeaders["content-type"] && !(body instanceof FormData)) mergedHeaders["content-type"] = "application/json";

    for (let attempt = 0; ; attempt += 1) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(new Error("Request timed out")), timeout);
      const abort = () => controller.abort(signal?.reason);
      signal?.addEventListener("abort", abort, { once: true });
      try {
        const response = await fetchImplementation(url, { ...options, method, headers: mergedHeaders, body: payload, signal: controller.signal });
        const contentType = response.headers.get("content-type") ?? "";
        const parsed = contentType.includes("application/json") ? await response.json() : await response.text();
        if (response.ok) return parsed;
        if (attempt < retries && retryable(response.status)) { await delay(100 * 2 ** attempt); continue; }
        throw new ApiError(`Request failed with ${response.status}`, { status: response.status, body: parsed, response });
      } catch (error) {
        if (error instanceof ApiError || attempt >= retries || signal?.aborted) throw error;
        await delay(100 * 2 ** attempt);
      } finally {
        clearTimeout(timer);
        signal?.removeEventListener("abort", abort);
      }
    }
  }
  return { request, get: (path, options) => request(path, options), post: (path, body, options) => request(path, { ...options, method: "POST", body }), put: (path, body, options) => request(path, { ...options, method: "PUT", body }), delete: (path, options) => request(path, { ...options, method: "DELETE" }) };
}
