import type { CommandCenterViewModel } from "../../integration/commandCenter/commandCenterViewModel";
import {
  overallStateLabel,
  toPersianNumber,
  toneForKpiStatus,
} from "./presentation";

function InstrumentBars({ tone }: { tone: string }) {
  return (
    <span className={`summary-kpi__bars summary-kpi__bars--${tone}`} aria-hidden="true">
      {[3, 5, 4, 7, 6, 9].map((height, index) => (
        <i key={index} style={{ height: `${height}px` }} />
      ))}
    </span>
  );
}

function SummaryKpi({
  context,
  label,
  tone,
  value,
}: {
  context: string;
  label: string;
  tone: "critical" | "warn" | "info" | "focus";
  value: string | number;
}) {
  return (
    <article className={`summary-kpi summary-kpi--${tone}`}>
      <span className="summary-kpi__ring" aria-hidden="true"><i /></span>
      <span className="summary-kpi__copy">
        <span>{label}</span>
        <strong>{toPersianNumber(value)}</strong>
        <small>{context}</small>
      </span>
      <InstrumentBars tone={tone} />
    </article>
  );
}

export function CommandCenterExecutiveSummary({ viewModel }: { viewModel: CommandCenterViewModel }) {
  const { managementSummary } = viewModel;
  const workforce = viewModel.kpiHighlights.find((item) => item.kpiKey === "workforce_schedule_coverage");
  const production = viewModel.kpiHighlights.find((item) => item.kpiKey === "production_plan_attainment");
  const workforceTone = workforce ? toneForKpiStatus(workforce.status) : "info";
  const productionTone = production ? toneForKpiStatus(production.status) : "focus";

  return (
    <section className="status-summary" aria-label="شاخص‌های سریع مرکز فرمان">
      <SummaryKpi
        context={`${toPersianNumber(managementSummary.criticalAttentionCount)} فوری`}
        label="موضوع فعال"
        tone={managementSummary.criticalAttentionCount ? "critical" : "info"}
        value={viewModel.topAttention.length}
      />
      <SummaryKpi
        context={overallStateLabel(viewModel.overallState)}
        label="اولویت فوری"
        tone={managementSummary.criticalAttentionCount ? "critical" : "warn"}
        value={managementSummary.criticalAttentionCount}
      />
      <SummaryKpi
        context={workforce?.trendText ?? workforce?.reliabilityLabel ?? "داده موجود نیست"}
        label="پوشش برنامه"
        tone={workforceTone === "good" ? "info" : workforceTone === "critical" ? "critical" : workforceTone === "warn" ? "warn" : "info"}
        value={workforce?.displayValue ?? "نامشخص"}
      />
      <SummaryKpi
        context={production ? `آزمایشی · ${production.reliabilityLabel}` : "آزمایشی · داده موجود نیست"}
        label="تحقق تولید"
        tone={productionTone === "critical" ? "critical" : productionTone === "warn" ? "warn" : "focus"}
        value={production?.displayValue ?? "نامشخص"}
      />
    </section>
  );
}
