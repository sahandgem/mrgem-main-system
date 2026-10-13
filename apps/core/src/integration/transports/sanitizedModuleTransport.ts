export type SanitizedTransportFailureCategory =
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "validation"
  | "unavailable"
  | "timeout"
  | "disconnected"
  | "stale"
  | "conflict"
  | "contract_mismatch"
  | "unknown";

export type SanitizedModuleTransportResult =
  | { kind: "payload"; payload: unknown }
  | { kind: "no_data" }
  | {
      kind: "unavailable";
      category: SanitizedTransportFailureCategory;
      reference?: string;
    };

export interface SanitizedModuleTransport {
  read(moduleId: string): Promise<SanitizedModuleTransportResult>;
}
