import { Gem, RefreshCw } from "lucide-react";
import type { CommandCenterViewModel } from "../../integration/commandCenter/commandCenterViewModel";
import { StatusBadge } from "../StatusBadge";
import { resolveCockpitDataTrust } from "./cockpitDataTrust";
import {
  formatDateTime,
  overallStateLabel,
  toPersianNumber,
  toneForOverallState,
} from "./presentation";

export function CockpitSystemBar({
  accountingAvailable = false,
  accountingConnected = false,
  isConnectingAccounting = false,
  isRefreshing,
  isHistorical,
  lastSuccessfulAt,
  onConnectAccounting,
  onDisconnectAccounting,
  onRefresh,
  viewModel,
}: {
  accountingAvailable?: boolean;
  accountingConnected?: boolean;
  isConnectingAccounting?: boolean;
  isRefreshing: boolean;
  isHistorical?: boolean;
  lastSuccessfulAt?: string;
  onConnectAccounting?: () => void;
  onDisconnectAccounting?: () => void;
  onRefresh: () => void;
  viewModel: CommandCenterViewModel;
}) {
  const trust = resolveCockpitDataTrust(viewModel, isHistorical);

  return (
    <header className="cockpit-system-bar">
      <div className="cockpit-top-nav">
        <div className="cockpit-brand" aria-label="Master Gem Core">
          <span className="cockpit-brand__mark" aria-hidden="true"><Gem size={18} strokeWidth={1.7} /></span>
          <span className="cockpit-brand__copy">
            <strong>MASTER GEM</strong>
            <span>مرکز فرمان هسته</span>
          </span>
        </div>

        <nav className="cockpit-nav-links" aria-label="ناوبری مرکز فرمان">
          <a aria-current="page" href="#attention-title">مرکز فرمان</a>
          <a href="#module-workforce-demo">نیروی انسانی</a>
          <a href="#module-production-demo">تولید</a>
          <a href="#vital-signals">سیگنال‌های حیاتی</a>
        </nav>

        <div className="cockpit-top-actions">
          <span className="cockpit-last-sync">
            <span>آخرین دریافت</span>
            <strong>{formatDateTime(lastSuccessfulAt)}</strong>
          </span>
          {accountingAvailable && (
            accountingConnected
              ? <div className="system-actions"><StatusBadge tone="good">حسابداری متصل</StatusBadge><button className="system-refresh" type="button" onClick={onDisconnectAccounting} disabled={isRefreshing}>قطع ارتباط</button></div>
              : <button
                  className="system-refresh"
                  type="button"
                  aria-label="اتصال فقط‌خواندنی حسابداری"
                  aria-busy={isConnectingAccounting}
                  disabled={isConnectingAccounting || isRefreshing || isHistorical}
                  onClick={onConnectAccounting}
                >
                  {isConnectingAccounting ? "در حال اتصال" : "اتصال حسابداری"}
                </button>
          )}
          <button className="system-refresh" disabled={isRefreshing} onClick={onRefresh} type="button">
            <RefreshCw aria-hidden="true" size={15} strokeWidth={1.7} />
            <span>{isRefreshing ? "در حال دریافت" : "به‌روزرسانی"}</span>
          </button>
        </div>
      </div>

      <dl className="cockpit-status-strip">
        <div>
          <dt>وضعیت کسب‌وکار</dt>
          <dd><StatusBadge tone={toneForOverallState(viewModel.overallState)}>{overallStateLabel(viewModel.overallState)}</StatusBadge></dd>
        </div>
        <div>
          <dt>اعتماد داده</dt>
          <dd><StatusBadge tone={trust.tone}>{trust.label}</StatusBadge></dd>
        </div>
        <div>
          <dt>نیازمند توجه</dt>
          <dd><strong>{toPersianNumber(viewModel.topAttention.length)}</strong> مورد</dd>
        </div>
        <div>
          <dt>فوری</dt>
          <dd><strong>{toPersianNumber(viewModel.managementSummary.criticalAttentionCount)}</strong> مورد</dd>
        </div>
      </dl>
    </header>
  );
}
