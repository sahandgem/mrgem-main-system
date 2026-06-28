import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  applyScenarioBatchToSchedule,
  detectScenarioConflicts,
  selectBestSafeScenarioCombination,
  simulateDecisionBatch,
} from "../src/analysis/workforceDecisionQueue.ts";
import {
  buildReportTrend,
  calculateMonthlySummary,
  compareDecisionReports,
  detectRecurringRisks,
  findBestAndWorstReports,
} from "../src/analysis/decisionReportAnalytics.ts";
import {
  buildMonthlyHealthDashboard,
  calculateMonthlyHealthLevel,
  detectMonthlyTrendStatus,
  findTopRecurringMonthlyRisks,
} from "../src/analysis/monthlyHealthAnalyzer.ts";
import {
  buildOperationalReadinessReport,
  calculateReadinessScore,
  determineReadinessStatus,
} from "../src/analysis/operationalReadinessAnalyzer.ts";
import {
  buildLaunchChecklistFromReadiness,
  calculateLaunchProgress,
  getNextBestLaunchStep,
} from "../src/analysis/launchChecklistBuilder.ts";
import {
  buildLaunchBaselineSummary,
  buildLaunchSignoffDraft,
  getLaunchSignoffBlockers,
  type LaunchSignoffContext,
} from "../src/analysis/launchSignoffBuilder.ts";
import {
  buildBaselineDriftReport,
  calculateDriftScore,
  compareCurrentStateToBaseline,
  determineDriftLevel,
} from "../src/analysis/baselineDriftAnalyzer.ts";
import {
  buildLegacyBaselineGuidance,
  getBaselineCompatibilityActionLabel,
  getBaselineCompatibilityTone,
} from "../src/analysis/baselineCompatibilityMessages.ts";
import {
  buildDriftTrend,
  calculateOperationalHistorySummary,
  detectIncreasingDriftTrend,
} from "../src/analysis/operationalHistoryAnalytics.ts";
import {
  buildHistoryRetentionReport,
  detectArchiveCandidates,
  detectExpiredResignoffs,
  detectHistoryTooLarge,
  detectStaleDriftEvents,
  getDefaultHistoryRetentionPolicy,
} from "../src/analysis/historyRetentionAnalyzer.ts";
import {
  buildOperationsCalendarReport,
  calculateControlStatus,
  generateControlItemsFromSystemState,
  getNextBestControl,
  type OperationsCalendarSystemState,
} from "../src/analysis/operationsCalendarAnalyzer.ts";
import {
  buildPreventiveAlerts,
  detectFailedGoalAlerts,
  detectRecurringRiskAlerts,
  detectWorseningTrendAlerts,
} from "../src/analysis/preventiveAlertAnalyzer.ts";
import { buildMaintenanceReport } from "../src/analysis/workforceMaintenanceAnalyzer.ts";
import { analyzeWorkforce } from "../src/analysis/workforceAnalyzer.ts";
import {
  buildScenarioFromCompatibilityFinding,
  buildScenarioFromFocusFinding,
  generateRecommendationScenarios,
  rankRecommendationScenarios,
} from "../src/analysis/workforceRecommendationEngine.ts";
import { simulateScheduleChange } from "../src/analysis/workforceSimulator.ts";
import { overlaps } from "../src/analysis/timeUtils.ts";
import type { AnalysisRule, AnalysisSettings, Employee, OperationalReadinessReport, Space, TaskType, WeeklyScheduleItem } from "../src/models/workforce";
import { weekDays } from "../src/models/workforce.ts";
import { defaultAnalysisSettings } from "../src/services/analysisSettingsService.ts";
import { createDecisionReportFromBatch, decisionReportService } from "../src/services/decisionReportService.ts";
import { monthlyGoalService } from "../src/services/monthlyGoalService.ts";
import { preventiveAlertKey, preventiveAlertStateService } from "../src/services/preventiveAlertStateService.ts";
import {
  buildBackupCoverageReport,
  calculateComparableChecksum,
  isLegacyBackupCoverageBaseline,
  workforceBackupCoverageVersion,
  workforceBackupKeys,
  workforceBackupService,
} from "../src/services/workforceBackupService.ts";
import { workforceMaintenanceService } from "../src/services/workforceMaintenanceService.ts";
import { launchChecklistService } from "../src/services/launchChecklistService.ts";
import { launchSignoffService } from "../src/services/launchSignoffService.ts";
import { operationalResignoffService } from "../src/services/operationalResignoffService.ts";
import { operationalHistoryService } from "../src/services/operationalHistoryService.ts";
import { historyRetentionService } from "../src/services/historyRetentionService.ts";
import { operationsCalendarService } from "../src/services/operationsCalendarService.ts";
import {
  getDefaultSchedulePolicy,
  operationsControlSettingsService,
} from "../src/services/operationsControlSettingsService.ts";
import {
  buildOperationsCalendarIcs,
  buildOperationsCalendarJson,
  escapeIcsText,
} from "../src/services/operationsCalendarExportService.ts";
import {
  buildNotificationsFromControls,
  operationalNotificationService,
} from "../src/services/operationalNotificationService.ts";
import {
  findWorkforceRouteManifestItem,
  normalizeWorkforcePath,
  workforceRouteManifest,
} from "../src/routes/workforceRouteManifest.ts";
import { workforceStorageKeyRegistry, type WorkforceStorageKeyRegistryItem } from "../src/registry/workforceStorageKeys.ts";

const timestamp = "2026-01-01T00:00:00.000Z";

{
  const paths = workforceRouteManifest.map((route) => route.path);
  const requiredPaths = [
    "/organization/workforce-dashboard",
    "/organization/workforce-dashboard/spaces",
    "/organization/workforce-dashboard/employees",
    "/organization/workforce-dashboard/tasks",
    "/organization/workforce-dashboard/schedule",
    "/organization/workforce-dashboard/analysis",
    "/organization/workforce-dashboard/simulator",
    "/organization/workforce-dashboard/data-center",
    "/organization/workforce-dashboard/baseline-drift",
    "/organization/workforce-dashboard/operations-calendar",
    "/organization/workforce-dashboard/operations-control-settings",
  ];
  assert.equal(new Set(paths).size, paths.length);
  requiredPaths.forEach((path) => assert.equal(paths.includes(path), true));
  assert.equal(workforceRouteManifest.every((route) => Boolean(route.componentKey)), true);
  assert.equal(workforceRouteManifest.filter((route) => route.showInNavigation).some((route) => route.path === "/organization/workforce-dashboard"), true);
  assert.equal(workforceRouteManifest.find((route) => route.path === "/organization/workforce-dashboard/report-comparison")?.showInNavigation, false);
  assert.equal(normalizeWorkforcePath("/organization/workforce-dashboard/"), "/organization/workforce-dashboard");
  assert.equal(findWorkforceRouteManifestItem("/unknown").path, "/organization/workforce-dashboard");
}

{
  const p28PageEntries = [
    ["src/pages/workforce/system/DataCenterPage.tsx", "/organization/workforce-dashboard/data-center"],
    ["src/pages/workforce/system/BaselineDriftPage.tsx", "/organization/workforce-dashboard/baseline-drift"],
    ["src/pages/workforce/system/LaunchSignoffPage.tsx", "/organization/workforce-dashboard/launch-signoff"],
    ["src/pages/workforce/system/ReadinessPage.tsx", "/organization/workforce-dashboard/readiness"],
    ["src/pages/workforce/system/LaunchChecklistPage.tsx", "/organization/workforce-dashboard/launch-checklist"],
    ["src/pages/workforce/system/OperationsCalendarPage.tsx", "/organization/workforce-dashboard/operations-calendar"],
    ["src/pages/workforce/system/OperationsControlSettingsPage.tsx", "/organization/workforce-dashboard/operations-control-settings"],
  ] as const;

  p28PageEntries.forEach(([filePath, expectedPath]) => {
    const source = readFileSync(filePath, "utf8");
    assert.equal(source.includes("WorkforceRoutePage as default"), false);
    assert.equal(source.includes(expectedPath), true);
    assert.equal(source.includes("createWorkforcePage"), true);
  });
}

{
  const p29ExtractedPages = [
    "src/pages/workforce/system/MaintenancePage.tsx",
    "src/pages/workforce/operations/HistoryRetentionPage.tsx",
    "src/pages/workforce/system/OperationalHistoryPage.tsx",
  ];

  p29ExtractedPages.forEach((filePath) => {
    const source = readFileSync(filePath, "utf8");
    assert.equal(source.includes("../../../WorkforcePages"), false);
    assert.equal(source.includes("WorkforceRouteAdapter"), false);
    assert.equal(source.includes("createWorkforcePage"), false);
    assert.equal(source.includes("export default function"), true);
  });
}

const activeRules: AnalysisRule[] = [
  { id: "rule-capacity", key: "space-capacity", title: "capacity", description: "", tone: "warn", isActive: true, createdAt: timestamp, updatedAt: timestamp },
  { id: "rule-focus", key: "focus", title: "focus", description: "", tone: "focus", isActive: true, createdAt: timestamp, updatedAt: timestamp },
  { id: "rule-safety", key: "basement-safety", title: "safety", description: "", tone: "critical", isActive: true, createdAt: timestamp, updatedAt: timestamp },
  { id: "rule-store", key: "store-coverage", title: "store", description: "", tone: "sales", isActive: true, createdAt: timestamp, updatedAt: timestamp },
  { id: "rule-workload", key: "workload-pressure", title: "workload", description: "", tone: "warn", isActive: true, createdAt: timestamp, updatedAt: timestamp },
  { id: "rule-compatibility", key: "compatibility", title: "compatibility", description: "", tone: "critical", isActive: true, createdAt: timestamp, updatedAt: timestamp },
];

const employee = (id: string, goodForSales = false): Employee => ({
  id,
  name: id,
  primaryRole: "",
  skills: [],
  focusNeed: "ط²غŒط§ط¯",
  goodForSales,
  goodForProduction: false,
  goodForDigital: false,
  defaultSpaceId: "",
  description: "",
  isActive: true,
  createdAt: timestamp,
  updatedAt: timestamp,
});

const space = (id: string, normalCapacity: number, maxCapacity: number, requiresCompanion = false): Space => ({
  id,
  name: id,
  type: "",
  normalCapacity,
  maxCapacity,
  distractionLevel: "ط²غŒط§ط¯",
  requiresCompanion,
  soloWorkAllowed: !requiresCompanion,
  description: "",
  isActive: true,
  createdAt: timestamp,
  updatedAt: timestamp,
});

const task = (id: string): TaskType => ({
  id,
  name: id,
  category: "",
  focusNeed: "ط²غŒط§ط¯",
  needsCleanSpace: false,
  requiresCompanion: false,
  requiresCustomerPresence: false,
  suggestedSpaceId: "",
  description: "",
  isActive: true,
  createdAt: timestamp,
  updatedAt: timestamp,
});

const item = (id: string, employeeId: string, spaceId: string, startTime = "10:00", endTime = "11:00"): WeeklyScheduleItem => ({
  id,
  day: weekDays[0],
  startTime,
  endTime,
  employeeId,
  spaceId,
  taskTypeId: "task",
  priority: "ظ…ط¹ظ…ظˆظ„غŒ",
  description: "",
  isActive: true,
  createdAt: timestamp,
  updatedAt: timestamp,
});

const settings: AnalysisSettings = {
  ...defaultAnalysisSettings,
  storeWorkingHours: { startTime: "10:00", endTime: "11:00" },
  workloadWarningHours: 1,
  workloadCriticalHours: 2,
};

assert.equal(overlaps(item("a", "e1", "s1", "09:00", "11:00"), item("b", "e2", "s1", "10:00", "12:00")), true);
assert.equal(overlaps(item("a", "e1", "s1", "09:00", "10:00"), item("b", "e2", "s1", "10:00", "11:00")), false);

