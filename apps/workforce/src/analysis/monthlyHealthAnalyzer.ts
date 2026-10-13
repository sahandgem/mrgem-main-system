import type {
  DecisionReport,
  MonthlyHealthDashboard,
  MonthlyHealthLevel,
  MonthlyTrendStatus,
} from "../models/workforce";
import { createId, nowIso } from "../models/workforce";
import { buildReportTrend, calculateMonthlySummary, detectRecurringRisks } from "./decisionReportAnalytics";

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

function monthKey(dateIso: string) {
  const date = new Date(dateIso);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function filterReportsByMonth(reports: DecisionReport[], monthLabel: string) {
  return clone(reports).filter((report) => !report.isArchived && (monthLabel === "all" || monthKey(report.generatedAt) === monthLabel || report.weekLabel.includes(monthLabel)));
}

export function calculateMonthlyHealthLevel(averageControlScore: number, averageRiskScore: number): MonthlyHealthLevel {
  if (averageControlScore >= 85 && averageRiskScore <= 15) return "excellent";
  if (averageControlScore >= 70 && averageRiskScore <= 35) return "good";
  if (averageControlScore >= 50) return "needs_attention";
  return "critical";
}

export function detectMonthlyTrendStatus(reports: DecisionReport[]): MonthlyTrendStatus {
  const trend = buildReportTrend(reports);
  if (trend.length < 2) return "insufficient_data";
  const first = trend[0].controlScoreAfter;
  const last = trend[trend.length - 1].controlScoreAfter;
  const delta = last - first;
  if (delta > 3) return "improving";
  if (delta < -3) return "worsening";
  return "stable";
}

export function findTopRecurringMonthlyRisks(reports: DecisionReport[], minCount = 2) {
  return detectRecurringRisks(reports, minCount).slice(0, 6);
}

export function findMostEffectiveDecisions(reports: DecisionReport[]) {
  return clone(reports)
    .filter((report) => !report.isArchived)
    .sort((a, b) =>
      (b.summary.controlScoreAfter - b.summary.controlScoreBefore) - (a.summary.controlScoreAfter - a.summary.controlScoreBefore),
    )
    .slice(0, 5)
    .map((report) => report.title);
}

export function generateNextMonthFocus(reports: DecisionReport[]) {
  const recurring = findTopRecurringMonthlyRisks(reports);
  if (recurring.length) return `تمرکز ماه بعد: بستن ریسک تکراری «${recurring[0]}».`;
  const trend = detectMonthlyTrendStatus(reports);
  if (trend === "worsening") return "تمرکز ماه بعد: بازبینی تصمیم‌هایی که امتیاز کنترل را پایین آورده‌اند.";
  if (trend === "insufficient_data") return "تمرکز ماه بعد: ساخت گزارش‌های هفتگی منظم برای دیدن روند.";
  return "تمرکز ماه بعد: تثبیت تصمیم‌های موثر و کاهش ریسک‌های باقی‌مانده.";
}

export function generateMonthlyManagementSummary(dashboard: Pick<MonthlyHealthDashboard, "healthLevel" | "trendStatus" | "averageControlScore" | "averageRiskScore" | "repeatedRiskCount">) {
  if (dashboard.healthLevel === "excellent") return "ماه از نظر کنترل و ریسک در وضعیت بسیار خوب قرار دارد.";
  if (dashboard.healthLevel === "critical") return "سلامت مدیریتی ماه بحرانی است و باید تصمیم‌های اصلاحی فوری انتخاب شوند.";
  if (dashboard.trendStatus === "improving") return "روند ماه رو به بهبود است؛ تصمیم‌های موثر را حفظ کن.";
  if (dashboard.repeatedRiskCount > 0) return "چند ریسک تکرارشونده هنوز فشار اصلی ماه هستند.";
  return `میانگین کنترل ${dashboard.averageControlScore} و میانگین ریسک ${dashboard.averageRiskScore} است؛ وضعیت نیازمند پایش است.`;
}

export function compareMonthToPreviousMonth(currentReports: DecisionReport[], previousReports: DecisionReport[]) {
  const current = calculateMonthlySummary(currentReports);
  const previous = calculateMonthlySummary(previousReports);
  return {
    controlDelta: current.averageControlScore - previous.averageControlScore,
    riskDelta: current.averageRiskScore - previous.averageRiskScore,
    trend: current.averageControlScore > previous.averageControlScore ? "improving" as MonthlyTrendStatus : current.averageControlScore < previous.averageControlScore ? "worsening" as MonthlyTrendStatus : "stable" as MonthlyTrendStatus,
  };
}

export function buildMonthlyHealthDashboard(reports: DecisionReport[], monthLabel = "all"): MonthlyHealthDashboard {
  const monthlyReports = filterReportsByMonth(reports, monthLabel);
  const summary = calculateMonthlySummary(monthlyReports, monthLabel === "all" ? "همه گزارش‌ها" : monthLabel);
  const trendStatus = detectMonthlyTrendStatus(monthlyReports);
  const topRecurringRisks = findTopRecurringMonthlyRisks(monthlyReports);
  const averageControlScore = summary.averageControlScore;
  const averageRiskScore = summary.averageRiskScore;
  const healthLevel = calculateMonthlyHealthLevel(averageControlScore, averageRiskScore);
  const strongestArea = averageControlScore >= 70 ? "کنترل برنامه" : "نیاز به داده بیشتر";
  const weakestArea = topRecurringRisks[0] ?? (averageRiskScore > 35 ? "ریسک کل" : "هشدار بحرانی باقی‌مانده");
  const partial = {
    healthLevel,
    trendStatus,
    averageControlScore,
    averageRiskScore,
    repeatedRiskCount: topRecurringRisks.length,
  };

  return {
    id: createId("monthly-health"),
    monthLabel: summary.monthLabel,
    generatedAt: nowIso(),
    reportIds: monthlyReports.map((report) => report.id),
    averageControlScore,
    averageRiskScore,
    bestWeekLabel: summary.bestWeek,
    worstWeekLabel: summary.worstWeek,
    trendStatus,
    repeatedRiskCount: topRecurringRisks.length,
    topRecurringRisks,
    mostEffectiveDecisionTitles: findMostEffectiveDecisions(monthlyReports),
    weakestArea,
    strongestArea,
    nextMonthFocus: generateNextMonthFocus(monthlyReports),
    managementSummary: generateMonthlyManagementSummary(partial),
    healthLevel,
  };
}
