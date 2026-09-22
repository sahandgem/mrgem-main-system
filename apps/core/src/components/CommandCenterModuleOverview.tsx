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
import { useCockpitViewport } from "./commandCenter/useCockpitViewport";
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

export function CommandCenterModuleOverview({ showDevScenarioControls = false }: { showDevScenarioControls?: boolean }) {
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
  const [showAllMobileAttention, setShowAllMobileAttention] = useState(false);
  const viewport = useCockpitViewport();

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
      setShowAllMobileAttention(false);
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
    const attentionId = trigger?.dataset.attentionId;
    setDrawerSelection((current) => reduceCockpitDrawer(current, { type: "close" }));
    window.requestAnimationFrame(() => {
      const focusTarget = trigger?.isConnected
        ? trigger
        : [...document.querySelectorAll<HTMLButtonElement>("button[data-attention-id]")]
          .find((button) => button.dataset.attentionId === attentionId);
      focusTarget?.focus();
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
  const mobileAttentionCount = viewport === "mobile" && !showAllMobileAttention
    ? Math.min(3, viewModel.topAttention.length)
    : viewModel.topAttention.length;
  const visibleAttentionIds = viewport === "mobile"
    ? viewModel.topAttention.slice(0, mobileAttentionCount).map((item) => item.attentionId)
    : [];

  const openAttention = (item: CommandCenterAttentionItem, trigger: HTMLButtonElement) => {
    if (trigger.classList.contains("command-row") && viewModel.topAttention.findIndex((candidate) => candidate.attentionId === item.attentionId) >= 3) {
      setShowAllMobileAttention(true);
    }
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

  const summary = <CommandCenterExecutiveSummary key="summary" viewModel={viewModel} />;
  const attention = (
    <CommandCenterAttentionQueue
      expanded={showAllMobileAttention}
      key="attention"
      onOpen={openAttention}
      onToggleExpanded={() => setShowAllMobileAttention((current) => !current)}
      selectedAttentionId={drawerSelection?.kind === "attention" ? drawerSelection.item.attentionId : undefined}
      viewModel={viewModel}
      viewport={viewport}
    />
  );
  const vital = <VitalStrip key="vital" onOpen={openSignal} selectedKey={selectedKey} viewModel={viewModel} />;
  const workforceRail = (
    <WorkforceRail
      attentions={viewModel.topAttention}
      compact={viewport !== "desktop"}
      excludedAttentionIds={visibleAttentionIds}
      highlights={viewModel.kpiHighlights}
      key="workforce"
      module={workforce}
      onOpenAttention={openAttention}
      onOpenKpi={openKpi}
      onOpenModule={openModule}
      selectedKey={selectedKey}
    />
  );
  const productionRail = (
    <ProductionRail
      attentions={viewModel.topAttention}
      compact={viewport !== "desktop"}
      excludedAttentionIds={visibleAttentionIds}
      highlights={viewModel.kpiHighlights}
      key="production"
      module={production}
      onOpenAttention={openAttention}
      onOpenKpi={openKpi}
      onOpenModule={openModule}
      selectedKey={selectedKey}
    />
  );
  const changes = <ImportantChanges key="changes" onOpen={openChange} selectedKey={selectedKey} viewModel={viewModel} />;
  const commitments = <CockpitUpcomingCommitments key="commitments" />;
  const content = viewport === "desktop"
    ? [summary, attention, commitments, workforceRail, productionRail, changes, vital]
    : [attention, vital, workforceRail, productionRail, changes, commitments];

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
        {content}
      </main>

      <CockpitDrawerShell
        onClose={closeDrawer}
        onSelect={switchDrawer}
        selection={drawerSelection}
        showInitialFocusRing={drawerTitleShowsFocus.current}
      />
      {showDevScenarioControls && <CommandCenterMockControls
        activeScenario={activeScenario}
        disabled={isRefreshing}
        onSelect={selectScenario}
        options={scenarioOptions}
      />}
    </div>
  );
}
