import type {
  CommandCenterKpiHighlight,
  CommandCenterViewModel,
} from "../../integration/commandCenter/commandCenterViewModel";
import { changeImpact, hasDisplayData, reliabilityText } from "./density";
import { signalFromHighlight, type CockpitKpiSignal } from "./drawerModel";
import { formatDateTime, toPersianNumber, toneForKpiStatus } from "./presentation";

function dataSlot(viewModel: CommandCenterViewModel) {
  if (viewModel.reliability.failedModuleCount) return { value: "خطای داده", detail: viewModel.modules.some((item) => item.hasLastKnownGood) ? "مرجع تاریخی موجود" : "داده موجود نیست", tone: "critical" as const };
  if (viewModel.reliability.hasPartialData) return { value: "ناقص", detail: "تصمیم با احتیاط", tone: "warn" as const };
  if (viewModel.managementSummary.staleModuleCount) return { value: "قدیمی", detail: "مرجع تاریخی", tone: "warn" as const };
  if (!viewModel.modules.length || viewModel.reliability.unknownFreshnessCount) return { value: "نامشخص", detail: "پوشش نامعلوم", tone: "info" as const };
  return { value: "تازه و معتبر", detail: `${toPersianNumber(viewModel.reliability.completeModuleCount)} ماژول معتبر`, tone: "good" as const };
}

export function ImportantChanges({
  onOpen,
  selectedKey,
  viewModel,
}: {
  onOpen: (item: CommandCenterKpiHighlight, trigger: HTMLButtonElement) => void;
  selectedKey?: string;
  viewModel: CommandCenterViewModel;
}) {
  const changes = viewModel.kpiHighlights.filter((item) => item.status !== "normal" && item.trendText).slice(0, 3);

  return (
    <section className="important-changes" aria-labelledby="important-changes-title">
      <header><h2 id="important-changes-title">تغییرهای مهم</h2></header>
      {changes.length ? (
        <div className="important-changes__list">
          {changes.map((item) => (
            <button
              aria-current={selectedKey === `change:${item.highlightId}` ? "true" : undefined}
              aria-label={`تغییر مهم: ${item.label}؛ مشاهده جزئیات`}
              key={item.highlightId}
              onClick={(event) => onOpen(item, event.currentTarget)}
              type="button"
            >
              <span className="important-change__heading">
                <span>{item.moduleName}</span>
                <strong>{item.label} · {changeImpact(item.kpiKey)}</strong>
              </span>
              <b className={`tone-${toneForKpiStatus(item.status)}`}>{toPersianNumber(item.trendText ?? "")}</b>
              <small>{item.isExperimental ? "آزمایشی · " : ""}{reliabilityText(item.reliability)} · مشاهده {formatDateTime(item.observedAt)}</small>
            </button>
          ))}
        </div>
      ) : <p className="important-changes__empty">در داده فعلی، تغییر مهمی برای برجسته‌سازی دیده نشده است.</p>}
    </section>
  );
}

function VitalSlot({
  onOpen,
  selected,
  signal,
  tone,
}: {
  onOpen: (signal: CockpitKpiSignal, trigger: HTMLButtonElement) => void;
  selected: boolean;
  signal: CockpitKpiSignal;
  tone?: string;
}) {
  const placeholder = signal.value === undefined;
  return (
    <button
      aria-current={selected ? "true" : undefined}
      aria-label={`${signal.label}: ${signal.value ?? signal.dataStateLabel}؛ مشاهده جزئیات`}
      className={`vital-slot${signal.signalId === "vital-data" ? " vital-slot--data" : ""}${placeholder ? " vital-slot--placeholder" : ""}${signal.isExperimental ? " vital-slot--experimental" : ""}${tone ? ` tone-${tone}` : ""}`}
      onClick={(event) => onOpen(signal, event.currentTarget)}
      title="مشاهده جزئیات سیگنال"
      type="button"
    >
      <span>{signal.label}</span>
      <strong>{signal.value ?? signal.dataStateLabel}</strong>
      <small>{signal.context}</small>
    </button>
  );
}

