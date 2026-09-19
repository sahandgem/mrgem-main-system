import { useEffect, useRef } from "react";
import type { CommandCenterAttentionItem } from "../../integration/commandCenter/commandCenterViewModel";
import { StatusBadge } from "../StatusBadge";
import {
  confidenceLabel,
  formatDateTime,
  toneForAttention,
  toneForReliability,
} from "./presentation";

import { reliabilityText } from "./density";

export function CockpitDrawerShell({
  item,
  onClose,
}: {
  item?: CommandCenterAttentionItem;
  onClose: () => void;
}) {
  const drawerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!item) return;
    drawerRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [item, onClose]);

  if (!item) return null;

  return (
    <aside
      aria-labelledby="drawer-title"
      className="cockpit-drawer"
      ref={drawerRef}
      role="dialog"
      tabIndex={-1}
    >
      <header>
        <div><span className="section-label">مشاهده جزئیات</span><h2 id="drawer-title">خلاصه موضوع</h2></div>
        <button aria-label="بستن جزئیات" className="drawer-close" onClick={onClose} type="button">بستن</button>
      </header>
      <div className="drawer-heading">
        <span>{item.moduleName}</span>
        <h3>{item.title}</h3>
        <div>
          {item.isExperimental && <StatusBadge tone="focus">آزمایشی</StatusBadge>}
          <StatusBadge tone={toneForAttention(item)}>اولویت مدیریتی</StatusBadge>
        </div>
      </div>
      <dl className="drawer-facts">
        <div><dt>چه اتفاقی افتاده</dt><dd>{item.summary}</dd></div>
        <div><dt>اثر احتمالی</dt><dd>{item.businessImpact}</dd></div>
        <div><dt>زمان مرتبط</dt><dd>{item.timeContext} · ثبت {formatDateTime(item.detectedAt)}</dd></div>
        <div><dt>اعتماد به داده</dt><dd><StatusBadge tone={toneForReliability(item.reliability)}>{reliabilityText(item.reliability)} · {confidenceLabel(item.confidence)}</StatusBadge></dd></div>
        <div><dt>گزینه / گام پیشنهادی</dt><dd>{item.suggestedNextStep ?? "در داده فعلی گزینه اجرایی تعریف نشده است."}</dd></div>
        <div><dt>مقصد بررسی</dt><dd>{item.destinationLabel}</dd></div>
        {item.sourceRef && <div><dt>مرجع داده نمونه</dt><dd dir="ltr">{item.sourceRef}</dd></div>}
      </dl>
      <div className="drawer-placeholder">
        <strong>فقط مشاهده و بررسی</strong>
        <p>{item.isExperimental ? "تولید آزمایشی است؛ منطق نهایی و اتصال واقعی تعریف نشده‌اند." : "مالک برنامه و اقدام اجرایی، ماژول برنامه هفتگی است."}</p>
      </div>
    </aside>
  );
}