{
  const result = analyzeWorkforce({ spaces: [space("s1", 1, 2)], employees: [employee("e1", true)], taskTypes: [task("task")], scheduleItems: [item("i1", "e1", "s1")], rules: activeRules, settings });
  assert.equal(result.findings.some((finding) => finding.ruleId === "rule-capacity"), false);
}

{
  const now = "2026-06-27T12:00:00.000Z";
  const systemState: OperationsCalendarSystemState = {
    now,
    retentionStatus: "risky",
    retentionNeedsSnapshot: true,
    retentionNeedsArchive: true,
    staleDriftCount: 1,
    expiredResignoffCount: 1,
    maintenanceIssueCount: 2,
    maintenanceCritical: true,
    driftLevel: "high",
    driftRequiresResignoff: true,
    readinessStatus: "risky",
    monthlyHealthNeedsReview: true,
    hasCurrentMonthGoal: false,
    urgentPreventiveAlertCount: 1,
    launchChecklistOpenCount: 3,
  };
  const before = JSON.stringify(systemState);
  const controls = generateControlItemsFromSystemState(systemState);
  assert.equal(controls.some((item) => item.type === "snapshot_due" && item.status === "overdue"), true);
  assert.equal(controls.some((item) => item.type === "archive_due"), true);
  assert.equal(controls.some((item) => item.type === "drift_review"), true);
  assert.equal(controls.some((item) => item.type === "resignoff_due"), true);
  assert.equal(controls.some((item) => item.type === "maintenance_review" && item.priority === "urgent"), true);
  assert.equal(calculateControlStatus("2026-06-26T12:00:00.000Z", now), "overdue");
  assert.equal(getNextBestControl(controls)?.priority, "urgent");
  assert.equal(buildOperationsCalendarReport(controls).overdueCount > 0, true);
  assert.equal(JSON.stringify(systemState), before);

  operationsCalendarService.__memory.clear();
  const initial = operationsCalendarService.rebuild(systemState);
  const completedId = initial.controls.find((item) => item.type === "maintenance_review")?.id;
  const snoozedId = initial.controls.find((item) => item.type === "archive_due")?.id;
  assert.ok(completedId);
  assert.ok(snoozedId);
  operationsCalendarService.markCompleted(completedId, "reviewed");
  operationsCalendarService.snooze(snoozedId, "2026-07-15T12:00:00.000Z", "next review");
  const rebuilt = operationsCalendarService.rebuild(systemState);
  assert.equal(rebuilt.controls.find((item) => item.id === completedId)?.status, "completed");
  assert.equal(rebuilt.controls.find((item) => item.id === completedId)?.managerNote, "reviewed");
  assert.equal(rebuilt.controls.find((item) => item.id === snoozedId)?.status, "snoozed");
  assert.equal(rebuilt.controls.find((item) => item.id === snoozedId)?.snoozedUntil, "2026-07-15T12:00:00.000Z");
}

{
  const now = "2026-06-27T12:00:00.000Z";
  const baseState: OperationsCalendarSystemState = {
    now,
    latestSnapshotAt: now,
    latestBackupAt: now,
    retentionStatus: "healthy",
    retentionNeedsSnapshot: false,
    retentionNeedsArchive: false,
    staleDriftCount: 0,
    expiredResignoffCount: 0,
    maintenanceIssueCount: 0,
    maintenanceCritical: false,
    driftLevel: "none",
    driftRequiresResignoff: false,
    readinessStatus: "ready",
    monthlyHealthNeedsReview: false,
    hasCurrentMonthGoal: true,
    urgentPreventiveAlertCount: 0,
    launchChecklistOpenCount: 0,
  };
  const defaultPolicy = getDefaultSchedulePolicy();
  assert.equal(defaultPolicy.snapshotEveryDays, 7);
  assert.equal(defaultPolicy.backupEveryDays, 14);
  assert.equal(defaultPolicy.archiveEveryDays, 60);
  assert.equal(defaultPolicy.enabledControlTypes.length, 10);

  const invalidDraft = { ...defaultPolicy, snapshotEveryDays: 0, backupEveryDays: Number.NaN };
  const invalidBefore = JSON.stringify(invalidDraft);
  const validation = operationsControlSettingsService.validatePolicy(invalidDraft);
  assert.equal(validation.isValid, false);
  assert.equal(validation.policy.snapshotEveryDays, 1);
  assert.equal(validation.policy.backupEveryDays, 14);
  assert.equal(JSON.stringify(invalidDraft), invalidBefore);

  const withoutSnapshot = { ...defaultPolicy, enabledControlTypes: defaultPolicy.enabledControlTypes.filter((type) => type !== "snapshot_due") };
  assert.equal(generateControlItemsFromSystemState(baseState, withoutSnapshot).some((item) => item.type === "snapshot_due"), false);

  const customPolicy = { ...defaultPolicy, snapshotEveryDays: 10, defaultPriorities: { ...defaultPolicy.defaultPriorities, snapshot_due: "low" as const } };
  const stateBefore = JSON.stringify(baseState);
  const customControls = generateControlItemsFromSystemState(baseState, customPolicy);
  const snapshotControl = customControls.find((item) => item.type === "snapshot_due");
  assert.equal(snapshotControl?.dueAt.slice(0, 10), "2026-07-07");
  assert.equal(snapshotControl?.priority, "low");
  assert.equal(JSON.stringify(baseState), stateBefore);

  const exportOptions = operationsControlSettingsService.getExportOptions();
  const ics = buildOperationsCalendarIcs(customControls, exportOptions, now);
  assert.equal(ics.includes("BEGIN:VCALENDAR"), true);
  assert.equal(ics.includes("BEGIN:VEVENT"), true);
  assert.equal(escapeIcsText("الف،ب;ج\nد\\ه"), "الف،ب\\;ج\\nد\\\\ه");
  const jsonExport = buildOperationsCalendarJson(customControls, customPolicy, exportOptions, "summary", now);
  assert.equal(jsonExport.version, "1.0.0");
  assert.equal(jsonExport.generatedAt, now);
  assert.equal(Array.isArray(jsonExport.controls), true);
  assert.equal(jsonExport.policy.snapshotEveryDays, 10);

  const overdue = { ...customControls[0], id: "notification-control", status: "overdue" as const, priority: "high" as const, dueAt: "2026-06-26T12:00:00.000Z" };
  const preference = operationsControlSettingsService.getNotificationPreferences();
  const controlsBefore = JSON.stringify([overdue]);
  const builtNotifications = buildNotificationsFromControls([overdue], preference, now);
  assert.equal(builtNotifications.length, 1);
  assert.equal(builtNotifications[0].status, "unread");
  assert.equal(JSON.stringify([overdue]), controlsBefore);
  operationalNotificationService.__memory.clear();
  operationalNotificationService.refreshFromControls([overdue], preference);
  operationalNotificationService.markNotificationRead(builtNotifications[0].id);
  assert.equal(operationalNotificationService.listNotifications()[0].status, "read");
}

{
  const result = analyzeWorkforce({ spaces: [space("s1", 1, 2)], employees: [employee("e1"), employee("e2")], taskTypes: [task("task")], scheduleItems: [item("i1", "e1", "s1"), item("i2", "e2", "s1")], rules: activeRules, settings });
  assert.equal(result.findings.some((finding) => finding.ruleId === "rule-capacity" && finding.severity === "warning"), true);
}

{
  const result = analyzeWorkforce({ spaces: [space("s1", 1, 2)], employees: [employee("e1"), employee("e2"), employee("e3")], taskTypes: [task("task")], scheduleItems: [item("i1", "e1", "s1"), item("i2", "e2", "s1"), item("i3", "e3", "s1")], rules: activeRules, settings });
  assert.equal(result.findings.some((finding) => finding.ruleId === "rule-capacity" && finding.severity === "critical"), true);
}

{
  const result = analyzeWorkforce({ spaces: [space("safe", 2, 3, true)], employees: [employee("e1")], taskTypes: [task("task")], scheduleItems: [item("i1", "e1", "safe")], rules: activeRules, settings });
  assert.equal(result.findings.some((finding) => finding.ruleId === "rule-safety" && finding.severity === "critical"), true);
}

{
  const result = analyzeWorkforce({ spaces: [space("safe", 2, 3, true)], employees: [employee("e1"), employee("e2")], taskTypes: [task("task")], scheduleItems: [item("i1", "e1", "safe"), item("i2", "e2", "safe")], rules: activeRules, settings });
  assert.equal(result.findings.some((finding) => finding.ruleId === "rule-safety"), false);
}

{
  const store = { ...space("store", 3, 4), name: "ظپط±ظˆط´گاه" };
  const result = analyzeWorkforce({ spaces: [store], employees: [], taskTypes: [task("task")], scheduleItems: [], rules: activeRules, settings });
  assert.equal(result.findings.some((finding) => finding.ruleId === "rule-store" && finding.severity === "critical"), true);
}

{
  const result = analyzeWorkforce({ spaces: [space("busy", 2, 3)], employees: [employee("e1", true)], taskTypes: [task("task")], scheduleItems: [item("i1", "e1", "busy")], rules: activeRules, settings });
  assert.equal(result.findings.some((finding) => finding.ruleId === "rule-focus" && finding.severity === "critical"), true);
}

{
  const long = item("long", "e1", "s1", "10:00", "11:30");
  const result = analyzeWorkforce({ spaces: [space("s1", 2, 3)], employees: [employee("e1")], taskTypes: [task("task")], scheduleItems: [long], rules: activeRules, settings });
  assert.equal(result.findings.some((finding) => finding.ruleId === "rule-workload" && finding.severity === "warning"), true);
}

{
  const long = item("long", "e1", "s1", "10:00", "13:30");
  const result = analyzeWorkforce({ spaces: [space("s1", 2, 3)], employees: [employee("e1")], taskTypes: [task("task")], scheduleItems: [long], rules: activeRules, settings });
  assert.equal(result.findings.some((finding) => finding.ruleId === "rule-workload" && finding.severity === "critical"), true);
}

{
  const base = analyzeWorkforce({ spaces: [space("s1", 1, 1)], employees: [employee("e1"), employee("e2")], taskTypes: [task("task")], scheduleItems: [item("i1", "e1", "s1"), item("i2", "e2", "s1")], rules: activeRules, settings });
  const heavier = analyzeWorkforce({ spaces: [space("s1", 1, 1)], employees: [employee("e1"), employee("e2")], taskTypes: [task("task")], scheduleItems: [item("i1", "e1", "s1"), item("i2", "e2", "s1")], rules: activeRules, settings: { ...settings, riskImpact: { ...settings.riskImpact, critical: 50 } } });
  assert.equal(heavier.controlScore < base.controlScore, true);
}

{
  const disabledRules = activeRules.map((rule) => rule.key === "space-capacity" ? { ...rule, isActive: false } : rule);
  const result = analyzeWorkforce({ spaces: [space("s1", 1, 1)], employees: [employee("e1"), employee("e2")], taskTypes: [task("task")], scheduleItems: [item("i1", "e1", "s1"), item("i2", "e2", "s1")], rules: disabledRules, settings });
  assert.equal(result.findings.some((finding) => finding.ruleId === "rule-capacity"), false);
}

{
  const busy = space("busy", 2, 3);
  const calm = { ...space("calm", 2, 3), distractionLevel: "low" as any };
  const schedule = [item("i1", "e1", "busy")];
  const result = simulateScheduleChange({
    spaces: [busy, calm],
    employees: [employee("e1")],
    taskTypes: [task("task")],
    scheduleItems: schedule,
    rules: activeRules,
    settings,
    compatibilityRules: [],
  }, { scheduleItemId: "i1", newSpaceId: "calm" });
  assert.equal(result.verdict, "improved");
  assert.equal(result.controlScoreDelta > 0, true);
}

