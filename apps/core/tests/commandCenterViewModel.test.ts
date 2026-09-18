import assert from "node:assert/strict";
import { buildMockObservation } from "../src/integration/adapters/mockModuleAdapter.ts";
import type {
  CoreModuleResult,
  ModuleAggregationResult,
  ModuleAlert,
  ModuleKpi,
  ModuleResultStatus,
} from "@master-gem/module-contracts";
import {
  buildCommandCenterViewModel,
  rankCommandCenterAttention,
  type CommandCenterAttentionItem,
} from "../src/integration/commandCenter/commandCenterViewModel.ts";

const now = "2026-08-07T10:00:00.000Z";

function observation(
  moduleId: string,
  options: { alerts?: ModuleAlert[]; kpis?: ModuleKpi[]; generatedAt?: string } = {},
) {
  const value = buildMockObservation(moduleId, options.generatedAt ?? now);
  value.alerts = options.alerts ?? [];
  value.kpis = options.kpis ?? [];
  value.summary.text = `Synthetic summary for ${moduleId}`;
  return value;
}

function moduleResult(options: {
  moduleId?: string;
  status?: ModuleResultStatus;
  effectiveState?: CoreModuleResult["effectiveState"];
  sourceHealth?: CoreModuleResult["sourceHealth"];
  freshness?: CoreModuleResult["freshness"];
  alerts?: ModuleAlert[];
  kpis?: ModuleKpi[];
  lastKnownGood?: CoreModuleResult["lastKnownGood"];
  partial?: boolean;
} = {}): CoreModuleResult {
  const moduleId = options.moduleId ?? "workforce.demo";
  const status = options.status ?? "valid";
  const canHaveCurrentObservation = status === "valid" || status === "valid_with_warnings";
  const currentObservation = canHaveCurrentObservation
    ? observation(moduleId, { alerts: options.alerts, kpis: options.kpis })
    : undefined;
  if (currentObservation && options.partial) currentObservation.partial = { isPartial: true };
  return {
    moduleId,
    displayName: moduleId,
    status,
    validation: status === "valid" ? "valid" : status === "valid_with_warnings" ? "valid_with_warnings" : "invalid",
    sourceHealth: options.sourceHealth ?? (status === "unavailable" ? "unavailable" : "healthy"),
    freshness: options.freshness ?? (status === "disabled" ? "unknown" : "fresh"),
    effectiveState: options.effectiveState ?? (status === "unavailable" ? "unavailable" : "healthy"),
    receivedAt: now,
    lastSuccessfulSyncAt: canHaveCurrentObservation ? now : undefined,
    observation: currentObservation,
    lastKnownGood: options.lastKnownGood,
    diagnostics: [],
  };
}

function aggregation(modules: CoreModuleResult[]): ModuleAggregationResult {
  return {
    generatedAt: now,
    modules,
    summary: {
      total: modules.length,
      healthy: modules.filter((item) => item.effectiveState === "healthy").length,
      degraded: modules.filter((item) => item.effectiveState === "degraded").length,
      unavailable: modules.filter((item) => item.effectiveState === "unavailable").length,
      stale: modules.filter((item) => item.effectiveState === "stale").length,
      unknown: modules.filter((item) => item.effectiveState === "unknown").length,
      invalid: modules.filter((item) => ["invalid_payload", "unsupported_version", "registry_error"].includes(item.status)).length,
      disabled: modules.filter((item) => item.status === "disabled").length,
    },
  };
}

function alert(
  severity: ModuleAlert["severity"],
  id = `alert-${severity}`,
  detectedAt = now,
): ModuleAlert {
  return {
    alertId: id,
    category: "synthetic",
    severity,
    title: `${severity} synthetic alert`,
    summary: "Synthetic alert for Command Center tests.",
    detectedAt,
    status: "open",
  };
}

function kpi(status: ModuleKpi["status"], key = `kpi-${status}`): ModuleKpi {
  return {
    key,
    label: `${status} synthetic KPI`,
    value: 7,
    valueType: "count",
    status,
    measuredAt: now,
  };
}

// 1. All healthy.
{
  const view = buildCommandCenterViewModel(aggregation([moduleResult()]));
  assert.equal(view.overallState, "healthy");
  assert.equal(view.managementSummary.healthyModuleCount, 1);
  assert.equal(view.topAttention.length, 0);
}

