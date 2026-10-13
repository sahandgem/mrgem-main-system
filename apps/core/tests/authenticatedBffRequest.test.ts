import assert from "node:assert/strict";
import {
  createAuthenticatedBffJsonReader,
  AuthenticatedBffReadError,
  type BffReadRequest,
  type BffReadResponse,
} from "../src/integration/transports/authenticatedBffRequest.ts";
import {
  createAuthenticatedProductionOperationsReader,
  PRODUCTION_OPERATIONS_BFF_PATH,
} from "../src/integration/production/authenticatedProductionOperationsReader.ts";
import { ProductionOperationsSanitizedTransport } from "../src/integration/production/productionOperationsTransport.ts";
import { createClosedCoreAuthProvider, type CoreAuthProvider, type CoreAuthSnapshot } from "../src/integration/auth/coreAuthProvider.ts";

const TOKEN_ONE = "access-token-one-abcdefghijklmnopqrstuvwxyz";
const TOKEN_TWO = "access-token-two-abcdefghijklmnopqrstuvwxyz";

function fakeAuth(initialToken: string | null = TOKEN_ONE) {
  let currentToken = initialToken;
  let logoutCount = 0;
  let snapshot: CoreAuthSnapshot = { phase: "authenticated", configured: true };
  const listeners = new Set<(next: CoreAuthSnapshot) => void>();
  const base = createClosedCoreAuthProvider();
  const provider: CoreAuthProvider = {
    ...base,
    kind: "trusted",
    getSnapshot: () => snapshot,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    async getAccessToken() { return currentToken; },
    async signOut() {
      logoutCount += 1;
      currentToken = null;
      snapshot = { phase: "unauthenticated", configured: true };
      for (const listener of listeners) listener(snapshot);
    },
  };
  return {
    provider,
    rotate(token: string) { currentToken = token; },
    get logoutCount() { return logoutCount; },
  };
}

function fixtureSnapshot() {
  return {
    contractVersion: "production-operations-snapshot-v1" as const,
    generatedAt: "2026-10-09T12:00:00.000Z",
    sourceDataUpdatedAt: "2026-10-09T11:58:00.000Z",
    counts: {
      draft: 1,
      reservationPending: 2,
      reserved: 3,
      released: 4,
      issuePending: 5,
      inProgress: 6,
      awaitingQc: 7,
      completionPending: 8,
      completed: 9,
      cancelled: 10,
    },
  };
}

async function expectCategory(promise: Promise<unknown>, category: string) {
  await assert.rejects(promise, (error: unknown) => {
    assert.ok(error instanceof AuthenticatedBffReadError);
    assert.equal(error.category, category);
    assert.equal(error.message.includes(TOKEN_ONE), false);
    return true;
  });
}

// Missing credentials never invoke the downstream executor.
{
  const auth = fakeAuth(null);
  let invoked = 0;
  const reader = createAuthenticatedBffJsonReader({
    authProvider: auth.provider,
    path: PRODUCTION_OPERATIONS_BFF_PATH,
    executor: {
      async execute() { invoked += 1; throw Error("should not run"); },
    },
  });
  await expectCategory(reader.read(), "unauthorized");
  assert.equal(invoked, 0);
}

// A valid request carries exactly one access token with no browser authority metadata.
{
  const auth = fakeAuth();
  const calls: BffReadRequest[] = [];
  const body = fixtureSnapshot();
  const reader = createAuthenticatedProductionOperationsReader({
    authProvider: auth.provider,
    executor: {
      async execute(request) {
        calls.push(request);
        return { statusCode: 200, body };
      },
    },
  });
  assert.deepEqual(await reader.read(), body);
  assert.deepEqual(calls, [{
    method: "GET",
    path: "/api/command-center/production-operations",
    headers: {
      accept: "application/json",
      authorization: `Bearer ${TOKEN_ONE}`,
    },
  }]);
  assert.deepEqual(Object.keys(calls[0].headers).sort(), ["accept", "authorization"]);
}

// A genuine 401 invalidates the active session and causes the login boundary to return.
{
  const auth = fakeAuth();
  const reader = createAuthenticatedBffJsonReader({
    authProvider: auth.provider,
    path: PRODUCTION_OPERATIONS_BFF_PATH,
    executor: {
      async execute() { return { statusCode: 401, body: { error: "secret" } }; },
    },
  });
  await expectCategory(reader.read(), "unauthorized");
  assert.equal(auth.logoutCount, 1);
  assert.equal(auth.provider.getSnapshot().phase, "unauthenticated");
  assert.equal(await auth.provider.getAccessToken(), null);
}

