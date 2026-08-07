import type {
  FreshnessState,
  ModuleAlert,
  ModuleCapability,
  ModuleDiagnostic,
  ModuleEffectiveState,
  ModuleIdentity,
  ModuleKpi,
  ModuleKpiValueType,
  ModuleObservationV1,
  ModuleRegistryEntry,
  ModuleSummary,
  ModuleType,
  ObservationValidationResult,
  SourceHealth,
  SourceHealthState,
  SourceOwnership,
} from "../contracts/moduleContract";

const moduleTypes = new Set<ModuleType>([
  "workforce", "product", "finance", "production", "inventory", "mobile", "core", "other",
]);
const healthStates = new Set<SourceHealthState>(["healthy", "degraded", "unavailable", "unknown"]);
const kpiValueTypes = new Set<ModuleKpiValueType>([
  "number", "count", "currency", "percentage", "duration", "text", "boolean",
]);
const kpiStatuses = new Set(["normal", "info", "warning", "critical", "unknown"]);
const alertSeverities = new Set(["info", "warning", "critical"]);
const alertStatuses = new Set(["open", "acknowledged", "resolved"]);
const capabilityModes = new Set(["read", "link", "command_advertised"]);
const capabilityStatuses = new Set(["available", "degraded", "unavailable"]);
const environments = new Set(["local", "test", "staging", "production"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function optionalString(value: unknown) {
  return nonEmptyString(value) ? value : undefined;
}

function isIsoTimestamp(value: unknown): value is string {
  return nonEmptyString(value) && Number.isFinite(Date.parse(value));
}

function contractMajor(version: string) {
  const match = /^(\d+)\.(\d+)\.(\d+)(?:[-+].*)?$/.exec(version);
  return match ? Number(match[1]) : undefined;
}

function diagnostic(
  code: ModuleDiagnostic["code"],
  severity: ModuleDiagnostic["severity"],
  message: string,
  path?: string,
): ModuleDiagnostic {
  return { code, severity, message, path };
}

export function evaluateFreshness(
  generatedAt: string | undefined,
  now: string,
  entry: ModuleRegistryEntry,
): FreshnessState {
  if (!generatedAt || !isIsoTimestamp(generatedAt) || !isIsoTimestamp(now)) return "unknown";
  const ageSeconds = (Date.parse(now) - Date.parse(generatedAt)) / 1000;
  return ageSeconds > entry.freshnessPolicy.staleAfterSeconds ? "stale" : "fresh";
}

export function deriveEffectiveState(
  sourceHealth: SourceHealthState,
  freshness: FreshnessState,
  hasWarnings = false,
): ModuleEffectiveState {
  if (sourceHealth === "unavailable") return "unavailable";
  if (freshness === "stale") return "stale";
  if (sourceHealth === "degraded" || hasWarnings) return "degraded";
  if (sourceHealth === "unknown" || freshness === "unknown") return "unknown";
  return "healthy";
}

function failure(
  entry: ModuleRegistryEntry,
  status: "no_data" | "invalid_payload" | "unsupported_version",
  code: ModuleDiagnostic["code"],
  message: string,
  path?: string,
): ObservationValidationResult {
  return {
    status,
    validation: "invalid",
    sourceHealth: "unknown",
    freshness: "unknown",
    effectiveState: "unknown",
    diagnostics: [diagnostic(code, status === "no_data" ? "info" : "error", message, path)],
  };
}

function normalizeIdentity(value: unknown): ModuleIdentity | undefined {
  if (!isRecord(value)) return undefined;
  if (
    !nonEmptyString(value.moduleId)
    || !nonEmptyString(value.displayName)
    || !nonEmptyString(value.moduleType)
    || !moduleTypes.has(value.moduleType as ModuleType)
    || !nonEmptyString(value.contractVersion)
    || !nonEmptyString(value.producerVersion)
    || !nonEmptyString(value.sourceSystem)
  ) return undefined;
  if (value.environment !== undefined && (!nonEmptyString(value.environment) || !environments.has(value.environment))) {
    return undefined;
  }
  if (value.instanceId !== undefined && !nonEmptyString(value.instanceId)) return undefined;
  return {
    moduleId: value.moduleId,
    displayName: value.displayName,
    moduleType: value.moduleType as ModuleType,
    contractVersion: value.contractVersion,
    producerVersion: value.producerVersion,
    sourceSystem: value.sourceSystem,
    instanceId: optionalString(value.instanceId),
    environment: value.environment as ModuleIdentity["environment"],
  };
}

function normalizeSummary(value: unknown): ModuleSummary | undefined {
  if (!isRecord(value) || !nonEmptyString(value.status) || !nonEmptyString(value.text)) return undefined;
  return { status: value.status, text: value.text };
}

function normalizeHealth(value: unknown): SourceHealth | undefined {
  if (
    !isRecord(value)
    || !nonEmptyString(value.state)
    || !healthStates.has(value.state as SourceHealthState)
    || !isIsoTimestamp(value.observedAt)
  ) return undefined;
  return {
    state: value.state as SourceHealthState,
    observedAt: value.observedAt,
    reasonCode: optionalString(value.reasonCode),
    summary: optionalString(value.summary),
  };
}

function validKpiValue(value: unknown, valueType: ModuleKpiValueType) {
  if (value === null) return true;
  if (["number", "count", "currency", "percentage", "duration"].includes(valueType)) {
    return typeof value === "number" && Number.isFinite(value);
  }
  if (valueType === "boolean") return typeof value === "boolean";
  return typeof value === "string";
}

function normalizeKpi(value: unknown): ModuleKpi | undefined {
  if (!isRecord(value) || !nonEmptyString(value.key) || !nonEmptyString(value.label)) return undefined;
  if (!nonEmptyString(value.valueType) || !kpiValueTypes.has(value.valueType as ModuleKpiValueType)) return undefined;
  if (!("value" in value) || !validKpiValue(value.value, value.valueType as ModuleKpiValueType)) return undefined;
  if (!nonEmptyString(value.status) || !kpiStatuses.has(value.status) || !isIsoTimestamp(value.measuredAt)) return undefined;

  let comparison: ModuleKpi["comparison"];
  if (value.comparison !== undefined) {
    if (!isRecord(value.comparison)) return undefined;
    const direction = value.comparison.direction;
    if (direction !== undefined && !["up", "down", "flat", "unknown"].includes(String(direction))) return undefined;
    if (value.comparison.delta !== undefined && (typeof value.comparison.delta !== "number" || !Number.isFinite(value.comparison.delta))) {
      return undefined;
    }
    comparison = {
      baselineValue:
        typeof value.comparison.baselineValue === "number" || typeof value.comparison.baselineValue === "string"
          ? value.comparison.baselineValue
          : undefined,
      delta: value.comparison.delta as number | undefined,
      direction: direction as ModuleKpi["comparison"] extends infer T
        ? T extends { direction?: infer D } ? D : never
        : never,
      label: optionalString(value.comparison.label),
    };
  }

  return {
    key: value.key,
    label: value.label,
    value: value.value as ModuleKpi["value"],
    valueType: value.valueType as ModuleKpiValueType,
    unit: optionalString(value.unit),
    status: value.status as ModuleKpi["status"],
    measuredAt: value.measuredAt,
    comparison,
    drillDownRef: optionalString(value.drillDownRef),
  };
}

function normalizeAlert(value: unknown): ModuleAlert | undefined {
  if (!isRecord(value)) return undefined;
  if (
    !nonEmptyString(value.alertId)
    || !nonEmptyString(value.category)
    || !nonEmptyString(value.severity)
    || !alertSeverities.has(value.severity)
    || !nonEmptyString(value.title)
    || !nonEmptyString(value.summary)
    || !isIsoTimestamp(value.detectedAt)
    || !nonEmptyString(value.status)
    || !alertStatuses.has(value.status)
  ) return undefined;
  if (value.updatedAt !== undefined && !isIsoTimestamp(value.updatedAt)) return undefined;
  return {
    alertId: value.alertId,
    fingerprint: optionalString(value.fingerprint),
    category: value.category,
    severity: value.severity as ModuleAlert["severity"],
    title: value.title,
    summary: value.summary,
    detectedAt: value.detectedAt,
    updatedAt: value.updatedAt as string | undefined,
    status: value.status as ModuleAlert["status"],
    sourceReference: optionalString(value.sourceReference),
    recommendedNextAction: optionalString(value.recommendedNextAction),
    drillDownRef: optionalString(value.drillDownRef),
  };
}

function normalizeCapability(value: unknown): ModuleCapability | undefined {
  if (!isRecord(value)) return undefined;
  if (
    !nonEmptyString(value.key)
    || !nonEmptyString(value.version)
    || !nonEmptyString(value.mode)
    || !capabilityModes.has(value.mode)
    || !nonEmptyString(value.status)
    || !capabilityStatuses.has(value.status)
  ) return undefined;
  return {
    key: value.key,
    version: value.version,
    mode: value.mode as ModuleCapability["mode"],
    status: value.status as ModuleCapability["status"],
    detailRef: optionalString(value.detailRef),
  };
}

function normalizeOwnership(value: unknown): SourceOwnership | undefined {
  if (
    !isRecord(value)
    || !nonEmptyString(value.businessTruthOwner)
    || typeof value.isDerived !== "boolean"
  ) return undefined;
  if (value.sourceReferences !== undefined && !Array.isArray(value.sourceReferences)) return undefined;
  const sourceReferences = Array.isArray(value.sourceReferences)
    ? value.sourceReferences.filter(nonEmptyString)
    : undefined;
  return {
    businessTruthOwner: value.businessTruthOwner,
    contactRef: optionalString(value.contactRef),
    isDerived: value.isDerived,
    derivationId: optionalString(value.derivationId),
    derivationVersion: optionalString(value.derivationVersion),
    sourceReferences,
  };
}

export function validateAndNormalizeObservation(
  raw: unknown,
  entry: ModuleRegistryEntry,
  now: string,
): ObservationValidationResult {
  if (raw === null || raw === undefined) {
    return failure(entry, "no_data", "NO_DATA", "No observation has been received.");
  }
  if (!isRecord(raw)) {
    return failure(entry, "invalid_payload", "INVALID_PAYLOAD", "Observation must be an object.");
  }
  if (!nonEmptyString(raw.contractVersion)) {
    return failure(entry, "invalid_payload", "INVALID_PAYLOAD", "contractVersion is required.", "contractVersion");
  }
  const major = contractMajor(raw.contractVersion);
  if (major === undefined) {
    return failure(entry, "invalid_payload", "INVALID_PAYLOAD", "contractVersion must use semantic versioning.", "contractVersion");
  }
  if (major !== entry.expectedContractMajor) {
    return failure(
      entry,
      "unsupported_version",
      "UNSUPPORTED_CONTRACT_VERSION",
      `Expected contract major ${entry.expectedContractMajor} but received ${major}.`,
      "contractVersion",
    );
  }

  const identity = normalizeIdentity(raw.module);
  if (!identity) return failure(entry, "invalid_payload", "INVALID_PAYLOAD", "module identity is invalid.", "module");
  if (identity.moduleId !== entry.moduleId) {
    return failure(entry, "invalid_payload", "MODULE_ID_MISMATCH", "Observation moduleId does not match registry.", "module.moduleId");
  }
  if (identity.contractVersion !== raw.contractVersion) {
    return failure(
      entry,
      "invalid_payload",
      "CONTRACT_VERSION_MISMATCH",
      "Envelope and module contractVersion values must match.",
      "module.contractVersion",
    );
  }
  if (!nonEmptyString(raw.observationId)) {
    return failure(entry, "invalid_payload", "INVALID_PAYLOAD", "observationId is required.", "observationId");
  }
  if (!isIsoTimestamp(raw.generatedAt)) {
    return failure(entry, "invalid_payload", "INVALID_PAYLOAD", "generatedAt must be an ISO timestamp.", "generatedAt");
  }
  const allowedFutureSkewSeconds = entry.freshnessPolicy.allowedFutureSkewSeconds ?? 0;
  if (Date.parse(raw.generatedAt) - Date.parse(now) > allowedFutureSkewSeconds * 1000) {
    return failure(entry, "invalid_payload", "INVALID_PAYLOAD", "generatedAt is beyond allowed clock skew.", "generatedAt");
  }
  if (raw.sourceDataUpdatedAt !== undefined && !isIsoTimestamp(raw.sourceDataUpdatedAt)) {
    return failure(
      entry,
      "invalid_payload",
      "INVALID_PAYLOAD",
      "sourceDataUpdatedAt must be an ISO timestamp.",
      "sourceDataUpdatedAt",
    );
  }
  const summary = normalizeSummary(raw.summary);
  if (!summary) return failure(entry, "invalid_payload", "INVALID_PAYLOAD", "summary is invalid.", "summary");
  const health = normalizeHealth(raw.health);
  if (!health) return failure(entry, "invalid_payload", "INVALID_PAYLOAD", "health is invalid.", "health");
  const ownership = normalizeOwnership(raw.ownership);
  if (!ownership) return failure(entry, "invalid_payload", "INVALID_PAYLOAD", "ownership is invalid.", "ownership");

  const diagnostics: ModuleDiagnostic[] = [];
  if (raw.kpis !== undefined && !Array.isArray(raw.kpis)) {
    return failure(entry, "invalid_payload", "INVALID_PAYLOAD", "kpis must be an array.", "kpis");
  }
  const kpis = (raw.kpis ?? []).flatMap((item, index) => {
    const normalized = normalizeKpi(item);
    if (normalized) return [normalized];
    diagnostics.push(diagnostic("MALFORMED_KPI", "warning", "Malformed KPI was omitted.", `kpis[${index}]`));
    return [];
  });

  if (raw.alerts !== undefined && !Array.isArray(raw.alerts)) {
    return failure(entry, "invalid_payload", "INVALID_PAYLOAD", "alerts must be an array.", "alerts");
  }
  const alerts = (raw.alerts ?? []).flatMap((item, index) => {
    const normalized = normalizeAlert(item);
    if (normalized) return [normalized];
    diagnostics.push(diagnostic("MALFORMED_ALERT", "warning", "Malformed alert was omitted.", `alerts[${index}]`));
    return [];
  });

  if (raw.capabilities !== undefined && !Array.isArray(raw.capabilities)) {
    return failure(entry, "invalid_payload", "INVALID_PAYLOAD", "capabilities must be an array.", "capabilities");
  }
  const capabilities = (raw.capabilities ?? []).flatMap((item, index) => {
    const normalized = normalizeCapability(item);
    if (normalized) return [normalized];
    diagnostics.push(
      diagnostic("MALFORMED_CAPABILITY", "warning", "Malformed capability was omitted.", `capabilities[${index}]`),
    );
    return [];
  });

  let partial: ModuleObservationV1["partial"];
  if (raw.partial !== undefined) {
    if (!isRecord(raw.partial) || typeof raw.partial.isPartial !== "boolean") {
      return failure(entry, "invalid_payload", "INVALID_PAYLOAD", "partial metadata is invalid.", "partial");
    }
    partial = {
      isPartial: raw.partial.isPartial,
      missingSections: Array.isArray(raw.partial.missingSections)
        ? raw.partial.missingSections.filter(nonEmptyString)
        : undefined,
      sourceErrors: Array.isArray(raw.partial.sourceErrors)
        ? raw.partial.sourceErrors.flatMap((item) =>
          isRecord(item) && nonEmptyString(item.code) && nonEmptyString(item.message)
            ? [{ code: item.code, message: item.message }]
            : [])
        : undefined,
    };
    if (partial.isPartial) {
      diagnostics.push(diagnostic("PARTIAL_DATA", "warning", "Source declared a partial observation.", "partial"));
    }
  }

  if (
    kpis.length === 0
    && capabilities.some((capability) => capability.key === "kpi.read" && capability.status === "available")
  ) {
    diagnostics.push(diagnostic("EMPTY_KPI_LIST", "warning", "kpi.read is available but no KPIs were supplied.", "kpis"));
  }

  const observation: ModuleObservationV1 = {
    contractVersion: raw.contractVersion,
    observationId: raw.observationId,
    module: identity,
    generatedAt: raw.generatedAt,
    sourceDataUpdatedAt: raw.sourceDataUpdatedAt as string | undefined,
    summary,
    health,
    kpis,
    alerts,
    capabilities,
    ownership,
    partial,
  };
  const freshness = evaluateFreshness(observation.generatedAt, now, entry);
  if (freshness === "stale") {
    diagnostics.push(diagnostic("STALE_DATA", "warning", "Observation exceeds the registry freshness policy.", "generatedAt"));
  }
  const hasWarnings = diagnostics.some((item) => item.severity === "warning");
  return {
    status: hasWarnings ? "valid_with_warnings" : "valid",
    validation: hasWarnings ? "valid_with_warnings" : "valid",
    sourceHealth: health.state,
    freshness,
    effectiveState: deriveEffectiveState(health.state, freshness, hasWarnings),
    observation,
    diagnostics,
  };
}
