import { Suspense } from "react";
import { Activity, Moon } from "lucide-react";
import { RouteErrorBoundary } from "./components/RouteErrorBoundary";
import { RouteLoading } from "./components/RouteLoading";
import { findWorkforceRoute, normalizeWorkforcePath, workforceNavigationRoutes } from "./routes/workforceRoutes";

export function App() {
  const currentPath = normalizeWorkforcePath(window.location.pathname);
  const route = findWorkforceRoute(currentPath);
  const Page = route.component;

  return (
    <div className="app-shell" dir="rtl">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark"><Activity size={22} /></span><div><strong>تحلیل‌گر هفته</strong><small>ماژول سازمان</small></div></div>
        <nav>
          {workforceNavigationRoutes.map((item) => {
            const Icon = item.icon;
            return <a className={currentPath === item.path ? "active" : ""} href={item.path} key={item.path}><Icon size={18} />{item.label}</a>;
          })}
        </nav>
        <div className="theme-pill"><Moon size={16} />دارک‌مود فعال</div>
      </aside>
      <main>
        <RouteErrorBoundary key={route.path}>
          <Suspense fallback={<RouteLoading />}><Page /></Suspense>
        </RouteErrorBoundary>
      </main>
    </div>
  );
}
