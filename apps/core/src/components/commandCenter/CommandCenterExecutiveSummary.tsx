import { Activity, AlertTriangle, DatabaseZap, ShieldCheck } from "lucide-react";
import type { CommandCenterViewModel } from "../../integration/commandCenter/commandCenterViewModel";
import { StatusBadge } from "../StatusBadge";
import {
  overallStateLabel,
  toPersianNumber,
  toneForOverallState,
} from "./presentation";

export function CommandCenterExecutiveSummary({ viewModel }: { viewModel: CommandCenterViewModel }) {
  const { managementSummary, reliability } = viewModel;
  const dataTrustTone = reliability.failedModuleCount
    ? "critical"
    : reliability.hasPartialData || managementSummary.staleModuleCount
      ? "warn"
      : "good";
  const dataTrustLabel = reliability.failedModuleCount
    ? "دریافت فعلی قابل اتکا نیست"
    : reliability.hasPartialData
      ? "تصویر داده ناقص است"
      : managementSummary.staleModuleCount
        ? "آخرین داده معتبر، قدیمی است"
        : "داده تازه و قابل اتکاست";

  return (
    <section className="executive-summary" aria-labelledby="executive-summary-title">
      <div className="executive-summary__business">
        <div className="section-kicker"><Activity aria-hidden="true" size={17} />وضعیت کلی کسب‌وکار</div>
        <div className="executive-summary__headline">
          <div>
            <h3 id="executive-summary-title">{overallStateLabel(viewModel.overallState)}</h3>
            <p>
              {managementSummary.criticalAttentionCount
                ? `${toPersianNumber(managementSummary.criticalAttentionCount)} موضوع با اثر مهم در صف بررسی قرار دارد.`
                : managementSummary.warningAttentionCount
                  ? `${toPersianNumber(managementSummary.warningAttentionCount)} موضوع برای پیگیری مدیر دیده شده است.`
                  : "در داده موجود، موضوع مهمی برای اقدام مدیر دیده نشده است."}
            </p>
          </div>
          <StatusBadge tone={toneForOverallState(viewModel.overallState)}>
            {overallStateLabel(viewModel.overallState)}
          </StatusBadge>
        </div>
        <div className="executive-summary__metrics" aria-label="خلاصه توجه مدیریتی">
          <span><strong>{toPersianNumber(viewModel.topAttention.length)}</strong> موضوع در صف توجه</span>
          <span><strong>{toPersianNumber(managementSummary.enabledModuleCount)}</strong> ماژول در نمای فعلی</span>
          <span><strong>{toPersianNumber(viewModel.kpiHighlights.length)}</strong> شاخص قابل مشاهده</span>
        </div>
      </div>

      <aside className={`data-trust-panel tone-${dataTrustTone}`} aria-label="اعتمادپذیری داده">
        <div className="section-kicker"><DatabaseZap aria-hidden="true" size={17} />اعتمادپذیری داده</div>
        <div className="data-trust-panel__state">
          {dataTrustTone === "good"
            ? <ShieldCheck aria-hidden="true" size={24} />
            : <AlertTriangle aria-hidden="true" size={24} />}
          <strong>{dataTrustLabel}</strong>
        </div>
        <p>این وضعیت فقط کیفیت و تازگی ورودی را توضیح می‌دهد و با اهمیت کسب‌وکاری هشدارها یکی نیست.</p>
        <div className="data-trust-panel__counts">
          <span>کامل <strong>{toPersianNumber(reliability.completeModuleCount)}</strong></span>
          <span>ناقص <strong>{toPersianNumber(reliability.partialModuleCount)}</strong></span>
          <span>ناموفق <strong>{toPersianNumber(reliability.failedModuleCount)}</strong></span>
        </div>
      </aside>
    </section>
  );
}
