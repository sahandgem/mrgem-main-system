import {
  CommandCenterLiveDataSource,
  type CommandCenterLiveDataSourceOptions,
} from "./commandCenterLiveDataSource";
import {
  CommandCenterMockDataSource,
  type CommandCenterMockScenario,
} from "./commandCenterMockDataSource";
import { CommandCenterRuntime } from "./commandCenterRuntime";
import {
  authorizeFridayMarket,
  clearFridayMarketAccessToken,
  fridayMarketBridgeConfigured,
  fridayMarketDataSourceExtension,
  getFridayMarketAccessToken,
} from "../fridayMarketConnection";

export type CommandCenterDevScenario = CommandCenterMockScenario;
export type CommandCenterRuntimeMode = "mock" | "live";

export interface CommandCenterRuntimeEnvironmentOptions {
  mode?: CommandCenterRuntimeMode;
  live?: CommandCenterLiveDataSourceOptions;
}

export interface FridayMarketRuntimeConnector {
  available(): boolean;
  connected(): boolean;
  connect(): Promise<boolean>;
  disconnect(): void;
}

export interface CommandCenterRuntimeEnvironment {
  runtime: CommandCenterRuntime;
  sourceMode: CommandCenterRuntimeMode;
  setDevScenario?(scenario: CommandCenterDevScenario): void;
  fridayMarket?: FridayMarketRuntimeConnector;
}

export function createCommandCenterRuntimeEnvironment(
  options: CommandCenterRuntimeEnvironmentOptions = {},
): CommandCenterRuntimeEnvironment {
  const mode = options.mode ?? "mock";

  if (mode === "live") {
    const dataSource = new CommandCenterLiveDataSource(
      options.live ?? { enabled: false },
    );
    return {
      runtime: new CommandCenterRuntime(dataSource),
      sourceMode: "live",
    };
  }

  const dataSource = new CommandCenterMockDataSource();
  return {
    runtime: new CommandCenterRuntime(dataSource),
    sourceMode: "mock",
    setDevScenario(scenario) {
      dataSource.setScenario(scenario);
    },
  };
}

/**
 * Explicitly injected, opt-in bridge for an already authorised manager session.
 * It never changes the default closed/live gate or the isolated developer Mock.
 * Real connection still requires separate operational approval.
 */
export function createOptInFridayMarketRuntimeEnvironment(
  live: Omit<CommandCenterLiveDataSourceOptions, "extension">,
): CommandCenterRuntimeEnvironment {
  const enabled = live.enabled === true;
  const environment = createCommandCenterRuntimeEnvironment({
    mode: "live",
    live: { ...live, extension: enabled ? fridayMarketDataSourceExtension : undefined },
  });
  return {
    ...environment,
    fridayMarket: {
      available: () => enabled && fridayMarketBridgeConfigured(),
      connected: () => enabled && Boolean(getFridayMarketAccessToken()),
      connect: async () => enabled && fridayMarketBridgeConfigured() && await authorizeFridayMarket(),
      disconnect: () => clearFridayMarketAccessToken(),
    },
  };
}
