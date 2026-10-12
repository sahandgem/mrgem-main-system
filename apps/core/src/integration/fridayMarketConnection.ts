import { HttpModuleAdapter } from "./adapters/httpModuleAdapter";
import { fridayMarketRegistryEntry } from "./registry/moduleRegistry";
import type { CommandCenterDataSourceExtension } from "./commandCenter/commandCenterLiveDataSource";

const authMessageType = "master-gem:friday-market-auth";
let inMemoryAccessToken: string | null = null;
let tokenExpiresAt = 0;
let authGeneration = 0;
const MAX_TOKEN_LENGTH = 8192;
const TOKEN_LIFETIME_MS = 20 * 60 * 1000;

export function validFridayMarketToken(input: unknown): input is string {
  return typeof input === "string" && input.length >= 20 && input.length <= MAX_TOKEN_LENGTH && !/\s/.test(input);
}

type ViteEnv = Record<string, string | undefined>;

function env(): ViteEnv {
  return ((import.meta as ImportMeta & { env?: ViteEnv }).env ?? {});
}

export function fridayMarketBridgeEndpoint() {
  return env().VITE_FRIDAY_MARKET_CORE_ENDPOINT?.trim() || null;
}

export function fridayMarketAuthorizeUrl() {
  return env().VITE_AUDIT_APP_AUTHORIZE_URL?.trim() || null;
}

export function fridayMarketBridgeConfigured() {
  return Boolean(fridayMarketBridgeEndpoint() && fridayMarketAuthorizeUrl());
}

export function getFridayMarketAccessToken() {
  if (inMemoryAccessToken && Date.now() >= tokenExpiresAt) {
    clearFridayMarketAccessToken();
  }
  return inMemoryAccessToken;
}

export function clearFridayMarketAccessToken() {
  authGeneration++;
  inMemoryAccessToken = null;
  tokenExpiresAt = 0;
}

export async function verifyFridayMarketBridgeAccess(
  accessToken: string,
  endpointOverride?: string,
) {
  const endpoint = endpointOverride ?? fridayMarketBridgeEndpoint();
  if (!endpoint || !validFridayMarketToken(accessToken)) return false;
  const token = accessToken;

  const adapter = new HttpModuleAdapter(
    "finance.friday-market",
    "http.friday-market.connection-check",
    endpoint,
    undefined,
    () => token,
  );
  const result = await adapter.read();
  return result.kind === "data";
}

export function fridayMarketDataSourceExtension(): CommandCenterDataSourceExtension | null {
  const endpoint = fridayMarketBridgeEndpoint();
  const authorizeUrl = fridayMarketAuthorizeUrl();
  if (!endpoint || !authorizeUrl || !getFridayMarketAccessToken()) return null;

  const detailUrl = new URL("/friday-market", authorizeUrl).toString();
  const entry = fridayMarketRegistryEntry(detailUrl);
  return {
    entries: [entry],
    adapters: {
      [entry.adapterKey]: new HttpModuleAdapter(
        entry.moduleId,
        entry.adapterKey,
        endpoint,
        undefined,
        getFridayMarketAccessToken,
      ),
    },
  };
}

export function authorizeFridayMarket(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  const authorizeUrl = fridayMarketAuthorizeUrl();
  if (!authorizeUrl) return Promise.resolve(false);

  const target = new URL(authorizeUrl);
  // A remote login endpoint must use transport encryption.
  if (target.protocol !== "https:" && !(target.protocol === "http:" && target.hostname === "localhost")) return Promise.resolve(false);
  const generation = authGeneration;
  target.searchParams.set("origin", window.location.origin);
  const popup = window.open(target.toString(), "master-gem-friday-market-auth", "width=520,height=640");
  if (!popup) return Promise.resolve(false);
  const expectedOrigin = target.origin;

  return new Promise((resolve) => {
    let settled = false;
    let verifying = false;
    const finish = (value: boolean) => {
      if (settled) return;
      settled = true;
      window.removeEventListener("message", onMessage);
      window.clearInterval(closedCheck);
      window.clearTimeout(timeout);
      try { popup.close(); } catch { /* popup may already be closed */ }
      resolve(value);
    };
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== expectedOrigin || event.source !== popup || verifying) return;
      const data = event.data as { type?: string; accessToken?: string } | null;
      if (data?.type !== authMessageType || !validFridayMarketToken(data.accessToken)) return;

      const accessToken = data.accessToken;
      verifying = true;
      window.clearInterval(closedCheck);
      void verifyFridayMarketBridgeAccess(accessToken).then((verified) => {
        if (settled) return;
        if (!verified || generation !== authGeneration) {
          finish(false);
          return;
        }
        inMemoryAccessToken = accessToken;
        tokenExpiresAt = Date.now() + TOKEN_LIFETIME_MS;
        finish(true);
      }).catch(() => finish(false));
    };
    window.addEventListener("message", onMessage);
    const closedCheck = window.setInterval(() => {
      if (popup.closed) finish(false);
    }, 500);
    const timeout = window.setTimeout(() => finish(false), 120_000);
  });
}

export const fridayMarketAuthMessageType = authMessageType;