{
  const open = { ...space("open", 2, 3), distractionLevel: "low" as any };
  const blocked = { ...space("blocked", 2, 3), distractionLevel: "low" as any };
  const schedule = [item("i1", "e1", "open")];
  const result = simulateScheduleChange({
    spaces: [open, blocked],
    employees: [employee("e1")],
    taskTypes: [task("task")],
    scheduleItems: schedule,
    rules: activeRules,
    settings,
    compatibilityRules: [{ id: "c1", taskTypeId: "task", spaceId: "blocked", compatibility: "blocked", reason: "blocked test", isActive: true, createdAt: timestamp, updatedAt: timestamp }],
  }, { scheduleItemId: "i1", newSpaceId: "blocked" });
  assert.equal(result.verdict, "worsened");
  assert.equal(result.newFindings.some((finding) => finding.ruleId === "rule-compatibility"), true);
}

{
  const schedule = [item("i1", "e1", "busy")];
  const before = JSON.stringify(schedule);
  simulateScheduleChange({
    spaces: [space("busy", 2, 3), { ...space("calm", 2, 3), distractionLevel: "low" as any }],
    employees: [employee("e1")],
    taskTypes: [task("task")],
    scheduleItems: schedule,
    rules: activeRules,
    settings,
    compatibilityRules: [],
  }, { scheduleItemId: "i1", newSpaceId: "calm" });
  assert.equal(JSON.stringify(schedule), before);
}

{
  const busy = space("busy", 2, 3);
  const calm = { ...space("calm", 2, 3), distractionLevel: "low" as any };
  const result = simulateScheduleChange({
    spaces: [busy, calm],
    employees: [employee("e1")],
    taskTypes: [task("task")],
    scheduleItems: [item("i1", "e1", "busy")],
    rules: activeRules,
    settings,
    compatibilityRules: [],
  }, { scheduleItemId: "i1", newSpaceId: "calm" });
  assert.equal(result.resolvedFindings.length > 0, true);
  assert.equal(result.newFindings.length === 0, true);
}

{
  const busy = space("busy", 2, 3);
  const calm = { ...space("calm", 2, 3), distractionLevel: "low" as any };
  const input = {
    spaces: [busy, calm],
    employees: [employee("e1")],
    taskTypes: [task("task")],
    scheduleItems: [item("i1", "e1", "busy")],
    rules: activeRules,
    settings,
    compatibilityRules: [],
  };
  const finding = analyzeWorkforce(input).findings.find((row) => row.ruleId === "rule-focus");
  assert.ok(finding);
  const scenario = buildScenarioFromFocusFinding(input, finding)[0];
  assert.equal(scenario.type, "move_space");
  assert.equal(scenario.change?.newSpaceId, "calm");
  assert.equal(scenario.canApply, true);
}

{
  const blocked = { ...space("blocked", 2, 3), distractionLevel: "low" as any };
  const allowed = { ...space("allowed", 2, 3), distractionLevel: "low" as any };
  const input = {
    spaces: [blocked, allowed],
    employees: [employee("e1")],
    taskTypes: [task("task")],
    scheduleItems: [item("i1", "e1", "blocked")],
    rules: activeRules,
    settings,
    compatibilityRules: [
      { id: "c1", taskTypeId: "task", spaceId: "blocked", compatibility: "blocked" as const, reason: "", isActive: true, createdAt: timestamp, updatedAt: timestamp },
      { id: "c2", taskTypeId: "task", spaceId: "allowed", compatibility: "preferred" as const, reason: "", isActive: true, createdAt: timestamp, updatedAt: timestamp },
    ],
  };
  const finding = analyzeWorkforce(input).findings.find((row) => row.ruleId === "rule-compatibility");
  assert.ok(finding);
  const scenario = buildScenarioFromCompatibilityFinding(input, finding)[0];
  assert.equal(scenario.change?.newSpaceId, "allowed");
  assert.equal(scenario.canApply, true);
}

{
  const busy = space("busy", 2, 3);
  const calm = { ...space("calm", 2, 3), distractionLevel: "low" as any };
  const input = {
    spaces: [busy, calm],
    employees: [employee("e1")],
    taskTypes: [task("task")],
    scheduleItems: [item("i1", "e1", "busy")],
    rules: activeRules,
    settings,
    compatibilityRules: [],
  };
  const finding = analyzeWorkforce(input).findings.find((row) => row.ruleId === "rule-focus");
  assert.ok(finding);
  const generated = generateRecommendationScenarios(input, finding);
  const sorted = rankRecommendationScenarios([
    { ...generated[0], id: "low", rankScore: generated[0].rankScore - 40, confidence: "low" as const },
    generated[0],
  ]);
  assert.equal(sorted[0].id, generated[0].id);
}

{
  const busy = space("busy", 2, 3);
  const calm = { ...space("calm", 1, 3), distractionLevel: "low" as any };
  const cleanInput = {
    spaces: [busy, { ...calm, normalCapacity: 3 }],
    employees: [employee("e1")],
    taskTypes: [task("task")],
    scheduleItems: [item("i1", "e1", "busy")],
    rules: activeRules,
    settings,
    compatibilityRules: [],
  };
  const warningInput = {
    spaces: [busy, calm],
    employees: [employee("e1"), employee("e2")],
    taskTypes: [task("task")],
    scheduleItems: [item("i1", "e1", "busy"), item("i2", "e2", "calm")],
    rules: activeRules,
    settings,
    compatibilityRules: [],
  };
  const cleanFinding = analyzeWorkforce(cleanInput).findings.find((row) => row.ruleId === "rule-focus");
  const warningFinding = analyzeWorkforce(warningInput).findings.find((row) => row.ruleId === "rule-focus" && row.affectedScheduleItemIds.includes("i1"));
  assert.ok(cleanFinding);
  assert.ok(warningFinding);
  const cleanScenario = buildScenarioFromFocusFinding(cleanInput, cleanFinding)[0];
  const warningScenario = buildScenarioFromFocusFinding(warningInput, warningFinding)[0];
  assert.equal((warningScenario.simulationResult?.newFindings.length ?? 0) > 0, true);
  assert.equal(cleanScenario.rankScore > warningScenario.rankScore, true);
}

{
  const input = {
    spaces: [space("busy", 2, 3)],
    employees: [employee("e1")],
    taskTypes: [task("task")],
    scheduleItems: [item("i1", "e1", "busy")],
    rules: activeRules,
    settings,
    compatibilityRules: [],
  };
  const finding = analyzeWorkforce(input).findings.find((row) => row.ruleId === "rule-focus");
  assert.ok(finding);
  const scenario = buildScenarioFromFocusFinding(input, finding)[0];
  assert.equal(scenario.type, "no_safe_action");
  assert.equal(scenario.canApply, false);
}

{
  const schedule = [item("i1", "e1", "busy")];
  const before = JSON.stringify(schedule);
  const input = {
    spaces: [space("busy", 2, 3), { ...space("calm", 2, 3), distractionLevel: "low" as any }],
    employees: [employee("e1")],
    taskTypes: [task("task")],
    scheduleItems: schedule,
    rules: activeRules,
    settings,
    compatibilityRules: [],
  };
  const finding = analyzeWorkforce(input).findings.find((row) => row.ruleId === "rule-focus");
  assert.ok(finding);
  generateRecommendationScenarios(input, finding);
  assert.equal(JSON.stringify(schedule), before);
}

{
  const busy = space("busy", 2, 3);
  const calm = { ...space("calm", 2, 3), distractionLevel: "low" as any };
  const quiet = { ...space("quiet", 2, 3), distractionLevel: "low" as any };
  const input = {
    spaces: [busy, calm, quiet],
    employees: [employee("e1")],
    taskTypes: [task("task")],
    scheduleItems: [item("i1", "e1", "busy")],
    rules: activeRules,
    settings,
    compatibilityRules: [],
  };
  const finding = analyzeWorkforce(input).findings.find((row) => row.ruleId === "rule-focus");
  assert.ok(finding);
  const scenario = buildScenarioFromFocusFinding(input, finding)[0];
  const otherScenario = { ...scenario, id: "other-space", change: { ...scenario.change!, newSpaceId: "quiet" } };
  const conflicts = detectScenarioConflicts(input, [scenario, otherScenario]);
  assert.equal(conflicts.some((conflict) => conflict.type === "same_schedule_item"), true);
}

{
  const busy = space("busy", 2, 3);
  const calm = { ...space("calm", 2, 3), distractionLevel: "low" as any };
  const schedule = [item("i1", "e1", "busy")];
  const before = JSON.stringify(schedule);
  const input = {
    spaces: [busy, calm],
    employees: [employee("e1")],
    taskTypes: [task("task")],
    scheduleItems: schedule,
    rules: activeRules,
    settings,
    compatibilityRules: [],
  };
  const finding = analyzeWorkforce(input).findings.find((row) => row.ruleId === "rule-focus");
  assert.ok(finding);
  const scenario = buildScenarioFromFocusFinding(input, finding)[0];
  const result = simulateDecisionBatch(input, [scenario]);
  assert.equal(result.verdict, "improved");
  assert.equal(result.controlScoreAfter > result.controlScoreBefore, true);
  assert.equal(JSON.stringify(schedule), before);
}

{
  const open = { ...space("open", 2, 3), distractionLevel: "low" as any };
  const blocked = { ...space("blocked", 2, 3), distractionLevel: "low" as any };
  const input = {
    spaces: [open, blocked],
    employees: [employee("e1")],
    taskTypes: [task("task")],
    scheduleItems: [item("i1", "e1", "open")],
    rules: activeRules,
    settings,
    compatibilityRules: [{ id: "c1", taskTypeId: "task", spaceId: "blocked", compatibility: "blocked" as const, reason: "", isActive: true, createdAt: timestamp, updatedAt: timestamp }],
  };
  const scenario = {
    id: "unsafe-move",
    findingId: "manual",
    type: "move_space" as const,
    title: "unsafe",
    description: "",
    change: { scheduleItemId: "i1", newSpaceId: "blocked" },
    expectedEffect: "",
    confidence: "medium" as const,
    effortLevel: "low" as const,
    riskLevel: "warning" as const,
    rankScore: 10,
    canApply: true,
    reason: "",
  };
  const result = simulateDecisionBatch(input, [scenario]);
  assert.equal(result.safeToApply, false);
  assert.equal(result.conflicts.some((conflict) => conflict.type === "creates_new_critical"), true);
}

{
  const busy = space("busy", 2, 3);
  const calm = { ...space("calm", 2, 3), distractionLevel: "low" as any };
  const quiet = { ...space("quiet", 2, 3), distractionLevel: "low" as any };
  const input = {
    spaces: [busy, calm, quiet],
    employees: [employee("e1")],
    taskTypes: [task("task")],
    scheduleItems: [item("i1", "e1", "busy")],
    rules: activeRules,
    settings,
    compatibilityRules: [],
  };
  const finding = analyzeWorkforce(input).findings.find((row) => row.ruleId === "rule-focus");
  assert.ok(finding);
  const scenario = buildScenarioFromFocusFinding(input, finding)[0];
  const otherScenario = { ...scenario, id: "other-space", rankScore: scenario.rankScore - 1, change: { ...scenario.change!, newSpaceId: "quiet" } };
  const selected = selectBestSafeScenarioCombination(input, [scenario, otherScenario], 1, 5);
  assert.equal(selected.length, 1);
}

