import type { CoreAuthProvider } from "../auth/coreAuthProvider";
import type { SanitizedTransportFailureCategory } from "./sanitizedModuleTransport";

export interface BffReadRequest {
  method: "GET";
  path: string;
  headers: Readonly<Record<string, string>>;
}

export interface BffReadResponse {
  statusCode: number;
  body: unknown;
}

export interface BffRequestExecutor {
  execute(request: BffReadRequest): Promise<BffReadResponse>;
}

export interface AuthenticatedBffReadOptions {
  authProvider: CoreAuthProvider;
  executor: BffRequestExecutor;
  path: string;
}

export class AuthenticatedBffReadError extends Error {
  readonly category: SanitizedTransportFailureCategory;

  constructor(category: SanitizedTransportFailureCategory) {
    super("Authenticated BFF read failed.");
    this.name = "AuthenticatedBffReadError";
    this.category = category;
  }
}

function validPath(value: string): boolean {
  return /^\/api\/[a-z0-9/_-]+$/i.test(value)
    && !value.includes("//")
    && !value.includes("..");
}

function validAccessToken(value: string | null): value is string {
  return typeof value === "string"
    && value.length >= 20
    && value.length <= 16384
    && !/\s/.test(value);
}

function statusCategory(statusCode: number): SanitizedTransportFailureCategory {
  if (statusCode === 401) return "unauthorized";
  if (statusCode === 403) return "forbidden";
  if (statusCode === 404) return "not_found";
  if (statusCode === 409) return "contract_mismatch";
  if (statusCode === 504) return "timeout";
  if (statusCode === 400 || statusCode === 422) return "validation";
  if (statusCode >= 500 && statusCode <= 599) return "unavailable";
  return "unknown";
}

function validateOptions(options: AuthenticatedBffReadOptions) {
  if (!options?.authProvider
      || typeof options.authProvider.getAccessToken !== "function"
      || typeof options.authProvider.signOut !== "function") {
    throw new Error("CORE_BFF_AUTH_PROVIDER_INVALID");
  }
  if (!options.executor || typeof options.executor.execute !== "function") {
    throw new Error("CORE_BFF_REQUEST_EXECUTOR_INVALID");
  }
  if (!validPath(options.path)) {
    throw new Error("CORE_BFF_REQUEST_PATH_INVALID");
  }
}

export function createAuthenticatedBffJsonReader(
  options: AuthenticatedBffReadOptions,
) {
  validateOptions(options);

  return Object.freeze({
    async read(): Promise<unknown> {
      let token: string | null;
      try {
        token = await options.authProvider.getAccessToken();
      } catch {
        throw new AuthenticatedBffReadError("unauthorized");
      }
      if (!validAccessToken(token)) {
        throw new AuthenticatedBffReadError("unauthorized");
      }

      let response: BffReadResponse;
      try {
        response = await options.executor.execute(Object.freeze({
          method: "GET" as const,
          path: options.path,
          headers: Object.freeze({
            accept: "application/json",
            authorization: `Bearer ${token}`,
          }),
        }));
      } catch {
        throw new AuthenticatedBffReadError("unavailable");
      }

      const statusCode = Number(response?.statusCode);
      if (statusCode === 200) {
        // Responses that arrive after logout or token rotation are not current data.
        let currentToken: string | null;
        try {
          currentToken = await options.authProvider.getAccessToken();
        } catch {
          throw new AuthenticatedBffReadError("unauthorized");
        }
        if (currentToken !== token) throw new AuthenticatedBffReadError("unauthorized");
        return response.body;
      }

      if (statusCode === 401) {
        try {
          // Do not revoke a newer session because an old in-flight request got a 401.
          const currentToken = await options.authProvider.getAccessToken();
          if (currentToken === token) {
            await options.authProvider.signOut();
          }
        } catch {
          // The current request still fails closed; no raw provider error escapes.
        }
      }

      throw new AuthenticatedBffReadError(statusCategory(statusCode));
    },
  });
}
