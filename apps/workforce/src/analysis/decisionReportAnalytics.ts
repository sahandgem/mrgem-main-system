import type {
  DecisionReport,
  MonthlyManagementSummary,
  ReportComparisonResult,
  ReportTrendPoint,
} from "../models/workforce";
import { createId, nowIso } from "../models/workforce";

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

function sortedReports(reports: DecisionReport[]) {
  return clone(reports)
    .filter((report) => !report.isArchived)
    .sort((a, b) => a.generatedAt.localeCompare(b.generatedAt));
}

function average(values: number[]) {
  if (!values.length) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

export function buildReportTrend(reports: DecisionReport[]): ReportTrendPoint[] {
  return sortedReports(reports).map((report) => ({
    reportId: report.id,
    weekLabel: report.weekLabel,
    generatedAt: report.generatedAt,
    controlScoreAfter: report.summary.controlScoreAfter,
    riskScoreAfter: report.summary.riskScoreAfter,
    criticalAfter: report.summary.criticalAfter,
    warningAfter: report.summary.warningAfter,
    decisionCount: report.appliedScenarioIds.length || report.decisionBatchResult.appliedChanges.length,
  }));
}

export function findBestAndWorstReports(reports: DecisionReport[]) {
  const rows = sortedReports(reports);
  const byQuality = [...rows].sort((a, b) =>
    b.summary.controlScoreAfter - a.summary.controlScoreAfter ||
    a.summary.riskScoreAfter - b.summary.riskScoreAfter ||
    a.summary.criticalAfter - b.summary.criticalAfter,
  );
  return {
    bestReportId: byQuality[0]?.id,
    worstReportId: byQuality[byQuality.length - 1]?.id,
  };
}

export function detectRecurringRisks(reports: DecisionReport[], minCount = 2) {
  const counts = new Map<string, number>();
  for (const report of reports) {
    const titles = new Set(report.remainingRisks.map((risk) => risk.title).filter(Boolean));
    for (const title of titles) {
      counts.set(title, (counts.get(title) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .filter(([, count]) => count >= minCount)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([title]) => title);
}

export function generateManagementInsight(reports: DecisionReport[]) {
  const trend = buildReportTrend(reports);
  if (trend.length < 2) return "برای تحلیل روند، حداقل دو گزارش لازم است.";
  const first = trend[0];
  const last = trend[trend.length - 1];
  const controlDelta = last.controlScoreAfter - first.controlScoreAfter;
  const riskDelta = last.riskScoreAfter - first.riskScoreAfter;
  if (controlDelta > 0 && riskDelta <= 0) return "روند مدیریتی بهتر شده و ریسک کلی کنترل شده است.";
  if (controlDelta < 0 || riskDelta > 0) return "روند نیازمند توجه است؛ بخشی از تصمیم‌ها ریسک را کاهش نداده‌اند.";
  return "روند تقریباً ثابت است و برای جهش بهتر به تمرکز عملیاتی دقیق‌تر نیاز دارد.";
}

export function getRecommendedFocusForNextMonth(reports: DecisionReport[]) {
  const recurring = detectRecurringRisks(reports);
  if (recurring.length) return `تمرکز ماه بعد: کاهش مسئله تکرارشونده «${recurring[0]}».`;
  const trend = buildReportTrend(reports);
  const last = trend[trend.length - 1];
  if (!last) return "ابتدا چند گزارش هفتگی بساز تا تمرکز ماه بعد مشخص شود.";
  if (last.criticalAfter > 0) return "تمرکز ماه بعد: بستن هشدارهای بحرانی باقی‌مانده.";
  if (last.riskScoreAfter > 20) return "تمرکز ماه بعد: کاهش ریسک کل با تصمیم‌های کم‌هزینه و امن.";
  return "تمرکز ماه بعد: پایدارسازی برنامه و ثبت گزارش‌های منظم.";
}

export function compareDecisionReports(reports: DecisionReport[]): ReportComparisonResult {
  const rows = sortedReports(reports);
  const trend = buildReportTrend(rows);
  const { bestReportId, worstReportId } = findBestAndWorstReports(rows);
  const recurringRiskTitles = detectRecurringRisks(rows);
  const averageControlScore = average(rows.map((report) => report.summary.controlScoreAfter));
  const averageRiskScore = average(rows.map((report) => report.summary.riskScoreAfter));
  const totalAppliedDecisions = rows.reduce((sum, report) => sum + (report.appliedScenarioIds.length || report.decisionBatchResult.appliedChanges.length), 0);
  const insight = generateManagementInsight(rows);
  return {
    reportIds: rows.map((report) => report.id),
    controlScoreTrend: trend,
    riskScoreTrend: trend,
    criticalTrend: trend,
    warningTrend: trend,
    bestReportId,
    worstReportId,
    averageControlScore,
    averageRiskScore,
    totalAppliedDecisions,
    recurringRiskTitles,
    summary: rows.length ? `${rows.length} گزارش بررسی شد؛ میانگین کنترل ${averageControlScore} و میانگین ریسک ${averageRiskScore} است.` : "گزارشی برای مقایسه وجود ندارد.",
    managementInsight: insight,
  };
}

export function calculateMonthlySummary(reports: DecisionReport[], monthLabel = "ماه جاری"): MonthlyManagementSummary {
  const rows = sortedReports(reports);
  const comparison = compareDecisionReports(rows);
  const best = rows.find((report) => report.id === comparison.bestReportId);
  const worst = rows.find((report) => report.id === comparison.worstReportId);
  const effective = [...rows]
    .sort((a, b) =>
      (b.summary.controlScoreAfter - b.summary.controlScoreBefore) - (a.summary.controlScoreAfter - a.summary.controlScoreBefore),
    )
    .slice(0, 5)
    .map((report) => `${report.weekLabel}: ${report.title}`);

  return {
    id: createId("monthly-summary"),
    monthLabel,
    generatedAt: nowIso(),
    reportIds: rows.map((report) => report.id),
    averageControlScore: comparison.averageControlScore,
    averageRiskScore: comparison.averageRiskScore,
    bestWeek: best?.weekLabel ?? "ثبت نشده",
    worstWeek: worst?.weekLabel ?? "ثبت نشده",
    mostRepeatedProblems: comparison.recurringRiskTitles.slice(0, 5),
    mostEffectiveDecisions: effective,
    managerSummary: comparison.managementInsight,
    recommendedFocusForNextMonth: getRecommendedFocusForNextMonth(rows),
  };
}
