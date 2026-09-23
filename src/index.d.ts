export class ApiError extends Error { status?: number; body?: unknown; response?: Response; }
export interface ApiClientOptions { baseUrl?: string; headers?: HeadersInit; fetch?: typeof fetch; timeout?: number; retries?: number; }
export interface RequestOptions extends Omit<RequestInit, "method" | "body" | "headers"> { method?: string; headers?: HeadersInit; body?: BodyInit | Record<string, unknown>; }
export interface ApiClient { request<T = unknown>(path: string, options?: RequestOptions): Promise<T>; get<T = unknown>(path: string, options?: RequestOptions): Promise<T>; post<T = unknown>(path: string, body?: RequestOptions["body"], options?: RequestOptions): Promise<T>; put<T = unknown>(path: string, body?: RequestOptions["body"], options?: RequestOptions): Promise<T>; delete<T = unknown>(path: string, options?: RequestOptions): Promise<T>; }
export declare function createApiClient(options?: ApiClientOptions): ApiClient;
