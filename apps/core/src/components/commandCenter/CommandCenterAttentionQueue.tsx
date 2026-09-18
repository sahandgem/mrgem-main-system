import { ArrowLeft, Clock3, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import type { CommandCenterViewModel } from "../../integration/commandCenter/commandCenterViewModel";
import { StatusBadge } from "../StatusBadge";
import {
  attentionPriorityLabel,
  confidenceLabel,
  formatDateTime,
  toPersianNumber,
  toneForAttention,
  toneForReliability,
} from "./presentation";

export function CommandCenterAttentionQueue({ viewModel }: { viewModel: CommandCenterViewModel }) {
  return (
    <section className="attention-section" aria-labelledby="attention-title">
      <div className="section-heading section-heading--attention">
        <div>
          <span className="section-kicker"><Sparkles aria-hidden="true" size={17} />اولویت تصمیم مدیر</span>
          <h3 id="attention-title">صف توجه</h3>
          <p>موضوع‌ها براساس اثر احتمالی بر کسب‌وکار مرتب شده‌اند؛ نه صرفاً شدت فنی.</p>
        </div>
        <span className="section-count">{toPersianNumber(viewModel.topAttention.length)} مورد</span>
      </div>

      {viewModel.topAttention.length ? (
        <div className="attention-list">
          {viewModel.topAttention.map((item, index) => {
            const tone = toneForAttention(item);
            return (
              <article className={`attention-item tone-${tone}`} key={item.attentionId}>
                <div className="attention-item__rank" aria-hidden="true">{toPersianNumber(index + 1)}</div>
                <div className="attention-item__content">
                  <div className="attention-item__title-row">
                    <div>
                      <span className="attention-item__module">{item.moduleName}</span>
                      <h4>{item.title}</h4>
                    </div>
                    <div className="attention-item__badges">
                      {item.isExperimental && <StatusBadge tone="focus">آزمایشی</StatusBadge>}
                      <StatusBadge tone={tone}>{attentionPriorityLabel(item.priorityTier)}</StatusBadge>
                    </div>
                  </div>
                  <p className="attention-item__summary">{item.summary}</p>
                  <dl className="attention-item__facts">
                    <div>
                      <dt>اثر احتمالی</dt>
                      <dd>{item.businessImpact}</dd>
                    </div>
                    <div>
                      <dt><Clock3 aria-hidden="true" size={14} />زمان مرتبط</dt>
                      <dd>{item.timeContext} · ثبت {formatDateTime(item.detectedAt)}</dd>
                    </div>
                    <div>
                      <dt><ShieldCheck aria-hidden="true" size={14} />اعتبار داده</dt>
                      <dd>
                        <StatusBadge tone={toneForReliability(item.reliability)}>{item.reliability === "fresh" ? "تازه" : item.reliability === "stale_last_known_good" ? "آخرین داده سالم" : "نیازمند احتیاط"}</StatusBadge>
                        <span>{confidenceLabel(item.confidence)}</span>
                      </dd>
                    </div>
                  </dl>
                  <div className="attention-item__footer">
                    <span><MapPin aria-hidden="true" size={15} />مقصد بررسی: {item.destinationLabel}</span>
                    {item.drillDownRef ? (
                      <a className="text-link" href={item.drillDownRef}>رفتن به خلاصه ماژول <ArrowLeft aria-hidden="true" size={15} /></a>
                    ) : (
                      <span className="muted-action">مسیر جزئیات هنوز تعریف نشده است</span>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="empty-state tone-good">
          <ShieldCheck aria-hidden="true" size={20} />
          <div><strong>صف توجه خالی است</strong><span>در داده موجود، موضوع نیازمند اقدام مدیر دیده نشده است.</span></div>
        </div>
      )}
    </section>
  );
}
