import type { ModuleRegistryEntry } from "@master-gem/module-contracts";
import { MockModuleAdapter } from "../adapters/mockModuleAdapter";
import type { ModuleReadAdapter } from "../adapters/moduleAdapter";
import { ModuleObservationAggregator } from "../aggregation/moduleObservationAggregator";
import { integrationModuleRegistry } from "../registry/moduleRegistry";
import { fridayMarketDataSourceExtension } from "../fridayMarketConnection";
import { buildCommandCenterViewModel, type CommandCenterViewModel } from "./commandCenterViewModel";

export type CommandCenterMockScenario = "normal" | "healthy" | "stale" | "partial" | "error";

export interface CommandCenterDataSource {
  read(now?: string): Promise<CommandCenterViewModel>;
}

export type CommandCenterDataSourceExtension = {
  entries: readonly ModuleRegistryEntry[];
  adapters: Readonly<Record<string, ModuleReadAdapter>>;
};

export class CommandCenterMockDataSource implements CommandCenterDataSource {
  private readonly aggregator = new ModuleObservationAggregator();
  private readonly errorAggregator = new ModuleObservationAggregator();
  private readonly mockAdapters: Readonly<Record<string, MockModuleAdapter>>;
  private readonly adapters: Readonly<Record<string, ModuleReadAdapter>>;
  private readonly entries: readonly ModuleRegistryEntry[];
  private readonly moduleDetailRoutes: Readonly<Record<string, string>>;
  private readonly allowedDrillDownRefs: ReadonlySet<string>;
  private scenario: CommandCenterMockScenario;
  private hasErrorBaseline = false;

  constructor(
    initialScenario: CommandCenterMockScenario = "healthy",
    extension?: CommandCenterDataSourceExtension,
  ) {
    this.scenario = initialScenario;
    this.entries = [...integrationModuleRegistry, ...(extension?.entries ?? [])];
    this.mockAdapters = Object.fromEntries(
      integrationModuleRegistry.map((entry) => [
        entry.adapterKey,
        new MockModuleAdapter(entry.moduleId, entry.adapterKey, "healthy"),
      ]),
    );
    this.adapters = { ...this.mockAdapters, ...(extension?.adapters ?? {}) };
    this.moduleDetailRoutes = Object.fromEntries(
      this.entries.flatMap((entry) => entry.detailRouteRef ? [[entry.moduleId, entry.detailRouteRef]] : []),
    );
    this.allowedDrillDownRefs = new Set(Object.values(this.moduleDetailRoutes));
  }

  setScenario(scenario: CommandCenterMockScenario) {
    this.scenario = scenario;
  }

  private configureAdapters(scenario: CommandCenterMockScenario, now: string) {
    for (const entry of integrationModuleRegistry) {
      const adapter = this.mockAdapters[entry.adapterKey];
      const observedAt = scenario === "stale"
        ? new Date(Date.parse(now) - (entry.freshnessPolicy.staleAfterSeconds + 5 * 60) * 1000).toISOString()
        : now;
      adapter.setGeneratedAt(observedAt);
      adapter.setScenario(
        scenario === "normal"
          ? "normal_day"
          : scenario === "partial"
            ? "partial_kpi"
            : scenario === "error"
              ? "unavailable"
              : scenario,
      );
    }
  }

  private async seedLastKnownGood(now: string) {
    if (this.hasErrorBaseline) return;
    const baselineAt = new Date(Date.parse(now) - 15 * 60 * 1000).toISOString();
    this.configureAdapters("healthy", baselineAt);
    await this.errorAggregator.collect(this.entries, this.adapters, baselineAt);
    this.hasErrorBaseline = true;
  }

  async read(now = new Date().toISOString()) {
    if (this.scenario === "error") await this.seedLastKnownGood(now);
    this.configureAdapters(this.scenario, now);
    const activeAggregator = this.scenario === "error" ? this.errorAggregator : this.aggregator;
    const aggregation = await activeAggregator.collect(this.entries, this.adapters, now);
    return buildCommandCenterViewModel(aggregation, {
      allowedDrillDownRefs: this.allowedDrillDownRefs,
      moduleDetailRoutes: this.moduleDetailRoutes,
      maxAttentionItems: 8,
    });
  }
}

export function createCommandCenterDataSource(
  initialScenario: CommandCenterMockScenario = "healthy",
) {
  return new CommandCenterMockDataSource(
    initialScenario,
    fridayMarketDataSourceExtension() ?? undefined,
  );
}
