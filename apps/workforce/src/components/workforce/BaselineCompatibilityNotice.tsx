import { ShieldCheck } from "lucide-react";
import { buildLegacyBaselineGuidance } from "../../analysis/baselineCompatibilityMessages";
import type { BaselineDriftReport } from "../../models/workforce";
import { StatusBadge } from "../StatusBadge";

export function BaselineCompatibilityNotice({
  report,
  recommendedPath = "/organization/workforce-dashboard/baseline-drift",
}: {
  report: BaselineDriftReport;
  recommendedPath?: string;
}) {
  const guidance = buildLegacyBaselineGuidance(report, recommendedPath);
  if (!guidance) return null;
  return (
    <section className={`compatibility-notice tone-${guidance.tone} no-print`}>
      <div className="notice-icon"><ShieldCheck size={21} /></div>
      <div>
        <div className="section-head">
          <h2>{guidance.title}</h2>
          <StatusBadge tone={guidance.tone}>سازگاری baseline</StatusBadge>
        </div>
        <p>{guidance.description}</p>
        <div className="compatibility-detail-grid">
          {guidance.detailItems.slice(0, 4).map((item) => <span key={item}>{item}</span>)}
        </div>
      </div>
      <a className={report.requiresResignoff ? "primary-button" : "ghost-button"} href={guidance.recommendedPath}>{guidance.actionLabel}</a>
    </section>
  );
}
