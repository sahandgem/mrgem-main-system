import type {
  LaunchBaselineSummary,
  LaunchChecklistReport,
  LaunchSignoffReport,
  MaintenanceReport,
  OperationalReadinessReport,
} from "../models/workforce";
import { createId, nowIso } from "../models/workforce";

export interface LaunchSignoffContext {
  readiness: OperationalReadinessReport;
  checklist: LaunchChecklistReport;
  maintenance: MaintenanceReport;
  baselineSummary: LaunchBaselineSummary;
  unresolvedRisks: string[];
  openCriticalCount: number;
  openWarningCount: number;
}

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

export function buildLaunchBaselineSummary(input: Partial<LaunchBaselineSummary>): LaunchBaselineSummary {
  return {
    spacesCount: input.spacesCount ?? 0,
    employeesCount: input.employeesCount ?? 0,
    taskTypesCount: input.taskTypesCount ?? 0,
    scheduleItemsCount: input.scheduleItemsCount ?? 0,
    rulesCount: input.rulesCount ?? 0,
    reportsCount: input.reportsCount ?? 0,
    goalsCount: input.goalsCount ?? 0,
    preventiveAlertsCount: input.preventiveAlertsCount ?? 0,
    snapshotsCount: input.snapshotsCount ?? 0,
    maintenanceIssuesCount: input.maintenanceIssuesCount ?? 0,
  };
}

export function getLaunchSignoffBlockers(context: LaunchSignoffContext) {
  const blockers: string[] = [];
  if (context.readiness.status === "risky") blockers.push("وضعیت آمادگی عملیاتی پرریسک است.");
  if (context.checklist.criticalOpenCount > 0) blockers.push("چک‌لیست راه‌اندازی اقدام بحرانی باز دارد.");
  if (context.maintenance.healthStatus === "risky" || context.maintenance.healthStatus === "critical") {
    blockers.push("سلامت نگهداری سیستم برای شروع امن مناسب نیست.");
  }
  if (context.baselineSummary.snapshotsCount === 0) blockers.push("هیچ snapshot قابل بازگشتی وجود ندارد.");
  if (!context.baselineSummary.spacesCount || !context.baselineSummary.employeesCount || !context.baselineSummary.taskTypesCount) {
    blockers.push("داده‌های پایه فضا، کارمند یا نوع کار ناقص است.");
  }
  return blockers;
}

export function buildLaunchSignoffDraft(context: LaunchSignoffContext): LaunchSignoffReport {
  const timestamp = nowIso();
  const blockers = getLaunchSignoffBlockers(context);
  return {
    id: createId("launch-signoff"),
    title: "گزارش نهایی تأیید راه‌اندازی",
    generatedAt: timestamp,
    status: blockers.length ? "blocked" : "ready_to_sign",
    signedBy: "",
    managerNote: "",
    readinessScore: context.readiness.score,
    readinessStatus: context.readiness.status,
    launchProgressPercent: context.checklist.progressPercent,
    maintenanceHealthStatus: context.maintenance.healthStatus,
    openCriticalCount: context.openCriticalCount,
    openWarningCount: context.openWarningCount,
    baselineChecksum: "",
    baselineSummary: clone(context.baselineSummary),
    unresolvedRisks: clone(context.unresolvedRisks),
    unresolvedChecklistItems: context.checklist.items.filter((item) => item.status === "open").map((item) => item.title),
    blockers,
    acceptedRisk: false,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}
