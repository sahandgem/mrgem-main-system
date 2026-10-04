import type { ModuleReadAdapter } from "../adapters/moduleAdapter";
import { ModuleObservationAggregator } from "../aggregation/moduleObservationAggregator";
import { integrationModuleRegistry } from "../registry/moduleRegistry";
import type { ModuleRegistryEntry } from "@master-gem/module-contracts";
import type { CommandCenterDataSource } from "./commandCenterDataSource";
import { buildCommandCenterViewModel } from "./commandCenterViewModel";

export interface CommandCenterLiveDataSourceOptions {
  enabled: boolean;
  adapters?: Readonly<Record<string, ModuleReadAdapter>>;
  registry?: readonly ModuleRegistryEntry[];
}

export class CommandCenterLiveGateClosedError extends Error {
  readonly code = "LIVE_DATA_GATE_CLOSED";

  constructor() {
    super("Live Command Center data source is disabled.");
    this.name = "CommandCenterLiveGateClosedError";
  }
}

export class CommandCenterLiveDataSource implements CommandCenterDataSource {
  readonly sourceKind = "live" as const;
  private readonly aggregator = new ModuleObservationAggregator();
  private readonly enabled: boolean;
  private readonly adapters: Readonly<Record<string, ModuleReadAdapter>>;
  private readonly registry: readonly ModuleRegistryEntry[];
  private readonly moduleDetailRoutes: Readonly<Record<string, string>>;
  private readonly allowedDrillDownRefs: ReadonlySet<string>;

  constructor(options: CommandCenterLiveDataSourceOptions) {
    this.enabled = options.enabled;
    this.adapters = options.adapters ?? {};
    this.registry = options.registry ?? integrationModuleRegistry;
    this.moduleDetailRoutes = Object.fromEntries(
      this.registry.flatMap((entry) => entry.detailRouteRef ? [[entry.moduleId, entry.detailRouteRef]] : []),
    );
    this.allowedDrillDownRefs = new Set(Object.values(this.moduleDetailRoutes));
  }

  async read(now = new Date().toISOString()) {
    if (!this.enabled) throw new CommandCenterLiveGateClosedError();

    const aggregation = await this.aggregator.collect(
      this.registry,
      this.adapters,
      now,
    );

    return buildCommandCenterViewModel(aggregation, {
      dataLabel: "LIVE/READ-ONLY",
      allowedDrillDownRefs: this.allowedDrillDownRefs,
      moduleDetailRoutes: this.moduleDetailRoutes,
      maxAttentionItems: 8,
    });
  }
}
