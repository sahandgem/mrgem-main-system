import type { AdapterReadResult, ModuleReadAdapter } from "./moduleAdapter";
import type {
  SanitizedModuleTransport,
  SanitizedTransportFailureCategory,
} from "../transports/sanitizedModuleTransport";

const categoryCode: Readonly<Record<SanitizedTransportFailureCategory, string>> = {
  unauthorized: "TRANSPORT_UNAUTHORIZED",
  forbidden: "TRANSPORT_FORBIDDEN",
  not_found: "TRANSPORT_NOT_FOUND",
  validation: "TRANSPORT_VALIDATION",
  unavailable: "TRANSPORT_UNAVAILABLE",
  timeout: "TRANSPORT_TIMEOUT",
  disconnected: "TRANSPORT_DISCONNECTED",
  stale: "TRANSPORT_STALE",
  conflict: "TRANSPORT_CONFLICT",
  contract_mismatch: "TRANSPORT_CONTRACT_MISMATCH",
  unknown: "TRANSPORT_UNKNOWN",
};

function safeTransportMessage(category: SanitizedTransportFailureCategory) {
  if (category === "timeout") return "Sanitized module transport timed out.";
  if (category === "disconnected") return "Sanitized module transport is disconnected.";
  if (category === "forbidden" || category === "unauthorized") {
    return "Sanitized module transport is not authorized for this read.";
  }
  if (category === "contract_mismatch" || category === "validation") {
    return "Sanitized module transport returned an unusable contract.";
  }
  return "Sanitized module transport is unavailable.";
}

export class TransportModuleAdapter implements ModuleReadAdapter {
  readonly adapterKey: string;
  readonly moduleId: string;
  private readonly transport: SanitizedModuleTransport;

  constructor(
    moduleId: string,
    adapterKey: string,
    transport: SanitizedModuleTransport,
  ) {
    this.moduleId = moduleId;
    this.adapterKey = adapterKey;
    this.transport = transport;
  }

  async read(): Promise<AdapterReadResult> {
    try {
      const result = await this.transport.read(this.moduleId);

      if (result.kind === "payload") {
        return { kind: "data", raw: result.payload };
      }
      if (result.kind === "no_data") {
        return { kind: "no_data" };
      }

      return {
        kind: "unavailable",
        error: {
          code: categoryCode[result.category],
          message: safeTransportMessage(result.category),
        },
      };
    } catch {
      return {
        kind: "unavailable",
        error: {
          code: "TRANSPORT_FAILURE",
          message: "Sanitized module transport failed.",
        },
      };
    }
  }
}