// 2. Degraded.
{
  const view = buildCommandCenterViewModel(aggregation([moduleResult({
    status: "valid_with_warnings",
    effectiveState: "degraded",
    partial: true,
  })]));
  assert.equal(view.modules[0].reliability, "degraded");
  assert.equal(view.modules[0].isPartialData, true);
  assert.match(view.modules[0].summaryText, /تصمیم‌گیری کامل نیست/);
  assert.equal(view.topAttention[0].priorityTier, 2);
}

// 3. Unavailable.
{
  const view = buildCommandCenterViewModel(aggregation([moduleResult({ status: "unavailable" })]));
  assert.equal(view.modules[0].reliability, "unavailable");
  assert.equal(view.topAttention[0].severity, "critical");
}

// 4. Stale last-known-good semantics.
{
  const view = buildCommandCenterViewModel(aggregation([moduleResult({
    freshness: "stale",
    effectiveState: "stale",
  })]));
  assert.equal(view.modules[0].reliability, "stale_last_known_good");
  assert.match(view.modules[0].reliabilityLabel, /قدیمی/);
  assert.equal(view.modules[0].hasLastKnownGood, true);
  assert.equal(view.modules[0].dataStateLabel, "داده فعلی قدیمی است");
}

// 5. Invalid.
{
  const view = buildCommandCenterViewModel(aggregation([moduleResult({
    status: "invalid_payload",
    sourceHealth: "unknown",
    effectiveState: "unknown",
    freshness: "unknown",
  })]));
  assert.equal(view.modules[0].reliability, "invalid");
  assert.equal(view.topAttention[0].priorityTier, 0);
}

// 6. Unsupported version.
{
  const view = buildCommandCenterViewModel(aggregation([moduleResult({
    status: "unsupported_version",
    sourceHealth: "unknown",
    effectiveState: "unknown",
    freshness: "unknown",
  })]));
  assert.equal(view.modules[0].reliability, "unsupported_version");
  assert.equal(view.topAttention[0].priorityTier, 0);
}

// 7. No data is explicit and not zero/healthy.
{
  const view = buildCommandCenterViewModel(aggregation([moduleResult({
    status: "no_data",
    sourceHealth: "unknown",
    effectiveState: "unknown",
    freshness: "unknown",
  })]));
  assert.equal(view.modules[0].reliability, "no_data");
  assert.equal(view.managementSummary.healthyModuleCount, 0);
}

// 8. Disabled is not unavailable and is excluded from enabled totals.
{
  const view = buildCommandCenterViewModel(aggregation([moduleResult({
    status: "disabled",
    sourceHealth: "unknown",
    effectiveState: "unknown",
    freshness: "unknown",
  })]));
  assert.equal(view.modules[0].reliability, "disabled");
  assert.equal(view.managementSummary.enabledModuleCount, 0);
  assert.equal(view.managementSummary.unavailableModuleCount, 0);
  assert.equal(view.topAttention.length, 0);
}

// 9. Critical open alert is promoted.
{
  const view = buildCommandCenterViewModel(aggregation([moduleResult({ alerts: [alert("critical")] })]));
  assert.equal(view.topAttention[0].sourceType, "alert");
  assert.equal(view.topAttention[0].severity, "critical");
  assert.equal(view.topAttention[0].priorityTier, 1);
}

// 10. Low-priority info alert is not promoted.
{
  const view = buildCommandCenterViewModel(aggregation([moduleResult({ alerts: [alert("info")] })]));
  assert.equal(view.topAttention.length, 0);
  assert.equal(view.modules[0].alertCounts.info, 1);
}

// 11. Warning and critical KPIs are highlighted; normal is not.
{
  const view = buildCommandCenterViewModel(aggregation([moduleResult({
    kpis: [kpi("warning"), kpi("critical"), kpi("normal")],
  })]));
  assert.deepEqual(view.kpiHighlights.map((item) => item.status), ["critical", "warning"]);
  assert.equal(view.kpiHighlights.some((item) => item.kpiKey === "kpi-normal"), false);
}

