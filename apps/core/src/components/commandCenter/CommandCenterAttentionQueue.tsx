import type { CommandCenterAttentionItem, CommandCenterViewModel } from "../../integration/commandCenter/commandCenterViewModel";
import { attentionPriorityLabel, formatDateTime, toPersianNumber } from "./presentation";

import { attentionSummary, reliabilityText } from "./density";

export function CommandCenterAttentionQueue({ onOpen, viewModel }: {
  onOpen: (item: CommandCenterAttentionItem, trigger: HTMLButtonElement) => void;
  viewModel: CommandCenterViewModel;
}) {
  return (
    <section className="attention-section" aria-labelledby="attention-title">
      <header className="attention-heading">
        <div><h3 id="attention-title">نیازمند توجه شما</h3><p>به‌ترتیب اثر بر کسب‌وکار</p></div>
        <span className="section-count"><strong>{toPersianNumber(viewModel.topAttention.length)}</strong> موضوع</span>
      </header>
      {viewModel.topAttention.length ? (
        <div className="attention-list" tabIndex={0} role="region" aria-label="موضوع‌های مدیریتی؛ ادامه موارد با پیمایش صف">
          {viewModel.topAttention.map((item) => (
            <article className="command-row" key={item.attentionId}>
              <div className={`command-row__signal tone-${item.priorityTier <= 1 ? "critical" : "warn"}`}>
                <span aria-hidden="true">{item.priorityTier <= 1 ? "!" : "•"}</span>
                <strong>{attentionPriorityLabel(item.priorityTier)}</strong>
              </div>
              <div className="command-row__issue">
                <h4>{attentionSummary(item).title}</h4>
                <p>{attentionSummary(item).impact}</p>
              </div>
              <button className="command-row__open" aria-label={`بررسی: ${item.title}`} onClick={(event) => onOpen(item, event.currentTarget)} type="button">بررسی ←</button>
              <div className="command-row__context">
                <span>{item.isExperimental ? "بازه نیازمند تعریف" : item.timeContext}</span>
                <span>{item.destinationLabel}{item.isExperimental ? " · آزمایشی" : ""}</span>
              </div>
              <div className="command-row__metadata">
                <span>{reliabilityText(item.reliability)}</span>
                {item.reliability === "stale_last_known_good" && <time dateTime={item.detectedAt}>{formatDateTime(item.detectedAt)}</time>}
              </div>
            </article>
          ))}
        </div>
      ) : <div className="empty-state tone-good"><div><strong>موضوع بازی برای توجه مدیر وجود ندارد</strong><span>براساس داده موجود در این نمای آزمایشی</span></div></div>}
    </section>
  );
}
