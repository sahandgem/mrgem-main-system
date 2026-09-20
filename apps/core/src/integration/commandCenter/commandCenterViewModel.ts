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
  dataStateLabel: string;
  summaryText: string;
  receivedAt: string;
  observedAt?: string;
  lastSuccessfulAt?: string;
  hasLastKnownGood: boolean;
  isPartialData: boolean;
  isExperimental: boolean;
  moduleDescription: string;
  destinationLabel: string;
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
  businessImpact: string;
  timeContext: string;
  destinationLabel: string;
  isExperimental: boolean;
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
  status: ModuleKpi["status"];
  reliability: CommandCenterReliabilityState;
  reliabilityLabel: string;
  observedAt?: string;
  trendDirection?: NonNullable<ModuleKpi["comparison"]>["direction"];
  trendText?: string;
  contextLabel: string;
  isExperimental: boolean;
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

const kpiStatusRank: Record<ModuleKpi["status"], number> = {
  critical: 0,
  warning: 1,
  info: 2,
  normal: 3,
  unknown: 4,
};

const modulePresentation: Readonly<Record<string, {
  description: string;
  destinationLabel: string;
  isExperimental: boolean;
}>> = {
  "workforce.demo": {
    description: "برنامه، ظرفیت، فشار کاری و تعارض‌های عملیاتی نیروی انسانی",
    destinationLabel: "خلاصه برنامه هفتگی",
    isExperimental: false,
  },
  "production.demo": {
    description: "نمونه معماری سفارش کاری و عملکرد تولید؛ منطق نهایی هنوز تعریف نشده است",
    destinationLabel: "جزئیات نمونه تولید",
    isExperimental: true,
  },
};

const attentionPresentation: Readonly<Record<string, {
  businessImpact: string;
  timeContext: string;
  destinationLabel: string;
  priorityTier: 1 | 2 | 3;
}>> = {
  workforce_operational_conflict: {
    businessImpact: "برنامه ممکن است قابل اجرا یا از نظر ایمنی قابل اتکا نباشد.",
    timeContext: "برنامه جاری نمونه",
    destinationLabel: "برنامه هفتگی و آیتم‌های متعارض",
    priorityTier: 1,
  },
  workforce_schedule_coverage: {
    businessImpact: "بخشی از کار برنامه‌ریزی‌شده ممکن است بدون پوشش کافی بماند.",
    timeContext: "برنامه جاری نمونه",
    destinationLabel: "تحلیل پوشش برنامه",
    priorityTier: 2,
  },
  workforce_capacity_concentration: {
    businessImpact: "وابستگی زیاد به یک نقش می‌تواند ظرفیت تیم را آسیب‌پذیر کند.",
    timeContext: "نمای هفتگی نمونه",
    destinationLabel: "تحلیل فشار کاری",
    priorityTier: 2,
  },
  production_work_order_risk: {
    businessImpact: "در معماری آینده می‌تواند بر موعد تولید و تعهد تحویل اثر بگذارد.",
    timeContext: "سناریوی آزمایشی؛ بازه نهایی نیازمند تعریف",
    destinationLabel: "نمونه جزئیات سفارش کاری",
    priorityTier: 2,
  },
  production_plan_attainment: {
    businessImpact: "در معماری آینده کاهش تحقق برنامه می‌تواند نشانه عقب‌ماندگی تولید باشد.",
    timeContext: "سناریوی آزمایشی؛ دوره اندازه‌گیری نیازمند تعریف",
    destinationLabel: "نمونه برنامه در برابر عملکرد",
    priorityTier: 3,
  },
};

function modulePresentationFor(moduleId: string) {
  return modulePresentation[moduleId] ?? {
    description: "خلاصه مدیریتی ماژول متصل‌شده",
    destinationLabel: "جزئیات ماژول",
    isExperimental: false,
  };
}

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
  if (left.isExperimental !== right.isExperimental) return left.isExperimental ? 1 : -1;
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
    unavailable: "خطای داده",
    invalid: "خطای داده؛ داده نامعتبر",
    unsupported_version: "خطای داده؛ نسخه ناسازگار",
    no_data: "بدون داده",
    disabled: "غیرفعال",
    unknown: "نامشخص",
  };
  return labels[state];
}

