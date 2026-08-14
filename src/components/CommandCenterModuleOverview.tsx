import { AlertTriangle, BarChart3, RefreshCw, ServerCog, ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { StatusTone } from "../models/workforce";
import { CommandCenterMockDataSource } from "../integration/commandCenter/commandCenterMockDataSource";
import {
  commandCenterReliabilityLabel,
  type CommandCenterAttentionItem,
  type CommandCenterModuleSummary,
  type CommandCenterReliabilityState,
  type CommandCenterViewModel,
} from "../integration/commandCenter/commandCenterViewModel";
import { StatusBadge } from "./StatusBadge";

function toPersianNumber(value: number | string) {
  return String(value).replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);
}

function toneForReliability(reliability: CommandCenterReliabilityState): StatusTone {
  if (reliability === "fresh") return "good";
  if (reliability === "degraded" || reliability === "stale_last_known_good") return "warn";
  if (reliability === "unavailable" || reliability === "invalid" || reliability === "unsupported_version") {
    return "critical";
  }
  if (reliability === "disabled") return "empty";
  return "info";
}

function toneForAttention(item: CommandCenterAttentionItem): StatusTone {
  if (item.severity === "critical") return "critical";
  if (item.severity === "warning") return "warn";
  return "info";
}

function confidenceLabel(value: CommandCenterAttentionItem["confidence"]) {
  if (value === "high") return "اطمینان بالا";
  if (value === "medium") return "اطمینان متوسط";
  if (value === "low") return "اطمینان پایین";
  return "اطمینان نامشخص";
}

function formatRefreshTime(value?: string) {
  if (!value) return "هنوز اجرا نشده";
  return new Date(value).toLocaleString("fa-IR", { dateStyle: "short", timeStyle: "short" });
}

function ModuleRow({ module }: { module: CommandCenterModuleSummary }) {
  return (
    <article className="command-center-row">
      <div className="command-center-row-head">
        <div>
          <strong>{module.displayName}</strong>
          <small>{module.moduleId}</small>
        </div>
        <StatusBadge tone={toneForReliability(module.reliability)}>{module.reliabilityLabel}</StatusBadge>
      </div>
      <p>{module.summaryText}</p>
      <div className="command-center-meta">
        <span>وضعیت قرارداد: {module.status}</span>
        <span>هشدار باز: {toPersianNumber(module.alertCounts.critical + module.alertCounts.warning)}</span>
        <span>KPI مهم: {toPersianNumber(module.highlightedKpiCount)}</span>
      </div>
    </article>
  );
}

