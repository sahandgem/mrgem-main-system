import type { CommandCenterViewModel } from "../../integration/commandCenter/commandCenterViewModel";
import { StatusBadge } from "../StatusBadge";
import {
  formatDateTime,
  overallStateLabel,
  toPersianNumber,
  toneForOverallState,
} from "./presentation";

function dataTrust(viewModel: CommandCenterViewModel) {
  if (viewModel.reliability.failedModuleCount) return { label: "دریافت ناموفق", tone: "critical" as const };
  if (viewModel.reliability.hasPartialData) return { label: "داده ناقص", tone: "warn" as const };
  if (viewModel.managementSummary.staleModuleCount) return { label: "داده قدیمی", tone: "warn" as const };
  return { label: "تازه و معتبر", tone: "good" as const };
}

export function CockpitSystemBar({
  isRefreshing,
  lastSuccessfulAt,
  onRefresh,
  viewModel,
}: {
  isRefreshing: boolean;
  lastSuccessfulAt?: string;
  onRefresh: () => void;
  viewModel: CommandCenterViewModel;
}) {
  const trust = dataTrust(viewModel);

  return (
    <header className="cockpit-system-bar">
      <div className="cockpit-brand" aria-label="Master Gem Core">
        <strong>MASTER GEM</strong>
        <span>CORE</span>
        <StatusBadge tone="focus">MOCK</StatusBadge>
      </div>
      <dl className="cockpit-system-facts">
        <div>
          <dt>وضعیت کلی</dt>
          <dd><StatusBadge tone={toneForOverallState(viewModel.overallState)}>{overallStateLabel(viewModel.overallState)}</StatusBadge></dd>
        </div>
        <div>
          <dt>آخرین دریافت</dt>
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
      <button className="system-refresh" disabled={isRefreshing} onClick={onRefresh} type="button">
        {isRefreshing ? "در حال دریافت" : "به‌روزرسانی"}
      </button>
    </header>
  );
}
