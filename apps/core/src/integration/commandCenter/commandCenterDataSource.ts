import type { CommandCenterViewModel } from "./commandCenterViewModel";

export type CommandCenterSourceKind = "mock" | "live";

export interface CommandCenterDataSource {
  readonly sourceKind: CommandCenterSourceKind;
  read(now?: string): Promise<CommandCenterViewModel>;
}
