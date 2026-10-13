import type {
  HistoryRetentionStatus,
  OperationalCalendarReport,
  OperationalControlItem,
  OperationalControlPriority,
  OperationalControlSchedulePolicy,
  OperationalControlStatus,
  OperationalControlType,
  OperationalReadinessStatus,
} from "../models/workforce";
import { createId, nowIso, toPersianNumber } from "../models/workforce";
import { getDefaultSchedulePolicy } from "../services/operationsControlSettingsService";

export interface OperationsCalendarSystemState {
  now?: string;
  latestSnapshotAt?: string;
  latestBackupAt?: string;
  latestArchiveAt?: string;
  latestResignoffAt?: string;
  lastCompletedAtByType?: Partial<Record<OperationalControlType, string>>;
  retentionStatus: HistoryRetentionStatus;
  retentionNeedsSnapshot: boolean;
  retentionNeedsArchive: boolean;
  staleDriftCount: number;
  expiredResignoffCount: number;
  maintenanceIssueCount: number;
  maintenanceCritical: boolean;
  driftLevel: "none" | "low" | "medium" | "high" | "critical";
  driftRequiresResignoff: boolean;
  readinessStatus: OperationalReadinessStatus;
  monthlyHealthNeedsReview: boolean;
  hasCurrentMonthGoal: boolean;
  urgentPreventiveAlertCount: number;
  launchChecklistOpenCount: number;
}

const priorityOrder: Record<OperationalControlPriority, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
const priorityRank: Record<OperationalControlPriority, number> = { low: 0, medium: 1, high: 2, urgent: 3 };
const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

