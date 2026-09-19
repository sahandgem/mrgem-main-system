import type { CommandCenterViewModel } from "../../integration/commandCenter/commandCenterViewModel";
import {
  overallStateLabel,
  toPersianNumber,
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
    <section className="status-summary" aria-labelledby="executive-summary-title">
      <div className="status-summary__business">
        <div className="section-label">وضعیت کسب‌وکار</div>
        <div className="status-summary__headline">
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
        </div>
        <div className="status-summary__metrics" aria-label="خلاصه توجه مدیریتی">
          <span><strong>{toPersianNumber(viewModel.topAttention.length)}</strong> موضوع در صف توجه</span>
          <span><strong>{toPersianNumber(managementSummary.enabledModuleCount)}</strong> ماژول فعال</span>
        </div>
      </div>

      <aside className={`status-summary__data tone-${dataTrustTone}`} aria-label="اعتمادپذیری داده">
        <div className="section-label">اعتماد به داده</div>
        <strong>{dataTrustLabel}</strong>
        <p>
          {reliability.failedModuleCount
            ? `دریافت فعلی ناموفق است؛ ${toPersianNumber(viewModel.modules.filter((item) => item.hasLastKnownGood).length)} مرجع «آخرین داده سالم» فقط برای مقایسه تاریخی حفظ شده است.`
            : "سلامت داده مستقل از اولویت کسب‌وکاری نمایش داده می‌شود."}
        </p>
        <div className="status-summary__data-counts">
          <span>کامل <b>{toPersianNumber(reliability.completeModuleCount)}</b></span>
          <span>ناقص <b>{toPersianNumber(reliability.partialModuleCount)}</b></span>
          <span>ناموفق <b>{toPersianNumber(reliability.failedModuleCount)}</b></span>
        </div>
      </aside>
    </section>
  );
}