{
  const schedule = [item("i1", "e1", "busy"), item("i2", "e2", "busy")];
  const scenarios = [
    {
      id: "allowed",
      findingId: "manual",
      type: "move_space" as const,
      title: "allowed",
      description: "",
      change: { scheduleItemId: "i1", newSpaceId: "calm" },
      expectedEffect: "",
      confidence: "high" as const,
      effortLevel: "low" as const,
      riskLevel: "warning" as const,
      rankScore: 10,
      canApply: true,
      reason: "",
    },
    {
      id: "blocked",
      findingId: "manual",
      type: "move_space" as const,
      title: "blocked",
      description: "",
      change: { scheduleItemId: "i2", newSpaceId: "calm" },
      expectedEffect: "",
      confidence: "low" as const,
      effortLevel: "high" as const,
      riskLevel: "warning" as const,
      rankScore: 1,
      canApply: false,
      reason: "",
    },
  ];
  const result = applyScenarioBatchToSchedule(schedule, scenarios);
  assert.equal(result.scheduleItems.find((row) => row.id === "i1")?.spaceId, "calm");
  assert.equal(result.scheduleItems.find((row) => row.id === "i2")?.spaceId, "busy");
}

{
  decisionReportService.resetDemo();
  const busy = space("busy", 2, 3);
  const calm = { ...space("calm", 2, 3), distractionLevel: "low" as any };
  const input = {
    spaces: [busy, calm],
    employees: [employee("e1")],
    taskTypes: [task("task")],
    scheduleItems: [item("i1", "e1", "busy")],
    rules: activeRules,
    settings,
    compatibilityRules: [],
  };
  const finding = analyzeWorkforce(input).findings.find((row) => row.ruleId === "rule-focus");
  assert.ok(finding);
  const scenario = buildScenarioFromFocusFinding(input, finding)[0];
  const batch = simulateDecisionBatch(input, [scenario]);
  const report = createDecisionReportFromBatch(batch, { title: "test report" });
  assert.equal(report.title, "test report");
  assert.equal(report.summary.controlScoreBefore, batch.controlScoreBefore);
  assert.equal(report.summary.controlScoreAfter, batch.controlScoreAfter);
  assert.equal(report.decisionBatchResult.selectedScenarioIds[0], scenario.id);
}

{
  decisionReportService.resetDemo();
  const baseAnalysis = analyzeWorkforce({ spaces: [space("s1", 2, 3)], employees: [employee("e1")], taskTypes: [task("task")], scheduleItems: [item("i1", "e1", "s1")], rules: activeRules, settings });
  const batch = {
    selectedScenarioIds: ["s1"],
    originalAnalysis: baseAnalysis,
    batchAnalysis: baseAnalysis,
    controlScoreBefore: baseAnalysis.controlScore,
    controlScoreAfter: baseAnalysis.controlScore,
    riskScoreBefore: baseAnalysis.totalRiskScore,
    riskScoreAfter: baseAnalysis.totalRiskScore,
    criticalBefore: baseAnalysis.criticalCount,
    criticalAfter: baseAnalysis.criticalCount,
    warningBefore: baseAnalysis.warningCount,
    warningAfter: baseAnalysis.warningCount,
    verdict: "neutral" as const,
    summary: "neutral batch",
    conflicts: [],
    safeToApply: true,
    appliedChanges: [],
  };
  const report = decisionReportService.createFromBatch(batch);
  const statusUpdated = decisionReportService.updateStatus(report.id, "approved");
  assert.equal(statusUpdated?.status, "approved");
  const noteUpdated = decisionReportService.updateManagerNote(report.id, "manager note");
  assert.equal(noteUpdated?.managerNote, "manager note");
  const archived = decisionReportService.archive(report.id);
  assert.equal(archived?.isArchived, true);
  assert.equal(decisionReportService.list().some((item) => item.id === report.id), false);
  assert.equal(decisionReportService.list(true).some((item) => item.id === report.id), true);
}

{
  const baseAnalysis = analyzeWorkforce({ spaces: [space("s1", 2, 3)], employees: [employee("e1")], taskTypes: [task("task")], scheduleItems: [item("i1", "e1", "s1")], rules: activeRules, settings });
  const makeReport = (id: string, generatedAt: string, control: number, risk: number, title: string) => createDecisionReportFromBatch({
    selectedScenarioIds: [id],
    originalAnalysis: baseAnalysis,
    batchAnalysis: { ...baseAnalysis, controlScore: control, totalRiskScore: risk },
    controlScoreBefore: 50,
    controlScoreAfter: control,
    riskScoreBefore: 50,
    riskScoreAfter: risk,
    criticalBefore: 2,
    criticalAfter: control > 70 ? 0 : 2,
    warningBefore: 3,
    warningAfter: 1,
    verdict: control > 70 ? "improved" as const : "worsened" as const,
    summary: title,
    conflicts: [],
    safeToApply: control > 70,
    appliedChanges: [],
  }, { title, weekLabel: title });
  const a = { ...makeReport("a", "2026-01-02T00:00:00.000Z", 60, 40, "week a"), id: "a", generatedAt: "2026-01-02T00:00:00.000Z", remainingRisks: [{ ...baseAnalysis.findings[0], id: "risk-a", title: "risk repeat" }] };
  const b = { ...makeReport("b", "2026-01-01T00:00:00.000Z", 80, 20, "week b"), id: "b", generatedAt: "2026-01-01T00:00:00.000Z", remainingRisks: [{ ...baseAnalysis.findings[0], id: "risk-b", title: "risk repeat" }] };
  const c = { ...makeReport("c", "2026-01-03T00:00:00.000Z", 90, 10, "week c"), id: "c", generatedAt: "2026-01-03T00:00:00.000Z", remainingRisks: [] };
  const reports = [a, b, c];
  const before = JSON.stringify(reports);
  const trend = buildReportTrend(reports);
  assert.deepEqual(trend.map((point) => point.reportId), ["b", "a", "c"]);
  const bestWorst = findBestAndWorstReports(reports);
  assert.equal(bestWorst.bestReportId, "c");
  assert.equal(bestWorst.worstReportId, "a");
  const comparison = compareDecisionReports(reports);
  assert.equal(comparison.averageControlScore, 77);
  assert.equal(detectRecurringRisks(reports)[0], "risk repeat");
  const monthly = calculateMonthlySummary(reports, "test month");
  assert.equal(monthly.monthLabel, "test month");
  assert.equal(monthly.bestWeek, "week c");
  assert.equal(JSON.stringify(reports), before);
}

{
  const baseAnalysis = analyzeWorkforce({ spaces: [space("s1", 2, 3)], employees: [employee("e1")], taskTypes: [task("task")], scheduleItems: [item("i1", "e1", "s1")], rules: activeRules, settings });
  const makeReport = (id: string, generatedAt: string, control: number, risk: number, title: string) => createDecisionReportFromBatch({
    selectedScenarioIds: [id],
    originalAnalysis: baseAnalysis,
    batchAnalysis: { ...baseAnalysis, controlScore: control, totalRiskScore: risk },
    controlScoreBefore: 50,
    controlScoreAfter: control,
    riskScoreBefore: 50,
    riskScoreAfter: risk,
    criticalBefore: 2,
    criticalAfter: control > 70 ? 0 : 2,
    warningBefore: 3,
    warningAfter: 1,
    verdict: control > 70 ? "improved" as const : "worsened" as const,
    summary: title,
    conflicts: [],
    safeToApply: control > 70,
    appliedChanges: [],
  }, { title, weekLabel: title });
  const risk = { ...baseAnalysis.findings[0], id: "monthly-risk", title: "monthly repeated risk" };
  const reports = [
    { ...makeReport("m1", "2026-02-01T00:00:00.000Z", 60, 40, "m1"), id: "m1", generatedAt: "2026-02-01T00:00:00.000Z", remainingRisks: [risk] },
    { ...makeReport("m2", "2026-02-08T00:00:00.000Z", 75, 25, "m2"), id: "m2", generatedAt: "2026-02-08T00:00:00.000Z", remainingRisks: [risk] },
    { ...makeReport("m3", "2026-02-15T00:00:00.000Z", 88, 10, "m3"), id: "m3", generatedAt: "2026-02-15T00:00:00.000Z", remainingRisks: [risk] },
  ];
  const before = JSON.stringify(reports);
  const dashboard = buildMonthlyHealthDashboard(reports, "2026-02");
  assert.equal(dashboard.reportIds.length, 3);
  assert.equal(dashboard.trendStatus, "improving");
  assert.equal(dashboard.topRecurringRisks[0], "monthly repeated risk");
  assert.equal(calculateMonthlyHealthLevel(90, 10), "excellent");
  assert.equal(calculateMonthlyHealthLevel(40, 60), "critical");
  assert.equal(detectMonthlyTrendStatus([{ ...reports[0], summary: { ...reports[0].summary, controlScoreAfter: 90 } }, { ...reports[1], summary: { ...reports[1].summary, controlScoreAfter: 70 } }]), "worsening");
  assert.equal(findTopRecurringMonthlyRisks(reports)[0], "monthly repeated risk");
  assert.equal(JSON.stringify(reports), before);
}

{
  monthlyGoalService.resetDemo();
  const goal = monthlyGoalService.create({
    monthLabel: "2026-02",
    title: "goal",
    description: "desc",
    targetMetric: "controlScore",
    targetValue: 80,
    currentValue: 60,
    status: "planned",
  });
  assert.equal(monthlyGoalService.filterByMonth("2026-02").length, 1);
  const updated = monthlyGoalService.update(goal.id, { status: "achieved", currentValue: 82 });
  assert.equal(updated?.status, "achieved");
  assert.equal(updated?.currentValue, 82);
  const archived = monthlyGoalService.archive(goal.id);
  assert.equal(archived?.isArchived, true);
  assert.equal(monthlyGoalService.list().some((item) => item.id === goal.id), false);
  assert.equal(monthlyGoalService.list(true).some((item) => item.id === goal.id), true);
}

{
  preventiveAlertStateService.resetDemo();
  const baseAnalysis = analyzeWorkforce({ spaces: [space("s1", 2, 3)], employees: [employee("e1")], taskTypes: [task("task")], scheduleItems: [item("i1", "e1", "s1")], rules: activeRules, settings });
  const risk = { ...baseAnalysis.findings[0], id: "preventive-risk", title: "focus recurring risk" };
  const makeReport = (id: string, generatedAt: string, control: number, riskScore: number) => createDecisionReportFromBatch({
    selectedScenarioIds: [id],
    originalAnalysis: baseAnalysis,
    batchAnalysis: { ...baseAnalysis, controlScore: control, totalRiskScore: riskScore },
    controlScoreBefore: 90,
    controlScoreAfter: control,
    riskScoreBefore: 10,
    riskScoreAfter: riskScore,
    criticalBefore: 0,
    criticalAfter: control < 70 ? 1 : 0,
    warningBefore: 0,
    warningAfter: 1,
    verdict: control < 70 ? "worsened" as const : "neutral" as const,
    summary: id,
    conflicts: [],
    safeToApply: control >= 70,
    appliedChanges: [],
  }, { title: id, weekLabel: id });
  const r1 = { ...makeReport("r1", "2026-03-01T00:00:00.000Z", 90, 10), id: "r1", generatedAt: "2026-03-01T00:00:00.000Z", remainingRisks: [risk] };
  const r2 = { ...makeReport("r2", "2026-03-08T00:00:00.000Z", 80, 20), id: "r2", generatedAt: "2026-03-08T00:00:00.000Z", remainingRisks: [risk] };
  const r3 = { ...makeReport("r3", "2026-03-15T00:00:00.000Z", 60, 40), id: "r3", generatedAt: "2026-03-15T00:00:00.000Z", remainingRisks: [risk] };
  const warningAlert = detectRecurringRiskAlerts([r1, r2])[0];
  assert.equal(warningAlert.severity, "warning");
  const criticalAlert = detectRecurringRiskAlerts([r1, r2, r3])[0];
  assert.equal(criticalAlert.severity, "critical");
  const missedGoalAlerts = detectFailedGoalAlerts([{
    id: "g1",
    monthLabel: "2026-03",
    title: "missed goal",
    description: "",
    targetMetric: "controlScore",
    targetValue: 80,
    currentValue: 60,
    status: "missed",
    createdAt: timestamp,
    updatedAt: timestamp,
  }]);
  assert.equal(missedGoalAlerts[0].sourceType, "failed_goal");
  const worsening = detectWorseningTrendAlerts([r1, r2, r3])[0];
  assert.equal(worsening.sourceType, "worsening_trend");
  const alerts = buildPreventiveAlerts({ reports: [r1, r2, r3], monthlyGoals: [] });
  preventiveAlertStateService.updateStatus(preventiveAlertKey(alerts[0]), "planned");
  const applied = preventiveAlertStateService.applyStates(alerts);
  assert.equal(applied[0].status, "planned");
}

