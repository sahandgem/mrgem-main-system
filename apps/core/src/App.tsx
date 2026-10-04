import { CommandCenterModuleOverview } from "./components/CommandCenterModuleOverview";
import type { CommandCenterRuntimeEnvironment } from "./integration/commandCenter/commandCenterRuntimeEnvironment";

export interface AppProps {
  runtimeEnvironmentFactory?: () => CommandCenterRuntimeEnvironment;
}

export function App({ runtimeEnvironmentFactory }: AppProps = {}) {
  const showDevScenarioControls = import.meta.env.DEV && window.location.pathname === "/__dev/command-center";
  return (
    <div className="core-shell">
      <a className="skip-link" href="#cockpit-main">رفتن به محتوای اصلی</a>
      <CommandCenterModuleOverview
        runtimeEnvironmentFactory={runtimeEnvironmentFactory}
        showDevScenarioControls={showDevScenarioControls}
      />
    </div>
  );
}
