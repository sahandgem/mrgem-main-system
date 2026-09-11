import { Activity } from "lucide-react";

export function RouteLoading() {
  return (
    <div className="route-loading" dir="rtl" role="status" aria-live="polite">
      <Activity size={24} />
      <div><strong>در حال آماده‌سازی صفحه...</strong><span>اطلاعات همین لحظه نمایش داده می‌شود.</span></div>
    </div>
  );
}
