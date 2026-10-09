import assert from "node:assert/strict";
import {
  buildSupabaseBrowserAuthClientOptions,
  createSupabaseBrowserAuthAdapter,
  type SupabaseAuthSessionLike,
  type SupabaseBrowserAuthClientLike,
} from "../src/integration/auth/supabaseBrowserAuthAdapter.ts";
import { createSessionStorageAuthStorage } from "../src/integration/auth/coreAuthProvider.ts";

const ACCESS_TOKEN_1 = "access-token-1-abcdefghijklmnopqrstuvwxyz";
const ACCESS_TOKEN_2 = "access-token-2-abcdefghijklmnopqrstuvwxyz";
const EMAIL = "manager@example.com";

function session(
  accessToken = ACCESS_TOKEN_1,
  email = EMAIL,
): SupabaseAuthSessionLike {
  return {
    access_token: accessToken,
    expires_at: 1791534000,
    user: {
      id: "2dcf9f1f-0418-4af3-9509-a11dfd273001",
      email,
    },
  };
}

interface FakeClientControl {
  client: SupabaseBrowserAuthClientLike;
  calls: {
    getSession: number;
    signIn: Array<{ email: string; password: string }>;
    signOut: Array<{ scope: "local" }>;
    unsubscribe: number;
  };
  emit(event: string, nextSession: SupabaseAuthSessionLike | null): void;
  setInitialSession(value: SupabaseAuthSessionLike | null): void;
  setSignInResult(value: {
    data?: { session?: SupabaseAuthSessionLike | null } | null;
    error?: unknown;
  }): void;
  setSignOutError(value: unknown): void;
}

function fakeClient(): FakeClientControl {
  let initialSession: SupabaseAuthSessionLike | null = null;
  let signInResult: {
    data?: { session?: SupabaseAuthSessionLike | null } | null;
    error?: unknown;
  } = { data: { session: session() }, error: null };
  let signOutError: unknown = null;
  let callback: ((event: string, value: SupabaseAuthSessionLike | null) => void) | undefined;

  const calls = {
    getSession: 0,
    signIn: [] as Array<{ email: string; password: string }>,
    signOut: [] as Array<{ scope: "local" }>,
    unsubscribe: 0,
  };

  const client: SupabaseBrowserAuthClientLike = {
    auth: {
      async getSession() {
        calls.getSession += 1;
        return {
          data: { session: initialSession },
          error: null,
        };
      },
      async signInWithPassword(credentials) {
        calls.signIn.push({ ...credentials });
        return signInResult;
      },
      async signOut(options) {
        calls.signOut.push({ ...options });
        return { error: signOutError };
      },
      onAuthStateChange(nextCallback) {
        callback = nextCallback;
        return {
          data: {
            subscription: {
              unsubscribe() {
                calls.unsubscribe += 1;
              },
            },
          },
        };
      },
    },
  };

  return {
    client,
    calls,
    emit(event, nextSession) {
      callback?.(event, nextSession);
    },
    setInitialSession(value) {
      initialSession = value;
    },
    setSignInResult(value) {
      signInResult = value;
    },
    setSignOutError(value) {
      signOutError = value;
    },
  };
}

// C36 construction is inert.
{
  const fake = fakeClient();
  const provider = createSupabaseBrowserAuthAdapter({ client: fake.client });

  assert.equal(provider.kind, "trusted");
  assert.equal(provider.getSnapshot().configured, true);
  assert.equal(provider.getSnapshot().phase, "unauthenticated");
  assert.equal(fake.calls.getSession, 0);
  assert.deepEqual(fake.calls.signIn, []);
  assert.deepEqual(fake.calls.signOut, []);
}

// C36 initialize performs one session restore and no sign-in.
{
  const fake = fakeClient();
  const provider = createSupabaseBrowserAuthAdapter({ client: fake.client });

  await provider.initialize();

  assert.equal(fake.calls.getSession, 1);
  assert.equal(provider.getSnapshot().phase, "unauthenticated");
  assert.equal(await provider.getAccessToken(), null);
  assert.deepEqual(fake.calls.signIn, []);
}

// C36 an existing session restores only safe display identity and keeps the token out of snapshots.
{
  const fake = fakeClient();
  fake.setInitialSession(session());
  const provider = createSupabaseBrowserAuthAdapter({ client: fake.client });

  await provider.initialize();

  assert.deepEqual(provider.getSnapshot(), {
    phase: "authenticated",
    configured: true,
    email: EMAIL,
  });
  assert.equal(await provider.getAccessToken(), ACCESS_TOKEN_1);
  assert.equal(JSON.stringify(provider.getSnapshot()).includes(ACCESS_TOKEN_1), false);
  assert.equal("user_metadata" in provider.getSnapshot(), false);
}

