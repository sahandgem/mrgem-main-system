import type { CommandCenterAttentionItem, CommandCenterKpiHighlight, CommandCenterModuleSummary } from "../../integration/commandCenter/commandCenterViewModel";
import { formatDateTime, toPersianNumber, toneForReliability } from "./presentation";

type RailProps = {
  attentions: readonly CommandCenterAttentionItem[];
  highlights: readonly CommandCenterKpiHighlight[];
  module?: CommandCenterModuleSummary;
};

function Metric({ value, label }: { value?: string | number; label: string }) {
  return <div><strong>{value === undefined ? "—" : toPersianNumber(value)}</strong><span>{label}</span></div>;
}

function ModuleRail({ attentions, highlights, module, production }: RailProps & { production: boolean }) {
  const items = attentions.filter((item) => item.moduleId === module?.moduleId);
  const kpis = highlights.filter((item) => item.moduleId === module?.moduleId);
  const coverage = kpis.find((item) => item.kpiKey === "workforce_schedule_coverage");
  const capacity = kpis.find((item) => item.kpiKey === "workforce_capacity_concentration");
  const plan = kpis.find((item) => item.kpiKey === "production_plan_attainment");
  const alerts = items.filter((item) => item.sourceType === "alert");
  const id = production ? "production" : "workforce";
  return (
    <aside className={`cockpit-rail cockpit-rail--${id}`} id={`module-${id}-demo`} aria-labelledby={`${id}-rail-title`}>
      <header className="instrument-rail-heading">
        <h2 id={`${id}-rail-title`}>{production ? "تولید" : "نیروی انسانی"}</h2>
        <span>{production ? "آزمایشی / Mock" : "برنامه هفتگی · نمونه"}</span>
      </header>
      <div className="rail-metrics">
        {production ? <><Metric value={plan?.displayValue} label="تحقق برنامه نمونه" /><Metric value={alerts.length} label="سفارش نیازمند بررسی" /></> : <>
          <Metric value={coverage?.displayValue} label="پوشش برنامه" />
          <Metric value={capacity?.displayValue} label="تمرکز ظرفیت" />
          <Metric value={alerts.length} label="تعارض در نمونه" />
          <Metric value={items.length} label="موضوع نیازمند توجه" />
        </>}
      </div>
      <div className={`rail-trust tone-${toneForReliability(module?.reliability ?? "unknown")}`}>
        <strong>{module?.dataStateLabel ?? "داده معتبر موجود نیست"}</strong>
        <span>{module?.hasLastKnownGood ? "آخرین داده سالم؛ مرجع تاریخی" : module?.isPartialData ? "فقط بخش‌های معتبر نمایش داده شده" : "زمان مشاهده"} · {formatDateTime(module?.observedAt)}</span>
      </div>
      <div className="rail-exceptions">
        <h3>{production ? "استثناهای نمونه تولید" : "نقاط توجه برنامه"}</h3>
        {items.length ? items.slice(0, 3).map((item) => (
          <div className="rail-exception" key={item.attentionId}>
            <strong>{item.title}</strong><p>{item.destinationLabel}</p>
          </div>
        )) : <p>در داده موجود موضوع بازی دیده نشد.</p>}
        {production && <div className="rail-exception rail-exception--pending"><strong>موعد، مواد و گلوگاه</strong><p>نیازمند تعریف؛ اتصال واقعی فعال نیست.</p></div>}
      </div>
      <p className="rail-footnote">{production ? "اعداد فقط برای ارزیابی UI هستند؛ منطق نهایی تولید تعریف نشده است." : "مالک اطلاعات و اقدام اجرایی: برنامه هفتگی"}</p>
      <a className="rail-destination" href="#attention-title">مرور موضوع‌های {production ? "تولید" : "برنامه"} در مرکز فرمان</a>
    </aside>
  );
}

export function WorkforceRail(props: RailProps) { return <ModuleRail {...props} production={false} />; }
export function ProductionRail(props: RailProps) { return <ModuleRail {...props} production />; }
