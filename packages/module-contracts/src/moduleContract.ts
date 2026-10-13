export const supportedIntegrationContractMajor = 1;

export type ModuleType =
  | "workforce"
  | "product"
  | "finance"
  | "production"
  | "inventory"
  | "mobile"
  | "core"
  | "other";

export type SourceHealthState = "healthy" | "degraded" | "unavailable" | "unknown";
export type FreshnessState = "fresh" | "stale" | "unknown";
export type ModuleEffectiveState = SourceHealthState | "stale";
export type ContractValidationState = "valid" | "valid_with_warnings" | "invalid";

export interface ModuleIdentity {
  moduleId: string;
  displayName: string;
  moduleType: ModuleType;
  contractVersion: string;
  producerVersion: string;
  sourceSystem: string;
  instanceId?: string;
  environment?: "local" | "test" | "staging" | "production";
}

export interface ModuleSummary {
  status: string;
  text: string;
}

export interface SourceHealth {
  state: SourceHealthState;
  observedAt: string;
  reasonCode?: string;
  summary?: string;
}

export type ModuleKpiValueType =
  | "number"
  | "count"
  | "currency"
  | "percentage"
  | "duration"
  | "text"
  | "boolean";

export interface ModuleKpi {
  key: string;
  label: string;
  value: number | string | boolean | null;
  valueType: ModuleKpiValueType;
  unit?: string;
  status: "normal" | "info" | "warning" | "critical" | "unknown";
  measuredAt: string;
  comparison?: {
    baselineValue?: number | string;
    delta?: number;
    direction?: "up" | "down" | "flat" | "unknown";
    label?: string;
  };
  drillDownRef?: string;
}

export interface ModuleAlert {
  alertId: string;
  fingerprint?: string;
  category: string;
  severity: "info" | "warning" | "critical";
  title: string;
  summary: string;
  detectedAt: string;
  updatedAt?: string;
  status: "open" | "acknowledged" | "resolved";
  sourceReference?: string;
  recommendedNextAction?: string;
  drillDownRef?: string;
}

export interface ModuleCapability {
  key: string;
  version: string;
  mode: "read" | "link" | "command_advertised";
  status: "available" | "degraded" | "unavailable";
  detailRef?: string;
}

export interface SourceOwnership {
  businessTruthOwner: string;
  contactRef?: string;
  isDerived: boolean;
  derivationId?: string;
  derivationVersion?: string;
  sourceReferences?: string[];
}

export interface ModuleObservationV1 {
  contractVersion: string;
  observationId: string;
  module: ModuleIdentity;
  generatedAt: string;
  sourceDataUpdatedAt?: string;
  summary: ModuleSummary;
  health: SourceHealth;
  kpis?: ModuleKpi[];
  alerts?: ModuleAlert[];
  capabilities?: ModuleCapability[];
  ownership: SourceOwnership;
  partial?: {
    isPartial: boolean;
    missingSections?: string[];
    sourceErrors?: Array<{ code: string; message: string }>;
  };
}

export interface ModuleFreshnessPolicy {
  staleAfterSeconds: number;
  criticalAfterSeconds?: number;
  allowedFutureSkewSeconds?: number;
}

export interface ModuleRegistryEntry {
  moduleId: string;
  displayName: string;
  moduleType: ModuleType;
  enabled: boolean;
  expectedContractMajor: number;
  freshnessPolicy: ModuleFreshnessPolicy;
  adapterKey: string;
  detailRouteRef?: string;
}

export type ModuleDiagnosticSeverity = "info" | "warning" | "error";

export type ModuleDiagnosticCode =
  | "NO_DATA"
  | "STALE_DATA"
  | "UNAVAILABLE_MODULE"
  | "INVALID_PAYLOAD"
  | "UNSUPPORTED_CONTRACT_VERSION"
  | "MODULE_ID_MISMATCH"
  | "CONTRACT_VERSION_MISMATCH"
  | "MALFORMED_KPI"
  | "MALFORMED_ALERT"
  | "MALFORMED_CAPABILITY"
  | "EMPTY_KPI_LIST"
  | "PARTIAL_DATA"
  | "DUPLICATE_MODULE_ID"
  | "INVALID_REGISTRY_ENTRY"
  | "REGISTRY_DISABLED"
  | "ADAPTER_NOT_FOUND"
  | "ADAPTER_FAILURE";

export interface ModuleDiagnostic {
  code: ModuleDiagnosticCode;
  severity: ModuleDiagnosticSeverity;
  message: string;
  path?: string;
}

export type ModuleResultStatus =
  | "valid"
  | "valid_with_warnings"
  | "no_data"
  | "unavailable"
  | "invalid_payload"
  | "unsupported_version"
  | "disabled"
  | "registry_error";

export interface ObservationValidationResult {
  status: Extract<
    ModuleResultStatus,
    "valid" | "valid_with_warnings" | "no_data" | "invalid_payload" | "unsupported_version"
  >;
  validation: ContractValidationState;
  sourceHealth: SourceHealthState;
  freshness: FreshnessState;
  effectiveState: ModuleEffectiveState;
  observation?: ModuleObservationV1;
  diagnostics: ModuleDiagnostic[];
}

export interface CoreModuleResult {
  moduleId: string;
  displayName: string;
  status: ModuleResultStatus;
  validation: ContractValidationState;
  sourceHealth: SourceHealthState;
  freshness: FreshnessState;
  effectiveState: ModuleEffectiveState;
  receivedAt: string;
  lastSuccessfulSyncAt?: string;
  observation?: ModuleObservationV1;
  lastKnownGood?: ModuleObservationV1;
  diagnostics: ModuleDiagnostic[];
}

export interface ModuleAggregationResult {
  generatedAt: string;
  modules: CoreModuleResult[];
  summary: {
    total: number;
    healthy: number;
    degraded: number;
    unavailable: number;
    stale: number;
    unknown: number;
    invalid: number;
    disabled: number;
  };
}
