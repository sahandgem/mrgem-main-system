import type { ModuleObservationV1 } from "@master-gem/module-contracts";
import type {
  SanitizedModuleTransport,
  SanitizedModuleTransportResult,
} from "../transports/sanitizedModuleTransport";
import {
  buildProductionOperationsObservation,
  ProductionOperationsObservationContractError,
  type SanitizedProductionOperationsSnapshotV1,
} from "./productionOperationsObservation";

export interface ProductionOperationsSnapshotReader {
  read(): Promise<SanitizedProductionOperationsSnapshotV1 | null>;
}

export interface ProductionOperationsTransportOptions {
  reader: ProductionOperationsSnapshotReader;
  environment?: NonNullable<ModuleObservationV1["module"]["environment"]>;
}

export class ProductionOperationsSanitizedTransport implements SanitizedModuleTransport {
  private readonly reader: ProductionOperationsSnapshotReader;
  private readonly environment: NonNullable<ModuleObservationV1["module"]["environment"]>;

  constructor(options: ProductionOperationsTransportOptions) {
    this.reader = options.reader;
    this.environment = options.environment ?? "test";
  }

  async read(moduleId: string): Promise<SanitizedModuleTransportResult> {
    if (moduleId !== "production.operations") {
      return {
        kind: "unavailable",
        category: "contract_mismatch",
      };
    }

    try {
      const snapshot = await this.reader.read();
      if (snapshot === null) return { kind: "no_data" };

      return {
        kind: "payload",
        payload: buildProductionOperationsObservation(snapshot, this.environment),
      };
    } catch (error) {
      if (error instanceof ProductionOperationsObservationContractError) {
        return {
          kind: "unavailable",
          category: "validation",
        };
      }
      return {
        kind: "unavailable",
        category: "unavailable",
      };
    }
  }
}
