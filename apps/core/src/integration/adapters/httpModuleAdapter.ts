import type { ModuleReadAdapter } from "./moduleAdapter";

export type ModuleFetch = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;

export class HttpModuleAdapter implements ModuleReadAdapter {
  public readonly moduleId: string;
  public readonly adapterKey: string;
  private readonly endpoint: string;
  private readonly fetcher: ModuleFetch;
  private readonly accessToken?: () => string | null;

  constructor(
    moduleId: string,
    adapterKey: string,
    endpoint: string,
    fetcher: ModuleFetch = fetch,
    accessToken?: () => string | null,
  ) {
    this.moduleId = moduleId;
    this.adapterKey = adapterKey;
    this.endpoint = endpoint;
    this.fetcher = fetcher;
    this.accessToken = accessToken;
  }

  async read() {
    const token = this.accessToken?.() ?? null;
    if (this.accessToken && !token) {
      return {
        kind: "unavailable" as const,
        error: {
          code: "AUTH_REQUIRED",
          message: "Authenticated access to the module endpoint is required.",
        },
      };
    }

    try {
      const response = await this.fetcher(this.endpoint, {
        method: "GET",
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "same-origin",
        cache: "no-store",
      });
      if (response.status === 204) return { kind: "no_data" as const };
      if (!response.ok) {
        return {
          kind: "unavailable" as const,
          error: {
            code: `HTTP_${response.status}`,
            message: `Module endpoint returned HTTP ${response.status}.`,
          },
        };
      }
      return { kind: "data" as const, raw: await response.json() };
    } catch (error) {
      return {
        kind: "unavailable" as const,
        error: {
          code: "FETCH_FAILED",
          message: error instanceof Error ? error.message : "Module endpoint request failed.",
        },
      };
    }
  }
}
