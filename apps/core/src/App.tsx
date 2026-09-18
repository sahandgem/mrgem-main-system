import { CommandCenterModuleOverview } from "./components/CommandCenterModuleOverview";

export function App() {
  return (
    <div className="core-shell">
      <a className="skip-link" href="#cockpit-main">رفتن به محتوای اصلی</a>
      <CommandCenterModuleOverview />
    </div>
  );
}
