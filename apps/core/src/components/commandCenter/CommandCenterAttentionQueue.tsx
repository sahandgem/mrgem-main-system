import type {
  CommandCenterAttentionItem,
  CommandCenterViewModel,
} from "../../integration/commandCenter/commandCenterViewModel";
import { StatusBadge } from "../StatusBadge";
import {
  attentionPriorityLabel,
  confidenceLabel,
  formatDateTime,
  toPersianNumber,
  toneForAttention,
  toneForReliability,
} from "./presentation";

export function CommandCenterAttentionQueue({
  onOpen,
  viewModel,
}: {
  onOpen: (item: CommandCenterAttentionItem, trigger: HTMLButtonElement) => void;
  viewModel: CommandCenterViewModel;
}) {
  const visibleItems = viewModel.topAttention.slice(0, 5);

  return (
    <section className="attention-section" aria-labelledby="attention-title">
      <div className="attention-heading">
        <div>
          <span className="section-label">BUSINESS ATTENTION</span>
          <h3 id="attention-title">صف توجه</h3>
          <p>مرتب‌شده براساس اثر احتمالی بر کسب‌وکار، نه شدت فنی.</p>
        </div>
        <span className="section-count">{toPersianNumber(viewModel.topAttention.length)} مورد</span>
      </div>

      {visibleItems.length ? (
        <div className="attention-list">
          {visibleItems.map((item, index) => {
            const tone = toneForAttention(item);
            return (
              <article className={`attention-item tone-${tone}`} key={item.attentionId}>
                <div className="attention-item__rank" aria-hidden="true">{toPersianNumber(index + 1)}</div>
                <div className="attention-item__content">
                  <div className="attention-item__primary">
                    <span className="attention-item__module">{item.moduleName}</span>
                    <h4>{item.title}</h4>
                    <p>{item.businessImpact}</p>
                  </div>
                  <div className="attention-item__context">
                    <span>{item.timeContext} · {formatDateTime(item.detectedAt)}</span>
                    <span><StatusBadge tone={toneForReliability(item.reliability)}>{item.reliability === "fresh" ? "تازه" : item.reliability === "stale_last_known_good" ? "آخرین داده سالم" : "با احتیاط"}</StatusBadge> {confidenceLabel(item.confidence)}</span>
                  </div>
                  <div className="attention-item__action">
                    <span>{item.destinationLabel}</span>
                    <button onClick={(event) => onOpen(item, event.currentTarget)} type="button">بررسی</button>
                  </div>
                  <div className="attention-item__badges">
                    {item.isExperimental && <StatusBadge tone="focus">آزمایشی</StatusBadge>}
                    <StatusBadge tone={tone}>{attentionPriorityLabel(item.priorityTier)}</StatusBadge>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="empty-state tone-good">
          <div><strong>صف توجه خالی است</strong><span>در داده موجود، موضوع نیازمند اقدام مدیر دیده نشده است.</span></div>
        </div>
      )}
    </section>
  );
}
