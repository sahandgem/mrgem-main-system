import { CommandCenterModuleOverview } from "./components/CommandCenterModuleOverview";

export function App() {
  const showDevScenarioControls = import.meta.env.DEV && window.location.pathname === "/__dev/command-center";
  return (
    <div className="core-shell">
      <a className="skip-link" href="#cockpit-main">رفتن به محتوای اصلی</a>
      <CommandCenterModuleOverview showDevScenarioControls={showDevScenarioControls} />
    </div>
  );
}
