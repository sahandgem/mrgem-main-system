import assert from "node:assert/strict";
import {
  createClosedCoreAuthProvider,
  createSessionStorageAuthStorage,
  isCoreAuthEmail,
  isCoreAuthPassword,
} from "../src/integration/auth/coreAuthProvider.ts";

{
  const provider = createClosedCoreAuthProvider();
  assert.equal(provider.kind, "closed");
  assert.equal(provider.getSnapshot().configured, false);
  assert.equal(provider.getSnapshot().phase, "unauthenticated");
  assert.equal(await provider.getAccessToken(), null);

  let updates = 0;
  const unsubscribe = provider.subscribe(() => { updates += 1; });
  const outcome = await provider.signIn({
    email: "manager@example.com",
    password: "valid-password",
  });
  assert.equal(outcome.status, "unavailable");
  assert.equal(provider.getSnapshot().phase, "error");
  assert.equal(provider.getSnapshot().configured, false);
  assert.equal(updates, 1);
  unsubscribe();
}

{
  const values = new Map<string, string>();
  const calls: string[] = [];
  const storage = createSessionStorageAuthStorage({
    getItem(key) {
      calls.push(`get:${key}`);
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      calls.push(`set:${key}`);
      values.set(key, value);
    },
    removeItem(key) {
      calls.push(`remove:${key}`);
      values.delete(key);
    },
  });

  await storage.setItem("auth-key", "session-value");
  assert.equal(await storage.getItem("auth-key"), "session-value");
  await storage.removeItem("auth-key");
  assert.equal(await storage.getItem("auth-key"), null);
  assert.deepEqual(calls, [
    "set:auth-key",
    "get:auth-key",
    "remove:auth-key",
    "get:auth-key",
  ]);
}

assert.equal(isCoreAuthEmail("manager@example.com"), true);
assert.equal(isCoreAuthEmail("not-an-email"), false);
assert.equal(isCoreAuthPassword("12345678"), true);
assert.equal(isCoreAuthPassword("short"), false);

console.log("Core C35 auth-provider boundary tests passed.");
