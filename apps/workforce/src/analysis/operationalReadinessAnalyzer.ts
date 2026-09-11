import type {
  AnalysisRule,
  AnalysisSettings,
  DecisionReport,
  Employee,
  MaintenanceReport,
  MonthlyGoal,
  OperationalReadinessReport,
  OperationalReadinessStatus,
  PreventiveAlert,
  ReadinessCheck,
  ReadinessCheckCategory,
  ReadinessCheckSeverity,
  Space,
  TaskType,
  WeeklyScheduleItem,
  WorkforceSnapshot,
} from "../models/workforce";
import { createId, nowIso, toPersianNumber } from "../models/workforce";
import { normalizeAnalysisSettings } from "../services/analysisSettingsService";

export interface OperationalReadinessInput {
  spaces: Space[];
  employees: Employee[];
  taskTypes: TaskType[];
  scheduleItems: WeeklyScheduleItem[];
  rules: AnalysisRule[];
  settings?: Partial<AnalysisSettings>;
  snapshots?: WorkforceSnapshot[];
  maintenanceReport?: MaintenanceReport;
  decisionReports?: DecisionReport[];
  monthlyGoals?: MonthlyGoal[];
  preventiveAlerts?: PreventiveAlert[];
}

const requiredRuleKeys = ["space-capacity", "focus", "basement-safety", "store-coverage", "compatibility"];

function check(
  id: string,
  category: ReadinessCheckCategory,
  title: string,
  passed: boolean,
  severity: ReadinessCheckSeverity,
  scoreImpact: number,
  description: string,
  actionLabel: string,
  actionPath: string,
  evidence: string,
): ReadinessCheck {
  return {
    id,
    category,
    title,
    description,
    severity,
    passed,
    scoreImpact: passed ? 0 : scoreImpact,
    actionLabel,
    actionPath,
    evidence,
  };
}

export function checkBaseDataReadiness(input: OperationalReadinessInput): ReadinessCheck[] {
  const activeSpaces = input.spaces.filter((item) => item.isActive);
  const activeEmployees = input.employees.filter((item) => item.isActive);
  const activeTaskTypes = input.taskTypes.filter((item) => item.isActive);

  return [
    check("base-space", "base_data", "فضاهای فعال", activeSpaces.length > 0, "critical", 25, "برای زمان‌بندی قابل اعتماد حداقل یک فضای فعال لازم است.", "مدیریت فضاها", "/organization/workforce-dashboard/spaces", `${toPersianNumber(activeSpaces.length)} فضای فعال`),
    check("base-employee", "base_data", "کارمندان فعال", activeEmployees.length > 0, "critical", 25, "برای شروع عملیات حداقل یک کارمند فعال باید ثبت شده باشد.", "مدیریت کارمندان", "/organization/workforce-dashboard/employees", `${toPersianNumber(activeEmployees.length)} کارمند فعال`),
    check("base-task", "base_data", "نوع کار فعال", activeTaskTypes.length > 0, "critical", 20, "برنامه بدون نوع کار قابل تحلیل دقیق نیست.", "مدیریت نوع کارها", "/organization/workforce-dashboard/tasks", `${toPersianNumber(activeTaskTypes.length)} نوع کار فعال`),
  ];
}

export function checkScheduleReadiness(input: OperationalReadinessInput): ReadinessCheck[] {
  const activeItems = input.scheduleItems.filter((item) => item.isActive);
  const employees = new Set(input.employees.filter((item) => item.isActive).map((item) => item.id));
  const spaces = new Set(input.spaces.filter((item) => item.isActive).map((item) => item.id));
  const taskTypes = new Set(input.taskTypes.filter((item) => item.isActive).map((item) => item.id));
  const invalidItems = activeItems.filter((item) => !employees.has(item.employeeId) || !spaces.has(item.spaceId) || !taskTypes.has(item.taskTypeId));

  return [
    check("schedule-has-items", "schedule", "برنامه هفتگی فعال", activeItems.length > 0, "warning", 10, "برای نمایش عملیاتی داشبورد حداقل یک آیتم برنامه فعال لازم است.", "باز کردن برنامه هفتگی", "/organization/workforce-dashboard/schedule", `${toPersianNumber(activeItems.length)} آیتم فعال`),
    check("schedule-valid-refs", "schedule", "ارجاع‌های معتبر برنامه", invalidItems.length === 0, "critical", 25, "آیتم‌های برنامه باید به کارمند، فضا و نوع کار فعال وصل باشند.", "بازبینی برنامه", "/organization/workforce-dashboard/schedule", `${toPersianNumber(invalidItems.length)} آیتم نامعتبر`),
  ];
}