function dayStart(value: string) {
  const date = new Date(value);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function addDays(value: string, days: number) {
  return new Date(new Date(value).getTime() + days * 86400000).toISOString();
}

export function calculateControlStatus(dueAt: string, now = nowIso()): OperationalControlStatus {
  const dueDay = dayStart(dueAt);
  const today = dayStart(now);
  if (dueDay < today) return "overdue";
  if (dueDay === today) return "due_today";
  return "upcoming";
}

export function calculateControlPriority(status: OperationalControlStatus, sourceSeverity: "normal" | "warning" | "critical" = "normal", defaultPriority: OperationalControlPriority = "low"): OperationalControlPriority {
  let required: OperationalControlPriority = defaultPriority;
  if (status === "overdue" && priorityRank[required] < priorityRank.high) required = "high";
  if ((status === "due_today" || sourceSeverity === "warning") && priorityRank[required] < priorityRank.medium) required = "medium";
  if (sourceSeverity === "critical") required = "urgent";
  return required;
}

function makeControl(type: OperationalControlType, title: string, description: string, dueAt: string, relatedPath: string, source: string, severity: "normal" | "warning" | "critical", now: string, policy: OperationalControlSchedulePolicy): OperationalControlItem {
  const status = calculateControlStatus(dueAt, now);
  return { id: `operations-control-${type}`, type, title, description, dueAt, status, priority: calculateControlPriority(status, severity, policy.defaultPriorities[type]), relatedPath, source, managerNote: "", createdAt: now, updatedAt: now };
}

export function generateControlItemsFromSystemState(input: OperationsCalendarSystemState, schedulePolicy?: OperationalControlSchedulePolicy): OperationalControlItem[] {
  const now = input.now ?? nowIso();
  const yesterday = addDays(now, -1);
  const policy = schedulePolicy ?? getDefaultSchedulePolicy();
  const controls: OperationalControlItem[] = [];
  const enabled = (type: OperationalControlType) => policy.enabledControlTypes.includes(type);
  const periodicDue = (type: OperationalControlType, interval: number, sourceAt?: string, attention: "none" | "today" | "overdue" = "none") => {
    const lastDone = input.lastCompletedAtByType?.[type];
    if (lastDone) return addDays(lastDone, interval);
    if (attention === "overdue") return yesterday;
    if (attention === "today") return now;
    if (sourceAt) return addDays(sourceAt, interval);
    return addDays(now, interval);
  };

  if (enabled("snapshot_due")) {
    const dueAt = periodicDue("snapshot_due", policy.snapshotEveryDays, input.latestSnapshotAt, input.latestSnapshotAt ? "none" : "overdue");
    controls.push(makeControl("snapshot_due", "کنترل Snapshot", input.latestSnapshotAt ? `Snapshot هر ${toPersianNumber(policy.snapshotEveryDays)} روز بازبینی می‌شود.` : "هنوز snapshot قابل بازگشتی ثبت نشده است.", dueAt, "/organization/workforce-dashboard/data-center", "snapshot", input.latestSnapshotAt ? "normal" : "warning", now, policy));
  }
  if (enabled("backup_due")) controls.push(makeControl("backup_due", "کنترل Backup", "وضعیت backup دوره‌ای را بازبینی کنید.", periodicDue("backup_due", policy.backupEveryDays, input.latestBackupAt, !input.latestBackupAt || input.retentionNeedsSnapshot ? "overdue" : "none"), "/organization/workforce-dashboard/data-center", "history-retention", input.retentionNeedsSnapshot || !input.latestBackupAt ? "warning" : "normal", now, policy));
  const archiveAttention = input.retentionStatus === "risky" ? "overdue" : input.retentionNeedsArchive || input.retentionStatus === "needs_archive" ? "today" : "none";
  if (enabled("archive_due")) controls.push(makeControl("archive_due", "Archive تاریخچه", "History طبق policy زمان‌بندی archive مرور می‌شود.", periodicDue("archive_due", policy.archiveEveryDays, input.latestArchiveAt, archiveAttention), "/organization/workforce-dashboard/history-retention", "history-retention", input.retentionStatus === "risky" ? "critical" : archiveAttention === "today" ? "warning" : "normal", now, policy));
  if (enabled("maintenance_review")) controls.push(makeControl("maintenance_review", "بازبینی نگهداری", input.maintenanceIssueCount ? `${toPersianNumber(input.maintenanceIssueCount)} مسئله نگهداری باز است.` : "مرور دوره‌ای سلامت داده‌ها.", periodicDue("maintenance_review", policy.maintenanceReviewEveryDays, undefined, input.maintenanceCritical ? "overdue" : input.maintenanceIssueCount ? "today" : "none"), "/organization/workforce-dashboard/maintenance", "maintenance", input.maintenanceCritical ? "critical" : input.maintenanceIssueCount ? "warning" : "normal", now, policy));
  const driftAttention = input.driftLevel === "high" || input.driftLevel === "critical" || input.staleDriftCount ? "overdue" : input.driftLevel === "medium" ? "today" : "none";
  if (enabled("drift_review")) controls.push(makeControl("drift_review", "مرور Drift", "تغییرات baseline و روند drift را مرور کنید.", periodicDue("drift_review", policy.driftReviewEveryDays, undefined, driftAttention), "/organization/workforce-dashboard/baseline-drift", "baseline-drift", input.driftLevel === "high" || input.driftLevel === "critical" ? "critical" : driftAttention === "today" ? "warning" : "normal", now, policy));
  const resignoffAttention = input.expiredResignoffCount > 0 || input.driftRequiresResignoff ? "overdue" : "none";
  if (enabled("resignoff_due")) controls.push(makeControl("resignoff_due", "بازتأیید عملیاتی", "اعتبار بازتأیید عملیاتی را بررسی کنید.", periodicDue("resignoff_due", policy.resignoffExpiresAfterDays, input.latestResignoffAt, resignoffAttention), "/organization/workforce-dashboard/launch-signoff", "resignoff", resignoffAttention === "overdue" ? "critical" : "normal", now, policy));
  const readinessAttention = input.readinessStatus === "risky" ? "overdue" : input.readinessStatus === "needs_setup" ? "today" : "none";
  if (enabled("readiness_review")) controls.push(makeControl("readiness_review", "مرور آمادگی عملیاتی", "وضعیت readiness و اقدام‌های باز را مرور کنید.", periodicDue("readiness_review", policy.readinessReviewEveryDays, undefined, readinessAttention), "/organization/workforce-dashboard/readiness", "readiness", input.readinessStatus === "risky" ? "critical" : readinessAttention === "today" ? "warning" : "normal", now, policy));
  if (enabled("monthly_health_review")) controls.push(makeControl("monthly_health_review", "مرور سلامت ماهانه", input.hasCurrentMonthGoal ? "سلامت ماهانه طبق برنامه مرور می‌شود." : "برای ماه جاری هدف مدیریتی ثبت نشده است.", periodicDue("monthly_health_review", policy.monthlyHealthReviewEveryDays, undefined, input.monthlyHealthNeedsReview || !input.hasCurrentMonthGoal ? "today" : "none"), "/organization/workforce-dashboard/monthly-health", "monthly-health", input.monthlyHealthNeedsReview || !input.hasCurrentMonthGoal ? "warning" : "normal", now, policy));
  if (enabled("preventive_alert_review")) controls.push(makeControl("preventive_alert_review", "مرور هشدار پیشگیرانه", input.urgentPreventiveAlertCount ? `${toPersianNumber(input.urgentPreventiveAlertCount)} هشدار مهم باز است.` : "هشدارهای پیشگیرانه دوره‌ای مرور شوند.", periodicDue("preventive_alert_review", policy.preventiveAlertReviewEveryDays, undefined, input.urgentPreventiveAlertCount ? "overdue" : "none"), "/organization/workforce-dashboard/preventive-alerts", "preventive-alerts", input.urgentPreventiveAlertCount ? "critical" : "normal", now, policy));
  if (enabled("launch_checklist_review")) controls.push(makeControl("launch_checklist_review", "مرور چک‌لیست راه‌اندازی", input.launchChecklistOpenCount ? `${toPersianNumber(input.launchChecklistOpenCount)} اقدام راه‌اندازی باز است.` : "وضعیت چک‌لیست راه‌اندازی مرور شود.", periodicDue("launch_checklist_review", policy.launchChecklistReviewEveryDays, undefined, input.launchChecklistOpenCount ? "today" : "none"), "/organization/workforce-dashboard/launch-checklist", "launch-checklist", input.launchChecklistOpenCount ? "warning" : "normal", now, policy));
  return controls;
}

export function detectOverdueControls(controls: OperationalControlItem[]) {
  return controls.filter((control) => control.status === "overdue");
}

export function getNextBestControl(controls: OperationalControlItem[]) {
  return [...controls]
    .filter((control) => control.status !== "completed" && control.status !== "dismissed" && control.status !== "snoozed")
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority] || a.dueAt.localeCompare(b.dueAt))[0];
}