// 12. Fresh and stale KPI reliability remain distinct.
{
  const fresh = buildCommandCenterViewModel(aggregation([moduleResult({ kpis: [kpi("warning")] })]));
  const stale = buildCommandCenterViewModel(aggregation([moduleResult({
    kpis: [kpi("warning")],
    freshness: "stale",
    effectiveState: "stale",
  })]));
  assert.equal(fresh.kpiHighlights[0].reliability, "fresh");
  assert.equal(stale.kpiHighlights[0].reliability, "stale_last_known_good");
}

// 13. Multi-module ordering is deterministic and blocking precedes urgent/attention.
{
  const view = buildCommandCenterViewModel(aggregation([
    moduleResult({ moduleId: "workforce.warning", alerts: [alert("warning")] }),
    moduleResult({ moduleId: "workforce.invalid", status: "invalid_payload", sourceHealth: "unknown", effectiveState: "unknown", freshness: "unknown" }),
    moduleResult({ moduleId: "workforce.critical", alerts: [alert("critical")] }),
  ]));
  assert.equal(view.topAttention[0].moduleId, "workforce.invalid");
  assert.equal(view.topAttention[1].moduleId, "workforce.critical");
}

// 14. One failed module does not blank healthy module results.
{
  const view = buildCommandCenterViewModel(aggregation([
    moduleResult({ moduleId: "workforce.healthy" }),
    moduleResult({ moduleId: "workforce.failed", status: "unavailable" }),
  ]));
  assert.equal(view.modules.length, 2);
  assert.equal(view.managementSummary.healthyModuleCount, 1);
  assert.equal(view.managementSummary.unavailableModuleCount, 1);
}

// 15. No-attention state is explicit.
{
  const view = buildCommandCenterViewModel(aggregation([moduleResult({ alerts: [], kpis: [] })]));
  assert.equal(view.topAttention.length, 0);
  assert.equal(view.overallState, "healthy");
}

// 16. No KPI highlights is distinct from a zero KPI value.
{
  const view = buildCommandCenterViewModel(aggregation([moduleResult({ kpis: [kpi("normal")] })]));
  assert.equal(view.kpiHighlights.length, 0);
}

// 17. Stable tie-break and same-input determinism.
{
  const items: CommandCenterAttentionItem[] = ["z.module", "a.module"].map((moduleId) => ({
    attentionId: `${moduleId}:same`,
    moduleId,
    moduleName: moduleId,
    sourceType: "alert",
    title: "Same",
    summary: "Same",
    severity: "warning",
    confidence: "high",
    reliability: "fresh",
    priorityTier: 2,
    riskFlags: [],
    detectedAt: now,
  }));
  const first = rankCommandCenterAttention(items);
  const second = rankCommandCenterAttention(items);
  assert.deepEqual(first, second);
  assert.deepEqual(first.map((item) => item.moduleId), ["a.module", "z.module"]);
}

// 18. No task/decision mutation or auto-creation surface exists in the view model.
{
  const view = buildCommandCenterViewModel(aggregation([moduleResult({ alerts: [alert("critical")] })]));
  assert.equal("tasks" in view, false);
  assert.equal("decisions" in view, false);
  assert.equal("execute" in view.topAttention[0], false);
}

// 19. Unavailable module can retain a clearly stale last-known-good KPI.
{
  const previous = observation("workforce.demo", { kpis: [kpi("warning")] });
  const view = buildCommandCenterViewModel(aggregation([moduleResult({
    status: "unavailable",
    freshness: "stale",
    lastKnownGood: previous,
  })]));
  assert.equal(view.modules[0].reliability, "unavailable");
  assert.equal(view.modules[0].hasLastKnownGood, true);
  assert.equal(view.kpiHighlights[0].reliability, "stale_last_known_good");
}

// 20. Derivation does not mutate normalized input and invalid can never render healthy.
{
  const input = aggregation([moduleResult({
    status: "invalid_payload",
    sourceHealth: "unknown",
    effectiveState: "unknown",
    freshness: "unknown",
  })]);
  const before = JSON.stringify(input);
  const first = buildCommandCenterViewModel(input);
  const second = buildCommandCenterViewModel(input);
  assert.equal(JSON.stringify(input), before);
  assert.deepEqual(first, second);
  assert.equal(first.managementSummary.healthyModuleCount, 0);
  assert.notEqual(first.modules[0].reliability, "fresh");
}

console.log("Command Center view-model tests passed.");
