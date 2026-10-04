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
import { TransportModuleAdapter } from "../src/integration/adapters/transportModuleAdapter.ts";
import type { SanitizedModuleTransport, SanitizedModuleTransportResult } from "../src/integration/transports/sanitizedModuleTransport.ts";
import { CommandCenterLiveDataSource, CommandCenterLiveGateClosedError } from "../src/integration/commandCenter/commandCenterLiveDataSource.ts";
import type { CommandCenterDataSource } from "../src/integration/commandCenter/commandCenterDataSource.ts";
import { CommandCenterRuntime } from "../src/integration/commandCenter/commandCenterRuntime.ts";
import { createCommandCenterRuntimeEnvironment } from "../src/integration/commandCenter/commandCenterRuntimeEnvironment.ts";
import type { CommandCenterViewModel } from "../src/integration/commandCenter/commandCenterViewModel.ts";

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
  const view = await new CommandCenterMockDataSource("normal").read(now);
  assert.equal(view.overallState, "healthy");
  assert.equal(view.modules.length, 2);
  assert.equal(view.modules.every((module) => module.reliability === "fresh"), true);
  assert.equal(view.topAttention.length, 0);
  assert.equal(view.kpiHighlights.every((item) => item.status === "normal"), true);
}

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
  assert.equal(workforce.dataStateLabel, "خطای داده؛ دریافت فعلی ناموفق است");
  assert.equal(workforce.isPartialData, false);
  assert.equal(workforce.alertCounts.critical, 1);
  assert.equal(workforce.highlightedKpiCount, 2);
  assert.ok(Date.parse(workforce.observedAt ?? "") < Date.parse(workforce.receivedAt));
  assert.doesNotMatch(workforce.summaryText, /SYNTHETIC_UNAVAILABLE|adapter|transport/i);
  assert.equal(view.topAttention.every((item) => item.reliability === "stale_last_known_good"), true);
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

// C11 runtime: initial load publishes loading -> ready and owns lifecycle timestamps.
{
  const source = new CommandCenterMockDataSource("normal");
  const runtime = new CommandCenterRuntime(source);
  const phases: string[] = [];
  const unsubscribe = runtime.subscribe((state) => phases.push(state.phase));

  assert.equal(runtime.getState().phase, "idle");
  assert.equal(await runtime.refresh(now), "success");
  assert.equal(runtime.getState().phase, "ready");
  assert.equal(runtime.getState().sourceKind, "mock");
  assert.equal(runtime.getState().lastAttemptAt, now);
  assert.equal(runtime.getState().lastSuccessfulAt, now);
  assert.equal(runtime.getState().viewModel?.overallState, "healthy");
  assert.deepEqual(phases, ["loading", "ready"]);
  unsubscribe();
}

// C11 runtime: successful read time is independent from the snapshot generatedAt.
{
  const snapshot = await new CommandCenterMockDataSource("normal").read("2026-08-07T08:00:00.000Z");
  const source: CommandCenterDataSource = {
    sourceKind: "mock",
    async read() {
      return snapshot;
    },
  };
  const runtime = new CommandCenterRuntime(source);
  const receivedAt = "2026-08-07T09:45:00.000Z";

  assert.equal(await runtime.refresh(receivedAt), "success");
  assert.equal(runtime.getState().lastSuccessfulAt, receivedAt);
  assert.equal(runtime.getState().viewModel?.generatedAt, "2026-08-07T08:00:00.000Z");
  assert.notEqual(runtime.getState().lastSuccessfulAt, runtime.getState().viewModel?.generatedAt);
}

// C11 runtime: a failed refresh keeps the previous successful snapshot and timestamp.
{
  const first = await new CommandCenterMockDataSource("normal").read(now);
  const recoveredAt = "2026-08-07T10:15:00.000Z";
  const recovered = { ...first, generatedAt: recoveredAt };
  let mode: "first" | "fail" | "recover" = "first";
  const source: CommandCenterDataSource = {
    sourceKind: "mock",
    async read() {
      if (mode === "fail") throw new Error("synthetic read failure");
      return mode === "recover" ? recovered : first;
    },
  };
  const runtime = new CommandCenterRuntime(source);

  assert.equal(await runtime.refresh(now), "success");
  const successfulSnapshot = runtime.getState().viewModel;
  mode = "fail";
  const failedAt = "2026-08-07T10:00:00.000Z";
  assert.equal(await runtime.refresh(failedAt), "error");
  assert.equal(runtime.getState().phase, "error");
  assert.equal(runtime.getState().viewModel, successfulSnapshot);
  assert.equal(runtime.getState().lastSuccessfulAt, now);
  assert.equal(runtime.getState().lastAttemptAt, failedAt);
  assert.equal(runtime.getState().error?.code, "READ_FAILED");

  mode = "recover";
  assert.equal(await runtime.refresh(recoveredAt), "success");
  assert.equal(runtime.getState().phase, "ready");
  assert.equal(runtime.getState().error, undefined);
  assert.equal(runtime.getState().lastSuccessfulAt, recoveredAt);
  assert.equal(runtime.getState().viewModel?.generatedAt, recoveredAt);
}

