export type CoreOfflineGate = "C51" | "C52" | "C53" | "C54" | "CORE_TESTS" | "CORE_BUILD";
const gates: readonly CoreOfflineGate[] = ["C51", "C52", "C53", "C54", "CORE_TESTS", "CORE_BUILD"];

export interface CoreOfflineReadiness {
  decision: "NO_GO" | "OFFLINE_REVIEW_READY_ONLY";
  missing: readonly CoreOfflineGate[];
  evidenceIndependentlyVerified: false;
  productionAuthorized: false;
  mergeAuthorized: false;
  pushAuthorized: false;
  deploymentAuthorized: false;
  liveDataReadsAuthorized: false;
  migrationAuthorized: false;
  mayProvisionIdentity: false;
}
export function evaluateCoreOfflineReadiness(
  reported: Readonly<Partial<Record<CoreOfflineGate, boolean>>> | null | undefined,
): CoreOfflineReadiness {
  // Claims of passing local tests are never independent evidence or authority.
  const missing = gates.filter(gate => reported?.[gate] !== true);
  return Object.freeze({
    decision: missing.length ? "NO_GO" : "OFFLINE_REVIEW_READY_ONLY",
    missing,
    evidenceIndependentlyVerified: false,
    productionAuthorized: false,
    mergeAuthorized: false,
    pushAuthorized: false,
    deploymentAuthorized: false,
    liveDataReadsAuthorized: false,
    migrationAuthorized: false,
    mayProvisionIdentity: false,
  });
}
