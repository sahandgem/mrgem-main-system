import type {
  DecisionReport,
  MonthlyGoal,
  MonthlyHealthDashboard,
  PreventiveAlert,
  PreventiveAlertPriority,
  PreventiveAlertSeverity,
  PreventiveAlertSourceType,
} from "../models/workforce";
import { createId, nowIso } from "../models/workforce";
import { buildReportTrend } from "./decisionReportAnalytics";

type PreventiveAlertInput = {
  reports: DecisionReport[];
  monthlyHealth?: MonthlyHealthDashboard;
  monthlyGoals?: MonthlyGoal[];
};

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

function includesAny(text: string, words: string[]) {
  const normalized = text.toLowerCase();
  return words.some((word) => normalized.includes(word.toLowerCase()));
}

function riskBuckets(reports: DecisionReport[]) {
  const buckets = new Map<string, { title: string; labels: string[] }>();
  for (const report of reports.filter((item) => !item.isArchived).sort((a, b) => a.generatedAt.localeCompare(b.generatedAt))) {
    for (const risk of report.remainingRisks) {
      const key = risk.title.trim().toLowerCase();
      if (!key) continue;
      const current = buckets.get(key) ?? { title: risk.title, labels: [] };
      current.labels.push(report.weekLabel);
      buckets.set(key, current);
    }
  }
  return [...buckets.values()];
}

export function calculatePreventiveAlertPriority(severity: PreventiveAlertSeverity, repeatedCount: number): PreventiveAlertPriority {
  if (severity === "critical" && repeatedCount >= 3) return "urgent";
  if (severity === "critical") return "high";
  if (severity === "warning" && repeatedCount >= 2) return "high";
  if (severity === "warning") return "medium";
  return "low";
}

export function generatePreventiveAction(sourceType: PreventiveAlertSourceType, title: string) {
  if (sourceType === "repeated_focus_interruption") return "برای کارهای تمرکزی، حداقل دو بازه ثابت و کم‌حواس‌پرتی تعریف کن.";
  if (sourceType === "repeated_space_pressure") return "ظرفیت فضای درگیر را محدود کن و کارهای غیرتمرکزی را منتقل کن.";
  if (sourceType === "repeated_sales_coverage_gap") return "برای فروشگاه در ساعت‌های شلوغ یک نقش پاسخ‌گو ثابت تعیین کن.";
  if (sourceType === "failed_goal") return "هدف ماه بعد را کوچک‌تر، قابل اندازه‌گیری‌تر و با مالک مشخص تعریف کن.";
  if (sourceType === "worsening_trend") return "این روند را در صف تصمیم‌گیری هفته بعد به عنوان اولویت اول بررسی کن.";
  return `برای «${title}» یک اقدام اصلاحی کوتاه در برنامه هفته بعد قرار بده.`;
}

