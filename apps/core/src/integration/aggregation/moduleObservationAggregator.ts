import type {
  CoreModuleResult,
  FreshnessState,
  ModuleAggregationResult,
  ModuleDiagnostic,
  ModuleObservationV1,
  ModuleRegistryEntry,
  ModuleResultStatus,
} from "@master-gem/module-contracts";
import type { ModuleReadAdapter } from "../adapters/moduleAdapter";
import { validateModuleRegistry } from "../registry/moduleRegistry";
import { evaluateFreshness, validateAndNormalizeObservation } from "../validation/moduleObservationValidator";

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

function baseResult(
  entry: ModuleRegistryEntry,
  now: string,
  status: ModuleResultStatus,
  diagnostics: ModuleDiagnostic[],
): CoreModuleResult {
  return {
    moduleId: entry.moduleId,
    displayName: entry.displayName,
    status,
    validation: "invalid",
    sourceHealth: status === "unavailable" ? "unavailable" : "unknown",
    freshness: "unknown",
    effectiveState: status === "unavailable" ? "unavailable" : "unknown",
    receivedAt: now,
    diagnostics,
  };
}

function summaryFor(modules: readonly CoreModuleResult[]): ModuleAggregationResult["summary"] {
  return {
    total: modules.length,
    healthy: modules.filter((item) => item.effectiveState === "healthy").length,
    degraded: modules.filter((item) => item.effectiveState === "degraded").length,
    unavailable: modules.filter((item) => item.effectiveState === "unavailable").length,
    stale: modules.filter((item) => item.effectiveState === "stale").length,
    unknown: modules.filter((item) => item.effectiveState === "unknown").length,
    invalid: modules.filter((item) =>
      ["invalid_payload", "unsupported_version", "registry_error"].includes(item.status)).length,
    disabled: modules.filter((item) => item.status === "disabled").length,
  };
}

export class ModuleObservationAggregator {
  private readonly lastKnownGood = new Map<string, ModuleObservationV1>();
  private readonly lastSuccessfulSync = new Map<string, string>();

  private attachLastKnownGood(
    result: CoreModuleResult,
    entry: ModuleRegistryEntry,
    now: string,
  ): CoreModuleResult {
    const previous = this.lastKnownGood.get(entry.moduleId);
    if (!previous) return result;
    const freshness: FreshnessState = evaluateFreshness(previous.generatedAt, now, entry);
    return {
      ...result,
      freshness,
      effectiveState: result.status === "unavailable"
        ? "unavailable"
        : freshness === "stale" ? "stale" : "unknown",
      lastKnownGood: clone(previous),
      lastSuccessfulSyncAt: this.lastSuccessfulSync.get(entry.moduleId),
    };
  }

  async collect(
    entries: readonly ModuleRegistryEntry[],
    adapters: Readonly<Record<string, ModuleReadAdapter>>,
    now: string,
  ): Promise<ModuleAggregationResult> {
    const registryValidation = validateModuleRegistry(entries);
    const modules: CoreModuleResult[] = [];

    for (const entry of entries) {
      if (registryValidation.duplicateModuleIds.has(entry.moduleId)) {
        modules.push(baseResult(entry, now, "registry_error", [{
          code: "DUPLICATE_MODULE_ID",
          severity: "error",
          message: "Duplicate enabled moduleId is not allowed.",
          path: "moduleId",
        }]));
        continue;
      }
      const invalidEntryDiagnostics = registryValidation.invalidEntries.get(entry.moduleId);
      if (invalidEntryDiagnostics) {
        modules.push(baseResult(entry, now, "registry_error", invalidEntryDiagnostics));
        continue;
      }
      if (!entry.enabled) {
        modules.push(baseResult(entry, now, "disabled", [{
          code: "REGISTRY_DISABLED",
          severity: "info",
          message: "Registry entry is disabled.",
        }]));
        continue;
      }

      const adapter = adapters[entry.adapterKey];
      if (!adapter) {
        modules.push(this.attachLastKnownGood(baseResult(entry, now, "unavailable", [{
          code: "ADAPTER_NOT_FOUND",
          severity: "error",
          message: "No adapter is registered for adapterKey.",
          path: "adapterKey",
        }]), entry, now));
        continue;
      }
      if (adapter.moduleId !== entry.moduleId) {
        modules.push(baseResult(entry, now, "registry_error", [{
          code: "INVALID_REGISTRY_ENTRY",
          severity: "error",
          message: "Adapter moduleId does not match registry moduleId.",
          path: "adapterKey",
        }]));
        continue;
      }

      try {
        const readResult = await adapter.read();
        if (readResult.kind === "unavailable") {
          modules.push(this.attachLastKnownGood(baseResult(entry, now, "unavailable", [{
            code: "UNAVAILABLE_MODULE",
            severity: "error",
            message: readResult.error.message,
          }]), entry, now));
          continue;
        }
        if (readResult.kind === "no_data") {
          modules.push(this.attachLastKnownGood(baseResult(entry, now, "no_data", [{
            code: "NO_DATA",
            severity: "info",
            message: "Adapter has no observation.",
          }]), entry, now));
          continue;
        }

        const validated = validateAndNormalizeObservation(readResult.raw, entry, now);
        const result: CoreModuleResult = {
          moduleId: entry.moduleId,
          displayName: entry.displayName,
          status: validated.status,
          validation: validated.validation,
          sourceHealth: validated.sourceHealth,
          freshness: validated.freshness,
          effectiveState: validated.effectiveState,
          receivedAt: now,
          observation: validated.observation,
          diagnostics: validated.diagnostics,
        };
        if (validated.observation && (validated.status === "valid" || validated.status === "valid_with_warnings")) {
          this.lastKnownGood.set(entry.moduleId, clone(validated.observation));
          this.lastSuccessfulSync.set(entry.moduleId, now);
          result.lastSuccessfulSyncAt = now;
          modules.push(result);
        } else {
          modules.push(this.attachLastKnownGood(result, entry, now));
        }
      } catch (error) {
        modules.push(this.attachLastKnownGood(baseResult(entry, now, "unavailable", [{
          code: "ADAPTER_FAILURE",
          severity: "error",
          message: error instanceof Error ? error.message : "Adapter failed.",
        }]), entry, now));
      }
    }

    return {
      generatedAt: now,
      modules,
      summary: summaryFor(modules),
    };
  }
}
