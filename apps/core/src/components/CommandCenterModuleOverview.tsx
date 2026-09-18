import { AlertTriangle, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  CommandCenterMockDataSource,
  type CommandCenterMockScenario,
} from "../integration/commandCenter/commandCenterMockDataSource";
import type { CommandCenterViewModel } from "../integration/commandCenter/commandCenterViewModel";
import { StatusBadge } from "./StatusBadge";
import { CommandCenterAttentionQueue } from "./commandCenter/CommandCenterAttentionQueue";
import { CommandCenterExecutiveSummary } from "./commandCenter/CommandCenterExecutiveSummary";
import { CommandCenterKpiOverview } from "./commandCenter/CommandCenterKpiOverview";
import {
  CommandCenterModuleEntry,
  CommandCenterModuleHealth,
} from "./commandCenter/CommandCenterModulePanels";
import {
  CommandCenterMockControls,
  type ScenarioOption,
} from "./commandCenter/CommandCenterMockControls";
import { formatDateTime } from "./commandCenter/presentation";

const scenarioOptions: readonly ScenarioOption[] = [
  {
    key: "healthy",
    label: "سالم",
    title: "داده معتبر و تازه",
    description: "دریافت فعلی موفق است؛ موضوع‌های کسب‌وکاری مستقل از سلامت داده نمایش داده می‌شوند.",
    tone: "good",
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
  const [viewModel, setViewModel] = useState<CommandCenterViewModel>();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string>();
  const [lastSuccessfulAt, setLastSuccessfulAt] = useState<string>();
  const [activeScenario, setActiveScenario] = useState<CommandCenterMockScenario>("healthy");

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

  return (
    <section className="command-center" aria-labelledby="command-center-title">
      <header className="command-center__header">
        <div>
          <span className="eyebrow">COMMAND CENTER / V1</span>
          <h2 id="command-center-title">تصویر مدیریتی مستر جم</h2>
          <p>آنچه اکنون نیازمند فهم، توجه یا اقدام مدیر است.</p>
        </div>
        <div className="command-center__actions">
          <StatusBadge tone="focus">DEMO / MOCK</StatusBadge>
          <span>آخرین دریافت: {formatDateTime(lastSuccessfulAt)}</span>
          <button className="ghost-button" disabled={isRefreshing} onClick={() => void refresh(activeScenario)} type="button">
            <RefreshCw aria-hidden="true" className={isRefreshing ? "is-spinning" : undefined} size={17} />
            {isRefreshing ? "در حال دریافت" : "به‌روزرسانی"}
          </button>
        </div>
      </header>

      {refreshError && (
        <div className="system-message tone-critical" role="alert">
          <AlertTriangle aria-hidden="true" size={18} />
          <div><strong>به‌روزرسانی ناموفق بود</strong><span>{refreshError} {viewModel ? "آخرین نمای موفق حفظ شده است." : "داده‌ای برای نمایش موجود نیست."}</span></div>
        </div>
      )}

      {!viewModel && isRefreshing && (
        <div className="system-message" role="status" aria-live="polite">
          <RefreshCw aria-hidden="true" className="is-spinning" size={18} />
          <span>در حال ساخت نمای مدیریتی از داده mock...</span>
        </div>
      )}

      {viewModel && (
        <>
          <CommandCenterExecutiveSummary viewModel={viewModel} />
          <CommandCenterAttentionQueue viewModel={viewModel} />
          <CommandCenterKpiOverview highlights={viewModel.kpiHighlights} />
          <CommandCenterModuleHealth modules={viewModel.modules} />
          <CommandCenterModuleEntry modules={viewModel.modules} />
        </>
      )}

      <CommandCenterMockControls
        activeScenario={activeScenario}
        disabled={isRefreshing}
        onSelect={selectScenario}
        options={scenarioOptions}
      />
    </section>
  );
}