// C11 runtime: a slower older request cannot overwrite a newer successful snapshot.
{
  const template = await new CommandCenterMockDataSource("normal").read(now);
  const olderAt = "2026-08-07T11:00:00.000Z";
  const newerAt = "2026-08-07T11:05:00.000Z";
  const older = deferred<CommandCenterViewModel>();
  const newer = deferred<CommandCenterViewModel>();
  let readCount = 0;
  const source: CommandCenterDataSource = {
    sourceKind: "mock",
    read() {
      readCount += 1;
      return readCount === 1 ? older.promise : newer.promise;
    },
  };
  const runtime = new CommandCenterRuntime(source);

  const olderRefresh = runtime.refresh(olderAt);
  const newerRefresh = runtime.refresh(newerAt);
  newer.resolve({ ...template, generatedAt: newerAt });
  assert.equal(await newerRefresh, "success");
  assert.equal(runtime.getState().viewModel?.generatedAt, newerAt);

  older.resolve({ ...template, generatedAt: olderAt });
  assert.equal(await olderRefresh, "superseded");
  assert.equal(runtime.getState().viewModel?.generatedAt, newerAt);
  assert.equal(runtime.getState().lastSuccessfulAt, newerAt);
}

// C12 gate: default runtime environment stays mock.
{
  const environment = createCommandCenterRuntimeEnvironment();
  assert.equal(environment.sourceMode, "mock");
  assert.equal(environment.runtime.getState().sourceKind, "mock");
  assert.equal(typeof environment.setDevScenario, "function");
}

// C12 gate: closed Live source fails before reading any injected adapter.
{
  const adapters = Object.fromEntries(
    integrationModuleRegistry.map((entry) => [
      entry.adapterKey,
      new MockModuleAdapter(entry.moduleId, entry.adapterKey, "healthy"),
    ]),
  );
  const source = new CommandCenterLiveDataSource({ enabled: false, adapters });

  await assert.rejects(
    () => source.read(now),
    (error: unknown) => error instanceof CommandCenterLiveGateClosedError
      && error.code === "LIVE_DATA_GATE_CLOSED",
  );
  for (const adapter of Object.values(adapters)) assert.equal(adapter.getReadCount(), 0);
}

// C12 gate: an explicitly enabled Live source can consume only injected ModuleReadAdapters.
{
  const adapters = Object.fromEntries(
    integrationModuleRegistry.map((entry) => [
      entry.adapterKey,
      new MockModuleAdapter(entry.moduleId, entry.adapterKey, "healthy"),
    ]),
  );
  const source = new CommandCenterLiveDataSource({ enabled: true, adapters });
  const view = await source.read(now);

  assert.equal(source.sourceKind, "live");
  assert.equal(view.modules.length, integrationModuleRegistry.length);
  assert.equal(view.modules.every((module) => module.reliability === "fresh"), true);
  for (const adapter of Object.values(adapters)) assert.equal(adapter.getReadCount(), 1);
}

// C12 gate: selecting Live without explicit config remains fail-closed.
{
  const environment = createCommandCenterRuntimeEnvironment({ mode: "live" });

  assert.equal(environment.sourceMode, "live");
  assert.equal(environment.runtime.getState().sourceKind, "live");
  assert.equal(environment.setDevScenario, undefined);
  assert.equal(await environment.runtime.refresh(now), "error");
  assert.equal(environment.runtime.getState().phase, "error");
  assert.equal(environment.runtime.getState().viewModel, undefined);
  assert.equal(environment.runtime.getState().lastSuccessfulAt, undefined);
}

class FixtureSanitizedModuleTransport implements SanitizedModuleTransport {
  private readonly results: Readonly<Record<string, SanitizedModuleTransportResult>>;
  private readonly readCounts = new Map<string, number>();