{
  const baseAnalysis = analyzeWorkforce({ spaces: [space("s1", 2, 3)], employees: [employee("e1")], taskTypes: [task("task")], scheduleItems: [item("i1", "e1", "s1")], rules: activeRules, settings });
  const risk = { ...baseAnalysis.findings[0], id: "mutate-risk", title: "mutate recurring risk" };
  const report = createDecisionReportFromBatch({
    selectedScenarioIds: ["x"],
    originalAnalysis: baseAnalysis,
    batchAnalysis: baseAnalysis,
    controlScoreBefore: 50,
    controlScoreAfter: 50,
    riskScoreBefore: 50,
    riskScoreAfter: 50,
    criticalBefore: 1,
    criticalAfter: 1,
    warningBefore: 1,
    warningAfter: 1,
    verdict: "neutral",
    summary: "x",
    conflicts: [],
    safeToApply: false,
    appliedChanges: [],
  }, { title: "x" });
  const reports = [{ ...report, remainingRisks: [risk] }, { ...report, id: "y", remainingRisks: [risk] }];
  const goals = [{ id: "goal", monthLabel: "2026-03", title: "goal", description: "", targetMetric: "x", targetValue: 1, currentValue: 2, status: "missed" as const, createdAt: timestamp, updatedAt: timestamp }];
  const beforeReports = JSON.stringify(reports);
  const beforeGoals = JSON.stringify(goals);
  const alerts = buildPreventiveAlerts({ reports, monthlyGoals: goals });
  const goalBefore = JSON.stringify(alerts[0]);
  monthlyGoalService.create({
    monthLabel: "2026-04",
    title: `کاهش ${alerts[0].affectedArea}`,
    description: "goal from alert",
    targetMetric: "recurring_risk_count",
    targetValue: Math.max(0, alerts[0].repeatedCount - 1),
    currentValue: alerts[0].repeatedCount,
    status: "planned",
  });
  assert.equal(JSON.stringify(alerts[0]), goalBefore);
  assert.equal(JSON.stringify(reports), beforeReports);
  assert.equal(JSON.stringify(goals), beforeGoals);
}

