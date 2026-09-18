import { ArrowDownLeft, ArrowUpLeft, BarChart3, Minus } from "lucide-react";
import type { CommandCenterKpiHighlight } from "../../integration/commandCenter/commandCenterViewModel";
import { StatusBadge } from "../StatusBadge";
import {
  formatDateTime,
  toPersianNumber,
  toneForKpiStatus,
  toneForReliability,
} from "./presentation";

function TrendIcon({ direction }: { direction: CommandCenterKpiHighlight["trendDirection"] }) {
  if (direction === "up") return <ArrowUpLeft aria-hidden="true" size={16} />;
  if (direction === "down") return <ArrowDownLeft aria-hidden="true" size={16} />;
  return <Minus aria-hidden="true" size={16} />;
}

export function CommandCenterKpiOverview({ highlights }: { highlights: readonly CommandCenterKpiHighlight[] }) {
  return (
    <section className="content-section" aria-labelledby="kpi-overview-title">
      <div className="section-heading">
        <div>
          <span className="section-kicker"><BarChart3 aria-hidden="true" size={17} />نبض عملکرد</span>
          <h3 id="kpi-overview-title">شاخص‌ها و روندهای اصلی</h3>
          <p>فقط شاخص‌هایی که برای فهم وضعیت یا تصمیم بعدی معنا دارند.</p>
        </div>
      </div>
      <div className="kpi-grid">
        {highlights.map((item) => (
          <article className={`kpi-card tone-${toneForKpiStatus(item.status)}`} key={item.highlightId}>
            <div className="kpi-card__topline">
              <span>{item.moduleName}</span>
              {item.isExperimental && <StatusBadge tone="focus">معماری آزمایشی</StatusBadge>}
            </div>
            <div className="kpi-card__value-row">
              <strong>{toPersianNumber(item.displayValue)}</strong>
              {item.trendText && (
                <span className="kpi-card__trend"><TrendIcon direction={item.trendDirection} />{toPersianNumber(item.trendText)}</span>
              )}
            </div>
            <h4>{item.label}</h4>
            <p>{item.contextLabel}</p>
            <div className="kpi-card__meta">
              <StatusBadge tone={toneForReliability(item.reliability)}>{item.reliabilityLabel}</StatusBadge>
              <span>ثبت {formatDateTime(item.observedAt)}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