// A late 401 from a superseded access token never invalidates a refreshed session.
{
  const auth = fakeAuth();
  const reader = createAuthenticatedBffJsonReader({
    authProvider: auth.provider,
    path: PRODUCTION_OPERATIONS_BFF_PATH,
    executor: {
      async execute(request) {
        assert.equal(request.headers.authorization, `Bearer ${TOKEN_ONE}`);
        auth.rotate(TOKEN_TWO);
        return { statusCode: 401, body: null };
      },
    },
  });
  await expectCategory(reader.read(), "unauthorized");
  assert.equal(auth.logoutCount, 0);
  assert.equal(await auth.provider.getAccessToken(), TOKEN_TWO);
}

// Access-token retrieval failures are always treated as unauthorized, not leaked.
{
  const auth = fakeAuth();
  const reader = createAuthenticatedBffJsonReader({
    authProvider: {
      ...auth.provider,
      async getAccessToken() { throw Error("raw auth secret"); },
    },
    path: PRODUCTION_OPERATIONS_BFF_PATH,
    executor: {
      async execute() { throw Error("must not execute"); },
    },
  });
  await expectCategory(reader.read(), "unauthorized");
}

// Forbidden is distinct from unauthenticated; it never logs the user out.
{
  const auth = fakeAuth();
  const reader = createAuthenticatedBffJsonReader({
    authProvider: auth.provider,
    path: PRODUCTION_OPERATIONS_BFF_PATH,
    executor: {
      async execute() { return { statusCode: 403, body: null }; },
    },
  });
  await expectCategory(reader.read(), "forbidden");
  assert.equal(auth.logoutCount, 0);
}

// Gateway, transport, and contract failures are normalized.
{
  const cases: Array<[number, string]> = [
    [404, "not_found"], [409, "contract_mismatch"],
    [400, "validation"], [422, "validation"], [504, "timeout"],
    [503, "unavailable"], [502, "unavailable"], [429, "unknown"],
  ];
  for (const [statusCode, expected] of cases) {
    const auth = fakeAuth();
    const reader = createAuthenticatedBffJsonReader({
      authProvider: auth.provider,
      path: PRODUCTION_OPERATIONS_BFF_PATH,
      executor: {
        async execute() { return { statusCode, body: { raw: "confidential" } }; },
      },
    });
    await expectCategory(reader.read(), expected);
    assert.equal(auth.logoutCount, 0);
  }

  const reader = createAuthenticatedBffJsonReader({
    authProvider: fakeAuth().provider,
    path: PRODUCTION_OPERATIONS_BFF_PATH,
    executor: {
      async execute(): Promise<BffReadResponse> {
        throw Error("https://secret:password@example.com/private");
      },
    },
  });
  await expectCategory(reader.read(), "unavailable");
}

// Only relative allowlisted API paths are accepted; no arbitrary origin, query or traversal.
{
  for (const path of [
    "https://attacker.example/api/command-center/production-operations",
    "//attacker.example",
    "/api/../admin", "/api/items?role=admin", "/api/items#fragment",
    "/api/items/%2e%2e/admin", "/wrong-path",
  ]) {
    assert.throws(() => createAuthenticatedBffJsonReader({
      authProvider: fakeAuth().provider,
      path,
      executor: { async execute() { return { statusCode: 200, body: null }; } },
    }), /CORE_BFF_REQUEST_PATH_INVALID/);
  }
}

// Production adapter uses sanitized snapshot and propagates 401 as an authorization failure.
{
  const auth = fakeAuth();
  const reader = createAuthenticatedProductionOperationsReader({
    authProvider: auth.provider,
    executor: {
      async execute() { return { statusCode: 200, body: fixtureSnapshot() }; },
    },
  });
  const transport = new ProductionOperationsSanitizedTransport({ reader, environment: "test" });
  const result = await transport.read("production.operations");
  assert.equal(result.kind, "payload");
  if (result.kind === "payload") {
    const payload = result.payload as { module: { moduleId: string }; kpis: Array<{ key: string }> };
    assert.equal(payload.module.moduleId, "production.operations");
    assert.ok(payload.kpis.some((item) => item.key === "production_open_orders"));
  }

  const failed = new ProductionOperationsSanitizedTransport({
    reader: createAuthenticatedProductionOperationsReader({
      authProvider: fakeAuth().provider,
      executor: { async execute() { return { statusCode: 401, body: null }; } },
    }),
  });
  assert.deepEqual(await failed.read("production.operations"), {
    kind: "unavailable",
    category: "unauthorized",
  });
  assert.deepEqual(await failed.read("production.demo"), {
    kind: "unavailable",
    category: "contract_mismatch",
  });
}

console.log("C37 authenticated BFF request boundary tests passed.");
