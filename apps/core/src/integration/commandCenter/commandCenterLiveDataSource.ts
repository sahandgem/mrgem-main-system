import type { ModuleReadAdapter } from "../adapters/moduleAdapter";
import { ModuleObservationAggregator } from "../aggregation/moduleObservationAggregator";
import { integrationModuleRegistry } from "../registry/moduleRegistry";
import type { ModuleRegistryEntry } from "@master-gem/module-contracts";
import type { CommandCenterDataSource } from "./commandCenterDataSource";
import { buildCommandCenterViewModel } from "./commandCenterViewModel";

export interface CommandCenterDataSourceExtension {
  entries: readonly ModuleRegistryEntry[];
  adapters: Readonly<Record<string, ModuleReadAdapter>>;
}

export interface CommandCenterLiveDataSourceOptions {
  enabled: boolean;
  adapters?: Readonly<Record<string, ModuleReadAdapter>>;
  registry?: readonly ModuleRegistryEntry[];
  // Opt-in, evaluated for each read. Never enabled by the default Core runtime.
  extension?: () => CommandCenterDataSourceExtension | null;
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
  private readonly extension?: () => CommandCenterDataSourceExtension | null;

  constructor(options: CommandCenterLiveDataSourceOptions) {
    this.enabled = options.enabled;
    this.adapters = options.adapters ?? {};
    this.registry = options.registry ?? integrationModuleRegistry;
    this.extension = options.extension;
  }

  async read(now = new Date().toISOString()) {
    if (!this.enabled) throw new CommandCenterLiveGateClosedError();

    const extension = this.extension?.() ?? null;
    if (extension) {
      const ids = new Set(this.registry.map(item => item.moduleId));
      const keys = new Set(this.registry.map(item => item.adapterKey));
      for (const entry of extension.entries) {
        if (ids.has(entry.moduleId) || keys.has(entry.adapterKey)) throw new Error("DUPLICATE_MODULE_EXTENSION");
        ids.add(entry.moduleId);
        keys.add(entry.adapterKey);
        if (!extension.adapters[entry.adapterKey]) throw new Error("MISSING_MODULE_ADAPTER");
      }
    }
    const entries = extension ? [...this.registry, ...extension.entries] : this.registry;
    // Base adapters cannot be replaced by the optional extension.
    const adapters = extension ? { ...extension.adapters, ...this.adapters } : this.adapters;
    const moduleDetailRoutes = Object.fromEntries(
      entries.flatMap((entry) => entry.detailRouteRef ? [[entry.moduleId, entry.detailRouteRef]] : []),
    );
    const aggregation = await this.aggregator.collect(entries, adapters, now);

    return buildCommandCenterViewModel(aggregation, {
      dataLabel: "LIVE/READ-ONLY",
      allowedDrillDownRefs: new Set(Object.values(moduleDetailRoutes)),
      moduleDetailRoutes,
      maxAttentionItems: 8,
    });
  }
}
