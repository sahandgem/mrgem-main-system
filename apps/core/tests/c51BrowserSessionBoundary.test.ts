import assert from "node:assert/strict";
import { createSupabaseBrowserAuthAdapter, type SupabaseBrowserAuthClientLike, type SupabaseAuthSessionLike } from "../src/integration/auth/supabaseBrowserAuthAdapter.ts";

const credentials = { email: "pilot@example.test", password: "synthetic-password" };
const validToken = "synthetic-browser-c51-token-aaaaaaaaaaaaaaaa";
function session(expiresAt?: number): SupabaseAuthSessionLike {
  return { access_token: validToken, ...(expiresAt === undefined ? {} : {expires_at: expiresAt}), user: { email: credentials.email } };
}
const now = Math.floor(Date.now() / 1000);
function client(restored: SupabaseAuthSessionLike | null, signedIn: SupabaseAuthSessionLike | null = session(now + 3600)) {
  let callback: ((name: string, value: SupabaseAuthSessionLike | null) => void) | undefined;
  const calls = { signIn: 0, signOut: 0 };
  const auth: SupabaseBrowserAuthClientLike["auth"] = {
    async getSession() { return {data: {session: restored}}; },
    async signInWithPassword() { calls.signIn++; return {data: {session: signedIn}}; },
    async signOut() { calls.signOut++; return {error: null}; },
    onAuthStateChange(cb) {
      callback = cb;
      return {data: {subscription: {unsubscribe() {callback = undefined;}}}};
    },
  };
  return { client: {auth}, calls, emit(name: string, value: SupabaseAuthSessionLike | null) {callback?.(name,value);} };
}

for (const expiresAt of [now - 10, NaN, Infinity, -1, 1.1]) {
  const fake = client(session(expiresAt));
  const provider = createSupabaseBrowserAuthAdapter({client: fake.client});
  await provider.initialize();
  assert.equal(provider.getSnapshot().phase, "unauthenticated");
  assert.equal(await provider.getAccessToken(), null);
  fake.emit("TOKEN_REFRESHED", session(expiresAt));
  assert.equal(provider.getSnapshot().phase, "unauthenticated");
  assert.equal(await provider.getAccessToken(), null);
  provider.dispose();
}

{
  const fake = client(null, session(now - 1));
  const provider = createSupabaseBrowserAuthAdapter({client: fake.client});
  await provider.initialize();
  assert.equal((await provider.signIn(credentials)).status, "unavailable");
  assert.equal(await provider.getAccessToken(), null);
  assert.notEqual(provider.getSnapshot().phase, "authenticated");
}

{
  const fake = client(session(now + 3600));
  const provider = createSupabaseBrowserAuthAdapter({client: fake.client});
  await provider.initialize();
  assert.equal(provider.getSnapshot().phase, "authenticated");
  fake.emit("SIGNED_OUT", null);
  assert.equal(provider.getSnapshot().phase, "unauthenticated");
  assert.equal(await provider.getAccessToken(), null);
  fake.emit("TOKEN_REFRESHED", session(now + 3600));
  assert.equal(provider.getSnapshot().phase, "unauthenticated");
  assert.equal(await provider.getAccessToken(), null);
  assert.equal((await provider.signIn(credentials)).status, "authenticated");
  assert.equal(await provider.getAccessToken(), validToken);
  provider.dispose();
}

{
  // The default real app still has a closed provider; browser fixture is isolated.
  const fs = await import("node:fs");
  const path = await import("node:path");
  const root = path.dirname(new URL(import.meta.url).pathname.replace(/^\/(?=[A-Za-z]:)/,""));
  const app = fs.readFileSync(path.join(root, "..", "src", "App.tsx"), "utf8");
  const fixture = fs.readFileSync(path.join(root, "c46-browser", "main.tsx"), "utf8");
  assert.match(app, /CoreAuthBoundary/);
  assert.doesNotMatch(app, /c46-browser|c51BrowserSessionBoundary/);
  assert.match(fixture, /synthetic-pass-only/);
}

console.log("C51 closed browser-session expiry and SDK logout scenarios passed.");