export function groupControlsByDate(controls: OperationalControlItem[]) {
  return controls.reduce((groups, control) => {
    const key = control.dueAt.slice(0, 10);
    (groups[key] ??= []).push(control);
    return groups;
  }, {} as Record<string, OperationalControlItem[]>);
}

export function generateCalendarSummary(controls: OperationalControlItem[]) {
  const overdue = controls.filter((control) => control.status === "overdue").length;
  const today = controls.filter((control) => control.status === "due_today").length;
  return `${toPersianNumber(overdue)} کنترل عقب‌افتاده و ${toPersianNumber(today)} کنترل امروز ثبت شده است.`;
}

export function buildOperationsCalendarReport(controls: OperationalControlItem[]): OperationalCalendarReport {
  const rows = clone(controls).sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority] || a.dueAt.localeCompare(b.dueAt));
  return {
    id: createId("operations-calendar-report"),
    generatedAt: nowIso(),
    totalControls: rows.length,
    overdueCount: rows.filter((control) => control.status === "overdue").length,
    todayCount: rows.filter((control) => control.status === "due_today").length,
    upcomingCount: rows.filter((control) => control.status === "upcoming" || control.status === "snoozed").length,
    completedCount: rows.filter((control) => control.status === "completed").length,
    urgentCount: rows.filter((control) => control.priority === "urgent" && control.status !== "completed" && control.status !== "dismissed").length,
    controls: rows,
    summary: generateCalendarSummary(rows),
    nextBestControl: getNextBestControl(rows),
  };
}