export function checkRulesReadiness(input: OperationalReadinessInput): ReadinessCheck[] {
  const activeRuleKeys = new Set(input.rules.filter((item) => item.isActive).map((item) => item.key));
  const missingRules = requiredRuleKeys.filter((key) => !activeRuleKeys.has(key));
  const settings = normalizeAnalysisSettings(input.settings);
  const hoursValid = settings.storeWorkingHours.startTime < settings.storeWorkingHours.endTime;
  const workloadValid = settings.workloadCriticalHours > settings.workloadWarningHours;
  const riskValid = settings.riskImpact.critical > settings.riskImpact.warning && settings.riskImpact.warning > settings.riskImpact.info;

  return [
    check("rules-core", "rules", "قوانین هسته فعال", missingRules.length === 0, "critical", 20, "قوانین ظرفیت، تمرکز، ایمنی، پوشش فروشگاه و سازگاری باید فعال باشند.", "بررسی قوانین", "/organization/workforce-dashboard/rules", missingRules.length ? `غیرفعال: ${missingRules.join(", ")}` : "همه قوانین هسته فعال هستند"),
    check("analysis-hours", "analysis", "ساعت کاری فروشگاه معتبر", hoursValid, "critical", 20, "ساعت پایان فعالیت باید بعد از ساعت شروع باشد.", "تنظیمات تحلیل", "/organization/workforce-dashboard/settings", `${settings.storeWorkingHours.startTime} تا ${settings.storeWorkingHours.endTime}`),
    check("analysis-thresholds", "analysis", "آستانه‌های ریسک منطقی", workloadValid && riskValid, "critical", 20, "آستانه بحرانی باید بالاتر از هشدار باشد و امتیازهای ریسک ترتیب درست داشته باشند.", "تنظیمات تحلیل", "/organization/workforce-dashboard/settings", `فشار ${toPersianNumber(settings.workloadWarningHours)}/${toPersianNumber(settings.workloadCriticalHours)} | ریسک ${toPersianNumber(settings.riskImpact.info)}/${toPersianNumber(settings.riskImpact.warning)}/${toPersianNumber(settings.riskImpact.critical)}`),
  ];
}

export function checkBackupReadiness(input: OperationalReadinessInput): ReadinessCheck[] {
  const snapshots = input.snapshots ?? [];
  const staleOrMissing = input.maintenanceReport?.issues.some((issue) => issue.type === "no_backup" || issue.type === "stale_snapshot") ?? snapshots.length === 0;

  return [
    check("backup-snapshot", "backup", "Snapshot قابل بازگشت", snapshots.length > 0, "warning", 10, "قبل از استفاده عملیاتی حداقل یک snapshot لازم است.", "ساخت snapshot", "/organization/workforce-dashboard/data-center", `${toPersianNumber(snapshots.length)} snapshot`),
    check("backup-fresh", "backup", "تازگی بکاپ", !staleOrMissing, "warning", 8, "بکاپ قدیمی یا نبود بکاپ ریسک بازگشت‌پذیری را بالا می‌برد.", "بررسی مرکز داده", "/organization/workforce-dashboard/data-center", input.maintenanceReport?.snapshotRecommendation ?? "بر اساس snapshotهای ذخیره‌شده"),
  ];
}

export function checkMaintenanceReadiness(input: OperationalReadinessInput): ReadinessCheck[] {
  const report = input.maintenanceReport;
  const criticalCount = report?.criticalCount ?? 0;
  const risky = report ? report.healthStatus === "risky" || report.healthStatus === "critical" : false;

  return [
    check("maintenance-report", "maintenance", "کنسول نگهداری اجرا شده", Boolean(report), "warning", 8, "گزارش نگهداری باید قبل از شروع عملیات دیده شود.", "کنسول نگهداری", "/organization/workforce-dashboard/maintenance", report ? report.summary : "گزارش موجود نیست"),
    check("maintenance-critical", "maintenance", "بدون خطای بحرانی داده", criticalCount === 0 && !risky, "critical", 30, "خطاهای بحرانی localStorage یا ارجاع‌ها می‌توانند تحلیل را بی‌اعتبار کنند.", "رفع خطاها", "/organization/workforce-dashboard/maintenance", `${toPersianNumber(criticalCount)} خطای بحرانی`),
  ];
}

export function checkReportReadiness(input: OperationalReadinessInput): ReadinessCheck[] {
  const reports = input.decisionReports ?? [];
  return [
    check("reports-history", "reports", "گزارش تصمیم ثبت‌شده", reports.length > 0, "warning", 6, "برای آمادگی مدیریتی بهتر حداقل یک گزارش تصمیم ذخیره شود.", "گزارش تصمیم", "/organization/workforce-dashboard/decision-report", `${toPersianNumber(reports.length)} گزارش`),
  ];
}

