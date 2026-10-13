import type { BaselineDriftReport, StatusTone } from "../models/workforce";

export interface BaselineCompatibilityGuidance {
  title: string;
  description: string;
  tone: StatusTone;
  actionLabel: string;
  recommendedPath: string;
  detailItems: string[];
}

export function getBaselineCompatibilityTone(report?: Pick<BaselineDriftReport, "isLegacyBaseline" | "requiresResignoff" | "driftLevel">): StatusTone {
  if (!report?.isLegacyBaseline) return "good";
  if (report.requiresResignoff || report.driftLevel === "high" || report.driftLevel === "critical") return "warn";
  return "info";
}

export function getBaselineCompatibilityActionLabel(report?: Pick<BaselineDriftReport, "isLegacyBaseline" | "requiresResignoff" | "driftLevel">) {
  if (!report?.isLegacyBaseline) return "وضعیت baseline";
  if (report.requiresResignoff || report.driftLevel === "high" || report.driftLevel === "critical") return "ثبت بازتأیید جدید";
  return "بررسی و در صورت نیاز بازتأیید";
}

export function buildLegacyBaselineGuidance(
  report?: Pick<BaselineDriftReport, "isLegacyBaseline" | "requiresResignoff" | "driftLevel" | "baselineCoverageVersion" | "currentCoverageVersion" | "comparableKeyCount" | "nonComparableKeyCount" | "compatibilityWarnings">,
  recommendedPath = "/organization/workforce-dashboard/baseline-drift",
): BaselineCompatibilityGuidance | undefined {
  if (!report?.isLegacyBaseline) return undefined;
  return {
    title: "Baseline قدیمی است، خراب نیست",
    description: "این baseline قبل از کامل‌شدن پوشش بکاپ ساخته شده است. مقایسه روی کلیدهای مشترک انجام می‌شود؛ برای دقت بالاتر بهتر است یک بازتأیید عملیاتی جدید ثبت شود.",
    tone: getBaselineCompatibilityTone(report),
    actionLabel: getBaselineCompatibilityActionLabel(report),
    recommendedPath,
    detailItems: [
      `نسخه baseline: ${report.baselineCoverageVersion ?? "قدیمی/ثبت‌نشده"}`,
      `نسخه فعلی: ${report.currentCoverageVersion ?? "ثبت‌نشده"}`,
      `کلیدهای قابل مقایسه: ${report.comparableKeyCount ?? 0}`,
      `کلیدهای فقط در پوشش جدید: ${report.nonComparableKeyCount ?? 0}`,
      ...(report.compatibilityWarnings ?? []),
    ],
  };
}
