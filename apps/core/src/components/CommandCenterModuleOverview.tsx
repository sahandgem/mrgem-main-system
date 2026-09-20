import { useCallback, useEffect, useRef, useState } from "react";
import {
  CommandCenterMockDataSource,
  type CommandCenterMockScenario,
} from "../integration/commandCenter/commandCenterMockDataSource";
import type {
  CommandCenterAttentionItem,
  CommandCenterKpiHighlight,
  CommandCenterModuleSummary,
  CommandCenterViewModel,
} from "../integration/commandCenter/commandCenterViewModel";
import { CockpitDrawerShell } from "./commandCenter/CockpitDrawerShell";
import { ProductionRail, WorkforceRail } from "./commandCenter/CockpitModuleRails";
import { ImportantChanges, VitalStrip } from "./commandCenter/CockpitSignals";
import { CockpitSystemBar } from "./commandCenter/CockpitSystemBar";
import { CockpitUpcomingCommitments } from "./commandCenter/CockpitUpcomingCommitments";
import { CommandCenterAttentionQueue } from "./commandCenter/CommandCenterAttentionQueue";
import { CommandCenterExecutiveSummary } from "./commandCenter/CommandCenterExecutiveSummary";
import {
  CommandCenterMockControls,
  type ScenarioOption,
} from "./commandCenter/CommandCenterMockControls";
import {
  drawerSelectionKey,
  reduceCockpitDrawer,
  relatedAttentionForKpi,
  signalFromHighlight,
  type CockpitDrawerSelection,
  type CockpitKpiSignal,
} from "./commandCenter/drawerModel";

const scenarioOptions: readonly ScenarioOption[] = [
  {
    key: "normal",
    label: "روز عادی",
    title: "داده تازه، بدون موضوع باز",
    description: "برای بررسی پوسته در روزی که موضوع مدیریتی فعالی وجود ندارد.",
    tone: "good",
  },
  {
    key: "healthy",
    label: "چند موضوع",
    title: "داده معتبر با چند موضوع مدیریتی",
    description: "دریافت فعلی موفق است و موضوع‌های کسب‌وکاری مستقل از سلامت داده نمایش داده می‌شوند.",
    tone: "warn",
  },
  {
    key: "stale",
    label: "قدیمی",
    title: "آخرین داده سالم، اما قدیمی",
    description: "داده معتبر باقی مانده، ولی از بازه تازگی عبور کرده و نباید جاری تلقی شود.",
    tone: "warn",
  },
  {
    key: "partial",
    label: "ناقص",
    title: "داده ناقص دریافت شده است",
    description: "فقط بخش‌های معتبر نمایش داده می‌شوند و تصمیم‌گیری باید با احتیاط انجام شود.",
    tone: "warn",
  },
  {
    key: "error",
    label: "خطای داده",
    title: "دریافت فعلی ناموفق است",
    description: "آخرین داده سالم فقط به‌عنوان مرجع تاریخی حفظ می‌شود و داده فعلی محسوب نمی‌شود.",
    tone: "critical",
  },
];

