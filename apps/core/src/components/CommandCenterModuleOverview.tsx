import { useCallback, useEffect, useRef, useState } from "react";
import {
  CommandCenterMockDataSource,
  type CommandCenterMockScenario,
} from "../integration/commandCenter/commandCenterMockDataSource";
import type {
  CommandCenterAttentionItem,
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

const scenarioOptions: readonly ScenarioOption[] = [
  {
    key: "normal",
    label: "روز عادی",
    title: "داده تازه، بدون موضوع باز",
    description: "برای بررسی پوسته در روزی که Attention مدیریتی فعالی وجود ندارد.",
    tone: "good",
  },
  {
    key: "healthy",
    label: "چند Attention",
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
    label: "خطای دریافت",
    title: "دریافت فعلی ناموفق است",
    description: "آخرین داده سالم فقط به‌عنوان مرجع تاریخی حفظ می‌شود و داده فعلی محسوب نمی‌شود.",
    tone: "critical",
  },
];

export function CommandCenterModuleOverview() {
  const dataSource = useRef<CommandCenterMockDataSource | null>(null);
  const refreshInFlight = useRef(false);
  const drawerTrigger = useRef<HTMLButtonElement | null>(null);
  const [viewModel, setViewModel] = useState<CommandCenterViewModel>();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string>();
  const [lastSuccessfulAt, setLastSuccessfulAt] = useState<string>();
  const [activeScenario, setActiveScenario] = useState<CommandCenterMockScenario>("healthy");
  const [selectedAttention, setSelectedAttention] = useState<CommandCenterAttentionItem>();

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
      setSelectedAttention(undefined);
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

  const openDrawer = useCallback((item: CommandCenterAttentionItem, trigger: HTMLButtonElement) => {
    drawerTrigger.current = trigger;
    setSelectedAttention(item);
  }, []);

  const closeDrawer = useCallback(() => {
    setSelectedAttention(undefined);
    window.requestAnimationFrame(() => drawerTrigger.current?.focus());
  }, []);

  if (!viewModel) {
    return (
      <main className="cockpit-loading" id="cockpit-main">
        <strong>در حال ساخت نمای مدیریتی از داده mock...</strong>
        {refreshError && <span role="alert">{refreshError}</span>}
      </main>
    );
  }

  const workforce = viewModel.modules.find((item) => item.moduleId === "workforce.demo");
  const production = viewModel.modules.find((item) => item.moduleId === "production.demo");

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
          <WorkforceRail attentions={viewModel.topAttention} highlights={viewModel.kpiHighlights} module={workforce} />
          <section className="command-core" aria-label="مرکز فرمان مدیریتی">
            <CommandCenterExecutiveSummary viewModel={viewModel} />
            <CommandCenterAttentionQueue onOpen={openDrawer} viewModel={viewModel} />
            <CockpitUpcomingCommitments />
          </section>
          <ProductionRail attentions={viewModel.topAttention} highlights={viewModel.kpiHighlights} module={production} />
        </div>
        <ImportantChanges viewModel={viewModel} />
        <VitalStrip viewModel={viewModel} />
      </main>

      <CockpitDrawerShell item={selectedAttention} onClose={closeDrawer} />
      <CommandCenterMockControls
        activeScenario={activeScenario}
        disabled={isRefreshing}
        onSelect={selectScenario}
        options={scenarioOptions}
      />
    </div>
  );
}
