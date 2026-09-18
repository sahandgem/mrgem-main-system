import type { ModuleObservationV1 } from "@master-gem/module-contracts";
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
  const isProduction = moduleId === "production.demo";
  return {
    contractVersion: "1.0.0",
    observationId: `observation-${moduleId}`,
    module: {
      moduleId,
      displayName: isProduction ? "مرکز تولید (آزمایشی)" : moduleId === "workforce.demo" ? "برنامه هفتگی (نمونه)" : moduleId,
      moduleType: isProduction ? "production" : "workforce",
      contractVersion: "1.0.0",
      producerVersion: "v1-synthetic",
      sourceSystem: isProduction ? "master-gem-production-mock" : "master-gem-workforce",
      instanceId: `${moduleId}-instance`,
      environment: "test",
    },
    generatedAt,
    sourceDataUpdatedAt: generatedAt,
    summary: {
      status: isProduction ? "experimental" : "attention",
      text: isProduction
        ? "نمای آزمایشی تولید برای ارزیابی معماری UI؛ اتصال واقعی فعال نیست."
        : "داده برنامه معتبر است؛ چند موضوع مدیریتی در نمونه نیازمند توجه است.",
    },
    health: {
      state: "healthy",
      observedAt: generatedAt,
      reasonCode: "synthetic_checks_passed",
    },
    kpis: isProduction
      ? [{
          key: "production_plan_attainment",
          label: "تحقق برنامه تولید",
          value: 78,
          valueType: "percentage",
          unit: "٪",
          status: "warning",
          measuredAt: generatedAt,
          comparison: { baselineValue: 90, delta: -12, direction: "down", label: "نمونه مقایسه با برنامه" },
          drillDownRef: "#module-production-demo",
        }]
      : [
          {
            key: "workforce_schedule_coverage",
            label: "پوشش برنامه",
            value: 86,
            valueType: "percentage",
            unit: "٪",
            status: "warning",
            measuredAt: generatedAt,
            comparison: { baselineValue: 92, delta: -6, direction: "down", label: "نسبت به نمونه مرجع" },
            drillDownRef: "#module-workforce-demo",
          },
          {
            key: "workforce_capacity_concentration",
            label: "تمرکز فشار کاری",
            value: 42,
            valueType: "percentage",
            unit: "٪",
            status: "warning",
            measuredAt: generatedAt,
            comparison: { baselineValue: 34, delta: 8, direction: "up", label: "سهم پرتراکم‌ترین نقش" },
            drillDownRef: "#module-workforce-demo",
          },
        ],
    alerts: isProduction
      ? [{
          alertId: "production-demo-work-order-risk",
          fingerprint: "production-demo-work-order-risk",
          category: "production_work_order_risk",
          severity: "warning",
          title: "یک WorkOrder آزمایشی در معرض تأخیر است",
          summary: "این سیگنال فقط معماری نمایش ریسک تولید را نشان می‌دهد و منطق نهایی محصول نیست.",
          detectedAt: generatedAt,
          status: "open",
          sourceReference: "mock:production:work-order",
          recommendedNextAction: "تعریف منطق نهایی Production پیش از هر تصمیم عملیاتی تکمیل شود.",
          drillDownRef: "#module-production-demo",
        }]
      : [{
          alertId: "workforce-demo-operational-conflict",
          fingerprint: "workforce-demo-operational-conflict",
          category: "workforce_operational_conflict",
          severity: "critical",
          title: "تعارض عملیاتی در برنامه نمونه دیده شده است",
          summary: "یک تخصیص نمونه با محدودیت زمانی یا ایمنی برنامه سازگار نیست.",
          detectedAt: generatedAt,
          status: "open",
          sourceReference: "mock:workforce:schedule-conflict",
          recommendedNextAction: "آیتم‌های متعارض در برنامه هفتگی بررسی شوند.",
          drillDownRef: "#module-workforce-demo",
        }],
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
  private generatedAt?: string;
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

  setGeneratedAt(generatedAt?: string) {
    this.generatedAt = generatedAt;
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
      this.generatedAt
        ?? (this.scenario === "stale" ? "2026-08-06T00:00:00.000Z" : "2026-08-07T09:00:00.000Z"),
    );
    if (this.scenario === "stale") {
      observation.summary.text = "آخرین داده معتبر موجود است، اما از بازه تازگی عبور کرده است.";
    }
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
      observation.summary.text = "بخشی از داده دریافت شده و برای تصمیم کامل کافی نیست.";
      observation.kpis = [
        validKpi,
        { key: "malformed-kpi" },
      ] as unknown as ModuleObservationV1["kpis"];
      observation.alerts = (observation.alerts ?? []).map((alert) => ({
        ...alert,
        summary: `${alert.summary} بخشی از اطلاعات این سناریو در دسترس نیست.`,
        recommendedNextAction: "کامل‌شدن داده منبع پیش از تصمیم بررسی شود.",
      }));
      observation.partial = { isPartial: true, missingSections: ["secondary_kpis"] };
    }
    if (this.scenario === "malformed_alert") {
      observation.alerts = [{ alertId: "missing-required-fields" }] as unknown as ModuleObservationV1["alerts"];
    }
    if (this.scenario === "empty_kpis") observation.kpis = [];

    return { kind: "data", raw: clone(observation) };
  }
}
