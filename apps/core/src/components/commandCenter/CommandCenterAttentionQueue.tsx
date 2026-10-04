import { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import type {
  CommandCenterAttentionItem,
  CommandCenterViewModel,
} from "../../integration/commandCenter/commandCenterViewModel";
import { attentionSummary } from "./density";
import {
  attentionPriorityLabel,
  managerTimeContext,
  overallStateLabel,
  toPersianNumber,
} from "./presentation";
import type { CockpitViewport } from "./useCockpitViewport";

function commandHeroDescription(viewModel: CommandCenterViewModel) {
  if (viewModel.reliability.failedModuleCount) return "بخشی از داده در دسترس نیست؛ ابتدا اعتماد داده و موضوع‌های فوری را بررسی کنید.";
  if (viewModel.overallState === "critical") return "چند موضوع با اثر مدیریتی بالا نیازمند بررسی فوری است.";
  if (viewModel.overallState === "attention") return "موضوع‌های مهم مرتب شده‌اند؛ از بالای صف بررسی را شروع کنید.";
  if (viewModel.overallState === "healthy") return "وضعیت پایدار است و موضوع فوری در داده موجود دیده نمی‌شود.";
  return "پوشش داده برای جمع‌بندی کامل کافی نیست.";
}

export function CommandCenterAttentionQueue({
  expanded,
  onOpen,
  onToggleExpanded,
  selectedAttentionId,
  viewModel,
  viewport,
}: {
  expanded: boolean;
  onOpen: (item: CommandCenterAttentionItem, trigger: HTMLButtonElement) => void;
  onToggleExpanded: () => void;
  selectedAttentionId?: string;
  viewModel: CommandCenterViewModel;
  viewport: CockpitViewport;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const [remainingBelow, setRemainingBelow] = useState(0);
  const urgentCount = viewModel.topAttention.filter((item) => item.priorityTier <= 1).length;
  const isMobile = viewport === "mobile";
  const visibleItems = isMobile && !expanded ? viewModel.topAttention.slice(0, 3) : viewModel.topAttention;
  const mobileRemaining = viewModel.topAttention.length - 3;
  const selectedBeyondPreview = isMobile && viewModel.topAttention.slice(3).some((item) => item.attentionId === selectedAttentionId);

  useEffect(() => {
    const list = listRef.current;
    if (!list || viewport !== "desktop") return;
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
  }, [viewModel.topAttention, viewport]);

  return (
    <section className={`attention-section${viewport === "desktop" && remainingBelow ? " attention-section--overflow" : ""}${isMobile && expanded ? " attention-section--expanded" : ""}`} aria-labelledby="attention-title">
      <div className="command-hero" aria-label="خلاصه مرکز فرمان">
        <span className="command-hero__gem" aria-hidden="true">
          <i /><i /><i />
        </span>
        <div className="command-hero__copy">
          <span>مرکز فرمان</span>
          <h2>{viewModel.reliability.failedModuleCount || viewModel.overallState === "critical" ? "وضعیت بحرانی" : overallStateLabel(viewModel.overallState)}</h2>
          <p>{commandHeroDescription(viewModel)}</p>
        </div>
        <div className="command-hero__counter">
          <strong>{toPersianNumber(urgentCount)}</strong>
          <span>فوری</span>
          <small>{toPersianNumber(viewModel.topAttention.length)} موضوع فعال</small>
        </div>
      </div>

      {isMobile ? (
        <header className="attention-heading attention-heading--mobile">
          <span className="attention-heading__target" aria-hidden="true"><i /><i /></span>
          <div className="attention-heading__copy">
            <h3 id="attention-title">مهم‌ترین موارد امروز</h3>
            <span>مواردی که نیازمند توجه شماست</span>
          </div>
          {mobileRemaining > 0 && (
            <button
              aria-controls="attention-list"
              aria-expanded={expanded}
              className="attention-heading__toggle"
              disabled={expanded && selectedBeyondPreview}
              onClick={onToggleExpanded}
              type="button"
            >
              {expanded ? "نمایش کمتر" : "نمایش همه موضوعات"}
            </button>
          )}
        </header>
      ) : (
        <header className="attention-heading">
          <div>
            <span className="section-label">صف تصمیم</span>
            <h3 id="attention-title">مهم‌ترین موارد امروز</h3>
          </div>
          <span className="section-count">
            <strong>{toPersianNumber(viewModel.topAttention.length)}</strong> فعال
            <span aria-hidden="true"> · </span>
            <b>{toPersianNumber(urgentCount)}</b> فوری
          </span>
        </header>
      )}

      {viewModel.topAttention.length ? (
        <div className="attention-list" id="attention-list" ref={listRef} tabIndex={viewport === "desktop" ? 0 : undefined} role="region" aria-label={viewport === "desktop" ? "موضوع‌های مدیریتی؛ ادامه موارد با پیمایش صف" : "موضوع‌های مدیریتی"}>
          {visibleItems.map((item) => {
            const summary = attentionSummary(item);
            const selected = item.attentionId === selectedAttentionId;
            const timeContext = managerTimeContext(item.timeContext);
            const visualTier = item.priorityTier <= 1 ? "critical" : item.priorityTier === 2 ? "attention" : "followup";
            return (
              <button
                aria-current={selected ? "true" : undefined}
                aria-label={`${attentionPriorityLabel(item.priorityTier)}؛ ${summary.title}؛ ${summary.impact}؛ بررسی`}
                className={`command-row command-row--${visualTier}${selected ? " command-row--selected" : ""}`}
                data-attention-id={item.attentionId}
                key={item.attentionId}
                onClick={(event) => onOpen(item, event.currentTarget)}
                type="button"
              >
                <span className={`command-row__signal tone-${visualTier === "followup" ? "info" : visualTier === "critical" ? "critical" : "warn"}`}>
                  <span aria-hidden="true">{item.priorityTier <= 1 ? "!" : "•"}</span>
                  <strong>{attentionPriorityLabel(item.priorityTier)}</strong>
                </span>
                <span className="command-row__issue">
                  <strong>{summary.title}</strong>
                  <span>{summary.impact}</span>
                </span>
                <span className="command-row__open">
                  {selected ? "در حال بررسی" : <><span>بررسی</span><ArrowLeft aria-hidden="true" size={14} strokeWidth={1.5} /></>}
                </span>
                <span className="command-row__context">
                  {timeContext && <span className="command-row__time">{timeContext}</span>}
                  <span className="command-row__destination">{item.destinationLabel}{item.isExperimental ? " · آزمایشی" : ""}</span>
                </span>
              </button>
            );
          })}
        </div>
      ) : <div className="empty-state tone-good"><div><strong>موضوع بازی برای توجه مدیر وجود ندارد</strong><span>براساس داده موجود در این نمای آزمایشی</span></div></div>}

      {viewport === "desktop" && remainingBelow > 0 && (
        <div className="attention-more" aria-live="polite">
          {toPersianNumber(remainingBelow)} مورد دیگر در ادامه صف
        </div>
      )}
    </section>
  );
}