export function CommandCenterModuleOverview() {
  const dataSource = useRef<CommandCenterMockDataSource | null>(null);
  const refreshInFlight = useRef(false);
  const drawerTrigger = useRef<HTMLButtonElement | null>(null);
  const drawerTitleShowsFocus = useRef(false);
  const [viewModel, setViewModel] = useState<CommandCenterViewModel>();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string>();
  const [lastSuccessfulAt, setLastSuccessfulAt] = useState<string>();
  const [activeScenario, setActiveScenario] = useState<CommandCenterMockScenario>("healthy");
  const [drawerSelection, setDrawerSelection] = useState<CockpitDrawerSelection>();

  if (!dataSource.current) dataSource.current = new CommandCenterMockDataSource();

  const refresh = useCallback(async (scenario: CommandCenterMockScenario) => {
    if (refreshInFlight.current || !dataSource.current) return;
    refreshInFlight.current = true;
    setIsRefreshing(true);
    setRefreshError(undefined);
    try {
      dataSource.current.setScenario(scenario);
      const next = await dataSource.current.read();
      setViewModel(next);
      setLastSuccessfulAt(next.generatedAt);
      setDrawerSelection((current) => reduceCockpitDrawer(current, { type: "close" }));
      drawerTrigger.current = null;
    } catch {
      setRefreshError("به‌روزرسانی نمای مدیریتی انجام نشد. لطفاً دوباره تلاش کنید.");
    } finally {
      refreshInFlight.current = false;
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void refresh("healthy");
  }, [refresh]);

  const selectScenario = (next: CommandCenterMockScenario) => {
    setActiveScenario(next);
    void refresh(next);
  };

  const openDrawer = useCallback((selection: CockpitDrawerSelection, trigger: HTMLButtonElement) => {
    drawerTrigger.current = trigger;
    drawerTitleShowsFocus.current = trigger.matches(":focus-visible");
    setDrawerSelection((current) => reduceCockpitDrawer(current, { type: "open", selection }));
  }, []);

  const switchDrawer = useCallback((selection: CockpitDrawerSelection) => {
    drawerTitleShowsFocus.current = document.activeElement?.matches(":focus-visible") ?? false;
    setDrawerSelection((current) => reduceCockpitDrawer(current, { type: "open", selection }));
  }, []);

  const closeDrawer = useCallback(() => {
    const trigger = drawerTrigger.current;
    setDrawerSelection((current) => reduceCockpitDrawer(current, { type: "close" }));
    window.requestAnimationFrame(() => {
      if (trigger?.isConnected) trigger.focus();
      drawerTrigger.current = null;
    });
  }, []);

  if (!viewModel) {
    return (
      <main className="cockpit-loading" id="cockpit-main">
        <strong>در حال ساخت نمای مدیریتی از داده آزمایشی...</strong>
        {refreshError && <span role="alert">{refreshError}</span>}
      </main>
    );
  }

  const workforce = viewModel.modules.find((item) => item.moduleId === "workforce.demo");
  const production = viewModel.modules.find((item) => item.moduleId === "production.demo");
  const selectedKey = drawerSelection ? drawerSelectionKey(drawerSelection) : undefined;

  const openAttention = (item: CommandCenterAttentionItem, trigger: HTMLButtonElement) => {
    openDrawer({
      kind: "attention",
      item,
      module: viewModel.modules.find((module) => module.moduleId === item.moduleId),
      relatedKpi: viewModel.kpiHighlights.find((highlight) => (
        highlight.moduleId === item.moduleId && highlight.kpiKey === item.sourceRef
      )),
    }, trigger);
  };

  const openModule = (module: CommandCenterModuleSummary, trigger: HTMLButtonElement) => {
    const kpis = viewModel.kpiHighlights.filter((item) => item.moduleId === module.moduleId);
    openDrawer({
      kind: "module",
      module,
      kpis,
      attentions: viewModel.topAttention.filter((item) => item.moduleId === module.moduleId),
      latestChange: kpis.find((item) => item.status !== "normal" && item.trendText),
    }, trigger);
  };

  const openKpi = (highlight: CommandCenterKpiHighlight, trigger: HTMLButtonElement) => {
    openDrawer({
      kind: "kpi",
      signal: signalFromHighlight(
        highlight,
        viewModel.modules.find((module) => module.moduleId === highlight.moduleId),
        viewModel.topAttention,
      ),
    }, trigger);
  };

  const openSignal = (signal: CockpitKpiSignal, trigger: HTMLButtonElement) => {
    openDrawer({ kind: "kpi", signal }, trigger);
  };

  const openChange = (item: CommandCenterKpiHighlight, trigger: HTMLButtonElement) => {
    openDrawer({
      kind: "change",
      item,
      module: viewModel.modules.find((module) => module.moduleId === item.moduleId),
      relatedAttention: relatedAttentionForKpi(item, viewModel.topAttention),
    }, trigger);
  };

  return (
    <div className="command-center">
      <CockpitSystemBar
        isRefreshing={isRefreshing}
        lastSuccessfulAt={lastSuccessfulAt}
        onRefresh={() => void refresh(activeScenario)}
        viewModel={viewModel}
      />

      {refreshError && <div className="cockpit-system-message" role="alert">{refreshError} آخرین نمای موفق حفظ شده است.</div>}

      <main className="cockpit-stage" id="cockpit-main">
        <div className="cockpit-main-grid">
          <section className="command-core" aria-label="مرکز فرمان مدیریتی">
            <CommandCenterExecutiveSummary viewModel={viewModel} />
            <CommandCenterAttentionQueue
              onOpen={openAttention}
              selectedAttentionId={drawerSelection?.kind === "attention" ? drawerSelection.item.attentionId : undefined}
              viewModel={viewModel}
            />
            <CockpitUpcomingCommitments />
          </section>
          <WorkforceRail
            attentions={viewModel.topAttention}
            highlights={viewModel.kpiHighlights}
            module={workforce}
            onOpenAttention={openAttention}
            onOpenKpi={openKpi}
            onOpenModule={openModule}
            selectedKey={selectedKey}
          />
          <ProductionRail
            attentions={viewModel.topAttention}
            highlights={viewModel.kpiHighlights}
            module={production}
            onOpenAttention={openAttention}
            onOpenKpi={openKpi}
            onOpenModule={openModule}
            selectedKey={selectedKey}
          />
        </div>
        <ImportantChanges onOpen={openChange} selectedKey={selectedKey} viewModel={viewModel} />
        <VitalStrip onOpen={openSignal} selectedKey={selectedKey} viewModel={viewModel} />
      </main>

      <CockpitDrawerShell
        onClose={closeDrawer}
        onSelect={switchDrawer}
        selection={drawerSelection}
        showInitialFocusRing={drawerTitleShowsFocus.current}
      />
      <CommandCenterMockControls
        activeScenario={activeScenario}
        disabled={isRefreshing}
        onSelect={selectScenario}
        options={scenarioOptions}
      />
    </div>
  );
}
