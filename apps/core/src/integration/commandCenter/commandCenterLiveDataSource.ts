import type { ModuleReadAdapter } from "../adapters/moduleAdapter";
import { ModuleObservationAggregator } from "../aggregation/moduleObservationAggregator";
import { integrationModuleRegistry } from "../registry/moduleRegistry";
import type { CommandCenterDataSource } from "./commandCenterDataSource";
import { buildCommandCenterViewModel } from "./commandCenterViewModel";

export interface CommandCenterLiveDataSourceOptions {
  enabled: boolean;
  adapters?: Readonly<Record<string, ModuleReadAdapter>>;
}

export class CommandCenterLiveGateClosedError extends Error {
  readonly code = "LIVE_DATA_GATE_CLOSED";

  constructor() {
    super("Live Command Center data source is disabled.");
    this.name = "CommandCenterLiveGateClosedError";
  }
}

const moduleDetailRoutes = Object.fromEntries(
  integrationModuleRegistry.flatMap((entry) => entry.detailRouteRef ? [[entry.moduleId, entry.detailRouteRef]] : []),
);
const allowedDrillDownRefs = new Set(Object.values(moduleDetailRoutes));

export class CommandCenterLiveDataSource implements CommandCenterDataSource {
  readonly sourceKind = "live" as const;
  private readonly aggregator = new ModuleObservationAggregator();
  private readonly enabled: boolean;
  private readonly adapters: Readonly<Record<string, ModuleReadAdapter>>;

  constructor(options: CommandCenterLiveDataSourceOptions) {
    this.enabled = options.enabled;
    this.adapters = options.adapters ?? {};
  }

  async read(now = new Date().toISOString()) {
    if (!this.enabled) throw new CommandCenterLiveGateClosedError();

    const aggregation = await this.aggregator.collect(
      integrationModuleRegistry,
      this.adapters,
      now,
    );

    return buildCommandCenterViewModel(aggregation, {
      allowedDrillDownRefs,
      moduleDetailRoutes,
      maxAttentionItems: 8,
    });
  }
}