function makeAlert(params: {
  title: string;
  description: string;
  sourceType: PreventiveAlertSourceType;
  repeatedCount: number;
  firstSeenLabel: string;
  lastSeenLabel: string;
  affectedArea: string;
  relatedRiskTitles?: string[];
  relatedGoalIds?: string[];
  severity?: PreventiveAlertSeverity;
}): PreventiveAlert {
  const severity = params.severity ?? (params.repeatedCount >= 3 ? "critical" : params.repeatedCount >= 2 ? "warning" : "info");
  const timestamp = nowIso();
  return {
    id: createId("preventive-alert"),
    title: params.title,
    description: params.description,
    severity,
    sourceType: params.sourceType,
    repeatedCount: params.repeatedCount,
    firstSeenLabel: params.firstSeenLabel,
    lastSeenLabel: params.lastSeenLabel,
    affectedArea: params.affectedArea,
    relatedRiskTitles: params.relatedRiskTitles ?? [],
    relatedGoalIds: params.relatedGoalIds ?? [],
    recommendedAction: generatePreventiveAction(params.sourceType, params.title),
    priority: calculatePreventiveAlertPriority(severity, params.repeatedCount),
    status: "open",
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function classifyRisk(title: string): PreventiveAlertSourceType {
  if (includesAny(title, ["فروش", "مشتری", "sales", "store", "ظپط±ظˆط´"])) return "repeated_sales_coverage_gap";
  if (includesAny(title, ["تمرکز", "حواس", "focus", "شلوغ", "طھظ…ط±", "ط­ظˆط§ط³"])) return "repeated_focus_interruption";
  if (includesAny(title, ["ظرفیت", "طبقه", "زیرزمین", "space", "capacity", "ط¸ط±ظپ", "ط·ط¨ظ‚"])) return "repeated_space_pressure";
  return "recurring_risk";
}

export function detectRecurringRiskAlerts(reports: DecisionReport[]) {
  return riskBuckets(reports)
    .filter((bucket) => bucket.labels.length >= 2)
    .map((bucket) => {
      const sourceType = classifyRisk(bucket.title);
      return makeAlert({
        title: `ریسک تکرارشونده: ${bucket.title}`,
        description: `${bucket.title} در ${bucket.labels.length} گزارش دیده شده است.`,
        sourceType,
        repeatedCount: bucket.labels.length,
        firstSeenLabel: bucket.labels[0],
        lastSeenLabel: bucket.labels[bucket.labels.length - 1],
        affectedArea: sourceType === "recurring_risk" ? "برنامه ماهانه" : bucket.title,
        relatedRiskTitles: [bucket.title],
      });
    });
}

export function detectFailedGoalAlerts(goals: MonthlyGoal[] = []) {
  const missed = goals.filter((goal) => !goal.isArchived && goal.status === "missed");
  const byMetric = missed.reduce<Record<string, MonthlyGoal[]>>((groups, goal) => {
    groups[goal.targetMetric] = [...(groups[goal.targetMetric] ?? []), goal];
    return groups;
  }, {});
  return Object.entries(byMetric).map(([metric, rows]) => makeAlert({
    title: rows.length > 1 ? `هدف‌های ناموفق تکراری: ${metric}` : `هدف ناموفق: ${rows[0].title}`,
    description: rows.length > 1 ? `${rows.length} هدف مرتبط با ${metric} ناموفق شده‌اند.` : rows[0].description || "این هدف ماهانه محقق نشده است.",
    sourceType: "failed_goal",
    repeatedCount: rows.length,
    firstSeenLabel: rows[0].monthLabel,
    lastSeenLabel: rows[rows.length - 1].monthLabel,
    affectedArea: metric,
    relatedGoalIds: rows.map((goal) => goal.id),
    severity: rows.length > 1 ? "critical" : "warning",
  }));
}

export function detectWorseningTrendAlerts(reports: DecisionReport[]) {
  const trend = buildReportTrend(reports).slice(-3);
  if (trend.length < 2) return [];
  const controlWorsening = trend.every((point, index) => index === 0 || point.controlScoreAfter < trend[index - 1].controlScoreAfter);
  const riskWorsening = trend.every((point, index) => index === 0 || point.riskScoreAfter > trend[index - 1].riskScoreAfter);
  if (!controlWorsening) return [];
  return [makeAlert({
    title: "روند کنترل نزولی است",
    description: riskWorsening ? "کنترل در گزارش‌های اخیر پایین آمده و ریسک همزمان بالا رفته است." : "امتیاز کنترل در چند گزارش اخیر کاهش یافته است.",
    sourceType: "worsening_trend",
    repeatedCount: trend.length,
    firstSeenLabel: trend[0].weekLabel,
    lastSeenLabel: trend[trend.length - 1].weekLabel,
    affectedArea: "روند مدیریتی",
    severity: riskWorsening ? "critical" : "warning",
  })];
}

export function detectRepeatedSpacePressure(reports: DecisionReport[]) {
  return detectRecurringRiskAlerts(reports).filter((alert) => alert.sourceType === "repeated_space_pressure");
}

export function detectRepeatedFocusInterruption(reports: DecisionReport[]) {
  return detectRecurringRiskAlerts(reports).filter((alert) => alert.sourceType === "repeated_focus_interruption");
}

export function detectRepeatedSalesCoverageGap(reports: DecisionReport[]) {
  return detectRecurringRiskAlerts(reports).filter((alert) => alert.sourceType === "repeated_sales_coverage_gap");
}

export function groupSimilarAlerts(alerts: PreventiveAlert[]) {
  const grouped = new Map<string, PreventiveAlert>();
  for (const alert of alerts) {
    const key = `${alert.sourceType}:${alert.title}`.toLowerCase();
    const existing = grouped.get(key);
    if (!existing || alert.repeatedCount > existing.repeatedCount || alert.severity === "critical") {
      grouped.set(key, alert);
    }
  }
  return [...grouped.values()].sort((a, b) => {
    const priorityRank = { urgent: 4, high: 3, medium: 2, low: 1 };
    const severityRank = { critical: 3, warning: 2, info: 1 };
    return priorityRank[b.priority] - priorityRank[a.priority] || severityRank[b.severity] - severityRank[a.severity] || b.repeatedCount - a.repeatedCount;
  });
}

export function buildPreventiveAlerts(input: PreventiveAlertInput) {
  const reports = clone(input.reports);
  const goals = clone(input.monthlyGoals ?? []);
  const alerts = [
    ...detectRecurringRiskAlerts(reports),
    ...detectFailedGoalAlerts(goals),
    ...detectWorseningTrendAlerts(reports),
  ];
  if (input.monthlyHealth?.trendStatus === "worsening" || input.monthlyHealth?.healthLevel === "critical") {
    alerts.push(makeAlert({
      title: "سلامت ماهانه نیازمند اقدام پیشگیرانه است",
      description: input.monthlyHealth.managementSummary,
      sourceType: "worsening_trend",
      repeatedCount: input.monthlyHealth.reportIds.length,
      firstSeenLabel: input.monthlyHealth.monthLabel,
      lastSeenLabel: input.monthlyHealth.monthLabel,
      affectedArea: "سلامت ماهانه",
      severity: input.monthlyHealth.healthLevel === "critical" ? "critical" : "warning",
    }));
  }
  return groupSimilarAlerts(alerts);
}
