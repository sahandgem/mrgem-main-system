import type { ModuleDiagnostic, ModuleRegistryEntry } from "@master-gem/module-contracts";

export const integrationModuleRegistry: readonly ModuleRegistryEntry[] = [
  {
    moduleId: "workforce.demo",
    displayName: "برنامه هفتگی (نمونه)",
    moduleType: "workforce",
    enabled: true,
    expectedContractMajor: 1,
    freshnessPolicy: {
      staleAfterSeconds: 60 * 60,
      criticalAfterSeconds: 4 * 60 * 60,
      allowedFutureSkewSeconds: 5 * 60,
    },
    adapterKey: "mock.workforce",
    detailRouteRef: "#module-workforce-demo",
  },
  {
    moduleId: "production.demo",
    displayName: "مرکز تولید (آزمایشی)",
    moduleType: "production",
    enabled: true,
    expectedContractMajor: 1,
    freshnessPolicy: {
      staleAfterSeconds: 60 * 60,
      criticalAfterSeconds: 4 * 60 * 60,
      allowedFutureSkewSeconds: 5 * 60,
    },
    adapterKey: "mock.production",
    detailRouteRef: "#module-production-demo",
  },
];

export interface RegistryValidationResult {
  duplicateModuleIds: Set<string>;
  invalidEntries: Map<string, ModuleDiagnostic[]>;
}

export function validateModuleRegistry(entries: readonly ModuleRegistryEntry[]): RegistryValidationResult {
  const counts = new Map<string, number>();
  const invalidEntries = new Map<string, ModuleDiagnostic[]>();

  for (const entry of entries) {
    counts.set(entry.moduleId, (counts.get(entry.moduleId) ?? 0) + 1);
    const diagnostics: ModuleDiagnostic[] = [];
    if (!/^[a-z][a-z0-9.-]{2,63}$/.test(entry.moduleId)) {
      diagnostics.push({
        code: "INVALID_REGISTRY_ENTRY",
        severity: "error",
        message: "moduleId does not follow the approved stable identifier format.",
        path: "moduleId",
      });
    }
    if (!Number.isInteger(entry.expectedContractMajor) || entry.expectedContractMajor < 1) {
      diagnostics.push({
        code: "INVALID_REGISTRY_ENTRY",
        severity: "error",
        message: "expectedContractMajor must be a positive integer.",
        path: "expectedContractMajor",
      });
    }
    if (!Number.isFinite(entry.freshnessPolicy.staleAfterSeconds) || entry.freshnessPolicy.staleAfterSeconds <= 0) {
      diagnostics.push({
        code: "INVALID_REGISTRY_ENTRY",
        severity: "error",
        message: "staleAfterSeconds must be a positive number.",
        path: "freshnessPolicy.staleAfterSeconds",
      });
    }
    if (diagnostics.length > 0) invalidEntries.set(entry.moduleId, diagnostics);
  }

  return {
    duplicateModuleIds: new Set(
      [...counts.entries()].filter(([, count]) => count > 1).map(([moduleId]) => moduleId),
    ),
    invalidEntries,
  };
}

export function findModuleRegistryEntry(entries: readonly ModuleRegistryEntry[], moduleId: string) {
  return entries.find((entry) => entry.moduleId === moduleId);
}
