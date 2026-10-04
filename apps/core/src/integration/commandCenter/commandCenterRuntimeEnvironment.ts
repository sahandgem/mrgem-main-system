import {
  CommandCenterLiveDataSource,
  type CommandCenterLiveDataSourceOptions,
} from "./commandCenterLiveDataSource";
import {
  CommandCenterMockDataSource,
  type CommandCenterMockScenario,
} from "./commandCenterMockDataSource";
import { CommandCenterRuntime } from "./commandCenterRuntime";

export type CommandCenterDevScenario = CommandCenterMockScenario;
export type CommandCenterRuntimeMode = "mock" | "live";

export interface CommandCenterRuntimeEnvironmentOptions {
  mode?: CommandCenterRuntimeMode;
  live?: CommandCenterLiveDataSourceOptions;
}

export interface CommandCenterRuntimeEnvironment {
  runtime: CommandCenterRuntime;
  sourceMode: CommandCenterRuntimeMode;
  setDevScenario?(scenario: CommandCenterDevScenario): void;
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
