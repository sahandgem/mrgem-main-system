import type {
  CommandCenterAttentionItem,
  CommandCenterKpiHighlight,
  CommandCenterModuleSummary,
} from "../../integration/commandCenter/commandCenterViewModel";
import { StatusBadge } from "../StatusBadge";
import {
  formatDateTime,
  toPersianNumber,
  toneForKpiStatus,
  toneForReliability,
} from "./presentation";

function kpiFor(highlights: readonly CommandCenterKpiHighlight[], key: string) {
  return highlights.find((item) => item.kpiKey === key);
}

function attentionFor(items: readonly CommandCenterAttentionItem[], moduleId: string, sourceRef: string) {
  return items.find((item) => item.moduleId === moduleId && item.sourceRef === sourceRef);
}

function RailKpi({ item, fallback }: { item?: CommandCenterKpiHighlight; fallback: string }) {
  if (!item) {
    return <div className="rail-signal rail-signal--empty"><span>{fallback}</span><strong>داده معتبر موجود نیست</strong></div>;
  }
  return (
    <div className={`rail-signal tone-${toneForKpiStatus(item.status)}`}>
      <span>{item.label}</span>
      <strong>{toPersianNumber(item.displayValue)}</strong>
      <small>{item.contextLabel}</small>
    </div>
  );
}

function RailHeader({ headingId, module, label }: { headingId: string; module?: CommandCenterModuleSummary; label: string }) {
  return (
    <header className="cockpit-rail__header">
      <div><span className="section-label">{label}</span><h2 id={headingId}>{module?.displayName ?? "ماژول در دسترس نیست"}</h2></div>
      {module?.isExperimental && <StatusBadge tone="focus">EXPERIMENTAL</StatusBadge>}
      {module && <StatusBadge tone={toneForReliability(module.reliability)}>{module.reliabilityLabel}</StatusBadge>}
    </header>
  );
}

export function WorkforceRail({
  attentions,
  highlights,
  module,
}: {
  attentions: readonly CommandCenterAttentionItem[];
  highlights: readonly CommandCenterKpiHighlight[];
  module?: CommandCenterModuleSummary;
}) {
  const workforceHighlights = highlights.filter((item) => item.moduleId === module?.moduleId);
  const conflict = attentionFor(attentions, module?.moduleId ?? "", "mock:workforce:schedule-conflict");

  return (
    <aside className="cockpit-rail cockpit-rail--workforce" id="module-workforce-demo" aria-labelledby="workforce-rail-title">
      <RailHeader headingId="workforce-rail-title" label="WORKFORCE" module={module} />
      <div className="rail-health">
        <span>سلامت و تازگی</span>
        <strong>{module?.dataStateLabel ?? "داده‌ای دریافت نشده"}</strong>
        <small>{module?.hasLastKnownGood ? `آخرین داده سالم: ${formatDateTime(module.observedAt)}` : "داده فعلی مبنای نمایش است"}</small>
      </div>
      <div className="rail-signals" aria-label="خلاصه Workforce">
        <RailKpi item={kpiFor(workforceHighlights, "workforce_schedule_coverage")} fallback="پوشش برنامه" />
        <RailKpi item={kpiFor(workforceHighlights, "workforce_capacity_concentration")} fallback="تمرکز فشار کاری" />
        <div className={`rail-signal ${conflict ? "tone-critical" : "tone-good"}`}>
          <span>تعارض عملیاتی یا ایمنی</span>
          <strong>{conflict ? "نیازمند بررسی" : "مورد بازی دیده نشد"}</strong>
          <small>{conflict?.businessImpact ?? "براساس داده mock فعلی"}</small>
        </div>
      </div>
      <div className="rail-attention-count">
        <span>موضوع‌های صف توجه</span>
        <strong>{toPersianNumber(attentions.filter((item) => item.moduleId === module?.moduleId).length)}</strong>
      </div>
      <a className="rail-destination" href={module?.detailRouteRef ?? "#attention-title"}>{module?.destinationLabel ?? "مسیر جزئیات تعریف نشده"}</a>
    </aside>
  );
}

export function ProductionRail({
  attentions,
  highlights,
  module,
}: {
  attentions: readonly CommandCenterAttentionItem[];
  highlights: readonly CommandCenterKpiHighlight[];
  module?: CommandCenterModuleSummary;
}) {
  const productionHighlights = highlights.filter((item) => item.moduleId === module?.moduleId);
  const workOrder = attentionFor(attentions, module?.moduleId ?? "", "mock:production:work-order");

  return (
    <aside className="cockpit-rail cockpit-rail--production" id="module-production-demo" aria-labelledby="production-rail-title">
      <RailHeader headingId="production-rail-title" label="PRODUCTION" module={module} />
      <div className="experimental-notice" role="note">
        داده این پنل mock است؛ اتصال واقعی و منطق نهایی Production فعال نیست.
      </div>
      <div className="rail-health">
        <span>سلامت و تازگی نمونه</span>
        <strong>{module?.dataStateLabel ?? "داده‌ای دریافت نشده"}</strong>
        <small>{module?.hasLastKnownGood ? `مرجع تاریخی: ${formatDateTime(module.observedAt)}` : "داده فعلی mock مبنای نمایش است"}</small>
      </div>
      <div className="rail-signals" aria-label="خلاصه آزمایشی Production">
        <div className={`rail-signal ${workOrder ? "tone-warn" : "tone-good"}`}>
          <span>WorkOrder در خطر</span>
          <strong>{workOrder ? "۱ نمونه آزمایشی" : "مورد بازی دیده نشد"}</strong>
          <small>فقط برای نمایش معماری UI</small>
        </div>
        <RailKpi item={kpiFor(productionHighlights, "production_plan_attainment")} fallback="عملکرد در برابر برنامه" />
        <div className="rail-signal rail-signal--empty"><span>گلوگاه / موعد / مواد</span><strong>نیازمند تعریف</strong><small>هیچ منطق قطعی اعمال نشده است</small></div>
      </div>
      <a className="rail-destination" href={module?.detailRouteRef ?? "#attention-title"}>{module?.destinationLabel ?? "مسیر جزئیات تعریف نشده"}</a>
    </aside>
  );
}
