import type { CommandCenterRuntimeEnvironment } from "../commandCenter/commandCenterRuntimeEnvironment";

/**
 * The manager route must not render fixture/demo data merely because a user
 * successfully authenticated. A valid Live runtime is a separate gate.
 */
export function isManagerLiveRuntime(
  environment: CommandCenterRuntimeEnvironment | null | undefined,
): boolean {
  if (!environment || environment.sourceMode !== "live") return false;
  if (typeof environment.setDevScenario === "function") return false;
  try {
    return environment.runtime?.getState()?.sourceKind === "live";
  } catch {
    return false;
  }
}
