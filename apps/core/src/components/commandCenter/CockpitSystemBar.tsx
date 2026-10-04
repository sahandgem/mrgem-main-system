import { RefreshCw } from "lucide-react";
import type { CommandCenterViewModel } from "../../integration/commandCenter/commandCenterViewModel";
import { StatusBadge } from "../StatusBadge";
import {
  formatDateTime,
  overallStateLabel,
  toPersianNumber,
  toneForOverallState,
} from "./presentation";

function dataTrust(viewModel: CommandCenterViewModel) {
  if (viewModel.reliability.failedModuleCount) return { label: "خطای داده", tone: "critical" as const };
  if (viewModel.reliability.hasPartialData) return { label: "داده ناقص", tone: "warn" as const };
  if (viewModel.managementSummary.staleModuleCount) return { label: "داده قدیمی", tone: "warn" as const };
  return { label: "تازه و معتبر", tone: "good" as const };
}

export function CockpitSystemBar({
  accountingAvailable = false,
  accountingConnected = false,
  isConnectingAccounting = false,
  isRefreshing,
  lastSuccessfulAt,
  onConnectAccounting,
  onRefresh,
  viewModel,
}: {
  accountingAvailable?: boolean;
  accountingConnected?: boolean;
  isConnectingAccounting?: boolean;
  isRefreshing: boolean;
  lastSuccessfulAt?: string;
  onConnectAccounting?: () => void;
  onRefresh: () => void;
  viewModel: CommandCenterViewModel;
}) {
  const trust = dataTrust(viewModel);

  return (
    <header className="cockpit-system-bar">
      <div className="cockpit-brand" aria-label="Master Gem Core">
        <strong>MASTER GEM</strong>
        <span>CORE</span>
      </div>
      <dl className="cockpit-system-facts">
        <div>
          <dt>وضعیت کلی</dt>
          <dd><StatusBadge tone={toneForOverallState(viewModel.overallState)}>{overallStateLabel(viewModel.overallState)}</StatusBadge></dd>
        </div>
        <div>
          <dt>آخرین دریافت موفق</dt>
          <dd>{formatDateTime(lastSuccessfulAt)}</dd>
        </div>
        <div>
          <dt>اعتماد داده</dt>
          <dd><StatusBadge tone={trust.tone}>{trust.label}</StatusBadge></dd>
        </div>
        <div>
          <dt>نیازمند توجه</dt>
          <dd><strong>{toPersianNumber(viewModel.topAttention.length)}</strong> مورد</dd>
        </div>
      </dl>
      <div className="system-actions">
        {accountingAvailable && (
          accountingConnected
            ? <StatusBadge tone="good">حسابداری متصل</StatusBadge>
            : <button
                className="system-refresh"
                disabled={isConnectingAccounting}
                onClick={onConnectAccounting}
                type="button"
              >
                {isConnectingAccounting ? "در حال اتصال" : "اتصال حسابداری"}
              </button>
        )}
        <button className="system-refresh" disabled={isRefreshing} onClick={onRefresh} type="button">
          <RefreshCw aria-hidden="true" size={14} strokeWidth={1.5} />
          {isRefreshing ? "در حال دریافت" : "به‌روزرسانی"}
        </button>
      </div>
    </header>
  );
}
