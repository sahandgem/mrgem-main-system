import assert from "node:assert/strict";
import { ModuleObservationAggregator } from "../src/integration/aggregation/moduleObservationAggregator.ts";
import {
  buildMockObservation,
  MockModuleAdapter,
} from "../src/integration/adapters/mockModuleAdapter.ts";
import type { ModuleRegistryEntry } from "@master-gem/module-contracts";
import {
  findModuleRegistryEntry,
  integrationModuleRegistry,
} from "../src/integration/registry/moduleRegistry.ts";
import { validateAndNormalizeObservation } from "../src/integration/validation/moduleObservationValidator.ts";
import { CommandCenterMockDataSource } from "../src/integration/commandCenter/commandCenterMockDataSource.ts";

const now = "2026-08-07T09:30:00.000Z";

function registryEntry(
  moduleId = "workforce.demo",
  adapterKey = "mock.workforce",
  enabled = true,
  staleAfterSeconds = 60 * 60,
): ModuleRegistryEntry {
  return {
    moduleId,
    displayName: moduleId,
    moduleType: "workforce",
    enabled,
    expectedContractMajor: 1,
    freshnessPolicy: {
      staleAfterSeconds,
      criticalAfterSeconds: staleAfterSeconds * 4,
      allowedFutureSkewSeconds: 60,
    },
    adapterKey,
  };
}

async function collectScenario(
  scenario: ConstructorParameters<typeof MockModuleAdapter>[2],
  entry = registryEntry(),
  at = now,
) {
  const adapter = new MockModuleAdapter(entry.moduleId, entry.adapterKey, scenario);
  const result = await new ModuleObservationAggregator().collect(
    [entry],
    { [entry.adapterKey]: adapter },
    at,
  );
  return { adapter, module: result.modules[0], result };
}

assert.equal(integrationModuleRegistry.length, 2);
assert.equal(integrationModuleRegistry[0].moduleId, "workforce.demo");
assert.equal(integrationModuleRegistry[1].moduleId, "production.demo");

{
  const { module } = await collectScenario("healthy");
  assert.equal(module.status, "valid");
  assert.equal(module.sourceHealth, "healthy");
  assert.equal(module.freshness, "fresh");
  assert.equal(module.effectiveState, "healthy");
}

{
  const { module } = await collectScenario("degraded");
  assert.equal(module.sourceHealth, "degraded");
  assert.equal(module.effectiveState, "degraded");
  assert.ok(module.observation);
}

{
  const { module } = await collectScenario("unavailable");
  assert.equal(module.status, "unavailable");
  assert.equal(module.effectiveState, "unavailable");
  assert.equal(module.diagnostics[0]?.code, "UNAVAILABLE_MODULE");
}

{
  const { module } = await collectScenario("stale");
  assert.equal(module.status, "valid_with_warnings");
  assert.equal(module.freshness, "stale");
  assert.equal(module.effectiveState, "stale");
}

{
  const entry = registryEntry();
  const unknown = buildMockObservation("unregistered.demo");
  const validation = validateAndNormalizeObservation(unknown, entry, now);
  assert.equal(validation.status, "invalid_payload");
  assert.equal(validation.diagnostics[0]?.code, "MODULE_ID_MISMATCH");
  assert.equal(findModuleRegistryEntry([entry], "unregistered.demo"), undefined);
}

{
  const entry = registryEntry();
  const adapter = new MockModuleAdapter(entry.moduleId, entry.adapterKey);
  const result = await new ModuleObservationAggregator().collect(
    [entry, { ...entry, displayName: "Duplicate" }],
    { [entry.adapterKey]: adapter },
    now,
  );
  assert.equal(result.modules.length, 2);
  assert.equal(result.modules.every((item) => item.status === "registry_error"), true);
  assert.equal(result.modules.every((item) => item.diagnostics[0]?.code === "DUPLICATE_MODULE_ID"), true);
  assert.equal(adapter.getReadCount(), 0);
}

{
  const { module } = await collectScenario("unsupported");
  assert.equal(module.status, "unsupported_version");
  assert.equal(module.diagnostics[0]?.code, "UNSUPPORTED_CONTRACT_VERSION");
}

{
  const entry = registryEntry();
  const raw = {
    ...buildMockObservation(),
    futureOptionalSection: { value: "ignored safely" },
  };
  const validation = validateAndNormalizeObservation(raw, entry, now);
  assert.equal(validation.status, "valid");
  assert.equal(validation.effectiveState, "healthy");
}

{
  const { module } = await collectScenario("partial_kpi");
  assert.equal(module.status, "valid_with_warnings");
  assert.equal(module.effectiveState, "degraded");
  assert.equal(module.observation?.kpis?.length, 1);
  assert.equal(module.diagnostics.some((item) => item.code === "MALFORMED_KPI"), true);
  assert.equal(module.diagnostics.some((item) => item.code === "PARTIAL_DATA"), true);
}

{
  const { module } = await collectScenario("malformed_alert");
  assert.equal(module.status, "valid_with_warnings");
  assert.equal(module.observation?.alerts?.length, 0);
  assert.equal(module.diagnostics.some((item) => item.code === "MALFORMED_ALERT"), true);
}

{
  const { module } = await collectScenario("empty_kpis");
  assert.equal(module.status, "valid_with_warnings");
  assert.equal(module.observation?.kpis?.length, 0);
  assert.equal(module.diagnostics.some((item) => item.code === "EMPTY_KPI_LIST"), true);
}

