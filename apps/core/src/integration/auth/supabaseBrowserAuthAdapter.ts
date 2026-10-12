import {
  isCoreAuthEmail,
  isCoreAuthPassword,
  type CoreAuthCredentials,
  type CoreAuthListener,
  type CoreAuthProvider,
  type CoreAuthSnapshot,
  type CoreAuthStorage,
} from "./coreAuthProvider";

export interface SupabaseAuthUserLike {
  id?: string;
  email?: string | null;
}

export interface SupabaseAuthSessionLike {
  access_token?: string;
  expires_at?: number;
  user?: SupabaseAuthUserLike | null;
}

export interface SupabaseAuthResultLike {
  data?: {
    session?: SupabaseAuthSessionLike | null;
    user?: SupabaseAuthUserLike | null;
  } | null;
  error?: unknown;
}

export interface SupabaseSessionResultLike {
  data?: {
    session?: SupabaseAuthSessionLike | null;
  } | null;
  error?: unknown;
}

export interface SupabaseAuthSubscriptionLike {
  unsubscribe(): void;
}

export interface SupabaseBrowserAuthClientLike {
  auth: {
    getSession(): Promise<SupabaseSessionResultLike>;
    signInWithPassword(credentials: { email: string; password: string }): Promise<SupabaseAuthResultLike>;
    signOut(options: { scope: "local" }): Promise<{ error?: unknown }>;
    onAuthStateChange(
      callback: (event: string, session: SupabaseAuthSessionLike | null) => void,
    ): {
      data?: {
        subscription?: SupabaseAuthSubscriptionLike;
      } | null;
    };
  };
}

export interface SupabaseBrowserAuthAdapterOptions {
  client: SupabaseBrowserAuthClientLike;
}

export interface SupabaseBrowserAuthClientOptions {
  auth: {
    persistSession: true;
    autoRefreshToken: true;
    detectSessionInUrl: false;
    storage: CoreAuthStorage;
  };
}

const SIGN_IN_REJECTED_MESSAGE = "ایمیل یا رمز عبور صحیح نیست.";
const AUTH_UNAVAILABLE_MESSAGE = "ورود در حال حاضر در دسترس نیست. لطفاً دوباره تلاش کنید.";

function cleanEmail(value: unknown): string | undefined {
  const email = typeof value === "string" ? value.trim() : "";
  return isCoreAuthEmail(email) ? email : undefined;
}

function accessTokenFromSession(session: SupabaseAuthSessionLike | null | undefined): string | null {
  const token = typeof session?.access_token === "string" ? session.access_token.trim() : "";
  if (token.length < 20 || token.length > 16384) return null;
  // A browser may still hold a syntactically valid but expired session.
  const expiresAt = session?.expires_at;
  if (expiresAt !== undefined && (!Number.isSafeInteger(expiresAt) || expiresAt <= Date.now() / 1000)) return null;
  return token;
}

function configuredSnapshot(
  phase: CoreAuthSnapshot["phase"],
  values: Pick<CoreAuthSnapshot, "email" | "message"> = {},
): CoreAuthSnapshot {
  return Object.freeze({
    phase,
    configured: true,
    ...(values.email ? { email: values.email } : {}),
    ...(values.message ? { message: values.message } : {}),
  });
}

function validateClient(client: SupabaseBrowserAuthClientLike | undefined): asserts client is SupabaseBrowserAuthClientLike {
  const auth = client?.auth;
  if (!auth
      || typeof auth.getSession !== "function"
      || typeof auth.signInWithPassword !== "function"
      || typeof auth.signOut !== "function"
      || typeof auth.onAuthStateChange !== "function") {
    throw new Error("CORE_SUPABASE_AUTH_CLIENT_INVALID");
  }
}

export function buildSupabaseBrowserAuthClientOptions(
  storage: CoreAuthStorage,
): SupabaseBrowserAuthClientOptions {
  if (!storage
      || typeof storage.getItem !== "function"
      || typeof storage.setItem !== "function"
      || typeof storage.removeItem !== "function") {
    throw new Error("CORE_SUPABASE_AUTH_STORAGE_INVALID");
  }

  return Object.freeze({
    auth: Object.freeze({
      persistSession: true as const,
      autoRefreshToken: true as const,
      detectSessionInUrl: false as const,
      storage,
    }),
  });
}

