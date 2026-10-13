export type CoreAuthPhase =
  | "unauthenticated"
  | "authenticating"
  | "authenticated"
  | "error";

export interface CoreAuthSnapshot {
  phase: CoreAuthPhase;
  configured: boolean;
  email?: string;
  message?: string;
}

export interface CoreAuthCredentials {
  email: string;
  password: string;
}

export type CoreAuthSignInOutcome =
  | { status: "authenticated" }
  | { status: "rejected"; message: string }
  | { status: "unavailable"; message: string };

export type CoreAuthListener = (snapshot: CoreAuthSnapshot) => void;

export interface CoreAuthProvider {
  readonly kind: "closed" | "trusted";
  getSnapshot(): CoreAuthSnapshot;
  subscribe(listener: CoreAuthListener): () => void;
  initialize(): Promise<void>;
  signIn(credentials: CoreAuthCredentials): Promise<CoreAuthSignInOutcome>;
  signOut(): Promise<void>;
  getAccessToken(): Promise<string | null>;
  dispose(): void;
}

export type CoreAuthProviderFactory = () => CoreAuthProvider;

export interface AuthStorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface CoreAuthStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

const AUTH_NOT_ACTIVE_MESSAGE = "احراز هویت واقعی هنوز فعال نشده است.";

export function createSessionStorageAuthStorage(storage: AuthStorageLike): CoreAuthStorage {
  if (!storage
      || typeof storage.getItem !== "function"
      || typeof storage.setItem !== "function"
      || typeof storage.removeItem !== "function") {
    throw new Error("CORE_AUTH_SESSION_STORAGE_INVALID");
  }

  return Object.freeze({
    async getItem(key: string) {
      return storage.getItem(key);
    },
    async setItem(key: string, value: string) {
      storage.setItem(key, value);
    },
    async removeItem(key: string) {
      storage.removeItem(key);
    },
  });
}

export function createClosedCoreAuthProvider(): CoreAuthProvider {
  let snapshot: CoreAuthSnapshot = Object.freeze({
    phase: "unauthenticated",
    configured: false,
    message: AUTH_NOT_ACTIVE_MESSAGE,
  });
  const listeners = new Set<CoreAuthListener>();

  const publish = (next: CoreAuthSnapshot) => {
    snapshot = Object.freeze(next);
    for (const listener of listeners) listener(snapshot);
  };

  return Object.freeze({
    kind: "closed" as const,
    getSnapshot() {
      return snapshot;
    },
    subscribe(listener: CoreAuthListener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    async initialize() {},
    async signIn() {
      publish({
        phase: "error",
        configured: false,
        message: AUTH_NOT_ACTIVE_MESSAGE,
      });
      return {
        status: "unavailable" as const,
        message: AUTH_NOT_ACTIVE_MESSAGE,
      };
    },
    async signOut() {
      publish({
        phase: "unauthenticated",
        configured: false,
        message: AUTH_NOT_ACTIVE_MESSAGE,
      });
    },
    async getAccessToken() {
      return null;
    },
    dispose() {},
  });
}

export function isCoreAuthEmail(value: string): boolean {
  const email = String(value || "").trim();
  return email.length >= 5
    && email.length <= 254
    && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isCoreAuthPassword(value: string): boolean {
  return typeof value === "string" && value.length >= 8 && value.length <= 512;
}
