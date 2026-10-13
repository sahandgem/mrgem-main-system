import { Activity, Factory, LayoutDashboard, UsersRound } from "lucide-react";

export function CockpitMobileNavigation() {
  return (
    <nav className="cockpit-mobile-nav" aria-label="ناوبری سریع موبایل">
      <a aria-current="page" href="#attention-title">
        <LayoutDashboard aria-hidden="true" size={17} strokeWidth={1.7} />
        <span>مرکز</span>
      </a>
      <a href="#vital-signals">
        <Activity aria-hidden="true" size={17} strokeWidth={1.7} />
        <span>سیگنال</span>
      </a>
      <a href="#module-workforce-demo">
        <UsersRound aria-hidden="true" size={17} strokeWidth={1.7} />
        <span>نیرو</span>
      </a>
      <a href="#module-production-demo">
        <Factory aria-hidden="true" size={17} strokeWidth={1.7} />
        <span>تولید</span>
      </a>
    </nav>
  );
}
