import { useEffect, useRef, useState } from "react";
import type {
  CommandCenterAttentionItem,
  CommandCenterViewModel,
} from "../../integration/commandCenter/commandCenterViewModel";
import { attentionSummary } from "./density";
import { attentionPriorityLabel, toPersianNumber } from "./presentation";

export function CommandCenterAttentionQueue({
  onOpen,
  selectedAttentionId,
  viewModel,
}: {
  onOpen: (item: CommandCenterAttentionItem, trigger: HTMLButtonElement) => void;
  selectedAttentionId?: string;
  viewModel: CommandCenterViewModel;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const [remainingBelow, setRemainingBelow] = useState(0);
  const urgentCount = viewModel.topAttention.filter((item) => item.priorityTier <= 1).length;

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    let frame = 0;
    const updateRemaining = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const bounds = list.getBoundingClientRect();
        const remaining = [...list.querySelectorAll<HTMLElement>(".command-row")]
          .filter((row) => row.getBoundingClientRect().bottom > bounds.bottom + 1)
          .length;
        setRemainingBelow(remaining);
      });
    };
    const observer = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(updateRemaining);
    observer?.observe(list);
    for (const row of list.querySelectorAll(".command-row")) observer?.observe(row);
    list.addEventListener("scroll", updateRemaining, { passive: true });
    window.addEventListener("resize", updateRemaining);
    updateRemaining();
    return () => {
      window.cancelAnimationFrame(frame);
      observer?.disconnect();
      list.removeEventListener("scroll", updateRemaining);
      window.removeEventListener("resize", updateRemaining);
    };
  }, [viewModel.topAttention]);

  return (
    <section className={`attention-section${remainingBelow ? " attention-section--overflow" : ""}`} aria-labelledby="attention-title">
      <header className="attention-heading">
        <div><h3 id="attention-title">نیازمند توجه شما</h3><p>به‌ترتیب اثر بر کسب‌وکار</p></div>
        <span className="section-count">
          <strong>{toPersianNumber(viewModel.topAttention.length)}</strong> فعال
          <span aria-hidden="true"> · </span>
          <b>{toPersianNumber(urgentCount)}</b> فوری
        </span>
      </header>
      {viewModel.topAttention.length ? (
        <div className="attention-list" ref={listRef} tabIndex={0} role="region" aria-label="موضوع‌های مدیریتی؛ ادامه موارد با پیمایش صف">
          {viewModel.topAttention.map((item) => {
            const summary = attentionSummary(item);
            const selected = item.attentionId === selectedAttentionId;
            return (
              <button
                aria-current={selected ? "true" : undefined}
                aria-label={`${attentionPriorityLabel(item.priorityTier)}؛ ${summary.title}؛ ${summary.impact}؛ مشاهده جزئیات`}
                className={`command-row${selected ? " command-row--selected" : ""}`}
                key={item.attentionId}
                onClick={(event) => onOpen(item, event.currentTarget)}
                type="button"
              >
                <span className={`command-row__signal tone-${item.priorityTier <= 1 ? "critical" : "warn"}`}>
                  <span aria-hidden="true">{item.priorityTier <= 1 ? "!" : "•"}</span>
                  <strong>{attentionPriorityLabel(item.priorityTier)}</strong>
                </span>
                <span className="command-row__issue">
                  <strong>{summary.title}</strong>
                  <span>{summary.impact}</span>
                </span>
                <span className="command-row__open">{selected ? "در حال بررسی" : "بررسی ←"}</span>
                <span className="command-row__context">
                  <span>{item.isExperimental ? "بازه نیازمند تعریف" : item.timeContext}</span>
                  <span>{item.destinationLabel}{item.isExperimental ? " · آزمایشی" : ""}</span>
                </span>
              </button>
            );
          })}
        </div>
      ) : <div className="empty-state tone-good"><div><strong>موضوع بازی برای توجه مدیر وجود ندارد</strong><span>براساس داده موجود در این نمای آزمایشی</span></div></div>}
      {remainingBelow > 0 && (
        <div className="attention-more" aria-live="polite">
          {toPersianNumber(remainingBelow)} مورد دیگر در ادامه صف
        </div>
      )}
    </section>
  );
}