  constructor(results: Readonly<Record<string, SanitizedModuleTransportResult>>) {
    this.results = results;
  }

  async read(moduleId: string): Promise<SanitizedModuleTransportResult> {
    this.readCounts.set(moduleId, (this.readCounts.get(moduleId) ?? 0) + 1);
    return this.results[moduleId] ?? { kind: "no_data" };
  }

  getReadCount(moduleId: string) {
    return this.readCounts.get(moduleId) ?? 0;
  }
}

function transportAdapters(transport: SanitizedModuleTransport) {
  return Object.fromEntries(
    integrationModuleRegistry.map((entry) => [
      entry.adapterKey,
      new TransportModuleAdapter(entry.moduleId, entry.adapterKey, transport),
    ]),
  );
}

// C13: sanitized fixture payload can flow through TransportModuleAdapter -> LiveDataSource -> ViewModel.
{
  const results = Object.fromEntries(
    integrationModuleRegistry.map((entry) => [
      entry.moduleId,
      {
        kind: "payload" as const,
        payload: buildMockObservation(entry.moduleId, now),
      },
    ]),
  );
  const transport = new FixtureSanitizedModuleTransport(results);
  const adapters = transportAdapters(transport);
  const source = new CommandCenterLiveDataSource({ enabled: true, adapters });
  const view = await source.read(now);

  assert.equal(view.modules.length, integrationModuleRegistry.length);
  assert.equal(view.modules.every((module) => module.reliability === "fresh"), true);
  for (const entry of integrationModuleRegistry) assert.equal(transport.getReadCount(entry.moduleId), 1);
  for (const adapter of Object.values(adapters)) assert.equal("write" in adapter, false);
}

// C13: no-data is preserved as no-data semantics, never zero or healthy.
{
  const transport = new FixtureSanitizedModuleTransport({});
  const source = new CommandCenterLiveDataSource({
    enabled: true,
    adapters: transportAdapters(transport),
  });
  const view = await source.read(now);

  assert.equal(view.modules.every((module) => module.reliability === "no_data"), true);
  assert.equal(view.managementSummary.healthyModuleCount, 0);
  assert.equal(view.overallState, "unknown");
}

// C13: normalized transport failure becomes data-health unavailable without leaking raw details.
{
  const results = Object.fromEntries(
    integrationModuleRegistry.map((entry) => [
      entry.moduleId,
      {
        kind: "unavailable" as const,
        category: "timeout" as const,
        reference: "fixture-timeout-ref",
      },
    ]),
  );
  const transport = new FixtureSanitizedModuleTransport(results);
  const source = new CommandCenterLiveDataSource({
    enabled: true,
    adapters: transportAdapters(transport),
  });
  const view = await source.read(now);

  assert.equal(view.modules.every((module) => module.reliability === "unavailable"), true);
  assert.equal(view.reliability.failedModuleCount, integrationModuleRegistry.length);
  assert.equal(view.modules.every((module) => !/fixture-timeout-ref/i.test(module.summaryText)), true);
}

// C13: malformed sanitized payload is rejected by the existing validation boundary.
{
  const results = Object.fromEntries(
    integrationModuleRegistry.map((entry) => [
      entry.moduleId,
      { kind: "payload" as const, payload: { moduleId: entry.moduleId, malformed: true } },
    ]),
  );
  const transport = new FixtureSanitizedModuleTransport(results);
  const source = new CommandCenterLiveDataSource({
    enabled: true,
    adapters: transportAdapters(transport),
  });
  const view = await source.read(now);

  assert.equal(view.modules.every((module) => module.reliability === "invalid"), true);
  assert.equal(view.managementSummary.healthyModuleCount, 0);
}

// C13: C12 closed gate prevents even a configured transport adapter from being read.
{
  const transport = new FixtureSanitizedModuleTransport(
    Object.fromEntries(
      integrationModuleRegistry.map((entry) => [
        entry.moduleId,
        { kind: "payload" as const, payload: buildMockObservation(entry.moduleId, now) },
      ]),
    ),
  );
  const source = new CommandCenterLiveDataSource({
    enabled: false,
    adapters: transportAdapters(transport),
  });

  await assert.rejects(() => source.read(now), CommandCenterLiveGateClosedError);
  for (const entry of integrationModuleRegistry) assert.equal(transport.getReadCount(entry.moduleId), 0);
}

console.log("Integration Backbone baseline, C11 runtime, C12 live-gate and C13 transport-adapter tests passed.");
