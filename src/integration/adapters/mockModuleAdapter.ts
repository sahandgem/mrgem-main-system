import type { ModuleObservationV1 } from "../contracts/moduleContract";
import type { AdapterReadResult, ModuleReadAdapter } from "./moduleAdapter";

export type MockModuleScenario =
  | "healthy"
  | "degraded"
  | "stale"
  | "unavailable"
  | "malformed"
  | "unsupported"
  | "partial_kpi"
  | "malformed_alert"
  | "empty_kpis"
  | "no_data";

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

export function buildMockObservation(
  moduleId = "workforce.demo",
  generatedAt = "2026-08-07T09:00:00.000Z",
): ModuleObservationV1 {
  return {
    contractVersion: "1.0.0",
    observationId: `observation-${moduleId}`,
    module: {
      moduleId,
      displayName: moduleId === "workforce.demo" ? "Workforce Demo" : moduleId,
      moduleType: "workforce",
      contractVersion: "1.0.0",
      producerVersion: "v1-synthetic",
      sourceSystem: "master-gem-workforce",
      instanceId: `${moduleId}-instance`,
      environment: "test",
    },
    generatedAt,
    sourceDataUpdatedAt: generatedAt,
    summary: {
      status: "operational",
      text: "Synthetic Integration Backbone observation.",
    },
    health: {
      state: "healthy",
      observedAt: generatedAt,
      reasonCode: "synthetic_checks_passed",
    },
    kpis: [
      {
        key: "active_alert_count",
        label: "Active alerts",
        value: 2,
        valueType: "count",
        status: "warning",
        measuredAt: generatedAt,
        drillDownRef: "workforce.alerts",
      },
    ],
    alerts: [
      {
        alertId: `alert-${moduleId}`,
        fingerprint: `synthetic-alert-${moduleId}`,
        category: "operations",
        severity: "warning",
        title: "Synthetic warning",
        summary: "Mock-only warning for contract verification.",
        detectedAt: generatedAt,
        status: "open",
        sourceReference: `synthetic:${moduleId}`,
      },
    ],
    capabilities: [
      { key: "health.read", version: "1.0", mode: "read", status: "available" },
      { key: "kpi.read", version: "1.0", mode: "read", status: "available" },
      { key: "alert.read", version: "1.0", mode: "read", status: "available" },
      { key: "detail.link", version: "1.0", mode: "link", status: "available" },
    ],
    ownership: {
      businessTruthOwner: moduleId,
      contactRef: "project-core",
      isDerived: false,
    },
  };
}

export class MockModuleAdapter implements ModuleReadAdapter {
  readonly adapterKey: string;
  readonly moduleId: string;
  private scenario: MockModuleScenario;
  private reads = 0;

  constructor(
    moduleId: string,
    adapterKey: string,
    scenario: MockModuleScenario = "healthy",
  ) {
    this.moduleId = moduleId;
    this.adapterKey = adapterKey;
    this.scenario = scenario;
  }

  setScenario(scenario: MockModuleScenario) {
    this.scenario = scenario;
  }

  getReadCount() {
    return this.reads;
  }

  async read(): Promise<AdapterReadResult> {
    this.reads += 1;
    if (this.scenario === "unavailable") {
      return {
        kind: "unavailable",
        error: { code: "SYNTHETIC_UNAVAILABLE", message: "Synthetic module is unavailable." },
      };
    }
    if (this.scenario === "no_data") return { kind: "no_data" };
    if (this.scenario === "malformed") {
      return {
        kind: "data",
        raw: {
          contractVersion: "1.0.0",
          observationId: "malformed-observation",
          module: { moduleId: this.moduleId },
        },
      };
    }

    const observation = buildMockObservation(
      this.moduleId,
      this.scenario === "stale" ? "2026-08-06T00:00:00.000Z" : "2026-08-07T09:00:00.000Z",
    );
    if (this.scenario === "degraded") {
      observation.health = {
        ...observation.health,
        state: "degraded",
        reasonCode: "synthetic_degraded",
        summary: "Synthetic degraded state.",
      };
    }
    if (this.scenario === "unsupported") {
      observation.contractVersion = "2.0.0";
      observation.module.contractVersion = "2.0.0";
    }
    if (this.scenario === "partial_kpi") {
      const validKpi = observation.kpis?.[0];
      observation.kpis = [validKpi, { key: "malformed-kpi" }] as unknown as ModuleObservationV1["kpis"];
      observation.partial = { isPartial: true, missingSections: ["secondary_kpis"] };
    }
    if (this.scenario === "malformed_alert") {
      observation.alerts = [{ alertId: "missing-required-fields" }] as unknown as ModuleObservationV1["alerts"];
    }
    if (this.scenario === "empty_kpis") observation.kpis = [];

    return { kind: "data", raw: clone(observation) };
  }
}
