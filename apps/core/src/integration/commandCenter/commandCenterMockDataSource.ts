import { MockModuleAdapter } from "../adapters/mockModuleAdapter";
import type { ModuleReadAdapter } from "../adapters/moduleAdapter";
import { ModuleObservationAggregator } from "../aggregation/moduleObservationAggregator";
import { integrationModuleRegistry } from "../registry/moduleRegistry";
import { buildCommandCenterViewModel, type CommandCenterViewModel } from "./commandCenterViewModel";

export type CommandCenterMockScenario = "healthy" | "stale" | "partial" | "error";

export interface CommandCenterDataSource {
  read(now?: string): Promise<CommandCenterViewModel>;
}

export class CommandCenterMockDataSource implements CommandCenterDataSource {
  private readonly aggregator = new ModuleObservationAggregator();
  private readonly errorAggregator = new ModuleObservationAggregator();
  private readonly adapters: Readonly<Record<string, MockModuleAdapter>>;
  private scenario: CommandCenterMockScenario;
  private hasErrorBaseline = false;

  constructor(initialScenario: CommandCenterMockScenario = "healthy") {
    this.scenario = initialScenario;
    this.adapters = Object.fromEntries(
      integrationModuleRegistry.map((entry) => [
        entry.adapterKey,
        new MockModuleAdapter(entry.moduleId, entry.adapterKey, "healthy"),
      ]),
    );
  }

  setScenario(scenario: CommandCenterMockScenario) {
    this.scenario = scenario;
  }

  private configureAdapters(scenario: CommandCenterMockScenario, now: string) {
    for (const entry of integrationModuleRegistry) {
      const adapter = this.adapters[entry.adapterKey];
      const observedAt = scenario === "stale"
        ? new Date(Date.parse(now) - (entry.freshnessPolicy.staleAfterSeconds + 5 * 60) * 1000).toISOString()
        : now;
      adapter.setGeneratedAt(observedAt);
      adapter.setScenario(
        scenario === "partial" ? "partial_kpi" : scenario === "error" ? "unavailable" : scenario,
      );
    }
  }

  private async seedLastKnownGood(now: string) {
    if (this.hasErrorBaseline) return;
    const baselineAt = new Date(Date.parse(now) - 15 * 60 * 1000).toISOString();
    this.configureAdapters("healthy", baselineAt);
    await this.errorAggregator.collect(
      integrationModuleRegistry,
      this.adapters satisfies Readonly<Record<string, ModuleReadAdapter>>,
      baselineAt,
    );
    this.hasErrorBaseline = true;
  }

  async read(now = new Date().toISOString()) {
    if (this.scenario === "error") await this.seedLastKnownGood(now);
    this.configureAdapters(this.scenario, now);
    const activeAggregator = this.scenario === "error" ? this.errorAggregator : this.aggregator;
    const aggregation = await activeAggregator.collect(integrationModuleRegistry, this.adapters, now);
    return buildCommandCenterViewModel(aggregation);
  }
}
