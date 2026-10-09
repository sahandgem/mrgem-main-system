import { CoreAuthBoundary } from "./components/auth/CoreAuthBoundary";
import { CommandCenterModuleOverview } from "./components/CommandCenterModuleOverview";
import type { CoreAuthProviderFactory } from "./integration/auth/coreAuthProvider";
import type { CommandCenterRuntimeEnvironment } from "./integration/commandCenter/commandCenterRuntimeEnvironment";

export interface AppProps {
  authProviderFactory?: CoreAuthProviderFactory;
  runtimeEnvironmentFactory?: () => CommandCenterRuntimeEnvironment;
  pathname?: string;
}

export function App({
  authProviderFactory,
  runtimeEnvironmentFactory,
  pathname = window.location.pathname,
}: AppProps = {}) {
  const showDevCommandCenter = import.meta.env.DEV && pathname === "/__dev/command-center";

  if (showDevCommandCenter) {
    return (
      <div className="core-shell">
        <a className="skip-link" href="#cockpit-main">رفتن به محتوای اصلی</a>
        <CommandCenterModuleOverview showDevScenarioControls />
      </div>
    );
  }

  return (
    <CoreAuthBoundary
      authProviderFactory={authProviderFactory}
      runtimeEnvironmentFactory={runtimeEnvironmentFactory}
    />
  );
}
