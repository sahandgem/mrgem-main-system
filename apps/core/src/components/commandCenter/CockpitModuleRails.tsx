import type {
  CommandCenterAttentionItem,
  CommandCenterKpiHighlight,
  CommandCenterModuleSummary,
} from "../../integration/commandCenter/commandCenterViewModel";
import { attentionSummary, hasDisplayData, visibleCount } from "./density";
import { formatDateTime, managerDataStateLabel, toPersianNumber, toneForReliability } from "./presentation";

type RailProps = {
  attentions: readonly CommandCenterAttentionItem[];
  compact: boolean;
  excludedAttentionIds: readonly string[];
  highlights: readonly CommandCenterKpiHighlight[];
  module?: CommandCenterModuleSummary;
  onOpenAttention: (item: CommandCenterAttentionItem, trigger: HTMLButtonElement) => void;
  onOpenKpi: (item: CommandCenterKpiHighlight, trigger: HTMLButtonElement) => void;
  onOpenModule: (module: CommandCenterModuleSummary, trigger: HTMLButtonElement) => void;
  selectedKey?: string;
};

function Metric({ label, onOpen, selected, value }: {
  label: string;
  onOpen: (trigger: HTMLButtonElement) => void;
  selected: boolean;
  value?: string | number;
}) {
  return (
    <button
      aria-current={selected ? "true" : undefined}
      aria-label={`${label}: ${value === undefined ? "نامشخص" : toPersianNumber(value)}؛ بررسی`}
      className="rail-metric"
      onClick={(event) => onOpen(event.currentTarget)}
      title="بررسی زمینه شاخص"
      type="button"
    >
      <strong>{value === undefined ? "نامشخص" : toPersianNumber(value)}</strong>
      <span>{label}</span>
    </button>
  );
}

function ModuleRail({
  attentions,
  compact,
  excludedAttentionIds,
  highlights,
  module,
  onOpenAttention,
  onOpenKpi,
  onOpenModule,
  production,
  selectedKey,
}: RailProps & { production: boolean }) {
  const items = attentions.filter((item) => item.moduleId === module?.moduleId);
  const visibleExceptions = compact
    ? items.filter((item) => !excludedAttentionIds.includes(item.attentionId)).slice(0, 2)
    : items.slice(0, 5);
  const kpis = highlights.filter((item) => item.moduleId === module?.moduleId);
  const coverage = kpis.find((item) => item.kpiKey === "workforce_schedule_coverage");
  const capacity = kpis.find((item) => item.kpiKey === "workforce_capacity_concentration");
  const plan = kpis.find((item) => item.kpiKey === "production_plan_attainment");
  const alerts = items.filter((item) => item.sourceType === "alert");
  const id = production ? "production" : "workforce";
  const moduleKey = module ? `module:${module.moduleId}` : undefined;
  const openModule = (trigger: HTMLButtonElement) => {
    if (module) onOpenModule(module, trigger);
  };

  return (
    <aside className={`cockpit-rail cockpit-rail--${id}`} id={`module-${id}-demo`} aria-labelledby={`${id}-rail-title`}>
      <header className="instrument-rail-heading">
        {module ? (
          <button
            aria-current={selectedKey === moduleKey ? "true" : undefined}
            className="rail-title-button"
            onClick={(event) => openModule(event.currentTarget)}
            type="button"
          >
            <h2 id={`${id}-rail-title`}>{production ? "تولید" : "نیروی انسانی"}</h2>
            <span className="sr-only">بررسی تصویر مدیریتی ماژول</span>
          </button>
        ) : <h2 id={`${id}-rail-title`}>{production ? "تولید" : "نیروی انسانی"}</h2>}
        <span className={production ? "instrument-rail-state instrument-rail-state--experimental" : "instrument-rail-state"}>
          {production ? "آزمایشی" : "برنامه هفتگی · نمونه"}
        </span>
      </header>
      <div className="rail-metrics">
        {production ? <>
          <Metric
            label="تحقق برنامه نمونه"
            onOpen={(trigger) => plan ? onOpenKpi(plan, trigger) : openModule(trigger)}
            selected={selectedKey === (plan ? `kpi:${plan.highlightId}` : moduleKey)}
            value={plan?.displayValue}
          />
          <Metric
            label="سفارش نیازمند بررسی"
            onOpen={openModule}
            selected={selectedKey === moduleKey}
            value={visibleCount(alerts.length, module)}
          />
        </> : <>
          <Metric
            label="پوشش برنامه"
            onOpen={(trigger) => coverage ? onOpenKpi(coverage, trigger) : openModule(trigger)}
            selected={selectedKey === (coverage ? `kpi:${coverage.highlightId}` : moduleKey)}
            value={coverage?.displayValue}
          />
          <Metric
            label="تمرکز ظرفیت"
            onOpen={(trigger) => capacity ? onOpenKpi(capacity, trigger) : openModule(trigger)}
            selected={selectedKey === (capacity ? `kpi:${capacity.highlightId}` : moduleKey)}
            value={capacity?.displayValue}
          />
          <Metric
            label="تعارض در نمونه"
            onOpen={openModule}
            selected={selectedKey === moduleKey}
            value={visibleCount(alerts.length, module)}
          />
          <Metric
            label="موضوع نیازمند توجه"
            onOpen={openModule}
            selected={selectedKey === moduleKey}
            value={visibleCount(items.length, module)}
          />
        </>}
      </div>
      <div className={`rail-trust tone-${toneForReliability(module?.reliability ?? "unknown")}`}>
        <strong>{module ? managerDataStateLabel(module.reliability, module.dataStateLabel) : "داده معتبر موجود نیست"}</strong>
        {module?.hasLastKnownGood ? <span>آخرین داده سالم · {formatDateTime(module.observedAt ?? module.lastSuccessfulAt)}</span>
          : module?.isPartialData ? <span>فقط بخش معتبر · {formatDateTime(module.observedAt)}</span>
            : module?.reliability !== "fresh" && module?.observedAt ? <span>زمان مشاهده · {formatDateTime(module.observedAt)}</span> : null}
      </div>
      <div className="rail-exceptions">
        <h3>{production ? "استثناهای نمونه تولید" : "نقاط توجه برنامه"}</h3>
        {visibleExceptions.length ? visibleExceptions.map((item) => (
          <button
            aria-current={selectedKey === `attention:${item.attentionId}` ? "true" : undefined}
            className={`rail-exception rail-exception--${item.priorityTier <= 1 ? "critical" : item.priorityTier === 2 ? "attention" : "followup"}`}
            data-attention-id={item.attentionId}
            key={item.attentionId}
            onClick={(event) => onOpenAttention(item, event.currentTarget)}
            type="button"
          >
            <strong>{attentionSummary(item).title}</strong>
            <p>{attentionSummary(item).impact}</p>
          </button>
        )) : <p>{items.length && compact && excludedAttentionIds.length
          ? "موضوع‌ها در صف بالا"
          : !hasDisplayData(module) ? "داده معتبر موجود نیست."
            : module?.isPartialData ? "پوشش داده ناقص است."
              : "در داده موجود موضوع بازی دیده نشد."}</p>}
      </div>
      <a className="rail-destination" href="#attention-title">مرور موضوع‌های {production ? "تولید" : "برنامه"} در مرکز فرمان</a>
    </aside>
  );
}

export function WorkforceRail(props: RailProps) { return <ModuleRail {...props} production={false} />; }
export function ProductionRail(props: RailProps) { return <ModuleRail {...props} production />; }
