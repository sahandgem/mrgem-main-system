import type { ModuleObservationV1 } from "@master-gem/module-contracts";

export const PRODUCTION_OPERATIONS_SNAPSHOT_VERSION = "production-operations-snapshot-v1";

export interface ProductionOperationsCounts {
  draft: number;
  reservationPending: number;
  reserved: number;
  released: number;
  issuePending: number;
  inProgress: number;
  awaitingQc: number;
  completionPending: number;
  completed: number;
  cancelled: number;
}

export interface SanitizedProductionOperationsSnapshotV1 {
  contractVersion: typeof PRODUCTION_OPERATIONS_SNAPSHOT_VERSION;
  generatedAt: string;
  sourceDataUpdatedAt: string | null;
  counts: ProductionOperationsCounts;
}

export class ProductionOperationsObservationContractError extends Error {
  readonly code = "PRODUCTION_OPERATIONS_CONTRACT_INVALID";

  constructor(message: string) {
    super(message);
    this.name = "ProductionOperationsObservationContractError";
  }
}

const countKeys: readonly (keyof ProductionOperationsCounts)[] = [
  "draft",
  "reservationPending",
  "reserved",
  "released",
  "issuePending",
  "inProgress",
  "awaitingQc",
  "completionPending",
  "completed",
  "cancelled",
];

function validTimestamp(value: string) {
  const parsed = Date.parse(value);
  return Boolean(value) && Number.isFinite(parsed);
}

function validateSnapshot(snapshot: SanitizedProductionOperationsSnapshotV1) {
  if (snapshot.contractVersion !== PRODUCTION_OPERATIONS_SNAPSHOT_VERSION) {
    throw new ProductionOperationsObservationContractError("Unsupported Production operations snapshot version.");
  }
  if (!validTimestamp(snapshot.generatedAt)) {
    throw new ProductionOperationsObservationContractError("generatedAt must be a valid timestamp.");
  }
  if (snapshot.sourceDataUpdatedAt !== null && !validTimestamp(snapshot.sourceDataUpdatedAt)) {
    throw new ProductionOperationsObservationContractError("sourceDataUpdatedAt must be null or a valid timestamp.");
  }
  if (!snapshot.counts || typeof snapshot.counts !== "object") {
    throw new ProductionOperationsObservationContractError("counts are required.");
  }
  for (const key of countKeys) {
    const value = snapshot.counts[key];
    if (!Number.isSafeInteger(value) || value < 0) {
      throw new ProductionOperationsObservationContractError(`${key} must be a non-negative safe integer.`);
    }
  }
}

export function buildProductionOperationsObservation(
  snapshot: SanitizedProductionOperationsSnapshotV1,
  environment: NonNullable<ModuleObservationV1["module"]["environment"]> = "test",
): ModuleObservationV1 {
  validateSnapshot(snapshot);

  const counts = snapshot.counts;
  const openOrders = counts.reservationPending
    + counts.reserved
    + counts.released
    + counts.issuePending
    + counts.inProgress
    + counts.awaitingQc
    + counts.completionPending;
  const integrationPending = counts.reservationPending
    + counts.issuePending
    + counts.completionPending;

  return {
    contractVersion: "1.0.0",
    observationId: `production-operations:${snapshot.generatedAt}`,
    module: {
      moduleId: "production.operations",
      displayName: "عملیات تولید",
      moduleType: "production",
      contractVersion: "1.0.0",
      producerVersion: PRODUCTION_OPERATIONS_SNAPSHOT_VERSION,
      sourceSystem: "master-gem-production-center",
      environment,
    },
    generatedAt: snapshot.generatedAt,
    ...(snapshot.sourceDataUpdatedAt === null
      ? {}
      : { sourceDataUpdatedAt: snapshot.sourceDataUpdatedAt }),
    summary: {
      status: "operational",
      text: openOrders === 0
        ? "سفارش تولید بازی ثبت نشده است."
        : `${openOrders} سفارش تولید پس از مرحله پیش‌نویس هنوز در وضعیت غیرنهایی قرار دارد.`,
    },
    health: {
      state: "healthy",
      observedAt: snapshot.generatedAt,
      reasonCode: "production_order_state_snapshot_valid",
    },
    kpis: [
      {
        key: "production_open_orders",
        label: "سفارش‌های باز",
        value: openOrders,
        valueType: "count",
        status: "normal",
        measuredAt: snapshot.generatedAt,
      },
      {
        key: "production_in_progress_orders",
        label: "در حال اجرا",
        value: counts.inProgress,
        valueType: "count",
        status: "normal",
        measuredAt: snapshot.generatedAt,
      },
      {
        key: "production_awaiting_qc_orders",
        label: "منتظر کنترل کیفیت",
        value: counts.awaitingQc,
        valueType: "count",
        status: counts.awaitingQc > 0 ? "info" : "normal",
        measuredAt: snapshot.generatedAt,
      },
      {
        key: "production_integration_pending_orders",
        label: "در انتظار تأیید یکپارچه‌سازی",
        value: integrationPending,
        valueType: "count",
        status: integrationPending > 0 ? "info" : "normal",
        measuredAt: snapshot.generatedAt,
      },
    ],
    capabilities: [
      { key: "health.read", version: "1.0", mode: "read", status: "available" },
      { key: "kpi.read", version: "1.0", mode: "read", status: "available" },
    ],
    ownership: {
      businessTruthOwner: "master-gem-production-center",
      isDerived: true,
      derivationId: "production-order-state-counts",
      derivationVersion: "1",
      sourceReferences: ["production_orders.status"],
    },
  };
}