export function createSupabaseBrowserAuthAdapter(
  options: SupabaseBrowserAuthAdapterOptions,
): CoreAuthProvider {
  validateClient(options?.client);
  const client = options.client;
  const listeners = new Set<CoreAuthListener>();
  let snapshot: CoreAuthSnapshot = configuredSnapshot("unauthenticated");
  let accessToken: string | null = null;
  let subscription: SupabaseAuthSubscriptionLike | null = null;
  let initialized = false;
  let disposed = false;
  let initializationSequence = 0;
  // A user-initiated sign-out invalidates in-flight session restores and sign-ins.
  let authGeneration = 0;
  let localSignOutBarrier = false;
  let signOutPending = false;

  const publish = (next: CoreAuthSnapshot) => {
    snapshot = Object.freeze(next);
    for (const listener of listeners) listener(snapshot);
  };

  const clearSession = (message?: string) => {
    accessToken = null;
    publish(configuredSnapshot(message ? "error" : "unauthenticated", { message }));
  };

  const adoptSession = (session: SupabaseAuthSessionLike | null | undefined): boolean => {
    const token = accessTokenFromSession(session);
    if (!token) {
      clearSession();
      return false;
    }
    accessToken = token;
    publish(configuredSnapshot("authenticated", {
      email: cleanEmail(session?.user?.email),
    }));
    return true;
  };

  const authStateChanged = (event: string, session: SupabaseAuthSessionLike | null) => {
    if (disposed) return;
    if (event === "SIGNED_OUT" || !session) {
      authGeneration += 1;
      localSignOutBarrier = true;
      clearSession();
      return;
    }
    // Late SDK callbacks must not reopen a locally signed-out manager route.
    if (localSignOutBarrier || signOutPending || snapshot.phase === "authenticating") return;
    adoptSession(session);
  };

  return Object.freeze({
    kind: "trusted" as const,

    getSnapshot() {
      return snapshot;
    },

    subscribe(listener: CoreAuthListener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    async initialize() {
      if (initialized) return;
      const sequence = ++initializationSequence;
      const generation = authGeneration;
      disposed = false;
      initialized = true;

      try {
        const authState = client.auth.onAuthStateChange(authStateChanged);
        const nextSubscription = authState?.data?.subscription;
        if (!nextSubscription || typeof nextSubscription.unsubscribe !== "function") {
          initialized = false;
          clearSession(AUTH_UNAVAILABLE_MESSAGE);
          return;
        }
        subscription = nextSubscription;

        const result = await client.auth.getSession();
        if (sequence !== initializationSequence || disposed || generation !== authGeneration || localSignOutBarrier) return;
        if (result?.error) {
          clearSession(AUTH_UNAVAILABLE_MESSAGE);
          return;
        }
        adoptSession(result?.data?.session ?? null);
      } catch {
        if (sequence !== initializationSequence || disposed || generation !== authGeneration || localSignOutBarrier) return;
        initialized = false;
        subscription?.unsubscribe();
        subscription = null;
        clearSession(AUTH_UNAVAILABLE_MESSAGE);
      }
    },

    async signIn(credentials: CoreAuthCredentials) {
      if (disposed || signOutPending) {
        return {
          status: "unavailable" as const,
          message: AUTH_UNAVAILABLE_MESSAGE,
        };
      }

      const email = String(credentials?.email || "").trim();
      const password = typeof credentials?.password === "string" ? credentials.password : "";
      if (!isCoreAuthEmail(email) || !isCoreAuthPassword(password)) {
        clearSession(SIGN_IN_REJECTED_MESSAGE);
        return {
          status: "rejected" as const,
          message: SIGN_IN_REJECTED_MESSAGE,
        };
      }

      localSignOutBarrier = false;
      const generation = ++authGeneration;
      publish(configuredSnapshot("authenticating", { email }));

      try {
        const result = await client.auth.signInWithPassword({ email, password });
        if (generation !== authGeneration || disposed || localSignOutBarrier) {
          return { status: "unavailable" as const, message: AUTH_UNAVAILABLE_MESSAGE };
        }
        if (result?.error) {
          clearSession(SIGN_IN_REJECTED_MESSAGE);
          return {
            status: "rejected" as const,
            message: SIGN_IN_REJECTED_MESSAGE,
          };
        }

        const session = result?.data?.session ?? null;
        if (!adoptSession(session)) {
          clearSession(AUTH_UNAVAILABLE_MESSAGE);
          return {
            status: "unavailable" as const,
            message: AUTH_UNAVAILABLE_MESSAGE,
          };
        }

        return { status: "authenticated" as const };
      } catch {
        if (generation === authGeneration && !disposed && !localSignOutBarrier) {
          clearSession(AUTH_UNAVAILABLE_MESSAGE);
        }
        return {
          status: "unavailable" as const,
          message: AUTH_UNAVAILABLE_MESSAGE,
        };
      }
    },

    async signOut() {
      if (signOutPending) return;
      authGeneration += 1;
      localSignOutBarrier = true;
      signOutPending = true;
      accessToken = null;
      publish(configuredSnapshot("unauthenticated"));

      try {
        const result = await client.auth.signOut({ scope: "local" });
        if (result?.error && !disposed) {
          publish(configuredSnapshot("error", {
            message: "خروج سمت سرور کامل نشد؛ برای ادامه دوباره وارد شوید.",
          }));
        }
      } catch {
        if (!disposed) {
          publish(configuredSnapshot("error", {
            message: "خروج سمت سرور کامل نشد؛ برای ادامه دوباره وارد شوید.",
          }));
        }
      } finally {
        signOutPending = false;
      }
    },

    async getAccessToken() {
      return !disposed && !localSignOutBarrier && snapshot.phase === "authenticated" ? accessToken : null;
    },

    dispose() {
      if (disposed && !initialized) return;
      disposed = true;
      initialized = false;
      initializationSequence += 1;
      authGeneration += 1;
      accessToken = null;
      subscription?.unsubscribe();
      subscription = null;
      listeners.clear();
    },
  });
}