// C36 sign-in forwards only the expected email/password pair and exposes no provider response fields.
{
  const fake = fakeClient();
  const provider = createSupabaseBrowserAuthAdapter({ client: fake.client });
  await provider.initialize();

  const outcome = await provider.signIn({
    email: "  manager@example.com ",
    password: "correct-password",
  });

  assert.deepEqual(fake.calls.signIn, [{
    email: EMAIL,
    password: "correct-password",
  }]);
  assert.deepEqual(outcome, { status: "authenticated" });
  assert.equal(provider.getSnapshot().phase, "authenticated");
  assert.equal(provider.getSnapshot().email, EMAIL);
  assert.equal(await provider.getAccessToken(), ACCESS_TOKEN_1);
}

// C36 provider errors are normalized and raw details never cross into UI state.
{
  const fake = fakeClient();
  const rawSecret = "raw-provider-secret-detail";
  fake.setSignInResult({
    data: { session: null },
    error: { message: rawSecret },
  });
  const provider = createSupabaseBrowserAuthAdapter({ client: fake.client });
  await provider.initialize();

  const outcome = await provider.signIn({
    email: EMAIL,
    password: "wrong-password",
  });

  assert.equal(outcome.status, "rejected");
  assert.equal(provider.getSnapshot().phase, "error");
  assert.equal(provider.getSnapshot().message?.includes(rawSecret), false);
  assert.equal(await provider.getAccessToken(), null);
}

// C36 invalid local credentials fail before the injected client is called.
{
  const fake = fakeClient();
  const provider = createSupabaseBrowserAuthAdapter({ client: fake.client });
  await provider.initialize();

  const outcome = await provider.signIn({
    email: "invalid",
    password: "short",
  });

  assert.equal(outcome.status, "rejected");
  assert.deepEqual(fake.calls.signIn, []);
  assert.equal(await provider.getAccessToken(), null);
}

// C36 auth-state events refresh the in-memory access token and SIGNED_OUT clears it.
{
  const fake = fakeClient();
  fake.setInitialSession(session());
  const provider = createSupabaseBrowserAuthAdapter({ client: fake.client });
  await provider.initialize();

  fake.emit("TOKEN_REFRESHED", session(ACCESS_TOKEN_2));
  assert.equal(await provider.getAccessToken(), ACCESS_TOKEN_2);
  assert.equal(provider.getSnapshot().phase, "authenticated");

  fake.emit("SIGNED_OUT", null);
  assert.equal(await provider.getAccessToken(), null);
  assert.equal(provider.getSnapshot().phase, "unauthenticated");
}

// C36 logout uses current-session scope and clears local authorization before the call completes.
{
  const fake = fakeClient();
  fake.setInitialSession(session());
  const provider = createSupabaseBrowserAuthAdapter({ client: fake.client });
  await provider.initialize();

  await provider.signOut();

  assert.deepEqual(fake.calls.signOut, [{ scope: "local" }]);
  assert.equal(await provider.getAccessToken(), null);
  assert.equal(provider.getSnapshot().phase, "unauthenticated");
}

// C36 sign-out failure stays fail-closed and does not restore the old token.
{
  const fake = fakeClient();
  fake.setInitialSession(session());
  fake.setSignOutError({ message: "raw-signout-error" });
  const provider = createSupabaseBrowserAuthAdapter({ client: fake.client });
  await provider.initialize();

  await provider.signOut();

  assert.equal(await provider.getAccessToken(), null);
  assert.equal(provider.getSnapshot().phase, "error");
  assert.equal(provider.getSnapshot().message?.includes("raw-signout-error"), false);
}

// C36 dispose unsubscribes and supports StrictMode-style reinitialization.
{
  const fake = fakeClient();
  fake.setInitialSession(session());
  const provider = createSupabaseBrowserAuthAdapter({ client: fake.client });

  await provider.initialize();
  provider.dispose();
  assert.equal(fake.calls.unsubscribe, 1);
  assert.equal(await provider.getAccessToken(), null);

  await provider.initialize();
  assert.equal(fake.calls.getSession, 2);
  assert.equal(await provider.getAccessToken(), ACCESS_TOKEN_1);
}

// C36 client options encode session-scoped policy only through injected storage.
{
  const values = new Map<string, string>();
  const storage = createSessionStorageAuthStorage({
    getItem(key) {
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      values.set(key, value);
    },
    removeItem(key) {
      values.delete(key);
    },
  });

  const options = buildSupabaseBrowserAuthClientOptions(storage);

  assert.equal(options.auth.persistSession, true);
  assert.equal(options.auth.autoRefreshToken, true);
  assert.equal(options.auth.detectSessionInUrl, false);
  assert.equal(options.auth.storage, storage);
  assert.equal("serviceRoleKey" in options.auth, false);
  assert.equal("secretKey" in options.auth, false);
}

console.log("Core C36 Supabase browser-auth adapter tests passed.");