export function CommandCenterModuleOverview() {
  const dataSource = useRef<CommandCenterMockDataSource | null>(null);
  const refreshInFlight = useRef(false);
  const [viewModel, setViewModel] = useState<CommandCenterViewModel>();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string>();
  const [lastSuccessfulAt, setLastSuccessfulAt] = useState<string>();

  if (!dataSource.current) dataSource.current = new CommandCenterMockDataSource();

  const refresh = useCallback(async () => {
    if (refreshInFlight.current || !dataSource.current) return;
    refreshInFlight.current = true;
    setIsRefreshing(true);
    setRefreshError(undefined);
    try {
      const next = await dataSource.current.read();
      setViewModel(next);
      setLastSuccessfulAt(next.generatedAt);
    } catch (error) {
      setRefreshError(error instanceof Error ? error.message : "به‌روزرسانی نمای مرکز فرمان ناموفق بود.");
    } finally {
      refreshInFlight.current = false;
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const summary = viewModel?.managementSummary;

  return (
    <section className="command-center-section" aria-labelledby="command-center-title">
      <div className="command-center-header">
        <div className="command-center-heading">
          <span className="eyebrow">V2 Command Center</span>
          <h2 id="command-center-title">دید مدیریتی ماژول‌ها</h2>
          <p>نمای فقط‌خواندنی از backbone یکپارچه‌سازی؛ بدون اتصال به سامانه واقعی</p>
        </div>
        <div className="command-center-actions">
          <StatusBadge tone="focus">DEMO / MOCK</StatusBadge>
          <span className="command-center-refresh-time">آخرین دریافت: {formatRefreshTime(lastSuccessfulAt)}</span>
          <button className="ghost-button" disabled={isRefreshing} onClick={() => void refresh()} type="button">
            <RefreshCw aria-hidden="true" className={isRefreshing ? "is-spinning" : undefined} size={17} />
            {isRefreshing ? "در حال دریافت" : "به‌روزرسانی دستی"}
          </button>
        </div>
      </div>

      {refreshError && (
        <div className="command-center-message tone-critical" role="alert">
          <AlertTriangle aria-hidden="true" size={18} />
          <div>
            <strong>به‌روزرسانی ناموفق بود</strong>
            <span>{refreshError} {viewModel ? "آخرین نمای موفق حفظ شده است." : "داده‌ای برای نمایش موجود نیست."}</span>
          </div>
        </div>
      )}

      {!viewModel && isRefreshing && (
        <div className="command-center-message" role="status" aria-live="polite">
          <RefreshCw aria-hidden="true" className="is-spinning" size={18} />
          <span>در حال ساخت نمای مدیریتی از داده mock...</span>
        </div>
      )}

      {viewModel && summary && (
        <>
          <div className="command-center-summary" aria-label="خلاصه مدیریتی ماژول‌ها">
            <div>
              <ServerCog aria-hidden="true" size={18} />
              <span>ماژول فعال</span>
              <strong>{toPersianNumber(summary.enabledModuleCount)}</strong>
            </div>
            <div>
              <ShieldCheck aria-hidden="true" size={18} />
              <span>سالم و تازه</span>
              <strong>{toPersianNumber(summary.healthyModuleCount)}</strong>
            </div>
            <div>
              <AlertTriangle aria-hidden="true" size={18} />
              <span>نیازمند توجه</span>
              <strong>{toPersianNumber(summary.attentionModuleCount)}</strong>
            </div>
            <div>
              <BarChart3 aria-hidden="true" size={18} />
              <span>KPI مهم</span>
              <strong>{toPersianNumber(viewModel.kpiHighlights.length)}</strong>
            </div>
          </div>

          <div className="command-center-zones">
            <section className="command-center-zone" aria-labelledby="command-center-attention-title">
              <div className="command-center-zone-head">
                <h3 id="command-center-attention-title">نیازمند توجه</h3>
                <StatusBadge tone={summary.criticalAttentionCount ? "critical" : summary.warningAttentionCount ? "warn" : "good"}>
                  {toPersianNumber(summary.criticalAttentionCount + summary.warningAttentionCount)} مورد
                </StatusBadge>
              </div>
              <div className="command-center-list">
                {viewModel.topAttention.map((item) => (
                  <article className={`command-center-row tone-${toneForAttention(item)}`} key={item.attentionId}>
                    <div className="command-center-row-head">
                      <strong>{item.title}</strong>
                      <StatusBadge tone={toneForAttention(item)}>
                        {item.severity === "critical" ? "بحرانی" : item.severity === "warning" ? "هشدار" : "اطلاع"}
                      </StatusBadge>
                    </div>
                    <p>{item.summary}</p>
                    <div className="command-center-meta">
                      <span>{item.moduleName}</span>
                      <span>{commandCenterReliabilityLabel(item.reliability)}</span>
                      <span>{confidenceLabel(item.confidence)}</span>
                    </div>
                    {item.suggestedNextStep && <small>پیشنهاد بررسی: {item.suggestedNextStep}</small>}
                  </article>
                ))}
                {!viewModel.topAttention.length && (
                  <div className="command-center-empty tone-good">
                    <ShieldCheck aria-hidden="true" size={18} />
                    <span>مورد مهمی برای توجه وجود ندارد.</span>
                  </div>
                )}
              </div>
            </section>

            <section className="command-center-zone" aria-labelledby="command-center-modules-title">
              <div className="command-center-zone-head">
                <h3 id="command-center-modules-title">سلامت ماژول‌ها</h3>
                <StatusBadge tone={viewModel.reliability.hasPartialData ? "warn" : "good"}>
                  {viewModel.reliability.hasPartialData ? "داده جزئی" : "داده کامل"}
                </StatusBadge>
              </div>
              <div className="command-center-list">
                {viewModel.modules.map((module) => <ModuleRow key={module.moduleId} module={module} />)}
                {!viewModel.modules.length && (
                  <div className="command-center-empty tone-info">هیچ ماژولی در registry وجود ندارد.</div>
                )}
              </div>
            </section>

            <section className="command-center-zone" aria-labelledby="command-center-kpis-title">
              <div className="command-center-zone-head">
                <h3 id="command-center-kpis-title">KPIهای مهم</h3>
                <StatusBadge tone={viewModel.kpiHighlights.some((item) => item.status === "critical") ? "critical" : viewModel.kpiHighlights.length ? "warn" : "good"}>
                  {toPersianNumber(viewModel.kpiHighlights.length)} شاخص
                </StatusBadge>
              </div>
              <div className="command-center-list">
                {viewModel.kpiHighlights.slice(0, 6).map((item) => (
                  <article className={`command-center-row tone-${item.status === "critical" ? "critical" : "warn"}`} key={item.highlightId}>
                    <div className="command-center-row-head">
                      <div>
                        <strong>{item.label}</strong>
                        <small>{item.moduleName}</small>
                      </div>
                      <strong className="command-center-kpi-value">{toPersianNumber(item.displayValue)}</strong>
                    </div>
                    <p>{item.explanation}</p>
                    <StatusBadge tone={toneForReliability(item.reliability)}>{item.reliabilityLabel}</StatusBadge>
                  </article>
                ))}
                {!viewModel.kpiHighlights.length && (
                  <div className="command-center-empty tone-good">
                    <BarChart3 aria-hidden="true" size={18} />
                    <span>KPI بحرانی یا هشدار برای نمایش وجود ندارد.</span>
                  </div>
                )}
              </div>
            </section>
          </div>
        </>
      )}
    </section>
  );
}