{
  const { module } = await collectScenario("no_data");
  assert.equal(module.status, "no_data");
  assert.equal(module.effectiveState, "unknown");
  assert.equal(module.lastKnownGood, undefined);
}

{
  const entry = registryEntry();
  const adapter = new MockModuleAdapter(entry.moduleId, entry.adapterKey, "healthy");
  const aggregator = new ModuleObservationAggregator();
  await aggregator.collect([entry], { [entry.adapterKey]: adapter }, now);
  adapter.setScenario("unavailable");
  const later = await aggregator.collect(
    [entry],
    { [entry.adapterKey]: adapter },
    "2026-08-08T12:00:00.000Z",
  );
  const module = later.modules[0];
  assert.equal(module.status, "unavailable");
  assert.equal(module.freshness, "stale");
  assert.equal(module.effectiveState, "unavailable");
  assert.ok(module.lastKnownGood);
  assert.equal(module.lastSuccessfulSyncAt, now);
}

{
  const entry = registryEntry("workforce.disabled", "mock.disabled", false);
  const adapter = new MockModuleAdapter(entry.moduleId, entry.adapterKey);
  const result = await new ModuleObservationAggregator().collect(
    [entry],
    { [entry.adapterKey]: adapter },
    now,
  );
  assert.equal(result.modules[0].status, "disabled");
  assert.equal(adapter.getReadCount(), 0);
}

{
  const healthyEntry = registryEntry("workforce.healthy", "mock.healthy");
  const failedEntry = registryEntry("workforce.failed", "mock.failed");
  const healthyAdapter = new MockModuleAdapter(healthyEntry.moduleId, healthyEntry.adapterKey, "healthy");
  const failedAdapter = new MockModuleAdapter(failedEntry.moduleId, failedEntry.adapterKey, "unavailable");
  const result = await new ModuleObservationAggregator().collect(
    [healthyEntry, failedEntry],
    {
      [healthyEntry.adapterKey]: healthyAdapter,
      [failedEntry.adapterKey]: failedAdapter,
    },
    now,
  );
  assert.equal(result.modules[0].effectiveState, "healthy");
  assert.equal(result.modules[1].effectiveState, "unavailable");
  assert.equal(result.summary.healthy, 1);
  assert.equal(result.summary.unavailable, 1);
}

{
  const entry = registryEntry();
  const run = async () => new ModuleObservationAggregator().collect(
    [entry],
    { [entry.adapterKey]: new MockModuleAdapter(entry.moduleId, entry.adapterKey, "healthy") },
    now,
  );
  assert.deepEqual(await run(), await run());
}

{
  const entry = registryEntry();
  const raw = buildMockObservation();
  const before = JSON.stringify(raw);
  validateAndNormalizeObservation(raw, entry, now);
  assert.equal(JSON.stringify(raw), before);
}

{
  const { adapter, module } = await collectScenario("malformed");
  assert.equal(module.status, "invalid_payload");
  assert.equal(module.diagnostics[0]?.code, "INVALID_PAYLOAD");
  assert.equal("write" in adapter, false);
}

// Command Center mock scenarios exercise adapter -> validation -> aggregation -> view-model.
{
  const view = await new CommandCenterMockDataSource("healthy").read(now);
  assert.equal(view.overallState, "critical");
  assert.equal(view.modules.length, 2);
  assert.equal(view.modules.every((module) => module.reliability === "fresh"), true);
  assert.equal(view.modules.every((module) => module.dataStateLabel === "داده فعلی سالم و تازه است"), true);
  assert.ok(view.topAttention.length >= 5 && view.topAttention.length <= 8);
  assert.equal(view.modules.find((module) => module.moduleId === "production.demo")?.isExperimental, true);
}

{
  const view = await new CommandCenterMockDataSource("stale").read(now);
  assert.equal(view.overallState, "critical");
  assert.equal(view.modules[0].reliability, "stale_last_known_good");
  assert.equal(view.modules[0].hasLastKnownGood, true);
  assert.ok(Date.parse(view.modules[0].observedAt ?? "") < Date.parse(view.modules[0].receivedAt));
}

{
  const view = await new CommandCenterMockDataSource("partial").read(now);
  assert.equal(view.overallState, "critical");
  assert.equal(view.reliability.hasPartialData, true);
  assert.equal(view.modules[0].isPartialData, true);
  assert.equal(view.modules[0].dataStateLabel, "داده فعلی ناقص است");
}

{
  const source = new CommandCenterMockDataSource("partial");
  await source.read(now);
  source.setScenario("error");
  const view = await source.read(now);
  const workforce = view.modules.find((module) => module.moduleId === "workforce.demo");
  assert.ok(workforce);
  assert.equal(view.overallState, "critical");
  assert.equal(workforce.reliability, "unavailable");
  assert.equal(workforce.hasLastKnownGood, true);
  assert.equal(workforce.dataStateLabel, "دریافت فعلی ناموفق است");
  assert.equal(workforce.isPartialData, false);
  assert.equal(workforce.alertCounts.critical, 1);
  assert.equal(workforce.highlightedKpiCount, 2);
  assert.ok(Date.parse(workforce.observedAt ?? "") < Date.parse(workforce.receivedAt));
  assert.doesNotMatch(workforce.summaryText, /SYNTHETIC_UNAVAILABLE|adapter|transport/i);
  assert.equal(view.topAttention.every((item) => item.reliability === "stale_last_known_good"), true);
}

console.log("Integration Backbone baseline tests passed.");
