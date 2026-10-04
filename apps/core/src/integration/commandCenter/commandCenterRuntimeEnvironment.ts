import {
  CommandCenterMockDataSource,
  type CommandCenterMockScenario,
} from "./commandCenterMockDataSource";
import { CommandCenterRuntime } from "./commandCenterRuntime";

export type CommandCenterDevScenario = CommandCenterMockScenario;

export interface CommandCenterRuntimeEnvironment {
  runtime: CommandCenterRuntime;
  setDevScenario(scenario: CommandCenterDevScenario): void;
}

export function createCommandCenterRuntimeEnvironment(): CommandCenterRuntimeEnvironment {
  const dataSource = new CommandCenterMockDataSource();

  return {
    runtime: new CommandCenterRuntime(dataSource),
    setDevScenario(scenario) {
      dataSource.setScenario(scenario);
    },
  };
}
