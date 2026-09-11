export interface ModuleTransportError {
  code: string;
  message: string;
}

export type AdapterReadResult =
  | { kind: "data"; raw: unknown }
  | { kind: "no_data" }
  | { kind: "unavailable"; error: ModuleTransportError };

export interface ModuleReadAdapter {
  readonly adapterKey: string;
  readonly moduleId: string;
  read(): Promise<AdapterReadResult>;
}
