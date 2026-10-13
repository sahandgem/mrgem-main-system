// C49 synthetic Cockpit entry. NEVER ship this HTML or bundle to end users.
// This reproduces the dev-only Mock view in a separate, disposable build.
import { createRoot } from "react-dom/client";
import { CommandCenterModuleOverview } from "../../src/components/CommandCenterModuleOverview";
import "../../src/styles.css";

if (import.meta.env.VITE_C49_SYNTHETIC_ONLY !== "true") {
  throw new Error("C49 fixture may run only in explicitly enabled synthetic build");
}
createRoot(document.getElementById("root")!).render(
  <div className="core-shell" data-c49-test-only="true">
    <a className="skip-link" href="#cockpit-main">رفتن به محتوای اصلی</a>
    <CommandCenterModuleOverview />
  </div>,
);
