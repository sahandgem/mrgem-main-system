import assert from "node:assert/strict";
import {
  createCommandCenterRuntimeEnvironment,
} from "../src/integration/commandCenter/commandCenterRuntimeEnvironment.ts";
import { isManagerLiveRuntime } from "../src/integration/auth/managerRuntimeGate.ts";

const mock = createCommandCenterRuntimeEnvironment();
assert.equal(isManagerLiveRuntime(null), false);
assert.equal(isManagerLiveRuntime(undefined), false);
assert.equal(isManagerLiveRuntime(mock), false);

// Claiming sourceMode=live is insufficient if the underlying runtime uses mock.
assert.equal(isManagerLiveRuntime({ ...mock, sourceMode: "live" }), false);

// Demo scenario controls are never accepted in the manager environment.
const liveDisabled = createCommandCenterRuntimeEnvironment({
  mode: "live",
  live: { enabled: false },
});
assert.equal(isManagerLiveRuntime({
  ...liveDisabled,
  setDevScenario: () => {},
}), false);

// A genuine Live runtime passes the identity check, while its own read gate
// remains closed until separately enabled.
assert.equal(isManagerLiveRuntime(liveDisabled), true);
assert.equal(liveDisabled.runtime.getState().sourceKind, "live");
assert.equal(await liveDisabled.runtime.refresh(), "error");
assert.equal(liveDisabled.runtime.getState().viewModel, undefined);

// Faulty or spoofed runtime inputs fail closed.
assert.equal(isManagerLiveRuntime({
  sourceMode: "live",
  runtime: {
    getState() { throw new Error("invalid runtime"); },
  },
} as unknown as typeof liveDisabled), false);

console.log("C38 manager-route live-runtime gate tests passed.");
