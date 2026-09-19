import type { CommandCenterViewModel } from "../../integration/commandCenter/commandCenterViewModel";
import { formatDateTime, toPersianNumber, toneForKpiStatus } from "./presentation";

import { changeImpact, hasDisplayData, reliabilityText } from "./density";

function dataSlot(viewModel: CommandCenterViewModel) {
  if (viewModel.reliability.failedModuleCount) return { value: "ناموفق", detail: viewModel.modules.some((item) => item.hasLastKnownGood) ? "مرجع تاریخی موجود" : "داده موجود نیست", tone: "critical" as const };
  if (viewModel.reliability.hasPartialData) return { value: "ناقص", detail: "تصمیم با احتیاط", tone: "warn" as const };
  if (viewModel.managementSummary.staleModuleCount) return { value: "قدیمی", detail: "مرجع تاریخی", tone: "warn" as const };
  if (!viewModel.modules.length || viewModel.reliability.unknownFreshnessCount) return { value: "نامشخص", detail: "پوشش نامعلوم", tone: "info" as const };
  return { value: "تازه", detail: `${toPersianNumber(viewModel.reliability.completeModuleCount)} ماژول معتبر`, tone: "good" as const };
}

export function ImportantChanges({ viewModel }: { viewModel: CommandCenterViewModel }) {
  const changes = viewModel.kpiHighlights.filter((item) => item.status !== "normal" && item.trendText).slice(0, 3);

  return (
    <section className="important-changes" aria-labelledby="important-changes-title">
      <header>
        <h2 id="important-changes-title">تغییرهای مهم</h2>
      </header>
      {changes.length ? (
        <div className="important-changes__list">
          {changes.map((item) => (
            <article key={item.highlightId}>
              <div>
                <span>{item.moduleName}</span>
                <strong>{item.label} · {changeImpact(item.kpiKey)}</strong>
              </div>
              <b className={`tone-${toneForKpiStatus(item.status)}`}>{toPersianNumber(item.trendText ?? "")}</b>
              <small>{item.isExperimental ? "آزمایشی · " : ""}{reliabilityText(item.reliability)} · مشاهده {formatDateTime(item.observedAt)}</small>
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
  const productionModule = viewModel.modules.find((item) => item.moduleId === "production.demo");
  const ordersKnown = hasDisplayData(productionModule) && (!productionModule?.isPartialData || workOrderCount > 0);
  const data = dataSlot(viewModel);

  return (
    <section className="vital-strip" aria-label="نوار حیاتی کسب‌وکار">
      <div className="vital-slot vital-slot--placeholder"><span>فروش</span><strong>متصل نیست</strong><small>داده موجود نیست</small></div>
      <div className="vital-slot vital-slot--placeholder"><span>نقدینگی</span><strong>متصل نیست</strong><small>داده موجود نیست</small></div>
      <div className="vital-slot vital-slot--experimental"><span>سفارش‌ها</span><strong>{!ordersKnown ? "نامشخص" : workOrderCount ? `${toPersianNumber(workOrderCount)} نمونه` : "بدون مورد"}</strong><small>{productionModule?.hasLastKnownGood ? "آزمایشی · آخرین داده سالم" : productionModule?.isPartialData ? "آزمایشی · ناقص" : "موارد در خطر · آزمایشی"}</small></div>
      <div className="vital-slot"><span>نیروی انسانی</span><strong>{workforce ? toPersianNumber(workforce.displayValue) : "ناموجود"}</strong><small>پوشش برنامه{workforce?.reliability === "stale_last_known_good" ? " · آخرین داده سالم" : ""}</small></div>
      <div className="vital-slot vital-slot--experimental"><span>تولید</span><strong>{production ? toPersianNumber(production.displayValue) : "ناموجود"}</strong><small>تحقق mock برنامه{production?.reliability === "stale_last_known_good" ? " · آخرین داده سالم" : ""}</small></div>
      <div className={`vital-slot tone-${data.tone}`}><span>داده</span><strong>{data.value}</strong><small>{data.detail}</small></div>
    </section>
  );
}
