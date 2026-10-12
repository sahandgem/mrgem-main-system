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
import {
  buildProductionOperationsObservation,
  PRODUCTION_OPERATIONS_SNAPSHOT_VERSION,
  ProductionOperationsObservationContractError,
  type SanitizedProductionOperationsSnapshotV1,
} from "../src/integration/production/productionOperationsObservation.ts";
import { ProductionOperationsSanitizedTransport } from "../src/integration/production/productionOperationsTransport.ts";

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

// C14: Product Monitoring identity DTO is a different contract and must never be accepted as a Command Center module observation.
{
  const productMonitoringIdentityDto = {
    contractVersion: "1.0",
    sources: [{
      sourceId: "mahak-product-identity",
      sourceName: "Mahak operational product identity",
      authorityClass: "unknown",
      contractVersion: "1.0",
      sourceSchemaVersion: "mahak-product-identity-v1",
      correlationId: "corr_test",
      attemptedAt: now,
      locationIds: [],
      timezone: "Etc/UTC",
      payloadState: "current",
      availability: "available",
      fetchedAt: now,
      sourceUpdatedAt: now,
      freshness: "fresh",
    }],
    product: {
      productId: "pc-product-test",
      productCode: "TEST-001",
      displayName: "Test Product",
    },
    sections: [{
      sectionId: "identity",
      enabled: true,
      required: true,
      state: "valid",
      sourceRefs: ["mahak-product-identity"],
    }],
    overallStatus: "COMPLETE",
    overallFreshness: "fresh",
  };
  const results = Object.fromEntries(
    integrationModuleRegistry.map((entry) => [
      entry.moduleId,
      { kind: "payload" as const, payload: productMonitoringIdentityDto },
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
  assert.equal(view.topAttention.length, 0);
}

function productionSnapshot(
  overrides: Partial<SanitizedProductionOperationsSnapshotV1> = {},
): SanitizedProductionOperationsSnapshotV1 {
  return {
    contractVersion: PRODUCTION_OPERATIONS_SNAPSHOT_VERSION,
    generatedAt: now,
    sourceDataUpdatedAt: now,
    counts: {
      draft: 2,
      reservationPending: 1,
      reserved: 1,
      released: 1,
      issuePending: 1,
      inProgress: 3,
      awaitingQc: 2,
      completionPending: 1,
      completed: 8,
      cancelled: 1,
    },
    ...overrides,
  };
}

// C15: exact Production order-state counts map to a valid production.operations ModuleObservation.
{
  const observation = buildProductionOperationsObservation(productionSnapshot());
  const productionEntry: ModuleRegistryEntry = {
    moduleId: "production.operations",
    displayName: "عملیات تولید",
    moduleType: "production",
    enabled: true,
    expectedContractMajor: 1,
    freshnessPolicy: {
      staleAfterSeconds: 5 * 60,
      criticalAfterSeconds: 15 * 60,
      allowedFutureSkewSeconds: 60,
    },
    adapterKey: "transport.production.operations",
  };
  const validated = validateAndNormalizeObservation(observation, productionEntry, now);

  assert.equal(validated.status, "valid");
  assert.equal(validated.effectiveState, "healthy");
  assert.equal(observation.module.sourceSystem, "master-gem-production-center");
  assert.equal(observation.ownership.businessTruthOwner, "master-gem-production-center");
  const kpis = Object.fromEntries((observation.kpis ?? []).map((item) => [item.key, item]));
  assert.equal(kpis.production_open_orders.value, 10);
  assert.equal(kpis.production_in_progress_orders.value, 3);
  assert.equal(kpis.production_awaiting_qc_orders.value, 2);
  assert.equal(kpis.production_awaiting_qc_orders.status, "info");
  assert.equal(kpis.production_integration_pending_orders.value, 3);
  assert.equal(kpis.production_integration_pending_orders.status, "info");
  assert.equal((observation.alerts ?? []).length, 0);
}

// C15: zero operational counts stay normal and are never turned into synthetic warnings.
{
  const snapshot = productionSnapshot({
    sourceDataUpdatedAt: null,
    counts: {
      draft: 0,
      reservationPending: 0,
      reserved: 0,
      released: 0,
      issuePending: 0,
      inProgress: 0,
      awaitingQc: 0,
      completionPending: 0,
      completed: 0,
      cancelled: 0,
    },
  });
  const observation = buildProductionOperationsObservation(snapshot);
  assert.equal(observation.sourceDataUpdatedAt, undefined);
  assert.equal(observation.kpis?.every((item) => item.status === "normal"), true);
  assert.match(observation.summary.text, /بازی ثبت نشده/);
}

// C15: invalid versions and invalid counts fail closed before ModuleObservation creation.
{
  assert.throws(
    () => buildProductionOperationsObservation({
      ...productionSnapshot(),
      contractVersion: "wrong-version" as typeof PRODUCTION_OPERATIONS_SNAPSHOT_VERSION,
    }),
    ProductionOperationsObservationContractError,
  );
  assert.throws(
    () => buildProductionOperationsObservation({
      ...productionSnapshot(),
      counts: { ...productionSnapshot().counts, awaitingQc: -1 },
    }),
    ProductionOperationsObservationContractError,
  );
  assert.throws(
    () => buildProductionOperationsObservation({
      ...productionSnapshot(),
      counts: { ...productionSnapshot().counts, inProgress: 1.5 },
    }),
    ProductionOperationsObservationContractError,
  );
}

// C17: C16-shaped Production snapshot reaches the Command Center end-to-end through the guarded transport path.
{
  const productionEntry: ModuleRegistryEntry = {
    moduleId: "production.operations",
    displayName: "عملیات تولید",
    moduleType: "production",
    enabled: true,
    expectedContractMajor: 1,
    freshnessPolicy: {
      staleAfterSeconds: 5 * 60,
      criticalAfterSeconds: 15 * 60,
      allowedFutureSkewSeconds: 60,
    },
    adapterKey: "transport.production.operations",
  };
  const liveRegistry: readonly ModuleRegistryEntry[] = [
    registryEntry("workforce.demo", "mock.workforce"),
    productionEntry,
  ];
  let productionReadCount = 0;
  const productionTransport = new ProductionOperationsSanitizedTransport({
    reader: {
      async read() {
        productionReadCount += 1;
        return productionSnapshot();
      },
    },
    environment: "test",
  });
  const adapters = {
    "mock.workforce": new MockModuleAdapter("workforce.demo", "mock.workforce", "normal_day"),
    "transport.production.operations": new TransportModuleAdapter(
      "production.operations",
      "transport.production.operations",
      productionTransport,
    ),
  };
  const source = new CommandCenterLiveDataSource({
    enabled: true,
    registry: liveRegistry,
    adapters,
  });
  const view = await source.read(now);
  const productionModule = view.modules.find((module) => module.moduleId === "production.operations");
  const productionKpis = view.kpiHighlights.filter((item) => item.moduleId === "production.operations");

  assert.equal(view.dataLabel, "LIVE/READ-ONLY");
  assert.equal(view.modules.length, 2);
  assert.equal(productionReadCount, 1);
  assert.ok(productionModule);
  assert.equal(productionModule.reliability, "fresh");
  assert.equal(productionModule.isExperimental, false);
  assert.equal(productionModule.summaryText, "10 سفارش تولید پس از مرحله پیش‌نویس هنوز در وضعیت غیرنهایی قرار دارد.");
  assert.equal(productionKpis.some((item) => item.kpiKey === "production_open_orders" && item.displayValue === "10"), true);
  assert.equal(productionKpis.some((item) => item.kpiKey === "production_awaiting_qc_orders" && item.displayValue === "2"), true);
}

// C17: the same Production transport stays unread when the Live gate is closed.
{
  let readCount = 0;
  const productionTransport = new ProductionOperationsSanitizedTransport({
    reader: {
      async read() {
        readCount += 1;
        return productionSnapshot();
      },
    },
  });
  const productionEntry: ModuleRegistryEntry = {
    moduleId: "production.operations",
    displayName: "عملیات تولید",
    moduleType: "production",
    enabled: true,
    expectedContractMajor: 1,
    freshnessPolicy: {
      staleAfterSeconds: 5 * 60,
      criticalAfterSeconds: 15 * 60,
      allowedFutureSkewSeconds: 60,
    },
    adapterKey: "transport.production.operations",
  };
  const source = new CommandCenterLiveDataSource({
    enabled: false,
    registry: [productionEntry],
    adapters: {
      "transport.production.operations": new TransportModuleAdapter(
        "production.operations",
        "transport.production.operations",
        productionTransport,
      ),
    },
  });

  await assert.rejects(() => source.read(now), CommandCenterLiveGateClosedError);
  assert.equal(readCount, 0);
}

// C17: Production contract mismatch is normalized to unavailable and cannot masquerade as healthy data.
{
  const productionTransport = new ProductionOperationsSanitizedTransport({
    reader: {
      async read() {
        return {
          ...productionSnapshot(),
          contractVersion: "wrong-version",
        } as SanitizedProductionOperationsSnapshotV1;
      },
    },
  });
  const result = await productionTransport.read("production.operations");
  assert.equal(result.kind, "unavailable");
  if (result.kind === "unavailable") assert.equal(result.category, "validation");
}

console.log("Integration Backbone baseline, C11 runtime, C12 live-gate, C13 transport-adapter, C14 contract-separation, C15 production-observation and C17 end-to-end tests passed.");