export function checkMonthlyGoalReadiness(input: OperationalReadinessInput): ReadinessCheck[] {
  const goals = input.monthlyGoals ?? [];
  const activeGoals = goals.filter((item) => !item.isArchived && item.status !== "achieved");
  const missedGoals = goals.filter((item) => item.status === "missed");

  return [
    check("monthly-goal-active", "monthly_goals", "هدف ماهانه فعال", activeGoals.length > 0, "warning", 6, "برای مسیر مدیریتی روشن حداقل یک هدف ماهانه باز لازم است.", "سلامت ماهانه", "/organization/workforce-dashboard/monthly-health", `${toPersianNumber(activeGoals.length)} هدف فعال`),
    check("monthly-goal-missed", "monthly_goals", "هدف عقب‌افتاده کنترل شده", missedGoals.length === 0, missedGoals.length > 2 ? "critical" : "warning", missedGoals.length > 2 ? 20 : 8, "هدف‌های missed باید به اقدام پیشگیرانه یا تصمیم مدیریتی تبدیل شوند.", "بررسی اهداف", "/organization/workforce-dashboard/monthly-health", `${toPersianNumber(missedGoals.length)} هدف عقب‌افتاده`),
  ];
}

export function checkPreventiveAlertReadiness(input: OperationalReadinessInput): ReadinessCheck[] {
  const alerts = input.preventiveAlerts ?? [];
  const openCritical = alerts.filter((item) => item.status === "open" && (item.severity === "critical" || item.priority === "urgent"));
  const unmanaged = alerts.filter((item) => item.status === "open" || item.status === "acknowledged");

  return [
    check("preventive-critical-open", "preventive_alerts", "هشدار پیشگیرانه بحرانی باز", openCritical.length === 0, "critical", 25, "هشدارهای urgent یا critical باز باید قبل از شروع عملیات تصمیم‌گیری شوند.", "هشدارهای پیشگیرانه", "/organization/workforce-dashboard/preventive-alerts", `${toPersianNumber(openCritical.length)} هشدار بحرانی باز`),
    check("preventive-managed", "preventive_alerts", "هشدارها دارای وضعیت پیگیری", unmanaged.length === 0, "warning", 6, "هشدارهای باز یا فقط تاییدشده هنوز برنامه اقدام ندارند.", "پیگیری هشدارها", "/organization/workforce-dashboard/preventive-alerts", `${toPersianNumber(unmanaged.length)} هشدار بدون برنامه`),
  ];
}

export function calculateReadinessScore(checks: ReadinessCheck[]) {
  const score = checks.reduce((total, item) => total - (item.passed ? 0 : item.scoreImpact), 100);
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function determineReadinessStatus(score: number, checks: ReadinessCheck[]): OperationalReadinessStatus {
  const hasCriticalMaintenance = checks.some((item) => !item.passed && item.category === "maintenance" && item.severity === "critical");
  if (score < 50 || hasCriticalMaintenance) return "risky";
  if (score < 70) return "needs_setup";
  if (score < 85) return "almost_ready";
  return "ready";
}

export function generateReadinessTopActions(checks: ReadinessCheck[]) {
  return checks
    .filter((item) => !item.passed)
    .sort((a, b) => {
      const severityScore = (value: ReadinessCheckSeverity) => value === "critical" ? 3 : value === "warning" ? 2 : 1;
      return severityScore(b.severity) - severityScore(a.severity) || b.scoreImpact - a.scoreImpact;
    })
    .slice(0, 5);
}

export function buildOperationalReadinessReport(input: OperationalReadinessInput): OperationalReadinessReport {
  const checks = [
    ...checkBaseDataReadiness(input),
    ...checkScheduleReadiness(input),
    ...checkRulesReadiness(input),
    ...checkBackupReadiness(input),
    ...checkMaintenanceReadiness(input),
    ...checkReportReadiness(input),
    ...checkMonthlyGoalReadiness(input),
    ...checkPreventiveAlertReadiness(input),
  ];
  const score = calculateReadinessScore(checks);
  const status = determineReadinessStatus(score, checks);
  const failedChecks = checks.filter((item) => !item.passed);
  const criticalCount = failedChecks.filter((item) => item.severity === "critical").length;
  const warningCount = failedChecks.filter((item) => item.severity === "warning").length;

  return {
    id: createId("readiness"),
    generatedAt: nowIso(),
    score,
    status,
    passedCount: checks.length - failedChecks.length,
    warningCount,
    criticalCount,
    checks,
    topActions: generateReadinessTopActions(checks),
    summary: failedChecks.length
      ? `${toPersianNumber(failedChecks.length)} مورد قبل از شروع عملیاتی نیاز به پیگیری دارد.`
      : "ماژول برای شروع عملیاتی سبک آماده است.",
  };
}
