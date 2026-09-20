import type { CommandCenterViewModel } from "../../integration/commandCenter/commandCenterViewModel";
import {
  overallStateLabel,
  toPersianNumber,
} from "./presentation";

import { attentionSummary } from "./density";

export function CommandCenterExecutiveSummary({ viewModel }: { viewModel: CommandCenterViewModel }) {
  const { managementSummary, reliability } = viewModel;
  const dataTrustTone = reliability.failedModuleCount
    ? "critical"
    : reliability.hasPartialData || managementSummary.staleModuleCount
      ? "warn"
      : "good";
  const dataTrustLabel = reliability.failedModuleCount
    ? "خطای داده؛ دریافت فعلی قابل اتکا نیست"
    : reliability.hasPartialData
      ? "داده ناقص است"
      : managementSummary.staleModuleCount
        ? "داده قدیمی است"
        : "داده تازه و معتبر است";

  return (
    <section className="status-summary" aria-labelledby="executive-summary-title">
      <div className="status-summary__business">
        <div className="section-label">وضعیت کسب‌وکار</div>
        <div className="status-summary__headline">
          <div>
            <h3 id="executive-summary-title">{overallStateLabel(viewModel.overallState)}</h3>
            <p>
              {managementSummary.criticalAttentionCount
                ? `${toPersianNumber(managementSummary.criticalAttentionCount)} موضوع مهم · ${attentionSummary(viewModel.topAttention[0]).title}`
                : managementSummary.warningAttentionCount
                  ? `${toPersianNumber(managementSummary.warningAttentionCount)} موضوع برای پیگیری`
                  : "در داده موجود موضوع مهمی دیده نشد."}
            </p>
          </div>
        </div>
      </div>

      <aside className={`status-summary__data tone-${dataTrustTone}`} aria-label="اعتمادپذیری داده">
        <div className="section-label">اعتماد به داده</div>
        <strong>{dataTrustLabel}</strong>
        <p>
          {reliability.failedModuleCount
            ? `داده فعلی در دسترس نیست؛ ${toPersianNumber(viewModel.modules.filter((item) => item.hasLastKnownGood).length)} مرجع تاریخی`
            : reliability.hasPartialData ? "فقط در محدوده داده معتبر" : managementSummary.staleModuleCount ? "مرجع تاریخی؛ نه داده جاری" : ""}
        </p>
      </aside>
    </section>
  );
}
