import {
  findPrimaryCommandCenterModule,
  type CommandCenterKpiHighlight,
  type CommandCenterViewModel,
} from "../../integration/commandCenter/commandCenterViewModel";
import { changeImpact, hasDisplayData, reliabilityText } from "./density";
import { signalFromHighlight, type CockpitKpiSignal } from "./drawerModel";
import { toPersianNumber, toneForKpiStatus } from "./presentation";

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

  if (viewModel.reliability.failedModuleCount) {
    const historicalCount = viewModel.modules.filter((item) => item.hasLastKnownGood).length;
    return (
      <section className="important-changes important-changes--system-alert" aria-labelledby="important-changes-title">
        <span className="system-alert__icon" aria-hidden="true">!</span>
        <div className="system-alert__copy">
          <h2 id="important-changes-title">هشدار سیستم</h2>
          <p>دریافت فعلی برخی داده‌ها ناموفق است؛ {toPersianNumber(historicalCount)} مرجع تاریخی فقط برای زمینه حفظ شده است.</p>
        </div>
        <a className="system-alert__action" href="#vital-signals">بررسی اعتماد داده</a>
      </section>
    );
  }

  return (
    <section className="important-changes" id="important-changes" aria-labelledby="important-changes-title">
      <header><h2 id="important-changes-title">تغییرهای مهم</h2></header>
      {changes.length ? (
        <div className="important-changes__list">
          {changes.map((item) => (
            <button
              aria-current={selectedKey === `change:${item.highlightId}` ? "true" : undefined}
              aria-label={`تغییر مهم: ${item.label}؛ بررسی`}
              key={item.highlightId}
              onClick={(event) => onOpen(item, event.currentTarget)}
              type="button"
            >
              <span className="important-change__heading">
                <strong>{item.label}</strong>
                <b className={`tone-${toneForKpiStatus(item.status)}`}>{toPersianNumber(item.trendText ?? "")}</b>
              </span>
              <span className="important-change__impact">{changeImpact(item.kpiKey)}</span>
              {(item.isExperimental || item.reliability !== "fresh") && (
                <small>{[item.isExperimental && "آزمایشی", item.reliability !== "fresh" && reliabilityText(item.reliability)].filter(Boolean).join(" · ")}</small>
              )}
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
      aria-label={`${signal.label}: ${toPersianNumber(signal.value ?? signal.dataStateLabel)}؛ بررسی`}
      className={`vital-slot vital-slot--${signal.signalId.replace("vital-", "")}${signal.signalId === "vital-data" ? " vital-slot--data" : ""}${placeholder ? " vital-slot--placeholder" : ""}${signal.isExperimental ? " vital-slot--experimental" : ""}${tone ? ` tone-${tone}` : ""}`}
      onClick={(event) => onOpen(signal, event.currentTarget)}
      title="بررسی سیگنال"
      type="button"
    >
      <span>{signal.label}</span>
      <strong>{toPersianNumber(signal.value ?? signal.dataStateLabel)}</strong>
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
  const workforceModule = findPrimaryCommandCenterModule(viewModel.modules, "workforce");
  const productionModule = findPrimaryCommandCenterModule(viewModel.modules, "production");
  const workforce = viewModel.kpiHighlights.find((item) => (
    item.moduleId === workforceModule?.moduleId && item.kpiKey === "workforce_schedule_coverage"
  ));
  const production = viewModel.kpiHighlights.find((item) => (
    item.moduleId === productionModule?.moduleId
    && (item.kpiKey === "production_plan_attainment" || item.kpiKey === "production_in_progress_orders")
  ));
  const openOrders = viewModel.kpiHighlights.find((item) => (
    item.moduleId === productionModule?.moduleId && item.kpiKey === "production_open_orders"
  ));
  const workOrderAttention = viewModel.topAttention.find((item) => item.sourceRef === "mock:production:work-order");
  const workOrderCount = viewModel.topAttention.filter((item) => item.sourceRef === "mock:production:work-order").length;
  const mockOrdersKnown = hasDisplayData(productionModule) && (!productionModule?.isPartialData || workOrderCount > 0);
  const ordersKnown = Boolean(openOrders) || mockOrdersKnown;
  const ordersValue = openOrders?.displayValue ?? (workOrderCount ? `${toPersianNumber(workOrderCount)} نمونه` : "بدون مورد");
  const productionIsExperimental = productionModule?.isExperimental ?? true;
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
      value: ordersKnown ? ordersValue : undefined,
      context: openOrders
        ? productionModule?.hasLastKnownGood
          ? "سفارش‌های باز · آخرین داده سالم"
          : productionModule?.isPartialData
            ? "سفارش‌های باز · داده ناقص"
            : "سفارش‌های باز"
        : productionModule?.hasLastKnownGood
          ? "آزمایشی · آخرین داده سالم"
          : productionModule?.isPartialData
            ? "آزمایشی · ناقص"
            : "آزمایشی · سفارش نمونه",
      ownerLabel: productionModule?.displayName ?? "مرکز تولید",
      dataStateLabel: ordersKnown ? (productionModule?.dataStateLabel ?? "نامشخص") : "نامشخص",
      reliability: productionModule?.reliability,
      observedAt: productionModule?.observedAt,
      destinationLabel: productionModule?.destinationLabel,
      destinationRef: productionModule?.detailRouteRef,
      isExperimental: productionIsExperimental,
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
      context: productionIsExperimental
        ? productionModule?.hasLastKnownGood
          ? "آزمایشی · آخرین داده سالم"
          : productionModule?.isPartialData
            ? "آزمایشی · ناقص"
            : "آزمایشی · دوره نامشخص"
        : productionModule?.hasLastKnownGood
          ? "آخرین داده سالم"
          : productionModule?.isPartialData
            ? "داده ناقص"
            : production.contextLabel,
    } : {
      signalId: "vital-production",
      label: "تولید",
      context: productionIsExperimental ? "آزمایشی · داده موجود نیست" : "داده تولید در دسترس نیست",
      ownerLabel: productionModule?.displayName ?? "مرکز تولید",
      dataStateLabel: productionModule?.dataStateLabel ?? "داده موجود نیست",
      reliability: productionModule?.reliability,
      observedAt: productionModule?.observedAt,
      destinationLabel: productionModule?.destinationLabel,
      destinationRef: productionModule?.detailRouteRef,
      isExperimental: productionIsExperimental,
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
    <section className="vital-strip" id="vital-signals" aria-label="نوار حیاتی کسب‌وکار">
      <header className="vital-mobile-heading">
        <span className="vital-mobile-heading__pulse" aria-hidden="true">⌁</span>
        <div>
          <h2>سیگنال‌های حیاتی</h2>
          <span>نمای کلی وضعیت کسب‌وکار</span>
        </div>
      </header>
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
