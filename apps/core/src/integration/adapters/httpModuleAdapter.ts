import type { ModuleReadAdapter } from "./moduleAdapter";

export type ModuleFetch = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
const MAX_RESPONSE_CHARS = 512 * 1024;
const REQUEST_TIMEOUT_MS = 10_000;

export class HttpModuleAdapter implements ModuleReadAdapter {
  public readonly moduleId: string;
  public readonly adapterKey: string;
  private readonly endpoint: string;
  private readonly fetcher: ModuleFetch;
  private readonly accessToken?: () => string | null;

  constructor(moduleId: string, adapterKey: string, endpoint: string, fetcher: ModuleFetch = fetch, accessToken?: () => string | null) {
    this.moduleId = moduleId;
    this.adapterKey = adapterKey;
    this.endpoint = endpoint;
    this.fetcher = fetcher;
    this.accessToken = accessToken;
  }

  async read() {
    const token = this.accessToken?.() ?? null;
    if (this.accessToken && !token) {
      return {kind: "unavailable" as const, error: {code: "AUTH_REQUIRED", message: "Authenticated access is required."}};
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await this.fetcher(this.endpoint, {
        method: "GET",
        headers: {Accept: "application/json", ...(token ? {Authorization: "Bearer " + token} : {})},
        credentials: "same-origin",
        cache: "no-store",
        signal: controller.signal,
      });
      if (this.accessToken && this.accessToken() !== token) {
        return {kind: "unavailable" as const, error: {code: "AUTH_CHANGED", message: "Session changed."}};
      }
      if (response.status === 204) return {kind: "no_data" as const};
      if (!response.ok) return {kind: "unavailable" as const, error: {code: "HTTP_" + response.status, message: "Module unavailable."}};
      const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
      if (!contentType.includes("application/json") && !contentType.includes("+json"))
        return {kind: "unavailable" as const, error: {code: "UNEXPECTED_CONTENT_TYPE", message: "Unexpected module response."}};
      const declaredLength = Number(response.headers.get("content-length") ?? 0);
      if (declaredLength > MAX_RESPONSE_CHARS)
        return {kind: "unavailable" as const, error: {code: "OVERSIZED_RESPONSE", message: "Module response is too large."}};
      const body = await response.text();
      if (body.length > MAX_RESPONSE_CHARS)
        return {kind: "unavailable" as const, error: {code: "OVERSIZED_RESPONSE", message: "Module response is too large."}};
      if (this.accessToken && this.accessToken() !== token)
        return {kind: "unavailable" as const, error: {code: "AUTH_CHANGED", message: "Session changed."}};
      return {kind: "data" as const, raw: JSON.parse(body) as unknown};
    } catch {
      return {kind: "unavailable" as const, error: {code: controller.signal.aborted ? "REQUEST_TIMEOUT" : "FETCH_FAILED", message: "Module request failed."}};
    } finally {
      clearTimeout(timeout);
    }
  }
}