function summaryFor(result: CoreModuleResult, reliability: CommandCenterReliabilityState) {
  if (reliability === "fresh") return result.observation?.summary.text ?? "داده تازه و معتبر دریافت شد.";
  if (reliability === "degraded" && result.observation?.partial?.isPartial) {
    return "بخشی از داده دریافت نشده است؛ نمای موجود برای تصمیم‌گیری کامل نیست.";
  }
  if (reliability === "degraded") return "داده معتبر است، اما همراه با هشدار دریافت شده است.";
  if (reliability === "stale_last_known_good") return "آخرین داده معتبر نگه داشته شده، اما تازه نیست.";
  if (reliability === "unavailable" && result.lastKnownGood) {
    return "ماژول در دسترس نیست؛ آخرین داده معتبر فقط برای زمینه حفظ شده است.";
  }
  if (reliability === "unavailable") return "ماژول در دسترس نیست و داده معتبر قبلی وجود ندارد.";
  if (reliability === "invalid") return "داده فعلی قابل اعتماد نیست و در نمای مدیریتی استفاده نشده است.";
  if (reliability === "unsupported_version") return "نسخه قرارداد فعلی پشتیبانی نمی‌شود.";
  if (reliability === "no_data") return "ماژول فعال است، اما هنوز داده‌ای ثبت نشده است.";
  if (reliability === "disabled") return "ماژول در فهرست ماژول‌ها غیرفعال است.";
  return "قابلیت اطمینان داده مشخص نیست.";
}

function observationForDisplay(result: CoreModuleResult) {
  if ((result.status === "valid" || result.status === "valid_with_warnings") && result.observation) {
    return { observation: result.observation, isLastKnownGood: result.freshness === "stale" };
  }
  if (result.lastKnownGood) return { observation: result.lastKnownGood, isLastKnownGood: true };
  return undefined;
}

function dataStateLabelFor(result: CoreModuleResult, reliability: CommandCenterReliabilityState) {
  if (reliability === "fresh") return "داده فعلی سالم و تازه است";
  if (reliability === "stale_last_known_good") return "داده فعلی قدیمی است";
  if (result.observation?.partial?.isPartial) return "داده فعلی ناقص است";
  if (reliability === "degraded") return "داده فعلی با هشدار دریافت شده است";
  if (reliability === "unavailable") return "خطای داده؛ دریافت فعلی ناموفق است";
  if (reliability === "invalid" || reliability === "unsupported_version") return "خطای داده؛ داده فعلی قابل استفاده نیست";
  if (reliability === "no_data") return "داده فعلی وجود ندارد";
  if (reliability === "disabled") return "ماژول غیرفعال است";
  return "وضعیت داده فعلی نامشخص است";
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

function kpiTrendText(kpi: ModuleKpi) {
  if (!kpi.comparison) return undefined;
  const parts = [kpi.comparison.label];
  if (typeof kpi.comparison.delta === "number") {
    const sign = kpi.comparison.delta > 0 ? "+" : "";
    parts.push(`تغییر ${sign}${kpi.comparison.delta}${kpi.unit ? ` ${kpi.unit}` : ""}`);
  }
  return parts.filter(Boolean).join(" · ") || undefined;
}

function kpiHighlightsFor(
  result: CoreModuleResult,
  reliability: CommandCenterReliabilityState,
  allowed: ReadonlySet<string>,
) {
  const display = observationForDisplay(result);
  if (!display) return [];
  const presentation = modulePresentationFor(result.moduleId);
  return (display.observation.kpis ?? []).map<CommandCenterKpiHighlight>((kpi) => {
    const displayReliability = display.isLastKnownGood ? "stale_last_known_good" : reliability;
    return {
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
      trendDirection: kpi.comparison?.direction,
      trendText: kpiTrendText(kpi),
      contextLabel: attentionPresentation[kpi.key]?.timeContext ?? "آخرین بازه گزارش‌شده",
      isExperimental: presentation.isExperimental,
      explanation: display.isLastKnownGood
        ? "این KPI از آخرین داده معتبر است و نباید داده جاری تلقی شود."
        : kpi.status === "critical" || kpi.status === "warning"
          ? "این شاخص از محدوده نمونه مدیریتی خارج شده است."
          : "این شاخص در محدوده نمونه قرار دارد.",
      drillDownRef: safeDrillDown(kpi.drillDownRef, allowed),
    };
  });
}

function alertAttentionFor(
  result: CoreModuleResult,
  reliability: CommandCenterReliabilityState,
  allowed: ReadonlySet<string>,
) {
  const display = observationForDisplay(result);
  if (!display) return [];
  const moduleDisplay = modulePresentationFor(result.moduleId);
  return (display.observation.alerts ?? []).flatMap<CommandCenterAttentionItem>((alert) => {
    if (alert.status !== "open" || alert.severity === "info") return [];
    const displayReliability = display.isLastKnownGood ? "stale_last_known_good" : reliability;
    const presentation = attentionPresentation[alert.category];
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
      priorityTier: presentation?.priorityTier ?? 3,
      riskFlags: riskFlagsFor(displayReliability),
      detectedAt: alert.detectedAt,
      businessImpact: presentation?.businessImpact ?? "اثر کسب‌وکاری این هشدار نیازمند تعریف است.",
      timeContext: presentation?.timeContext ?? "بازه زمانی نیازمند تعریف",
      destinationLabel: presentation?.destinationLabel ?? moduleDisplay.destinationLabel,
      isExperimental: moduleDisplay.isExperimental,
      suggestedNextStep: alert.recommendedNextAction,
      drillDownRef: safeDrillDown(alert.drillDownRef, allowed),
    }];
  });
}

