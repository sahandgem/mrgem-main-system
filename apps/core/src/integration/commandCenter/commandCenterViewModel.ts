import type {
  CoreModuleResult,
  ModuleAggregationResult,
  ModuleKpi,
  ModuleResultStatus,
} from "@master-gem/module-contracts";

export type CommandCenterSeverity = "critical" | "warning" | "info";
export type CommandCenterConfidence = "high" | "medium" | "low" | "unknown";
export type CommandCenterOverallState = "healthy" | "attention" | "critical" | "unknown";
export type CommandCenterReliabilityState =
  | "fresh"
  | "degraded"
  | "stale_last_known_good"
  | "unavailable"
  | "invalid"
  | "unsupported_version"
  | "no_data"
  | "disabled"
  | "unknown";

export type CommandCenterAttentionSource = "module_state" | "alert" | "kpi" | "data_quality";

export interface CommandCenterModuleSummary {
  moduleId: string;
  displayName: string;
  status: ModuleResultStatus;
  health: CoreModuleResult["sourceHealth"];
  freshness: CoreModuleResult["freshness"];
  reliability: CommandCenterReliabilityState;
  reliabilityLabel: string;
  summaryText: string;
  observedAt?: string;
  lastSuccessfulAt?: string;
  hasLastKnownGood: boolean;
  alertCounts: { critical: number; warning: number; info: number };
  highlightedKpiCount: number;
  detailRouteRef?: string;
}

export interface CommandCenterAttentionItem {
  attentionId: string;
  moduleId: string;
  moduleName: string;
  sourceType: CommandCenterAttentionSource;
  sourceRef?: string;
  title: string;
  summary: string;
  severity: CommandCenterSeverity;
  confidence: CommandCenterConfidence;
  reliability: CommandCenterReliabilityState;
  priorityTier: 0 | 1 | 2 | 3;
  riskFlags: string[];
  detectedAt?: string;
  suggestedNextStep?: string;
  drillDownRef?: string;
}

export interface CommandCenterKpiHighlight {
  highlightId: string;
  moduleId: string;
  moduleName: string;
  kpiKey: string;
  label: string;
  displayValue: string;
  status: "critical" | "warning";
  reliability: CommandCenterReliabilityState;
  reliabilityLabel: string;
  observedAt?: string;
  explanation: string;
  drillDownRef?: string;
}

export interface CommandCenterManagementSummary {
  enabledModuleCount: number;
  healthyModuleCount: number;
  attentionModuleCount: number;
  unavailableModuleCount: number;
  staleModuleCount: number;
  criticalAttentionCount: number;
  warningAttentionCount: number;
}

export interface CommandCenterReliabilitySummary {
  completeModuleCount: number;
  partialModuleCount: number;
  failedModuleCount: number;
  unknownFreshnessCount: number;
  hasPartialData: boolean;
}

export interface CommandCenterViewModel {
  generatedAt: string;
  sourceSchemaVersion: "integration-contract-v1";
  dataLabel: "DEMO/MOCK";
  overallState: CommandCenterOverallState;
  managementSummary: CommandCenterManagementSummary;
  reliability: CommandCenterReliabilitySummary;
  modules: CommandCenterModuleSummary[];
  topAttention: CommandCenterAttentionItem[];
  kpiHighlights: CommandCenterKpiHighlight[];
}

export interface CommandCenterViewModelOptions {
  allowedDrillDownRefs?: ReadonlySet<string>;
  moduleDetailRoutes?: Readonly<Record<string, string>>;
  maxAttentionItems?: number;
  nonCriticalPerModuleLimit?: number;
}

const severityRank: Record<CommandCenterSeverity, number> = {
  critical: 0,
  warning: 1,
  info: 2,
};

const reliabilityRank: Record<CommandCenterReliabilityState, number> = {
  invalid: 0,
  unsupported_version: 1,
  unavailable: 2,
  stale_last_known_good: 3,
  degraded: 4,
  no_data: 5,
  unknown: 6,
  fresh: 7,
  disabled: 8,
};

function compareText(left: string, right: string) {
  if (left === right) return 0;
  return left < right ? -1 : 1;
}