export function VitalStrip({
  onOpen,
  selectedKey,
  viewModel,
}: {
  onOpen: (signal: CockpitKpiSignal, trigger: HTMLButtonElement) => void;
  selectedKey?: string;
  viewModel: CommandCenterViewModel;
}) {
  const workforce = viewModel.kpiHighlights.find((item) => item.kpiKey === "workforce_schedule_coverage");
  const production = viewModel.kpiHighlights.find((item) => item.kpiKey === "production_plan_attainment");
  const workforceModule = viewModel.modules.find((item) => item.moduleId === "workforce.demo");
  const productionModule = viewModel.modules.find((item) => item.moduleId === "production.demo");
  const workOrderAttention = viewModel.topAttention.find((item) => item.sourceRef === "mock:production:work-order");
  const workOrderCount = viewModel.topAttention.filter((item) => item.sourceRef === "mock:production:work-order").length;
  const ordersKnown = hasDisplayData(productionModule) && (!productionModule?.isPartialData || workOrderCount > 0);
  const data = dataSlot(viewModel);
  const signals: CockpitKpiSignal[] = [
    {
      signalId: "vital-sales",
      label: "فروش",
      context: "داده موجود نیست",
      ownerLabel: "فروش",
      dataStateLabel: "متصل نیست",
      isExperimental: false,
    },
    {
      signalId: "vital-cash",
      label: "نقدینگی",
      context: "داده موجود نیست",
      ownerLabel: "مالی",
      dataStateLabel: "متصل نیست",
      isExperimental: false,
    },
    {
      signalId: "vital-orders",
      label: "سفارش‌ها",
      value: ordersKnown ? (workOrderCount ? `${toPersianNumber(workOrderCount)} نمونه` : "بدون مورد") : undefined,
      context: productionModule?.hasLastKnownGood ? "آزمایشی · آخرین داده سالم" : productionModule?.isPartialData ? "آزمایشی · ناقص" : "موارد در خطر · آزمایشی",
      ownerLabel: productionModule?.displayName ?? "مرکز تولید آزمایشی",
      dataStateLabel: ordersKnown ? (productionModule?.dataStateLabel ?? "نامشخص") : "نامشخص",
      reliability: productionModule?.reliability,
      observedAt: productionModule?.observedAt,
      destinationLabel: productionModule?.destinationLabel,
      destinationRef: productionModule?.detailRouteRef,
      isExperimental: true,
      relatedAttention: workOrderAttention,
      module: productionModule,
    },
    workforce ? {
      ...signalFromHighlight(workforce, workforceModule, viewModel.topAttention),
      signalId: "vital-workforce",
      label: "نیروی انسانی",
      context: `پوشش برنامه · ${workforce.contextLabel}`,
    } : {
      signalId: "vital-workforce",
      label: "نیروی انسانی",
      context: "پوشش برنامه",
      ownerLabel: workforceModule?.displayName ?? "برنامه هفتگی",
      dataStateLabel: workforceModule?.dataStateLabel ?? "داده موجود نیست",
      reliability: workforceModule?.reliability,
      observedAt: workforceModule?.observedAt,
      destinationLabel: workforceModule?.destinationLabel,
      destinationRef: workforceModule?.detailRouteRef,
      isExperimental: false,
      module: workforceModule,
    },
    production ? {
      ...signalFromHighlight(production, productionModule, viewModel.topAttention),
      signalId: "vital-production",
      label: "تولید",
      context: `تحقق آزمایشی برنامه · ${production.contextLabel}`,
    } : {
      signalId: "vital-production",
      label: "تولید",
      context: "تحقق آزمایشی برنامه",
      ownerLabel: productionModule?.displayName ?? "مرکز تولید آزمایشی",
      dataStateLabel: productionModule?.dataStateLabel ?? "داده موجود نیست",
      reliability: productionModule?.reliability,
      observedAt: productionModule?.observedAt,
      destinationLabel: productionModule?.destinationLabel,
      destinationRef: productionModule?.detailRouteRef,
      isExperimental: true,
      module: productionModule,
    },
    {
      signalId: "vital-data",
      label: "داده",
      value: data.value,
      context: data.detail,
      ownerLabel: "Core",
      dataStateLabel: data.value,
      isExperimental: false,
    },
  ];

  return (
    <section className="vital-strip" aria-label="نوار حیاتی کسب‌وکار">
      {signals.map((signal, index) => (
        <VitalSlot
          key={signal.signalId}
          onOpen={onOpen}
          selected={selectedKey === `kpi:${signal.signalId}`}
          signal={signal}
          tone={index === signals.length - 1 ? data.tone : undefined}
        />
      ))}
    </section>
  );
}