function kpiAttentionFor(highlights: readonly CommandCenterKpiHighlight[]): CommandCenterAttentionItem[] {
  return highlights.flatMap((highlight) => {
    if (highlight.status !== "critical" && highlight.status !== "warning") return [];
    const presentation = attentionPresentation[highlight.kpiKey];
    return [{
      attentionId: `${highlight.moduleId}:kpi-attention:${highlight.kpiKey}`,
      moduleId: highlight.moduleId,
      moduleName: highlight.moduleName,
      sourceType: "kpi" as const,
      sourceRef: highlight.kpiKey,
      title: highlight.label,
      summary: `${highlight.displayValue} — ${highlight.explanation}`,
      severity: highlight.status,
      confidence: confidenceFor(highlight.reliability),
      reliability: highlight.reliability,
      priorityTier: presentation?.priorityTier ?? 3,
      riskFlags: riskFlagsFor(highlight.reliability),
      detectedAt: highlight.observedAt,
      businessImpact: presentation?.businessImpact ?? "اثر کسب‌وکاری این شاخص نیازمند تعریف است.",
      timeContext: presentation?.timeContext ?? highlight.contextLabel,
      destinationLabel: presentation?.destinationLabel ?? "جزئیات شاخص",
      isExperimental: highlight.isExperimental,
      drillDownRef: highlight.drillDownRef,
    }];
  });
}

function moduleSummaryFor(
  result: CoreModuleResult,
  reliability: CommandCenterReliabilityState,
  highlights: readonly CommandCenterKpiHighlight[],
  options: CommandCenterViewModelOptions,
): CommandCenterModuleSummary {
  const display = observationForDisplay(result);
  const openAlerts = (display?.observation.alerts ?? []).filter((alert) => alert.status === "open");
  const presentation = modulePresentationFor(result.moduleId);
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
    dataStateLabel: dataStateLabelFor(result, reliability),
    summaryText: summaryFor(result, reliability),
    receivedAt: result.receivedAt,
    observedAt: display?.observation.generatedAt,
    lastSuccessfulAt: result.lastSuccessfulSyncAt,
    hasLastKnownGood: Boolean(result.lastKnownGood || (result.observation && result.freshness === "stale")),
    isPartialData: Boolean(result.observation?.partial?.isPartial),
    isExperimental: presentation.isExperimental,
    moduleDescription: presentation.description,
    destinationLabel: presentation.destinationLabel,
    alertCounts: {
      critical: openAlerts.filter((alert) => alert.severity === "critical").length,
      warning: openAlerts.filter((alert) => alert.severity === "warning").length,
      info: openAlerts.filter((alert) => alert.severity === "info").length,
    },
    highlightedKpiCount: highlights.filter((item) => item.status === "critical" || item.status === "warning").length,
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
    const alertAttention = result.status === "disabled" ? [] : alertAttentionFor(result, reliability, allowed);
    const kpiAttention = result.status === "disabled" ? [] : kpiAttentionFor(highlights);
    return {
      result,
      reliability,
      highlights,
      summary: moduleSummaryFor(result, reliability, highlights, options),
      attention: [...alertAttention, ...kpiAttention],
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
      const statusDifference = kpiStatusRank[left.status] - kpiStatusRank[right.status];
      if (statusDifference) return statusDifference;
      if (left.isExperimental !== right.isExperimental) return left.isExperimental ? 1 : -1;
      const reliabilityDifference = reliabilityRank[left.reliability] - reliabilityRank[right.reliability];
      if (reliabilityDifference) return reliabilityDifference;
      return compareText(left.highlightId, right.highlightId);
    });
  const criticalAttentionCount = allAttention.filter((item) => item.severity === "critical").length;
  const warningAttentionCount = allAttention.filter((item) => item.severity === "warning").length;
  const partialModuleCount = enabled.filter((item) => item.result.observation?.partial?.isPartial).length;
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
    modules: moduleModels.map((item) => item.summary).sort((left, right) => {
      if (left.isExperimental !== right.isExperimental) return left.isExperimental ? 1 : -1;
      return compareText(left.moduleId, right.moduleId);
    }),
    topAttention,
    kpiHighlights,
  };
}
