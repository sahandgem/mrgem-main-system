import assert from "node:assert/strict";
import {
  createSupabaseBrowserAuthAdapter,
  type SupabaseAuthSessionLike,
  type SupabaseBrowserAuthClientLike,
} from "../src/integration/auth/supabaseBrowserAuthAdapter.ts";

const TOKEN_A = "synthetic-c50-access-token-aaaaaaaaaaaaaaaaaaa";
const TOKEN_B = "synthetic-c50-access-token-bbbbbbbbbbbbbbbbbbb";
const EMAIL = "manager@example.com";
const CREDENTIALS = { email: EMAIL, password: "synthetic-password" };

type SessionResult = Awaited<ReturnType<SupabaseBrowserAuthClientLike["auth"]["getSession"]>>;
type SignInResult = Awaited<ReturnType<SupabaseBrowserAuthClientLike["auth"]["signInWithPassword"]>>;
type SignOutResult = Awaited<ReturnType<SupabaseBrowserAuthClientLike["auth"]["signOut"]>>;

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => { resolve = done; });
  return { promise, resolve };
}

function session(token = TOKEN_A): SupabaseAuthSessionLike {
  return { access_token: token, user: { id: "synthetic-manager", email: EMAIL } };
}

function fakeClient(initialSession: SupabaseAuthSessionLike | null = null) {
  let callback: ((event: string, next: SupabaseAuthSessionLike | null) => void) | undefined;
  const calls = { signIn: 0, signOut: 0, getSession: 0 };
  const client: SupabaseBrowserAuthClientLike = {
    auth: {
      async getSession() {
        calls.getSession += 1;
        return { data: { session: initialSession }, error: null };
      },
      async signInWithPassword() {
        calls.signIn += 1;
        return { data: { session: session(TOKEN_B) }, error: null };
      },
      async signOut() {
        calls.signOut += 1;
        return { error: null };
      },
      onAuthStateChange(listener) {
        callback = listener;
        return { data: { subscription: { unsubscribe() { callback = undefined; } } } };
      },
    },
  };
  return {
    client,
    calls,
    emit(event: string, next: SupabaseAuthSessionLike | null) {
      callback?.(event, next);
    },
  };
}

// C50: a session restore already in flight cannot revive a signed-out account.
{
  const fake = fakeClient();
  const pendingRestore = deferred<SessionResult>();
  fake.client.auth.getSession = () => {
    fake.calls.getSession += 1;
    return pendingRestore.promise;
  };
  const provider = createSupabaseBrowserAuthAdapter({ client: fake.client });
  const initializing = provider.initialize();
  await provider.signOut();
  pendingRestore.resolve({ data: { session: session() }, error: null });
  await initializing;

  assert.equal(provider.getSnapshot().phase, "unauthenticated");
  assert.equal(await provider.getAccessToken(), null);
  fake.emit("SIGNED_IN", session());
  fake.emit("TOKEN_REFRESHED", session(TOKEN_B));
  assert.equal(await provider.getAccessToken(), null);
  assert.equal(provider.getSnapshot().phase, "unauthenticated");

  // An explicit new sign-in is the only way to lift the local logout barrier.
  const outcome = await provider.signIn(CREDENTIALS);
  assert.equal(outcome.status, "authenticated");
  assert.equal(await provider.getAccessToken(), TOKEN_B);
}

// C50: late sign-in results and SDK events after logout cannot restore authority.
{
  const fake = fakeClient();
  const provider = createSupabaseBrowserAuthAdapter({ client: fake.client });
  await provider.initialize();
  const pendingSignIn = deferred<SignInResult>();
  fake.client.auth.signInWithPassword = () => {
    fake.calls.signIn += 1;
    return pendingSignIn.promise;
  };

  const signingIn = provider.signIn(CREDENTIALS);
  fake.emit("SIGNED_IN", session());
  assert.equal(await provider.getAccessToken(), null);

  await provider.signOut();
  fake.emit("TOKEN_REFRESHED", session(TOKEN_B));
  pendingSignIn.resolve({ data: { session: session() }, error: null });
  assert.equal((await signingIn).status, "unavailable");
  assert.equal(await provider.getAccessToken(), null);
  assert.equal(provider.getSnapshot().phase, "unauthenticated");
}

// C50: a pending/failing local logout immediately revokes UI token authority.
{
  const fake = fakeClient(session());
  const pendingSignOut = deferred<SignOutResult>();
  fake.client.auth.signOut = () => {
    fake.calls.signOut += 1;
    return pendingSignOut.promise;
  };
  const provider = createSupabaseBrowserAuthAdapter({ client: fake.client });
  await provider.initialize();
  assert.equal(await provider.getAccessToken(), TOKEN_A);

  const signingOut = provider.signOut();
  const duplicateSignOut = provider.signOut();
  assert.equal(await provider.getAccessToken(), null);
  assert.equal(provider.getSnapshot().phase, "unauthenticated");

  fake.emit("SIGNED_IN", session(TOKEN_B));
  assert.equal(await provider.getAccessToken(), null);
  assert.equal((await provider.signIn(CREDENTIALS)).status, "unavailable");
  assert.equal(fake.calls.signIn, 0);

  pendingSignOut.resolve({ error: { message: "private-synthetic-provider-detail" } });
  await Promise.all([signingOut, duplicateSignOut]);
  assert.equal(fake.calls.signOut, 1);
  assert.equal(provider.getSnapshot().phase, "error");
  assert.equal(provider.getSnapshot().message?.includes("private-synthetic-provider-detail"), false);
  assert.equal(await provider.getAccessToken(), null);
  fake.emit("SIGNED_IN", session());
  assert.equal(await provider.getAccessToken(), null);

  // Recovery requires explicit, fresh sign-in, not an unsolicited SDK callback.
  const outcome = await provider.signIn(CREDENTIALS);
  assert.equal(outcome.status, "authenticated");
  assert.equal(await provider.getAccessToken(), TOKEN_B);
}

console.log("Core C50 sign-out/session race regressions passed.");