{
  workforceBackupService.__memory.clear();
  workforceBackupService.__memory.set("komak.workforce.spaces.v1", [space("backup-space", 1, 2)]);
  workforceBackupService.__memory.set("komak.workforce.employees.v1", [employee("backup-employee")]);
  workforceBackupService.__memory.set("komak.workforce.taskTypes.v1", [task("task")]);
  workforceBackupService.__memory.set("komak.workforce.scheduleItems.v1", [item("backup-item", "backup-employee", "backup-space")]);
  workforceBackupService.__memory.set("komak.workforce.rules.v1", activeRules);
  workforceBackupService.__memory.set("komak.workforce.launchSignoffs.v1", [{ id: "launch-signoff" }]);
  workforceBackupService.__memory.set("komak.workforce.operationalResignoffs.v1", [{ id: "resignoff" }]);
  workforceBackupService.__memory.set("komak.workforce.historyRetentionPolicy.v1", { id: "policy" });
  workforceBackupService.__memory.set("komak.workforce.historyArchives.v1", [{ id: "archive" }]);
  workforceBackupService.__memory.set("komak.workforce.maintenanceReports.v1", [{ id: "maintenance" }]);
  const bundle = workforceBackupService.createBackupBundle("test");
  for (const key of workforceBackupKeys) {
    assert.equal(Object.prototype.hasOwnProperty.call(bundle.data, key), true);
  }
  assert.equal(Object.prototype.hasOwnProperty.call(bundle.data, "komak.workforce.snapshots.v1"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(bundle.data, "komak.workforce.launchSignoffs.v1"), true);
  assert.equal(Object.prototype.hasOwnProperty.call(bundle.data, "komak.workforce.operationalResignoffs.v1"), true);
  assert.equal(Object.prototype.hasOwnProperty.call(bundle.data, "komak.workforce.historyRetentionPolicy.v1"), true);
  assert.equal(Object.prototype.hasOwnProperty.call(bundle.data, "komak.workforce.historyArchives.v1"), true);
  assert.equal(Object.prototype.hasOwnProperty.call(bundle.data, "komak.workforce.maintenanceReports.v1"), true);
  assert.equal(bundle.metadata.spacesCount, 1);
  assert.equal(bundle.metadata.coverageVersion, workforceBackupCoverageVersion);
  assert.equal(bundle.metadata.knownKeyCount, 24);
  assert.equal(bundle.metadata.includedKeyCount, 23);
  assert.equal(bundle.metadata.excludedKeyCount, 1);
  assert.equal(bundle.metadata.includedKeys?.includes("komak.workforce.launchSignoffs.v1"), true);
  assert.equal(bundle.metadata.excludedKeys?.includes("komak.workforce.snapshots.v1"), true);
  assert.equal(isLegacyBackupCoverageBaseline(bundle), false);
  assert.equal(isLegacyBackupCoverageBaseline({ ...bundle, metadata: { ...bundle.metadata, coverageVersion: undefined } }), true);
  assert.equal(workforceBackupService.validateBackupBundle(bundle).canImport, true);
  assert.equal(workforceBackupService.validateBackupBundle({ appName: "bad", data: {} }).canImport, false);
  assert.equal(workforceBackupService.calculateBackupChecksum({ a: 1, b: [2] }), workforceBackupService.calculateBackupChecksum({ b: [2], a: 1 }));
}

{
  assert.equal(workforceStorageKeyRegistry.length, 24);
  assert.equal(new Set(workforceStorageKeyRegistry.map((item) => item.key)).size, workforceStorageKeyRegistry.length);
  assert.equal(workforceBackupKeys.length, 23);
  const coverage = buildBackupCoverageReport();
  assert.equal(coverage.totalKnownKeys, 24);
  assert.equal(coverage.includedInBackupCount, 23);
  assert.equal(coverage.missingFromBackupCount, 0);
  assert.equal(coverage.criticalMissingCount, 0);
  assert.equal(coverage.status, "complete");

  const criticalGapKeys = workforceBackupKeys.filter((key) => key !== "komak.workforce.spaces.v1");
  const criticalGap = buildBackupCoverageReport(undefined, workforceStorageKeyRegistry, criticalGapKeys);
  assert.equal(criticalGap.status, "risky");
  assert.equal(criticalGap.criticalMissingCount, 1);

  const nonCriticalRegistry: WorkforceStorageKeyRegistryItem[] = workforceStorageKeyRegistry.map((entry) =>
    entry.key === "komak.workforce.monthlyGoals.v1" ? { ...entry, includeInBackup: true, isCritical: false } : { ...entry },
  );
  const nonCriticalGapKeys = workforceBackupKeys.filter((key) => key !== "komak.workforce.monthlyGoals.v1");
  const nonCriticalGap = buildBackupCoverageReport(undefined, nonCriticalRegistry, nonCriticalGapKeys);
  assert.equal(nonCriticalGap.status, "needs_attention");
  assert.equal(nonCriticalGap.criticalMissingCount, 0);

  const completeKeys = workforceStorageKeyRegistry.filter((entry) => entry.includeInBackup).map((entry) => entry.key);
  assert.equal(buildBackupCoverageReport(undefined, workforceStorageKeyRegistry, completeKeys).status, "complete");
}

{
  workforceBackupService.__memory.clear();
  const bundle = workforceBackupService.createBackupBundle("validate");
  const withUnknown = {
    ...bundle,
    data: {
      ...bundle.data,
      "komak.workforce.unknownFutureKey.v1": [{ id: "future" }],
    },
  };
  withUnknown.checksum = workforceBackupService.calculateBackupChecksum(withUnknown.data);
  const unknownValidation = workforceBackupService.validateBackupBundle(withUnknown);
  assert.equal(unknownValidation.canImport, true);
  assert.equal(unknownValidation.warnings.some((warning) => warning.includes("unknownFutureKey")), true);

  const withoutCritical = {
    ...bundle,
    data: Object.fromEntries(Object.entries(bundle.data).filter(([key]) => key !== "komak.workforce.spaces.v1")),
  };
  withoutCritical.checksum = workforceBackupService.calculateBackupChecksum(withoutCritical.data);
  const criticalValidation = workforceBackupService.validateBackupBundle(withoutCritical);
  assert.equal(criticalValidation.canImport, false);
  assert.equal(criticalValidation.errors.some((error) => error.includes("حیاتی")), true);

  const before = JSON.stringify(withUnknown);
  buildBackupCoverageReport(withUnknown);
  workforceBackupService.validateBackupBundle(withUnknown);
  assert.equal(JSON.stringify(withUnknown), before);
}

{
  workforceBackupService.__memory.clear();
  workforceBackupService.__memory.set("komak.workforce.spaces.v1", [space("old-space", 1, 2)]);
  workforceBackupService.__memory.set("komak.workforce.launchSignoffs.v1", [{ id: "old-launch" }]);
  workforceBackupService.__memory.set("komak.workforce.operationalResignoffs.v1", [{ id: "old-resignoff" }]);
  workforceBackupService.__memory.set("komak.workforce.historyRetentionPolicy.v1", { id: "old-policy" });
  workforceBackupService.__memory.set("komak.workforce.historyArchives.v1", [{ id: "old-archive" }]);
  workforceBackupService.__memory.set("komak.workforce.maintenanceReports.v1", [{ id: "old-maintenance" }]);
  const originalBundle = workforceBackupService.createBackupBundle("old");
  const newBundle = {
    ...originalBundle,
    id: "new-bundle",
    data: {
      ...originalBundle.data,
      "komak.workforce.spaces.v1": [space("new-space", 3, 4)],
      "komak.workforce.launchSignoffs.v1": [{ id: "new-launch" }],
      "komak.workforce.operationalResignoffs.v1": [{ id: "new-resignoff" }],
      "komak.workforce.historyRetentionPolicy.v1": { id: "new-policy" },
      "komak.workforce.historyArchives.v1": [{ id: "new-archive" }],
      "komak.workforce.maintenanceReports.v1": [{ id: "new-maintenance" }],
    },
  };
  newBundle.checksum = workforceBackupService.calculateBackupChecksum(newBundle.data);
  const result = workforceBackupService.importBackupBundle(newBundle);
  assert.equal(result.imported, true);
  assert.equal(workforceBackupService.listSnapshots().length, 1);
  assert.equal((workforceBackupService.__memory.get("komak.workforce.spaces.v1") as Space[])[0].id, "new-space");
  assert.equal((workforceBackupService.__memory.get("komak.workforce.launchSignoffs.v1") as Array<{ id: string }>)[0].id, "new-launch");
  assert.equal((workforceBackupService.__memory.get("komak.workforce.operationalResignoffs.v1") as Array<{ id: string }>)[0].id, "new-resignoff");
  assert.equal((workforceBackupService.__memory.get("komak.workforce.historyRetentionPolicy.v1") as { id: string }).id, "new-policy");
  assert.equal((workforceBackupService.__memory.get("komak.workforce.historyArchives.v1") as Array<{ id: string }>)[0].id, "new-archive");
  assert.equal((workforceBackupService.__memory.get("komak.workforce.maintenanceReports.v1") as Array<{ id: string }>)[0].id, "new-maintenance");
  workforceBackupService.restoreSnapshot(result.snapshot!.id);
  assert.equal((workforceBackupService.__memory.get("komak.workforce.spaces.v1") as Space[])[0].id, "old-space");
  assert.equal((workforceBackupService.__memory.get("komak.workforce.launchSignoffs.v1") as Array<{ id: string }>)[0].id, "old-launch");
  assert.equal((workforceBackupService.__memory.get("komak.workforce.operationalResignoffs.v1") as Array<{ id: string }>)[0].id, "old-resignoff");
  assert.equal((workforceBackupService.__memory.get("komak.workforce.historyRetentionPolicy.v1") as { id: string }).id, "old-policy");
  assert.equal((workforceBackupService.__memory.get("komak.workforce.historyArchives.v1") as Array<{ id: string }>)[0].id, "old-archive");
  assert.equal((workforceBackupService.__memory.get("komak.workforce.maintenanceReports.v1") as Array<{ id: string }>)[0].id, "old-maintenance");
}

{
  workforceBackupService.__memory.clear();
  const bundle = workforceBackupService.createBackupBundle("mutate-check");
  const before = JSON.stringify(bundle);
  workforceBackupService.validateBackupBundle(bundle);
  assert.equal(JSON.stringify(bundle), before);
}

{
  const valid = {
    "komak.workforce.spaces.v1": JSON.stringify([space("s1", 1, 2)]),
    "komak.workforce.employees.v1": JSON.stringify([employee("e1")]),
    "komak.workforce.taskTypes.v1": JSON.stringify([task("task")]),
    "komak.workforce.scheduleItems.v1": JSON.stringify([item("i1", "missing", "s1")]),
    "komak.workforce.rules.v1": JSON.stringify(activeRules),
    "komak.workforce.compatibilityRules.v1": JSON.stringify([]),
    "komak.workforce.decisionReports.v1": JSON.stringify([]),
    "komak.workforce.monthlyGoals.v1": JSON.stringify([]),
    "komak.workforce.preventiveAlertStates.v1": JSON.stringify([]),
    "komak.workforce.decisionQueue.v1": JSON.stringify([]),
    "komak.workforce.snapshots.v1": JSON.stringify([]),
  };
  const report = buildMaintenanceReport(valid);
  assert.equal(report.issues.some((issue) => issue.type === "orphan_reference" && issue.entityType === "scheduleItem.employeeId"), true);
  const missingReport = buildMaintenanceReport({ ...valid, "komak.workforce.spaces.v1": null });
  assert.equal(missingReport.issues.some((issue) => issue.type === "missing_storage_key"), true);
  const invalidReport = buildMaintenanceReport({ ...valid, "komak.workforce.spaces.v1": "{bad json" });
  assert.equal(invalidReport.issues.some((issue) => issue.type === "invalid_json"), true);
}

{
  const inactiveEmployee = { ...employee("inactive"), isActive: false };
  const snapshot = {
    "komak.workforce.spaces.v1": JSON.stringify([space("s1", 1, 2)]),
    "komak.workforce.employees.v1": JSON.stringify([inactiveEmployee]),
    "komak.workforce.taskTypes.v1": JSON.stringify([task("task")]),
    "komak.workforce.scheduleItems.v1": JSON.stringify([item("i1", "inactive", "s1")]),
    "komak.workforce.rules.v1": JSON.stringify(activeRules),
    "komak.workforce.compatibilityRules.v1": JSON.stringify([]),
    "komak.workforce.decisionReports.v1": JSON.stringify([]),
    "komak.workforce.monthlyGoals.v1": JSON.stringify([]),
    "komak.workforce.preventiveAlertStates.v1": JSON.stringify([]),
    "komak.workforce.decisionQueue.v1": JSON.stringify([]),
    "komak.workforce.snapshots.v1": JSON.stringify([{ id: "snap", createdAt: "2020-01-01T00:00:00.000Z", bundle: { data: {} } }]),
  };
  const report = buildMaintenanceReport(snapshot);
  assert.equal(report.issues.some((issue) => issue.type === "inactive_reference"), true);
  assert.equal(report.issues.some((issue) => issue.type === "stale_snapshot" && issue.severity === "critical"), true);
}

{
  const duplicate = [space("dup", 1, 2), space("dup", 2, 3)];
  const snapshot = {
    "komak.workforce.spaces.v1": JSON.stringify(duplicate),
    "komak.workforce.employees.v1": JSON.stringify([employee("e1")]),
    "komak.workforce.taskTypes.v1": JSON.stringify([task("task")]),
    "komak.workforce.scheduleItems.v1": JSON.stringify([]),
    "komak.workforce.rules.v1": JSON.stringify(activeRules),
    "komak.workforce.compatibilityRules.v1": JSON.stringify([]),
    "komak.workforce.decisionReports.v1": JSON.stringify([]),
    "komak.workforce.monthlyGoals.v1": JSON.stringify([]),
    "komak.workforce.preventiveAlertStates.v1": JSON.stringify([{ alertKey: "old-alert", status: "open", managerNote: "", updatedAt: timestamp }]),
    "komak.workforce.decisionQueue.v1": JSON.stringify([]),
    "komak.workforce.snapshots.v1": JSON.stringify([{ id: "snap", createdAt: new Date().toISOString(), bundle: { data: {} } }]),
  };
  const before = JSON.stringify(snapshot);
  const report = buildMaintenanceReport(snapshot, ["active-alert"]);
  assert.equal(report.issues.some((issue) => issue.type === "duplicate_id"), true);
  assert.equal(report.issues.some((issue) => issue.fixAction === "remove_stale_preventive_alert_state"), true);
  assert.equal(JSON.stringify(snapshot), before);
}

{
  workforceMaintenanceService.__memory.clear();
  workforceMaintenanceService.__memory.set("komak.workforce.spaces.v1", [space("s1", 1, 2)]);
  workforceMaintenanceService.__memory.set("komak.workforce.employees.v1", [employee("e1")]);
  workforceMaintenanceService.__memory.set("komak.workforce.taskTypes.v1", [task("task")]);
  workforceMaintenanceService.__memory.set("komak.workforce.scheduleItems.v1", []);
  workforceMaintenanceService.__memory.set("komak.workforce.rules.v1", activeRules);
  workforceMaintenanceService.__memory.set("komak.workforce.compatibilityRules.v1", []);
  workforceMaintenanceService.__memory.set("komak.workforce.decisionReports.v1", []);
  workforceMaintenanceService.__memory.set("komak.workforce.monthlyGoals.v1", []);
  workforceMaintenanceService.__memory.set("komak.workforce.preventiveAlertStates.v1", [{ alertKey: "stale", status: "open", managerNote: "", updatedAt: timestamp }]);
  workforceMaintenanceService.__memory.set("komak.workforce.decisionQueue.v1", []);
  workforceMaintenanceService.__memory.set("komak.workforce.snapshots.v1", []);
  const report = workforceMaintenanceService.runReport(["active"]);
  const stale = report.issues.find((issue) => issue.fixAction === "remove_stale_preventive_alert_state");
  assert.ok(stale);
  const beforeSnapshots = workforceBackupService.listSnapshots().length;
  workforceMaintenanceService.runSafeFix(stale);
  assert.equal((workforceMaintenanceService.__memory.get("komak.workforce.preventiveAlertStates.v1") as any[]).length, 0);
  assert.equal(workforceBackupService.listSnapshots().length > beforeSnapshots, true);
}

{
  const report = buildOperationalReadinessReport({
    spaces: [],
    employees: [],
    taskTypes: [],
    scheduleItems: [],
    rules: [],
    settings,
    snapshots: [],
    decisionReports: [],
    monthlyGoals: [],
    preventiveAlerts: [],
  });
  assert.equal(report.checks.some((check) => check.category === "base_data" && !check.passed), true);
  assert.equal(report.score < 70, true);
}

{
  const baseAnalysis = analyzeWorkforce({ spaces: [space("s1", 2, 3)], employees: [employee("e1")], taskTypes: [task("task")], scheduleItems: [item("i1", "e1", "s1")], rules: activeRules, settings });
  const decisionReport = createDecisionReportFromBatch({
    selectedScenarioIds: ["ready"],
    originalAnalysis: baseAnalysis,
    batchAnalysis: baseAnalysis,
    controlScoreBefore: baseAnalysis.controlScore,
    controlScoreAfter: baseAnalysis.controlScore,
    riskScoreBefore: baseAnalysis.totalRiskScore,
    riskScoreAfter: baseAnalysis.totalRiskScore,
    criticalBefore: 0,
    criticalAfter: 0,
    warningBefore: 0,
    warningAfter: 0,
    verdict: "neutral",
    summary: "ready",
    conflicts: [],
    safeToApply: true,
    appliedChanges: [],
  }, { title: "ready" });
  const report = buildOperationalReadinessReport({
    spaces: [space("s1", 2, 3)],
    employees: [employee("e1")],
    taskTypes: [task("task")],
    scheduleItems: [item("i1", "e1", "s1")],
    rules: activeRules,
    settings,
    snapshots: [{ id: "snap", title: "snap", createdAt: new Date().toISOString(), reason: "test", bundle: workforceBackupService.createBackupBundle("ready"), isAuto: false, note: "" }],
    maintenanceReport: { id: "m", generatedAt: timestamp, healthStatus: "healthy", totalIssues: 0, criticalCount: 0, warningCount: 0, infoCount: 0, storageStats: [], issues: [], recommendations: [], snapshotRecommendation: "ok", summary: "healthy" },
    decisionReports: [decisionReport],
    monthlyGoals: [{ id: "goal", monthLabel: "2026-03", title: "goal", description: "", targetMetric: "controlScore", targetValue: 80, currentValue: 70, status: "planned", createdAt: timestamp, updatedAt: timestamp }],
    preventiveAlerts: [],
  });
  assert.equal(report.status === "ready" || report.status === "almost_ready", true);
  assert.equal(report.score >= 85, true);
}

{
  const report = buildOperationalReadinessReport({
    spaces: [space("s1", 2, 3)],
    employees: [employee("e1")],
    taskTypes: [task("task")],
    scheduleItems: [item("i1", "e1", "s1")],
    rules: activeRules,
    settings,
    snapshots: [],
    maintenanceReport: { id: "m", generatedAt: timestamp, healthStatus: "critical", totalIssues: 1, criticalCount: 1, warningCount: 0, infoCount: 0, storageStats: [], issues: [], recommendations: [], snapshotRecommendation: "bad", summary: "critical" },
    decisionReports: [],
    monthlyGoals: [],
    preventiveAlerts: [],
  });
  assert.equal(report.status, "risky");
  assert.equal(report.topActions[0].category, "maintenance");
}

{
  const report = buildOperationalReadinessReport({
    spaces: [space("s1", 2, 3)],
    employees: [employee("e1")],
    taskTypes: [task("task")],
    scheduleItems: [item("i1", "e1", "s1")],
    rules: activeRules,
    settings,
    snapshots: [{ id: "snap", title: "snap", createdAt: new Date().toISOString(), reason: "test", bundle: workforceBackupService.createBackupBundle("alert"), isAuto: false, note: "" }],
    maintenanceReport: { id: "m", generatedAt: timestamp, healthStatus: "healthy", totalIssues: 0, criticalCount: 0, warningCount: 0, infoCount: 0, storageStats: [], issues: [], recommendations: [], snapshotRecommendation: "ok", summary: "healthy" },
    decisionReports: [],
    monthlyGoals: [],
    preventiveAlerts: [{
      id: "alert",
      title: "critical alert",
      description: "",
      severity: "critical",
      sourceType: "recurring_risk",
      repeatedCount: 3,
      firstSeenLabel: "a",
      lastSeenLabel: "b",
      affectedArea: "focus",
      relatedRiskTitles: [],
      relatedGoalIds: [],
      recommendedAction: "act",
      priority: "urgent",
      status: "open",
      createdAt: timestamp,
      updatedAt: timestamp,
    }],
  });
  assert.equal(report.checks.some((check) => check.category === "preventive_alerts" && !check.passed && check.severity === "critical"), true);
}

{
  const checks = [
    { id: "ok", category: "base_data" as const, title: "ok", description: "", severity: "info" as const, passed: true, scoreImpact: 0, actionLabel: "", actionPath: "", evidence: "" },
    { id: "bad", category: "maintenance" as const, title: "bad", description: "", severity: "critical" as const, passed: false, scoreImpact: 30, actionLabel: "", actionPath: "", evidence: "" },
  ];
  assert.equal(calculateReadinessScore(checks), 70);
  assert.equal(determineReadinessStatus(70, checks), "risky");
}

{
  const readiness: OperationalReadinessReport = {
    id: "readiness-launch",
    generatedAt: timestamp,
    score: 50,
    status: "needs_setup",
    passedCount: 1,
    warningCount: 1,
    criticalCount: 1,
    summary: "launch",
    topActions: [],
    checks: [
      { id: "passed", category: "base_data", title: "passed", description: "", severity: "critical", passed: true, scoreImpact: 0, actionLabel: "go", actionPath: "/passed", evidence: "" },
      { id: "warning", category: "schedule", title: "warning", description: "", severity: "warning", passed: false, scoreImpact: 8, actionLabel: "go", actionPath: "/warning", evidence: "" },
      { id: "critical", category: "maintenance", title: "critical", description: "", severity: "critical", passed: false, scoreImpact: 20, actionLabel: "go", actionPath: "/critical", evidence: "" },
    ],
  };
  const before = JSON.stringify(readiness);
  const checklist = buildLaunchChecklistFromReadiness(readiness);
  assert.equal(checklist.items.length, 2);
  assert.equal(checklist.items.some((item) => item.sourceCheckId === "passed"), false);
  assert.equal(checklist.items[0].sourceCheckId, "critical");
  assert.equal(getNextBestLaunchStep(checklist.items)?.sourceCheckId, "critical");
  assert.equal(JSON.stringify(readiness), before);

  launchChecklistService.__memory.clear();
  launchChecklistService.rebuild(readiness);
  const criticalItem = launchChecklistService.list().items.find((item) => item.sourceCheckId === "critical");
  const warningItem = launchChecklistService.list().items.find((item) => item.sourceCheckId === "warning");
  assert.ok(criticalItem);
  assert.ok(warningItem);
  launchChecklistService.complete(criticalItem.id);
  assert.equal(launchChecklistService.list().items.find((item) => item.id === criticalItem.id)?.status, "completed");
  launchChecklistService.dismiss(warningItem.id, "تصمیم مدیر برای شروع");
  const dismissed = launchChecklistService.list().items.find((item) => item.id === warningItem.id);
  assert.equal(dismissed?.status, "dismissed");
  assert.equal(dismissed?.managerNote, "تصمیم مدیر برای شروع");
  assert.equal(calculateLaunchProgress(launchChecklistService.list().items), 50);

  launchChecklistService.rebuild(readiness);
  const rebuiltCritical = launchChecklistService.list().items.find((item) => item.sourceCheckId === "critical");
  const rebuiltWarning = launchChecklistService.list().items.find((item) => item.sourceCheckId === "warning");
  assert.equal(rebuiltCritical?.status, "open");
  assert.equal(rebuiltWarning?.status, "dismissed");
  assert.equal(rebuiltWarning?.managerNote, "تصمیم مدیر برای شروع");
  assert.ok(rebuiltWarning);
  launchChecklistService.reopen(rebuiltWarning.id);
  assert.equal(launchChecklistService.list().items.find((item) => item.id === rebuiltWarning.id)?.status, "open");
}

{
  const readiness: OperationalReadinessReport = {
    id: "signoff-readiness",
    generatedAt: timestamp,
    score: 78,
    status: "almost_ready",
    passedCount: 4,
    warningCount: 1,
    criticalCount: 0,
    checks: [{ id: "signoff-warning", category: "backup", title: "backup warning", description: "needs snapshot", severity: "warning", passed: false, scoreImpact: 8, actionLabel: "backup", actionPath: "/data", evidence: "" }],
    topActions: [],
    summary: "almost ready",
  };
  const checklist = buildLaunchChecklistFromReadiness(readiness);
  const maintenance = {
    id: "maintenance-signoff",
    generatedAt: timestamp,
    healthStatus: "healthy" as const,
    totalIssues: 0,
    criticalCount: 0,
    warningCount: 0,
    infoCount: 0,
    storageStats: [],
    issues: [],
    recommendations: [],
    snapshotRecommendation: "create one",
    summary: "healthy",
  };
  const baselineSummary = buildLaunchBaselineSummary({
    spacesCount: 1,
    employeesCount: 2,
    taskTypesCount: 3,
    scheduleItemsCount: 4,
    rulesCount: 5,
    reportsCount: 6,
    goalsCount: 7,
    preventiveAlertsCount: 8,
    snapshotsCount: 0,
    maintenanceIssuesCount: 0,
  });
  assert.equal(baselineSummary.scheduleItemsCount, 4);
  assert.equal(baselineSummary.preventiveAlertsCount, 8);

  const context: LaunchSignoffContext = {
    readiness,
    checklist,
    maintenance,
    baselineSummary,
    unresolvedRisks: ["open risk"],
    openCriticalCount: 0,
    openWarningCount: 1,
  };
  const before = JSON.stringify(context);
  const draft = buildLaunchSignoffDraft(context);
  assert.equal(draft.status, "blocked");
  assert.equal(getLaunchSignoffBlockers(context).some((item) => item.includes("snapshot")), true);
  assert.equal(draft.baselineSummary.employeesCount, 2);
  assert.equal(JSON.stringify(context), before);

  workforceBackupService.__memory.clear();
  launchSignoffService.__memory.clear();
  workforceBackupService.__memory.set("komak.workforce.spaces.v1", [space("baseline-space", 1, 2)]);
  workforceBackupService.__memory.set("komak.workforce.employees.v1", [employee("baseline-employee")]);
  workforceBackupService.__memory.set("komak.workforce.taskTypes.v1", [task("baseline-task")]);
  workforceBackupService.__memory.set("komak.workforce.scheduleItems.v1", []);
  workforceBackupService.__memory.set("komak.workforce.rules.v1", activeRules);
  assert.throws(() => launchSignoffService.sign(context, { signedBy: "manager", managerNote: "", acceptRisk: false }));
  const signed = launchSignoffService.sign(context, { signedBy: "manager", managerNote: "risk accepted", acceptRisk: true });
  assert.equal(signed.status, "signed");
  assert.equal(signed.acceptedRisk, true);
  assert.equal(signed.baselineSummary.spacesCount, 1);
  assert.ok(signed.baselineChecksum);
  assert.ok(signed.baselineBundle);
  assert.equal(signed.baselineCoverageVersion, workforceBackupCoverageVersion);
  assert.equal(signed.baselineBundle.metadata.coverageVersion, workforceBackupCoverageVersion);
  assert.equal(signed.baselineSummary.includedKeyCount, 23);
  assert.equal(signed.baselineSummary.coverageVersion, workforceBackupCoverageVersion);
  assert.equal(workforceBackupService.listSnapshots().some((item) => item.reason === "launch_signoff_baseline"), true);
  assert.equal(signed.baselineChecksum, workforceBackupService.calculateBackupChecksum(signed.baselineBundle.data));
  assert.equal(JSON.stringify(context), before);

  const checksumA = workforceBackupService.createBackupBundle("fixed-a", "test").checksum;
  const checksumB = workforceBackupService.createBackupBundle("fixed-b", "test").checksum;
  assert.equal(checksumA, checksumB);

  const revoked = launchSignoffService.revoke(signed.id, "baseline retired");
  assert.equal(revoked?.status, "revoked");
  assert.equal(revoked?.managerNote, "baseline retired");
}

{
  const baseSpace = space("drift-space", 1, 2);
  const baselineData = {
    "komak.workforce.spaces.v1": [baseSpace],
    "komak.workforce.rules.v1": activeRules,
    "komak.workforce.decisionReports.v1": [],
  };
  const baselineBefore = JSON.stringify(baselineData);
  const same = buildBaselineDriftReport({
    baselineSignoffId: "baseline-signoff",
    baselineChecksum: "same-checksum",
    currentChecksum: "same-checksum",
    baselineData,
    currentData: JSON.parse(JSON.stringify(baselineData)),
  });
  assert.equal(same.driftLevel, "none");
  assert.equal(same.driftScore, 0);

  const withAddedSpace = { ...baselineData, "komak.workforce.spaces.v1": [baseSpace, space("added-space", 2, 3)] };
  const addedChanges = compareCurrentStateToBaseline(baselineData, withAddedSpace);
  assert.equal(addedChanges.some((change) => change.type === "count_changed"), true);
  assert.equal(addedChanges.some((change) => change.type === "entity_added" && change.entityId === "added-space"), true);

  const withRemovedSpace = { ...baselineData, "komak.workforce.spaces.v1": [] };
  const removedChanges = compareCurrentStateToBaseline(baselineData, withRemovedSpace);
  assert.equal(removedChanges.some((change) => change.type === "entity_removed" && change.entityId === "drift-space"), true);

  const changedRules = { ...baselineData, "komak.workforce.rules.v1": activeRules.map((rule, index) => index === 0 ? { ...rule, isActive: false } : rule) };
  const rulesReport = buildBaselineDriftReport({ baselineSignoffId: "baseline-signoff", baselineChecksum: "before", currentChecksum: "after-rules", baselineData, currentData: changedRules });
  assert.equal(rulesReport.changes.some((change) => change.type === "rule_changed" && change.requiresResignoff), true);
  assert.equal(rulesReport.requiresResignoff, true);

  const reportOnlyData = { ...baselineData, "komak.workforce.decisionReports.v1": [{ id: "new-report", title: "report" }] };
  const reportOnly = buildBaselineDriftReport({ baselineSignoffId: "baseline-signoff", baselineChecksum: "before", currentChecksum: "after-report", baselineData, currentData: reportOnlyData });
  assert.equal(reportOnly.changes.some((change) => change.type === "report_changed"), true);
  assert.equal(reportOnly.requiresResignoff, false);

  const currentCoverageData = {
    ...baselineData,
    "komak.workforce.launchSignoffs.v1": [{ id: "newer-signoff" }],
    "komak.workforce.operationalResignoffs.v1": [{ id: "newer-resignoff" }],
    "komak.workforce.historyRetentionPolicy.v1": { id: "newer-policy" },
  };
  const comparable = calculateComparableChecksum(baselineData, currentCoverageData);
  assert.equal(comparable.comparableKeys.includes("komak.workforce.spaces.v1"), true);
  assert.equal(comparable.nonComparableKeys.includes("komak.workforce.launchSignoffs.v1"), true);
  assert.equal(comparable.baselineChecksum, comparable.currentChecksum);
  const legacyCoverageOnly = buildBaselineDriftReport({
    baselineSignoffId: "legacy-baseline",
    baselineChecksum: "legacy-before",
    currentChecksum: "coverage-after",
    baselineData,
    currentData: currentCoverageData,
  });
  assert.equal(legacyCoverageOnly.isLegacyBaseline, true);
  assert.equal((legacyCoverageOnly.compatibilityWarnings ?? []).length > 0, true);
  assert.equal(legacyCoverageOnly.nonComparableKeyCount! > 0, true);
  assert.equal(legacyCoverageOnly.driftLevel, "none");
  assert.equal(legacyCoverageOnly.requiresResignoff, false);
  const guidanceBefore = JSON.stringify(legacyCoverageOnly);
  const guidance = buildLegacyBaselineGuidance(legacyCoverageOnly);
  assert.equal(guidance?.title, "Baseline قدیمی است، خراب نیست");
  assert.equal(guidance?.tone, "info");
  assert.equal(guidance?.actionLabel, "بررسی و در صورت نیاز بازتأیید");
  assert.equal(getBaselineCompatibilityTone(legacyCoverageOnly), "info");
  assert.equal(JSON.stringify(legacyCoverageOnly), guidanceBefore);

  const legacyRealChange = buildBaselineDriftReport({
    baselineSignoffId: "legacy-baseline",
    baselineChecksum: "legacy-before",
    currentChecksum: "real-after",
    baselineData,
    currentData: { ...currentCoverageData, "komak.workforce.spaces.v1": [{ ...baseSpace, normalCapacity: 9 }] },
  });
  assert.equal(legacyRealChange.changes.some((change) => change.storageKey === "komak.workforce.spaces.v1"), true);
  assert.equal(legacyRealChange.requiresResignoff, true);
  assert.equal(getBaselineCompatibilityActionLabel(legacyRealChange), "ثبت بازتأیید جدید");
  assert.equal(getBaselineCompatibilityTone(legacyRealChange), "warn");

  workforceBackupService.__memory.clear();
  workforceBackupService.__memory.set("komak.workforce.spaces.v1", [baseSpace]);
  workforceBackupService.__memory.set("komak.workforce.rules.v1", activeRules);
  workforceBackupService.__memory.set("komak.workforce.decisionReports.v1", []);
  const currentBundle = workforceBackupService.createBackupBundle("current-coverage", "test");
  const newCoverageReport = buildBaselineDriftReport({
    baselineSignoffId: "new-coverage-baseline",
    baselineChecksum: currentBundle.checksum,
    currentChecksum: currentBundle.checksum,
    baselineData: currentBundle.data,
    currentData: JSON.parse(JSON.stringify(currentBundle.data)),
    baselineBundle: currentBundle,
    currentBundle,
  });
  assert.equal(newCoverageReport.isLegacyBaseline, false);
  assert.equal(newCoverageReport.baselineCoverageVersion, workforceBackupCoverageVersion);
  assert.equal(buildLegacyBaselineGuidance(newCoverageReport), undefined);

  const boundedScore = calculateDriftScore([...rulesReport.changes, ...rulesReport.changes, ...rulesReport.changes, ...rulesReport.changes]);
  assert.equal(boundedScore >= 0 && boundedScore <= 100, true);
  assert.equal(determineDriftLevel(80), "critical");
  const highReport = buildBaselineDriftReport({ baselineSignoffId: "baseline-signoff", baselineChecksum: "before", currentChecksum: "after-high", baselineData, currentData: { ...baselineData, "komak.workforce.rules.v1": activeRules.map((rule) => ({ ...rule, title: `${rule.title}-changed` })) } });
  assert.equal(highReport.driftLevel === "high" || highReport.driftLevel === "critical", true);
  assert.equal(highReport.requiresResignoff, true);
  assert.equal(JSON.stringify(baselineData), baselineBefore);

  workforceBackupService.__memory.clear();
  operationalResignoffService.__memory.clear();
  workforceBackupService.__memory.set("komak.workforce.spaces.v1", [baseSpace]);
  workforceBackupService.__memory.set("komak.workforce.employees.v1", [employee("drift-employee")]);
  workforceBackupService.__memory.set("komak.workforce.taskTypes.v1", [task("drift-task")]);
  const driftBeforeSign = JSON.stringify(rulesReport);
  const resignoff = operationalResignoffService.sign(rulesReport, "manager", "changes reviewed");
  assert.equal(resignoff.status, "signed");
  assert.ok(resignoff.newBaselineChecksum);
  assert.equal(resignoff.newBaselineCoverageVersion, workforceBackupCoverageVersion);
  assert.ok(resignoff.newBaselineBundle);
  assert.equal(resignoff.newBaselineBundle.metadata.coverageVersion, workforceBackupCoverageVersion);
  assert.equal(workforceBackupService.listSnapshots().some((item) => item.reason === "operational_resignoff_baseline"), true);
  assert.equal(JSON.stringify(rulesReport), driftBeforeSign);
}

{
  operationalHistoryService.__memory.clear();
  const eventDraft = {
    type: "snapshot_created" as const,
    title: "snapshot",
    description: "manual snapshot",
    occurredAt: "2026-01-01T08:00:00.000Z",
    actorName: "manager",
    severity: "low" as const,
    relatedId: "snapshot-history",
    relatedPath: "/data-center",
    checksum: "",
    metadata: { reason: "manual" },
  };
  const draftBefore = JSON.stringify(eventDraft);
  operationalHistoryService.addEvent(eventDraft);
  assert.equal(operationalHistoryService.listEvents().length, 1);
  assert.equal(operationalHistoryService.filterEvents({ type: "snapshot_created" }).length, 1);
  assert.equal(operationalHistoryService.filterEvents({ type: "drift_report" }).length, 0);
  assert.equal(JSON.stringify(eventDraft), draftBefore);

  const driftOne = { ...buildBaselineDriftReport({
    baselineSignoffId: "history-baseline",
    baselineChecksum: "history-base",
    currentChecksum: "history-current-1",
    baselineData: { "komak.workforce.decisionReports.v1": [] },
    currentData: { "komak.workforce.decisionReports.v1": [{ id: "report-1" }] },
  }), generatedAt: "2026-01-02T08:00:00.000Z" };
  const driftTwo = {
    ...driftOne,
    id: "history-drift-2",
    generatedAt: "2026-01-03T08:00:00.000Z",
    currentChecksum: "history-current-2",
    driftScore: driftOne.driftScore + 20,
    driftLevel: "medium" as const,
  };
  operationalHistoryService.recordDriftReport(driftOne);
  operationalHistoryService.recordDriftReport(driftTwo);
  const trend = buildDriftTrend(operationalHistoryService.listEvents());
  assert.equal(trend.length, 2);
  assert.equal(detectIncreasingDriftTrend(trend), true);

  const resignoffDraft = operationalResignoffService.buildDraft(driftTwo);
  const resignoff = { ...resignoffDraft, status: "signed" as const, signedBy: "history-manager", signedAt: "2026-01-04T08:00:00.000Z", managerNote: "reviewed", newBaselineChecksum: "history-new-base" };
  operationalHistoryService.recordResignoff(resignoff);
  assert.equal(operationalHistoryService.filterEvents({ type: "resignoff_signed" })[0]?.actorName, "history-manager");

  const historyReport = calculateOperationalHistorySummary(operationalHistoryService.listEvents());
  assert.equal(historyReport.resignoffCount, 1);
  assert.equal(historyReport.baselineChangeCount, 1);
  const exported = operationalHistoryService.exportHistoryJson();
  const parsedExport = JSON.parse(exported.content);
  assert.equal(parsedExport.version, "1.0.0");
  assert.equal(Array.isArray(parsedExport.report.events), true);

  workforceBackupService.__memory.set("komak.workforce.spaces.v1", [space("history-safe-space", 1, 2)]);
  operationalHistoryService.clearHistory();
  assert.equal(operationalHistoryService.listEvents().length, 0);
  assert.equal((workforceBackupService.__memory.get("komak.workforce.spaces.v1") as Space[])[0].id, "history-safe-space");
}

{
  const policy = getDefaultHistoryRetentionPolicy();
  assert.equal(policy.keepRecentDays, 30);
  assert.equal(policy.archiveAfterDays, 60);
  assert.equal(policy.criticalKeepDays, 180);
  assert.equal(policy.driftReviewAfterDays, 14);
  assert.equal(policy.resignoffExpiresAfterDays, 90);
  assert.equal(policy.maxEventsBeforeWarning, 500);

  const event = (id: string, occurredAt: string, severity: "info" | "low" | "medium" | "high" | "critical", type: "snapshot_created" | "drift_report" | "resignoff_signed" = "snapshot_created") => ({
    id,
    type,
    title: id,
    description: id,
    occurredAt,
    actorName: "manager",
    severity,
    relatedId: id,
    relatedPath: "/history",
    checksum: "",
    metadata: type === "drift_report" ? { requiresResignoff: true, driftScore: 70, driftLevel: "high" } : {},
    createdAt: occurredAt,
  });
  const now = "2026-06-27T12:00:00.000Z";
  const oldLow = event("old-low", "2025-12-01T00:00:00.000Z", "low");
  const oldCritical = event("old-critical", "2026-02-01T00:00:00.000Z", "critical");
  const candidates = detectArchiveCandidates([oldLow, oldCritical], policy, now);
  assert.equal(candidates.some((item) => item.id === "old-low"), true);
  assert.equal(candidates.some((item) => item.id === "old-critical"), false);
  assert.equal(detectHistoryTooLarge([oldLow, oldCritical], { ...policy, maxEventsBeforeWarning: 1 }), true);

  const staleDrift = event("stale-drift", "2026-05-01T00:00:00.000Z", "high", "drift_report");
  assert.equal(detectStaleDriftEvents([staleDrift], policy, now).length, 1);
  const laterResignoff = event("later-resignoff", "2026-06-20T00:00:00.000Z", "medium", "resignoff_signed");
  assert.equal(detectStaleDriftEvents([staleDrift, laterResignoff], policy, now).length, 0);
  const expiredResignoff = event("expired-resignoff", "2025-12-01T00:00:00.000Z", "medium", "resignoff_signed");
  assert.equal(detectExpiredResignoffs([expiredResignoff], policy, now).length, 1);

  const sourceEvents = [oldLow, staleDrift, expiredResignoff];
  const sourceBefore = JSON.stringify(sourceEvents);
  const retentionReport = buildHistoryRetentionReport({ events: sourceEvents, archives: [], snapshots: [], policy, currentDriftLevel: "high", now });
  assert.equal(retentionReport.issues.some((issue) => issue.type === "stale_drift"), true);
  assert.equal(retentionReport.issues.some((issue) => issue.type === "expired_resignoff"), true);
  assert.equal(JSON.stringify(sourceEvents), sourceBefore);

  operationalHistoryService.__memory.clear();
  historyRetentionService.__memory.clear();
  workforceBackupService.__memory.clear();
  workforceBackupService.__memory.set("komak.workforce.spaces.v1", [space("retention-space", 1, 2)]);
  operationalHistoryService.addEvent(oldLow);
  operationalHistoryService.addEvent(event("recent-event", "2026-06-26T00:00:00.000Z", "low"));
  const archive = historyRetentionService.createHistoryArchive("periodic archive");
  assert.ok(archive);
  assert.equal(archive.eventCount, 1);
  assert.ok(archive.checksum);
  assert.equal(archive.summary.includes("۱"), true);
  const archiveExport = historyRetentionService.exportArchiveJson(archive.id);
  assert.ok(archiveExport);
  assert.equal(JSON.parse(archiveExport.content).version, "1.0.0");
  const cleanupResult = historyRetentionService.cleanupArchivedEvents(archive.id);
  assert.equal(cleanupResult.removedCount, 1);
  assert.equal(operationalHistoryService.listEvents().some((item) => item.id === "old-low"), false);
  assert.equal(operationalHistoryService.listEvents().some((item) => item.id === "recent-event"), true);
  assert.equal((workforceBackupService.__memory.get("komak.workforce.spaces.v1") as Space[])[0].id, "retention-space");
}
