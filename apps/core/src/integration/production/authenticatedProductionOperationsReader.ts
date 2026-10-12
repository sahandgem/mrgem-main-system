import type { CoreAuthProvider } from "../auth/coreAuthProvider";
import {
  createAuthenticatedBffJsonReader,
  type BffRequestExecutor,
} from "../transports/authenticatedBffRequest";
import type { SanitizedProductionOperationsSnapshotV1 } from "./productionOperationsObservation";

export const PRODUCTION_OPERATIONS_BFF_PATH = "/api/command-center/production-operations";

export interface AuthenticatedProductionOperationsReaderOptions {
  authProvider: CoreAuthProvider;
  executor: BffRequestExecutor;
}

export function createAuthenticatedProductionOperationsReader(
  options: AuthenticatedProductionOperationsReaderOptions,
) {
  const reader = createAuthenticatedBffJsonReader({
    authProvider: options.authProvider,
    executor: options.executor,
    path: PRODUCTION_OPERATIONS_BFF_PATH,
  });

  return Object.freeze({
    async read(): Promise<SanitizedProductionOperationsSnapshotV1 | null> {
      const body = await reader.read();
      if (body === null || body === undefined) return null;
      return body as SanitizedProductionOperationsSnapshotV1;
    },
  });
}
