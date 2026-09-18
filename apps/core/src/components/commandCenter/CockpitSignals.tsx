import type { CommandCenterViewModel } from "../../integration/commandCenter/commandCenterViewModel";
import { StatusBadge } from "../StatusBadge";
import { toPersianNumber, toneForKpiStatus } from "./presentation";

function dataSlot(viewModel: CommandCenterViewModel) {
  if (viewModel.reliability.failedModuleCount) return { value: "ناموفق", detail: "آخرین داده سالم", tone: "critical" as const };
  if (viewModel.reliability.hasPartialData) return { value: "ناقص", detail: "تصمیم با احتیاط", tone: "warn" as const };
  if (viewModel.managementSummary.staleModuleCount) return { value: "قدیمی", detail: "مرجع تاریخی", tone: "warn" as const };
  return { value: "تازه", detail: "۲ ماژول معتبر", tone: "good" as const };
}

export function ImportantChanges({ viewModel }: { viewModel: CommandCenterViewModel }) {
  const changes = viewModel.kpiHighlights.filter((item) => item.status !== "normal" && item.trendText).slice(0, 3);

  return (
    <section className="important-changes" aria-labelledby="important-changes-title">
      <header>
        <span className="section-label">IMPORTANT CHANGES</span>
        <h2 id="important-changes-title">تغییرهای مهم</h2>
      </header>
      {changes.length ? (
        <div className="important-changes__list">
          {changes.map((item) => (
            <article key={item.highlightId}>
              <div>
                <span>{item.moduleName}</span>
                <strong>{item.label}</strong>
              </div>
              <b className={`tone-${toneForKpiStatus(item.status)}`}>{toPersianNumber(item.trendText ?? "")}</b>
              <small>{item.reliabilityLabel} · {item.isExperimental ? "نمونه آزمایشی؛ منطق نهایی تعریف نشده" : item.contextLabel}</small>
            </article>
          ))}
        </div>
      ) : (
        <p className="important-changes__empty">در داده فعلی، تغییر مهمی برای برجسته‌سازی دیده نشده است.</p>
      )}
    </section>
  );
}

export function VitalStrip({ viewModel }: { viewModel: CommandCenterViewModel }) {
  const workforce = viewModel.kpiHighlights.find((item) => item.kpiKey === "workforce_schedule_coverage");
  const production = viewModel.kpiHighlights.find((item) => item.kpiKey === "production_plan_attainment");
  const workOrderCount = viewModel.topAttention.filter((item) => item.sourceRef === "mock:production:work-order").length;
  const data = dataSlot(viewModel);

  return (
    <section className="vital-strip" aria-label="نوار حیاتی کسب‌وکار">
      <div className="vital-slot vital-slot--placeholder"><span>SALES</span><strong>متصل نیست</strong><small>داده فروش در دسترس نیست</small></div>
      <div className="vital-slot vital-slot--placeholder"><span>CASH</span><strong>متصل نیست</strong><small>داده مالی در دسترس نیست</small></div>
      <div className="vital-slot vital-slot--experimental"><span>ORDERS</span><strong>{workOrderCount ? `${toPersianNumber(workOrderCount)} Mock` : "بدون مورد"}</strong><small>آزمایشی</small></div>
      <div className="vital-slot"><span>WORKFORCE</span><strong>{workforce ? toPersianNumber(workforce.displayValue) : "ناموجود"}</strong><small>پوشش برنامه{workforce?.reliability === "stale_last_known_good" ? " · آخرین داده سالم" : ""}</small></div>
      <div className="vital-slot vital-slot--experimental"><span>PRODUCTION</span><strong>{production ? toPersianNumber(production.displayValue) : "ناموجود"}</strong><small>تحقق mock برنامه{production?.reliability === "stale_last_known_good" ? " · آخرین داده سالم" : ""}</small></div>
      <div className={`vital-slot tone-${data.tone}`}><span>DATA</span><strong>{data.value}</strong><small>{data.detail}</small></div>
    </section>
  );
}
