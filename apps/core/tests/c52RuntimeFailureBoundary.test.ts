import assert from "node:assert/strict";
import { CommandCenterRuntime } from "../src/integration/commandCenter/commandCenterRuntime.ts";
import { CommandCenterMockDataSource } from "../src/integration/commandCenter/commandCenterMockDataSource.ts";
import type { CommandCenterDataSource } from "../src/integration/commandCenter/commandCenterDataSource.ts";

const t1 = "2026-10-12T09:00:00.000Z";
const t2 = "2026-10-12T09:02:00.000Z";
const t3 = "2026-10-12T09:04:00.000Z";
const template = await new CommandCenterMockDataSource("healthy").read(t1);
const secret = "SENSITIVE_SYNTHETIC_INTERNAL_ERROR";

{
  // Initial outage: no synthetic fallback, no snapshot, a neutral public error.
  const runtime = new CommandCenterRuntime({
    sourceKind: "live",
    async read() {throw Error(secret);}
  });
  assert.equal(await runtime.refresh(t1), "error");
  assert.equal(runtime.getState().viewModel, undefined);
  assert.equal(runtime.getState().lastSuccessfulAt, undefined);
  assert.equal(runtime.getState().error?.code, "READ_FAILED");
  assert.equal(JSON.stringify(runtime.getState()).includes(secret), false);
}

{
  let mode: "ok" | "offline" | "partial" | "recover" = "ok";
  const source: CommandCenterDataSource = {
    sourceKind: "mock",
    async read() {
      if (mode === "offline") throw Error(secret);
      if (mode === "partial") return { ...template, dataLabel: "LIVE/READ-ONLY" };
      return {...template, generatedAt: mode === "recover" ? t3 : t1};
    }
  };
  const runtime = new CommandCenterRuntime(source);
  assert.equal(await runtime.refresh(t1), "success");
  const last = runtime.getState().viewModel;
  mode = "offline";
  assert.equal(await runtime.refresh(t2), "error");
  assert.equal(runtime.getState().viewModel, last);
  assert.equal(runtime.getState().lastSuccessfulAt, t1);
  assert.equal(runtime.getState().lastAttemptAt, t2);
  mode = "partial";
  assert.equal(await runtime.refresh(t2), "error");
  assert.equal(runtime.getState().viewModel, last);
  mode = "recover";
  assert.equal(await runtime.refresh(t3), "success");
  assert.equal(runtime.getState().phase, "ready");
  assert.equal(runtime.getState().lastSuccessfulAt, t3);
  assert.equal(runtime.getState().error, undefined);
}
{
  // A source pretending to be Live must not present a Mock snapshot as live.
  const runtime = new CommandCenterRuntime({
    sourceKind: "live",
    async read() { return template; }
  });
  assert.equal(await runtime.refresh(t1), "error");
  assert.equal(runtime.getState().viewModel, undefined);
  assert.equal(runtime.getState().lastSuccessfulAt, undefined);
}

console.log("C52 outage, poisoned source, historical snapshot and recovery cases passed.");
