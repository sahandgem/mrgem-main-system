import { MockModuleAdapter } from "../adapters/mockModuleAdapter";
import type { ModuleReadAdapter } from "../adapters/moduleAdapter";
import { ModuleObservationAggregator } from "../aggregation/moduleObservationAggregator";
import { integrationModuleRegistry } from "../registry/moduleRegistry";
import { buildCommandCenterViewModel, type CommandCenterViewModel } from "./commandCenterViewModel";

export interface CommandCenterDataSource {
  read(now?: string): Promise<CommandCenterViewModel>;
}

export class CommandCenterMockDataSource implements CommandCenterDataSource {
  private readonly aggregator = new ModuleObservationAggregator();
  private readonly adapters: Readonly<Record<string, ModuleReadAdapter>>;

  constructor() {
    this.adapters = Object.fromEntries(
      integrationModuleRegistry.map((entry) => [
        entry.adapterKey,
        new MockModuleAdapter(entry.moduleId, entry.adapterKey, "healthy"),
      ]),
    );
  }

  async read(now = new Date().toISOString()) {
    const aggregation = await this.aggregator.collect(integrationModuleRegistry, this.adapters, now);
    return buildCommandCenterViewModel(aggregation);
  }
}