function timestampValue(value?: string) {
  if (!value) return 0;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function compareCommandCenterAttention(
  left: CommandCenterAttentionItem,
  right: CommandCenterAttentionItem,
) {
  if (left.priorityTier !== right.priorityTier) return left.priorityTier - right.priorityTier;
  if (severityRank[left.severity] !== severityRank[right.severity]) {
    return severityRank[left.severity] - severityRank[right.severity];
  }
  if (reliabilityRank[left.reliability] !== reliabilityRank[right.reliability]) {
    return reliabilityRank[left.reliability] - reliabilityRank[right.reliability];
  }
  const timeDifference = timestampValue(right.detectedAt) - timestampValue(left.detectedAt);
  if (timeDifference !== 0) return timeDifference;
  const moduleDifference = compareText(left.moduleId, right.moduleId);
  return moduleDifference || compareText(left.attentionId, right.attentionId);
}

export function rankCommandCenterAttention(
  items: readonly CommandCenterAttentionItem[],
  maxItems = 8,
  nonCriticalPerModuleLimit = 3,
) {
  const sorted = [...items].sort(compareCommandCenterAttention);
  const nonCriticalCounts = new Map<string, number>();
  const limited = sorted.filter((item) => {
    if (item.severity === "critical") return true;
    const current = nonCriticalCounts.get(item.moduleId) ?? 0;
    if (current >= nonCriticalPerModuleLimit) return false;
    nonCriticalCounts.set(item.moduleId, current + 1);
    return true;
  });
  return limited.slice(0, Math.max(0, maxItems));
}

function reliabilityFor(result: CoreModuleResult): CommandCenterReliabilityState {
  if (result.status === "disabled") return "disabled";
  if (result.status === "unsupported_version") return "unsupported_version";
  if (result.status === "invalid_payload" || result.status === "registry_error") return "invalid";
  if (result.status === "unavailable") return "unavailable";
  if (result.status === "no_data") return "no_data";
  if (result.freshness === "stale") return "stale_last_known_good";
  if (result.effectiveState === "degraded" || result.status === "valid_with_warnings") return "degraded";
  if (result.freshness === "fresh" && result.effectiveState === "healthy") return "fresh";
  return "unknown";
}

export function commandCenterReliabilityLabel(state: CommandCenterReliabilityState) {
  const labels: Record<CommandCenterReliabilityState, string> = {
    fresh: "تازه و معتبر",
    degraded: "معتبر با هشدار",
    stale_last_known_good: "آخرین داده معتبر؛ قدیمی",
    unavailable: "در دسترس نیست",
    invalid: "داده نامعتبر",
    unsupported_version: "نسخه ناسازگار",
    no_data: "بدون داده",
    disabled: "غیرفعال",
    unknown: "وضعیت نامشخص",
  };
  return labels[state];
}

function summaryFor(result: CoreModuleResult, reliability: CommandCenterReliabilityState) {
  if (reliability === "fresh") return result.observation?.summary.text ?? "داده تازه و معتبر دریافت شد.";
  if (reliability === "degraded") return result.observation?.summary.text ?? "داده با هشدار یا به‌صورت ناقص دریافت شد.";
  if (reliability === "stale_last_known_good") return "آخرین داده معتبر نگه داشته شده، اما تازه نیست.";
  if (reliability === "unavailable" && result.lastKnownGood) {
    return "ماژول در دسترس نیست؛ آخرین داده معتبر فقط برای زمینه حفظ شده است.";
  }
  if (reliability === "unavailable") return "ماژول در دسترس نیست و داده معتبر قبلی وجود ندارد.";
  if (reliability === "invalid") return "payload فعلی نامعتبر است و برای نمایش قابل اعتماد نیست.";
  if (reliability === "unsupported_version") return "نسخه قرارداد فعلی پشتیبانی نمی‌شود.";
  if (reliability === "no_data") return "ماژول فعال است، اما هنوز observation ندارد.";
  if (reliability === "disabled") return "ماژول در registry غیرفعال است.";
  return "قابلیت اطمینان داده مشخص نیست.";
}

function observationForDisplay(result: CoreModuleResult) {
  if ((result.status === "valid" || result.status === "valid_with_warnings") && result.observation) {
    return { observation: result.observation, isLastKnownGood: false };
  }
  if (result.lastKnownGood) return { observation: result.lastKnownGood, isLastKnownGood: true };
  return undefined;
}

function safeDrillDown(ref: string | undefined, allowed: ReadonlySet<string>) {
  return ref && allowed.has(ref) ? ref : undefined;
}

function confidenceFor(reliability: CommandCenterReliabilityState): CommandCenterConfidence {
  if (reliability === "fresh") return "high";
  if (reliability === "degraded") return "medium";
  if (reliability === "stale_last_known_good") return "low";
  return "unknown";
}

function riskFlagsFor(reliability: CommandCenterReliabilityState) {
  if (reliability === "fresh") return [];
  return [reliability];
}

function displayKpiValue(kpi: ModuleKpi) {
  if (kpi.value === null) return "نامشخص";
  const value = typeof kpi.value === "boolean" ? (kpi.value ? "بله" : "خیر") : String(kpi.value);
  return kpi.unit ? `${value} ${kpi.unit}` : value;
}

function moduleStateAttention(
  result: CoreModuleResult,
  reliability: CommandCenterReliabilityState,
): CommandCenterAttentionItem | undefined {
  const base = {
    moduleId: result.moduleId,
    moduleName: result.displayName,
    reliability,
    confidence: confidenceFor(reliability),
    detectedAt: result.receivedAt,
    riskFlags: riskFlagsFor(reliability),
  };
  if (reliability === "invalid" || reliability === "unsupported_version") {
    return {
      ...base,
      attentionId: `${result.moduleId}:data-quality:${result.status}`,
      sourceType: "data_quality",
      title: reliability === "invalid" ? "داده ماژول نامعتبر است" : "نسخه قرارداد پشتیبانی نمی‌شود",
      summary: summaryFor(result, reliability),
      severity: "critical",
      priorityTier: 0,
      suggestedNextStep: "سازگاری قرارداد و diagnostics ماژول بررسی شود.",
    };
  }
  if (reliability === "unavailable") {
    return {
      ...base,
      attentionId: `${result.moduleId}:module-state:unavailable`,
      sourceType: "module_state",
      title: "ماژول در دسترس نیست",
      summary: summaryFor(result, reliability),
      severity: "critical",
      priorityTier: 1,
      suggestedNextStep: "دسترس‌پذیری منبع بررسی و از داده قدیمی به‌عنوان داده تازه استفاده نشود.",
    };
  }
  if (reliability === "stale_last_known_good" || reliability === "degraded" || reliability === "no_data") {
    const title = reliability === "stale_last_known_good"
      ? "داده ماژول قدیمی است"
      : reliability === "degraded"
        ? "ماژول با هشدار کار می‌کند"
        : "ماژول هنوز داده‌ای ندارد";
    return {
      ...base,
      attentionId: `${result.moduleId}:module-state:${reliability}`,
      sourceType: reliability === "no_data" ? "data_quality" : "module_state",
      title,
      summary: summaryFor(result, reliability),
      severity: "warning",
      priorityTier: 2,
      suggestedNextStep: "وضعیت منبع و زمان آخرین داده بررسی شود.",
    };
  }
  if (reliability === "unknown") {
    return {
      ...base,
      attentionId: `${result.moduleId}:module-state:unknown`,
      sourceType: "module_state",
      title: "وضعیت ماژول نامشخص است",
      summary: summaryFor(result, reliability),
      severity: "info",
      priorityTier: 3,
    };
  }
  return undefined;
}

function kpiHighlightsFor(
  result: CoreModuleResult,
  reliability: CommandCenterReliabilityState,
  allowed: ReadonlySet<string>,
) {
  const display = observationForDisplay(result);
  if (!display) return [];
  return (display.observation.kpis ?? []).flatMap<CommandCenterKpiHighlight>((kpi) => {
    if (kpi.status !== "critical" && kpi.status !== "warning") return [];
    const displayReliability = display.isLastKnownGood ? "stale_last_known_good" : reliability;
    return [{
      highlightId: `${result.moduleId}:kpi:${kpi.key}`,
      moduleId: result.moduleId,
      moduleName: result.displayName,
      kpiKey: kpi.key,
      label: kpi.label,
      displayValue: displayKpiValue(kpi),
      status: kpi.status,
      reliability: displayReliability,
      reliabilityLabel: commandCenterReliabilityLabel(displayReliability),
      observedAt: kpi.measuredAt,
      explanation: display.isLastKnownGood
        ? "این KPI از آخرین داده معتبر است و نباید داده جاری تلقی شود."
        : kpi.status === "critical" ? "KPI بحرانی ماژول" : "KPI نیازمند توجه",
      drillDownRef: safeDrillDown(kpi.drillDownRef, allowed),
    }];
  });
}

function alertAttentionFor(
  result: CoreModuleResult,
  reliability: CommandCenterReliabilityState,
  allowed: ReadonlySet<string>,
) {
  const display = observationForDisplay(result);
  if (!display) return [];
  return (display.observation.alerts ?? []).flatMap<CommandCenterAttentionItem>((alert) => {
    if (alert.status !== "open" || alert.severity === "info") return [];
    const displayReliability = display.isLastKnownGood ? "stale_last_known_good" : reliability;
    return [{
      attentionId: `${result.moduleId}:alert:${alert.alertId}`,
      moduleId: result.moduleId,
      moduleName: result.displayName,
      sourceType: "alert",
      sourceRef: alert.sourceReference,
      title: alert.title,
      summary: display.isLastKnownGood ? `${alert.summary} (از آخرین داده معتبر)` : alert.summary,
      severity: alert.severity,
      confidence: confidenceFor(displayReliability),
      reliability: displayReliability,
      priorityTier: alert.severity === "critical" ? 1 : 2,
      riskFlags: riskFlagsFor(displayReliability),
      detectedAt: alert.detectedAt,
      suggestedNextStep: alert.recommendedNextAction,
      drillDownRef: safeDrillDown(alert.drillDownRef, allowed),
    }];
  });
}

function kpiAttentionFor(highlights: readonly CommandCenterKpiHighlight[]): CommandCenterAttentionItem[] {
  return highlights.map((highlight) => ({
    attentionId: `${highlight.moduleId}:kpi-attention:${highlight.kpiKey}`,
    moduleId: highlight.moduleId,
    moduleName: highlight.moduleName,
    sourceType: "kpi",
    sourceRef: highlight.kpiKey,
    title: highlight.label,
    summary: `${highlight.displayValue} — ${highlight.explanation}`,
    severity: highlight.status,
    confidence: confidenceFor(highlight.reliability),
    reliability: highlight.reliability,
    priorityTier: highlight.status === "critical" ? 1 : 2,
    riskFlags: riskFlagsFor(highlight.reliability),
    detectedAt: highlight.observedAt,
    drillDownRef: highlight.drillDownRef,
  }));
}

function moduleSummaryFor(
  result: CoreModuleResult,
  reliability: CommandCenterReliabilityState,
  highlights: readonly CommandCenterKpiHighlight[],
  options: CommandCenterViewModelOptions,
): CommandCenterModuleSummary {
  const display = observationForDisplay(result);
  const openAlerts = (display?.observation.alerts ?? []).filter((alert) => alert.status === "open");
  const routeCandidate = options.moduleDetailRoutes?.[result.moduleId];
  const allowed = options.allowedDrillDownRefs ?? new Set<string>();
  return {
    moduleId: result.moduleId,
    displayName: result.displayName,
    status: result.status,
    health: result.sourceHealth,
    freshness: result.freshness,
    reliability,
    reliabilityLabel: commandCenterReliabilityLabel(reliability),
    summaryText: summaryFor(result, reliability),
    observedAt: display?.observation.generatedAt,
    lastSuccessfulAt: result.lastSuccessfulSyncAt,
    hasLastKnownGood: Boolean(result.lastKnownGood),
    alertCounts: {
      critical: openAlerts.filter((alert) => alert.severity === "critical").length,
      warning: openAlerts.filter((alert) => alert.severity === "warning").length,
      info: openAlerts.filter((alert) => alert.severity === "info").length,
    },
    highlightedKpiCount: highlights.length,
    detailRouteRef: safeDrillDown(routeCandidate, allowed),
  };
}

export function buildCommandCenterViewModel(
  aggregation: ModuleAggregationResult,
  options: CommandCenterViewModelOptions = {},
): CommandCenterViewModel {
  const allowed = options.allowedDrillDownRefs ?? new Set<string>();
  const moduleModels = aggregation.modules.map((result) => {
    const reliability = reliabilityFor(result);
    const highlights = result.status === "disabled" ? [] : kpiHighlightsFor(result, reliability, allowed);
    const moduleAttention = result.status === "disabled" ? undefined : moduleStateAttention(result, reliability);
    const alertAttention = result.status === "disabled" ? [] : alertAttentionFor(result, reliability, allowed);
    const kpiAttention = result.status === "disabled" ? [] : kpiAttentionFor(highlights);
    return {
      result,
      reliability,
      highlights,
      summary: moduleSummaryFor(result, reliability, highlights, options),
      attention: [...(moduleAttention ? [moduleAttention] : []), ...alertAttention, ...kpiAttention],
    };
  });

  const allAttention = moduleModels.flatMap((item) => item.attention);
  const enabled = moduleModels.filter((item) => item.result.status !== "disabled");
  const attentionModuleIds = new Set(allAttention.map((item) => item.moduleId));
  const topAttention = rankCommandCenterAttention(
    allAttention,
    options.maxAttentionItems ?? 8,
    options.nonCriticalPerModuleLimit ?? 3,
  );
  const kpiHighlights = moduleModels
    .flatMap((item) => item.highlights)
    .sort((left, right) => {
      const statusDifference = severityRank[left.status] - severityRank[right.status];
      if (statusDifference) return statusDifference;
      const reliabilityDifference = reliabilityRank[left.reliability] - reliabilityRank[right.reliability];
      if (reliabilityDifference) return reliabilityDifference;
      return compareText(left.highlightId, right.highlightId);
    });
  const criticalAttentionCount = allAttention.filter((item) => item.severity === "critical").length;
  const warningAttentionCount = allAttention.filter((item) => item.severity === "warning").length;
  const partialModuleCount = enabled.filter((item) =>
    item.result.observation?.partial?.isPartial || item.result.status === "valid_with_warnings").length;
  const failedModuleCount = enabled.filter((item) =>
    ["unavailable", "invalid_payload", "unsupported_version", "registry_error"].includes(item.result.status)).length;

  let overallState: CommandCenterOverallState = "unknown";
  if (criticalAttentionCount > 0) overallState = "critical";
  else if (warningAttentionCount > 0 || allAttention.length > 0) overallState = "attention";
  else if (enabled.length > 0 && enabled.every((item) => item.reliability === "fresh")) overallState = "healthy";

  return {
    generatedAt: aggregation.generatedAt,
    sourceSchemaVersion: "integration-contract-v1",
    dataLabel: "DEMO/MOCK",
    overallState,
    managementSummary: {
      enabledModuleCount: enabled.length,
      healthyModuleCount: enabled.filter((item) => item.reliability === "fresh").length,
      attentionModuleCount: attentionModuleIds.size,
      unavailableModuleCount: enabled.filter((item) => item.reliability === "unavailable").length,
      staleModuleCount: enabled.filter((item) => item.reliability === "stale_last_known_good").length,
      criticalAttentionCount,
      warningAttentionCount,
    },
    reliability: {
      completeModuleCount: enabled.filter((item) => item.result.status === "valid" && item.reliability === "fresh").length,
      partialModuleCount,
      failedModuleCount,
      unknownFreshnessCount: enabled.filter((item) => item.result.freshness === "unknown").length,
      hasPartialData: partialModuleCount > 0 || failedModuleCount > 0,
    },
    modules: moduleModels.map((item) => item.summary).sort((left, right) => compareText(left.moduleId, right.moduleId)),
    topAttention,
    kpiHighlights,
  };
}
