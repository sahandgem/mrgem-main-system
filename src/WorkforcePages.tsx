import {
  Activity,
  AlertTriangle,
  Brain,
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Filter,
  FileCheck2,
  Flame,
  Plus,
  Printer,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Store,
  Users,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  buildDecisionQueue,
  selectBestSafeScenarioCombination,
  simulateDecisionBatch,
  type DecisionQueueInput,
} from "./analysis/workforceDecisionQueue";
import {
  buildReportTrend,
  calculateMonthlySummary,
  compareDecisionReports,
} from "./analysis/decisionReportAnalytics";
import {
  buildMonthlyHealthDashboard,
  filterReportsByMonth,
} from "./analysis/monthlyHealthAnalyzer";
import { buildOperationalReadinessReport } from "./analysis/operationalReadinessAnalyzer";
import { buildLaunchChecklistFromReadiness, groupChecklistByCategory } from "./analysis/launchChecklistBuilder";
import { buildLaunchBaselineSummary, type LaunchSignoffContext } from "./analysis/launchSignoffBuilder";
import { buildBaselineDriftReport } from "./analysis/baselineDriftAnalyzer";
import { detectIncreasingDriftTrend } from "./analysis/operationalHistoryAnalytics";
import { groupControlsByDate, type OperationsCalendarSystemState } from "./analysis/operationsCalendarAnalyzer";
import { buildPreventiveAlerts } from "./analysis/preventiveAlertAnalyzer";
import { durationHours } from "./analysis/timeUtils";
import { analyzeWorkforce } from "./analysis/workforceAnalyzer";
import {
  generateRecommendationScenarios,
  getBestScenarioForFinding,
  getBestScenariosForWeek,
  rankRecommendationScenarios,
  type RecommendationInput,
} from "./analysis/workforceRecommendationEngine";
import { buildInitialSimulationFromFinding, simulateScheduleChange } from "./analysis/workforceSimulator";
import { useAnalysisSettings } from "./hooks/useAnalysisSettings";
import { useCompatibilityRules } from "./hooks/useCompatibilityRules";
import {
  EntityPanel,
  SelectField,
  TextAreaField,
  TextField,
  ToggleField,
  type EntityColumn,
} from "./components/EntityPanel";
import { CapacityPanel, InfoPanel } from "./components/InfoPanel";
import { StatusBadge } from "./components/StatusBadge";
import { BaselineCompatibilityNotice } from "./components/workforce/BaselineCompatibilityNotice";
import HistoryRetentionPage from "./pages/workforce/operations/HistoryRetentionPage";
import MaintenancePage from "./pages/workforce/system/MaintenancePage";
import OperationalHistoryPage from "./pages/workforce/system/OperationalHistoryPage";
import {
  currentBaselineDriftReport,
  driftTone,
  historyEventTypeLabel,
  historyTrendLabel,
  maintenanceHealthLabel,
  maintenanceHealthTone,
  retentionStatusLabel,
  retentionStatusTone,
} from "./pages/workforce/workforcePageUtils";
import { dayOptions, WeeklyGrid, type ScheduleFilters } from "./components/WeeklyGrid";
import { useWorkforceStore } from "./hooks/useWorkforceStore";
import { decisionReportService } from "./services/decisionReportService";
import { monthlyGoalService } from "./services/monthlyGoalService";
import { preventiveAlertKey, preventiveAlertStateService } from "./services/preventiveAlertStateService";
import { workforceBackupKeys, workforceBackupService, workforceSnapshotStorageKey } from "./services/workforceBackupService";
import { workforceMaintenanceService } from "./services/workforceMaintenanceService";
import { launchChecklistService } from "./services/launchChecklistService";
import { launchSignoffService } from "./services/launchSignoffService";
import { operationalResignoffService } from "./services/operationalResignoffService";
import { operationalHistoryService } from "./services/operationalHistoryService";
import { historyRetentionService } from "./services/historyRetentionService";
import { operationsCalendarService } from "./services/operationsCalendarService";
import {
  operationalControlTypes,
  operationsControlSettingsService,
} from "./services/operationsControlSettingsService";
import {
  downloadOperationsCalendarIcs,
  downloadOperationsCalendarJson,
} from "./services/operationsCalendarExportService";
import { operationalNotificationService } from "./services/operationalNotificationService";
import type {
  AnalysisRule,
  AnalysisSeverity,
  AnalysisSettings,
  DistractionLevel,
  DecisionReport,
  DecisionReportStatus,
  Employee,
  FocusLevel,
  MonthlyGoal,
  MonthlyGoalStatus,
  OperationalReadinessStatus,
  PriorityLevel,
  PreventiveAlert,
  PreventiveAlertPriority,
  PreventiveAlertSeverity,
  PreventiveAlertSourceType,
  PreventiveAlertStatus,
  BackupValidationResult,
  MaintenanceHealthStatus,
  MaintenanceIssue,
  MaintenanceIssueSeverity,
  LaunchChecklistItem,
  LaunchChecklistStatus,
  LaunchSignoffReport,
  BaselineDriftChange,
  BaselineDriftLevel,
  BaselineDriftReport,
  BaselineDriftSeverity,
  OperationalHistoryEvent,
  OperationalHistoryEventType,
  OperationalHistorySeverity,
  HistoryRetentionPolicy,
  HistoryRetentionStatus,
  OperationalControlItem,
  OperationalControlPriority,
  OperationalControlStatus,
  OperationalControlType,
  OperationalControlExportOptions,
  OperationalControlSchedulePolicy,
  OperationalNotificationPreference,
  ReadinessCheck,
  ReadinessCheckCategory,
  StatusTone,
  WorkforceBackupBundle,
  DecisionBatchResult,
  DecisionQueueItem,
  RecommendationScenario,
  RecommendationScenarioType,
  SimulationChange,
  SimulationResult,
  Space,
  TaskType,
  WeeklyScheduleItem,
  WorkCompatibility,
  WorkCompatibilityRule,
  WorkDay,
} from "./models/workforce";
import { nowIso, toPersianNumber, weekDays } from "./models/workforce";

const route = window.location.pathname.replace(/\/$/, "") || "/organization/workforce-dashboard";
const decisionQueueStorageKey = "komak.workforce.decisionQueue.v1";

const focusOptions: FocusLevel[] = ["کم", "متوسط", "زیاد"];
const distractionOptions: DistractionLevel[] = ["کم", "متوسط", "زیاد"];
const priorityOptions: PriorityLevel[] = ["کم", "معمولی", "بالا"];

function currentOperationsCalendarState({
  spaces,
  employees,
  taskTypes,
  scheduleItems,
  rules,
  settings,
}: {
  spaces: Space[];
  employees: Employee[];
  taskTypes: TaskType[];
  scheduleItems: WeeklyScheduleItem[];
  rules: AnalysisRule[];
  settings: AnalysisSettings;
}): OperationsCalendarSystemState {
  const reports = decisionReportService.list(true);
  const goals = monthlyGoalService.list(true);
  const monthlyHealth = buildMonthlyHealthDashboard(reports);
  const preventiveAlerts = preventiveAlertStateService.applyStates(buildPreventiveAlerts({ reports, monthlyHealth, monthlyGoals: goals }));
  const maintenance = workforceMaintenanceService.runReport(preventiveAlerts.map(preventiveAlertKey));
  const snapshots = workforceBackupService.listSnapshots();
  const readiness = buildOperationalReadinessReport({ spaces, employees, taskTypes, scheduleItems, rules, settings, snapshots, maintenanceReport: maintenance, decisionReports: reports, monthlyGoals: goals, preventiveAlerts });
  const drift = currentBaselineDriftReport();
  const retention = historyRetentionService.buildRetentionReport(drift.driftLevel);
  const savedChecklist = launchChecklistService.list();
  const checklist = savedChecklist.items.length ? savedChecklist : buildLaunchChecklistFromReadiness(readiness);
  const latestBackup = operationalHistoryService.listEvents().find((event) => event.type === "backup_created");
  const latestArchive = historyRetentionService.listArchives()[0];
  const latestResignoff = operationalResignoffService.latestSigned() ?? launchSignoffService.latestSigned();
  const monthParts = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Tehran", year: "numeric", month: "2-digit" }).formatToParts(new Date());
  const monthLabel = `${monthParts.find((part) => part.type === "year")?.value}-${monthParts.find((part) => part.type === "month")?.value}`;
  return {
    latestSnapshotAt: snapshots[0]?.createdAt,
    latestBackupAt: latestBackup?.occurredAt,
    latestArchiveAt: latestArchive?.createdAt,
    latestResignoffAt: latestResignoff?.signedAt ?? latestResignoff?.updatedAt,
    retentionStatus: retention.status,
    retentionNeedsSnapshot: retention.issues.some((issue) => issue.type === "no_recent_snapshot"),
    retentionNeedsArchive: retention.archiveCandidateCount > 0 || retention.issues.some((issue) => issue.type === "archive_recommended"),
    staleDriftCount: retention.staleDriftCount,
    expiredResignoffCount: retention.expiredResignoffCount,
    maintenanceIssueCount: maintenance.totalIssues,
    maintenanceCritical: maintenance.criticalCount > 0 || maintenance.healthStatus === "critical" || maintenance.healthStatus === "risky",
    driftLevel: drift.driftLevel,
    driftRequiresResignoff: drift.requiresResignoff,
    readinessStatus: readiness.status,
    monthlyHealthNeedsReview: monthlyHealth.healthLevel === "critical" || monthlyHealth.healthLevel === "needs_attention",
    hasCurrentMonthGoal: goals.some((goal) => !goal.isArchived && goal.monthLabel === monthLabel),
    urgentPreventiveAlertCount: preventiveAlerts.filter((alert) => alert.status === "open" && (alert.priority === "urgent" || alert.priority === "high" || alert.severity === "critical")).length,
    launchChecklistOpenCount: checklist.openCount,
  };
}

const blankSpace = (): Omit<Space, "id" | "createdAt" | "updatedAt"> => ({
  isActive: true,
  name: "",
  type: "",
  normalCapacity: 1,
  maxCapacity: 1,
  distractionLevel: "متوسط",
  requiresCompanion: false,
  soloWorkAllowed: true,
  description: "",
});

const blankEmployee = (): Omit<Employee, "id" | "createdAt" | "updatedAt"> => ({
  isActive: true,
  name: "",
  primaryRole: "",
  skills: [],
  focusNeed: "متوسط",
  goodForSales: false,
  goodForProduction: false,
  goodForDigital: false,
  defaultSpaceId: "",
  description: "",
});

const blankTask = (): Omit<TaskType, "id" | "createdAt" | "updatedAt"> => ({
  isActive: true,
  name: "",
  category: "",
  focusNeed: "متوسط",
  needsCleanSpace: false,
  requiresCompanion: false,
  requiresCustomerPresence: false,
  suggestedSpaceId: "",
  description: "",
});

const blankSchedule = (): Omit<WeeklyScheduleItem, "id" | "createdAt" | "updatedAt"> => ({
  isActive: true,
  day: "شنبه",
  startTime: "09:00",
  endTime: "10:00",
  employeeId: "",
  spaceId: "",
  taskTypeId: "",
  priority: "معمولی",
  description: "",
});

function optionList<T extends { id: string; name: string; isActive: boolean }>(rows: T[], emptyLabel = "ط§ظ†طھط®ط§ط¨ ع©ظ†غŒط¯") {
  return [{ label: emptyLabel, value: "" }, ...rows.filter((row) => row.isActive).map((row) => ({ label: row.name, value: row.id }))];
}

function toneForTask(task?: TaskType): StatusTone {
  if (!task) return "empty";
  if (task.requiresCustomerPresence) return "sales";
  if (task.category.includes("دیجیتال") || task.focusNeed === "زیاد") return "focus";
  if (task.needsCleanSpace) return "info";
  return "good";
}

function overlaps(a: WeeklyScheduleItem, b: WeeklyScheduleItem) {
  return a.day === b.day && a.startTime < b.endTime && b.startTime < a.endTime;
}

function DashboardPage({
  spaces,
  employees,
  taskTypes,
  scheduleItems,
  rules,
  resetDemo,
}: {
  spaces: Space[];
  employees: Employee[];
  taskTypes: TaskType[];
  scheduleItems: WeeklyScheduleItem[];
  rules: AnalysisRule[];
  resetDemo: () => void;
}) {
  const activeSpaces = spaces.filter((item) => item.isActive);
  const activeEmployees = employees.filter((item) => item.isActive);
  const activeTasks = taskTypes.filter((item) => item.isActive);
  const activeSchedule = scheduleItems.filter((item) => item.isActive);

  const conflicts = activeSchedule.filter((item, index) =>
    activeSchedule.some((other, otherIndex) => otherIndex > index && item.spaceId === other.spaceId && overlaps(item, other)),
  ).length;
  const focusItems = activeSchedule.filter((item) => taskTypes.find((task) => task.id === item.taskTypeId)?.focusNeed === "زیاد").length;
  const salesItems = activeSchedule.filter((item) => taskTypes.find((task) => task.id === item.taskTypeId)?.requiresCustomerPresence).length;
  const activeRuleCount = rules.filter((rule) => rule.isActive).length;
  const urgentCount = conflicts + activeSchedule.filter((item) => {
    const task = taskTypes.find((row) => row.id === item.taskTypeId);
    const space = spaces.find((row) => row.id === item.spaceId);
    return Boolean(task?.requiresCompanion && space && !space.requiresCompanion);
  }).length;

  const kpis = [
    { label: "ظˆط¶ط¹غŒطھ ظ‡ظپطھظ‡", value: conflicts ? "ظ†غŒط§ط²ظ…ظ†ط¯ طھظˆط¬ظ‡" : "ظ¾ط§غŒط¯ط§ط±", caption: `${toPersianNumber(activeSchedule.length)} ط¢غŒطھظ… ط«ط¨طھâ€Œط´ط¯ظ‡`, tone: conflicts ? "warn" : "good", icon: CheckCircle2 },
    { label: "ظ‡ط´ط¯ط§ط±ظ‡ط§غŒ ظپط¹ط§ظ„", value: toPersianNumber(urgentCount), caption: `${toPersianNumber(activeRuleCount)} ظ‚ط§ظ†ظˆظ† ظپط¹ط§ظ„`, tone: urgentCount ? "warn" : "good", icon: AlertTriangle },
    { label: "ظ¾ظˆط´ط´ ظپط±ظˆط´ع¯ط§ظ‡", value: toPersianNumber(salesItems), caption: "ط¢غŒطھظ…â€Œظ‡ط§غŒ ظپط±ظˆط´ ظˆ ظ…ط´طھط±غŒ", tone: "sales", icon: Store },
    { label: "ط²ظ…ط§ظ† طھظ…ط±ع©ط²", value: toPersianNumber(focusItems), caption: "ط¨ط§ط²ظ‡â€Œظ‡ط§غŒ طھظ…ط±ع©ط²غŒ ط«ط¨طھâ€Œط´ط¯ظ‡", tone: "focus", icon: Brain },
    { label: "طھط¯ط§ط®ظ„â€Œظ‡ط§", value: toPersianNumber(conflicts), caption: "ظ‡ظ…â€Œظ¾ظˆط´ط§ظ†غŒ ظپط¶ط§ ظˆ ط²ظ…ط§ظ†", tone: conflicts ? "critical" : "good", icon: Flame },
  ] satisfies { label: string; value: string; caption: string; tone: StatusTone; icon: typeof CheckCircle2 }[];

  const capacityItems = activeSpaces.map((space) => {
    const used = activeSchedule.filter((item) => item.spaceId === space.id).length;
    const usage = Math.min(100, Math.round((used / Math.max(space.normalCapacity * 3, 1)) * 100));
    return {
      name: space.name,
      usage,
      caption: `${toPersianNumber(used)} ط¢غŒطھظ… ط¯ط± ظ‡ظپطھظ‡`,
      tone: usage > 85 ? "warn" as StatusTone : space.type.includes("ظپط±ظˆط´") ? "sales" as StatusTone : "good" as StatusTone,
    };
  });

  const urgentAlerts = [
    { title: "طھط¯ط§ط®ظ„â€Œظ‡ط§", caption: conflicts ? `${toPersianNumber(conflicts)} ظ‡ظ…â€Œظ¾ظˆط´ط§ظ†غŒ ظ†غŒط§ط²ظ…ظ†ط¯ ط¨ط±ط±ط³غŒ ط§ط³طھ.` : "طھط¯ط§ط®ظ„ ظپط¹ط§ظ„غŒ ط¯غŒط¯ظ‡ ظ†ط´ط¯.", tone: conflicts ? "critical" as StatusTone : "good" as StatusTone },
    { title: "ظ¾ظˆط´ط´ ظپط±ظˆط´ع¯ط§ظ‡", caption: salesItems ? `${toPersianNumber(salesItems)} ط¨ط§ط²ظ‡ ظپط±ظˆط´ ط«ط¨طھ ط´ط¯ظ‡ ط§ط³طھ.` : "ط¨ط±ط§غŒ ظپط±ظˆط´ع¯ط§ظ‡ ط¨ط§ط²ظ‡â€Œط§غŒ ط«ط¨طھ ظ†ط´ط¯ظ‡ ط§ط³طھ.", tone: salesItems ? "sales" as StatusTone : "warn" as StatusTone },
    { title: "ظ‚ظˆط§ظ†غŒظ†", caption: `${toPersianNumber(activeRuleCount)} ظ‚ط§ظ†ظˆظ† ظ¾ط§غŒظ‡ ظپط¹ط§ظ„ ط§ط³طھ.`, tone: "info" as StatusTone },
  ];

  const smartSuggestions = [
    { title: "طھظ…ط±ع©ط²", caption: focusItems ? "ط¨ط§ط²ظ‡â€Œظ‡ط§غŒ طھظ…ط±ع©ط²غŒ ط±ط§ ط¯ط± ظپط¶ط§ظ‡ط§غŒ کمâ€Œط­ظˆط§ط³â€Œظ¾ط±طھغŒ ظ†ع¯ظ‡ ط¯ط§ط±غŒط¯." : "ط¨ط±ط§غŒ ع©ط§ط±ظ‡ط§غŒ طھظ…ط±ع©ط²غŒ ط¨ط±ظ†ط§ظ…ظ‡ ط«ط¨طھ ع©ظ†غŒط¯.", tone: "focus" as StatusTone },
    { title: "ط¸ط±ظپغŒطھ", caption: "ط¸ط±ظپغŒطھ ظپط¶ط§ظ‡ط§ ط§ط² ط¯ط§ط¯ظ‡â€Œظ‡ط§غŒ ط°ط®غŒط±ظ‡â€Œط´ط¯ظ‡ ظ…ط­ط§ط³ط¨ظ‡ ظ…غŒâ€Œط´ظˆط¯.", tone: "info" as StatusTone },
    { title: "ظ¾ط§ع©ط³ط§ط²غŒ demo", caption: "ظ‡ط± ط²ظ…ط§ظ† ظ„ط§ط²ظ… ط¨ظˆط¯ ط¯ط§ط¯ظ‡â€Œظ‡ط§ ط±ط§ ط¨ظ‡ seed ط§ظˆظ„غŒظ‡ ط¨ط±ع¯ط±ط¯ط§ظ†غŒط¯.", tone: "empty" as StatusTone },
  ];

  const employeeSummaries = activeEmployees.map((employee) => {
    const defaultSpace = spaces.find((space) => space.id === employee.defaultSpaceId);
    return {
      name: employee.name,
      role: employee.primaryRole || "ط¨ط¯ظˆظ† ظ†ظ‚ط´",
      focus: employee.focusNeed,
      location: defaultSpace?.name ?? "ط¨ط¯ظˆظ† ظ…ط­ظ„",
      status: employee.goodForSales ? "sales" as StatusTone : employee.goodForDigital ? "focus" as StatusTone : "info" as StatusTone,
    };
  });

  const focusHeatmap = weekDays.slice(0, 4).map((day) => {
    const dayItems = activeSchedule.filter((item) => item.day === day);
    const focusCount = dayItems.filter((item) => taskTypes.find((task) => task.id === item.taskTypeId)?.focusNeed === "زیاد").length;
    const value = dayItems.length ? Math.round((focusCount / dayItems.length) * 100) : 0;
    return { label: day, value, tone: value > 65 ? "focus" as StatusTone : value > 30 ? "warn" as StatusTone : "empty" as StatusTone };
  });

  return (
    <div className="page-stack">
      <header className="hero-header">
        <div>
          <span className="eyebrow">ط¯ط§ط´ط¨ظˆط±ط¯ ظ‡ظپطھع¯غŒ</span>
          <h1>ط§طھط§ظ‚ ظپط±ظ…ط§ظ† ظ‡ظپطھظ‡</h1>
          <p>ظ†ظ…ط§غŒ ط²ظ†ط¯ظ‡ ط§ط² ط¯ط§ط¯ظ‡â€Œظ‡ط§غŒ ط°ط®غŒط±ظ‡â€Œط´ط¯ظ‡ ط¯ط± ظ…ط±ظˆط±ع¯ط±ط› ط¢ظ…ط§ط¯ظ‡ ط¨ط±ط§غŒ ط¬ط§غŒع¯ط²غŒظ†غŒ ط¨ط§ ط¯غŒطھط§ط¨غŒط³ ط¯ط± ظ…ط±ط­ظ„ظ‡ ط¨ط¹ط¯.</p>
        </div>
        <div className="hero-actions">
          <button className="ghost-button" type="button" onClick={resetDemo}>
            <RotateCcw size={17} /> ط¨ط§ط²ع¯ط´طھ demo
          </button>
          <a className="primary-button" href="/organization/workforce-dashboard/schedule">
            <Sparkles size={17} /> ط¨ط±ظ†ط§ظ…ظ‡ ظ‡ظپطھع¯غŒ
          </a>
        </div>
      </header>

      <section className="kpi-strip">
        {kpis.map((card) => {
          const Icon = card.icon;
          return (
            <article className={`kpi-card tone-${card.tone}`} key={card.label}>
              <div className="icon-shell">
                <Icon size={20} />
              </div>
              <div>
                <p>{card.label}</p>
                <strong>{card.value}</strong>
                <span>{card.caption}</span>
              </div>
            </article>
          );
        })}
      </section>

      <section className="cockpit-grid">
        <div className="side-column">
          <CapacityPanel items={capacityItems} />
        </div>
        <div className="center-column">
          <WeeklyGrid employees={employees} items={scheduleItems} spaces={spaces} taskTypes={taskTypes} />
        </div>
        <div className="side-column">
          <InfoPanel title="ظ‡ط´ط¯ط§ط±ظ‡ط§غŒ ظپظˆط±غŒ" items={urgentAlerts} />
          <InfoPanel title="ظ¾غŒط´ظ†ظ‡ط§ط¯ظ‡ط§غŒ ظ‡ظˆط´ظ…ظ†ط¯" items={smartSuggestions} />
          <a className="primary-button full-button" href="/organization/workforce-dashboard/recommendations">
            <Sparkles size={17} /> ظ…ط´ط§ظ‡ط¯ظ‡ ظ‡ظ…ظ‡ ظ¾غŒط´ظ†ظ‡ط§ط¯ظ‡ط§
          </a>
        </div>
      </section>

      <section className="bottom-grid">
        <section className="panel wide-panel">
          <h2>ظˆط¶ط¹غŒطھ ط®ظ„ط§طµظ‡ ع©ط§ط±ظ…ظ†ط¯ظ‡ط§</h2>
          <div className="employee-list">
            {employeeSummaries.map((employee) => (
              <article key={employee.name}>
                <div>
                  <strong>{employee.name}</strong>
                  <span>{employee.role}طŒ طھظ…ط±ع©ط² {employee.focus}</span>
                </div>
                <StatusBadge tone={employee.status}>{employee.location}</StatusBadge>
              </article>
            ))}
          </div>
        </section>
        <section className="panel">
          <h2>ظ†ظ‚ط´ظ‡ طھظ…ط±ع©ط² ظ‡ظپطھظ‡</h2>
          <div className="heatmap">
            {focusHeatmap.map((item) => (
              <div className={`heat-cell tone-${item.tone}`} key={item.label}>
                <strong>{toPersianNumber(item.value)}ظھ</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </section>
        <InfoPanel title="ظ…ط±ع©ط² طھطµظ…غŒظ… ظ‡ظپطھظ‡" items={smartSuggestions} />
      </section>
    </div>
  );
}

function SpacesPage({
  spaces,
  createItem,
  updateItem,
  deactivateItem,
  resetDemo,
}: {
  spaces: Space[];
  createItem: (draft: Omit<Space, "id" | "createdAt" | "updatedAt">) => void;
  updateItem: (id: string, changes: Partial<Space>) => void;
  deactivateItem: (id: string) => void;
  resetDemo: () => void;
}) {
  const [form, setForm] = useState(blankSpace());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const columns: EntityColumn<Space>[] = [
    { label: "ظ†ط§ظ…", render: (item) => item.name },
    { label: "ظ†ظˆط¹", render: (item) => item.type || "ط«ط¨طھ ظ†ط´ط¯ظ‡" },
    { label: "ط¸ط±ظپغŒطھ", render: (item) => `${toPersianNumber(item.normalCapacity)} / ${toPersianNumber(item.maxCapacity)}` },
  ];

  const submit = () => {
    if (!form.name.trim()) {
      setError("ظ†ط§ظ… ظپط¶ط§ ط§ظ„ط²ط§ظ…غŒ ط§ط³طھ.");
      return;
    }
    if (form.normalCapacity < 1 || form.maxCapacity < form.normalCapacity) {
      setError("ط¸ط±ظپغŒطھ ط­ط¯ط§ع©ط«ط± ط¨ط§غŒط¯ ط§ط² ط¸ط±ظپغŒطھ ط¹ط§ط¯غŒ ط¨غŒط´طھط± غŒط§ ط¨ط±ط§ط¨ط± ط¨ط§ط´ط¯.");
      return;
    }
    editingId ? updateItem(editingId, form) : createItem(form);
    setForm(blankSpace());
    setEditingId(null);
    setError("");
  };

  return (
    <EntityPanel
      addLabel="ط§ظپط²ظˆط¯ظ† ظپط¶ط§"
      columns={columns}
      editingId={editingId}
      error={error}
      form={
        <>
          <TextField label="ظ†ط§ظ… ظپط¶ط§" value={form.name} onChange={(name) => setForm({ ...form, name })} />
          <TextField label="ظ†ظˆط¹ ظپط¶ط§" value={form.type} onChange={(type) => setForm({ ...form, type })} />
          <TextField label="ط¸ط±ظپغŒطھ ط¹ط§ط¯غŒ" type="number" value={form.normalCapacity} onChange={(value) => setForm({ ...form, normalCapacity: Number(value) })} />
          <TextField label="ط¸ط±ظپغŒطھ ط­ط¯ط§ع©ط«ط±" type="number" value={form.maxCapacity} onChange={(value) => setForm({ ...form, maxCapacity: Number(value) })} />
          <SelectField label="ط³ط·ط­ ط­ظˆط§ط³â€Œظ¾ط±طھغŒ" value={form.distractionLevel} options={distractionOptions.map((item) => ({ label: item, value: item }))} onChange={(value) => setForm({ ...form, distractionLevel: value as DistractionLevel })} />
          <SelectField label="ظˆط¶ط¹غŒطھ" value={String(form.isActive)} options={[{ label: "ظپط¹ط§ظ„", value: "true" }, { label: "ط؛غŒط±ظپط¹ط§ظ„", value: "false" }]} onChange={(value) => setForm({ ...form, isActive: value === "true" })} />
          <ToggleField label="ظ†غŒط§ط²ظ…ظ†ط¯ ظ‡ظ…ط±ط§ظ‡" checked={form.requiresCompanion} onChange={(requiresCompanion) => setForm({ ...form, requiresCompanion })} />
          <ToggleField label="ع©ط§ط± طھع©â€Œظ†ظپط±ظ‡ ظ…ط¬ط§ط² ط§ط³طھ" checked={form.soloWorkAllowed} onChange={(soloWorkAllowed) => setForm({ ...form, soloWorkAllowed })} />
          <TextAreaField label="طھظˆط¶غŒط­ط§طھ" value={form.description} onChange={(description) => setForm({ ...form, description })} />
        </>
      }
      onCancel={() => {
        setForm(blankSpace());
        setEditingId(null);
        setError("");
      }}
      onDeactivate={deactivateItem}
      onEdit={(item) => {
        setForm(item);
        setEditingId(item.id);
      }}
      onNew={() => {
        setForm(blankSpace());
        setEditingId(null);
      }}
      onResetDemo={resetDemo}
      onSubmit={submit}
      rows={spaces}
      subtitle="طھط¹ط±غŒظپ ظˆ ظ†ع¯ظ‡ط¯ط§ط±غŒ ظپط¶ط§ظ‡ط§غŒ ع©ط§ط±غŒطŒ ط¸ط±ظپغŒطھ ظˆ ظ…ط­ط¯ظˆط¯غŒطھâ€Œظ‡ط§غŒ ط³ط§ط¯ظ‡."
      title="ظ…ط¯غŒط±غŒطھ ظپط¶ط§ظ‡ط§"
    />
  );
}

function EmployeesPage({
  employees,
  spaces,
  createItem,
  updateItem,
  deactivateItem,
  resetDemo,
}: {
  employees: Employee[];
  spaces: Space[];
  createItem: (draft: Omit<Employee, "id" | "createdAt" | "updatedAt">) => void;
  updateItem: (id: string, changes: Partial<Employee>) => void;
  deactivateItem: (id: string) => void;
  resetDemo: () => void;
}) {
  const [form, setForm] = useState(blankEmployee());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const spaceOptions = optionList(spaces, "ط¨ط¯ظˆظ† ظ…ط­ظ„ ظ¾غŒط´â€Œظپط±ط¶");
  const columns: EntityColumn<Employee>[] = [
    { label: "ظ†ط§ظ…", render: (item) => item.name },
    { label: "ظ†ظ‚ط´", render: (item) => item.primaryRole || "ط«ط¨طھ ظ†ط´ط¯ظ‡" },
    { label: "طھظ…ط±ع©ط²", render: (item) => item.focusNeed },
  ];

  const submit = () => {
    if (!form.name.trim()) {
      setError("ظ†ط§ظ… ع©ط§ط±ظ…ظ†ط¯ ط§ظ„ط²ط§ظ…غŒ ط§ط³طھ.");
      return;
    }
    editingId ? updateItem(editingId, form) : createItem(form);
    setForm(blankEmployee());
    setEditingId(null);
    setError("");
  };

  return (
    <EntityPanel
      addLabel="ط§ظپط²ظˆط¯ظ† ع©ط§ط±ظ…ظ†ط¯"
      columns={columns}
      editingId={editingId}
      error={error}
      form={
        <>
          <TextField label="ظ†ط§ظ… ع©ط§ط±ظ…ظ†ط¯" value={form.name} onChange={(name) => setForm({ ...form, name })} />
          <TextField label="ظ†ظ‚ط´ ط§طµظ„غŒ" value={form.primaryRole} onChange={(primaryRole) => setForm({ ...form, primaryRole })} />
          <TextField label="ظ…ظ‡ط§ط±طھâ€Œظ‡ط§" value={form.skills.join("طŒ ")} onChange={(value) => setForm({ ...form, skills: value.split(/[طŒ,]/).map((item) => item.trim()).filter(Boolean) })} />
          <SelectField label="ط³ط·ط­ ظ†غŒط§ط² ط¨ظ‡ طھظ…ط±ع©ط²" value={form.focusNeed} options={focusOptions.map((item) => ({ label: item, value: item }))} onChange={(value) => setForm({ ...form, focusNeed: value as FocusLevel })} />
          <SelectField label="ظ…ط­ظ„ ظ¾غŒط´â€Œظپط±ط¶" value={form.defaultSpaceId} options={spaceOptions} onChange={(defaultSpaceId) => setForm({ ...form, defaultSpaceId })} />
          <SelectField label="ظˆط¶ط¹غŒطھ" value={String(form.isActive)} options={[{ label: "ظپط¹ط§ظ„", value: "true" }, { label: "ط؛غŒط±ظپط¹ط§ظ„", value: "false" }]} onChange={(value) => setForm({ ...form, isActive: value === "true" })} />
          <ToggleField label="ظ…ظ†ط§ط³ط¨ ط¨ط±ط§غŒ ظپط±ظˆط´" checked={form.goodForSales} onChange={(goodForSales) => setForm({ ...form, goodForSales })} />
          <ToggleField label="ظ…ظ†ط§ط³ط¨ ط¨ط±ط§غŒ طھظˆظ„غŒط¯" checked={form.goodForProduction} onChange={(goodForProduction) => setForm({ ...form, goodForProduction })} />
          <ToggleField label="ظ…ظ†ط§ط³ط¨ ط¨ط±ط§غŒ دیجیتال" checked={form.goodForDigital} onChange={(goodForDigital) => setForm({ ...form, goodForDigital })} />
          <TextAreaField label="طھظˆط¶غŒط­ط§طھ" value={form.description} onChange={(description) => setForm({ ...form, description })} />
        </>
      }
      onCancel={() => {
        setForm(blankEmployee());
        setEditingId(null);
        setError("");
      }}
      onDeactivate={deactivateItem}
      onEdit={(item) => {
        setForm(item);
        setEditingId(item.id);
      }}
      onNew={() => {
        setForm(blankEmployee());
        setEditingId(null);
      }}
      onResetDemo={resetDemo}
      onSubmit={submit}
      rows={employees}
      subtitle="ط«ط¨طھ ظ¾ط±ظˆظپط§غŒظ„ ع©ط§ط±غŒطŒ ظ…ظ‡ط§ط±طھâ€Œظ‡ط§ ظˆ ظˆط¶ط¹غŒطھ ظپط¹ط§ظ„غŒطھ ط§ط¹ط¶ط§غŒ طھغŒظ…."
      title="ظ…ط¯غŒط±غŒطھ ع©ط§ط±ظ…ظ†ط¯ط§ظ†"
    />
  );
}

function TasksPage({
  taskTypes,
  spaces,
  createItem,
  updateItem,
  deactivateItem,
  resetDemo,
}: {
  taskTypes: TaskType[];
  spaces: Space[];
  createItem: (draft: Omit<TaskType, "id" | "createdAt" | "updatedAt">) => void;
  updateItem: (id: string, changes: Partial<TaskType>) => void;
  deactivateItem: (id: string) => void;
  resetDemo: () => void;
}) {
  const [form, setForm] = useState(blankTask());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const spaceOptions = optionList(spaces, "ط¨ط¯ظˆظ† ظ…ط­ظ„ ظ¾غŒط´ظ†ظ‡ط§ط¯غŒ");
  const columns: EntityColumn<TaskType>[] = [
    { label: "ظ†ط§ظ…", render: (item) => item.name },
    { label: "ط¯ط³طھظ‡", render: (item) => item.category || "ط«ط¨طھ ظ†ط´ط¯ظ‡" },
    { label: "طھظ…ط±ع©ط²", render: (item) => item.focusNeed },
  ];

  const submit = () => {
    if (!form.name.trim()) {
      setError("ظ†ط§ظ… ظ†ظˆط¹ ع©ط§ط± ط§ظ„ط²ط§ظ…غŒ ط§ط³طھ.");
      return;
    }
    editingId ? updateItem(editingId, form) : createItem(form);
    setForm(blankTask());
    setEditingId(null);
    setError("");
  };

  return (
    <EntityPanel
      addLabel="ط§ظپط²ظˆط¯ظ† ظ†ظˆط¹ ع©ط§ط±"
      columns={columns}
      editingId={editingId}
      error={error}
      form={
        <>
          <TextField label="ظ†ط§ظ… ع©ط§ط±" value={form.name} onChange={(name) => setForm({ ...form, name })} />
          <TextField label="ط¯ط³طھظ‡ ع©ط§ط±" value={form.category} onChange={(category) => setForm({ ...form, category })} />
          <SelectField label="ظ†غŒط§ط² ط¨ظ‡ طھظ…ط±ع©ط²" value={form.focusNeed} options={focusOptions.map((item) => ({ label: item, value: item }))} onChange={(value) => setForm({ ...form, focusNeed: value as FocusLevel })} />
          <SelectField label="ظ…ط­ظ„ ظ¾غŒط´ظ†ظ‡ط§ط¯غŒ" value={form.suggestedSpaceId} options={spaceOptions} onChange={(suggestedSpaceId) => setForm({ ...form, suggestedSpaceId })} />
          <SelectField label="ظˆط¶ط¹غŒطھ" value={String(form.isActive)} options={[{ label: "ظپط¹ط§ظ„", value: "true" }, { label: "ط؛غŒط±ظپط¹ط§ظ„", value: "false" }]} onChange={(value) => setForm({ ...form, isActive: value === "true" })} />
          <ToggleField label="ظ†غŒط§ط² ط¨ظ‡ ظپط¶ط§غŒ طھظ…غŒط²" checked={form.needsCleanSpace} onChange={(needsCleanSpace) => setForm({ ...form, needsCleanSpace })} />
          <ToggleField label="ظ†غŒط§ط² ط¨ظ‡ ظ‡ظ…ط±ط§ظ‡" checked={form.requiresCompanion} onChange={(requiresCompanion) => setForm({ ...form, requiresCompanion })} />
          <ToggleField label="ظ†غŒط§ط² ط¨ظ‡ ط­ط¶ظˆط± ظ…ط´طھط±غŒ" checked={form.requiresCustomerPresence} onChange={(requiresCustomerPresence) => setForm({ ...form, requiresCustomerPresence })} />
          <TextAreaField label="طھظˆط¶غŒط­ط§طھ" value={form.description} onChange={(description) => setForm({ ...form, description })} />
        </>
      }
      onCancel={() => {
        setForm(blankTask());
        setEditingId(null);
        setError("");
      }}
      onDeactivate={deactivateItem}
      onEdit={(item) => {
        setForm(item);
        setEditingId(item.id);
      }}
      onNew={() => {
        setForm(blankTask());
        setEditingId(null);
      }}
      onResetDemo={resetDemo}
      onSubmit={submit}
      rows={taskTypes}
      subtitle="طھط¹ط±غŒظپ ظ†ظˆط¹ ع©ط§ط±ظ‡ط§طŒ ظ†غŒط§ط²ظ‡ط§غŒ طھظ…ط±ع©ط²غŒ ظˆ ظ¾غŒط´ظ†ظ‡ط§ط¯ ظ…ع©ط§ظ†."
      title="ظ†ظˆط¹ ع©ط§ط±ظ‡ط§"
    />
  );
}

function SchedulePage({
  scheduleItems,
  employees,
  spaces,
  taskTypes,
  createItem,
  updateItem,
  deactivateItem,
  resetDemo,
  highlightedItemId,
}: {
  scheduleItems: WeeklyScheduleItem[];
  employees: Employee[];
  spaces: Space[];
  taskTypes: TaskType[];
  createItem: (draft: Omit<WeeklyScheduleItem, "id" | "createdAt" | "updatedAt">) => void;
  updateItem: (id: string, changes: Partial<WeeklyScheduleItem>) => void;
  deactivateItem: (id: string) => void;
  resetDemo: () => void;
  highlightedItemId?: string;
}) {
  const activeEmployees = employees.filter((item) => item.isActive);
  const activeSpaces = spaces.filter((item) => item.isActive);
  const activeTasks = taskTypes.filter((item) => item.isActive);
  const [form, setForm] = useState({ ...blankSchedule(), employeeId: activeEmployees[0]?.id ?? "", spaceId: activeSpaces[0]?.id ?? "", taskTypeId: activeTasks[0]?.id ?? "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState<ScheduleFilters>({ employeeId: "", spaceId: "", taskTypeId: "", day: "" });

  const columns: EntityColumn<WeeklyScheduleItem>[] = [
    { label: "ط±ظˆط²", render: (item) => item.day },
    { label: "ط²ظ…ط§ظ†", render: (item) => `${toPersianNumber(item.startTime)} طھط§ ${toPersianNumber(item.endTime)}` },
    { label: "ع©ط§ط±ظ…ظ†ط¯", render: (item) => employees.find((employee) => employee.id === item.employeeId)?.name ?? "ظ†ط§ظ…ط´ط®طµ" },
  ];

  const submit = () => {
    if (!form.employeeId || !form.spaceId || !form.taskTypeId) {
      setError("ط§ظ†طھط®ط§ط¨ ع©ط§ط±ظ…ظ†ط¯طŒ ظپط¶ط§ ظˆ ظ†ظˆط¹ ع©ط§ط± ط§ظ„ط²ط§ظ…غŒ ط§ط³طھ.");
      return;
    }
    if (form.startTime >= form.endTime) {
      setError("ط³ط§ط¹طھ ظ¾ط§غŒط§ظ† ط¨ط§غŒط¯ ط¨ط¹ط¯ ط§ط² ط³ط§ط¹طھ ط´ط±ظˆط¹ ط¨ط§ط´ط¯.");
      return;
    }
    editingId ? updateItem(editingId, form) : createItem(form);
    setForm({ ...blankSchedule(), employeeId: activeEmployees[0]?.id ?? "", spaceId: activeSpaces[0]?.id ?? "", taskTypeId: activeTasks[0]?.id ?? "" });
    setEditingId(null);
    setError("");
  };

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <span className="eyebrow">ط¨ط±ظ†ط§ظ…ظ‡â€Œط±غŒط²غŒ P1</span>
          <h1>ط¨ط±ظ†ط§ظ…ظ‡ ظ‡ظپطھع¯غŒ</h1>
          <p>ط§ظپط²ظˆط¯ظ†طŒ ظˆغŒط±ط§غŒط´طŒ ط؛غŒط±ظپط¹ط§ظ„â€Œط³ط§ط²غŒ ظˆ ظپغŒظ„طھط± ظˆط§ظ‚ط¹غŒ ط¨ط±ظ†ط§ظ…ظ‡ ظ‡ظپطھظ‡.</p>
        </div>
        <div className="hero-actions">
          <button className="ghost-button" type="button" onClick={resetDemo}>
            <RotateCcw size={17} /> ط¨ط§ط²ع¯ط´طھ demo
          </button>
          <button className="primary-button" type="button" onClick={() => setForm({ ...blankSchedule(), employeeId: activeEmployees[0]?.id ?? "", spaceId: activeSpaces[0]?.id ?? "", taskTypeId: activeTasks[0]?.id ?? "" })}>
            <Plus size={17} /> ط¢غŒطھظ… ط¬ط¯غŒط¯
          </button>
        </div>
      </header>

      <section className="filter-bar">
        <Filter size={16} />
        <select value={filters.employeeId} onChange={(event) => setFilters({ ...filters, employeeId: event.target.value })}>
          {optionList(employees, "ظ‡ظ…ظ‡ ع©ط§ط±ظ…ظ†ط¯ط§ظ†").map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
        </select>
        <select value={filters.spaceId} onChange={(event) => setFilters({ ...filters, spaceId: event.target.value })}>
          {optionList(spaces, "ظ‡ظ…ظ‡ ظپط¶ط§ظ‡ط§").map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
        </select>
        <select value={filters.taskTypeId} onChange={(event) => setFilters({ ...filters, taskTypeId: event.target.value })}>
          {optionList(taskTypes, "ظ‡ظ…ظ‡ ظ†ظˆط¹ ع©ط§ط±ظ‡ط§").map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
        </select>
        <select value={filters.day} onChange={(event) => setFilters({ ...filters, day: event.target.value })}>
          {dayOptions().map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
        </select>
      </section>

      <WeeklyGrid compact employees={employees} filters={filters} items={scheduleItems} spaces={spaces} taskTypes={taskTypes} />

      <section className="management-layout">
        <section className="config-card">
          <h2>{editingId ? "ظˆغŒط±ط§غŒط´ ط¢غŒطھظ… ط¨ط±ظ†ط§ظ…ظ‡" : "ط§ظپط²ظˆط¯ظ† ط¢غŒطھظ… ط¨ط±ظ†ط§ظ…ظ‡"}</h2>
          {error && <p className="form-error">{error}</p>}
          <div className="field-grid">
            <SelectField label="ط±ظˆط² ظ‡ظپطھظ‡" value={form.day} options={weekDays.map((day) => ({ label: day, value: day }))} onChange={(day) => setForm({ ...form, day: day as WorkDay })} />
            <TextField label="ط³ط§ط¹طھ ط´ط±ظˆط¹" type="time" value={form.startTime} onChange={(startTime) => setForm({ ...form, startTime })} />
            <TextField label="ط³ط§ط¹طھ ظ¾ط§غŒط§ظ†" type="time" value={form.endTime} onChange={(endTime) => setForm({ ...form, endTime })} />
            <SelectField label="ع©ط§ط±ظ…ظ†ط¯" value={form.employeeId} options={optionList(employees)} onChange={(employeeId) => setForm({ ...form, employeeId })} />
            <SelectField label="ظپط¶ط§" value={form.spaceId} options={optionList(spaces)} onChange={(spaceId) => setForm({ ...form, spaceId })} />
            <SelectField label="ظ†ظˆط¹ ع©ط§ط±" value={form.taskTypeId} options={optionList(taskTypes)} onChange={(taskTypeId) => setForm({ ...form, taskTypeId })} />
            <SelectField label="ط§ظˆظ„ظˆغŒطھ" value={form.priority} options={priorityOptions.map((item) => ({ label: item, value: item }))} onChange={(priority) => setForm({ ...form, priority: priority as PriorityLevel })} />
            <SelectField label="ظˆط¶ط¹غŒطھ" value={String(form.isActive)} options={[{ label: "ظپط¹ط§ظ„", value: "true" }, { label: "ط؛غŒط±ظپط¹ط§ظ„", value: "false" }]} onChange={(value) => setForm({ ...form, isActive: value === "true" })} />
            <TextAreaField label="طھظˆط¶غŒط­ط§طھ" value={form.description} onChange={(description) => setForm({ ...form, description })} />
          </div>
          <div className="form-actions">
            <button className="primary-button" type="button" onClick={submit}>ط°ط®غŒط±ظ‡</button>
            <button className="ghost-button" type="button" onClick={() => {
              setForm({ ...blankSchedule(), employeeId: activeEmployees[0]?.id ?? "", spaceId: activeSpaces[0]?.id ?? "", taskTypeId: activeTasks[0]?.id ?? "" });
              setEditingId(null);
              setError("");
            }}>ط§ظ†طµط±ط§ظپ</button>
          </div>
        </section>

        <section className="config-card table-card">
          <h2>ط¢غŒطھظ…â€Œظ‡ط§غŒ ط¨ط±ظ†ط§ظ…ظ‡</h2>
          <div className="entity-table">
            {scheduleItems.map((item) => (
              <article className={`${item.isActive ? "" : "inactive-row"} ${highlightedItemId === item.id ? "highlight-row" : ""}`} key={item.id}>
                <div className="entity-main">
                  {columns.map((column) => (
                    <div key={column.label}>
                      <small>{column.label}</small>
                      <strong>{column.render(item)}</strong>
                    </div>
                  ))}
                </div>
                <div className="row-actions">
                  <StatusBadge tone={toneForTask(taskTypes.find((task) => task.id === item.taskTypeId))}>
                    {taskTypes.find((task) => task.id === item.taskTypeId)?.name ?? "ظ†ط§ظ…ط´ط®طµ"}
                  </StatusBadge>
                  <button type="button" onClick={() => {
                    setForm(item);
                    setEditingId(item.id);
                  }}>ظˆغŒط±ط§غŒط´</button>
                  {item.isActive && <button className="danger-button" type="button" onClick={() => deactivateItem(item.id)}>ط؛غŒط±ظپط¹ط§ظ„â€Œط³ط§ط²غŒ</button>}
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </div>
  );
}

function RulesPage({ rules, updateItem, resetDemo }: { rules: AnalysisRule[]; updateItem: (id: string, changes: Partial<AnalysisRule>) => void; resetDemo: () => void }) {
  const iconMap: Record<string, typeof ShieldCheck> = {
    "space-capacity": Building2,
    focus: Brain,
    "basement-safety": ShieldCheck,
    "store-coverage": Store,
    "clean-dirty-conflict": CalendarDays,
  };

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <span className="eyebrow">ظ‚ظˆط§ظ†غŒظ† طھط­ظ„غŒظ„</span>
          <h1>ظ‚ظˆط§ط¹ط¯ ظ¾ط§غŒظ‡ طھطµظ…غŒظ…â€Œع¯غŒط±غŒ</h1>
          <p>ط¯ط± P1 ظپظ‚ط· ظپط¹ط§ظ„ غŒط§ ط؛غŒط±ظپط¹ط§ظ„ ط¨ظˆط¯ظ† ظ‚ظˆط§ظ†غŒظ† ظ¾ط§غŒظ‡ ط°ط®غŒط±ظ‡ ظ…غŒâ€Œط´ظˆط¯.</p>
        </div>
        <button className="ghost-button" type="button" onClick={resetDemo}>
          <RotateCcw size={17} /> ط¨ط§ط²ع¯ط´طھ demo
        </button>
      </header>
      <section className="rules-grid">
        {rules.map((rule) => {
          const Icon = iconMap[rule.key] ?? ShieldCheck;
          return (
            <article className={`rule-card tone-${rule.tone}`} key={rule.id}>
              <div className="icon-shell">
                <Icon size={22} />
              </div>
              <StatusBadge tone={rule.isActive ? rule.tone : "empty"}>{rule.isActive ? "ظپط¹ط§ظ„" : "ط؛غŒط±ظپط¹ط§ظ„"}</StatusBadge>
              <h2>{rule.title}</h2>
              <p>{rule.description}</p>
              <button className="ghost-button" type="button" onClick={() => updateItem(rule.id, { isActive: !rule.isActive })}>
                {rule.isActive ? "ط؛غŒط±ظپط¹ط§ظ„â€Œط³ط§ط²غŒ" : "ظپط¹ط§ظ„â€Œط³ط§ط²غŒ"}
              </button>
            </article>
          );
        })}
      </section>
    </div>
  );
}

function severityTone(severity: string): StatusTone {
  if (severity === "critical") return "critical";
  if (severity === "warning") return "warn";
  if (severity === "info") return "info";
  return "good";
}

function DashboardPageV2({
  spaces,
  employees,
  taskTypes,
  scheduleItems,
  rules,
  settings,
  compatibilityRules,
  resetDemo,
}: {
  spaces: Space[];
  employees: Employee[];
  taskTypes: TaskType[];
  scheduleItems: WeeklyScheduleItem[];
  rules: AnalysisRule[];
  settings: AnalysisSettings;
  compatibilityRules: WorkCompatibilityRule[];
  resetDemo: () => void;
}) {
  const analysis = analyzeWorkforce({ spaces, employees, taskTypes, scheduleItems, rules, settings, compatibilityRules });
  const recommendationInput = recommendationInputFrom({ spaces, employees, taskTypes, scheduleItems, rules, settings, compatibilityRules });
  const weeklyScenarios = getBestScenariosForWeek(recommendationInput, settings.dashboardImportantItemCount);
  const bestScenario = weeklyScenarios[0];
  const latestReport = decisionReportService.list()[0];
  const reportTrend = buildReportTrend(decisionReportService.list(true));
  const monthlyHealth = buildMonthlyHealthDashboard(decisionReportService.list(true));
  const snapshotCount = workforceBackupService.listSnapshots().length;
  const preventiveAlerts = preventiveAlertStateService.applyStates(buildPreventiveAlerts({
    reports: decisionReportService.list(true),
    monthlyHealth,
    monthlyGoals: monthlyGoalService.list(true),
  }));
  const activeAlertKeys = preventiveAlerts.map(preventiveAlertKey);
  const maintenanceReport = workforceMaintenanceService.runReport(activeAlertKeys);
  const readinessReport = buildOperationalReadinessReport({
    spaces,
    employees,
    taskTypes,
    scheduleItems,
    rules,
    settings,
    snapshots: workforceBackupService.listSnapshots(),
    maintenanceReport,
    decisionReports: decisionReportService.list(true),
    monthlyGoals: monthlyGoalService.list(true),
    preventiveAlerts,
  });
  const savedLaunchReport = launchChecklistService.list();
  const launchReport = savedLaunchReport.items.length
    ? savedLaunchReport
    : buildLaunchChecklistFromReadiness(readinessReport);
  const latestLaunchSignoff = launchSignoffService.latestSigned();
  const baselineDrift = currentBaselineDriftReport();
  const operationalHistory = operationalHistoryService.buildOperationalHistoryReport();
  const driftWorsening = detectIncreasingDriftTrend(operationalHistory.driftTrend);
  const retentionReport = historyRetentionService.buildRetentionReport(baselineDrift.driftLevel);
  const operationsCalendar = operationsCalendarService.preview(currentOperationsCalendarState({ spaces, employees, taskTypes, scheduleItems, rules, settings }));
  const operationalNotifications = operationalNotificationService.getNotificationSummary();
  const topPreventiveAlert = preventiveAlerts.find((alert) => alert.status === "open" && (alert.priority === "urgent" || alert.severity === "critical")) ?? preventiveAlerts[0];
  const previousTrendPoint = reportTrend[reportTrend.length - 2];
  const latestTrendPoint = reportTrend[reportTrend.length - 1];
  const trendDelta = latestTrendPoint && previousTrendPoint ? latestTrendPoint.controlScoreAfter - previousTrendPoint.controlScoreAfter : 0;
  const activeSchedule = scheduleItems.filter((item) => item.isActive);
  const activeEmployees = employees.filter((item) => item.isActive);
  const activeRuleCount = rules.filter((rule) => rule.isActive).length;
  const conflictCount = analysis.findings.filter((item) =>
    item.title.includes("طھط¯ط§ط®ظ„") ||
    item.title.includes("ط¸â€،ط¸â€¦") ||
    item.recommendation.includes("ط¬ط¯ط§")
  ).length;

  const kpis = [
    {
      label: "ظˆط¶ط¹غŒطھ ظ‡ظپطھظ‡",
      value: analysis.controlScore >= 80 ? "ع©ظ†طھط±ظ„â€Œط´ط¯ظ‡" : analysis.controlScore >= 55 ? "ظ†غŒط§ط²ظ…ظ†ط¯ طھظˆط¬ظ‡" : "ط¨ط­ط±ط§ظ†غŒ",
      caption: `ط§ظ…طھغŒط§ط² ع©ظ†طھط±ظ„ ${toPersianNumber(analysis.controlScore)} ط§ط² غ±غ°غ°`,
      tone: analysis.controlScore >= 80 ? "good" as StatusTone : analysis.controlScore >= 55 ? "warn" as StatusTone : "critical" as StatusTone,
      icon: CheckCircle2,
    },
    {
      label: "ظ‡ط´ط¯ط§ط±ظ‡ط§غŒ ظپط¹ط§ظ„",
      value: toPersianNumber(analysis.findings.length),
      caption: `${toPersianNumber(analysis.criticalCount)} ط¨ط­ط±ط§ظ†غŒطŒ ${toPersianNumber(analysis.warningCount)} ظ‡ط´ط¯ط§ط±`,
      tone: analysis.criticalCount ? "critical" as StatusTone : analysis.warningCount ? "warn" as StatusTone : "good" as StatusTone,
      icon: AlertTriangle,
    },
    {
      label: "ظ¾ظˆط´ط´ ظپط±ظˆط´ع¯ط§ظ‡",
      value: toPersianNumber(analysis.salesCoverageScore),
      caption: "ط§ظ…طھغŒط§ط² ظ¾ظˆط´ط´ ط§ط² ظ…ظˆطھظˆط± طھط­ظ„غŒظ„",
      tone: analysis.salesCoverageScore >= 80 ? "sales" as StatusTone : analysis.salesCoverageScore >= 55 ? "warn" as StatusTone : "critical" as StatusTone,
      icon: Store,
    },
    {
      label: "ط²ظ…ط§ظ† طھظ…ط±ع©ط²",
      value: toPersianNumber(analysis.focusScore),
      caption: "ط§ظ…طھغŒط§ط² طھظ…ط±ع©ط² ظˆ طھط¯ط§ط®ظ„ طھظ…ط±ع©ط²",
      tone: analysis.focusScore >= 80 ? "focus" as StatusTone : analysis.focusScore >= 55 ? "warn" as StatusTone : "critical" as StatusTone,
      icon: Brain,
    },
    {
      label: "طھط¯ط§ط®ظ„â€Œظ‡ط§",
      value: toPersianNumber(conflictCount),
      caption: "غŒط§ظپطھظ‡â€Œظ‡ط§غŒ ظ…ط±طھط¨ط· ط¨ط§ طھط¯ط§ط®ظ„",
      tone: conflictCount ? "critical" as StatusTone : "good" as StatusTone,
      icon: Flame,
    },
  ];

  const capacityItems = spaces.filter((space) => space.isActive).map((space) => {
    const snapshots = analysis.occupancySnapshots.filter((snapshot) => snapshot.spaceId === space.id);
    const peak = snapshots.reduce((max, snapshot) => Math.max(max, snapshot.employeeCount), 0);
    const usage = Math.min(100, Math.round((peak / Math.max(space.maxCapacity, 1)) * 100));
    const critical = snapshots.some((snapshot) => snapshot.status === "critical");
    const warning = snapshots.some((snapshot) => snapshot.status === "warning");
    return {
      name: space.name,
      usage,
      caption: `ط§ظˆط¬ ط­ط¶ظˆط± ${toPersianNumber(peak)} ظ†ظپط±`,
      tone: critical ? "critical" as StatusTone : warning ? "warn" as StatusTone : isSalesSpaceName(space) ? "sales" as StatusTone : "good" as StatusTone,
    };
  });

  const topFindings = [...analysis.findings].sort((a, b) => b.scoreImpact - a.scoreImpact).slice(0, settings.dashboardImportantItemCount);
  const urgentAlerts = topFindings.length
    ? topFindings.map((item) => ({
      title: item.title,
      caption: item.dayOfWeek ? `${item.dayOfWeek} ${toPersianNumber(item.startTime ?? "")}: ${item.description}` : item.description,
      tone: severityTone(item.severity),
    }))
    : [{ title: "ط¨ط¯ظˆظ† ظ‡ط´ط¯ط§ط± ظ…ظ‡ظ…", caption: "ظ…ظˆطھظˆط± طھط­ظ„غŒظ„ ظ…ظˆط±ط¯ ط¨ط­ط±ط§ظ†غŒ غŒط§ ظ‡ط´ط¯ط§ط± ط¬ط¯غŒ ظ¾غŒط¯ط§ ظ†ع©ط±ط¯.", tone: "good" as StatusTone }];

  const smartSuggestions = weeklyScenarios.length
    ? weeklyScenarios.slice(0, 5).map((item) => ({
      title: item.title,
      caption: item.reason,
      tone: item.canApply ? "good" as StatusTone : severityTone(item.riskLevel),
    }))
    : [{ title: "ظ¾ط§غŒط´ ظ‡ظپطھظ‡", caption: "ط¨ط±ظ†ط§ظ…ظ‡ ظپط¹ظ„غŒ ط±ط§ ط¨ط§ ط¯ط§ط¯ظ‡â€Œظ‡ط§غŒ ع©ط§ظ…ظ„â€Œطھط± ظ¾ط§غŒط´ ع©ظ†.", tone: "info" as StatusTone }];

  const employeeSummaries = activeEmployees.map((employee) => {
    const employeeItems = activeSchedule.filter((item) => item.employeeId === employee.id);
    const hours = employeeItems.reduce((sum, item) => sum + durationHours(item), 0);
    const relatedFindings = analysis.findings.filter((findingItem) => findingItem.affectedEmployeeIds.includes(employee.id));
    return {
      name: employee.name,
      role: employee.primaryRole || "ط¨ط¯ظˆظ† ظ†ظ‚ط´",
      hours: Math.round(hours),
      alerts: relatedFindings.length,
      tone: relatedFindings.some((item) => item.severity === "critical")
        ? "critical" as StatusTone
        : relatedFindings.length
          ? "warn" as StatusTone
          : employee.goodForSales
            ? "sales" as StatusTone
            : employee.goodForDigital
              ? "focus" as StatusTone
              : "info" as StatusTone,
    };
  });

  const scoreCells = [
    { label: "طھظ…ط±ع©ط²", value: analysis.focusScore, tone: analysis.focusScore >= 80 ? "focus" as StatusTone : "warn" as StatusTone },
    { label: "ظپط±ظˆط´", value: analysis.salesCoverageScore, tone: analysis.salesCoverageScore >= 80 ? "sales" as StatusTone : "warn" as StatusTone },
    { label: "ط¸ط±ظپغŒطھ", value: analysis.spaceCapacityScore, tone: analysis.spaceCapacityScore >= 80 ? "good" as StatusTone : "critical" as StatusTone },
    { label: "ط§غŒظ…ظ†غŒ", value: analysis.safetyScore, tone: analysis.safetyScore >= 80 ? "good" as StatusTone : "critical" as StatusTone },
  ];

  const decisionItems = [
    { title: "ظ…ط³ط¦ظ„ظ‡ ط§طµظ„غŒ", caption: analysis.mainProblem, tone: analysis.criticalCount ? "critical" as StatusTone : analysis.warningCount ? "warn" as StatusTone : "good" as StatusTone },
    { title: "ط¨ظ‡طھط±غŒظ† ظ¾غŒط´ظ†ظ‡ط§ط¯", caption: bestScenario ? `${bestScenario.title} - ${bestScenario.expectedEffect}` : analysis.nextBestAction, tone: bestScenario?.canApply ? "good" as StatusTone : "info" as StatusTone },
    { title: "طµظپ طھطµظ…غŒظ…â€Œع¯غŒط±غŒ", caption: `${toPersianNumber(weeklyScenarios.filter((item) => item.canApply).length)} ظ¾غŒط´ظ†ظ‡ط§ط¯ ظ‚ط§ط¨ظ„ ط¨ط±ط±ط³غŒ ط¨ط±ط§غŒ طھط±ع©غŒط¨ ط§ظ…ظ† ط¢ظ…ط§ط¯ظ‡ ط§ط³طھ.`, tone: "focus" as StatusTone },
    { title: "ط¢ط®ط±غŒظ† ع¯ط²ط§ط±ط´", caption: latestReport ? `${latestReport.status} | ع©ظ†طھط±ظ„ ${toPersianNumber(latestReport.summary.controlScoreBefore)} ط¨ظ‡ ${toPersianNumber(latestReport.summary.controlScoreAfter)}` : "ظ‡ظ†ظˆط² ع¯ط²ط§ط±ط´ طھطµظ…غŒظ…غŒ ط³ط§ط®طھظ‡ ظ†ط´ط¯ظ‡ ط§ط³طھ.", tone: latestReport ? "info" as StatusTone : "empty" as StatusTone },
    { title: "ط±ظˆظ†ط¯ ظ…ط¯غŒط±غŒطھغŒ", caption: latestTrendPoint && previousTrendPoint ? `ط¢ط®ط±غŒظ† ع©ظ†طھط±ظ„ ${toPersianNumber(latestTrendPoint.controlScoreAfter)} | طھط؛غŒغŒط± ${toPersianNumber(trendDelta)}` : "ط¨ط±ط§غŒ ط±ظˆظ†ط¯طŒ ط­ط¯ط§ظ‚ظ„ ط¯ظˆ ع¯ط²ط§ط±ط´ ظ„ط§ط²ظ… ط§ط³طھ.", tone: trendDelta > 0 ? "good" as StatusTone : trendDelta < 0 ? "critical" as StatusTone : "info" as StatusTone },
    { title: "ط³ظ„ط§ظ…طھ ظ…ط§ظ‡ط§ظ†ظ‡", caption: `${monthlyHealth.healthLevel} | ع©ظ†طھط±ظ„ ${toPersianNumber(monthlyHealth.averageControlScore)} | ${monthlyHealth.topRecurringRisks[0] ?? "ط±غŒط³ع© طھع©ط±ط§ط±غŒ ظ…ظ‡ظ… ظ†ط¯ط§ط±ط¯"}`, tone: monthlyHealth.healthLevel === "critical" ? "critical" as StatusTone : monthlyHealth.healthLevel === "needs_attention" ? "warn" as StatusTone : "good" as StatusTone },
    { title: "ظ‡ط´ط¯ط§ط± ظ¾غŒط´ع¯غŒط±ط§ظ†ظ‡", caption: topPreventiveAlert ? `${topPreventiveAlert.title} | ${topPreventiveAlert.recommendedAction}` : "ظ‡ط´ط¯ط§ط± ظ¾غŒط´ع¯غŒط±ط§ظ†ظ‡ ظپط¹ط§ظ„غŒ ظˆط¬ظˆط¯ ظ†ط¯ط§ط±ط¯.", tone: topPreventiveAlert ? preventiveSeverityTone(topPreventiveAlert.severity) : "good" as StatusTone },
    { title: "ط¬ط¹ط¨ظ‡ ط³غŒط§ظ‡ ط¯ط§ط¯ظ‡â€Œظ‡ط§", caption: snapshotCount ? `${toPersianNumber(snapshotCount)} snapshot ط°ط®غŒط±ظ‡ ط´ط¯ظ‡ ط§ط³طھ.` : "ظ‡ظ†ظˆط² ط¨ع©ط§ظ¾غŒ ط«ط¨طھ ظ†ط´ط¯ظ‡ط› غŒع© snapshot ط¨ط³ط§ط².", tone: snapshotCount ? "focus" as StatusTone : "warn" as StatusTone },
    { title: "ط³ظ„ط§ظ…طھ ط¯ط§ط¯ظ‡â€Œظ‡ط§", caption: `${maintenanceHealthLabel(maintenanceReport.healthStatus)} | ${toPersianNumber(maintenanceReport.totalIssues)} ظ…ظˆط±ط¯ ظ†ع¯ظ‡ط¯ط§ط±غŒ`, tone: maintenanceHealthTone(maintenanceReport.healthStatus) },
    { title: "ط¢ظ…ط§ط¯ع¯غŒ ط¹ظ…ظ„غŒط§طھغŒ", caption: `${readinessStatusLabel(readinessReport.status)} | ط§ظ…طھغŒط§ط² ${toPersianNumber(readinessReport.score)} | ${readinessReport.topActions[0]?.title ?? "ط§ظ‚ط¯ط§ظ… ظپظˆط±غŒ ظ†ط¯ط§ط±ط¯"}`, tone: readinessStatusTone(readinessReport.status) },
    { title: "Drift ظ†ط³ط¨طھ ط¨ظ‡ baseline", caption: `${driftLevelLabel(baselineDrift.driftLevel)} | ط§ظ…طھغŒط§ط² ${toPersianNumber(baselineDrift.driftScore)} | ${baselineDrift.requiresResignoff ? "ظ†غŒط§ط²ظ…ظ†ط¯ ط¨ط§ط²طھط£غŒغŒط¯" : "ط¯ط± ظ…ط­ط¯ظˆط¯ظ‡ ظ¾ط§غŒط´"}`, tone: driftTone(baselineDrift.driftLevel) },
    { title: "طھط§ط±غŒط®ع†ظ‡ ط¹ظ…ظ„غŒط§طھغŒ", caption: `${toPersianNumber(operationalHistory.events.length)} ط±ظˆغŒط¯ط§ط¯ | ${driftWorsening ? "ط±ظˆظ†ط¯ drift ط¨ط¯طھط±ط´ظˆظ†ط¯ظ‡" : "ط±ظˆظ†ط¯ ظ¾ط§غŒط¯ط§ط± غŒط§ ظ†ط§ع©ط§ظپغŒ"}`, tone: driftWorsening ? "critical" as StatusTone : "info" as StatusTone },
    { title: "ط§ظ†ط¶ط¨ط§ط· طھط§ط±غŒط®ع†ظ‡", caption: `${retentionStatusLabel(retentionReport.status)} | ${toPersianNumber(retentionReport.archiveCandidateCount)} ظ‚ط§ط¨ظ„ ط¢ط±ط´غŒظˆ`, tone: retentionStatusTone(retentionReport.status) },
    { title: "طھظ‚ظˆغŒظ… ع©ظ†طھط±ظ„â€Œظ‡ط§", caption: `${toPersianNumber(operationsCalendar.overdueCount)} ط¹ظ‚ط¨â€Œط§ظپطھط§ط¯ظ‡ | ${toPersianNumber(operationsCalendar.todayCount)} ط§ظ…ط±ظˆط² | ${operationsCalendar.nextBestControl?.title ?? "ع©ظ†طھط±ظ„ ط¨ط§ط²غŒ ط¨ط§ظ‚غŒ ظ†ظ…ط§ظ†ط¯ظ‡"}`, tone: operationsCalendar.urgentCount || operationsCalendar.overdueCount ? "critical" as StatusTone : operationsCalendar.todayCount ? "warn" as StatusTone : "good" as StatusTone },
    { title: "ط§ط¹ظ„ط§ظ†â€Œظ‡ط§غŒ ط¹ظ…ظ„غŒط§طھغŒ", caption: `${toPersianNumber(operationalNotifications.unread)} ط®ظˆط§ظ†ط¯ظ‡â€Œظ†ط´ط¯ظ‡ | ${toPersianNumber(operationalNotifications.urgent)} ظپظˆط±غŒ | ${toPersianNumber(operationalNotifications.dueToday)} ط§ظ…ط±ظˆط²`, tone: operationalNotifications.urgent ? "critical" as StatusTone : operationalNotifications.unread ? "warn" as StatusTone : "good" as StatusTone },
    { title: "ط±غŒط³ع© ع©ظ„", caption: `${toPersianNumber(analysis.totalRiskScore)} ط§ظ…طھغŒط§ط² ط±غŒط³ع© ط§ط² ${toPersianNumber(activeRuleCount)} ظ‚ط§ظ†ظˆظ† ظپط¹ط§ظ„`, tone: analysis.totalRiskScore > 40 ? "critical" as StatusTone : analysis.totalRiskScore > 15 ? "warn" as StatusTone : "good" as StatusTone },
  ];

  return (
    <div className="page-stack">
      <header className="hero-header">
        <div>
          <span className="eyebrow">ط¯ط§ط´ط¨ظˆط±ط¯ ظ‡ظپطھع¯غŒ P2</span>
          <h1>ط§طھط§ظ‚ ظپط±ظ…ط§ظ† ظ‡ظپطھظ‡</h1>
          <p>طھط­ظ„غŒظ„ ظˆط§ظ‚ط¹غŒ ط§ط² ط¯ط§ط¯ظ‡â€Œظ‡ط§غŒ ط°ط®غŒط±ظ‡â€Œط´ط¯ظ‡طŒ ظ‚ظˆط§ظ†غŒظ† ظپط¹ط§ظ„ ظˆ ط¨ط±ظ†ط§ظ…ظ‡ ظ‡ظپطھع¯غŒ.</p>
        </div>
        <div className="hero-actions">
          <button className="ghost-button" type="button" onClick={resetDemo}>
            <RotateCcw size={17} /> ط¨ط§ط²ع¯ط´طھ demo
          </button>
          <a className="primary-button" href="/organization/workforce-dashboard/rules">
            <Sparkles size={17} /> ظ‚ظˆط§ظ†غŒظ† طھط­ظ„غŒظ„
          </a>
          <a className="ghost-button" href="/organization/workforce-dashboard/analysis">
            <AlertTriangle size={17} /> ظ…ط´ط§ظ‡ط¯ظ‡ ط¬ط²ط¦غŒط§طھ طھط­ظ„غŒظ„
          </a>
          <a className="ghost-button" href="/organization/workforce-dashboard/recommendations">
            <Sparkles size={17} /> ظ…ط´ط§ظ‡ط¯ظ‡ ظ‡ظ…ظ‡ ظ¾غŒط´ظ†ظ‡ط§ط¯ظ‡ط§
          </a>
          <a className="ghost-button" href="/organization/workforce-dashboard/decision-queue">
            <CheckCircle2 size={17} /> طµظپ طھطµظ…غŒظ…â€Œع¯غŒط±غŒ
          </a>
          <a className="ghost-button" href="/organization/workforce-dashboard/decision-report">
            <Activity size={17} /> ع¯ط²ط§ط±ط´â€Œظ‡ط§غŒ طھطµظ…غŒظ…
          </a>
          <a className="ghost-button" href="/organization/workforce-dashboard/report-archive">
            <CalendarDays size={17} /> ط¢ط±ط´غŒظˆ طھطµظ…غŒظ…â€Œظ‡ط§
          </a>
          <a className="ghost-button" href="/organization/workforce-dashboard/monthly-health">
            <Activity size={17} /> ط³ظ„ط§ظ…طھ ظ…ط§ظ‡ط§ظ†ظ‡
          </a>
          <a className="ghost-button" href="/organization/workforce-dashboard/preventive-alerts">
            <AlertTriangle size={17} /> ظ‡ط´ط¯ط§ط± ظ¾غŒط´ع¯غŒط±ط§ظ†ظ‡
          </a>
          <a className="ghost-button" href="/organization/workforce-dashboard/readiness">
            <ShieldCheck size={17} /> ط¢ظ…ط§ط¯ع¯غŒ ط¹ظ…ظ„غŒط§طھغŒ
          </a>
          <a className="ghost-button" href="/organization/workforce-dashboard/launch-checklist">
            <ClipboardCheck size={17} /> ع†ع©â€Œظ„غŒط³طھ ط±ط§ظ‡â€Œط§ظ†ط¯ط§ط²غŒ
          </a>
          <a className="ghost-button" href="/organization/workforce-dashboard/launch-signoff">
            <FileCheck2 size={17} /> طھط£غŒغŒط¯ ط±ط§ظ‡â€Œط§ظ†ط¯ط§ط²غŒ
          </a>
          <a className="ghost-button" href="/organization/workforce-dashboard/baseline-drift">
            <Activity size={17} /> ظ¾ط§غŒط´ Drift
          </a>
          <a className="ghost-button" href="/organization/workforce-dashboard/operational-history">
            <Clock3 size={17} /> طھط§ط±غŒط®ع†ظ‡ ط¹ظ…ظ„غŒط§طھغŒ
          </a>
          <a className="ghost-button" href="/organization/workforce-dashboard/history-retention">
            <ShieldCheck size={17} /> ظ†ع¯ظ‡ط¯ط§ط±غŒ طھط§ط±غŒط®ع†ظ‡
          </a>
          <a className="ghost-button" href="/organization/workforce-dashboard/operations-calendar">
            <CalendarDays size={17} /> طھظ‚ظˆغŒظ… ع©ظ†طھط±ظ„â€Œظ‡ط§
          </a>
          <a className="ghost-button" href="/organization/workforce-dashboard/data-center">
            <ShieldCheck size={17} /> ط¬ط¹ط¨ظ‡ ط³غŒط§ظ‡ ط¯ط§ط¯ظ‡â€Œظ‡ط§
          </a>
          <a className="ghost-button" href="/organization/workforce-dashboard/simulator">
            <Sparkles size={17} /> ط´ط¨غŒظ‡â€Œط³ط§ط²
          </a>
        </div>
      </header>

      <section className="kpi-strip">
        {kpis.map((card) => {
          const Icon = card.icon;
          return (
            <article className={`kpi-card tone-${card.tone}`} key={card.label}>
              <div className="icon-shell">
                <Icon size={20} />
              </div>
              <div>
                <p>{card.label}</p>
                <strong>{card.value}</strong>
                <span>{card.caption}</span>
              </div>
            </article>
          );
        })}
      </section>

      <section className="cockpit-grid">
        <div className="side-column">
          <CapacityPanel items={capacityItems} />
          <section className="panel">
            <h2>ط§ظ…طھغŒط§ط²ظ‡ط§غŒ طھط­ظ„غŒظ„</h2>
            <div className="score-grid">
              {scoreCells.map((item) => (
                <div className={`heat-cell tone-${item.tone}`} key={item.label}>
                  <strong>{toPersianNumber(item.value)}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
        <div className="center-column">
          <WeeklyGrid employees={employees} items={scheduleItems} spaces={spaces} taskTypes={taskTypes} />
        </div>
        <div className="side-column">
          <InfoPanel title="ظ‡ط´ط¯ط§ط±ظ‡ط§غŒ ظپظˆط±غŒ" items={urgentAlerts} />
          <InfoPanel title="ظ¾غŒط´ظ†ظ‡ط§ط¯ظ‡ط§غŒ ظ‡ظˆط´ظ…ظ†ط¯" items={smartSuggestions} />
          <a className="primary-button full-button" href="/organization/workforce-dashboard/recommendations">
            <Sparkles size={17} /> ظ…ط´ط§ظ‡ط¯ظ‡ ظ‡ظ…ظ‡ ظ¾غŒط´ظ†ظ‡ط§ط¯ظ‡ط§
          </a>
        </div>
      </section>

      <section className="bottom-grid">
        <section className={`panel launch-progress-card tone-${operationalNotifications.urgent ? "critical" : operationalNotifications.unread ? "warn" : "good"}`}>
          <div className="section-head"><h2>ط§ط¹ظ„ط§ظ†â€Œظ‡ط§غŒ ط¹ظ…ظ„غŒط§طھغŒ</h2><StatusBadge tone={operationalNotifications.urgent ? "critical" : operationalNotifications.unread ? "warn" : "good"}>{toPersianNumber(operationalNotifications.unread)} ط®ظˆط§ظ†ط¯ظ‡â€Œظ†ط´ط¯ظ‡</StatusBadge></div>
          <p>{toPersianNumber(operationalNotifications.urgent)} ظپظˆط±غŒ ظˆ {toPersianNumber(operationalNotifications.dueToday)} ظ…ظˆط±ط¯ ط¨ط§ ظ…ظˆط¹ط¯ ط§ظ…ط±ظˆط²</p>
          <small>ط§ط¹ظ„ط§ظ†â€Œظ‡ط§ ظ…ط­ظ„غŒâ€Œط§ظ†ط¯ ظˆ ظپظ‚ط· ط¯ط§ط®ظ„ ط§غŒظ† ط¯ط§ط´ط¨ظˆط±ط¯ ظ†ع¯ظ‡ط¯ط§ط±غŒ ظ…غŒâ€Œط´ظˆظ†ط¯.</small>
          <a className="primary-button" href="/organization/workforce-dashboard/operations-calendar">ظ…ط´ط§ظ‡ط¯ظ‡ ط§ط¹ظ„ط§ظ†â€Œظ‡ط§</a>
        </section>
        <section className={`panel launch-progress-card tone-${operationsCalendar.urgentCount || operationsCalendar.overdueCount ? "critical" : operationsCalendar.todayCount ? "warn" : "good"}`}>
          <div className="section-head"><h2>طھظ‚ظˆغŒظ… ع©ظ†طھط±ظ„â€Œظ‡ط§غŒ ط¹ظ…ظ„غŒط§طھغŒ</h2><StatusBadge tone={operationsCalendar.urgentCount ? "critical" : operationsCalendar.todayCount ? "warn" : "good"}>{toPersianNumber(operationsCalendar.totalControls)} ع©ظ†طھط±ظ„</StatusBadge></div>
          <p>{operationsCalendar.summary}</p>
          <small>{operationsCalendar.nextBestControl ? `ط§ظ‚ط¯ط§ظ… ط¨ط¹ط¯غŒ: ${operationsCalendar.nextBestControl.title}` : "ظ‡ظ…ظ‡ ع©ظ†طھط±ظ„â€Œظ‡ط§ ط±ط³غŒط¯ع¯غŒ ط´ط¯ظ‡â€Œط§ظ†ط¯."}</small>
          <a className="primary-button" href="/organization/workforce-dashboard/operations-calendar"><CalendarDays size={17} /> ظ…ط´ط§ظ‡ط¯ظ‡ طھظ‚ظˆغŒظ…</a>
        </section>
        {(retentionReport.status === "risky" || retentionReport.status === "needs_review") && (
          <section className={`panel launch-progress-card tone-${retentionStatusTone(retentionReport.status)}`}>
            <div className="section-head"><h2>ط³غŒط§ط³طھ ظ†ع¯ظ‡ط¯ط§ط±غŒ</h2><StatusBadge tone={retentionStatusTone(retentionReport.status)}>{retentionStatusLabel(retentionReport.status)}</StatusBadge></div>
            <p>{retentionReport.summary}</p><small>{retentionReport.recommendations[0]}</small><a className="primary-button" href="/organization/workforce-dashboard/history-retention">ط¨ط±ط±ط³غŒ retention</a>
          </section>
        )}
        <section className={`panel launch-progress-card tone-${driftWorsening ? "critical" : "info"}`}>
          <div className="section-head"><h2>طھط§ط±غŒط®ع†ظ‡ ط¹ظ…ظ„غŒط§طھغŒ</h2><StatusBadge tone={driftWorsening ? "critical" : "info"}>{driftWorsening ? "ط±ظˆ ط¨ظ‡ ط¨ط¯طھط±ط´ط¯ظ†" : "ظ¾ط§غŒط´ ظپط¹ط§ظ„"}</StatusBadge></div>
          <p>{operationalHistory.summary}</p>
          <small>{operationalHistory.recommendedAction}</small>
          <a className="primary-button" href="/organization/workforce-dashboard/operational-history">ظ…ط´ط§ظ‡ط¯ظ‡ طھط§ط±غŒط®ع†ظ‡</a>
        </section>
        <section className={`panel launch-progress-card tone-${driftTone(baselineDrift.driftLevel)}`}>
          <div className="section-head"><h2>Drift ظ†ط³ط¨طھ ط¨ظ‡ baseline</h2><StatusBadge tone={driftTone(baselineDrift.driftLevel)}>{driftLevelLabel(baselineDrift.driftLevel)}</StatusBadge></div>
          <strong>{toPersianNumber(baselineDrift.driftScore)} ط§ط² غ±غ°غ°</strong>
          <small>{baselineDrift.requiresResignoff ? "ط¨ط§ط²طھط£غŒغŒط¯ ط¹ظ…ظ„غŒط§طھغŒ ظ„ط§ط²ظ… ط§ط³طھ." : baselineDrift.recommendedAction}</small>
          <a className="primary-button" href="/organization/workforce-dashboard/baseline-drift">ظ…ط´ط§ظ‡ط¯ظ‡ طھط؛غŒغŒط±ط§طھ</a>
        </section>
        <section className={`panel launch-progress-card tone-${latestLaunchSignoff ? "good" : "warn"}`}>
          <div className="section-head">
            <h2>ظˆط¶ط¹غŒطھ ط±ط§ظ‡â€Œط§ظ†ط¯ط§ط²غŒ</h2>
            <StatusBadge tone={latestLaunchSignoff ? "good" : "warn"}>{latestLaunchSignoff ? "ط¹ظ…ظ„غŒط§طھغŒ" : "طھط£غŒغŒط¯ظ†ط´ط¯ظ‡"}</StatusBadge>
          </div>
          <p>{latestLaunchSignoff ? "ط³غŒط³طھظ… ط¹ظ…ظ„غŒط§طھغŒ ط´ط¯ظ‡ ط§ط³طھ." : "ط±ط§ظ‡â€Œط§ظ†ط¯ط§ط²غŒ ظ‡ظ†ظˆط² طھط£غŒغŒط¯ ظ†ط´ط¯ظ‡ ط§ط³طھ."}</p>
          <small>{latestLaunchSignoff ? `${latestLaunchSignoff.signedBy} | ${toPersianNumber(new Date(latestLaunchSignoff.signedAt ?? latestLaunchSignoff.updatedAt).toLocaleDateString("fa-IR"))}` : "ع¯ط²ط§ط±ط´ ظ†ظ‡ط§غŒغŒ ظˆ baseline ط±ط§ ط«ط¨طھ ع©ظ†غŒط¯."}</small>
          <a className="primary-button" href="/organization/workforce-dashboard/launch-signoff"><FileCheck2 size={17} /> ع¯ط²ط§ط±ط´ طھط£غŒغŒط¯</a>
        </section>
        <section className="panel launch-progress-card">
          <div className="section-head">
            <h2>ظ¾غŒط´ط±ظپطھ ط±ط§ظ‡â€Œط§ظ†ط¯ط§ط²غŒ</h2>
            <StatusBadge tone={launchReport.criticalOpenCount ? "critical" : launchReport.openCount ? "warn" : "good"}>
              {toPersianNumber(launchReport.progressPercent)}ظھ
            </StatusBadge>
          </div>
          <div className="mini-meter readiness-meter"><span style={{ width: `${launchReport.progressPercent}%` }} /></div>
          <p>{toPersianNumber(launchReport.openCount)} ط§ظ‚ط¯ط§ظ… ط¨ط§ط²</p>
          <small>{launchReport.nextBestStep?.title ?? "ع¯ط§ظ… ط±ط§ظ‡â€Œط§ظ†ط¯ط§ط²غŒ ط¨ط§ط²غŒ ط¨ط§ظ‚غŒ ظ†ظ…ط§ظ†ط¯ظ‡ ط§ط³طھ."}</small>
          <a className="primary-button" href="/organization/workforce-dashboard/launch-checklist">
            <ClipboardCheck size={17} /> ط§ط¯ط§ظ…ظ‡ ط±ط§ظ‡â€Œط§ظ†ط¯ط§ط²غŒ
          </a>
        </section>
        <section className="panel wide-panel">
          <h2>ظˆط¶ط¹غŒطھ ط®ظ„ط§طµظ‡ ع©ط§ط±ظ…ظ†ط¯ظ‡ط§</h2>
          <div className="employee-list">
            {employeeSummaries.map((employee) => (
              <article key={employee.name}>
                <div>
                  <strong>{employee.name}</strong>
                  <span>{employee.role}طŒ {toPersianNumber(employee.hours)} ط³ط§ط¹طھطŒ {toPersianNumber(employee.alerts)} ظ‡ط´ط¯ط§ط±</span>
                </div>
                <StatusBadge tone={employee.tone}>{employee.alerts ? "ظ†غŒط§ط²ظ…ظ†ط¯ طھظˆط¬ظ‡" : "ظ¾ط§غŒط¯ط§ط±"}</StatusBadge>
              </article>
            ))}
          </div>
        </section>
        <InfoPanel title="ظ…ط±ع©ط² طھطµظ…غŒظ… ظ‡ظپطھظ‡" items={decisionItems} />
        <section className="panel">
          <h2>ط¬ط²ط¦غŒط§طھ طھط­ظ„غŒظ„</h2>
          <div className="analysis-list">
            {topFindings.slice(0, 5).map((item) => (
              <article className={`panel-row tone-${severityTone(item.severity)}`} key={item.id}>
                <StatusBadge tone={severityTone(item.severity)}>
                  {item.severity === "critical" ? "ط¨ط­ط±ط§ظ†غŒ" : item.severity === "warning" ? "ظ‡ط´ط¯ط§ط±" : "ط§ط·ظ„ط§ط¹"}
                </StatusBadge>
                <p>{item.title}</p>
                <small>{item.recommendation}</small>
              </article>
            ))}
            {!topFindings.length && <p>ط¬ط²ط¦غŒط§طھ ظ…ظ‡ظ…غŒ ط¨ط±ط§غŒ ظ†ظ…ط§غŒط´ ظˆط¬ظˆط¯ ظ†ط¯ط§ط±ط¯.</p>}
          </div>
        </section>
      </section>
    </div>
  );
}

function isSalesSpaceName(space: Space) {
  return `${space.name} ${space.type}`.includes("ظپط±ظˆط´") || `${space.name} ${space.type}`.includes("ط¸ظ¾ط·آ±ط¸ث†ط·آ´");
}

function severityLabel(severity: AnalysisSeverity) {
  if (severity === "critical") return "ط¨ط­ط±ط§ظ†غŒ";
  if (severity === "warning") return "ظ‡ط´ط¯ط§ط±";
  if (severity === "info") return "ط§ط·ظ„ط§ط¹";
  return "ظ¾ط§غŒط¯ط§ط±";
}

function scenarioTypeLabel(type: RecommendationScenarioType) {
  const labels: Record<RecommendationScenarioType, string> = {
    move_space: "طھط؛غŒغŒط± ظپط¶ط§",
    move_time: "طھط؛غŒغŒط± ط²ظ…ط§ظ†",
    change_employee: "طھط؛غŒغŒط± ع©ط§ط±ظ…ظ†ط¯",
    add_support_person: "ط§ظپط²ظˆط¯ظ† ظ‡ظ…ط±ط§ظ‡",
    keep_but_warn: "ظ¾ط§غŒط´",
    split_task: "طھظ‚ط³غŒظ… ع©ط§ط±",
    no_safe_action: "ظ†غŒط§ط²ظ…ظ†ط¯ طھطµظ…غŒظ…",
  };
  return labels[type];
}

function confidenceLabel(value: RecommendationScenario["confidence"]) {
  if (value === "high") return "ط§ط¹طھظ…ط§ط¯ بالا";
  if (value === "medium") return "ط§ط¹طھظ…ط§ط¯ متوسط";
  return "ط§ط¹طھظ…ط§ط¯ ظ¾ط§غŒغŒظ†";
}

function effortLabel(value: RecommendationScenario["effortLevel"]) {
  if (value === "high") return "ط§ط¬ط±ط§غŒ ط³ط®طھ";
  if (value === "medium") return "ط§ط¬ط±ط§غŒ متوسط";
  return "ط§ط¬ط±ط§غŒ ط³ط§ط¯ظ‡";
}

function confidenceTone(value: RecommendationScenario["confidence"]): StatusTone {
  if (value === "high") return "good";
  if (value === "medium") return "info";
  return "warn";
}

function recommendationInputFrom(params: RecommendationInput): RecommendationInput {
  return params;
}

function decisionQueueInputFrom(params: DecisionQueueInput): DecisionQueueInput {
  return params;
}

function loadDecisionQueueItems(): DecisionQueueItem[] {
  if (typeof localStorage === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(decisionQueueStorageKey) ?? "[]") as DecisionQueueItem[];
  } catch {
    return [];
  }
}

function saveDecisionQueueItems(items: DecisionQueueItem[]) {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(decisionQueueStorageKey, JSON.stringify(items));
  }
}

function AnalysisDetailsPage({
  spaces,
  employees,
  taskTypes,
  scheduleItems,
  rules,
  settings,
  compatibilityRules,
}: {
  spaces: Space[];
  employees: Employee[];
  taskTypes: TaskType[];
  scheduleItems: WeeklyScheduleItem[];
  rules: AnalysisRule[];
  settings: AnalysisSettings;
  compatibilityRules: WorkCompatibilityRule[];
}) {
  const analysis = analyzeWorkforce({ spaces, employees, taskTypes, scheduleItems, rules, settings, compatibilityRules });
  const recommendationInput = recommendationInputFrom({ spaces, employees, taskTypes, scheduleItems, rules, settings, compatibilityRules });
  const [severity, setSeverity] = useState("");
  const [ruleId, setRuleId] = useState("");
  const [day, setDay] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [spaceId, setSpaceId] = useState("");
  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState("severity");

  const severityWeight: Record<string, number> = { critical: 4, warning: 3, info: 2, ok: 1 };
  const filteredFindings = analysis.findings
    .filter((finding) => !severity || finding.severity === severity)
    .filter((finding) => !ruleId || finding.ruleId === ruleId)
    .filter((finding) => !day || finding.dayOfWeek === day)
    .filter((finding) => !employeeId || finding.affectedEmployeeIds.includes(employeeId))
    .filter((finding) => !spaceId || finding.affectedSpaceIds.includes(spaceId))
    .filter((finding) => {
      const text = `${finding.title} ${finding.description} ${finding.recommendation}`.toLowerCase();
      return !query.trim() || text.includes(query.trim().toLowerCase());
    })
    .sort((a, b) => {
      if (sortMode === "time") {
        return `${a.dayOfWeek ?? ""}-${a.startTime ?? ""}`.localeCompare(`${b.dayOfWeek ?? ""}-${b.startTime ?? ""}`);
      }
      return severityWeight[b.severity] - severityWeight[a.severity] || b.scoreImpact - a.scoreImpact;
    });

  const ruleOptions = [{ label: "ظ‡ظ…ظ‡ ظ‚ظˆط§ظ†غŒظ†", value: "" }, ...rules.map((rule) => ({ label: rule.title, value: rule.id }))];
  const employeeOptions = optionList(employees, "ظ‡ظ…ظ‡ ع©ط§ط±ظ…ظ†ط¯ط§ظ†");
  const spaceOptions = optionList(spaces, "ظ‡ظ…ظ‡ ظپط¶ط§ظ‡ط§");

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <span className="eyebrow">ط¬ط²ط¦غŒط§طھ طھط­ظ„غŒظ„</span>
          <h1>ظ‡ط´ط¯ط§ط±ظ‡ط§ ظˆ ظ¾غŒط´ظ†ظ‡ط§ط¯ظ‡ط§غŒ ط³غŒط³طھظ…</h1>
          <p>ظ‡ظ…ظ‡ findings ط§ط² ظ…ظˆطھظˆط± طھط­ظ„غŒظ„ ظˆط§ظ‚ط¹غŒ ظˆ ظ‚ظˆط§ظ†غŒظ† ظپط¹ط§ظ„ ط³ط§ط®طھظ‡ ظ…غŒâ€Œط´ظˆظ†ط¯.</p>
        </div>
        <a className="primary-button" href="/organization/workforce-dashboard/schedule">
          <CalendarDays size={17} /> ط±ظپطھظ† ط¨ظ‡ ط¨ط±ظ†ط§ظ…ظ‡ ظ‡ظپطھع¯غŒ
        </a>
      </header>

      <section className="kpi-strip">
        <article className="kpi-card tone-info"><div><p>ع©ظ„ غŒط§ظپطھظ‡â€Œظ‡ط§</p><strong>{toPersianNumber(analysis.findings.length)}</strong><span>ظ¾ط³ ط§ط² ظ‚ظˆط§ظ†غŒظ† ظپط¹ط§ظ„</span></div></article>
        <article className="kpi-card tone-critical"><div><p>ط¨ط­ط±ط§ظ†غŒ</p><strong>{toPersianNumber(analysis.criticalCount)}</strong><span>ظ†غŒط§ط²ظ…ظ†ط¯ ط§ظ‚ط¯ط§ظ… ظپظˆط±غŒ</span></div></article>
        <article className="kpi-card tone-warn"><div><p>ظ‡ط´ط¯ط§ط±</p><strong>{toPersianNumber(analysis.warningCount)}</strong><span>ظ†غŒط§ط²ظ…ظ†ط¯ طھظˆط¬ظ‡</span></div></article>
        <article className="kpi-card tone-good"><div><p>ط§ظ…طھغŒط§ط² ع©ظ†طھط±ظ„</p><strong>{toPersianNumber(analysis.controlScore)}</strong><span>ط§ط² غ±غ°غ°</span></div></article>
        <article className="kpi-card tone-focus"><div><p>ط±غŒط³ع© ع©ظ„</p><strong>{toPersianNumber(analysis.totalRiskScore)}</strong><span>ط¬ظ…ط¹ ط§ط«ط± ظ‡ط´ط¯ط§ط±ظ‡ط§</span></div></article>
      </section>

      <section className="filter-bar">
        <Filter size={16} />
        <select value={severity} onChange={(event) => setSeverity(event.target.value)}>
          <option value="">ظ‡ظ…ظ‡ ط´ط¯طھâ€Œظ‡ط§</option>
          <option value="critical">ط¨ط­ط±ط§ظ†غŒ</option>
          <option value="warning">ظ‡ط´ط¯ط§ط±</option>
          <option value="info">ط§ط·ظ„ط§ط¹</option>
        </select>
        <select value={ruleId} onChange={(event) => setRuleId(event.target.value)}>
          {ruleOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
        </select>
        <select value={day} onChange={(event) => setDay(event.target.value)}>
          {dayOptions().map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
        </select>
        <select value={employeeId} onChange={(event) => setEmployeeId(event.target.value)}>
          {employeeOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
        </select>
        <select value={spaceId} onChange={(event) => setSpaceId(event.target.value)}>
          {spaceOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
        </select>
        <select value={sortMode} onChange={(event) => setSortMode(event.target.value)}>
          <option value="severity">ظ…ط±طھط¨â€Œط³ط§ط²غŒ ط´ط¯طھ</option>
          <option value="time">ظ…ط±طھط¨â€Œط³ط§ط²غŒ ط²ظ…ط§ظ†</option>
        </select>
        <input className="search-input" value={query} placeholder="ط¬ط³طھâ€Œظˆط¬ظˆ ط¯ط± ظ‡ط´ط¯ط§ط±ظ‡ط§" onChange={(event) => setQuery(event.target.value)} />
      </section>

      <section className="analysis-card-grid">
        {filteredFindings.map((finding) => {
          const rule = rules.find((item) => item.id === finding.ruleId);
          const names = finding.affectedEmployeeIds.map((id) => employees.find((item) => item.id === id)?.name).filter(Boolean);
          const spaceNames = finding.affectedSpaceIds.map((id) => spaces.find((item) => item.id === id)?.name).filter(Boolean);
          const scenarios = rankRecommendationScenarios(generateRecommendationScenarios(recommendationInput, finding)).slice(0, 3);
          return (
            <article className={`analysis-card tone-${severityTone(finding.severity)}`} key={finding.id}>
              <div className="analysis-card-head">
                <StatusBadge tone={severityTone(finding.severity)}>{severityLabel(finding.severity)}</StatusBadge>
                <span>{rule?.title ?? "ظ‚ط§ظ†ظˆظ† ظ†ط§ظ…ط´ط®طµ"}</span>
              </div>
              <h2>{finding.title}</h2>
              <p>{finding.description}</p>
              <div className="evidence-box">
                <span>{finding.evidence}</span>
                <small>{finding.whyItHappened}</small>
              </div>
              <div className="finding-meta">
                <span>ط²ظ…ط§ظ†: {finding.dayOfWeek ?? "ع©ظ„ ظ‡ظپطھظ‡"} {toPersianNumber(finding.startTime ?? "")} {finding.endTime ? `طھط§ ${toPersianNumber(finding.endTime)}` : ""}</span>
                <span>ع©ط§ط±ظ…ظ†ط¯ظ‡ط§: {names.length ? names.join("طŒ ") : "ط«ط¨طھ ظ†ط´ط¯ظ‡"}</span>
                <span>ظپط¶ط§ظ‡ط§: {spaceNames.length ? spaceNames.join("طŒ ") : "ط«ط¨طھ ظ†ط´ط¯ظ‡"}</span>
                <span>ط¢غŒطھظ…â€Œظ‡ط§: {toPersianNumber(finding.affectedScheduleItemIds.length)}</span>
                <span>ط§ط«ط± ط±غŒط³ع©: {toPersianNumber(finding.scoreImpact)}</span>
              </div>
              <div className="recommendation-row">
                <strong>{finding.recommendation}</strong>
                <a className="ghost-button" href={`/organization/workforce-dashboard/schedule${finding.affectedScheduleItemIds[0] ? `?itemId=${finding.affectedScheduleItemIds[0]}` : ""}`}>ظ…ط´ط§ظ‡ط¯ظ‡ ط¯ط± ط¨ط±ظ†ط§ظ…ظ‡ ظ‡ظپطھع¯غŒ</a>
                {!!finding.affectedScheduleItemIds.length && (
                  <a className="primary-button" href={`/organization/workforce-dashboard/simulator?findingId=${encodeURIComponent(finding.id)}`}>طھط³طھ ط¬ط§ط¨ظ‡â€Œط¬ط§غŒغŒ</a>
                )}
              </div>
              {!!finding.affectedScheduleItemIds.length && (
                <div className="schedule-mini-list">
                  {finding.affectedScheduleItemIds.map((itemId) => {
                    const item = scheduleItems.find((row) => row.id === itemId);
                    if (!item) return null;
                    const employee = employees.find((row) => row.id === item.employeeId);
                    const space = spaces.find((row) => row.id === item.spaceId);
                    const task = taskTypes.find((row) => row.id === item.taskTypeId);
                    return (
                      <a className="schedule-mini-card" href={`/organization/workforce-dashboard/schedule?itemId=${item.id}`} key={item.id}>
                        <strong>{item.day}طŒ {toPersianNumber(item.startTime)} طھط§ {toPersianNumber(item.endTime)}</strong>
                        <span>{employee?.name ?? "ع©ط§ط±ظ…ظ†ط¯"} | {space?.name ?? "ظپط¶ط§"} | {task?.name ?? "ظ†ظˆط¹ ع©ط§ط±"}</span>
                      </a>
                    );
                  })}
                </div>
              )}
              <div className="scenario-stack">
                <strong>ظ¾غŒط´ظ†ظ‡ط§ط¯ظ‡ط§غŒ ظ‚ط§ط¨ظ„ ط¨ط±ط±ط³غŒ</strong>
                {scenarios.map((scenario, index) => (
                  <div className="scenario-mini-card" key={scenario.id}>
                    <div>
                      <StatusBadge tone={index === 0 ? "good" : confidenceTone(scenario.confidence)}>{index === 0 ? "ط¨ظ‡طھط±غŒظ† ع¯ط²غŒظ†ظ‡" : confidenceLabel(scenario.confidence)}</StatusBadge>
                      <StatusBadge tone={scenario.canApply ? "good" : "warn"}>{scenario.canApply ? "ظ‚ط§ط¨ظ„ ط§ط¹ظ…ط§ظ„" : "طھطµظ…غŒظ… ظ…ط¯غŒط±"}</StatusBadge>
                    </div>
                    <h3>{scenario.title}</h3>
                    <p>{scenario.reason}</p>
                    <div className="recommendation-row">
                      {scenario.change ? (
                        <a className="primary-button" href={`/organization/workforce-dashboard/simulator?findingId=${encodeURIComponent(finding.id)}&scenarioId=${encodeURIComponent(scenario.id)}`}>طھط³طھ ط¯ط± ط´ط¨غŒظ‡â€Œط³ط§ط²</a>
                      ) : (
                        <span className="inline-note">{scenario.reason}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </article>
          );
        })}
        {!filteredFindings.length && <section className="panel"><h2>ظ…ظˆط±ط¯غŒ ظ¾غŒط¯ط§ ظ†ط´ط¯</h2><p>ظپغŒظ„طھط±ظ‡ط§ ط±ط§ طھط؛غŒغŒط± ط¨ط¯ظ‡ غŒط§ ط¯ط§ط¯ظ‡â€Œظ‡ط§غŒ ط¨ط±ظ†ط§ظ…ظ‡ ط±ط§ ع©ط§ظ…ظ„â€Œطھط± ع©ظ†.</p></section>}
      </section>
    </div>
  );
}

function RecommendationsPage({
  spaces,
  employees,
  taskTypes,
  scheduleItems,
  rules,
  settings,
  compatibilityRules,
  updateScheduleItem,
}: {
  spaces: Space[];
  employees: Employee[];
  taskTypes: TaskType[];
  scheduleItems: WeeklyScheduleItem[];
  rules: AnalysisRule[];
  settings: AnalysisSettings;
  compatibilityRules: WorkCompatibilityRule[];
  updateScheduleItem: (id: string, changes: Partial<WeeklyScheduleItem>) => void;
}) {
  const input = recommendationInputFrom({ spaces, employees, taskTypes, scheduleItems, rules, settings, compatibilityRules });
  const analysis = analyzeWorkforce(input);
  const scenarios = getBestScenariosForWeek(input, 60);
  const [queueItems, setQueueItems] = useState<DecisionQueueItem[]>(() => buildDecisionQueue(scenarios, loadDecisionQueueItems()));
  const [severity, setSeverity] = useState("");
  const [scenarioType, setScenarioType] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [spaceId, setSpaceId] = useState("");
  const [day, setDay] = useState("");

  const filtered = scenarios
    .filter((scenario) => {
      const finding = analysis.findings.find((item) => item.id === scenario.findingId);
      const item = scheduleItems.find((row) => row.id === scenario.change?.scheduleItemId);
      return (!severity || finding?.severity === severity)
        && (!scenarioType || scenario.type === scenarioType)
        && (!employeeId || finding?.affectedEmployeeIds.includes(employeeId) || item?.employeeId === employeeId || scenario.change?.newEmployeeId === employeeId)
        && (!spaceId || finding?.affectedSpaceIds.includes(spaceId) || item?.spaceId === spaceId || scenario.change?.newSpaceId === spaceId)
        && (!day || finding?.dayOfWeek === day || item?.day === day || scenario.change?.newDayOfWeek === day);
    });

  const applyScenario = (scenario: RecommendationScenario) => {
    if (!scenario.canApply || !scenario.change?.scheduleItemId) return;
    const ok = window.confirm("ط§غŒظ† ظ¾غŒط´ظ†ظ‡ط§ط¯ ط±ظˆغŒ ط¨ط±ظ†ط§ظ…ظ‡ ط§طµظ„غŒ ط§ط¹ظ…ط§ظ„ ط´ظˆط¯طں ظپظ‚ط· ظ‡ظ…غŒظ† ط¢غŒطھظ… ط¨ط±ظ†ط§ظ…ظ‡ طھط؛غŒغŒط± ظ…غŒâ€Œع©ظ†ط¯.");
    if (!ok) return;
    const item = scheduleItems.find((row) => row.id === scenario.change?.scheduleItemId);
    if (!item) return;
    updateScheduleItem(item.id, {
      day: scenario.change.newDayOfWeek ?? item.day,
      startTime: scenario.change.newStartTime ?? item.startTime,
      endTime: scenario.change.newEndTime ?? item.endTime,
      spaceId: scenario.change.newSpaceId ?? item.spaceId,
      employeeId: scenario.change.newEmployeeId ?? item.employeeId,
      taskTypeId: scenario.change.newTaskTypeId ?? item.taskTypeId,
    });
    window.location.href = `/organization/workforce-dashboard/schedule?itemId=${item.id}`;
  };

  useEffect(() => {
    const merged = buildDecisionQueue(scenarios, queueItems);
    setQueueItems(merged);
    saveDecisionQueueItems(merged);
  }, [scenarios.length]);

  const addToQueue = (scenario: RecommendationScenario) => {
    const current = buildDecisionQueue(scenarios, queueItems);
    const next = current.map((item) => item.scenarioId === scenario.id ? { ...item, status: "selected" as const, updatedAt: nowIso() } : item);
    setQueueItems(next);
    saveDecisionQueueItems(next);
  };

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <span className="eyebrow">ظ…ظˆطھظˆط± ظ¾غŒط´ظ†ظ‡ط§ط¯ P6</span>
          <h1>ظ¾غŒط´ظ†ظ‡ط§ط¯ظ‡ط§غŒ ظ†غŒظ…ظ‡â€Œط®ظˆط¯ع©ط§ط± ظ‡ظپطھظ‡</h1>
          <p>ط³ظ†ط§ط±غŒظˆظ‡ط§ ط§ط² ط±ظˆغŒ ظ‡ط´ط¯ط§ط±ظ‡ط§غŒ ظˆط§ظ‚ط¹غŒ ط³ط§ط®طھظ‡طŒ ط¨ط§ ط´ط¨غŒظ‡â€Œط³ط§ط² طھط³طھ ظˆ ط¨ط±ط§ط³ط§ط³ ط§ط«ط±طŒ ط±غŒط³ع©طŒ ط§ط¹طھظ…ط§ط¯ ظˆ ظ‡ط²غŒظ†ظ‡ ط§ط¬ط±ط§ ط±طھط¨ظ‡â€Œط¨ظ†ط¯غŒ ظ…غŒâ€Œط´ظˆظ†ط¯.</p>
        </div>
        <div className="hero-actions">
          <a className="ghost-button" href="/organization/workforce-dashboard/analysis">ط¬ط²ط¦غŒط§طھ طھط­ظ„غŒظ„</a>
          <a className="ghost-button" href="/organization/workforce-dashboard/decision-queue">ط±ظپطھظ† ط¨ظ‡ طµظپ طھطµظ…غŒظ…</a>
          <a className="primary-button" href="/organization/workforce-dashboard/simulator">ط´ط¨غŒظ‡â€Œط³ط§ط²</a>
        </div>
      </header>

      <section className="kpi-strip">
        <article className="kpi-card tone-info"><div><p>ع©ظ„ ط³ظ†ط§ط±غŒظˆظ‡ط§</p><strong>{toPersianNumber(scenarios.length)}</strong><span>ط§ط² findings ظ…ظ‡ظ…</span></div></article>
        <article className="kpi-card tone-good"><div><p>ظ‚ط§ط¨ظ„ ط§ط¹ظ…ط§ظ„</p><strong>{toPersianNumber(scenarios.filter((item) => item.canApply).length)}</strong><span>طھط؛غŒغŒط± طھع© ط¢غŒطھظ…غŒ ط§ظ…ظ†</span></div></article>
        <article className="kpi-card tone-critical"><div><p>ظ†غŒط§ط²ظ…ظ†ط¯ طھطµظ…غŒظ…</p><strong>{toPersianNumber(scenarios.filter((item) => !item.canApply).length)}</strong><span>ع†ظ†ط¯ظ…ط±ط­ظ„ظ‡â€Œط§غŒ غŒط§ ظ†ط§ظ…ط·ظ…ط¦ظ†</span></div></article>
        <article className="kpi-card tone-focus"><div><p>ط¨ظ‡طھط±غŒظ† ط§ظ…طھغŒط§ط²</p><strong>{toPersianNumber(Math.round(scenarios[0]?.rankScore ?? 0))}</strong><span>ط±طھط¨ظ‡ ظ…ط­ط§ط³ط¨ط§طھغŒ ظ…ظˆطھظˆط± ظ¾غŒط´ظ†ظ‡ط§ط¯</span></div></article>
        <article className="kpi-card tone-warn"><div><p>ظ‡ط´ط¯ط§ط±ظ‡ط§غŒ ظ…ط¨ظ†ط§</p><strong>{toPersianNumber(analysis.criticalCount + analysis.warningCount)}</strong><span>critical ظˆ warning</span></div></article>
      </section>

      <section className="filter-bar">
        <Filter size={16} />
        <select value={severity} onChange={(event) => setSeverity(event.target.value)}>
          <option value="">ظ‡ظ…ظ‡ ط´ط¯طھâ€Œظ‡ط§</option>
          <option value="critical">ط¨ط­ط±ط§ظ†غŒ</option>
          <option value="warning">ظ‡ط´ط¯ط§ط±</option>
        </select>
        <select value={scenarioType} onChange={(event) => setScenarioType(event.target.value)}>
          <option value="">ظ‡ظ…ظ‡ ظ†ظˆط¹ ط³ظ†ط§ط±غŒظˆظ‡ط§</option>
          {(["move_space", "move_time", "change_employee", "add_support_person", "keep_but_warn", "split_task", "no_safe_action"] as RecommendationScenarioType[]).map((type) => (
            <option value={type} key={type}>{scenarioTypeLabel(type)}</option>
          ))}
        </select>
        <select value={employeeId} onChange={(event) => setEmployeeId(event.target.value)}>
          {optionList(employees, "ظ‡ظ…ظ‡ ع©ط§ط±ظ…ظ†ط¯ط§ظ†").map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
        </select>
        <select value={spaceId} onChange={(event) => setSpaceId(event.target.value)}>
          {optionList(spaces, "ظ‡ظ…ظ‡ ظپط¶ط§ظ‡ط§").map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
        </select>
        <select value={day} onChange={(event) => setDay(event.target.value)}>
          {dayOptions().map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
        </select>
      </section>

      <section className="analysis-card-grid">
        {filtered.map((scenario) => {
          const finding = analysis.findings.find((item) => item.id === scenario.findingId);
          const item = scheduleItems.find((row) => row.id === scenario.change?.scheduleItemId);
          const beforeScore = scenario.simulationResult?.originalAnalysis.controlScore ?? analysis.controlScore;
          const afterScore = scenario.simulationResult?.simulatedAnalysis.controlScore;
          const spaceName = scenario.change?.newSpaceId ? spaces.find((space) => space.id === scenario.change?.newSpaceId)?.name : undefined;
          const employeeName = scenario.change?.newEmployeeId ? employees.find((employee) => employee.id === scenario.change?.newEmployeeId)?.name : undefined;
          return (
            <article className={`analysis-card tone-${scenario.canApply ? "good" : severityTone(scenario.riskLevel)}`} key={scenario.id}>
              <div className="analysis-card-head">
                <StatusBadge tone={scenario.canApply ? "good" : "warn"}>{scenario.canApply ? "ظ‚ط§ط¨ظ„ ط§ط¹ظ…ط§ظ„" : "ظ†غŒط§ط²ظ…ظ†ط¯ طھطµظ…غŒظ… ظ…ط¯غŒط±"}</StatusBadge>
                <StatusBadge tone={confidenceTone(scenario.confidence)}>{confidenceLabel(scenario.confidence)}</StatusBadge>
                <StatusBadge tone="info">{scenarioTypeLabel(scenario.type)}</StatusBadge>
              </div>
              <h2>{scenario.title}</h2>
              <p>{scenario.description}</p>
              <div className="finding-meta">
                <span>ظ…ط³ط¦ظ„ظ‡: {finding?.title ?? "finding ظ†ط§ظ…ط´ط®طµ"}</span>
                <span>ط²ظ…ط§ظ†: {finding?.dayOfWeek ?? item?.day ?? "ع©ظ„ ظ‡ظپطھظ‡"} {toPersianNumber(finding?.startTime ?? item?.startTime ?? "")}</span>
                <span>ظپط¶ط§غŒ ظ‡ط¯ظپ: {spaceName ?? "ط«ط¨طھ ظ†ط´ط¯ظ‡"}</span>
                <span>ع©ط§ط±ظ…ظ†ط¯ ظ‡ط¯ظپ: {employeeName ?? "ط¨ط¯ظˆظ† طھط؛غŒغŒط±"}</span>
                <span>ظ‚ط¨ظ„: {toPersianNumber(beforeScore)}</span>
                <span>ط¨ط¹ط¯: {afterScore === undefined ? "ظ†غŒط§ط²ظ…ظ†ط¯ طھطµظ…غŒظ…" : toPersianNumber(afterScore)}</span>
                <span>طھط؛غŒغŒط± ط±غŒط³ع©: {toPersianNumber(scenario.simulationResult?.riskScoreDelta ?? 0)}</span>
                <span>ط§ظ…طھغŒط§ط² ط±طھط¨ظ‡: {toPersianNumber(Math.round(scenario.rankScore))}</span>
              </div>
              <div className="evidence-box">
                <span>{scenario.expectedEffect}</span>
                <small>{scenario.reason}</small>
              </div>
              <div className="recommendation-row">
                <button className="ghost-button" type="button" onClick={() => addToQueue(scenario)}>
                  ط§ظپط²ظˆط¯ظ† ط¨ظ‡ طµظپ طھطµظ…غŒظ…
                </button>
                {scenario.change && <a className="primary-button" href={`/organization/workforce-dashboard/simulator?findingId=${encodeURIComponent(scenario.findingId)}&scenarioId=${encodeURIComponent(scenario.id)}`}>طھط³طھ ط¯ط± ط´ط¨غŒظ‡â€Œط³ط§ط²</a>}
                <button className="danger-button" type="button" disabled={!scenario.canApply} onClick={() => applyScenario(scenario)}>
                  {scenario.canApply ? "ط§ط¹ظ…ط§ظ„ طھط؛غŒغŒط±" : "ظ†غŒط§ط²ظ…ظ†ط¯ طھطµظ…غŒظ… ظ…ط¯غŒط±"}
                </button>
              </div>
            </article>
          );
        })}
        {!filtered.length && <section className="panel"><h2>ظ¾غŒط´ظ†ظ‡ط§ط¯غŒ ظ¾غŒط¯ط§ ظ†ط´ط¯</h2><p>ظپغŒظ„طھط±ظ‡ط§ ط±ط§ طھط؛غŒغŒط± ط¨ط¯ظ‡ غŒط§ ط¯ط§ط¯ظ‡â€Œظ‡ط§غŒ ط¨ط±ظ†ط§ظ…ظ‡ ط±ط§ ع©ط§ظ…ظ„â€Œطھط± ع©ظ†.</p></section>}
      </section>
    </div>
  );
}

function DecisionQueuePage({
  spaces,
  employees,
  taskTypes,
  scheduleItems,
  rules,
  settings,
  compatibilityRules,
  updateScheduleItem,
}: {
  spaces: Space[];
  employees: Employee[];
  taskTypes: TaskType[];
  scheduleItems: WeeklyScheduleItem[];
  rules: AnalysisRule[];
  settings: AnalysisSettings;
  compatibilityRules: WorkCompatibilityRule[];
  updateScheduleItem: (id: string, changes: Partial<WeeklyScheduleItem>) => void;
}) {
  const input = decisionQueueInputFrom({ spaces, employees, taskTypes, scheduleItems, rules, settings, compatibilityRules });
  const scenarios = getBestScenariosForWeek(input, 40);
  const scenarioById = new Map(scenarios.map((scenario) => [scenario.id, scenario]));
  const [queueItems, setQueueItems] = useState<DecisionQueueItem[]>(() => buildDecisionQueue(scenarios, loadDecisionQueueItems()));
  const selectedScenarios = queueItems
    .filter((item) => item.status === "selected")
    .map((item) => scenarioById.get(item.scenarioId))
    .filter((item): item is RecommendationScenario => Boolean(item));
  const liveResult = simulateDecisionBatch(input, selectedScenarios);
  const [batchResult, setBatchResult] = useState<DecisionBatchResult>(liveResult);

  useEffect(() => {
    const merged = buildDecisionQueue(scenarios, queueItems);
    setQueueItems(merged);
    saveDecisionQueueItems(merged);
  }, [scenarios.length]);

  useEffect(() => {
    setBatchResult(liveResult);
  }, [selectedScenarios.map((scenario) => scenario.id).join("|"), scheduleItems.length]);

  const persist = (items: DecisionQueueItem[]) => {
    setQueueItems(items);
    saveDecisionQueueItems(items);
  };

  const toggleScenario = (scenarioId: string) => {
    persist(queueItems.map((item) => item.scenarioId === scenarioId
      ? { ...item, status: item.status === "selected" ? "pending" : "selected", updatedAt: nowIso() }
      : item));
  };

  const clearSelection = () => {
    persist(queueItems.map((item) => item.status === "selected" ? { ...item, status: "pending", updatedAt: nowIso() } : item));
  };

  const selectBest = () => {
    const best = selectBestSafeScenarioCombination(input, scenarios, 3, 5);
    const bestIds = new Set(best.map((scenario) => scenario.id));
    persist(queueItems.map((item) => ({
      ...item,
      status: bestIds.has(item.scenarioId) ? "selected" : item.status === "selected" ? "pending" : item.status,
      updatedAt: nowIso(),
    })));
    setBatchResult(simulateDecisionBatch(input, best));
  };

  const applyBatch = () => {
    const result = simulateDecisionBatch(input, selectedScenarios);
    setBatchResult(result);
    if (!result.safeToApply) {
      window.alert("ط§غŒظ† طھط±ع©غŒط¨ ظ‡ظ†ظˆط² ط§ظ…ظ† ظ†غŒط³طھ. ط§ط¨طھط¯ط§ طھط¯ط§ط®ظ„â€Œظ‡ط§ غŒط§ ظ‡ط´ط¯ط§ط±ظ‡ط§غŒ ط¨ط­ط±ط§ظ†غŒ طھط§ط²ظ‡ ط±ط§ ط±ظپط¹ ع©ظ†.");
      return;
    }
    const ok = window.confirm("طھطµظ…غŒظ…â€Œظ‡ط§غŒ ط§ظ†طھط®ط§ط¨â€Œط´ط¯ظ‡ ط±ظˆغŒ ط¨ط±ظ†ط§ظ…ظ‡ ط§طµظ„غŒ ط§ط¹ظ…ط§ظ„ ط´ظˆظ†ط¯طں ظپظ‚ط· ط¢غŒطھظ…â€Œظ‡ط§غŒ ط§ظ…ظ† ظˆ ط§ظ†طھط®ط§ط¨â€Œط´ط¯ظ‡ طھط؛غŒغŒط± ظ…غŒâ€Œع©ظ†ظ†ط¯.");
    if (!ok) return;
    workforceBackupService.createAutoSnapshotBeforeChange("before-apply-batch-decision");
    for (const change of result.appliedChanges) {
      const item = scheduleItems.find((row) => row.id === change.scheduleItemId);
      if (!item) continue;
      updateScheduleItem(item.id, {
        day: change.newDayOfWeek ?? item.day,
        startTime: change.newStartTime ?? item.startTime,
        endTime: change.newEndTime ?? item.endTime,
        spaceId: change.newSpaceId ?? item.spaceId,
        employeeId: change.newEmployeeId ?? item.employeeId,
        taskTypeId: change.newTaskTypeId ?? item.taskTypeId,
      });
    }
    persist(queueItems.map((item) => result.selectedScenarioIds.includes(item.scenarioId) ? { ...item, status: "applied", updatedAt: nowIso() } : item));
    operationalHistoryService.recordDecisionBatchApplied(`decision-batch-${Date.now()}`, `${result.appliedChanges.length} طھط؛غŒغŒط± ط¨ط±ظ†ط§ظ…ظ‡ ط§ط¹ظ…ط§ظ„ ط´ط¯.`);
    window.location.href = `/organization/workforce-dashboard/schedule${result.appliedChanges[0] ? `?itemId=${result.appliedChanges[0].scheduleItemId}` : ""}`;
  };

  const createReport = () => {
    const result = simulateDecisionBatch(input, selectedScenarios);
    setBatchResult(result);
    const report = decisionReportService.createFromBatch(result, {
      title: "ع¯ط²ط§ط±ط´ طھطµظ…غŒظ…â€Œظ‡ط§غŒ ظ…ط¯غŒط±غŒطھغŒ ظ‡ظپطھظ‡",
      weekLabel: "ظ‡ظپطھظ‡ ط¬ط§ط±غŒ",
      status: result.safeToApply ? "draft" : "needs_review",
    });
    window.location.href = `/organization/workforce-dashboard/decision-report?reportId=${encodeURIComponent(report.id)}`;
  };

  const selectedCount = selectedScenarios.length;
  const conflictScenarioIds = new Set(batchResult.conflicts.flatMap((conflict) => conflict.scenarioIds));

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <span className="eyebrow">P7 Decision Queue</span>
          <h1>طµظپ طھطµظ…غŒظ…â€Œع¯غŒط±غŒ ظ…ط¯غŒط±غŒطھغŒ</h1>
          <p>ع†ظ†ط¯ ظ¾غŒط´ظ†ظ‡ط§ط¯ ط±ط§ ط§ظ†طھط®ط§ط¨ ع©ظ†طŒ ط§ط«ط± طھط¬ظ…ط¹غŒ ط±ط§ ط¨ط¨غŒظ†طŒ طھط¯ط§ط®ظ„â€Œظ‡ط§ ط±ط§ ط­ط°ظپ ع©ظ† ظˆ ظپظ‚ط· طھط±ع©غŒط¨ ط§ظ…ظ† ط±ط§ ط§ط¹ظ…ط§ظ„ ع©ظ†.</p>
        </div>
        <div className="hero-actions">
          <a className="ghost-button" href="/organization/workforce-dashboard/recommendations">ط¨ط§ط²ع¯ط´طھ ط¨ظ‡ ظ¾غŒط´ظ†ظ‡ط§ط¯ظ‡ط§</a>
          <button className="ghost-button" type="button" onClick={selectBest}>ط§ظ†طھط®ط§ط¨ ط¨ظ‡طھط±غŒظ† طھط±ع©غŒط¨</button>
          <button className="primary-button" type="button" onClick={() => setBatchResult(simulateDecisionBatch(input, selectedScenarios))}>طھط­ظ„غŒظ„ طھط±ع©غŒط¨</button>
          <button className="ghost-button" type="button" onClick={createReport}>ط³ط§ط®طھ ع¯ط²ط§ط±ط´ طھطµظ…غŒظ…</button>
          <button className="danger-button" type="button" onClick={applyBatch} disabled={!batchResult.safeToApply}>ط§ط¹ظ…ط§ظ„ طھطµظ…غŒظ…â€Œظ‡ط§غŒ ط§ظ†طھط®ط§ط¨â€Œط´ط¯ظ‡</button>
        </div>
      </header>

      <section className="kpi-strip">
        <article className="kpi-card tone-info"><div><p>ظ‚ط§ط¨ظ„ ط¨ط±ط±ط³غŒ</p><strong>{toPersianNumber(scenarios.length)}</strong><span>ظ¾غŒط´ظ†ظ‡ط§ط¯ ط±طھط¨ظ‡â€Œط¨ظ†ط¯غŒâ€Œط´ط¯ظ‡</span></div></article>
        <article className="kpi-card tone-focus"><div><p>ط§ظ†طھط®ط§ط¨â€Œط´ط¯ظ‡</p><strong>{toPersianNumber(selectedCount)}</strong><span>ط¨ط±ط§غŒ طھط­ظ„غŒظ„ batch</span></div></article>
        <article className="kpi-card tone-good"><div><p>ع©ظ†طھط±ظ„ ظ‚ط¨ظ„/ط¨ط¹ط¯</p><strong>{toPersianNumber(batchResult.controlScoreBefore)} / {toPersianNumber(batchResult.controlScoreAfter)}</strong><span>{verdictLabel(batchResult.verdict)}</span></div></article>
        <article className={`kpi-card tone-${batchResult.riskScoreAfter <= batchResult.riskScoreBefore ? "good" : "critical"}`}><div><p>طھط؛غŒغŒط± ط±غŒط³ع©</p><strong>{toPersianNumber(batchResult.riskScoreAfter - batchResult.riskScoreBefore)}</strong><span>ظ‚ط¨ظ„ {toPersianNumber(batchResult.riskScoreBefore)} | ط¨ط¹ط¯ {toPersianNumber(batchResult.riskScoreAfter)}</span></div></article>
        <article className={`kpi-card tone-${batchResult.safeToApply ? "good" : "warn"}`}><div><p>ظˆط¶ط¹غŒطھ ظ†ظ‡ط§غŒغŒ</p><strong>{batchResult.safeToApply ? "ط§ظ…ظ†" : "ظ†غŒط§ط²ظ…ظ†ط¯ ط¨ط±ط±ط³غŒ"}</strong><span>{toPersianNumber(batchResult.conflicts.length)} طھط¯ط§ط®ظ„</span></div></article>
      </section>

      <section className="decision-layout">
        <section className="panel decision-list">
          <div className="section-head">
            <h2>ظ¾غŒط´ظ†ظ‡ط§ط¯ظ‡ط§</h2>
            <button className="ghost-button" type="button" onClick={clearSelection}>ظ¾ط§ع© ع©ط±ط¯ظ† ط§ظ†طھط®ط§ط¨</button>
          </div>
          {queueItems.map((queueItem) => {
            const scenario = scenarioById.get(queueItem.scenarioId);
            if (!scenario) return null;
            const selected = queueItem.status === "selected";
            const conflicted = conflictScenarioIds.has(scenario.id);
            return (
              <article className={`decision-item ${selected ? "selected" : ""} ${conflicted ? "conflicted" : ""}`} key={queueItem.id}>
                <label>
                  <input type="checkbox" checked={selected} onChange={() => toggleScenario(scenario.id)} />
                  <span>
                    <strong>{scenario.title}</strong>
                    <small>{scenario.reason}</small>
                  </span>
                </label>
                <div className="decision-badges">
                  <StatusBadge tone={scenario.canApply ? "good" : "warn"}>{scenario.canApply ? "ظ‚ط§ط¨ظ„ ط§ط¹ظ…ط§ظ„" : "ظ†غŒط§ط²ظ…ظ†ط¯ ط¨ط±ط±ط³غŒ"}</StatusBadge>
                  <StatusBadge tone={conflicted ? "critical" : "info"}>{conflicted ? "ظ…طھط¯ط§ط®ظ„" : scenarioTypeLabel(scenario.type)}</StatusBadge>
                  <StatusBadge tone={confidenceTone(scenario.confidence)}>{confidenceLabel(scenario.confidence)}</StatusBadge>
                </div>
              </article>
            );
          })}
        </section>

        <section className="panel decision-report">
          <h2>ع¯ط²ط§ط±ط´ ظ‚ط¨ظ„/ط¨ط¹ط¯</h2>
          <div className="score-grid">
            <div className="heat-cell tone-info"><strong>{toPersianNumber(batchResult.controlScoreBefore)}</strong><span>ع©ظ†طھط±ظ„ ظ‚ط¨ظ„</span></div>
            <div className="heat-cell tone-good"><strong>{toPersianNumber(batchResult.controlScoreAfter)}</strong><span>ع©ظ†طھط±ظ„ ط¨ط¹ط¯</span></div>
            <div className="heat-cell tone-warn"><strong>{toPersianNumber(batchResult.warningBefore)} / {toPersianNumber(batchResult.warningAfter)}</strong><span>ظ‡ط´ط¯ط§ط±</span></div>
            <div className="heat-cell tone-critical"><strong>{toPersianNumber(batchResult.criticalBefore)} / {toPersianNumber(batchResult.criticalAfter)}</strong><span>ط¨ط­ط±ط§ظ†غŒ</span></div>
          </div>
          <div className="evidence-box">
            <span>{batchResult.summary}</span>
            <small>ط§ط¹ظ…ط§ظ„ ظپظ‚ط· ظˆظ‚طھغŒ ظپط¹ط§ظ„ ط§ط³طھ ع©ظ‡ ظ‡ظ…ظ‡ ط§ظ†طھط®ط§ط¨â€Œظ‡ط§ canApply ط¨ط§ط´ظ†ط¯طŒ طھط¯ط§ط®ظ„ ظ†ط¯ط§ط´طھظ‡ ط¨ط§ط´ظ†ط¯ ظˆ critical طھط§ط²ظ‡ ظ†ط³ط§ط²ظ†ط¯.</small>
          </div>
          <div className="recommendation-row">
            <button className="primary-button" type="button" onClick={() => setBatchResult(simulateDecisionBatch(input, selectedScenarios))}>طھط­ظ„غŒظ„ طھط±ع©غŒط¨ ط§ظ†طھط®ط§ط¨â€Œط´ط¯ظ‡</button>
            <button className="ghost-button" type="button" onClick={createReport}>ط³ط§ط®طھ ع¯ط²ط§ط±ط´ طھطµظ…غŒظ…</button>
            <button className="danger-button" type="button" onClick={applyBatch} disabled={!batchResult.safeToApply}>ط§ط¹ظ…ط§ظ„ batch</button>
          </div>
        </section>

        <section className="panel conflict-panel">
          <h2>طھط¯ط§ط®ظ„â€Œظ‡ط§</h2>
          {batchResult.conflicts.map((conflict) => (
            <article className="panel-row tone-critical" key={conflict.id}>
              <StatusBadge tone="critical">{conflict.type}</StatusBadge>
              <p>{conflict.description}</p>
              <small>{conflict.recommendation}</small>
            </article>
          ))}
          {!batchResult.conflicts.length && <p>طھط¯ط§ط®ظ„غŒ ط¯ط± طھط±ع©غŒط¨ ط§ظ†طھط®ط§ط¨â€Œط´ط¯ظ‡ ط¯غŒط¯ظ‡ ظ†ط´ط¯.</p>}
        </section>
      </section>
    </div>
  );
}

function reportStatusLabel(status: DecisionReportStatus) {
  if (status === "approved") return "طھط§غŒغŒط¯ ط´ط¯ظ‡";
  if (status === "applied") return "ط§ط¹ظ…ط§ظ„ ط´ط¯ظ‡";
  if (status === "needs_review") return "ظ†غŒط§ط²ظ…ظ†ط¯ ط¨ط±ط±ط³غŒ";
  return "ظ¾غŒط´â€Œظ†ظˆغŒط³";
}

function reportStatusTone(status: DecisionReportStatus): StatusTone {
  if (status === "approved") return "good";
  if (status === "applied") return "sales";
  if (status === "needs_review") return "warn";
  return "info";
}

function healthLevelLabel(value: string) {
  if (value === "excellent") return "ط¹ط§ظ„غŒ";
  if (value === "good") return "ط®ظˆط¨";
  if (value === "needs_attention") return "ظ†غŒط§ط²ظ…ظ†ط¯ طھظˆط¬ظ‡";
  return "ط¨ط­ط±ط§ظ†غŒ";
}

function trendStatusLabel(value: string) {
  if (value === "improving") return "ط¨ظ‡طھط± ط´ط¯ظ‡";
  if (value === "worsening") return "ط¨ط¯طھط± ط´ط¯ظ‡";
  if (value === "stable") return "طھظ‚ط±غŒط¨ط§ظ‹ ط«ط§ط¨طھ";
  return "ط¯ط§ط¯ظ‡ ظ†ط§ع©ط§ظپغŒ";
}

function healthTone(value: string): StatusTone {
  if (value === "excellent" || value === "good") return "good";
  if (value === "needs_attention") return "warn";
  return "critical";
}

function goalStatusLabel(value: MonthlyGoalStatus) {
  if (value === "in_progress") return "ط¯ط± ط­ط§ظ„ ط§ط¬ط±ط§";
  if (value === "achieved") return "ظ…ط­ظ‚ظ‚ ط´ط¯ظ‡";
  if (value === "missed") return "ظ†ط§ظ…ظˆظپظ‚";
  return "ط¨ط±ظ†ط§ظ…ظ‡â€Œط±غŒط²غŒ";
}

function preventiveSeverityTone(value: PreventiveAlertSeverity): StatusTone {
  if (value === "critical") return "critical";
  if (value === "warning") return "warn";
  return "info";
}

function preventivePriorityTone(value: PreventiveAlertPriority): StatusTone {
  if (value === "urgent") return "critical";
  if (value === "high") return "warn";
  if (value === "medium") return "focus";
  return "info";
}

function preventiveStatusLabel(value: PreventiveAlertStatus) {
  if (value === "acknowledged") return "طھط§غŒغŒط¯ ط´ط¯";
  if (value === "planned") return "ط¨ط±ظ†ط§ظ…ظ‡â€Œط±غŒط²غŒ ط´ط¯";
  if (value === "resolved") return "ط­ظ„ ط´ط¯";
  if (value === "dismissed") return "ط±ط¯ ط´ط¯";
  return "ط¨ط§ط²";
}

function preventiveSourceLabel(value: PreventiveAlertSourceType) {
  if (value === "failed_goal") return "ظ‡ط¯ظپ ظ†ط§ظ…ظˆظپظ‚";
  if (value === "worsening_trend") return "ط±ظˆظ†ط¯ ظ†ط²ظˆظ„غŒ";
  if (value === "repeated_space_pressure") return "ظپط´ط§ط± ظپط¶ط§";
  if (value === "repeated_focus_interruption") return "ط§ط®طھظ„ط§ظ„ طھظ…ط±ع©ط²";
  if (value === "repeated_sales_coverage_gap") return "ظ¾ظˆط´ط´ ظپط±ظˆط´";
  return "ط±غŒط³ع© طھع©ط±ط§ط±غŒ";
}

function readinessStatusLabel(value: OperationalReadinessStatus) {
  if (value === "ready") return "ط¢ظ…ط§ط¯ظ‡";
  if (value === "almost_ready") return "طھظ‚ط±غŒط¨ط§ ط¢ظ…ط§ط¯ظ‡";
  if (value === "needs_setup") return "ظ†غŒط§ط²ظ…ظ†ط¯ ط¢ظ…ط§ط¯ظ‡â€Œط³ط§ط²غŒ";
  return "ظ¾ط±ط±غŒط³ع©";
}

function readinessStatusTone(value: OperationalReadinessStatus): StatusTone {
  if (value === "ready") return "good";
  if (value === "almost_ready") return "focus";
  if (value === "needs_setup") return "warn";
  return "critical";
}

function readinessCategoryLabel(value: ReadinessCheckCategory) {
  const labels: Record<ReadinessCheckCategory, string> = {
    base_data: "ط¯ط§ط¯ظ‡ ظ¾ط§غŒظ‡",
    schedule: "ط¨ط±ظ†ط§ظ…ظ‡",
    rules: "ظ‚ظˆط§ظ†غŒظ†",
    analysis: "طھط­ظ„غŒظ„",
    backup: "ط¨ع©ط§ظ¾",
    maintenance: "ظ†ع¯ظ‡ط¯ط§ط±غŒ",
    reports: "ع¯ط²ط§ط±ط´â€Œظ‡ط§",
    monthly_goals: "ط§ظ‡ط¯ط§ظپ ظ…ط§ظ‡ط§ظ†ظ‡",
    preventive_alerts: "ظ‡ط´ط¯ط§ط± ظ¾غŒط´ع¯غŒط±ط§ظ†ظ‡",
    ui_flow: "ط¬ط±غŒط§ظ† ع©ط§ط±غŒ",
  };
  return labels[value];
}

function launchStatusLabel(value: LaunchChecklistStatus) {
  if (value === "completed") return "ط§ظ†ط¬ط§ظ…â€Œط´ط¯ظ‡";
  if (value === "dismissed") return "ط±ط¯ط´ط¯ظ‡";
  return "ط¨ط§ط²";
}

function launchStatusTone(value: LaunchChecklistStatus): StatusTone {
  if (value === "completed") return "good";
  if (value === "dismissed") return "empty";
  return "warn";
}

function driftLevelLabel(value: BaselineDriftLevel) {
  const labels: Record<BaselineDriftLevel, string> = {
    none: "ط¨ط¯ظˆظ† طھط؛غŒغŒط±",
    low: "کم",
    medium: "متوسط",
    high: "زیاد",
    critical: "ط¨ط­ط±ط§ظ†غŒ",
  };
  return labels[value];
}

function controlTypeLabel(value: OperationalControlType) {
  const labels: Record<OperationalControlType, string> = {
    snapshot_due: "Snapshot",
    backup_due: "Backup",
    archive_due: "Archive",
    maintenance_review: "ظ†ع¯ظ‡ط¯ط§ط±غŒ",
    drift_review: "Drift",
    resignoff_due: "ط¨ط§ط²طھط£غŒغŒط¯",
    readiness_review: "Readiness",
    monthly_health_review: "ط³ظ„ط§ظ…طھ ظ…ط§ظ‡ط§ظ†ظ‡",
    preventive_alert_review: "ظ‡ط´ط¯ط§ط± ظ¾غŒط´ع¯غŒط±ط§ظ†ظ‡",
    launch_checklist_review: "ط±ط§ظ‡â€Œط§ظ†ط¯ط§ط²غŒ",
  };
  return labels[value];
}

function controlStatusLabel(value: OperationalControlStatus) {
  const labels: Record<OperationalControlStatus, string> = { upcoming: "ط¢غŒظ†ط¯ظ‡", due_today: "ط§ظ…ط±ظˆط²", overdue: "ط¹ظ‚ط¨â€Œط§ظپطھط§ط¯ظ‡", completed: "ط§ظ†ط¬ط§ظ…â€Œط´ط¯ظ‡", snoozed: "طھط¹ظˆغŒظ‚", dismissed: "ط±ط¯ط´ط¯ظ‡" };
  return labels[value];
}

function controlPriorityLabel(value: OperationalControlPriority) {
  const labels: Record<OperationalControlPriority, string> = { low: "کم", medium: "متوسط", high: "بالا", urgent: "ظپظˆط±غŒ" };
  return labels[value];
}

function controlTone(value: OperationalControlPriority | OperationalControlStatus): StatusTone {
  if (value === "urgent" || value === "overdue") return "critical";
  if (value === "high" || value === "due_today") return "warn";
  if (value === "completed") return "good";
  if (value === "snoozed" || value === "dismissed") return "empty";
  if (value === "medium") return "info";
  return "focus";
}

function OperationsControlSettingsPage({
  spaces, employees, taskTypes, scheduleItems, rules, settings,
}: {
  spaces: Space[]; employees: Employee[]; taskTypes: TaskType[]; scheduleItems: WeeklyScheduleItem[]; rules: AnalysisRule[]; settings: AnalysisSettings;
}) {
  const [policy, setPolicy] = useState<OperationalControlSchedulePolicy>(() => operationsControlSettingsService.getSchedulePolicy());
  const [exportOptions, setExportOptions] = useState<OperationalControlExportOptions>(() => operationsControlSettingsService.getExportOptions());
  const [notificationPreference, setNotificationPreference] = useState<OperationalNotificationPreference>(() => operationsControlSettingsService.getNotificationPreferences());
  const [message, setMessage] = useState("");
  const intervalFields: Array<{ key: keyof OperationalControlSchedulePolicy; label: string }> = [
    { key: "snapshotEveryDays", label: "ظپط§طµظ„ظ‡ Snapshot" },
    { key: "backupEveryDays", label: "ظپط§طµظ„ظ‡ Backup" },
    { key: "archiveEveryDays", label: "ظپط§طµظ„ظ‡ Archive" },
    { key: "maintenanceReviewEveryDays", label: "ظ…ط±ظˆط± ظ†ع¯ظ‡ط¯ط§ط±غŒ" },
    { key: "driftReviewEveryDays", label: "ظ…ط±ظˆط± Drift" },
    { key: "resignoffExpiresAfterDays", label: "ظ…ظ‡ظ„طھ ط¨ط§ط²طھط£غŒغŒط¯" },
    { key: "readinessReviewEveryDays", label: "ظ…ط±ظˆط± ط¢ظ…ط§ط¯ع¯غŒ" },
    { key: "monthlyHealthReviewEveryDays", label: "ظ…ط±ظˆط± ط³ظ„ط§ظ…طھ ظ…ط§ظ‡ط§ظ†ظ‡" },
    { key: "preventiveAlertReviewEveryDays", label: "ظ…ط±ظˆط± ظ‡ط´ط¯ط§ط± ظ¾غŒط´ع¯غŒط±ط§ظ†ظ‡" },
    { key: "launchChecklistReviewEveryDays", label: "ظ…ط±ظˆط± ط±ط§ظ‡â€Œط§ظ†ط¯ط§ط²غŒ" },
  ];
  const setInterval = (key: keyof OperationalControlSchedulePolicy, value: string) => setPolicy((current) => ({ ...current, [key]: Number(value) }));
  const toggleControl = (type: OperationalControlType) => setPolicy((current) => ({ ...current, enabledControlTypes: current.enabledControlTypes.includes(type) ? current.enabledControlTypes.filter((item) => item !== type) : [...current.enabledControlTypes, type] }));
  const save = () => {
    const validation = operationsControlSettingsService.validatePolicy(policy);
    const savedPolicy = operationsControlSettingsService.updateSchedulePolicy(validation.policy);
    setPolicy(savedPolicy);
    setExportOptions(operationsControlSettingsService.updateExportOptions(exportOptions));
    setNotificationPreference(operationsControlSettingsService.updateNotificationPreferences(notificationPreference));
    setMessage(validation.warnings.length ? validation.warnings.join(" | ") : "طھظ†ط¸غŒظ…ط§طھ ع©ظ†طھط±ظ„â€Œظ‡ط§غŒ ط¹ظ…ظ„غŒط§طھغŒ ط°ط®غŒط±ظ‡ ط´ط¯.");
  };
  const reset = () => { setPolicy(operationsControlSettingsService.resetSchedulePolicy()); setMessage("Policy ظ¾غŒط´â€Œظپط±ط¶ ط¨ط§ط²ع¯ط±ط¯ط§ظ†ط¯ظ‡ ط´ط¯ط› ط¨ط±ط§غŒ ط§ط¹ظ…ط§ظ„ ط±ظˆغŒ طھظ‚ظˆغŒظ…طŒ ط¨ط§ط²ط³ط§ط²غŒ ط±ط§ ط¨ط²ظ†غŒط¯."); };
  const rebuild = () => {
    const saved = operationsControlSettingsService.updateSchedulePolicy(policy);
    operationsCalendarService.rebuild(currentOperationsCalendarState({ spaces, employees, taskTypes, scheduleItems, rules, settings }), saved);
    setPolicy(saved); setMessage("طھظ‚ظˆغŒظ… ط¨ط§ policy ط¬ط¯غŒط¯ ط¨ط§ط²ط³ط§ط²غŒ ط´ط¯.");
  };

  return (
    <div className="page-stack operations-control-settings-page">
      <header className="page-header"><div><span className="eyebrow">P21 Control Policy</span><h1>طھظ†ط¸غŒظ… ط²ظ…ط§ظ†â€Œط¨ظ†ط¯غŒ ع©ظ†طھط±ظ„â€Œظ‡ط§</h1><p>ط¯ظˆط±ظ‡ ظ…ط±ظˆط±طŒ ط§ظˆظ„ظˆغŒطھ ظˆ ط®ط±ظˆط¬غŒ ع©ظ†طھط±ظ„â€Œظ‡ط§غŒ ظ…ط­ظ„غŒ ط±ط§ ط¨ط¯ظˆظ† طھط؛غŒغŒط± ع©ط¯ طھظ†ط¸غŒظ… ع©ظ†غŒط¯.</p></div><div className="hero-actions"><a className="ghost-button" href="/organization/workforce-dashboard/operations-calendar">طھظ‚ظˆغŒظ… ع©ظ†طھط±ظ„â€Œظ‡ط§</a><button className="ghost-button" type="button" onClick={reset}>ط¨ط§ط²ع¯ط´طھ ط¨ظ‡ ظ¾غŒط´â€Œظپط±ط¶</button><button className="primary-button" type="button" onClick={save}>ط°ط®غŒط±ظ‡ طھظ†ط¸غŒظ…ط§طھ</button><button className="primary-button" type="button" onClick={rebuild}>ط°ط®غŒط±ظ‡ ظˆ ط¨ط§ط²ط³ط§ط²غŒ طھظ‚ظˆغŒظ…</button></div></header>
      {message && <div className="inline-notice">{message}</div>}
      <section className="settings-band"><div className="section-head"><h2>ط¯ظˆط±ظ‡â€Œظ‡ط§غŒ ط²ظ…ط§ظ†غŒ</h2><span className="inline-note">ظˆط§ط­ط¯ ظ‡ظ…ظ‡ ظ…ظ‚ط§ط¯غŒط± ط±ظˆط² ط§ط³طھ</span></div><div className="policy-interval-grid">{intervalFields.map((field) => <label className="field" key={String(field.key)}><span>{field.label}</span><div className="number-with-unit"><input type="number" min="1" max="3650" value={String(policy[field.key])} onChange={(event) => setInterval(field.key, event.target.value)} /><small>ط±ظˆط²</small></div></label>)}</div></section>
      <section className="settings-band"><div className="section-head"><h2>ع©ظ†طھط±ظ„â€Œظ‡ط§ ظˆ ط§ظˆظ„ظˆغŒطھ ظ¾غŒط´â€Œظپط±ط¶</h2><span className="inline-note">ط±غŒط³ع© ط¨ط­ط±ط§ظ†غŒ ظ…غŒâ€Œطھظˆط§ظ†ط¯ ط§ظˆظ„ظˆغŒطھ ط±ط§ بالاطھط± ط¨ط¨ط±ط¯</span></div><div className="control-policy-grid">{operationalControlTypes.map((type) => <article className="control-policy-row" key={type}><label className="risk-acceptance"><input type="checkbox" checked={policy.enabledControlTypes.includes(type)} onChange={() => toggleControl(type)} /><span>{controlTypeLabel(type)}</span></label><select aria-label={`ط§ظˆظ„ظˆغŒطھ ${controlTypeLabel(type)}`} value={policy.defaultPriorities[type]} onChange={(event) => setPolicy((current) => ({ ...current, defaultPriorities: { ...current.defaultPriorities, [type]: event.target.value as OperationalControlPriority } }))}>{(["low", "medium", "high", "urgent"] as OperationalControlPriority[]).map((priority) => <option key={priority} value={priority}>{controlPriorityLabel(priority)}</option>)}</select></article>)}</div></section>
      <section className="settings-split">
        <section className="settings-band"><h2>ط®ط±ظˆط¬غŒ طھظ‚ظˆغŒظ…</h2><label className="risk-acceptance"><input type="checkbox" checked={exportOptions.includeCompleted} onChange={(event) => setExportOptions((current) => ({ ...current, includeCompleted: event.target.checked }))} /><span>ط´ط§ظ…ظ„ ط§ظ†ط¬ط§ظ…â€Œط´ط¯ظ‡â€Œظ‡ط§</span></label><label className="risk-acceptance"><input type="checkbox" checked={exportOptions.includeDismissed} onChange={(event) => setExportOptions((current) => ({ ...current, includeDismissed: event.target.checked }))} /><span>ط´ط§ظ…ظ„ ط±ط¯ط´ط¯ظ‡â€Œظ‡ط§</span></label><label className="risk-acceptance"><input type="checkbox" checked={exportOptions.includeManagerNote} onChange={(event) => setExportOptions((current) => ({ ...current, includeManagerNote: event.target.checked }))} /><span>غŒط§ط¯ط¯ط§ط´طھ ظ…ط¯غŒط± ط¯ط± ط®ط±ظˆط¬غŒ</span></label><label className="field"><span>ط±ظˆط²ظ‡ط§غŒ ط¢غŒظ†ط¯ظ‡</span><input type="number" min="0" value={exportOptions.includeUpcomingDays} onChange={(event) => setExportOptions((current) => ({ ...current, includeUpcomingDays: Number(event.target.value) }))} /></label></section>
        <section className="settings-band"><h2>ط§ط¹ظ„ط§ظ† ظ…ط­ظ„غŒ</h2><p className="inline-note">ط§غŒظ† ط§ط¹ظ„ط§ظ† ظپظ‚ط· ط¯ط§ط®ظ„ ط¯ط§ط´ط¨ظˆط±ط¯ ط§ط³طھ ظˆ reminder ط³غŒط³طھظ…â€Œط¹ط§ظ…ظ„ ظ†غŒط³طھ.</p><label className="risk-acceptance"><input type="checkbox" checked={notificationPreference.enabled} onChange={(event) => setNotificationPreference((current) => ({ ...current, enabled: event.target.checked }))} /><span>ط§ط¹ظ„ط§ظ† ط¯ط§ط®ظ„ ط¯ط§ط´ط¨ظˆط±ط¯ ظپط¹ط§ظ„ ط¨ط§ط´ط¯</span></label><label className="field"><span>ط­ط¯ط§ظ‚ظ„ ط§ظˆظ„ظˆغŒطھ</span><select value={notificationPreference.minimumPriority} onChange={(event) => setNotificationPreference((current) => ({ ...current, minimumPriority: event.target.value as OperationalControlPriority }))}>{(["low", "medium", "high", "urgent"] as OperationalControlPriority[]).map((priority) => <option key={priority} value={priority}>{controlPriorityLabel(priority)}</option>)}</select></label><label className="field"><span>ع†ظ†ط¯ ط±ظˆط² ظ‚ط¨ظ„ ط§ط² ظ…ظˆط¹ط¯</span><input type="number" min="0" max="365" value={notificationPreference.daysBeforeDue} onChange={(event) => setNotificationPreference((current) => ({ ...current, daysBeforeDue: Number(event.target.value) }))} /></label></section>
      </section>
    </div>
  );
}

function OperationsCalendarPage({
  spaces,
  employees,
  taskTypes,
  scheduleItems,
  rules,
  settings,
}: {
  spaces: Space[];
  employees: Employee[];
  taskTypes: TaskType[];
  scheduleItems: WeeklyScheduleItem[];
  rules: AnalysisRule[];
  settings: AnalysisSettings;
}) {
  const [refreshToken, setRefreshToken] = useState(0);
  const [typeFilter, setTypeFilter] = useState<OperationalControlType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<OperationalControlStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<OperationalControlPriority | "all">("all");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [snoozeId, setSnoozeId] = useState("");
  const [snoozeDate, setSnoozeDate] = useState("");
  const [message, setMessage] = useState("");
  const [exportOptions, setExportOptions] = useState<OperationalControlExportOptions>(() => operationsControlSettingsService.getExportOptions());
  void refreshToken;

  const systemState = currentOperationsCalendarState({ spaces, employees, taskTypes, scheduleItems, rules, settings });
  const policy = operationsControlSettingsService.getSchedulePolicy();
  const notificationPreference = operationsControlSettingsService.getNotificationPreferences();
  const stateSignature = [
    systemState.latestSnapshotAt,
    systemState.latestBackupAt,
    systemState.latestArchiveAt,
    systemState.latestResignoffAt,
    systemState.retentionStatus,
    systemState.retentionNeedsSnapshot,
    systemState.retentionNeedsArchive,
    systemState.staleDriftCount,
    systemState.expiredResignoffCount,
    systemState.maintenanceIssueCount,
    systemState.maintenanceCritical,
    systemState.driftLevel,
    systemState.driftRequiresResignoff,
    systemState.readinessStatus,
    systemState.monthlyHealthNeedsReview,
    systemState.hasCurrentMonthGoal,
    systemState.urgentPreventiveAlertCount,
    systemState.launchChecklistOpenCount,
    policy.updatedAt,
  ].join("|");

  useEffect(() => {
    operationsCalendarService.rebuild(systemState, policy);
    setRefreshToken((value) => value + 1);
  }, [stateSignature]);

  const report = operationsCalendarService.preview(systemState, policy);
  const notifications = operationalNotificationService.listNotifications();
  const notificationSummary = operationalNotificationService.getNotificationSummary();
  const now = Date.now();
  const nextWeek = now + 7 * 86400000;
  const nextSevenDaysCount = report.controls.filter((control) => {
    const due = new Date(control.dueAt).getTime();
    return due >= now && due <= nextWeek && control.status !== "completed" && control.status !== "dismissed";
  }).length;
  const filteredControls = report.controls.filter((control) =>
    (typeFilter === "all" || control.type === typeFilter) &&
    (statusFilter === "all" || control.status === statusFilter) &&
    (priorityFilter === "all" || control.priority === priorityFilter));
  const groupedControls = Object.entries(groupControlsByDate(filteredControls)).sort(([a], [b]) => a.localeCompare(b));

  const refresh = (text: string) => {
    setMessage(text);
    setRefreshToken((value) => value + 1);
  };
  const noteFor = (control: OperationalControlItem) => notes[control.id] ?? control.managerNote;
  const markCompleted = (control: OperationalControlItem) => {
    operationsCalendarService.markCompleted(control.id, noteFor(control));
    refresh("ع©ظ†طھط±ظ„ ط§ظ†ط¬ط§ظ…â€Œط´ط¯ظ‡ ط«ط¨طھ ط´ط¯.");
  };
  const dismiss = (control: OperationalControlItem) => {
    const note = noteFor(control).trim();
    if (!note) return refresh("ط¨ط±ط§غŒ ط±ط¯ ع©ظ†طھط±ظ„طŒ غŒط§ط¯ط¯ط§ط´طھ ظ…ط¯غŒط± ط§ظ„ط²ط§ظ…غŒ ط§ط³طھ.");
    if (!window.confirm("ط§غŒظ† ع©ظ†طھط±ظ„ ط¨ط§ غŒط§ط¯ط¯ط§ط´طھ ظ…ط¯غŒط± ط±ط¯ ط´ظˆط¯طں")) return;
    operationsCalendarService.dismiss(control.id, note);
    refresh("ع©ظ†طھط±ظ„ ط±ط¯ ط´ط¯ ظˆ ط¯ظ„غŒظ„ ط¢ظ† ظ†ع¯ظ‡ط¯ط§ط±غŒ ظ…غŒâ€Œط´ظˆط¯.");
  };
  const snooze = (control: OperationalControlItem) => {
    if (!snoozeDate) return refresh("طھط§ط±غŒط® طھط¹ظˆغŒظ‚ ط±ط§ ط§ظ†طھط®ط§ط¨ ع©ظ†غŒط¯.");
    const until = new Date(`${snoozeDate}T12:00:00`).toISOString();
    if (!operationsCalendarService.snooze(control.id, until, noteFor(control))) return refresh("طھط§ط±غŒط® طھط¹ظˆغŒظ‚ ط¨ط§غŒط¯ ط¯ط± ط¢غŒظ†ط¯ظ‡ ط¨ط§ط´ط¯.");
    setSnoozeId("");
    setSnoozeDate("");
    refresh("ع©ظ†طھط±ظ„ طھط§ طھط§ط±غŒط® ط§ظ†طھط®ط§ط¨â€Œط´ط¯ظ‡ ط¨ظ‡ طھط¹ظˆغŒظ‚ ط§ظپطھط§ط¯.");
  };
  const rebuild = () => {
    operationsCalendarService.rebuild(systemState, policy);
    refresh("طھظ‚ظˆغŒظ… ط§ط² ظˆط¶ط¹غŒطھ ظپط¹ظ„غŒ ط³غŒط³طھظ… ط¨ط§ط²ط³ط§ط²غŒ ط´ط¯.");
  };
  const saveExportOptions = (next: OperationalControlExportOptions) => {
    setExportOptions(operationsControlSettingsService.updateExportOptions(next));
  };
  const refreshNotifications = () => {
    operationalNotificationService.refreshFromControls(report.controls, notificationPreference);
    refresh("ط§ط¹ظ„ط§ظ†â€Œظ‡ط§غŒ ظ…ط­ظ„غŒ ط§ط² ع©ظ†طھط±ظ„â€Œظ‡ط§غŒ ظپط¹ظ„غŒ ط¨ظ‡â€Œط±ظˆط²ط±ط³ط§ظ†غŒ ط´ط¯ظ†ط¯.");
  };
  const createCalendarSnapshot = () => {
    const snapshot = workforceBackupService.createSnapshot("Snapshot طھظ‚ظˆغŒظ… ع©ظ†طھط±ظ„â€Œظ‡ط§", "operations_calendar_snapshot", "ط³ط§ط®طھظ‡â€Œط´ط¯ظ‡ ظ¾غŒط´ ط§ط² ط±ط³غŒط¯ع¯غŒ ط¨ظ‡ ع©ظ†طھط±ظ„â€Œظ‡ط§غŒ ط¹ظ…ظ„غŒط§طھغŒ", false);
    operationalHistoryService.recordSnapshotEvent(snapshot.id, snapshot.title, snapshot.reason);
    operationsCalendarService.rebuild(currentOperationsCalendarState({ spaces, employees, taskTypes, scheduleItems, rules, settings }), policy);
    refresh("Snapshot ط¹ظ…ظ„غŒط§طھغŒ ط³ط§ط®طھظ‡ ط´ط¯.");
  };

  return (
    <div className="page-stack operations-calendar-page">
      <header className="page-header">
        <div><span className="eyebrow">P20 Operations Control</span><h1>طھظ‚ظˆغŒظ… ع©ظ†طھط±ظ„â€Œظ‡ط§غŒ ط¹ظ…ظ„غŒط§طھغŒ</h1><p>ظ…ظˆط¹ط¯ظ‡ط§غŒ ع©ظ†طھط±ظ„غŒ ط³غŒط³طھظ… ط±ط§ ط¯ط± غŒع© طµظپ ط±ظˆط²ط§ظ†ظ‡ ط¨ط¨غŒظ†غŒط¯ ظˆ ظ†طھغŒط¬ظ‡ ط±ط³غŒط¯ع¯غŒ ط±ط§ ظ…ط­ظ„غŒ ط«ط¨طھ ع©ظ†غŒط¯.</p></div>
        <div className="hero-actions">
          <a className="ghost-button" href="/organization/workforce-dashboard">ط§طھط§ظ‚ ظپط±ظ…ط§ظ†</a>
          <a className="ghost-button" href="/organization/workforce-dashboard/data-center">ظ…ط±ع©ط² ط¯ط§ط¯ظ‡</a>
          <a className="ghost-button" href="/organization/workforce-dashboard/operations-control-settings">طھظ†ط¸غŒظ… ط²ظ…ط§ظ†â€Œط¨ظ†ط¯غŒ</a>
          <button className="ghost-button" type="button" onClick={() => downloadOperationsCalendarIcs(report.controls, exportOptions)}>ط®ط±ظˆط¬غŒ ICS</button>
          <button className="ghost-button" type="button" onClick={() => downloadOperationsCalendarJson(report.controls, policy, exportOptions, report.summary)}>ط®ط±ظˆط¬غŒ JSON</button>
          <button className="ghost-button" type="button" onClick={createCalendarSnapshot}><ShieldCheck size={17} /> ط³ط§ط®طھ Snapshot</button>
          <button className="primary-button" type="button" onClick={rebuild}><RotateCcw size={17} /> ط¨ط§ط²ط³ط§ط²غŒ طھظ‚ظˆغŒظ…</button>
        </div>
      </header>
      {message && <div className="inline-notice">{message}</div>}

      <section className="kpi-strip operations-calendar-kpis">
        <article className="kpi-card tone-critical"><div><p>ط¹ظ‚ط¨â€Œط§ظپطھط§ط¯ظ‡</p><strong>{toPersianNumber(report.overdueCount)}</strong><span>ظ†غŒط§ط²ظ…ظ†ط¯ ط§ظ‚ط¯ط§ظ…</span></div></article>
        <article className="kpi-card tone-warn"><div><p>ظ…ظˆط¹ط¯ ط§ظ…ط±ظˆط²</p><strong>{toPersianNumber(report.todayCount)}</strong><span>طھط§ ظ¾ط§غŒط§ظ† ط§ظ…ط±ظˆط²</span></div></article>
        <article className="kpi-card tone-info"><div><p>ظ‡ظپطھ ط±ظˆط² ط¢غŒظ†ط¯ظ‡</p><strong>{toPersianNumber(nextSevenDaysCount)}</strong><span>ع©ظ†طھط±ظ„ ظ¾غŒط´â€Œط±ظˆ</span></div></article>
        <article className="kpi-card tone-critical"><div><p>ط§ظˆظ„ظˆغŒطھ ظپظˆط±غŒ</p><strong>{toPersianNumber(report.urgentCount)}</strong><span>ط¨ط§ط² ظˆ ظپط¹ط§ظ„</span></div></article>
        <article className="kpi-card tone-good"><div><p>ط§ظ†ط¬ط§ظ…â€Œط´ط¯ظ‡</p><strong>{toPersianNumber(report.completedCount)}</strong><span>ط«ط¨طھ ظ…ط­ظ„غŒ</span></div></article>
      </section>

      <section className={`calendar-next-control tone-${report.nextBestControl ? controlTone(report.nextBestControl.priority) : "good"}`}>
        <div><span className="eyebrow">ط§ظ‚ط¯ط§ظ… ط¨ط¹ط¯غŒ ظ¾غŒط´ظ†ظ‡ط§ط¯غŒ</span><h2>{report.nextBestControl?.title ?? "ع©ظ†طھط±ظ„ ط¨ط§ط²غŒ ط¨ط§ظ‚غŒ ظ†ظ…ط§ظ†ط¯ظ‡ ط§ط³طھ"}</h2><p>{report.nextBestControl?.description ?? "ظˆط¶ط¹غŒطھ ظپط¹ظ„غŒ ظ¾ط§غŒط¯ط§ط± ط§ط³طھط› طھظ‚ظˆغŒظ… ط±ط§ ط¯ط± ظ†ظˆط¨طھ ط¨ط¹ط¯غŒ ط¨ط§ط²ط³ط§ط²غŒ ع©ظ†غŒط¯."}</p></div>
        {report.nextBestControl && <a className="primary-button" href={report.nextBestControl.relatedPath}>ط±ظپطھظ† ط¨ظ‡ ط¨ط®ط´ ظ…ط±طھط¨ط·</a>}
      </section>

      <section className="settings-split calendar-tools">
        <section className="settings-band">
          <div className="section-head"><h2>ط®ط±ظˆط¬غŒ ط³ط±غŒط¹</h2><span className="inline-note">ICS ط¨ط§ ط²ظ…ط§ظ† UTC ط³ط§ط®طھظ‡ ظ…غŒâ€Œط´ظˆط¯</span></div>
          <div className="quick-export-controls"><label className="risk-acceptance"><input type="checkbox" checked={exportOptions.includeCompleted} onChange={(event) => saveExportOptions({ ...exportOptions, includeCompleted: event.target.checked })} /><span>ط§ظ†ط¬ط§ظ…â€Œط´ط¯ظ‡â€Œظ‡ط§</span></label><label className="risk-acceptance"><input type="checkbox" checked={exportOptions.includeDismissed} onChange={(event) => saveExportOptions({ ...exportOptions, includeDismissed: event.target.checked })} /><span>ط±ط¯ط´ط¯ظ‡â€Œظ‡ط§</span></label><label className="risk-acceptance"><input type="checkbox" checked={exportOptions.includeManagerNote} onChange={(event) => saveExportOptions({ ...exportOptions, includeManagerNote: event.target.checked })} /><span>غŒط§ط¯ط¯ط§ط´طھ ظ…ط¯غŒط±</span></label><label className="field compact-field"><span>ط±ظˆط²ظ‡ط§غŒ ط¢غŒظ†ط¯ظ‡</span><input type="number" min="0" value={exportOptions.includeUpcomingDays} onChange={(event) => saveExportOptions({ ...exportOptions, includeUpcomingDays: Number(event.target.value) })} /></label></div>
        </section>
        <section className="settings-band">
          <div className="section-head"><h2>ط§ط¹ظ„ط§ظ†â€Œظ‡ط§غŒ ظ…ط­ظ„غŒ</h2><div className="badge-row"><StatusBadge tone={notificationSummary.urgent ? "critical" : "info"}>{toPersianNumber(notificationSummary.unread)} ط®ظˆط§ظ†ط¯ظ‡â€Œظ†ط´ط¯ظ‡</StatusBadge><StatusBadge tone="warn">{toPersianNumber(notificationSummary.dueToday)} ط§ظ…ط±ظˆط²</StatusBadge></div></div>
          <p className="inline-note">ط§غŒظ†â€Œظ‡ط§ ظپظ‚ط· ط¯ط§ط®ظ„ ط¯ط§ط´ط¨ظˆط±ط¯ ظ‡ط³طھظ†ط¯ ظˆ notification ظˆط§ظ‚ط¹غŒ ط¯ط³طھع¯ط§ظ‡ ظ†غŒط³طھظ†ط¯.</p>
          <div className="row-actions"><button className="primary-button" type="button" onClick={refreshNotifications}>ط³ط§ط®طھ/ط¨ظ‡â€Œط±ظˆط²ط±ط³ط§ظ†غŒ ط§ط¹ظ„ط§ظ†â€Œظ‡ط§</button><button className="ghost-button" type="button" onClick={() => { operationalNotificationService.clearReadNotifications(); refresh("ط§ط¹ظ„ط§ظ†â€Œظ‡ط§غŒ ط®ظˆط§ظ†ط¯ظ‡â€Œط´ط¯ظ‡ ظ¾ط§ع© ط´ط¯ظ†ط¯."); }}>ظ¾ط§ع©â€Œط³ط§ط²غŒ ط®ظˆط§ظ†ط¯ظ‡â€Œط´ط¯ظ‡â€Œظ‡ط§</button></div>
          <div className="notification-mini-list">{notifications.filter((item) => item.status !== "dismissed").slice(0, 4).map((item) => <article key={item.id}><div><strong>{item.title}</strong><small>{controlPriorityLabel(item.priority)} | {toPersianNumber(new Date(item.dueAt).toLocaleDateString("fa-IR"))}</small></div><div className="row-actions">{item.status === "unread" && <button className="ghost-button" type="button" onClick={() => { operationalNotificationService.markNotificationRead(item.id); refresh("ط§ط¹ظ„ط§ظ† ط®ظˆط§ظ†ط¯ظ‡ ط´ط¯."); }}>ط®ظˆط§ظ†ط¯ظ…</button>}<button className="ghost-button" type="button" onClick={() => { operationalNotificationService.dismissNotification(item.id); refresh("ط§ط¹ظ„ط§ظ† ط¨ط³طھظ‡ ط´ط¯."); }}>ط¨ط³طھظ†</button></div></article>)}{!notifications.filter((item) => item.status !== "dismissed").length && <p>ط§ط¹ظ„ط§ظ† ظ…ط­ظ„غŒ ظپط¹ط§ظ„غŒ ظˆط¬ظˆط¯ ظ†ط¯ط§ط±ط¯.</p>}</div>
        </section>
      </section>

      <section className="filter-bar operations-calendar-filters">
        <select aria-label="ظپغŒظ„طھط± ظ†ظˆط¹ ع©ظ†طھط±ظ„" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as OperationalControlType | "all")}><option value="all">ظ‡ظ…ظ‡ ع©ظ†طھط±ظ„â€Œظ‡ط§</option>{(["snapshot_due", "backup_due", "archive_due", "maintenance_review", "drift_review", "resignoff_due", "readiness_review", "monthly_health_review", "preventive_alert_review", "launch_checklist_review"] as OperationalControlType[]).map((type) => <option key={type} value={type}>{controlTypeLabel(type)}</option>)}</select>
        <select aria-label="ظپغŒظ„طھط± ظˆط¶ط¹غŒطھ" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as OperationalControlStatus | "all")}><option value="all">ظ‡ظ…ظ‡ ظˆط¶ط¹غŒطھâ€Œظ‡ط§</option>{(["upcoming", "due_today", "overdue", "completed", "snoozed", "dismissed"] as OperationalControlStatus[]).map((status) => <option key={status} value={status}>{controlStatusLabel(status)}</option>)}</select>
        <select aria-label="ظپغŒظ„طھط± ط§ظˆظ„ظˆغŒطھ" value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value as OperationalControlPriority | "all")}><option value="all">ظ‡ظ…ظ‡ ط§ظˆظ„ظˆغŒطھâ€Œظ‡ط§</option>{(["low", "medium", "high", "urgent"] as OperationalControlPriority[]).map((priority) => <option key={priority} value={priority}>{controlPriorityLabel(priority)}</option>)}</select>
        <span className="inline-note">{toPersianNumber(filteredControls.length)} ظ†طھغŒط¬ظ‡</span>
      </section>

      <div className="calendar-date-groups">
        {groupedControls.map(([date, controls]) => (
          <section className="calendar-date-section" key={date}>
            <div className="section-head"><h2>{toPersianNumber(new Date(`${date}T12:00:00`).toLocaleDateString("fa-IR", { weekday: "long", month: "long", day: "numeric" }))}</h2><span className="inline-note">{toPersianNumber(controls.length)} ع©ظ†طھط±ظ„</span></div>
            <div className="control-card-grid">
              {controls.map((control) => (
                <article className={`control-card tone-${controlTone(control.status === "completed" || control.status === "dismissed" || control.status === "snoozed" ? control.status : control.priority)}`} key={control.id}>
                  <div className="section-head"><div className="badge-row"><StatusBadge tone={controlTone(control.status)}>{controlStatusLabel(control.status)}</StatusBadge><StatusBadge tone={controlTone(control.priority)}>{controlPriorityLabel(control.priority)}</StatusBadge></div><small>{controlTypeLabel(control.type)}</small></div>
                  <h3>{control.title}</h3><p>{control.description}</p>
                  <div className="control-meta"><span>ط³ط±ط±ط³غŒط¯: {toPersianNumber(new Date(control.dueAt).toLocaleString("fa-IR"))}</span><span>ظ…ظ†ط¨ط¹: {control.source}</span>{control.snoozedUntil && <span>طھط¹ظˆغŒظ‚ طھط§: {toPersianNumber(new Date(control.snoozedUntil).toLocaleDateString("fa-IR"))}</span>}</div>
                  <label className="field"><span>غŒط§ط¯ط¯ط§ط´طھ ظ…ط¯غŒط±</span><textarea rows={2} value={noteFor(control)} onChange={(event) => setNotes((current) => ({ ...current, [control.id]: event.target.value }))} placeholder="ظ†طھغŒط¬ظ‡ ط¨ط±ط±ط³غŒ غŒط§ ط¯ظ„غŒظ„ طھطµظ…غŒظ…" /></label>
                  {snoozeId === control.id && <div className="snooze-panel"><input aria-label="طھط§ط±غŒط® طھط¹ظˆغŒظ‚" type="date" value={snoozeDate} onChange={(event) => setSnoozeDate(event.target.value)} /><button className="primary-button" type="button" onClick={() => snooze(control)}>ط«ط¨طھ طھط¹ظˆغŒظ‚</button></div>}
                  <div className="row-actions">
                    <a className="ghost-button" href={control.relatedPath}>ط¨ط®ط´ ظ…ط±طھط¨ط·</a>
                    {(control.status === "completed" || control.status === "dismissed") ? <button className="ghost-button" type="button" onClick={() => { operationsCalendarService.reopen(control.id); refresh("ع©ظ†طھط±ظ„ ط¯ظˆط¨ط§ط±ظ‡ ط¨ط§ط² ط´ط¯."); }}>ط¨ط§ط²ع¯ط´ط§غŒغŒ</button> : <><button className="primary-button" type="button" onClick={() => markCompleted(control)}>ط§ظ†ط¬ط§ظ… ط´ط¯</button><button className="ghost-button" type="button" onClick={() => { setSnoozeId(control.id); setSnoozeDate(""); }}>طھط¹ظˆغŒظ‚</button><button className="danger-button" type="button" onClick={() => dismiss(control)}>ط±ط¯</button></>}
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
        {!groupedControls.length && <section className="panel"><p>ع©ظ†طھط±ظ„غŒ ط¨ط§ ظپغŒظ„طھط±ظ‡ط§غŒ ط§ظ†طھط®ط§ط¨â€Œط´ط¯ظ‡ ظ¾غŒط¯ط§ ظ†ط´ط¯.</p></section>}
      </div>
    </div>
  );
}

function DecisionReportPage() {
  const params = new URLSearchParams(window.location.search);
  const requestedId = params.get("reportId");
  const [reports, setReports] = useState<DecisionReport[]>(() => decisionReportService.list());
  const [selectedId, setSelectedId] = useState(requestedId ?? reports[0]?.id ?? "");
  const selectedReport = reports.find((report) => report.id === selectedId) ?? reports[0];
  const [managerNote, setManagerNote] = useState(selectedReport?.managerNote ?? "");
  const [approvedBy, setApprovedBy] = useState(selectedReport?.approvedBy ?? "");
  const reportTrend = buildReportTrend(reports);
  const selectedTrendIndex = selectedReport ? reportTrend.findIndex((point) => point.reportId === selectedReport.id) : -1;
  const previousPoint = selectedTrendIndex > 0 ? reportTrend[selectedTrendIndex - 1] : undefined;

  useEffect(() => {
    setManagerNote(selectedReport?.managerNote ?? "");
    setApprovedBy(selectedReport?.approvedBy ?? "");
  }, [selectedReport?.id]);

  const refresh = () => {
    const next = decisionReportService.list();
    setReports(next);
    if (!next.some((report) => report.id === selectedId)) {
      setSelectedId(next[0]?.id ?? "");
    }
  };

  const updateReport = (changes: Partial<Pick<DecisionReport, "managerNote" | "approvedBy" | "status">>) => {
    if (!selectedReport) return;
    decisionReportService.update(selectedReport.id, changes);
    refresh();
  };

  const archiveReport = (id: string) => {
    const ok = window.confirm("ط§غŒظ† ع¯ط²ط§ط±ط´ ط§ط² ظ„غŒط³طھ ظپط¹ط§ظ„ ط¨ط§غŒع¯ط§ظ†غŒ ط´ظˆط¯طں");
    if (!ok) return;
    decisionReportService.archive(id);
    refresh();
  };

  return (
    <div className="page-stack report-page">
      <header className="page-header no-print">
        <div>
          <span className="eyebrow">P8 Decision Report</span>
          <h1>ع¯ط²ط§ط±ط´ ظ…ط¯غŒط±غŒطھغŒ طھطµظ…غŒظ…â€Œظ‡ط§</h1>
          <p>ط«ط¨طھطŒ ظ…ط±ظˆط± ظˆ ع†ط§ظ¾ ظ†طھغŒط¬ظ‡ طھطµظ…غŒظ…â€Œظ‡ط§غŒ ظ‚ط¨ظ„/ط¨ط¹ط¯ ط¨ط±ط§غŒ ط¬ظ„ط³ظ‡ ظ…ط¯غŒط±غŒطھغŒ.</p>
        </div>
        <div className="hero-actions">
          <a className="ghost-button" href="/organization/workforce-dashboard/decision-queue">طµظپ طھطµظ…غŒظ…</a>
          <a className="ghost-button" href="/organization/workforce-dashboard/report-archive">ط±ظپطھظ† ط¨ظ‡ ط¢ط±ط´غŒظˆ ع¯ط²ط§ط±ط´â€Œظ‡ط§</a>
          <button className="primary-button" type="button" onClick={() => window.print()}>ع†ط§ظ¾ ع¯ط²ط§ط±ط´</button>
        </div>
      </header>

      <section className="panel report-list no-print">
        <div className="section-head">
          <h2>ع¯ط²ط§ط±ط´â€Œظ‡ط§غŒ ظ‚ط¨ظ„غŒ</h2>
          <span className="inline-note">{toPersianNumber(reports.length)} ع¯ط²ط§ط±ط´ ظپط¹ط§ظ„</span>
        </div>
        <div className="entity-table">
          {reports.map((report) => (
            <article className={selectedReport?.id === report.id ? "highlight-row" : ""} key={report.id}>
              <div className="entity-main">
                <div><small>ط¹ظ†ظˆط§ظ†</small><strong>{report.title}</strong></div>
                <div><small>طھط§ط±غŒط®</small><strong>{toPersianNumber(new Date(report.generatedAt).toLocaleDateString("fa-IR"))}</strong></div>
                <div><small>ع©ظ†طھط±ظ„</small><strong>{toPersianNumber(report.summary.controlScoreBefore)} / {toPersianNumber(report.summary.controlScoreAfter)}</strong></div>
              </div>
              <div className="row-actions">
                <StatusBadge tone={reportStatusTone(report.status)}>{reportStatusLabel(report.status)}</StatusBadge>
                <button type="button" onClick={() => setSelectedId(report.id)}>ظ…ط´ط§ظ‡ط¯ظ‡</button>
                <button className="danger-button" type="button" onClick={() => archiveReport(report.id)}>ط¨ط§غŒع¯ط§ظ†غŒ</button>
              </div>
            </article>
          ))}
          {!reports.length && <p>ظ‡ظ†ظˆط² ع¯ط²ط§ط±ط´غŒ ط³ط§ط®طھظ‡ ظ†ط´ط¯ظ‡ ط§ط³طھ. ط§ط² طµظپ طھطµظ…غŒظ…â€Œع¯غŒط±غŒ غŒع© ع¯ط²ط§ط±ط´ ط¨ط³ط§ط².</p>}
        </div>
      </section>

      {selectedReport ? (
        <section className="print-surface">
          <section className="report-title">
            <div>
              <span className="eyebrow">ع¯ط²ط§ط±ط´ ظ‚ط§ط¨ظ„ ع†ط§ظ¾</span>
              <h1>{selectedReport.title}</h1>
              <p>{selectedReport.weekLabel} | طھظˆظ„غŒط¯ ط´ط¯ظ‡ ط¯ط± {toPersianNumber(new Date(selectedReport.generatedAt).toLocaleString("fa-IR"))}</p>
            </div>
            <StatusBadge tone={reportStatusTone(selectedReport.status)}>{reportStatusLabel(selectedReport.status)}</StatusBadge>
          </section>

          <section className="kpi-strip">
            <article className="kpi-card tone-info"><div><p>ظ‚ط¨ظ„</p><strong>{toPersianNumber(selectedReport.summary.controlScoreBefore)}</strong><span>ط±غŒط³ع© {toPersianNumber(selectedReport.summary.riskScoreBefore)}</span></div></article>
            <article className="kpi-card tone-good"><div><p>ط¨ط¹ط¯</p><strong>{toPersianNumber(selectedReport.summary.controlScoreAfter)}</strong><span>ط±غŒط³ع© {toPersianNumber(selectedReport.summary.riskScoreAfter)}</span></div></article>
            <article className={`kpi-card tone-${selectedReport.summary.controlScoreAfter >= selectedReport.summary.controlScoreBefore ? "good" : "critical"}`}><div><p>طھط؛غŒغŒط± ع©ظ†طھط±ظ„</p><strong>{toPersianNumber(selectedReport.summary.controlScoreAfter - selectedReport.summary.controlScoreBefore)}</strong><span>{verdictLabel(selectedReport.summary.verdict)}</span></div></article>
            <article className="kpi-card tone-critical"><div><p>ط¨ط­ط±ط§ظ†غŒ</p><strong>{toPersianNumber(selectedReport.summary.criticalBefore)} / {toPersianNumber(selectedReport.summary.criticalAfter)}</strong><span>ظ‚ط¨ظ„ / ط¨ط¹ط¯</span></div></article>
            <article className="kpi-card tone-warn"><div><p>ظ‡ط´ط¯ط§ط±</p><strong>{toPersianNumber(selectedReport.summary.warningBefore)} / {toPersianNumber(selectedReport.summary.warningAfter)}</strong><span>ظ‚ط¨ظ„ / ط¨ط¹ط¯</span></div></article>
          </section>

          <section className="bottom-grid">
            {previousPoint && (
              <section className="panel">
                <h2>ظ…ظ‚ط§غŒط³ظ‡ ط¨ط§ ع¯ط²ط§ط±ط´ ظ‚ط¨ظ„غŒ</h2>
                <div className="finding-meta">
                  <span>طھط؛غŒغŒط± ع©ظ†طھط±ظ„: {toPersianNumber(selectedReport.summary.controlScoreAfter - previousPoint.controlScoreAfter)}</span>
                  <span>طھط؛غŒغŒط± ط±غŒط³ع©: {toPersianNumber(selectedReport.summary.riskScoreAfter - previousPoint.riskScoreAfter)}</span>
                </div>
                <a className="ghost-button no-print" href={`/organization/workforce-dashboard/report-comparison?reportIds=${encodeURIComponent(`${previousPoint.reportId},${selectedReport.id}`)}`}>ظ…ظ‚ط§غŒط³ظ‡ ع©ط§ظ…ظ„</a>
              </section>
            )}
            <section className="panel wide-panel">
              <h2>طھطµظ…غŒظ…â€Œظ‡ط§غŒ ط§ط¹ظ…ط§ظ„â€Œط´ط¯ظ‡ غŒط§ ظ¾غŒط´ظ†ظ‡ط§ط¯غŒ</h2>
              <div className="report-table">
                {selectedReport.decisionBatchResult.appliedChanges.map((change) => (
                  <article key={`${change.scheduleItemId}-${change.newSpaceId ?? ""}`}>
                    <strong>{change.scheduleItemId}</strong>
                    <span>ظپط¶ط§: {change.newSpaceId ?? "ط¨ط¯ظˆظ† طھط؛غŒغŒط±"} | ط²ظ…ط§ظ†: {change.newStartTime ?? "-"} طھط§ {change.newEndTime ?? "-"}</span>
                  </article>
                ))}
                {!selectedReport.decisionBatchResult.appliedChanges.length && <p>طھط؛غŒغŒط± ظ‚ط§ط¨ظ„ ط§ط¹ظ…ط§ظ„غŒ ط¯ط± ط§غŒظ† ع¯ط²ط§ط±ط´ ط«ط¨طھ ظ†ط´ط¯ظ‡ ط§ط³طھ.</p>}
              </div>
            </section>
            <section className="panel">
              <h2>ط®ظ„ط§طµظ‡ ظ…ط¯غŒط±غŒطھغŒ</h2>
              <div className="evidence-box">
                <span>{selectedReport.summary.summary}</span>
                <small>ط±غŒط³ع© ع©ظ„ ط§ط² {toPersianNumber(selectedReport.summary.riskScoreBefore)} ط¨ظ‡ {toPersianNumber(selectedReport.summary.riskScoreAfter)} طھط؛غŒغŒط± ع©ط±ط¯ظ‡ ط§ط³طھ.</small>
              </div>
            </section>
          </section>

          <section className="bottom-grid">
            <section className="panel">
              <h2>ط±غŒط³ع©â€Œظ‡ط§غŒ ط¨ط§ظ‚غŒâ€Œظ…ط§ظ†ط¯ظ‡</h2>
              <div className="analysis-list">
                {selectedReport.remainingRisks.slice(0, 6).map((risk) => (
                  <article className={`panel-row tone-${severityTone(risk.severity)}`} key={risk.id}>
                    <StatusBadge tone={severityTone(risk.severity)}>{severityLabel(risk.severity)}</StatusBadge>
                    <p>{risk.title}</p>
                    <small>{risk.recommendation}</small>
                  </article>
                ))}
                {!selectedReport.remainingRisks.length && <p>ط±غŒط³ع© ظ…ظ‡ظ… ط¨ط§ظ‚غŒâ€Œظ…ط§ظ†ط¯ظ‡â€Œط§غŒ ط¯ط± ع¯ط²ط§ط±ط´ ط«ط¨طھ ظ†ط´ط¯ظ‡ ط§ط³طھ.</p>}
              </div>
            </section>
            <section className="panel">
              <h2>ظ‡ط´ط¯ط§ط±ظ‡ط§غŒ ط¬ط¯غŒط¯ ط§ط­طھظ…ط§ظ„غŒ</h2>
              <div className="analysis-list">
                {selectedReport.decisionBatchResult.conflicts.map((conflict) => (
                  <article className="panel-row tone-critical" key={conflict.id}>
                    <StatusBadge tone="critical">{conflict.type}</StatusBadge>
                    <p>{conflict.description}</p>
                    <small>{conflict.recommendation}</small>
                  </article>
                ))}
                {!selectedReport.decisionBatchResult.conflicts.length && <p>ظ‡ط´ط¯ط§ط± غŒط§ conflict طھط§ط²ظ‡â€Œط§غŒ ط¨ط±ط§غŒ ط§غŒظ† batch ط«ط¨طھ ظ†ط´ط¯ظ‡ ط§ط³طھ.</p>}
              </div>
            </section>
            <section className="panel">
              <h2>طھط§غŒغŒط¯ ظ…ط¯غŒط±</h2>
              <div className="signature-box">
                <span>طھط§غŒغŒط¯ع©ظ†ظ†ط¯ظ‡: {selectedReport.approvedBy || "ط«ط¨طھ ظ†ط´ط¯ظ‡"}</span>
                <span>ظˆط¶ط¹غŒطھ: {reportStatusLabel(selectedReport.status)}</span>
                <span>غŒط§ط¯ط¯ط§ط´طھ: {selectedReport.managerNote || "ط¨ط¯ظˆظ† غŒط§ط¯ط¯ط§ط´طھ"}</span>
              </div>
            </section>
          </section>

          <section className="panel no-print">
            <h2>ظˆغŒط±ط§غŒط´ ظˆط¶ط¹غŒطھ ع¯ط²ط§ط±ط´</h2>
            <div className="field-grid">
              <TextField label="ظ†ط§ظ… طھط§غŒغŒط¯ع©ظ†ظ†ط¯ظ‡" value={approvedBy} onChange={setApprovedBy} />
              <SelectField label="ظˆط¶ط¹غŒطھ طھط§غŒغŒط¯" value={selectedReport.status} options={[
                { label: "ظ¾غŒط´â€Œظ†ظˆغŒط³", value: "draft" },
                { label: "طھط§غŒغŒط¯ ط´ط¯ظ‡", value: "approved" },
                { label: "ط§ط¹ظ…ط§ظ„ ط´ط¯ظ‡", value: "applied" },
                { label: "ظ†غŒط§ط²ظ…ظ†ط¯ ط¨ط±ط±ط³غŒ", value: "needs_review" },
              ]} onChange={(status) => updateReport({ status: status as DecisionReportStatus })} />
              <TextAreaField label="غŒط§ط¯ط¯ط§ط´طھ ظ…ط¯غŒط±" value={managerNote} onChange={setManagerNote} />
            </div>
            <div className="form-actions">
              <button className="primary-button" type="button" onClick={() => updateReport({ approvedBy, managerNote })}>ط°ط®غŒط±ظ‡ غŒط§ط¯ط¯ط§ط´طھ</button>
              <button className="ghost-button" type="button" onClick={() => updateReport({ status: "approved", approvedBy, managerNote })}>طھط§غŒغŒط¯ ع¯ط²ط§ط±ط´</button>
              <button className="ghost-button" type="button" onClick={() => updateReport({ status: "applied", approvedBy, managerNote })}>ط¹ظ„ط§ظ…طھâ€Œع¯ط°ط§ط±غŒ ط§ط¹ظ…ط§ظ„ ط´ط¯ظ‡</button>
            </div>
          </section>
        </section>
      ) : (
        <section className="panel">
          <h2>ع¯ط²ط§ط±ط´غŒ ط¨ط±ط§غŒ ظ†ظ…ط§غŒط´ ظˆط¬ظˆط¯ ظ†ط¯ط§ط±ط¯</h2>
          <p>ط§ط² طµظپط­ظ‡ طµظپ طھطµظ…غŒظ…â€Œع¯غŒط±غŒطŒ ظ¾ط³ ط§ط² طھط­ظ„غŒظ„ batchطŒ ع¯ط²ط§ط±ط´ طھطµظ…غŒظ… ط¨ط³ط§ط².</p>
        </section>
      )}
    </div>
  );
}

function miniBarWidth(value: number, max = 100) {
  return `${Math.max(4, Math.min(100, Math.round((value / Math.max(max, 1)) * 100)))}%`;
}

function ReportArchivePage({ comparisonOnly = false }: { comparisonOnly?: boolean }) {
  const [reports, setReports] = useState<DecisionReport[]>(() => decisionReportService.list(true));
  const queryReportIds = new URLSearchParams(window.location.search).get("reportIds")?.split(",").filter(Boolean) ?? [];
  const [status, setStatus] = useState("");
  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState("date");
  const [selectedIds, setSelectedIds] = useState<string[]>(() => queryReportIds.length ? queryReportIds : reports.slice(0, 4).map((report) => report.id));

  const visibleReports = reports
    .filter((report) => !report.isArchived)
    .filter((report) => !status || report.status === status)
    .filter((report) => {
      const text = `${report.title} ${report.weekLabel}`.toLowerCase();
      return !query.trim() || text.includes(query.trim().toLowerCase());
    })
    .sort((a, b) => {
      if (sortMode === "control") return b.summary.controlScoreAfter - a.summary.controlScoreAfter;
      if (sortMode === "improvement") return (b.summary.controlScoreAfter - b.summary.controlScoreBefore) - (a.summary.controlScoreAfter - a.summary.controlScoreBefore);
      return b.generatedAt.localeCompare(a.generatedAt);
    });

  const selectedReports = reports.filter((report) => selectedIds.includes(report.id));
  const comparison = compareDecisionReports(selectedReports.length >= 2 ? selectedReports : visibleReports.slice(0, 4));
  const monthlySummary = calculateMonthlySummary(visibleReports);
  const trend = comparison.controlScoreTrend;
  const bestReport = reports.find((report) => report.id === comparison.bestReportId);
  const worstReport = reports.find((report) => report.id === comparison.worstReportId);

  const toggleCompare = (id: string) => {
    setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const archiveReport = (id: string) => {
    const ok = window.confirm("ط§غŒظ† ع¯ط²ط§ط±ط´ ط¨ط§غŒع¯ط§ظ†غŒ ط´ظˆط¯طں");
    if (!ok) return;
    decisionReportService.archive(id);
    const next = decisionReportService.list(true);
    setReports(next);
    setSelectedIds((current) => current.filter((item) => item !== id));
  };

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <span className="eyebrow">P9 Report Archive</span>
          <h1>{comparisonOnly ? "ظ…ظ‚ط§غŒط³ظ‡ ع¯ط²ط§ط±ط´â€Œظ‡ط§" : "ط¢ط±ط´غŒظˆ ظˆ ظ…ظ‚ط§غŒط³ظ‡ ع¯ط²ط§ط±ط´â€Œظ‡ط§"}</h1>
          <p>ط±ظˆظ†ط¯ طھطµظ…غŒظ…â€Œظ‡ط§غŒ ظ…ط¯غŒط±غŒطھغŒطŒ ط¨ظ‡طھط±غŒظ†/ط¨ط¯طھط±غŒظ† ظ‡ظپطھظ‡ ظˆ ط®ظ„ط§طµظ‡ ظ…ط§ظ‡ط§ظ†ظ‡ ط³ط¨ع© ط±ط§ ط¨ط¨غŒظ†.</p>
        </div>
        <div className="hero-actions">
          <a className="ghost-button" href="/organization/workforce-dashboard/decision-report">ع¯ط²ط§ط±ط´ طھطµظ…غŒظ…</a>
          <a className="ghost-button" href="/organization/workforce-dashboard/monthly-health">ط³ظ„ط§ظ…طھ ظ…ط§ظ‡ط§ظ†ظ‡</a>
          <a className="primary-button" href="/organization/workforce-dashboard/report-comparison">ظ…ظ‚ط§غŒط³ظ‡ ع¯ط²ط§ط±ط´â€Œظ‡ط§</a>
        </div>
      </header>

      <section className="kpi-strip">
        <article className="kpi-card tone-info"><div><p>ع¯ط²ط§ط±ط´â€Œظ‡ط§</p><strong>{toPersianNumber(visibleReports.length)}</strong><span>ظپط¹ط§ظ„ ط¯ط± ط¢ط±ط´غŒظˆ</span></div></article>
        <article className="kpi-card tone-good"><div><p>ظ…غŒط§ظ†ع¯غŒظ† ع©ظ†طھط±ظ„</p><strong>{toPersianNumber(comparison.averageControlScore)}</strong><span>ع¯ط²ط§ط±ط´â€Œظ‡ط§غŒ ط§ظ†طھط®ط§ط¨â€Œط´ط¯ظ‡</span></div></article>
        <article className="kpi-card tone-warn"><div><p>ظ…غŒط§ظ†ع¯غŒظ† ط±غŒط³ع©</p><strong>{toPersianNumber(comparison.averageRiskScore)}</strong><span>ط¨ط¹ط¯ ط§ط² طھطµظ…غŒظ…â€Œظ‡ط§</span></div></article>
        <article className="kpi-card tone-focus"><div><p>طھطµظ…غŒظ…â€Œظ‡ط§غŒ ظ…ظˆط«ط±</p><strong>{toPersianNumber(comparison.totalAppliedDecisions)}</strong><span>ط¯ط± ع¯ط²ط§ط±ط´â€Œظ‡ط§غŒ ظ…ظ‚ط§غŒط³ظ‡</span></div></article>
        <article className="kpi-card tone-critical"><div><p>ط±غŒط³ع© طھع©ط±ط§ط±غŒ</p><strong>{toPersianNumber(comparison.recurringRiskTitles.length)}</strong><span>ط¹ظ†ظˆط§ظ† ظ¾ط±طھع©ط±ط§ط±</span></div></article>
      </section>

      {!comparisonOnly && (
        <section className="filter-bar">
          <Filter size={16} />
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">ظ‡ظ…ظ‡ ظˆط¶ط¹غŒطھâ€Œظ‡ط§</option>
            <option value="draft">draft</option>
            <option value="approved">approved</option>
            <option value="applied">applied</option>
            <option value="needs_review">needs_review</option>
          </select>
          <select value={sortMode} onChange={(event) => setSortMode(event.target.value)}>
            <option value="date">ظ…ط±طھط¨â€Œط³ط§ط²غŒ طھط§ط±غŒط®</option>
            <option value="control">ط§ظ…طھغŒط§ط² ع©ظ†طھط±ظ„ ط¨ط¹ط¯</option>
            <option value="improvement">ط¨غŒط´طھط±غŒظ† ط¨ظ‡ط¨ظˆط¯</option>
          </select>
          <input className="search-input" value={query} placeholder="ط¬ط³طھâ€Œظˆط¬ظˆ ط¯ط± ط¹ظ†ظˆط§ظ† غŒط§ ظ‡ظپطھظ‡" onChange={(event) => setQuery(event.target.value)} />
        </section>
      )}

      <section className="archive-layout">
        {!comparisonOnly && (
          <section className="panel archive-list">
            <h2>ع¯ط²ط§ط±ط´â€Œظ‡ط§غŒ ط°ط®غŒط±ظ‡â€Œط´ط¯ظ‡</h2>
            {visibleReports.map((report) => {
              const improvement = report.summary.controlScoreAfter - report.summary.controlScoreBefore;
              const riskDelta = report.summary.riskScoreAfter - report.summary.riskScoreBefore;
              return (
                <article className="archive-card" key={report.id}>
                  <div className="analysis-card-head">
                    <StatusBadge tone={reportStatusTone(report.status)}>{reportStatusLabel(report.status)}</StatusBadge>
                    <label className="compare-toggle">
                      <input type="checkbox" checked={selectedIds.includes(report.id)} onChange={() => toggleCompare(report.id)} />
                      ظ…ظ‚ط§غŒط³ظ‡
                    </label>
                  </div>
                  <h2>{report.title}</h2>
                  <p>{report.weekLabel} | {toPersianNumber(new Date(report.generatedAt).toLocaleDateString("fa-IR"))}</p>
                  <div className="finding-meta">
                    <span>ع©ظ†طھط±ظ„: {toPersianNumber(report.summary.controlScoreBefore)} ط¨ظ‡ {toPersianNumber(report.summary.controlScoreAfter)}</span>
                    <span>ط±غŒط³ع©: {toPersianNumber(riskDelta)}</span>
                    <span>critical: {toPersianNumber(report.summary.criticalBefore)} / {toPersianNumber(report.summary.criticalAfter)}</span>
                    <span>warning: {toPersianNumber(report.summary.warningBefore)} / {toPersianNumber(report.summary.warningAfter)}</span>
                  </div>
                  <div className="mini-meter"><span style={{ width: miniBarWidth(report.summary.controlScoreAfter) }} /></div>
                  <div className="recommendation-row">
                    <a className="primary-button" href={`/organization/workforce-dashboard/decision-report?reportId=${encodeURIComponent(report.id)}`}>ظ…ط´ط§ظ‡ط¯ظ‡ ع¯ط²ط§ط±ط´</a>
                    <button className="ghost-button" type="button" onClick={() => toggleCompare(report.id)}>{selectedIds.includes(report.id) ? "ط­ط°ظپ ط§ط² ظ…ظ‚ط§غŒط³ظ‡" : "ظ…ظ‚ط§غŒط³ظ‡"}</button>
                    <button className="danger-button" type="button" onClick={() => archiveReport(report.id)}>ط¨ط§غŒع¯ط§ظ†غŒ</button>
                  </div>
                  <small>ط¨ظ‡ط¨ظˆط¯ ع©ظ†طھط±ظ„: {toPersianNumber(improvement)}</small>
                </article>
              );
            })}
            {!visibleReports.length && <p>ع¯ط²ط§ط±ط´غŒ ط¨ط±ط§غŒ ظ†ظ…ط§غŒط´ ظˆط¬ظˆط¯ ظ†ط¯ط§ط±ط¯.</p>}
          </section>
        )}

        <section className="panel comparison-panel">
          <h2>ط±ظˆظ†ط¯ ع¯ط²ط§ط±ط´â€Œظ‡ط§</h2>
          <div className="trend-bars">
            {trend.map((point) => (
              <div className="trend-row" key={point.reportId}>
                <span>{point.weekLabel}</span>
                <div className="mini-meter"><span style={{ width: miniBarWidth(point.controlScoreAfter) }} /></div>
                <strong>{toPersianNumber(point.controlScoreAfter)}</strong>
              </div>
            ))}
            {!trend.length && <p>ط¨ط±ط§غŒ ظ†ظ…ط§غŒط´ ط±ظˆظ†ط¯ ط­ط¯ط§ظ‚ظ„ غŒع© ع¯ط²ط§ط±ط´ ظ„ط§ط²ظ… ط§ط³طھ.</p>}
          </div>
          <div className="bottom-grid compact-bottom">
            <div className="heat-cell tone-good"><strong>{bestReport?.weekLabel ?? "ط«ط¨طھ ظ†ط´ط¯ظ‡"}</strong><span>ط¨ظ‡طھط±غŒظ† ظ‡ظپطھظ‡</span></div>
            <div className="heat-cell tone-critical"><strong>{worstReport?.weekLabel ?? "ط«ط¨طھ ظ†ط´ط¯ظ‡"}</strong><span>ط¨ط¯طھط±غŒظ† ظ‡ظپطھظ‡</span></div>
            <div className="heat-cell tone-info"><strong>{toPersianNumber(comparison.averageControlScore)}</strong><span>ظ…غŒط§ظ†ع¯غŒظ† ع©ظ†طھط±ظ„</span></div>
            <div className="heat-cell tone-warn"><strong>{toPersianNumber(comparison.averageRiskScore)}</strong><span>ظ…غŒط§ظ†ع¯غŒظ† ط±غŒط³ع©</span></div>
          </div>
          <div className="evidence-box">
            <span>{comparison.summary}</span>
            <small>{comparison.managementInsight}</small>
          </div>
        </section>
      </section>

      <section className="bottom-grid">
        <section className="panel">
          <h2>ظ…ط´ع©ظ„ط§طھ طھع©ط±ط§ط±ط´ظˆظ†ط¯ظ‡</h2>
          <div className="analysis-list">
            {comparison.recurringRiskTitles.slice(0, 6).map((title) => (
              <article className="panel-row tone-warn" key={title}>
                <StatusBadge tone="warn">طھع©ط±ط§ط±غŒ</StatusBadge>
                <p>{title}</p>
              </article>
            ))}
            {!comparison.recurringRiskTitles.length && <p>ظ…ط´ع©ظ„ طھع©ط±ط§ط±ط´ظˆظ†ط¯ظ‡ ظ…ط¹ظ†ط§ط¯ط§ط±غŒ ظ¾غŒط¯ط§ ظ†ط´ط¯.</p>}
          </div>
        </section>
        <section className="panel wide-panel">
          <h2>ط®ظ„ط§طµظ‡ ظ…ط§ظ‡ط§ظ†ظ‡</h2>
          <div className="finding-meta">
            <span>ظ…غŒط§ظ†ع¯غŒظ† ع©ظ†طھط±ظ„: {toPersianNumber(monthlySummary.averageControlScore)}</span>
            <span>ظ…غŒط§ظ†ع¯غŒظ† ط±غŒط³ع©: {toPersianNumber(monthlySummary.averageRiskScore)}</span>
            <span>ط¨ظ‡طھط±غŒظ† ظ‡ظپطھظ‡: {monthlySummary.bestWeek}</span>
            <span>ط¨ط¯طھط±غŒظ† ظ‡ظپطھظ‡: {monthlySummary.worstWeek}</span>
          </div>
          <div className="evidence-box">
            <span>{monthlySummary.managerSummary}</span>
            <small>{monthlySummary.recommendedFocusForNextMonth}</small>
          </div>
        </section>
      </section>
    </div>
  );
}

function blankMonthlyGoal(monthLabel: string): Omit<MonthlyGoal, "id" | "createdAt" | "updatedAt"> {
  return {
    monthLabel,
    title: "",
    description: "",
    targetMetric: "controlScore",
    targetValue: 80,
    currentValue: 0,
    status: "planned",
    isArchived: false,
  };
}

function MonthlyHealthPage() {
  const reports = decisionReportService.list(true);
  const monthOptions = Array.from(new Set(["all", ...reports.map((report) => {
    const date = new Date(report.generatedAt);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  })]));
  const [monthLabel, setMonthLabel] = useState(monthOptions[0] ?? "all");
  const monthlyReports = filterReportsByMonth(reports, monthLabel);
  const dashboard = buildMonthlyHealthDashboard(reports, monthLabel);
  const preventiveAlerts = preventiveAlertStateService.applyStates(buildPreventiveAlerts({
    reports,
    monthlyHealth: dashboard,
    monthlyGoals: monthlyGoalService.list(true),
  }));
  const openPreventiveAlerts = preventiveAlerts.filter((alert) => alert.status === "open");
  const topPreventiveAlert = openPreventiveAlerts.find((alert) => alert.priority === "urgent" || alert.priority === "high") ?? openPreventiveAlerts[0];
  const [goals, setGoals] = useState<MonthlyGoal[]>(() => monthlyGoalService.filterByMonth(monthLabel));
  const [goalForm, setGoalForm] = useState(blankMonthlyGoal(monthLabel));
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [goalError, setGoalError] = useState("");

  useEffect(() => {
    setGoals(monthlyGoalService.filterByMonth(monthLabel));
    setGoalForm(blankMonthlyGoal(monthLabel));
    setEditingGoalId(null);
  }, [monthLabel]);

  const saveGoal = () => {
    if (!goalForm.title.trim()) {
      setGoalError("ط¹ظ†ظˆط§ظ† ظ‡ط¯ظپ ط§ظ„ط²ط§ظ…غŒ ط§ط³طھ.");
      return;
    }
    if (editingGoalId) {
      monthlyGoalService.update(editingGoalId, goalForm);
    } else {
      monthlyGoalService.create(goalForm);
    }
    setGoals(monthlyGoalService.filterByMonth(monthLabel));
    setGoalForm(blankMonthlyGoal(monthLabel));
    setEditingGoalId(null);
    setGoalError("");
  };

  const updateGoalStatus = (goal: MonthlyGoal, status: MonthlyGoalStatus) => {
    monthlyGoalService.update(goal.id, { status });
    setGoals(monthlyGoalService.filterByMonth(monthLabel));
  };

  const archiveGoal = (id: string) => {
    monthlyGoalService.archive(id);
    setGoals(monthlyGoalService.filterByMonth(monthLabel));
  };

  const trend = buildReportTrend(monthlyReports);

  return (
    <div className="page-stack monthly-health-page">
      <header className="page-header no-print">
        <div>
          <span className="eyebrow">P10 Monthly Health</span>
          <h1>ط¯ط§ط´ط¨ظˆط±ط¯ ط³ظ„ط§ظ…طھ ظ…ط¯غŒط±غŒطھغŒ ظ…ط§ظ‡ط§ظ†ظ‡</h1>
          <p>ظˆط¶ط¹غŒطھ ظ…ط§ظ‡طŒ ط±ظˆظ†ط¯ ع©ظ†طھط±ظ„طŒ ط±غŒط³ع©â€Œظ‡ط§غŒ طھع©ط±ط§ط±ط´ظˆظ†ط¯ظ‡ ظˆ ظ‡ط¯ظپâ€Œظ‡ط§غŒ ظ…ط§ظ‡ ط¨ط¹ط¯ ط±ط§ غŒع©â€Œط¬ط§ ط¨ط¨غŒظ†.</p>
        </div>
        <div className="hero-actions">
          <a className="ghost-button" href="/organization/workforce-dashboard/report-archive">ط¢ط±ط´غŒظˆ ع¯ط²ط§ط±ط´â€Œظ‡ط§</a>
          <button className="primary-button" type="button" onClick={() => window.print()}>ع†ط§ظ¾ ع¯ط²ط§ط±ط´ ظ…ط§ظ‡ط§ظ†ظ‡</button>
        </div>
      </header>

      <section className="filter-bar no-print">
        <Filter size={16} />
        <select value={monthLabel} onChange={(event) => setMonthLabel(event.target.value)}>
          {monthOptions.map((option) => <option value={option} key={option}>{option === "all" ? "ظ‡ظ…ظ‡ ع¯ط²ط§ط±ط´â€Œظ‡ط§" : option}</option>)}
        </select>
      </section>

      <section className="report-title">
        <div>
          <span className="eyebrow">ط®ظ„ط§طµظ‡ ط³ظ„ط§ظ…طھ ظ…ط§ظ‡</span>
          <h1>{dashboard.monthLabel}</h1>
          <p>{dashboard.managementSummary}</p>
        </div>
        <StatusBadge tone={healthTone(dashboard.healthLevel)}>{healthLevelLabel(dashboard.healthLevel)}</StatusBadge>
      </section>

      <section className="kpi-strip">
        <article className="kpi-card tone-info"><div><p>ع¯ط²ط§ط±ط´â€Œظ‡ط§غŒ ظ…ط§ظ‡</p><strong>{toPersianNumber(dashboard.reportIds.length)}</strong><span>ظ…ظ†ط¨ط¹ طھط­ظ„غŒظ„</span></div></article>
        <article className={`kpi-card tone-${healthTone(dashboard.healthLevel)}`}><div><p>ط³ظ„ط§ظ…طھ</p><strong>{healthLevelLabel(dashboard.healthLevel)}</strong><span>{trendStatusLabel(dashboard.trendStatus)}</span></div></article>
        <article className="kpi-card tone-good"><div><p>ظ…غŒط§ظ†ع¯غŒظ† ع©ظ†طھط±ظ„</p><strong>{toPersianNumber(dashboard.averageControlScore)}</strong><span>ط¨ظ‡طھط±غŒظ†: {dashboard.bestWeekLabel}</span></div></article>
        <article className="kpi-card tone-warn"><div><p>ظ…غŒط§ظ†ع¯غŒظ† ط±غŒط³ع©</p><strong>{toPersianNumber(dashboard.averageRiskScore)}</strong><span>ط¨ط¯طھط±غŒظ†: {dashboard.worstWeekLabel}</span></div></article>
        <article className="kpi-card tone-critical"><div><p>ط±غŒط³ع© طھع©ط±ط§ط±غŒ</p><strong>{toPersianNumber(dashboard.repeatedRiskCount)}</strong><span>{dashboard.topRecurringRisks[0] ?? "ظ…ظˆط±ط¯ ظ…ظ‡ظ…غŒ ظ†غŒط³طھ"}</span></div></article>
      </section>

      <section className="panel no-print">
        <div className="section-head">
          <h2>ظ‡ط´ط¯ط§ط±ظ‡ط§غŒ ظ¾غŒط´ع¯غŒط±ط§ظ†ظ‡</h2>
          <a className="ghost-button" href="/organization/workforce-dashboard/preventive-alerts">ظ…ط´ط§ظ‡ط¯ظ‡ ظ‡ط´ط¯ط§ط±ظ‡ط§</a>
        </div>
        <div className="finding-meta">
          <span>ط¨ط§ط²: {toPersianNumber(openPreventiveAlerts.length)}</span>
          <span>ظپظˆط±غŒ/بالا: {toPersianNumber(preventiveAlerts.filter((alert) => alert.priority === "urgent" || alert.priority === "high").length)}</span>
          <span>ظ…ظ‡ظ…â€Œطھط±غŒظ†: {topPreventiveAlert?.title ?? "ط«ط¨طھ ظ†ط´ط¯ظ‡"}</span>
          <span>ط§ظ‚ط¯ط§ظ…: {topPreventiveAlert?.recommendedAction ?? "ظپط¹ظ„ط§ظ‹ ط§ظ‚ط¯ط§ظ…غŒ ظ„ط§ط²ظ… ظ†غŒط³طھ"}</span>
        </div>
      </section>

      <section className="archive-layout">
        <section className="panel comparison-panel">
          <h2>ط±ظˆظ†ط¯ ع©ظ†طھط±ظ„ ظˆ ط±غŒط³ع©</h2>
          <div className="trend-bars">
            {trend.map((point) => (
              <div className="trend-row" key={point.reportId}>
                <span>{point.weekLabel}</span>
                <div className="mini-meter"><span style={{ width: miniBarWidth(point.controlScoreAfter) }} /></div>
                <strong>{toPersianNumber(point.controlScoreAfter)}</strong>
              </div>
            ))}
            {!trend.length && <p>ع¯ط²ط§ط±ط´غŒ ط¨ط±ط§غŒ ط§غŒظ† ظ…ط§ظ‡ ط«ط¨طھ ظ†ط´ط¯ظ‡ ط§ط³طھ.</p>}
          </div>
          <div className="evidence-box">
            <span>{dashboard.nextMonthFocus}</span>
            <small>ظ‚ظˆغŒâ€Œطھط±غŒظ† ط­ظˆط²ظ‡: {dashboard.strongestArea} | ط¶ط¹غŒظپâ€Œطھط±غŒظ† ط­ظˆط²ظ‡: {dashboard.weakestArea}</small>
          </div>
        </section>

        <section className="panel">
          <h2>ظ‡ط´ط¯ط§ط± ط±غŒط³ع© طھع©ط±ط§ط±ط´ظˆظ†ط¯ظ‡</h2>
          <div className="analysis-list">
            {dashboard.topRecurringRisks.map((risk, index) => (
              <article className={`panel-row tone-${index >= 2 ? "critical" : "warn"}`} key={risk}>
                <StatusBadge tone={index >= 2 ? "critical" : "warn"}>{index >= 2 ? "critical" : "warning"}</StatusBadge>
                <p>{risk}</p>
                <small>{index >= 2 ? "ط¯ط± ع†ظ†ط¯ ع¯ط²ط§ط±ط´ طھع©ط±ط§ط± ط´ط¯ظ‡ ظˆ ظ†غŒط§ط²ظ…ظ†ط¯ ط§ظ‚ط¯ط§ظ… ظپظˆط±غŒ ط§ط³طھ." : "ط¯ط± ط­ط¯ط§ظ‚ظ„ ط¯ظˆ ع¯ط²ط§ط±ط´ ط§ط®غŒط± ط¯غŒط¯ظ‡ ط´ط¯ظ‡ ط§ط³طھ."}</small>
              </article>
            ))}
            {!dashboard.topRecurringRisks.length && <p>ط±غŒط³ع© طھع©ط±ط§ط±ط´ظˆظ†ط¯ظ‡ ظ…ظ‡ظ…غŒ ط¯غŒط¯ظ‡ ظ†ط´ط¯.</p>}
          </div>
        </section>
      </section>

      <section className="bottom-grid">
        <section className="panel wide-panel">
          <h2>ظ‡ط¯ظپâ€Œظ‡ط§غŒ ظ…ط§ظ‡ ط¨ط¹ط¯</h2>
          <div className="goal-list">
            {goals.map((goal) => (
              <article className="goal-card" key={goal.id}>
                <div>
                  <StatusBadge tone={goal.status === "achieved" ? "good" : goal.status === "missed" ? "critical" : "info"}>{goalStatusLabel(goal.status)}</StatusBadge>
                  <strong>{goal.title}</strong>
                  <p>{goal.description}</p>
                </div>
                <div className="mini-meter"><span style={{ width: miniBarWidth(goal.currentValue, goal.targetValue) }} /></div>
                <small>{goal.targetMetric}: {toPersianNumber(goal.currentValue)} / {toPersianNumber(goal.targetValue)}</small>
                <div className="recommendation-row no-print">
                  <button type="button" onClick={() => { setGoalForm(goal); setEditingGoalId(goal.id); }}>ظˆغŒط±ط§غŒط´</button>
                  <select value={goal.status} onChange={(event) => updateGoalStatus(goal, event.target.value as MonthlyGoalStatus)}>
                    <option value="planned">ط¨ط±ظ†ط§ظ…ظ‡â€Œط±غŒط²غŒ</option>
                    <option value="in_progress">ط¯ط± ط­ط§ظ„ ط§ط¬ط±ط§</option>
                    <option value="achieved">ظ…ط­ظ‚ظ‚ ط´ط¯ظ‡</option>
                    <option value="missed">ظ†ط§ظ…ظˆظپظ‚</option>
                  </select>
                  <button className="danger-button" type="button" onClick={() => archiveGoal(goal.id)}>ط¨ط§غŒع¯ط§ظ†غŒ</button>
                </div>
              </article>
            ))}
            {!goals.length && <p>ط¨ط±ط§غŒ ط§غŒظ† ظ…ط§ظ‡ ظ‡ظ†ظˆط² ظ‡ط¯ظپغŒ ط«ط¨طھ ظ†ط´ط¯ظ‡ ط§ط³طھ.</p>}
          </div>
        </section>

        <section className="panel no-print">
          <h2>{editingGoalId ? "ظˆغŒط±ط§غŒط´ ظ‡ط¯ظپ ظ…ط§ظ‡ط§ظ†ظ‡" : "ط§ظپط²ظˆط¯ظ† ظ‡ط¯ظپ ظ…ط§ظ‡ط§ظ†ظ‡"}</h2>
          {goalError && <p className="form-error">{goalError}</p>}
          <div className="field-grid">
            <TextField label="ط¹ظ†ظˆط§ظ† ظ‡ط¯ظپ" value={goalForm.title} onChange={(title) => setGoalForm({ ...goalForm, title })} />
            <TextField label="ط´ط§ط®طµ ظ‡ط¯ظپ" value={goalForm.targetMetric} onChange={(targetMetric) => setGoalForm({ ...goalForm, targetMetric })} />
            <TextField label="ظ…ظ‚ط¯ط§ط± ظ‡ط¯ظپ" type="number" value={goalForm.targetValue} onChange={(targetValue) => setGoalForm({ ...goalForm, targetValue: Number(targetValue) })} />
            <TextField label="ظ…ظ‚ط¯ط§ط± ظپط¹ظ„غŒ" type="number" value={goalForm.currentValue} onChange={(currentValue) => setGoalForm({ ...goalForm, currentValue: Number(currentValue) })} />
            <SelectField label="ظˆط¶ط¹غŒطھ" value={goalForm.status} options={[
              { label: "ط¨ط±ظ†ط§ظ…ظ‡â€Œط±غŒط²غŒ", value: "planned" },
              { label: "ط¯ط± ط­ط§ظ„ ط§ط¬ط±ط§", value: "in_progress" },
              { label: "ظ…ط­ظ‚ظ‚ ط´ط¯ظ‡", value: "achieved" },
              { label: "ظ†ط§ظ…ظˆظپظ‚", value: "missed" },
            ]} onChange={(status) => setGoalForm({ ...goalForm, status: status as MonthlyGoalStatus })} />
            <TextAreaField label="طھظˆط¶غŒط­" value={goalForm.description} onChange={(description) => setGoalForm({ ...goalForm, description })} />
          </div>
          <div className="form-actions">
            <button className="primary-button" type="button" onClick={saveGoal}>ط°ط®غŒط±ظ‡ ظ‡ط¯ظپ</button>
            <button className="ghost-button" type="button" onClick={() => { setGoalForm(blankMonthlyGoal(monthLabel)); setEditingGoalId(null); }}>ط§ظ†طµط±ط§ظپ</button>
          </div>
        </section>
      </section>

      <section className="panel">
        <h2>ط¬ظ…ط¹â€Œط¨ظ†ط¯غŒ ظ…ط¯غŒط±غŒطھغŒ</h2>
        <div className="evidence-box">
          <span>{dashboard.managementSummary}</span>
          <small>{dashboard.nextMonthFocus}</small>
        </div>
      </section>
    </div>
  );
}

function nextMonthLabel() {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function PreventiveAlertsPage() {
  const [severity, setSeverity] = useState("");
  const [priority, setPriority] = useState("");
  const [sourceType, setSourceType] = useState("");
  const [status, setStatus] = useState("");
  const [refreshToken, setRefreshToken] = useState(0);
  const reports = decisionReportService.list(true);
  const monthlyHealth = buildMonthlyHealthDashboard(reports);
  const goals = monthlyGoalService.list(true);
  const alerts = preventiveAlertStateService.applyStates(buildPreventiveAlerts({ reports, monthlyHealth, monthlyGoals: goals }));
  const filteredAlerts = alerts
    .filter((alert) => !severity || alert.severity === severity)
    .filter((alert) => !priority || alert.priority === priority)
    .filter((alert) => !sourceType || alert.sourceType === sourceType)
    .filter((alert) => !status || alert.status === status);
  void refreshToken;

  const updateAlertStatus = (alert: PreventiveAlert, nextStatus: PreventiveAlertStatus) => {
    preventiveAlertStateService.updateStatus(preventiveAlertKey(alert), nextStatus);
    setRefreshToken((value) => value + 1);
  };

  const createGoalFromAlert = (alert: PreventiveAlert) => {
    const ok = window.confirm("ط¨ط±ط§غŒ ط§غŒظ† ظ‡ط´ط¯ط§ط±طŒ ظ‡ط¯ظپ ظ¾غŒط´ظ†ظ‡ط§ط¯غŒ ظ…ط§ظ‡ ط¨ط¹ط¯ ط³ط§ط®طھظ‡ ط´ظˆط¯طں");
    if (!ok) return;
    monthlyGoalService.create({
      monthLabel: nextMonthLabel(),
      title: alert.sourceType === "failed_goal" ? `ط¨ط§ط²ط·ط±ط§ط­غŒ ظ‡ط¯ظپ: ${alert.affectedArea}` : `ع©ط§ظ‡ط´ ط±غŒط³ع© طھع©ط±ط§ط±غŒ: ${alert.affectedArea}`,
      description: "ط§غŒظ† ظ‡ط¯ظپ ط§ط² ظ‡ط´ط¯ط§ط± ظ¾غŒط´ع¯غŒط±ط§ظ†ظ‡ ط³ط§ط®طھظ‡ ط´ط¯ظ‡ ط§ط³طھ.",
      targetMetric: alert.sourceType === "failed_goal" ? "monthly_goal_success" : "recurring_risk_count",
      targetValue: Math.max(0, alert.repeatedCount - 1),
      currentValue: alert.repeatedCount,
      status: "planned",
    });
    updateAlertStatus(alert, "planned");
  };

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <span className="eyebrow">P11 Preventive Alerts</span>
          <h1>ظ‡ط´ط¯ط§ط±ظ‡ط§غŒ ظ¾غŒط´ع¯غŒط±ط§ظ†ظ‡ ظ…ط§ظ‡ط§ظ†ظ‡</h1>
          <p>ط±غŒط³ع©â€Œظ‡ط§غŒ طھع©ط±ط§ط±غŒطŒ ظ‡ط¯ظپâ€Œظ‡ط§غŒ ظ†ط§ظ…ظˆظپظ‚ ظˆ ط±ظˆظ†ط¯ظ‡ط§غŒ ظ†ط²ظˆظ„غŒ ط±ط§ ظ‚ط¨ظ„ ط§ط² ط¨ط­ط±ط§ظ†غŒ ط´ط¯ظ† ط¨ط¨غŒظ†.</p>
        </div>
        <div className="hero-actions">
          <a className="ghost-button" href="/organization/workforce-dashboard/monthly-health">ط³ظ„ط§ظ…طھ ظ…ط§ظ‡ط§ظ†ظ‡</a>
          <a className="ghost-button" href="/organization/workforce-dashboard/report-archive">ط¢ط±ط´غŒظˆ ع¯ط²ط§ط±ط´â€Œظ‡ط§</a>
        </div>
      </header>

      <section className="kpi-strip">
        <article className="kpi-card tone-info"><div><p>ع©ظ„ ظ‡ط´ط¯ط§ط±ظ‡ط§</p><strong>{toPersianNumber(alerts.length)}</strong><span>ظ…ط­ط§ط³ط¨ظ‡â€Œط´ط¯ظ‡ ط§ط² ع¯ط²ط§ط±ط´â€Œظ‡ط§</span></div></article>
        <article className="kpi-card tone-critical"><div><p>ط¨ط­ط±ط§ظ†غŒ</p><strong>{toPersianNumber(alerts.filter((alert) => alert.severity === "critical").length)}</strong><span>ظ†غŒط§ط²ظ…ظ†ط¯ ط§ظ‚ط¯ط§ظ… ظپظˆط±غŒ</span></div></article>
        <article className="kpi-card tone-warn"><div><p>ط§ظˆظ„ظˆغŒطھ بالا</p><strong>{toPersianNumber(alerts.filter((alert) => alert.priority === "urgent" || alert.priority === "high").length)}</strong><span>urgent/high</span></div></article>
        <article className="kpi-card tone-good"><div><p>ط¨ط§ط²</p><strong>{toPersianNumber(alerts.filter((alert) => alert.status === "open").length)}</strong><span>ظ‡ظ†ظˆط² طھطµظ…غŒظ… ظ†ع¯ط±ظپطھظ‡</span></div></article>
        <article className="kpi-card tone-focus"><div><p>ظ‡ط¯ظپ ظ†ط§ظ…ظˆظپظ‚</p><strong>{toPersianNumber(alerts.filter((alert) => alert.sourceType === "failed_goal").length)}</strong><span>ظ‚ط§ط¨ظ„ طھط¨ط¯غŒظ„ ط¨ظ‡ ظ‡ط¯ظپ</span></div></article>
      </section>

      <section className="filter-bar">
        <Filter size={16} />
        <select value={severity} onChange={(event) => setSeverity(event.target.value)}>
          <option value="">ظ‡ظ…ظ‡ ط´ط¯طھâ€Œظ‡ط§</option>
          <option value="info">info</option>
          <option value="warning">warning</option>
          <option value="critical">critical</option>
        </select>
        <select value={priority} onChange={(event) => setPriority(event.target.value)}>
          <option value="">ظ‡ظ…ظ‡ ط§ظˆظ„ظˆغŒطھâ€Œظ‡ط§</option>
          <option value="low">low</option>
          <option value="medium">medium</option>
          <option value="high">high</option>
          <option value="urgent">urgent</option>
        </select>
        <select value={sourceType} onChange={(event) => setSourceType(event.target.value)}>
          <option value="">ظ‡ظ…ظ‡ ظ…ظ†ط§ط¨ط¹</option>
          {(["recurring_risk", "failed_goal", "worsening_trend", "repeated_space_pressure", "repeated_focus_interruption", "repeated_sales_coverage_gap"] as PreventiveAlertSourceType[]).map((item) => (
            <option value={item} key={item}>{preventiveSourceLabel(item)}</option>
          ))}
        </select>
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">ظ‡ظ…ظ‡ ظˆط¶ط¹غŒطھâ€Œظ‡ط§</option>
          {(["open", "acknowledged", "planned", "resolved", "dismissed"] as PreventiveAlertStatus[]).map((item) => (
            <option value={item} key={item}>{preventiveStatusLabel(item)}</option>
          ))}
        </select>
      </section>

      <section className="analysis-card-grid">
        {filteredAlerts.map((alert) => (
          <article className={`analysis-card tone-${preventiveSeverityTone(alert.severity)}`} key={preventiveAlertKey(alert)}>
            <div className="analysis-card-head">
              <StatusBadge tone={preventiveSeverityTone(alert.severity)}>{alert.severity}</StatusBadge>
              <StatusBadge tone={preventivePriorityTone(alert.priority)}>{alert.priority}</StatusBadge>
              <StatusBadge tone="info">{preventiveSourceLabel(alert.sourceType)}</StatusBadge>
              <StatusBadge tone={alert.status === "open" ? "warn" : "good"}>{preventiveStatusLabel(alert.status)}</StatusBadge>
            </div>
            <h2>{alert.title}</h2>
            <p>{alert.description}</p>
            <div className="finding-meta">
              <span>طھع©ط±ط§ط±: {toPersianNumber(alert.repeatedCount)}</span>
              <span>ط§ظˆظ„غŒظ† ظ…ط´ط§ظ‡ط¯ظ‡: {alert.firstSeenLabel}</span>
              <span>ط¢ط®ط±غŒظ† ظ…ط´ط§ظ‡ط¯ظ‡: {alert.lastSeenLabel}</span>
              <span>ط­ظˆط²ظ‡: {alert.affectedArea}</span>
            </div>
            <div className="evidence-box">
              <span>{alert.recommendedAction}</span>
              <small>{alert.relatedRiskTitles.join("طŒ ") || "ط¨ط¯ظˆظ† risk title ظ…ط³طھظ‚غŒظ…"}</small>
            </div>
            <div className="recommendation-row">
              <button className="ghost-button" type="button" onClick={() => updateAlertStatus(alert, "acknowledged")}>طھط§غŒغŒط¯ ط´ط¯</button>
              <button className="ghost-button" type="button" onClick={() => updateAlertStatus(alert, "planned")}>ط¨ط±ظ†ط§ظ…ظ‡â€Œط±غŒط²غŒ ط´ط¯</button>
              <button className="ghost-button" type="button" onClick={() => updateAlertStatus(alert, "resolved")}>ط­ظ„ ط´ط¯</button>
              <button className="danger-button" type="button" onClick={() => updateAlertStatus(alert, "dismissed")}>ط±ط¯ ط´ط¯</button>
              {(alert.sourceType === "failed_goal" || alert.sourceType === "recurring_risk" || alert.sourceType.startsWith("repeated_")) && (
                <button className="primary-button" type="button" onClick={() => createGoalFromAlert(alert)}>ط³ط§ط®طھ ظ‡ط¯ظپ ظ¾غŒط´ظ†ظ‡ط§ط¯غŒ</button>
              )}
            </div>
          </article>
        ))}
        {!filteredAlerts.length && <section className="panel"><h2>ظ‡ط´ط¯ط§ط±غŒ ظ¾غŒط¯ط§ ظ†ط´ط¯</h2><p>ظپغŒظ„طھط±ظ‡ط§ ط±ط§ طھط؛غŒغŒط± ط¨ط¯ظ‡ غŒط§ ع¯ط²ط§ط±ط´â€Œظ‡ط§غŒ ط¨غŒط´طھط±غŒ ط¨ط³ط§ط².</p></section>}
      </section>
    </div>
  );
}

function ReadinessPage({
  spaces,
  employees,
  taskTypes,
  scheduleItems,
  rules,
  settings,
}: {
  spaces: Space[];
  employees: Employee[];
  taskTypes: TaskType[];
  scheduleItems: WeeklyScheduleItem[];
  rules: AnalysisRule[];
  settings: AnalysisSettings;
}) {
  const [refreshToken, setRefreshToken] = useState(0);
  const reports = decisionReportService.list(true);
  const monthlyHealth = buildMonthlyHealthDashboard(reports);
  const monthlyGoals = monthlyGoalService.list(true);
  const preventiveAlerts = preventiveAlertStateService.applyStates(buildPreventiveAlerts({ reports, monthlyHealth, monthlyGoals }));
  const maintenanceReport = workforceMaintenanceService.runReport(preventiveAlerts.map(preventiveAlertKey));
  const snapshots = workforceBackupService.listSnapshots();
  void refreshToken;

  const readiness = buildOperationalReadinessReport({
    spaces,
    employees,
    taskTypes,
    scheduleItems,
    rules,
    settings,
    snapshots,
    maintenanceReport,
    decisionReports: reports,
    monthlyGoals,
    preventiveAlerts,
  });
  const failedChecks = readiness.checks.filter((item) => !item.passed);
  const categories = Array.from(new Set(readiness.checks.map((item) => item.category)));

  const createStartSnapshot = () => {
    workforceBackupService.createSnapshot("Snapshot ط´ط±ظˆط¹ ط¢ظ…ط§ط¯ع¯غŒ ط¹ظ…ظ„غŒط§طھغŒ", "operational_readiness_start", "ظ‚ط¨ظ„ ط§ط² ط´ط±ظˆط¹ ط§ط³طھظپط§ط¯ظ‡ ط¹ظ…ظ„غŒط§طھغŒ ظ…ط§عکظˆظ„ ط³ط§ط®طھظ‡ ط´ط¯.", false);
    setRefreshToken((value) => value + 1);
  };

  const buildLaunchChecklist = () => {
    launchChecklistService.rebuild(readiness);
    window.location.href = "/organization/workforce-dashboard/launch-checklist";
  };

  const existingChecklistCount = launchChecklistService.list().items.length;

  const checkTone = (item: ReadinessCheck): StatusTone => item.passed ? "good" : severityTone(item.severity);

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <span className="eyebrow">P14 Operational Readiness</span>
          <h1>ع†ع©â€Œظ„غŒط³طھ ط¢ظ…ط§ط¯ع¯غŒ ط¹ظ…ظ„غŒط§طھغŒ</h1>
          <p>غŒع© ظ†ظ…ط§غŒ ط§ط¬ط±ط§غŒغŒ ط¨ط±ط§غŒ ط§غŒظ†ع©ظ‡ ظ‚ط¨ظ„ ط§ط² ط§ط³طھظپط§ط¯ظ‡ ط¬ط¯غŒطŒ ط¯ط§ط¯ظ‡â€Œظ‡ط§طŒ ظ‚ظˆط§ظ†غŒظ†طŒ ط¨ع©ط§ظ¾طŒ ظ†ع¯ظ‡ط¯ط§ط±غŒ ظˆ ط¬ط±غŒط§ظ† طھطµظ…غŒظ…â€Œع¯غŒط±غŒ ط¢ظ…ط§ط¯ظ‡ ط¨ط§ط´ظ†ط¯.</p>
        </div>
        <div className="hero-actions">
          <a className="ghost-button" href="/organization/workforce-dashboard">ط§طھط§ظ‚ ظپط±ظ…ط§ظ†</a>
          <a className="ghost-button" href="/organization/workforce-dashboard/data-center">ظ…ط±ع©ط² ط¯ط§ط¯ظ‡</a>
          <a className="ghost-button" href="/organization/workforce-dashboard/maintenance">ظ†ع¯ظ‡ط¯ط§ط±غŒ</a>
          {existingChecklistCount > 0 && <a className="ghost-button" href="/organization/workforce-dashboard/launch-checklist">ط§ط¯ط§ظ…ظ‡ ع†ع©â€Œظ„غŒط³طھ ط§ط¬ط±ط§غŒغŒ</a>}
          <a className={readiness.score >= 70 ? "primary-button" : "ghost-button tone-warn"} href="/organization/workforce-dashboard/launch-signoff">ط±ظپطھظ† ط¨ظ‡ طھط£غŒغŒط¯ ط±ط§ظ‡â€Œط§ظ†ط¯ط§ط²غŒ</a>
          <button className="primary-button" type="button" onClick={buildLaunchChecklist}>ط³ط§ط®طھ ع†ع©â€Œظ„غŒط³طھ ط§ط¬ط±ط§غŒغŒ</button>
          <button className="primary-button" type="button" onClick={createStartSnapshot}>ط³ط§ط®طھ snapshot ط´ط±ظˆط¹</button>
        </div>
      </header>

      <section className="kpi-strip">
        <article className={`kpi-card tone-${readinessStatusTone(readiness.status)}`}>
          <div><p>ط§ظ…طھغŒط§ط² ط¢ظ…ط§ط¯ع¯غŒ</p><strong>{toPersianNumber(readiness.score)}</strong><span>{readinessStatusLabel(readiness.status)}</span></div>
        </article>
        <article className="kpi-card tone-good">
          <div><p>ع†ع©â€Œظ‡ط§غŒ ظ¾ط§ط³â€Œط´ط¯ظ‡</p><strong>{toPersianNumber(readiness.passedCount)}</strong><span>ط§ط² {toPersianNumber(readiness.checks.length)} ع†ع©</span></div>
        </article>
        <article className="kpi-card tone-critical">
          <div><p>ط¨ط­ط±ط§ظ†غŒ</p><strong>{toPersianNumber(readiness.criticalCount)}</strong><span>ظ…ط§ظ†ط¹ ط´ط±ظˆط¹ ط§ظ…ظ†</span></div>
        </article>
        <article className="kpi-card tone-warn">
          <div><p>ظ‡ط´ط¯ط§ط±</p><strong>{toPersianNumber(readiness.warningCount)}</strong><span>ظ†غŒط§ط²ظ…ظ†ط¯ ظ¾غŒع¯غŒط±غŒ</span></div>
        </article>
        <article className="kpi-card tone-focus">
          <div><p>Snapshotظ‡ط§</p><strong>{toPersianNumber(snapshots.length)}</strong><span>ط¨ط±ط§غŒ ط¨ط§ط²ع¯ط´طھ ط³ط±غŒط¹</span></div>
        </article>
      </section>

      <section className="bottom-grid">
        <section className="panel wide-panel">
          <div className="section-head">
            <h2>ظˆط¶ط¹غŒطھ ع©ظ„غŒ</h2>
            <StatusBadge tone={readinessStatusTone(readiness.status)}>{readinessStatusLabel(readiness.status)}</StatusBadge>
          </div>
          <p>{readiness.summary}</p>
          {readiness.score < 85 && <p className="inline-notice">ط¨ط±ط§غŒ طھط¨ط¯غŒظ„ ظ…ظˆط§ط±ط¯ ط¨ط§ط² ط¨ظ‡ ظ‚ط¯ظ…â€Œظ‡ط§غŒ ع©ظˆطھط§ظ‡ ظˆ ظ‚ط§ط¨ظ„ ظ¾غŒع¯غŒط±غŒطŒ ط§ط² ع†ع©â€Œظ„غŒط³طھ ط§ط¬ط±ط§غŒغŒ ط§ط³طھظپط§ط¯ظ‡ ع©ظ†غŒط¯.</p>}
          <div className="mini-meter readiness-meter"><span style={{ width: `${readiness.score}%` }} /></div>
          <div className="finding-meta">
            <span>ط¢ط®ط±غŒظ† ظ…ط­ط§ط³ط¨ظ‡: {toPersianNumber(new Date(readiness.generatedAt).toLocaleString("fa-IR"))}</span>
            <span>ط§ظ‚ط¯ط§ظ…â€Œظ‡ط§غŒ ط¨ط§ط²: {toPersianNumber(failedChecks.length)}</span>
            <span>ط³ظ„ط§ظ…طھ ط¯ط§ط¯ظ‡: {maintenanceHealthLabel(maintenanceReport.healthStatus)}</span>
          </div>
        </section>

        <section className="panel">
          <h2>ط§ظ‚ط¯ط§ظ…â€Œظ‡ط§غŒ ط§ظˆظ„ظˆغŒطھâ€Œط¯ط§ط±</h2>
          <div className="analysis-list">
            {readiness.topActions.map((item) => (
              <article className={`panel-row tone-${checkTone(item)}`} key={item.id}>
                <StatusBadge tone={checkTone(item)}>{item.severity}</StatusBadge>
                <p>{item.title}</p>
                <a className="ghost-button" href={item.actionPath}>{item.actionLabel}</a>
              </article>
            ))}
            {!readiness.topActions.length && <p>ط§ظ‚ط¯ط§ظ… ظپظˆط±غŒ ط¨ط§ظ‚غŒ ظ†ظ…ط§ظ†ط¯ظ‡ ط§ط³طھ.</p>}
          </div>
        </section>
      </section>

      <section className="analysis-card-grid">
        {categories.map((category) => {
          const categoryChecks = readiness.checks.filter((item) => item.category === category);
          const categoryPassed = categoryChecks.filter((item) => item.passed).length;
          const categoryScore = Math.round((categoryPassed / Math.max(categoryChecks.length, 1)) * 100);
          return (
            <section className="panel" key={category}>
              <div className="section-head">
                <h2>{readinessCategoryLabel(category)}</h2>
                <StatusBadge tone={categoryScore === 100 ? "good" : categoryScore >= 60 ? "warn" : "critical"}>{toPersianNumber(categoryScore)}ظھ</StatusBadge>
              </div>
              <div className="mini-meter readiness-meter"><span style={{ width: `${categoryScore}%` }} /></div>
              <div className="analysis-list">
                {categoryChecks.map((item) => (
                  <article className={`panel-row tone-${checkTone(item)}`} key={item.id}>
                    <StatusBadge tone={checkTone(item)}>{item.passed ? "ط¢ظ…ط§ط¯ظ‡" : item.severity}</StatusBadge>
                    <p>{item.title}</p>
                    <small>{item.evidence}</small>
                    {!item.passed && <a className="ghost-button" href={item.actionPath}>{item.actionLabel}</a>}
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </section>
    </div>
  );
}

function LaunchChecklistPage({
  spaces,
  employees,
  taskTypes,
  scheduleItems,
  rules,
  settings,
}: {
  spaces: Space[];
  employees: Employee[];
  taskTypes: TaskType[];
  scheduleItems: WeeklyScheduleItem[];
  rules: AnalysisRule[];
  settings: AnalysisSettings;
}) {
  const [refreshToken, setRefreshToken] = useState(0);
  const [statusFilter, setStatusFilter] = useState<LaunchChecklistStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<ReadinessCheckCategory | "all">("all");
  const [dismissingId, setDismissingId] = useState<string>();
  const [managerNote, setManagerNote] = useState("");
  const [message, setMessage] = useState("");
  void refreshToken;

  const reports = decisionReportService.list(true);
  const monthlyGoals = monthlyGoalService.list(true);
  const monthlyHealth = buildMonthlyHealthDashboard(reports);
  const preventiveAlerts = preventiveAlertStateService.applyStates(buildPreventiveAlerts({ reports, monthlyHealth, monthlyGoals }));
  const maintenanceReport = workforceMaintenanceService.runReport(preventiveAlerts.map(preventiveAlertKey));
  const readiness = buildOperationalReadinessReport({
    spaces,
    employees,
    taskTypes,
    scheduleItems,
    rules,
    settings,
    snapshots: workforceBackupService.listSnapshots(),
    maintenanceReport,
    decisionReports: reports,
    monthlyGoals,
    preventiveAlerts,
  });
  const report = launchChecklistService.list();
  const filteredItems = report.items.filter((item) =>
    (statusFilter === "all" || item.status === statusFilter) &&
    (categoryFilter === "all" || item.category === categoryFilter));
  const groupedItems = groupChecklistByCategory(filteredItems);
  const categories = Array.from(new Set(report.items.map((item) => item.category)));

  const refresh = (nextMessage = "") => {
    setMessage(nextMessage);
    setRefreshToken((value) => value + 1);
  };

  const rebuild = (reset = false) => {
    launchChecklistService.rebuild(readiness, reset);
    refresh(reset ? "ع†ع©â€Œظ„غŒط³طھ ط¨ط§ ظˆط¶ط¹غŒطھ طھط§ط²ظ‡ ط¨ط§ط²ط³ط§ط²غŒ ط´ط¯." : "ع†ع©â€Œظ„غŒط³طھ ط¨ظ‡â€Œط±ظˆط² ط´ط¯ ظˆ ظˆط¶ط¹غŒطھâ€Œظ‡ط§غŒ ظ‚ط§ط¨ظ„ ط­ظپط¸ ط¨ط§ظ‚غŒ ظ…ط§ظ†ط¯ظ†ط¯.");
  };

  const completeItem = (id: string) => {
    launchChecklistService.complete(id);
    refresh("ط§ظ‚ط¯ط§ظ… ط§ظ†ط¬ط§ظ…â€Œط´ط¯ظ‡ ط«ط¨طھ ط´ط¯.");
  };

  const dismissItem = (id: string) => {
    if (!managerNote.trim()) {
      setMessage("ط¨ط±ط§غŒ ط±ط¯ ط§ظ‚ط¯ط§ظ…طŒ ط¯ظ„غŒظ„ ع©ظˆطھط§ظ‡غŒ ط«ط¨طھ ع©ظ†غŒط¯.");
      return;
    }
    launchChecklistService.dismiss(id, managerNote);
    setDismissingId(undefined);
    setManagerNote("");
    refresh("ط§ظ‚ط¯ط§ظ… ط¨ط§ غŒط§ط¯ط¯ط§ط´طھ ظ…ط¯غŒط± ط±ط¯ ط´ط¯.");
  };

  const reopenItem = (id: string) => {
    launchChecklistService.reopen(id);
    refresh("ط§ظ‚ط¯ط§ظ… ط¯ظˆط¨ط§ط±ظ‡ ط¨ظ‡ ظپظ‡ط±ط³طھ ط¨ط§ط² ط¨ط±ع¯ط´طھ.");
  };

  const createLaunchSnapshot = () => {
    workforceBackupService.createSnapshot(
      "Snapshot ظ¾غŒط´ ط§ط² ط±ط§ظ‡â€Œط§ظ†ط¯ط§ط²غŒ",
      "launch_checklist_snapshot",
      "ظˆط¶ط¹غŒطھ ط¯ط§ط¯ظ‡â€Œظ‡ط§ ظˆ ع†ع©â€Œظ„غŒط³طھ ظ‚ط¨ظ„ ط§ط² ط´ط±ظˆط¹ ط±ط§ظ‡â€Œط§ظ†ط¯ط§ط²غŒ ط°ط®غŒط±ظ‡ ط´ط¯.",
      false,
    );
    refresh("Snapshot ظ¾غŒط´ ط§ط² ط±ط§ظ‡â€Œط§ظ†ط¯ط§ط²غŒ ط³ط§ط®طھظ‡ ط´ط¯.");
  };

  const itemCard = (item: LaunchChecklistItem) => (
    <article className={`launch-item tone-${item.status === "open" ? severityTone(item.severity) : launchStatusTone(item.status)}`} key={item.id}>
      <div className="section-head">
        <div className="badge-row">
          <StatusBadge tone={severityTone(item.severity)}>{severityLabel(item.severity)}</StatusBadge>
          <StatusBadge tone={launchStatusTone(item.status)}>{launchStatusLabel(item.status)}</StatusBadge>
        </div>
        <small>{readinessCategoryLabel(item.category)}</small>
      </div>
      <h3>{item.title}</h3>
      <p>{item.description}</p>
      {item.managerNote && <div className="manager-note">غŒط§ط¯ط¯ط§ط´طھ ظ…ط¯غŒط±: {item.managerNote}</div>}
      {dismissingId === item.id && (
        <div className="dismiss-panel">
          <input
            className="search-input"
            value={managerNote}
            onChange={(event) => setManagerNote(event.target.value)}
            placeholder="ط¯ظ„غŒظ„ ع©ظˆطھط§ظ‡ ط±ط¯ ط§ظ‚ط¯ط§ظ…"
            maxLength={180}
          />
          <button className="ghost-button tone-critical" type="button" onClick={() => dismissItem(item.id)}>ط«ط¨طھ ط±ط¯</button>
        </div>
      )}
      <div className="row-actions">
        <a className="ghost-button" href={item.actionPath}>{item.actionLabel || "ط±ظپطھظ† ط¨ظ‡ طµظپط­ظ‡ ط§ظ‚ط¯ط§ظ…"}</a>
        {item.status === "open" && (
          <>
            <button className="primary-button" type="button" onClick={() => completeItem(item.id)}><CheckCircle2 size={16} /> ط§ظ†ط¬ط§ظ… ط´ط¯</button>
            <button className="ghost-button" type="button" onClick={() => { setDismissingId(item.id); setManagerNote(""); }}><XCircle size={16} /> ط±ط¯ ط´ط¯</button>
          </>
        )}
        {item.status !== "open" && <button className="ghost-button" type="button" onClick={() => reopenItem(item.id)}><RotateCcw size={16} /> ط¨ط§ط² ع©ط±ط¯ظ† ط¯ظˆط¨ط§ط±ظ‡</button>}
      </div>
    </article>
  );

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <span className="eyebrow">P15 Launch Checklist</span>
          <h1>ع†ع©â€Œظ„غŒط³طھ ط§ط¬ط±ط§غŒغŒ ط±ط§ظ‡â€Œط§ظ†ط¯ط§ط²غŒ</h1>
          <p>ظ‚ط¯ظ… ط¨ط¹ط¯غŒ ظ…ط´ط®طµ ط§ط³طھط› ظ‡ط± ط§ظ‚ط¯ط§ظ… ط±ط§ ط§ظ†ط¬ط§ظ… ط¯ظ‡غŒط¯طŒ ط±ط¯ ع©ظ†غŒط¯ غŒط§ ظ…ط³طھظ‚غŒظ… ط¨ظ‡ طµظپط­ظ‡ ظ…ط±ط¨ظˆط· ط¨ط±ظˆغŒط¯.</p>
        </div>
        <div className="hero-actions">
          <a className="ghost-button" href="/organization/workforce-dashboard/readiness">ط±ظپطھظ† ط¨ظ‡ ط¢ظ…ط§ط¯ع¯غŒ ط¹ظ…ظ„غŒط§طھغŒ</a>
          <a className={report.openCount ? "ghost-button tone-warn" : "primary-button"} href="/organization/workforce-dashboard/launch-signoff">طھط£غŒغŒط¯ ط±ط§ظ‡â€Œط§ظ†ط¯ط§ط²غŒ</a>
          <button className="ghost-button" type="button" onClick={createLaunchSnapshot}>ط³ط§ط®طھ snapshot ظ¾غŒط´ ط§ط² ط±ط§ظ‡â€Œط§ظ†ط¯ط§ط²غŒ</button>
          <button className="primary-button" type="button" onClick={() => rebuild(false)}><RotateCcw size={17} /> ط¨ط§ط²ط³ط§ط²غŒ ط§ط² ظˆط¶ط¹غŒطھ ظپط¹ظ„غŒ</button>
          <button className="ghost-button" type="button" onClick={() => rebuild(true)}>ط¨ط§ط²ط³ط§ط²غŒ ع©ط§ظ…ظ„</button>
        </div>
      </header>

      {message && <div className="inline-notice">{message}</div>}
      {report.openCount > 0 && <div className="inline-notice tone-warn">ظ‡ظ†ظˆط² {toPersianNumber(report.openCount)} ط§ظ‚ط¯ط§ظ… ط¨ط§ط² ط§ط³طھط› ط¯ط± ع¯ط²ط§ط±ط´ طھط£غŒغŒط¯ ظ¾ظ†ظ‡ط§ظ† ظ†ط®ظˆط§ظ‡ط¯ ط´ط¯.</div>}

      <section className="kpi-strip">
        <article className="kpi-card tone-focus"><div><p>ظ¾غŒط´ط±ظپطھ ط±ط§ظ‡â€Œط§ظ†ط¯ط§ط²غŒ</p><strong>{toPersianNumber(report.progressPercent)}ظھ</strong><span>ط¨ط± ظ¾ط§غŒظ‡ ط§ظ‚ط¯ط§ظ…â€Œظ‡ط§غŒ طھکمغŒظ„â€Œط´ط¯ظ‡</span></div></article>
        <article className="kpi-card tone-warn"><div><p>ط§ظ‚ط¯ط§ظ… ط¨ط§ط²</p><strong>{toPersianNumber(report.openCount)}</strong><span>ظ…ظ†طھط¸ط± ط§ظ‚ط¯ط§ظ… ظ…ط¯غŒط±</span></div></article>
        <article className="kpi-card tone-good"><div><p>طھکمغŒظ„â€Œط´ط¯ظ‡</p><strong>{toPersianNumber(report.completedCount)}</strong><span>ط«ط¨طھâ€Œط´ط¯ظ‡ ط¯ط± ظ‡ظ…غŒظ† ظ…ط±ظˆط±ع¯ط±</span></div></article>
        <article className="kpi-card tone-empty"><div><p>ط±ط¯ط´ط¯ظ‡</p><strong>{toPersianNumber(report.dismissedCount)}</strong><span>ط¯ط§ط±ط§غŒ طھطµظ…غŒظ… ظ…ط¯غŒط±غŒطھغŒ</span></div></article>
        <article className="kpi-card tone-critical"><div><p>ط¨ط­ط±ط§ظ†غŒ ط¨ط§ط²</p><strong>{toPersianNumber(report.criticalOpenCount)}</strong><span>ط§ظˆظ„ظˆغŒطھ ط´ط±ظˆط¹ ط§ظ…ظ†</span></div></article>
      </section>

      <section className="launch-overview">
        <section className="panel launch-progress-card">
          <div className="section-head"><h2>ظ…ط³غŒط± ط±ط§ظ‡â€Œط§ظ†ط¯ط§ط²غŒ</h2><StatusBadge tone={report.criticalOpenCount ? "critical" : report.openCount ? "warn" : "good"}>{toPersianNumber(report.progressPercent)}ظھ</StatusBadge></div>
          <div className="mini-meter readiness-meter"><span style={{ width: `${report.progressPercent}%` }} /></div>
          <p>{report.summary}</p>
        </section>
        <section className={`panel next-step-card tone-${report.nextBestStep ? severityTone(report.nextBestStep.severity) : "good"}`}>
          <span className="eyebrow">ظ‚ط¯ظ… ط¨ط¹ط¯غŒ ظ¾غŒط´ظ†ظ‡ط§ط¯غŒ</span>
          <h2>{report.nextBestStep?.title ?? "ط±ط§ظ‡â€Œط§ظ†ط¯ط§ط²غŒ ط¢ظ…ط§ط¯ظ‡ ط§ط³طھ"}</h2>
          <p>{report.nextBestStep?.description ?? "ط§ظ‚ط¯ط§ظ… ط¨ط§ط²غŒ ط¨ط§ظ‚غŒ ظ†ظ…ط§ظ†ط¯ظ‡ ط§ط³طھط› ظˆط¶ط¹غŒطھ readiness ط±ط§ غŒع©â€Œط¨ط§ط± ط¯غŒع¯ط± ط¨ط±ط±ط³غŒ ع©ظ†غŒط¯."}</p>
          {report.nextBestStep && <a className="primary-button" href={report.nextBestStep.actionPath}>{report.nextBestStep.actionLabel}</a>}
        </section>
      </section>

      <div className="filter-bar">
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as LaunchChecklistStatus | "all")} aria-label="ظپغŒظ„طھط± ظˆط¶ط¹غŒطھ">
          <option value="all">ظ‡ظ…ظ‡ ظˆط¶ط¹غŒطھâ€Œظ‡ط§</option>
          <option value="open">ط¨ط§ط²</option>
          <option value="completed">ط§ظ†ط¬ط§ظ…â€Œط´ط¯ظ‡</option>
          <option value="dismissed">ط±ط¯ط´ط¯ظ‡</option>
        </select>
        <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value as ReadinessCheckCategory | "all")} aria-label="ظپغŒظ„طھط± ط¯ط³طھظ‡">
          <option value="all">ظ‡ظ…ظ‡ ط¯ط³طھظ‡â€Œظ‡ط§</option>
          {categories.map((category) => <option key={category} value={category}>{readinessCategoryLabel(category)}</option>)}
        </select>
      </div>

      {!report.items.length && (
        <section className="panel empty-launch-state">
          <ClipboardCheck size={32} />
          <h2>ع†ع©â€Œظ„غŒط³طھ ظ‡ظ†ظˆط² ط³ط§ط®طھظ‡ ظ†ط´ط¯ظ‡ ط§ط³طھ</h2>
          <p>ظˆط¶ط¹غŒطھ ظپط¹ظ„غŒ readiness ط±ط§ ط¨ظ‡ ظ‚ط¯ظ…â€Œظ‡ط§غŒ ط§ط¬ط±ط§غŒغŒ طھط¨ط¯غŒظ„ ع©ظ†غŒط¯.</p>
          <button className="primary-button" type="button" onClick={() => rebuild(false)}>ط³ط§ط®طھ ع†ع©â€Œظ„غŒط³طھ ط§ط¬ط±ط§غŒغŒ</button>
        </section>
      )}

      <section className="launch-category-list">
        {Object.entries(groupedItems).map(([category, items]) => (
          <section className="panel" key={category}>
            <div className="section-head">
              <h2>{readinessCategoryLabel(category as ReadinessCheckCategory)}</h2>
              <StatusBadge tone="info">{toPersianNumber(items.length)} ط§ظ‚ط¯ط§ظ…</StatusBadge>
            </div>
            <div className="launch-items-grid">{items.map(itemCard)}</div>
          </section>
        ))}
        {report.items.length > 0 && !filteredItems.length && <section className="panel"><h2>ظ…ظˆط±ط¯غŒ ظ¾غŒط¯ط§ ظ†ط´ط¯</h2><p>ظپغŒظ„طھط± ظˆط¶ط¹غŒطھ غŒط§ ط¯ط³طھظ‡ ط±ط§ طھط؛غŒغŒط± ط¯ظ‡غŒط¯.</p></section>}
      </section>
    </div>
  );
}

function BaselineDriftPage() {
  const [refreshToken, setRefreshToken] = useState(0);
  const [severityFilter, setSeverityFilter] = useState<BaselineDriftSeverity | "all">("all");
  const [resignoffFilter, setResignoffFilter] = useState<"all" | "yes" | "no">("all");
  const [signedBy, setSignedBy] = useState("");
  const [managerNote, setManagerNote] = useState("");
  const [message, setMessage] = useState("");
  const [lastReviewedDrift, setLastReviewedDrift] = useState<ReturnType<typeof currentBaselineDriftReport>>();
  void refreshToken;

  const drift = currentBaselineDriftReport();
  const retentionReport = historyRetentionService.buildRetentionReport(drift.driftLevel);
  const latestResignoff = operationalResignoffService.latest();
  const printableDrift = lastReviewedDrift ?? drift;
  const filteredChanges = drift.changes.filter((change) =>
    (severityFilter === "all" || change.severity === severityFilter) &&
    (resignoffFilter === "all" || change.requiresResignoff === (resignoffFilter === "yes")));
  const groupedChanges = filteredChanges.reduce((groups, change) => {
    (groups[change.storageKey] ??= []).push(change);
    return groups;
  }, {} as Record<string, BaselineDriftChange[]>);

  useEffect(() => {
    operationalHistoryService.recordDriftReport(drift);
  }, [drift.baselineChecksum, drift.currentChecksum]);

  const makePreResignoffSnapshot = () => {
    workforceBackupService.createSnapshot("Snapshot ظ¾غŒط´ ط§ط² ط¨ط§ط²طھط£غŒغŒط¯", "before_operational_resignoff", "ظ‚ط¨ظ„ ط§ط² ط¨ط±ط±ط³غŒ ط¨ط§ط²طھط£غŒغŒط¯ ط¹ظ…ظ„غŒط§طھغŒ ط³ط§ط®طھظ‡ ط´ط¯.", false);
    setRefreshToken((value) => value + 1);
    setMessage("Snapshot ظ¾غŒط´ ط§ط² ط¨ط§ط²طھط£غŒغŒط¯ ط³ط§ط®طھظ‡ ط´ط¯.");
  };

  const signResignoff = () => {
    if (!signedBy.trim() || !managerNote.trim()) {
      setMessage("ظ†ط§ظ… طھط£غŒغŒط¯ع©ظ†ظ†ط¯ظ‡ ظˆ غŒط§ط¯ط¯ط§ط´طھ ظ…ط¯غŒط± ط§ظ„ط²ط§ظ…غŒ ط§ط³طھ.");
      return;
    }
    if (!drift.baselineSignoffId) {
      setMessage("ط§ط¨طھط¯ط§ launch signoff ظˆ baseline ط§ظˆظ„غŒظ‡ ط±ط§ ط«ط¨طھ ع©ظ†غŒط¯.");
      return;
    }
    if (!window.confirm(`ط¨ط§ط²طھط£غŒغŒط¯ ط¹ظ…ظ„غŒط§طھغŒ ط¨ط§ ظ¾ط°غŒط±ط´ ${drift.totalChanges} طھط؛غŒغŒط± ط«ط¨طھ ظˆ baseline ط¬ط¯غŒط¯ ط³ط§ط®طھظ‡ ط´ظˆط¯طں`)) return;
    try {
      setLastReviewedDrift(drift);
      operationalResignoffService.sign(drift, signedBy, managerNote);
      setMessage("ط¨ط§ط²طھط£غŒغŒط¯ ط«ط¨طھ ط´ط¯ ظˆ baseline ط¬ط¯غŒط¯ ط§ط² ظˆط¶ط¹غŒطھ ظپط¹ظ„غŒ ط³ط§ط®طھظ‡ ط´ط¯.");
      setRefreshToken((value) => value + 1);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "ط«ط¨طھ ط¨ط§ط²طھط£غŒغŒط¯ ط§ظ†ط¬ط§ظ… ظ†ط´ط¯.");
    }
  };

  const changeCard = (change: BaselineDriftChange) => (
    <article className={`drift-change tone-${driftTone(change.severity)}`} key={change.id}>
      <div className="section-head">
        <div className="badge-row">
          <StatusBadge tone={driftTone(change.severity)}>{change.severity}</StatusBadge>
          {change.requiresResignoff && <StatusBadge tone="critical">ط¨ط§ط²طھط£غŒغŒط¯</StatusBadge>}
          {!change.requiresResignoff && change.requiresReview && <StatusBadge tone="warn">ط¨ط§ط²ط¨غŒظ†غŒ</StatusBadge>}
        </div>
        <small>{change.entityType}</small>
      </div>
      <h3>{change.title}</h3>
      <p>{change.description}</p>
      <div className="drift-before-after"><span>ظ‚ط¨ظ„: {change.beforeSummary}</span><span>ط§ع©ظ†ظˆظ†: {change.afterSummary}</span></div>
    </article>
  );

  return (
    <div className="page-stack baseline-drift-page">
      <header className="page-header no-print">
        <div>
          <span className="eyebrow">P17 Baseline Drift</span>
          <h1>ظ¾ط§غŒط´ Drift ط¨ط¹ط¯ ط§ط² Baseline</h1>
          <p>طھط؛غŒغŒط±ط§طھ ط¨ط¹ط¯ ط§ط² طھط£غŒغŒط¯ ط¹ظ…ظ„غŒط§طھغŒ ط±ط§ ط¨ط¨غŒظ†غŒط¯ ظˆ ظپظ‚ط· ظˆظ‚طھغŒ ظ„ط§ط²ظ… ط§ط³طھ baseline ط±ط§ ط¨ط§ط²طھط£غŒغŒط¯ ع©ظ†غŒط¯.</p>
        </div>
        <div className="hero-actions">
          <a className="ghost-button" href="/organization/workforce-dashboard/operations-calendar">طھظ‚ظˆغŒظ… ع©ظ†طھط±ظ„â€Œظ‡ط§</a>
          <a className="ghost-button" href="/organization/workforce-dashboard/launch-signoff">ط±ظپطھظ† ط¨ظ‡ launch signoff</a>
          <a className="ghost-button" href="/organization/workforce-dashboard/operational-history">ظ…ط´ط§ظ‡ط¯ظ‡ طھط§ط±غŒط®ع†ظ‡ drift</a>
          <button className="ghost-button" type="button" onClick={makePreResignoffSnapshot}>ط³ط§ط®طھ snapshot ظ‚ط¨ظ„ ط§ط² ط¨ط§ط²طھط£غŒغŒط¯</button>
          <button className="ghost-button" type="button" onClick={() => window.print()}><Printer size={17} /> ع†ط§ظ¾ ع¯ط²ط§ط±ط´ drift</button>
        </div>
      </header>

      {drift.baselineSignoffId && <BaselineCompatibilityNotice report={drift} />}
      {message && <div className="inline-notice no-print">{message}</div>}
      {(retentionReport.staleDriftCount > 0 || retentionReport.expiredResignoffCount > 0) && <div className="inline-notice tone-critical no-print">Drift ظ‚ط¯غŒظ…غŒ غŒط§ ط¨ط§ط²طھط£غŒغŒط¯ ظ†غŒط§ط²ظ…ظ†ط¯ ظ…ط±ظˆط± ط§ط³طھ. <a href="/organization/workforce-dashboard/history-retention">ط¨ط±ط±ط³غŒ ط³غŒط§ط³طھ ظ†ع¯ظ‡ط¯ط§ط±غŒ</a></div>}
      {!drift.baselineSignoffId && <div className="inline-notice tone-critical no-print">Baseline ط§ظ…ط¶ط§ط´ط¯ظ‡â€Œط§غŒ ظˆط¬ظˆط¯ ظ†ط¯ط§ط±ط¯ط› ط§ط¨طھط¯ط§ طھط£غŒغŒط¯ ط±ط§ظ‡â€Œط§ظ†ط¯ط§ط²غŒ ط±ط§ ط«ط¨طھ ع©ظ†غŒط¯.</div>}

      <section className="kpi-strip no-print">
        <article className="kpi-card tone-focus"><div><p>Baseline</p><strong>{drift.baselineSignoffId ? "ظپط¹ط§ظ„" : "ظ†ط¯ط§ط±ط¯"}</strong><span>{drift.baselineChecksum || "ط§ط¨طھط¯ط§ signoff"}</span></div></article>
        <article className={`kpi-card tone-${driftTone(drift.driftLevel)}`}><div><p>ط§ظ…طھغŒط§ط² Drift</p><strong>{toPersianNumber(drift.driftScore)}</strong><span>ط§ط² غ±غ°غ°</span></div></article>
        <article className={`kpi-card tone-${driftTone(drift.driftLevel)}`}><div><p>ط³ط·ط­ Drift</p><strong>{driftLevelLabel(drift.driftLevel)}</strong><span>{toPersianNumber(drift.totalChanges)} طھط؛غŒغŒط±</span></div></article>
        <article className="kpi-card tone-warn"><div><p>ظ†غŒط§ط²ظ…ظ†ط¯ ط¨ط§ط²ط¨غŒظ†غŒ</p><strong>{toPersianNumber(drift.reviewCount)}</strong><span>طھط؛غŒغŒط± ظ…ظ‡ظ…</span></div></article>
        <article className={`kpi-card tone-${drift.requiresResignoff ? "critical" : "good"}`}><div><p>ط¨ط§ط²طھط£غŒغŒط¯</p><strong>{drift.requiresResignoff ? "ظ„ط§ط²ظ… ط§ط³طھ" : "ظ„ط§ط²ظ… ظ†غŒط³طھ"}</strong><span>{toPersianNumber(drift.resignoffCount)} طھط؛غŒغŒط± ظ…ط³طھظ‚غŒظ…</span></div></article>
      </section>

      <section className="drift-checksum-strip no-print">
        <div><small>Checksum baseline</small><code>{drift.baselineChecksum || "ط«ط¨طھ ظ†ط´ط¯ظ‡"}</code></div>
        <div><small>Checksum ظپط¹ظ„غŒ</small><code>{drift.currentChecksum}</code></div>
      </section>

      <section className={`panel drift-decision tone-${driftTone(drift.driftLevel)} no-print`}>
        <div className="section-head"><h2>طھطµظ…غŒظ… ظ¾غŒط´ظ†ظ‡ط§ط¯غŒ</h2><StatusBadge tone={driftTone(drift.driftLevel)}>{driftLevelLabel(drift.driftLevel)}</StatusBadge></div>
        <p>{drift.summary}</p><strong>{drift.recommendedAction}</strong>
      </section>

      <div className="filter-bar no-print">
        <select value={severityFilter} onChange={(event) => setSeverityFilter(event.target.value as BaselineDriftSeverity | "all")} aria-label="ظپغŒظ„طھط± ط´ط¯طھ drift">
          <option value="all">ظ‡ظ…ظ‡ ط´ط¯طھâ€Œظ‡ط§</option><option value="critical">ط¨ط­ط±ط§ظ†غŒ</option><option value="high">زیاد</option><option value="medium">متوسط</option><option value="low">کم</option><option value="info">ط§ط·ظ„ط§ط¹</option>
        </select>
        <select value={resignoffFilter} onChange={(event) => setResignoffFilter(event.target.value as "all" | "yes" | "no")} aria-label="ظپغŒظ„طھط± ط¨ط§ط²طھط£غŒغŒط¯">
          <option value="all">ظ‡ظ…ظ‡ طھط؛غŒغŒط±ط§طھ</option><option value="yes">ظ†غŒط§ط²ظ…ظ†ط¯ ط¨ط§ط²طھط£غŒغŒط¯</option><option value="no">ط¨ط¯ظˆظ† ظ†غŒط§ط² ط¨ظ‡ ط¨ط§ط²طھط£غŒغŒط¯</option>
        </select>
      </div>

      <section className="drift-groups no-print">
        {Object.entries(groupedChanges).map(([storageKey, changes]) => (
          <section className="panel" key={storageKey}>
            <div className="section-head"><h2>{storageKey}</h2><StatusBadge tone="info">{toPersianNumber(changes.length)} طھط؛غŒغŒط±</StatusBadge></div>
            <div className="drift-change-grid">{changes.map(changeCard)}</div>
          </section>
        ))}
        {drift.baselineSignoffId && !filteredChanges.length && <section className="panel empty-launch-state"><CheckCircle2 className="tone-good" size={32} /><h2>طھط؛غŒغŒط±غŒ ط¯ط± ط§غŒظ† ظپغŒظ„طھط± ظˆط¬ظˆط¯ ظ†ط¯ط§ط±ط¯</h2><p>{drift.driftLevel === "none" ? "ظˆط¶ط¹غŒطھ ظپط¹ظ„غŒ ط¨ط§ baseline غŒع©ط³ط§ظ† ط§ط³طھ." : "ظپغŒظ„طھط±ظ‡ط§ ط±ط§ طھط؛غŒغŒط± ط¯ظ‡غŒط¯."}</p></section>}
      </section>

      {drift.baselineSignoffId && drift.totalChanges > 0 && (
        <section className="panel resignoff-form no-print">
          <div className="section-head"><h2>ط«ط¨طھ ط¨ط§ط²طھط£غŒغŒط¯ ط¹ظ…ظ„غŒط§طھغŒ</h2><StatusBadge tone={drift.requiresResignoff ? "critical" : "warn"}>{drift.requiresResignoff ? "ط¶ط±ظˆط±غŒ" : "ط§ط®طھغŒط§ط±غŒ"}</StatusBadge></div>
          <div className="field-grid">
            <label className="field"><span>ظ†ط§ظ… طھط£غŒغŒط¯ع©ظ†ظ†ط¯ظ‡</span><input value={signedBy} onChange={(event) => setSignedBy(event.target.value)} placeholder="ظ†ط§ظ… ظˆ ط³ظ…طھ" /></label>
            <label className="field field-textarea"><span>غŒط§ط¯ط¯ط§ط´طھ طھط؛غŒغŒط±ط§طھ ظ¾ط°غŒط±ظپطھظ‡â€Œط´ط¯ظ‡</span><textarea value={managerNote} onChange={(event) => setManagerNote(event.target.value)} placeholder="ط¯ظ„غŒظ„ ظ¾ط°غŒط±ط´ ظˆ ظ†طھغŒط¬ظ‡ ط¨ط§ط²ط¨غŒظ†غŒ" /></label>
          </div>
          <button className={drift.requiresResignoff ? "danger-button" : "primary-button"} type="button" onClick={signResignoff}>ط«ط¨طھ ط¨ط§ط²طھط£غŒغŒط¯ ط¹ظ…ظ„غŒط§طھغŒ</button>
        </section>
      )}

      <section className="print-surface drift-print">
        <div className="report-title"><span className="eyebrow">ع¯ط²ط§ط±ط´ ظ¾ط§غŒط´ ظ¾ط³ ط§ط² ط±ط§ظ‡â€Œط§ظ†ط¯ط§ط²غŒ</span><h1>ع¯ط²ط§ط±ط´ Drift ظ†ط³ط¨طھ ط¨ظ‡ Baseline</h1><StatusBadge tone={driftTone(printableDrift.driftLevel)}>{driftLevelLabel(printableDrift.driftLevel)}</StatusBadge></div>
        <div className="signoff-facts">
          <div><small>ط²ظ…ط§ظ† ع¯ط²ط§ط±ط´</small><strong>{toPersianNumber(new Date(printableDrift.generatedAt).toLocaleString("fa-IR"))}</strong></div>
          <div><small>ط§ظ…طھغŒط§ط² drift</small><strong>{toPersianNumber(printableDrift.driftScore)}</strong></div>
          <div><small>طھط؛غŒغŒط±ط§طھ</small><strong>{toPersianNumber(printableDrift.totalChanges)}</strong></div>
          <div><small>Baseline checksum</small><code>{printableDrift.baselineChecksum || "ظ†ط¯ط§ط±ط¯"}</code></div>
          <div><small>Current checksum</small><code>{printableDrift.currentChecksum}</code></div>
          <div><small>ظ†غŒط§ط² ط¨ظ‡ ط¨ط§ط²طھط£غŒغŒط¯</small><strong>{printableDrift.requiresResignoff ? "ط¨ظ„ظ‡" : "ط®غŒط±"}</strong></div>
        </div>
        <section className="report-section"><h2>طھط؛غŒغŒط±ط§طھ ظ…ظ‡ظ…</h2>{printableDrift.changes.filter((item) => item.requiresReview).length ? <ul>{printableDrift.changes.filter((item) => item.requiresReview).map((item) => <li key={item.id}>{item.title}: {item.beforeSummary} â†گ {item.afterSummary}</li>)}</ul> : <p>طھط؛غŒغŒط± ظ…ظ‡ظ…غŒ ط«ط¨طھ ظ†ط´ط¯ظ‡ ط§ط³طھ.</p>}</section>
        <section className="report-section"><h2>طھط؛غŒغŒط±ط§طھ ظ†غŒط§ط²ظ…ظ†ط¯ ط¨ط§ط²طھط£غŒغŒط¯</h2>{printableDrift.changes.filter((item) => item.requiresResignoff).length ? <ul>{printableDrift.changes.filter((item) => item.requiresResignoff).map((item) => <li key={item.id}>{item.title}</li>)}</ul> : <p>ظ…ظˆط±ط¯غŒ ط«ط¨طھ ظ†ط´ط¯ظ‡ ط§ط³طھ.</p>}</section>
        <section className="report-section"><h2>غŒط§ط¯ط¯ط§ط´طھ ظ…ط¯غŒط±</h2><p>{latestResignoff?.managerNote || managerNote || "ط«ط¨طھ ظ†ط´ط¯ظ‡"}</p></section>
        <div className="signature-box"><span>ظ†ط§ظ… ظˆ ط§ظ…ط¶ط§غŒ ط¨ط§ط²طھط£غŒغŒط¯ع©ظ†ظ†ط¯ظ‡</span><strong>{latestResignoff?.signedBy || signedBy || "................................"}</strong><span>طھط§ط±غŒط®: {latestResignoff?.signedAt ? toPersianNumber(new Date(latestResignoff.signedAt).toLocaleDateString("fa-IR")) : "................"}</span></div>
      </section>
    </div>
  );
}

function LaunchSignoffPage({
  spaces,
  employees,
  taskTypes,
  scheduleItems,
  rules,
  settings,
  compatibilityRules,
}: {
  spaces: Space[];
  employees: Employee[];
  taskTypes: TaskType[];
  scheduleItems: WeeklyScheduleItem[];
  rules: AnalysisRule[];
  settings: AnalysisSettings;
  compatibilityRules: WorkCompatibilityRule[];
}) {
  const [signedBy, setSignedBy] = useState("");
  const [approvalDate, setApprovalDate] = useState(() => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tehran" }).format(new Date()));
  const [managerNote, setManagerNote] = useState("");
  const [acceptRisk, setAcceptRisk] = useState(false);
  const [revokeNote, setRevokeNote] = useState("");
  const [message, setMessage] = useState("");
  const [latestSignoff, setLatestSignoff] = useState<LaunchSignoffReport | undefined>(() => launchSignoffService.latest());

  const reports = decisionReportService.list(true);
  const goals = monthlyGoalService.list(true);
  const monthlyHealth = buildMonthlyHealthDashboard(reports);
  const preventiveAlerts = preventiveAlertStateService.applyStates(buildPreventiveAlerts({ reports, monthlyHealth, monthlyGoals: goals }));
  const activePreventiveAlerts = preventiveAlerts.filter((item) => item.status !== "resolved" && item.status !== "dismissed");
  const maintenance = workforceMaintenanceService.runReport(preventiveAlerts.map(preventiveAlertKey));
  const snapshots = workforceBackupService.listSnapshots();
  const readiness = buildOperationalReadinessReport({
    spaces,
    employees,
    taskTypes,
    scheduleItems,
    rules,
    settings,
    snapshots,
    maintenanceReport: maintenance,
    decisionReports: reports,
    monthlyGoals: goals,
    preventiveAlerts,
  });
  const savedChecklist = launchChecklistService.list();
  const checklist = savedChecklist.items.length ? savedChecklist : buildLaunchChecklistFromReadiness(readiness);
  const analysis = analyzeWorkforce({ spaces, employees, taskTypes, scheduleItems, rules, settings, compatibilityRules });
  const unresolvedFindings = analysis.findings.filter((item) => item.severity === "critical" || item.severity === "warning");
  const baselineSummary = buildLaunchBaselineSummary({
    spacesCount: spaces.filter((item) => item.isActive).length,
    employeesCount: employees.filter((item) => item.isActive).length,
    taskTypesCount: taskTypes.filter((item) => item.isActive).length,
    scheduleItemsCount: scheduleItems.filter((item) => item.isActive).length,
    rulesCount: rules.filter((item) => item.isActive).length,
    reportsCount: reports.length,
    goalsCount: goals.filter((item) => !item.isArchived).length,
    preventiveAlertsCount: activePreventiveAlerts.length,
    snapshotsCount: snapshots.length,
    maintenanceIssuesCount: maintenance.totalIssues,
  });
  const signoffContext: LaunchSignoffContext = {
    readiness,
    checklist,
    maintenance,
    baselineSummary,
    unresolvedRisks: Array.from(new Set(unresolvedFindings.map((item) => item.title))),
    openCriticalCount: analysis.criticalCount,
    openWarningCount: analysis.warningCount,
  };
  const draft = launchSignoffService.buildDraft(signoffContext);
  const baselineDrift = currentBaselineDriftReport();
  const printableReport = latestSignoff?.status === "signed" || latestSignoff?.status === "revoked" ? latestSignoff : draft;
  const approvalChecks = [
    { label: "ط¯ط§ط¯ظ‡â€Œظ‡ط§غŒ ظ¾ط§غŒظ‡ ع©ط§ظ…ظ„", passed: baselineSummary.spacesCount > 0 && baselineSummary.employeesCount > 0 && baselineSummary.taskTypesCount > 0 },
    { label: "Snapshot ظ‚ط§ط¨ظ„ ط¨ط§ط²ع¯ط´طھ", passed: baselineSummary.snapshotsCount > 0 },
    { label: "ط¨ط¯ظˆظ† ط§ظ‚ط¯ط§ظ… ط¨ط­ط±ط§ظ†غŒ ط¯ط± ع†ع©â€Œظ„غŒط³طھ", passed: checklist.criticalOpenCount === 0 },
    { label: "ط³ظ„ط§ظ…طھ ظ†ع¯ظ‡ط¯ط§ط±غŒ ظ‚ط§ط¨ظ„ ظ‚ط¨ظˆظ„", passed: maintenance.healthStatus !== "risky" && maintenance.healthStatus !== "critical" },
    { label: "ط¢ظ…ط§ط¯ع¯غŒ ط¹ظ…ظ„غŒط§طھغŒ ط؛غŒط±ظ¾ط±ط±غŒط³ع©", passed: readiness.status !== "risky" },
  ];

  const saveDraft = () => {
    const report = launchSignoffService.createDraft(signoffContext);
    if (managerNote.trim()) launchSignoffService.updateManagerNote(report.id, managerNote);
    setLatestSignoff(launchSignoffService.latest());
    setMessage("ظ¾غŒط´â€Œظ†ظˆغŒط³ ع¯ط²ط§ط±ط´ ط°ط®غŒط±ظ‡ ط´ط¯.");
  };

  const signLaunch = () => {
    if (!signedBy.trim()) {
      setMessage("ظ†ط§ظ… طھط£غŒغŒط¯ع©ظ†ظ†ط¯ظ‡ ط§ظ„ط²ط§ظ…غŒ ط§ط³طھ.");
      return;
    }
    if (!approvalDate) {
      setMessage("طھط§ط±غŒط® طھط£غŒغŒط¯ ط§ظ„ط²ط§ظ…غŒ ط§ط³طھ.");
      return;
    }
    if (draft.blockers.length && (!acceptRisk || !managerNote.trim())) {
      setMessage("ط¨ط±ط§غŒ طھط£غŒغŒط¯ ط¨ط§ ط±غŒط³ع©طŒ ظ¾ط°غŒط±ط´ ط±غŒط³ع© ظˆ غŒط§ط¯ط¯ط§ط´طھ ظ…ط¯غŒط± ط§ظ„ط²ط§ظ…غŒ ط§ط³طھ.");
      return;
    }
    const confirmation = draft.blockers.length
      ? `ط§غŒظ† ط±ط§ظ‡â€Œط§ظ†ط¯ط§ط²غŒ ${draft.blockers.length} ظ…ط§ظ†ط¹ ظپط¹ط§ظ„ ط¯ط§ط±ط¯. ط¨ط§ ط«ط¨طھ baselineطŒ ط±غŒط³ع©â€Œظ‡ط§غŒ ظ†ظ…ط§غŒط´â€Œط¯ط§ط¯ظ‡â€Œط´ط¯ظ‡ ط±ط§ ط¢ع¯ط§ظ‡ط§ظ†ظ‡ ظ…غŒâ€Œظ¾ط°غŒط±غŒط¯. ط§ط¯ط§ظ…ظ‡ ظ…غŒâ€Œط¯ظ‡غŒط¯طں`
      : "Baseline ط¹ظ…ظ„غŒط§طھغŒ ط³ط§ط®طھظ‡ ظˆ ط±ط§ظ‡â€Œط§ظ†ط¯ط§ط²غŒ ظ†ظ‡ط§غŒغŒ طھط£غŒغŒط¯ ط´ظˆط¯طں";
    if (!window.confirm(confirmation)) return;
    try {
      const report = launchSignoffService.sign(signoffContext, {
        signedBy,
        signedAt: new Date(`${approvalDate}T12:00:00.000Z`).toISOString(),
        managerNote,
        acceptRisk,
      });
      setLatestSignoff(report);
      setMessage("Baseline ط³ط§ط®طھظ‡ ط´ط¯ ظˆ ط±ط§ظ‡â€Œط§ظ†ط¯ط§ط²غŒ طھط£غŒغŒط¯ ط´ط¯.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "طھط£غŒغŒط¯ ط±ط§ظ‡â€Œط§ظ†ط¯ط§ط²غŒ ط§ظ†ط¬ط§ظ… ظ†ط´ط¯.");
    }
  };

  const revokeSignoff = () => {
    if (!latestSignoff || !revokeNote.trim()) {
      setMessage("ط¨ط±ط§غŒ ظ„ط؛ظˆ طھط£غŒغŒط¯طŒ ط¯ظ„غŒظ„ ع©ظˆطھط§ظ‡غŒ ط«ط¨طھ ع©ظ†غŒط¯.");
      return;
    }
    if (!window.confirm("طھط£غŒغŒط¯ ط¹ظ…ظ„غŒط§طھغŒ ط§غŒظ† baseline ظ„ط؛ظˆ ط´ظˆط¯طں ط¯ط§ط¯ظ‡â€Œظ‡ط§غŒ baseline ط­ط°ظپ ظ†ظ…غŒâ€Œط´ظˆظ†ط¯.")) return;
    try {
      const report = launchSignoffService.revoke(latestSignoff.id, revokeNote);
      setLatestSignoff(report);
      setMessage("طھط£غŒغŒط¯ ط±ط§ظ‡â€Œط§ظ†ط¯ط§ط²غŒ ظ„ط؛ظˆ ط´ط¯ط› baseline ط¨ط±ط§غŒ ط¨ط§غŒع¯ط§ظ†غŒ ط¨ط§ظ‚غŒ ظ…ط§ظ†ط¯.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "ظ„ط؛ظˆ طھط£غŒغŒط¯ ط§ظ†ط¬ط§ظ… ظ†ط´ط¯.");
    }
  };

  const statusTone: StatusTone = draft.blockers.length ? "critical" : latestSignoff?.status === "signed" ? "good" : "warn";

  return (
    <div className="page-stack launch-signoff-page">
      <header className="page-header no-print">
        <div>
          <span className="eyebrow">P16 Launch Signoff</span>
          <h1>طھط£غŒغŒط¯ ظ†ظ‡ط§غŒغŒ ط±ط§ظ‡â€Œط§ظ†ط¯ط§ط²غŒ</h1>
          <p>ع©ظ†طھط±ظ„ ظ†ظ‡ط§غŒغŒطŒ ط«ط¨طھ ظ…ط³ط¦ظˆظ„ طھط£غŒغŒط¯ ظˆ ط³ط§ط®طھ baseline ظ‚ط§ط¨ظ„ ط¨ط§ط²ع¯ط´طھ ط¨ط±ط§غŒ ط´ط±ظˆط¹ ط§ط³طھظپط§ط¯ظ‡ ظˆط§ظ‚ط¹غŒ.</p>
        </div>
        <div className="hero-actions">
          <a className="ghost-button" href="/organization/workforce-dashboard">ط±ظپطھظ† ط¨ظ‡ ط¯ط§ط´ط¨ظˆط±ط¯ ط§طµظ„غŒ</a>
          <a className="ghost-button" href="/organization/workforce-dashboard/launch-checklist">ع†ع©â€Œظ„غŒط³طھ ط±ط§ظ‡â€Œط§ظ†ط¯ط§ط²غŒ</a>
          {latestSignoff?.status === "signed" && <a className="ghost-button" href="/organization/workforce-dashboard/baseline-drift">ظ¾ط§غŒط´ Drift baseline</a>}
          <button className="ghost-button" type="button" onClick={() => window.print()}><Printer size={17} /> ع†ط§ظ¾ ع¯ط²ط§ط±ط´</button>
        </div>
      </header>

      {message && <div className="inline-notice no-print">{message}</div>}
       {latestSignoff?.status === "signed" && <BaselineCompatibilityNotice report={baselineDrift} />}
     {latestSignoff?.status === "signed" && (baselineDrift.driftLevel === "high" || baselineDrift.driftLevel === "critical") && (
        <div className="inline-notice tone-critical no-print">Baseline ظپط¹ظ„غŒ drift {driftLevelLabel(baselineDrift.driftLevel)} ط¯ط§ط±ط¯ ظˆ ط¨ط§غŒط¯ ط¨ط§ط²طھط£غŒغŒط¯ ط´ظˆط¯.</div>
      )}

      <section className="kpi-strip no-print">
        <article className={`kpi-card tone-${readinessStatusTone(readiness.status)}`}><div><p>ط¢ظ…ط§ط¯ع¯غŒ</p><strong>{toPersianNumber(readiness.score)}</strong><span>{readinessStatusLabel(readiness.status)}</span></div></article>
        <article className="kpi-card tone-focus"><div><p>ظ¾غŒط´ط±ظپطھ ط±ط§ظ‡â€Œط§ظ†ط¯ط§ط²غŒ</p><strong>{toPersianNumber(checklist.progressPercent)}ظھ</strong><span>{toPersianNumber(checklist.openCount)} ط§ظ‚ط¯ط§ظ… ط¨ط§ط²</span></div></article>
        <article className={`kpi-card tone-${maintenanceHealthTone(maintenance.healthStatus)}`}><div><p>ظ†ع¯ظ‡ط¯ط§ط±غŒ</p><strong>{maintenanceHealthLabel(maintenance.healthStatus)}</strong><span>{toPersianNumber(maintenance.totalIssues)} ظ…ط³ط¦ظ„ظ‡</span></div></article>
        <article className="kpi-card tone-info"><div><p>Snapshot</p><strong>{toPersianNumber(snapshots.length)}</strong><span>{snapshots[0]?.title ?? "ط«ط¨طھ ظ†ط´ط¯ظ‡"}</span></div></article>
        <article className={`kpi-card tone-${statusTone}`}><div><p>ط§ط¬ط§ط²ظ‡ طھط£غŒغŒط¯</p><strong>{draft.blockers.length ? "ظ…ط³ط¯ظˆط¯" : "ط¢ظ…ط§ط¯ظ‡"}</strong><span>{toPersianNumber(draft.blockers.length)} ظ…ط§ظ†ط¹</span></div></article>
      </section>

      {draft.blockers.length > 0 && (
        <section className="panel signoff-blockers no-print">
          <div className="section-head"><h2>ظ…ظˆط§ظ†ط¹ طھط£غŒغŒط¯ ط¹ط§ط¯غŒ</h2><StatusBadge tone="critical">ط±غŒط³ع© ط¢ط´ع©ط§ط±</StatusBadge></div>
          <div className="analysis-list">{draft.blockers.map((item) => <div className="panel-row tone-critical" key={item}>{item}</div>)}</div>
        </section>
      )}

      <section className="signoff-layout no-print">
        <section className="panel">
          <h2>ع©ظ†طھط±ظ„â€Œظ‡ط§غŒ ظ¾غŒط´ ط§ط² طھط£غŒغŒط¯</h2>
          <div className="approval-checks">
            {approvalChecks.map((item) => (
              <div className="approval-check" key={item.label}>
                {item.passed ? <CheckCircle2 className="tone-good" size={19} /> : <AlertTriangle className="tone-critical" size={19} />}
                <span>{item.label}</span>
                <StatusBadge tone={item.passed ? "good" : "critical"}>{item.passed ? "ظ¾ط§ط³" : "ط¨ط§ط²"}</StatusBadge>
              </div>
            ))}
          </div>
        </section>

        <section className="panel signoff-form">
          <h2>ط«ط¨طھ طھط£غŒغŒط¯ ظ…ط¯غŒط±</h2>
          <div className="field-grid">
            <label className="field"><span>ظ†ط§ظ… طھط£غŒغŒط¯ع©ظ†ظ†ط¯ظ‡</span><input value={signedBy} onChange={(event) => setSignedBy(event.target.value)} placeholder="ظ†ط§ظ… ظˆ ط³ظ…طھ" /></label>
            <label className="field"><span>طھط§ط±غŒط® طھط£غŒغŒط¯</span><input type="date" value={approvalDate} onChange={(event) => setApprovalDate(event.target.value)} /></label>
            <label className="field field-textarea"><span>غŒط§ط¯ط¯ط§ط´طھ ظ…ط¯غŒط±</span><textarea value={managerNote} onChange={(event) => setManagerNote(event.target.value)} placeholder={draft.blockers.length ? "ط¨ط±ط§غŒ ظ¾ط°غŒط±ط´ ط±غŒط³ع© ط§ط¬ط¨ط§ط±غŒ ط§ط³طھ" : "غŒط§ط¯ط¯ط§ط´طھ ط§ط®طھغŒط§ط±غŒ ط¨ط±ط§غŒ ط¨ط§غŒع¯ط§ظ†غŒ"} /></label>
          </div>
          {draft.blockers.length > 0 && (
            <label className="risk-acceptance">
              <input type="checkbox" checked={acceptRisk} onChange={(event) => setAcceptRisk(event.target.checked)} />
              <span>ط±غŒط³ع©â€Œظ‡ط§غŒ ط¨ط§ط² ط±ط§ ط¯غŒط¯ظ‡â€Œط§ظ… ظˆ ظ…ط³ط¦ظˆظ„غŒطھ ط´ط±ظˆط¹ ط¹ظ…ظ„غŒط§طھغŒ ط¨ط§ ط§غŒظ† ظˆط¶ط¹غŒطھ ط±ط§ ظ…غŒâ€Œظ¾ط°غŒط±ظ….</span>
            </label>
          )}
          <div className="form-actions">
            <button className="ghost-button" type="button" onClick={saveDraft}>ط°ط®غŒط±ظ‡ ظ¾غŒط´â€Œظ†ظˆغŒط³</button>
            <button className={draft.blockers.length ? "danger-button" : "primary-button"} type="button" onClick={signLaunch}><FileCheck2 size={17} /> ط³ط§ط®طھ baseline ظˆ طھط£غŒغŒط¯ ط±ط§ظ‡â€Œط§ظ†ط¯ط§ط²غŒ</button>
          </div>
        </section>
      </section>

      <section className="print-surface launch-signoff-print">
        <div className="report-title">
          <span className="eyebrow">ع¯ط²ط§ط±ط´ ظ‚ط§ط¨ظ„ ط¨ط§غŒع¯ط§ظ†غŒ</span>
          <h1>{printableReport.title}</h1>
          <StatusBadge tone={printableReport.status === "signed" ? "good" : printableReport.status === "revoked" ? "critical" : statusTone}>
            {printableReport.status === "signed" ? "طھط£غŒغŒط¯ط´ط¯ظ‡" : printableReport.status === "revoked" ? "ظ„ط؛ظˆط´ط¯ظ‡" : "ظ¾غŒط´â€Œظ†ظˆغŒط³"}
          </StatusBadge>
        </div>

        <div className="signoff-facts">
          <div><small>طھط§ط±غŒط® ع¯ط²ط§ط±ط´</small><strong>{toPersianNumber(new Date(printableReport.signedAt ?? printableReport.generatedAt).toLocaleString("fa-IR"))}</strong></div>
          <div><small>طھط£غŒغŒط¯ع©ظ†ظ†ط¯ظ‡</small><strong>{printableReport.signedBy || signedBy || "ط«ط¨طھ ظ†ط´ط¯ظ‡"}</strong></div>
          <div><small>ط§ظ…طھغŒط§ط² ط¢ظ…ط§ط¯ع¯غŒ</small><strong>{toPersianNumber(printableReport.readinessScore)}</strong></div>
          <div><small>ظ¾غŒط´ط±ظپطھ ط±ط§ظ‡â€Œط§ظ†ط¯ط§ط²غŒ</small><strong>{toPersianNumber(printableReport.launchProgressPercent)}ظھ</strong></div>
          <div><small>ط³ظ„ط§ظ…طھ ظ†ع¯ظ‡ط¯ط§ط±غŒ</small><strong>{maintenanceHealthLabel(printableReport.maintenanceHealthStatus)}</strong></div>
          <div><small>Checksum baseline</small><code>{printableReport.baselineChecksum || "ظ¾ط³ ط§ط² طھط£غŒغŒط¯ ط³ط§ط®طھظ‡ ظ…غŒâ€Œط´ظˆط¯"}</code></div>
        </div>

        <section className="report-section">
          <h2>ط®ظ„ط§طµظ‡ baseline</h2>
          <div className="baseline-summary-grid">
            {Object.entries(printableReport.baselineSummary).map(([key, value]) => <div key={key}><small>{baselineSummaryLabel(key as keyof typeof printableReport.baselineSummary)}</small><strong>{toPersianNumber(value)}</strong></div>)}
          </div>
        </section>

        <section className="signoff-risk-grid">
          <div className="report-section"><h2>ط±غŒط³ع©â€Œظ‡ط§غŒ ط¨ط§ط² غŒط§ ظ¾ط°غŒط±ظپطھظ‡â€Œط´ط¯ظ‡</h2>{printableReport.unresolvedRisks.length ? <ul>{printableReport.unresolvedRisks.map((item) => <li key={item}>{item}</li>)}</ul> : <p>ط±غŒط³ع© ط¨ط§ط²غŒ ط«ط¨طھ ظ†ط´ط¯ظ‡ ط§ط³طھ.</p>}</div>
          <div className="report-section"><h2>ط¢غŒطھظ…â€Œظ‡ط§غŒ ط¨ط§ط² ع†ع©â€Œظ„غŒط³طھ</h2>{printableReport.unresolvedChecklistItems.length ? <ul>{printableReport.unresolvedChecklistItems.map((item) => <li key={item}>{item}</li>)}</ul> : <p>ط¢غŒطھظ… ط¨ط§ط²غŒ ط¨ط§ظ‚غŒ ظ†ظ…ط§ظ†ط¯ظ‡ ط§ط³طھ.</p>}</div>
        </section>

        <section className="report-section"><h2>غŒط§ط¯ط¯ط§ط´طھ ظ…ط¯غŒط±</h2><p>{printableReport.managerNote || managerNote || "غŒط§ط¯ط¯ط§ط´طھغŒ ط«ط¨طھ ظ†ط´ط¯ظ‡ ط§ط³طھ."}</p></section>
        <div className="signature-box"><span>ظ†ط§ظ… ظˆ ط§ظ…ط¶ط§غŒ طھط£غŒغŒط¯ع©ظ†ظ†ط¯ظ‡</span><strong>{printableReport.signedBy || signedBy || "................................"}</strong><span>طھط§ط±غŒط®: {toPersianNumber(printableReport.signedAt ? new Date(printableReport.signedAt).toLocaleDateString("fa-IR") : approvalDate)}</span></div>

        {latestSignoff?.baselineBundle && (
          <div className="row-actions no-print">
            <button className="primary-button" type="button" onClick={() => launchSignoffService.downloadBaseline(latestSignoff.id)}>ط¯ط§ظ†ظ„ظˆط¯ backup baseline</button>
          </div>
        )}
      </section>

      {latestSignoff?.status === "signed" && (
        <section className="panel no-print revoke-panel">
          <h2>ظ„ط؛ظˆ طھط£غŒغŒط¯ ط¹ظ…ظ„غŒط§طھغŒ</h2>
          <p>Baseline ظˆ ع¯ط²ط§ط±ط´ ط­ط°ظپ ظ†ظ…غŒâ€Œط´ظˆظ†ط¯ط› ظپظ‚ط· ط§ط¹طھط¨ط§ط± ط¹ظ…ظ„غŒط§طھغŒ ط¢ظ† ظ„ط؛ظˆ ظ…غŒâ€Œط´ظˆط¯.</p>
          <div className="dismiss-panel"><input className="search-input" value={revokeNote} onChange={(event) => setRevokeNote(event.target.value)} placeholder="ط¯ظ„غŒظ„ ظ„ط؛ظˆ طھط£غŒغŒط¯" /><button className="danger-button" type="button" onClick={revokeSignoff}>ظ„ط؛ظˆ طھط£غŒغŒط¯</button></div>
        </section>
      )}
    </div>
  );
}

function baselineSummaryLabel(key: keyof ReturnType<typeof buildLaunchBaselineSummary>) {
  const labels: Partial<Record<keyof ReturnType<typeof buildLaunchBaselineSummary>, string>> = {
    spacesCount: "ظپط¶ط§ظ‡ط§",
    employeesCount: "ع©ط§ط±ظ…ظ†ط¯ط§ظ†",
    taskTypesCount: "ظ†ظˆط¹ ع©ط§ط±ظ‡ط§",
    scheduleItemsCount: "ط¢غŒطھظ…â€Œظ‡ط§غŒ ط¨ط±ظ†ط§ظ…ظ‡",
    rulesCount: "ظ‚ظˆط§ظ†غŒظ†",
    reportsCount: "ع¯ط²ط§ط±ط´â€Œظ‡ط§",
    goalsCount: "ظ‡ط¯ظپâ€Œظ‡ط§",
    preventiveAlertsCount: "ظ‡ط´ط¯ط§ط±ظ‡ط§غŒ ظ¾غŒط´ع¯غŒط±ط§ظ†ظ‡",
    snapshotsCount: "Snapshotظ‡ط§",
    maintenanceIssuesCount: "ظ…ط³ط§ط¦ظ„ ظ†ع¯ظ‡ط¯ط§ط±غŒ",
  };
  return labels[key] ?? String(key);
}

function DataCenterPage({ resetDemo }: { resetDemo: () => void }) {
  const [snapshots, setSnapshots] = useState(() => workforceBackupService.listSnapshots());
  const [validation, setValidation] = useState<BackupValidationResult | null>(null);
  const [pendingBundle, setPendingBundle] = useState<WorkforceBackupBundle | null>(null);
  const [message, setMessage] = useState("");
  const stats = workforceBackupService.getWorkforceDataStats();
  const lastSnapshot = snapshots[0];
  const maintenanceReport = workforceMaintenanceService.runReport();
  const baselineSignoff = launchSignoffService.latestSigned();
  const baselineDrift = currentBaselineDriftReport();
  const retentionReport = historyRetentionService.buildRetentionReport(baselineDrift.driftLevel);
  const historyArchives = historyRetentionService.listArchives();
  const operationsPolicy = operationsControlSettingsService.getSchedulePolicy();
  const operationsControlCount = operationsCalendarService.list().length;

  const refresh = () => {
    setSnapshots(workforceBackupService.listSnapshots());
  };

  const exportBackup = () => {
    const bundle = workforceBackupService.createBackupBundle("export manual", "manual-export");
    const result = workforceBackupService.downloadBackupFile(bundle);
    operationalHistoryService.recordBackupEvent(bundle.id, "ط®ط±ظˆط¬غŒ ظ¾ط´طھغŒط¨ط§ظ† ط¯ط³طھغŒ", bundle.checksum);
    setMessage(`ظپط§غŒظ„ ${result.fileName} ط¢ظ…ط§ط¯ظ‡ ط´ط¯.`);
  };

  const makeSnapshot = () => {
    const snapshot = workforceBackupService.createSnapshot("Snapshot ط¯ط³طھغŒ", "manual-data-center", "ط³ط§ط®طھظ‡ ط´ط¯ظ‡ ط§ط² ظ…ط±ع©ط² ط¯ط§ط¯ظ‡", false);
    operationalHistoryService.recordSnapshotEvent(snapshot.id, snapshot.title, snapshot.reason);
    refresh();
    setMessage("Snapshot ط¯ط³طھغŒ ط³ط§ط®طھظ‡ ط´ط¯.");
  };

  const onImportFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as WorkforceBackupBundle;
      const result = workforceBackupService.validateBackupBundle(parsed);
      setValidation(result);
      setPendingBundle(parsed);
      setMessage(result.canImport ? "ظپط§غŒظ„ ظ…ط¹طھط¨ط± ط§ط³طھ ظˆ ط¢ظ…ط§ط¯ظ‡ import ط§ط³طھ." : "ظپط§غŒظ„ ظ…ط¹طھط¨ط± ظ†غŒط³طھ.");
    } catch {
      setValidation({ isValid: false, version: "", errors: ["ظپط§غŒظ„ JSON ظ‚ط§ط¨ظ„ ط®ظˆط§ظ†ط¯ظ† ظ†غŒط³طھ."], warnings: [], counts: {}, canImport: false });
      setPendingBundle(null);
      setMessage("ظپط§غŒظ„ ظ‚ط§ط¨ظ„ ط®ظˆط§ظ†ط¯ظ† ظ†غŒط³طھ.");
    }
  };

  const importPending = () => {
    if (!pendingBundle || !validation?.canImport) return;
    const ok = window.confirm("ظ‡ظ…ظ‡ ط¯ط§ط¯ظ‡â€Œظ‡ط§غŒ ظپط¹ظ„غŒ ط¨ط§ ظپط§غŒظ„ ط¨ع©ط§ظ¾ ط¬ط§غŒع¯ط²غŒظ† ط´ظˆظ†ط¯طں ظ‚ط¨ظ„ ط§ط² import غŒع© snapshot ط®ظˆط¯ع©ط§ط± ط³ط§ط®طھظ‡ ظ…غŒâ€Œط´ظˆط¯.");
    if (!ok) return;
    const result = workforceBackupService.importBackupBundle(pendingBundle, "replace");
    if (result.imported) operationalHistoryService.recordImportRestore(pendingBundle.id, "ط¨ع©ط§ظ¾ ط®ط§ط±ط¬غŒ ط¬ط§غŒع¯ط²غŒظ† ط¯ط§ط¯ظ‡â€Œظ‡ط§غŒ ط¬ط§ط±غŒ ط´ط¯.");
    refresh();
    setMessage(result.imported ? "Import ط§ظ†ط¬ط§ظ… ط´ط¯. طµظپط­ظ‡ ط±ط§ refresh ع©ظ† طھط§ ظ‡ظ…ظ‡ ط¨ط®ط´â€Œظ‡ط§ ط¯ط§ط¯ظ‡ ط¬ط¯غŒط¯ ط±ط§ ط¨ط¨غŒظ†ظ†ط¯." : "Import ط§ظ†ط¬ط§ظ… ظ†ط´ط¯.");
  };

  const restoreSnapshot = (snapshotId: string) => {
    const ok = window.confirm("ط¯ط§ط¯ظ‡â€Œظ‡ط§غŒ ظپط¹ظ„غŒ ط¨ظ‡ ظˆط¶ط¹غŒطھ ط§غŒظ† snapshot ط¨ط±ع¯ط±ط¯ظ†ط¯طں ظ‚ط¨ظ„ ط§ط² restore غŒع© snapshot ط®ظˆط¯ع©ط§ط± ط³ط§ط®طھظ‡ ظ…غŒâ€Œط´ظˆط¯.");
    if (!ok) return;
    const restored = workforceBackupService.restoreSnapshot(snapshotId);
    if (restored) operationalHistoryService.recordImportRestore(restored.id, `Snapshot آ«${restored.title}آ» ط¨ط§ط²غŒط§ط¨غŒ ط´ط¯.`);
    refresh();
    setMessage("Restore ط§ظ†ط¬ط§ظ… ط´ط¯. طµظپط­ظ‡ ط±ط§ refresh ع©ظ†.");
  };

  const deleteSnapshot = (snapshotId: string) => {
    const ok = window.confirm("ط§غŒظ† snapshot ط­ط°ظپ ط´ظˆط¯طں");
    if (!ok) return;
    workforceBackupService.deleteSnapshot(snapshotId);
    refresh();
  };

  const dangerousReset = () => {
    const ok = window.confirm("Reset demo ظ‡ظ…ظ‡ ط¯ط§ط¯ظ‡â€Œظ‡ط§غŒ ظپط¹ظ„غŒ ط±ط§ ط¬ط§غŒع¯ط²غŒظ† ظ…غŒâ€Œع©ظ†ط¯. ظ‚ط¨ظ„ ط§ط² reset snapshot ط®ظˆط¯ع©ط§ط± ط³ط§ط®طھظ‡ ظ…غŒâ€Œط´ظˆط¯. ط§ط¯ط§ظ…ظ‡ ظ…غŒâ€Œط¯ظ‡غŒطں");
    if (!ok) return;
    resetDemo();
    refresh();
    setMessage("Reset demo ط§ظ†ط¬ط§ظ… ط´ط¯.");
  };

  const statCards = [
    { label: "ظپط¶ط§ظ‡ط§", value: stats.spacesCount },
    { label: "ع©ط§ط±ظ…ظ†ط¯ط§ظ†", value: stats.employeesCount },
    { label: "ظ†ظˆط¹ ع©ط§ط±ظ‡ط§", value: stats.taskTypesCount },
    { label: "ط¨ط±ظ†ط§ظ…ظ‡", value: stats.scheduleItemsCount },
    { label: "ع¯ط²ط§ط±ط´â€Œظ‡ط§", value: stats.reportsCount },
    { label: "ظ‡ط¯ظپâ€Œظ‡ط§", value: stats.goalsCount },
  ];

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <span className="eyebrow">P12 Data Center</span>
          <h1>ط¬ط¹ط¨ظ‡ ط³غŒط§ظ‡ ط¯ط§ط¯ظ‡â€Œظ‡ط§</h1>
          <p>ط¨ع©ط§ظ¾ ع©ط§ظ…ظ„طŒ import ظ…ط¹طھط¨ط±طŒ snapshot ظˆ rollback ط³ط¨ع© ط¨ط±ط§غŒ ط¯ط§ط¯ظ‡â€Œظ‡ط§غŒ localStorage.</p>
        </div>
        <div className="hero-actions">
          <a className="ghost-button" href="/organization/workforce-dashboard/operations-calendar">طھظ‚ظˆغŒظ… ع©ظ†طھط±ظ„â€Œظ‡ط§</a>
          <a className="ghost-button" href="/organization/workforce-dashboard/readiness">ع†ع©â€Œظ„غŒط³طھ ط¢ظ…ط§ط¯ع¯غŒ</a>
          <a className="ghost-button" href="/organization/workforce-dashboard/maintenance">ع©ظ†ط³ظˆظ„ ظ†ع¯ظ‡ط¯ط§ط±غŒ</a>
          <a className="ghost-button" href="/organization/workforce-dashboard/operational-history">طھط§ط±غŒط®ع†ظ‡ ط¹ظ…ظ„غŒط§طھغŒ</a>
          <a className="ghost-button" href="/organization/workforce-dashboard/history-retention">ط³غŒط§ط³طھ ظ†ع¯ظ‡ط¯ط§ط±غŒ</a>
          <button className="primary-button" type="button" onClick={exportBackup}>ط®ط±ظˆط¬غŒ ع¯ط±ظپطھظ† ع©ط§ظ…ظ„</button>
          <button className="ghost-button" type="button" onClick={makeSnapshot}>ط³ط§ط®طھ snapshot ط¯ط³طھغŒ</button>
        </div>
      </header>

      <section className="kpi-strip">
        <article className="kpi-card tone-good"><div><p>ط³ظ„ط§ظ…طھ ط¯ط§ط¯ظ‡â€Œظ‡ط§</p><strong>ظ‚ط§ط¨ظ„ ط¨ط§ط²غŒط§ط¨غŒ</strong><span>{snapshots.length ? `${toPersianNumber(snapshots.length)} snapshot` : "ظ‡ظ†ظˆط² snapshot ظ†ط¯ط§ط±غŒ"}</span></div></article>
        <article className="kpi-card tone-info"><div><p>ط¢ط®ط±غŒظ† ط¨ع©ط§ظ¾</p><strong>{lastSnapshot ? toPersianNumber(new Date(lastSnapshot.createdAt).toLocaleDateString("fa-IR")) : "ط«ط¨طھ ظ†ط´ط¯ظ‡"}</strong><span>{lastSnapshot?.title ?? "snapshot ط¨ط³ط§ط²"}</span></div></article>
        <article className="kpi-card tone-focus"><div><p>ط±ع©ظˆط±ط¯ظ‡ط§</p><strong>{toPersianNumber(Object.values(stats).filter((value) => typeof value === "number").reduce((sum, value) => sum + Number(value), 0))}</strong><span>ط¯ط± ع©ظ„ ط¨ط®ط´â€Œظ‡ط§</span></div></article>
        <article className="kpi-card tone-warn"><div><p>ع©ظ„غŒط¯ظ‡ط§</p><strong>{toPersianNumber(workforceBackupKeys.length)}</strong><span>ظ¾ظˆط´ط´ export/import</span></div></article>
        <article className="kpi-card tone-critical"><div><p>ظ†ط§ط­غŒظ‡ ط®ط·ط±</p><strong>Reset</strong><span>ط¨ط§ snapshot ط®ظˆط¯ع©ط§ط±</span></div></article>
      </section>

      {message && <section className="panel"><p>{message}</p></section>}
       {baselineSignoff && <BaselineCompatibilityNotice report={baselineDrift} />}
     <section className="panel baseline-card tone-info">
        <div className="section-head"><h2>ط®ط±ظˆط¬غŒ طھظ‚ظˆغŒظ… ع©ظ†طھط±ظ„â€Œظ‡ط§</h2><StatusBadge tone="info">{toPersianNumber(operationsPolicy.enabledControlTypes.length)} ظ†ظˆط¹ ظپط¹ط§ظ„</StatusBadge></div>
        <p>{toPersianNumber(operationsControlCount)} ع©ظ†طھط±ظ„ ط°ط®غŒط±ظ‡â€Œط´ط¯ظ‡ | Snapshot ظ‡ط± {toPersianNumber(operationsPolicy.snapshotEveryDays)} ط±ظˆط²</p>
        <div className="row-actions"><a className="primary-button" href="/organization/workforce-dashboard/operations-calendar">طھظ‚ظˆغŒظ… ظˆ ط®ط±ظˆط¬غŒ ICS/JSON</a><a className="ghost-button" href="/organization/workforce-dashboard/operations-control-settings">طھظ†ط¸غŒظ… Policy</a></div>
      </section>
      {baselineSignoff && (
        <section className="panel baseline-card tone-good">
          <div className="section-head"><h2>Baseline ط¹ظ…ظ„غŒط§طھغŒ</h2><StatusBadge tone="good">طھط£غŒغŒط¯ط´ط¯ظ‡</StatusBadge></div>
          <p>{toPersianNumber(new Date(baselineSignoff.signedAt ?? baselineSignoff.updatedAt).toLocaleString("fa-IR"))} | {baselineSignoff.signedBy}</p>
          <code>{baselineSignoff.baselineChecksum}</code>
          <div className="row-actions">
            <a className="ghost-button" href="/organization/workforce-dashboard/launch-signoff">ع¯ط²ط§ط±ط´ طھط£غŒغŒط¯</a>
            <button className="primary-button" type="button" onClick={() => launchSignoffService.downloadBaseline(baselineSignoff.id)}>ط¯ط§ظ†ظ„ظˆط¯ backup baseline</button>
          </div>
        </section>
      )}
      <section className={`panel baseline-card tone-${retentionStatusTone(retentionReport.status)}`}>
        <div className="section-head"><h2>Archive طھط§ط±غŒط®ع†ظ‡</h2><StatusBadge tone={retentionStatusTone(retentionReport.status)}>{retentionStatusLabel(retentionReport.status)}</StatusBadge></div>
        <p>{toPersianNumber(historyArchives.length)} archive | ط¢ط®ط±غŒظ†: {historyArchives[0] ? toPersianNumber(new Date(historyArchives[0].createdAt).toLocaleDateString("fa-IR")) : "ط«ط¨طھ ظ†ط´ط¯ظ‡"}</p>
        <a className="primary-button" href="/organization/workforce-dashboard/history-retention">ظ…ط¯غŒط±غŒطھ retention</a>
      </section>
      {baselineSignoff && (
        <section className={`panel baseline-card tone-${driftTone(baselineDrift.driftLevel)}`}>
          <div className="section-head"><h2>Baseline drift</h2><StatusBadge tone={driftTone(baselineDrift.driftLevel)}>{driftLevelLabel(baselineDrift.driftLevel)}</StatusBadge></div>
          <p>ط§ظ…طھغŒط§ط² {toPersianNumber(baselineDrift.driftScore)} | {toPersianNumber(baselineDrift.totalChanges)} طھط؛غŒغŒط±</p>
          <a className="primary-button" href="/organization/workforce-dashboard/baseline-drift">ظ¾ط§غŒط´ طھط؛غŒغŒط±ط§طھ baseline</a>
        </section>
      )}
      {maintenanceReport.criticalCount > 0 && (
        <section className="panel">
          <h2>ظ‡ط´ط¯ط§ط± ظ†ع¯ظ‡ط¯ط§ط±غŒ</h2>
          <p>{toPersianNumber(maintenanceReport.criticalCount)} ط®ط·ط§غŒ ط¨ط­ط±ط§ظ†غŒ ط¯ط± ط³ظ„ط§ظ…طھ ط¯ط§ط¯ظ‡â€Œظ‡ط§ ط¯غŒط¯ظ‡ ط´ط¯.</p>
          <a className="danger-button" href="/organization/workforce-dashboard/maintenance">ط¨ط±ط±ط³غŒ ط¯ط± ع©ظ†ط³ظˆظ„ ظ†ع¯ظ‡ط¯ط§ط±غŒ</a>
        </section>
      )}

      <section className="bottom-grid">
        <section className="panel">
          <h2>طھط¹ط¯ط§ط¯ ط±ع©ظˆط±ط¯ظ‡ط§</h2>
          <div className="score-grid">
            {statCards.map((item) => (
              <div className="heat-cell tone-info" key={item.label}>
                <strong>{toPersianNumber(item.value)}</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <h2>ظˆط§ط±ط¯ ع©ط±ط¯ظ† ط¨ع©ط§ظ¾</h2>
          <input type="file" accept="application/json,.json" onChange={(event) => void onImportFile(event.target.files?.[0])} />
          {validation && (
            <div className="evidence-box">
              <span>{validation.canImport ? "ظپط§غŒظ„ ظ…ط¹طھط¨ط± ط§ط³طھ." : "ظپط§غŒظ„ ظ‚ط§ط¨ظ„ import ظ†غŒط³طھ."}</span>
              <small>{[...validation.errors, ...validation.warnings].join(" | ") || `ظ†ط³ط®ظ‡ ${validation.version}`}</small>
            </div>
          )}
          <div className="recommendation-row">
            <button className="danger-button" type="button" disabled={!validation?.canImport} onClick={importPending}>ط¬ط§غŒع¯ط²غŒظ†غŒ ع©ط§ظ…ظ„ ط¨ط§ ظپط§غŒظ„</button>
          </div>
        </section>

        <section className="panel">
          <h2>ظ†ط§ط­غŒظ‡ ط®ط·ط±</h2>
          <p>Reset demo ظ‚ط¨ظ„ ط§ط² ط§ط¬ط±ط§ snapshot ط®ظˆط¯ع©ط§ط± ظ…غŒâ€Œط³ط§ط²ط¯.</p>
          <button className="danger-button" type="button" onClick={dangerousReset}>Reset demo ط¨ط§ ظ‡ط´ط¯ط§ط± ط¬ط¯غŒ</button>
        </section>
      </section>

      <section className="panel">
        <div className="section-head">
          <h2>Snapshotظ‡ط§</h2>
          <span className="inline-note">ع©ظ„غŒط¯ ط°ط®غŒط±ظ‡: {workforceSnapshotStorageKey}</span>
        </div>
        <div className="entity-table">
          {snapshots.map((snapshot) => (
            <article key={snapshot.id}>
              <div className="entity-main">
                <div><small>ط¹ظ†ظˆط§ظ†</small><strong>{snapshot.title}</strong></div>
                <div><small>ط²ظ…ط§ظ†</small><strong>{toPersianNumber(new Date(snapshot.createdAt).toLocaleString("fa-IR"))}</strong></div>
                <div><small>ظ†ظˆط¹</small><strong>{snapshot.isAuto ? "ط®ظˆط¯ع©ط§ط±" : "ط¯ط³طھغŒ"}</strong></div>
              </div>
              <div className="row-actions">
                <StatusBadge tone={snapshot.isAuto ? "focus" : "info"}>{snapshot.reason}</StatusBadge>
                <button className="ghost-button" type="button" onClick={() => restoreSnapshot(snapshot.id)}>ط¨ط§ط²غŒط§ط¨غŒ</button>
                <button className="danger-button" type="button" onClick={() => deleteSnapshot(snapshot.id)}>ط­ط°ظپ</button>
              </div>
            </article>
          ))}
          {!snapshots.length && <p>ظ‡ظ†ظˆط² snapshot ط°ط®غŒط±ظ‡ ظ†ط´ط¯ظ‡ ط§ط³طھ.</p>}
        </div>
      </section>
    </div>
  );
}

function SettingsPage({
  settings,
  saveSettings,
  resetSettings,
}: {
  settings: AnalysisSettings;
  saveSettings: (settings: AnalysisSettings) => void;
  resetSettings: () => void;
}) {
  const [form, setForm] = useState(settings);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  const submit = () => {
    if (form.storeWorkingHours.startTime >= form.storeWorkingHours.endTime) {
      setError("ط³ط§ط¹طھ ظ¾ط§غŒط§ظ† ظپط±ظˆط´ع¯ط§ظ‡ ط¨ط§غŒط¯ ط¨ط¹ط¯ ط§ط² ط³ط§ط¹طھ ط´ط±ظˆط¹ ط¨ط§ط´ط¯.");
      return;
    }
    if (form.workloadCriticalHours <= form.workloadWarningHours) {
      setError("ط¢ط³طھط§ظ†ظ‡ ط¨ط­ط±ط§ظ†غŒ ط¨ط§غŒط¯ ط¨غŒط´طھط± ط§ط² ط¢ط³طھط§ظ†ظ‡ ظ‡ط´ط¯ط§ط± ط¨ط§ط´ط¯.");
      return;
    }
    if (form.riskImpact.critical <= form.riskImpact.warning || form.riskImpact.warning <= form.riskImpact.info) {
      setError("ط§ظ…طھغŒط§ط² ط±غŒط³ع© ط¨ط§غŒط¯ ط¨ظ‡ طھط±طھغŒط¨ criticalطŒ warning ظˆ info ظ†ط²ظˆظ„غŒ ط¨ط§ط´ط¯.");
      return;
    }
    saveSettings(form);
    setError("");
    setSaved(true);
  };

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <span className="eyebrow">طھظ†ط¸غŒظ…ط§طھ طھط­ظ„غŒظ„</span>
          <h1>ط¢ط³طھط§ظ†ظ‡â€Œظ‡ط§غŒ ظ…ط؛ط² ط³غŒط³طھظ…</h1>
          <p>ط§غŒظ† ظ…ظ‚ط§ط¯غŒط± ط¯ط± ظ…ط±ظˆط±ع¯ط± ط°ط®غŒط±ظ‡ ظ…غŒâ€Œط´ظˆظ†ط¯ ظˆ ظ…ط­ط§ط³ط¨ظ‡ ط¯ط§ط´ط¨ظˆط±ط¯ ظˆ ط¬ط²ط¦غŒط§طھ طھط­ظ„غŒظ„ ط±ط§ طھط؛غŒغŒط± ظ…غŒâ€Œط¯ظ‡ظ†ط¯.</p>
        </div>
      </header>

      <section className="management-layout">
        <section className="config-card">
          <h2>طھظ†ط¸غŒظ…ط§طھ ظ‚ط§ط¨ظ„ ظˆغŒط±ط§غŒط´</h2>
          {error && <p className="form-error">{error}</p>}
          {saved && !error && <p className="success-note">طھظ†ط¸غŒظ…ط§طھ ط°ط®غŒط±ظ‡ ط´ط¯.</p>}
          <div className="field-grid">
            <TextField label="ط´ط±ظˆط¹ ظپط¹ط§ظ„غŒطھ ظپط±ظˆط´ع¯ط§ظ‡" type="time" value={form.storeWorkingHours.startTime} onChange={(startTime) => setForm({ ...form, storeWorkingHours: { ...form.storeWorkingHours, startTime } })} />
            <TextField label="ظ¾ط§غŒط§ظ† ظپط¹ط§ظ„غŒطھ ظپط±ظˆط´ع¯ط§ظ‡" type="time" value={form.storeWorkingHours.endTime} onChange={(endTime) => setForm({ ...form, storeWorkingHours: { ...form.storeWorkingHours, endTime } })} />
            <TextField label="ط¢ط³طھط§ظ†ظ‡ ظپط´ط§ط± ع©ط§ط±غŒ ظ‡ط´ط¯ط§ط±" type="number" value={form.workloadWarningHours} onChange={(value) => setForm({ ...form, workloadWarningHours: Number(value) })} />
            <TextField label="ط¢ط³طھط§ظ†ظ‡ ظپط´ط§ط± ع©ط§ط±غŒ ط¨ط­ط±ط§ظ†غŒ" type="number" value={form.workloadCriticalHours} onChange={(value) => setForm({ ...form, workloadCriticalHours: Number(value) })} />
            <TextField label="ط§ظ…طھغŒط§ط² ط±غŒط³ع© critical" type="number" value={form.riskImpact.critical} onChange={(value) => setForm({ ...form, riskImpact: { ...form.riskImpact, critical: Number(value) } })} />
            <TextField label="ط§ظ…طھغŒط§ط² ط±غŒط³ع© warning" type="number" value={form.riskImpact.warning} onChange={(value) => setForm({ ...form, riskImpact: { ...form.riskImpact, warning: Number(value) } })} />
            <TextField label="ط§ظ…طھغŒط§ط² ط±غŒط³ع© info" type="number" value={form.riskImpact.info} onChange={(value) => setForm({ ...form, riskImpact: { ...form.riskImpact, info: Number(value) } })} />
            <TextField label="طھط¹ط¯ط§ط¯ ط¢غŒطھظ…â€Œظ‡ط§غŒ ظ…ظ‡ظ… ط¯ط§ط´ط¨ظˆط±ط¯" type="number" value={form.dashboardImportantItemCount} onChange={(value) => setForm({ ...form, dashboardImportantItemCount: Math.max(1, Number(value)) })} />
          </div>
          <div className="form-actions">
            <button className="primary-button" type="button" onClick={submit}>ط°ط®غŒط±ظ‡ طھظ†ط¸غŒظ…ط§طھ</button>
            <button className="ghost-button" type="button" onClick={() => {
              resetSettings();
              setSaved(false);
              setError("");
            }}>ط¨ط§ط²ع¯ط´طھ ط¨ظ‡ ظ¾غŒط´â€Œظپط±ط¶</button>
          </div>
        </section>
        <InfoPanel
          title="ط§ط«ط± طھظ†ط¸غŒظ…ط§طھ"
          items={[
            { title: "ظپط±ظˆط´ع¯ط§ظ‡", caption: "ظ‚ط§ظ†ظˆظ† ظ¾ظˆط´ط´ ظپط±ظˆط´ع¯ط§ظ‡ ط§ط² ط³ط§ط¹طھ ط´ط±ظˆط¹ ظˆ ظ¾ط§غŒط§ظ† ط§ط³طھظپط§ط¯ظ‡ ظ…غŒâ€Œع©ظ†ط¯.", tone: "sales" },
            { title: "ظپط´ط§ط± ع©ط§ط±غŒ", caption: "ظ‚ط§ظ†ظˆظ† ظپط´ط§ط± ع©ط§ط±غŒ ط§ط² ط¢ط³طھط§ظ†ظ‡â€Œظ‡ط§غŒ ظ‡ط´ط¯ط§ط± ظˆ ط¨ط­ط±ط§ظ†غŒ ظ…غŒâ€Œط®ظˆط§ظ†ط¯.", tone: "warn" },
            { title: "ط§ظ…طھغŒط§ط² ع©ظ†طھط±ظ„", caption: "totalRiskScore ظˆ controlScore ط§ط² ط§ظ…طھغŒط§ط²ظ‡ط§غŒ ط±غŒط³ع© طھظ†ط¸غŒظ…â€Œط´ط¯ظ‡ ط³ط§ط®طھظ‡ ظ…غŒâ€Œط´ظˆظ†ط¯.", tone: "info" },
          ]}
        />
      </section>
    </div>
  );
}

function compatibilityLabel(value: WorkCompatibility) {
  if (value === "preferred") return "طھط±ط¬غŒط­غŒ";
  if (value === "allowed") return "ظ…ط¬ط§ط²";
  if (value === "warning") return "ظ‡ط´ط¯ط§ط±";
  return "ظ…ط³ط¯ظˆط¯";
}

function compatibilityTone(value: WorkCompatibility): StatusTone {
  if (value === "preferred") return "good";
  if (value === "allowed") return "info";
  if (value === "warning") return "warn";
  return "critical";
}

function CompatibilityPage({
  spaces,
  taskTypes,
  compatibilityRules,
  updateCompatibility,
  resetCompatibility,
}: {
  spaces: Space[];
  taskTypes: TaskType[];
  compatibilityRules: WorkCompatibilityRule[];
  updateCompatibility: (taskTypeId: string, spaceId: string, changes: Partial<WorkCompatibilityRule>) => void;
  resetCompatibility: () => void;
}) {
  const [taskFilter, setTaskFilter] = useState("");
  const [spaceFilter, setSpaceFilter] = useState("");
  const [saved, setSaved] = useState(false);
  const activeTasks = taskTypes.filter((task) => task.isActive && (!taskFilter || task.id === taskFilter));
  const activeSpaces = spaces.filter((space) => space.isActive && (!spaceFilter || space.id === spaceFilter));

  const getRule = (taskTypeId: string, spaceId: string) =>
    compatibilityRules.find((rule) => rule.taskTypeId === taskTypeId && rule.spaceId === spaceId);

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <span className="eyebrow">ط³ط§ط²ع¯ط§ط±غŒ P4</span>
          <h1>ظ…ط§طھط±غŒط³ ظپط¶ط§ ظˆ ظ†ظˆط¹ ع©ط§ط±</h1>
          <p>ط§غŒظ† ظˆط¶ط¹غŒطھâ€Œظ‡ط§ ط¨ظ‡ ظ‚ط§ظ†ظˆظ† ط³ط§ط²ع¯ط§ط±غŒ analyzer ظˆطµظ„ ظ‡ط³طھظ†ط¯ ظˆ ط±ظˆغŒ findings ط§ط«ط± ظ…غŒâ€Œع¯ط°ط§ط±ظ†ط¯.</p>
        </div>
        <div className="hero-actions">
          <button className="ghost-button" type="button" onClick={() => { resetCompatibility(); setSaved(false); }}>
            <RotateCcw size={17} /> reset demo
          </button>
          <button className="primary-button" type="button" onClick={() => setSaved(true)}>ط°ط®غŒط±ظ‡ طھط؛غŒغŒط±ط§طھ</button>
        </div>
      </header>

      <section className="filter-bar">
        <Filter size={16} />
        <select value={taskFilter} onChange={(event) => setTaskFilter(event.target.value)}>
          {optionList(taskTypes, "ظ‡ظ…ظ‡ ظ†ظˆط¹ ع©ط§ط±ظ‡ط§").map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
        </select>
        <select value={spaceFilter} onChange={(event) => setSpaceFilter(event.target.value)}>
          {optionList(spaces, "ظ‡ظ…ظ‡ ظپط¶ط§ظ‡ط§").map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
        </select>
        {saved && <span className="inline-note">طھط؛غŒغŒط±ط§طھ ط¯ط± localStorage ط°ط®غŒط±ظ‡ ط´ط¯ظ‡â€Œط§ظ†ط¯.</span>}
      </section>

      <section className="compatibility-shell">
        <div className="compatibility-grid" style={{ gridTemplateColumns: `12rem repeat(${activeSpaces.length}, minmax(12rem, 1fr))` }}>
          <div className="compatibility-head">ظ†ظˆط¹ ع©ط§ط± / ظپط¶ط§</div>
          {activeSpaces.map((space) => <div className="compatibility-head" key={space.id}>{space.name}</div>)}
          {activeTasks.map((task) => (
            <div className="compatibility-row" key={task.id}>
              <div className="compatibility-task"><strong>{task.name}</strong><span>{task.category}</span></div>
              {activeSpaces.map((space) => {
                const rule = getRule(task.id, space.id);
                const value = rule?.compatibility ?? "allowed";
                return (
                  <div className={`compatibility-cell tone-${compatibilityTone(value)}`} key={`${task.id}-${space.id}`}>
                    <StatusBadge tone={compatibilityTone(value)}>{compatibilityLabel(value)}</StatusBadge>
                    <select
                      value={value}
                      onChange={(event) => {
                        updateCompatibility(task.id, space.id, { compatibility: event.target.value as WorkCompatibility, isActive: true });
                        setSaved(false);
                      }}
                    >
                      <option value="preferred">طھط±ط¬غŒط­غŒ</option>
                      <option value="allowed">ظ…ط¬ط§ط²</option>
                      <option value="warning">ظ‡ط´ط¯ط§ط±</option>
                      <option value="blocked">ظ…ط³ط¯ظˆط¯</option>
                    </select>
                    <textarea
                      value={rule?.reason ?? ""}
                      placeholder="ط¯ظ„غŒظ„ ع©ظˆطھط§ظ‡"
                      onChange={(event) => {
                        updateCompatibility(task.id, space.id, { reason: event.target.value, compatibility: value, isActive: true });
                        setSaved(false);
                      }}
                    />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function verdictLabel(verdict: string) {
  if (verdict === "improved") return "ط¨ظ‡طھط± ط´ط¯";
  if (verdict === "worsened") return "ط¨ط¯طھط± ط´ط¯";
  return "طھظ‚ط±غŒط¨ط§ ط¨ط¯ظˆظ† طھط؛غŒغŒط±";
}

function verdictTone(verdict: string): StatusTone {
  if (verdict === "improved") return "good";
  if (verdict === "worsened") return "critical";
  return "info";
}

function SimulatorPage({
  spaces,
  employees,
  taskTypes,
  scheduleItems,
  rules,
  settings,
  compatibilityRules,
  updateScheduleItem,
}: {
  spaces: Space[];
  employees: Employee[];
  taskTypes: TaskType[];
  scheduleItems: WeeklyScheduleItem[];
  rules: AnalysisRule[];
  settings: AnalysisSettings;
  compatibilityRules: WorkCompatibilityRule[];
  updateScheduleItem: (id: string, changes: Partial<WeeklyScheduleItem>) => void;
}) {
  const analysis = analyzeWorkforce({ spaces, employees, taskTypes, scheduleItems, rules, settings, compatibilityRules });
  const params = new URLSearchParams(window.location.search);
  const finding = analysis.findings.find((item) => item.id === params.get("findingId"));
  const scenarioId = params.get("scenarioId");
  const scenarioChange = finding
    ? rankRecommendationScenarios(generateRecommendationScenarios({ spaces, employees, taskTypes, scheduleItems, rules, settings, compatibilityRules }, finding)).find((scenario) => scenario.id === scenarioId)?.change
    : undefined;
  const initialChange = scenarioChange ?? buildInitialSimulationFromFinding(finding, scheduleItems, spaces);
  const firstItem = scheduleItems.find((item) => item.isActive);
  const fallbackChange: SimulationChange = {
    scheduleItemId: firstItem?.id ?? "",
    newDayOfWeek: firstItem?.day,
    newStartTime: firstItem?.startTime,
    newEndTime: firstItem?.endTime,
    newSpaceId: firstItem?.spaceId,
    newEmployeeId: firstItem?.employeeId,
    newTaskTypeId: firstItem?.taskTypeId,
  };
  const [change, setChange] = useState<SimulationChange>(initialChange ?? fallbackChange);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const selectedItem = scheduleItems.find((item) => item.id === change.scheduleItemId);
  const simulatedChange = {
    ...change,
    newDayOfWeek: change.newDayOfWeek ?? selectedItem?.day,
    newStartTime: change.newStartTime ?? selectedItem?.startTime,
    newEndTime: change.newEndTime ?? selectedItem?.endTime,
    newSpaceId: change.newSpaceId ?? selectedItem?.spaceId,
    newEmployeeId: change.newEmployeeId ?? selectedItem?.employeeId,
    newTaskTypeId: change.newTaskTypeId ?? selectedItem?.taskTypeId,
  };

  const runSimulation = () => {
    if (!selectedItem || !simulatedChange.newStartTime || !simulatedChange.newEndTime || simulatedChange.newStartTime >= simulatedChange.newEndTime) return;
    setResult(simulateScheduleChange({
      spaces,
      employees,
      taskTypes,
      scheduleItems,
      rules,
      settings,
      compatibilityRules,
    }, simulatedChange));
  };

  const applyChange = () => {
    if (!selectedItem) return;
    const ok = window.confirm("ط§غŒظ† طھط؛غŒغŒط± ط±ظˆغŒ ط¨ط±ظ†ط§ظ…ظ‡ ط§طµظ„غŒ ط§ط¹ظ…ط§ظ„ ط´ظˆط¯طں ظپظ‚ط· ظ‡ظ…غŒظ† ط¢غŒطھظ… ظˆغŒط±ط§غŒط´ ظ…غŒâ€Œط´ظˆط¯.");
    if (!ok) return;
    updateScheduleItem(selectedItem.id, {
      day: simulatedChange.newDayOfWeek,
      startTime: simulatedChange.newStartTime,
      endTime: simulatedChange.newEndTime,
      spaceId: simulatedChange.newSpaceId,
      employeeId: simulatedChange.newEmployeeId,
      taskTypeId: simulatedChange.newTaskTypeId,
    });
    window.location.href = `/organization/workforce-dashboard/schedule?itemId=${selectedItem.id}`;
  };

  const itemLabel = (item: WeeklyScheduleItem) => {
    const employee = employees.find((row) => row.id === item.employeeId)?.name ?? "ع©ط§ط±ظ…ظ†ط¯";
    const space = spaces.find((row) => row.id === item.spaceId)?.name ?? "ظپط¶ط§";
    const task = taskTypes.find((row) => row.id === item.taskTypeId)?.name ?? "ظ†ظˆط¹ ع©ط§ط±";
    return `${item.day} ${toPersianNumber(item.startTime)}-${toPersianNumber(item.endTime)} | ${employee} | ${space} | ${task}`;
  };

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <span className="eyebrow">ط´ط¨غŒظ‡â€Œط³ط§ط² P5</span>
          <h1>طھط³طھ ط¬ط§ط¨ظ‡â€Œط¬ط§غŒغŒ ط¨ط±ظ†ط§ظ…ظ‡</h1>
          <p>ط³ظ†ط§ط±غŒظˆ ط±ظˆغŒ ع©ظ¾غŒ ظ…ظˆظ‚طھ ط¨ط±ظ†ط§ظ…ظ‡ طھط­ظ„غŒظ„ ظ…غŒâ€Œط´ظˆط¯ ظˆ ط¯ط§ط¯ظ‡ ط§طµظ„غŒ طھط؛غŒغŒط± ظ†ظ…غŒâ€Œع©ظ†ط¯.</p>
        </div>
        <a className="ghost-button" href="/organization/workforce-dashboard/analysis">ط¨ط§ط²ع¯ط´طھ ط¨ظ‡ طھط­ظ„غŒظ„</a>
      </header>

      {finding && (
        <section className="panel">
          <h2>غŒط§ظپطھظ‡ ظ…ط¨ظ†ط§</h2>
          <div className="panel-row tone-warn">
            <StatusBadge tone={severityTone(finding.severity)}>{severityLabel(finding.severity)}</StatusBadge>
            <p>{finding.title} | {finding.recommendation}</p>
          </div>
        </section>
      )}

      <section className="management-layout">
        <section className="config-card">
          <h2>ط³ظ†ط§ط±غŒظˆغŒ ظپط±ط¶غŒ</h2>
          <div className="field-grid">
            <SelectField label="ط¢غŒطھظ… ط¨ط±ظ†ط§ظ…ظ‡" value={change.scheduleItemId} options={scheduleItems.filter((item) => item.isActive).map((item) => ({ label: itemLabel(item), value: item.id }))} onChange={(scheduleItemId) => {
              const item = scheduleItems.find((row) => row.id === scheduleItemId);
              setChange({
                scheduleItemId,
                newDayOfWeek: item?.day,
                newStartTime: item?.startTime,
                newEndTime: item?.endTime,
                newSpaceId: item?.spaceId,
                newEmployeeId: item?.employeeId,
                newTaskTypeId: item?.taskTypeId,
              });
              setResult(null);
            }} />
            <SelectField label="ط±ظˆط² ط¬ط¯غŒط¯" value={simulatedChange.newDayOfWeek ?? ""} options={weekDays.map((day) => ({ label: day, value: day }))} onChange={(newDayOfWeek) => setChange({ ...change, newDayOfWeek: newDayOfWeek as WorkDay })} />
            <TextField label="ط´ط±ظˆط¹ ط¬ط¯غŒط¯" type="time" value={simulatedChange.newStartTime ?? ""} onChange={(newStartTime) => setChange({ ...change, newStartTime })} />
            <TextField label="ظ¾ط§غŒط§ظ† ط¬ط¯غŒط¯" type="time" value={simulatedChange.newEndTime ?? ""} onChange={(newEndTime) => setChange({ ...change, newEndTime })} />
            <SelectField label="ظپط¶ط§غŒ ط¬ط¯غŒط¯" value={simulatedChange.newSpaceId ?? ""} options={optionList(spaces)} onChange={(newSpaceId) => setChange({ ...change, newSpaceId })} />
            <SelectField label="ع©ط§ط±ظ…ظ†ط¯ ط¬ط¯غŒط¯" value={simulatedChange.newEmployeeId ?? ""} options={optionList(employees)} onChange={(newEmployeeId) => setChange({ ...change, newEmployeeId })} />
            <SelectField label="ظ†ظˆط¹ ع©ط§ط± ط¬ط¯غŒط¯" value={simulatedChange.newTaskTypeId ?? ""} options={optionList(taskTypes)} onChange={(newTaskTypeId) => setChange({ ...change, newTaskTypeId })} />
          </div>
          <div className="form-actions">
            <button className="primary-button" type="button" onClick={runSimulation}>طھط­ظ„غŒظ„ ط³ظ†ط§ط±غŒظˆ</button>
            <button className="ghost-button" type="button" onClick={() => { setChange(initialChange ?? fallbackChange); setResult(null); }}>ط¨ط§ط²ع¯ط´طھ ط¨ظ‡ ط­ط§ظ„طھ ط§ظˆظ„غŒظ‡</button>
            <button className="danger-button" type="button" onClick={applyChange} disabled={!result}>ط§ط¹ظ…ط§ظ„ طھط؛غŒغŒط± ط¨ظ‡ ط¨ط±ظ†ط§ظ…ظ‡ ط§طµظ„غŒ</button>
          </div>
        </section>

        <section className="config-card">
          <h2>ظˆط¶ط¹غŒطھ ظپط¹ظ„غŒ ط¢غŒطھظ…</h2>
          {selectedItem ? (
            <div className="panel-row">
              <StatusBadge tone="info">{selectedItem.day}</StatusBadge>
              <p>{itemLabel(selectedItem)}</p>
            </div>
          ) : <p>ط¢غŒطھظ…غŒ ط¨ط±ط§غŒ ط´ط¨غŒظ‡â€Œط³ط§ط²غŒ ظˆط¬ظˆط¯ ظ†ط¯ط§ط±ط¯.</p>}
        </section>
      </section>

      {result && (
        <section className="page-stack">
          <section className="simulation-compare">
            <article className="kpi-card tone-info"><div><p>ظ‚ط¨ظ„</p><strong>{toPersianNumber(result.originalAnalysis.controlScore)}</strong><span>ع©ظ†طھط±ظ„ | ط±غŒط³ع© {toPersianNumber(result.originalAnalysis.totalRiskScore)}</span></div></article>
            <article className="kpi-card tone-focus"><div><p>ط¨ط¹ط¯</p><strong>{toPersianNumber(result.simulatedAnalysis.controlScore)}</strong><span>ع©ظ†طھط±ظ„ | ط±غŒط³ع© {toPersianNumber(result.simulatedAnalysis.totalRiskScore)}</span></div></article>
            <article className={`kpi-card tone-${verdictTone(result.verdict)}`}><div><p>طھط؛غŒغŒط±</p><strong>{toPersianNumber(result.controlScoreDelta)}</strong><span>ط±غŒط³ع© {toPersianNumber(result.riskScoreDelta)}</span></div></article>
            <article className={`kpi-card tone-${verdictTone(result.verdict)}`}><div><p>ظ†طھغŒط¬ظ‡</p><strong>{verdictLabel(result.verdict)}</strong><span>{result.summary}</span></div></article>
          </section>
          <section className="bottom-grid">
            <InfoPanel title="ظ‡ط´ط¯ط§ط±ظ‡ط§غŒ ط­ظ„â€Œط´ط¯ظ‡" items={result.resolvedFindings.slice(0, 4).map((item) => ({ title: item.title, caption: item.recommendation, tone: severityTone(item.severity) }))} />
            <InfoPanel title="ظ‡ط´ط¯ط§ط±ظ‡ط§غŒ ط¬ط¯غŒط¯" items={result.newFindings.slice(0, 4).map((item) => ({ title: item.title, caption: item.recommendation, tone: severityTone(item.severity) }))} />
            <InfoPanel title="ط¨ط¯طھط± ط´ط¯ظ‡â€Œظ‡ط§" items={result.worsenedFindings.slice(0, 4).map((item) => ({ title: item.title, caption: item.recommendation, tone: severityTone(item.severity) }))} />
          </section>
        </section>
      )}
    </div>
  );
}

function CurrentPage({ forcedPage }: { forcedPage?: string }) {
  const { state, createItem, updateItem, deactivateItem, resetDemo } = useWorkforceStore();
  const { settings, saveSettings, resetSettings } = useAnalysisSettings();
  const { compatibilityRules, updateCompatibility, resetCompatibility } = useCompatibilityRules(state.taskTypes, state.spaces);
  const page = useMemo(() => forcedPage ?? route, [forcedPage]);
  const highlightedScheduleItemId = useMemo(() => new URLSearchParams(window.location.search).get("itemId") ?? undefined, []);
  const resetDemoWithSnapshot = () => {
    workforceBackupService.createAutoSnapshotBeforeChange("before-reset-demo");
    resetDemo();
  };

  if (page === "/organization/workforce-dashboard/spaces") {
    return (
      <SpacesPage
        createItem={(draft) => createItem("spaces", draft)}
        deactivateItem={(id) => deactivateItem("spaces", id)}
        resetDemo={resetDemoWithSnapshot}
        spaces={state.spaces}
        updateItem={(id, changes) => updateItem("spaces", id, changes)}
      />
    );
  }
  if (page === "/organization/workforce-dashboard/employees") {
    return (
      <EmployeesPage
        createItem={(draft) => createItem("employees", draft)}
        deactivateItem={(id) => deactivateItem("employees", id)}
        employees={state.employees}
        resetDemo={resetDemoWithSnapshot}
        spaces={state.spaces}
        updateItem={(id, changes) => updateItem("employees", id, changes)}
      />
    );
  }
  if (page === "/organization/workforce-dashboard/tasks") {
    return (
      <TasksPage
        createItem={(draft) => createItem("taskTypes", draft)}
        deactivateItem={(id) => deactivateItem("taskTypes", id)}
        resetDemo={resetDemoWithSnapshot}
        spaces={state.spaces}
        taskTypes={state.taskTypes}
        updateItem={(id, changes) => updateItem("taskTypes", id, changes)}
      />
    );
  }
  if (page === "/organization/workforce-dashboard/schedule") {
    return (
      <SchedulePage
        createItem={(draft) => createItem("scheduleItems", draft)}
        deactivateItem={(id) => deactivateItem("scheduleItems", id)}
        employees={state.employees}
        resetDemo={resetDemoWithSnapshot}
        scheduleItems={state.scheduleItems}
        highlightedItemId={highlightedScheduleItemId}
        spaces={state.spaces}
        taskTypes={state.taskTypes}
        updateItem={(id, changes) => updateItem("scheduleItems", id, changes)}
      />
    );
  }
  if (page === "/organization/workforce-dashboard/rules") {
    return <RulesPage resetDemo={resetDemoWithSnapshot} rules={state.rules} updateItem={(id, changes) => updateItem("rules", id, changes)} />;
  }
  if (page === "/organization/workforce-dashboard/analysis") {
    return (
      <AnalysisDetailsPage
        employees={state.employees}
        rules={state.rules}
        scheduleItems={state.scheduleItems}
        settings={settings}
        compatibilityRules={compatibilityRules}
        spaces={state.spaces}
        taskTypes={state.taskTypes}
      />
    );
  }
  if (page === "/organization/workforce-dashboard/recommendations") {
    return (
      <RecommendationsPage
        compatibilityRules={compatibilityRules}
        employees={state.employees}
        rules={state.rules}
        scheduleItems={state.scheduleItems}
        settings={settings}
        spaces={state.spaces}
        taskTypes={state.taskTypes}
        updateScheduleItem={(id, changes) => updateItem("scheduleItems", id, changes)}
      />
    );
  }
  if (page === "/organization/workforce-dashboard/decision-queue") {
    return (
      <DecisionQueuePage
        compatibilityRules={compatibilityRules}
        employees={state.employees}
        rules={state.rules}
        scheduleItems={state.scheduleItems}
        settings={settings}
        spaces={state.spaces}
        taskTypes={state.taskTypes}
        updateScheduleItem={(id, changes) => updateItem("scheduleItems", id, changes)}
      />
    );
  }
  if (page === "/organization/workforce-dashboard/decision-report" || page === "/organization/workforce-dashboard/decision-reports") {
    return <DecisionReportPage />;
  }
  if (page === "/organization/workforce-dashboard/report-archive") {
    return <ReportArchivePage />;
  }
  if (page === "/organization/workforce-dashboard/report-comparison") {
    return <ReportArchivePage comparisonOnly />;
  }
  if (page === "/organization/workforce-dashboard/monthly-health") {
    return <MonthlyHealthPage />;
  }
  if (page === "/organization/workforce-dashboard/preventive-alerts") {
    return <PreventiveAlertsPage />;
  }
  if (page === "/organization/workforce-dashboard/readiness") {
    return (
      <ReadinessPage
        employees={state.employees}
        rules={state.rules}
        scheduleItems={state.scheduleItems}
        settings={settings}
        spaces={state.spaces}
        taskTypes={state.taskTypes}
      />
    );
  }
  if (page === "/organization/workforce-dashboard/launch-checklist") {
    return (
      <LaunchChecklistPage
        employees={state.employees}
        rules={state.rules}
        scheduleItems={state.scheduleItems}
        settings={settings}
        spaces={state.spaces}
        taskTypes={state.taskTypes}
      />
    );
  }
  if (page === "/organization/workforce-dashboard/launch-signoff") {
    return (
      <LaunchSignoffPage
        compatibilityRules={compatibilityRules}
        employees={state.employees}
        rules={state.rules}
        scheduleItems={state.scheduleItems}
        settings={settings}
        spaces={state.spaces}
        taskTypes={state.taskTypes}
      />
    );
  }
  if (page === "/organization/workforce-dashboard/baseline-drift") {
    return <BaselineDriftPage />;
  }
  if (page === "/organization/workforce-dashboard/operational-history") {
    return <OperationalHistoryPage />;
  }
  if (page === "/organization/workforce-dashboard/history-retention") {
    return <HistoryRetentionPage />;
  }
  if (page === "/organization/workforce-dashboard/operations-calendar") {
    return (
      <OperationsCalendarPage
        employees={state.employees}
        rules={state.rules}
        scheduleItems={state.scheduleItems}
        settings={settings}
        spaces={state.spaces}
        taskTypes={state.taskTypes}
      />
    );
  }
  if (page === "/organization/workforce-dashboard/operations-control-settings") {
    return (
      <OperationsControlSettingsPage
        employees={state.employees}
        rules={state.rules}
        scheduleItems={state.scheduleItems}
        settings={settings}
        spaces={state.spaces}
        taskTypes={state.taskTypes}
      />
    );
  }
  if (page === "/organization/workforce-dashboard/data-center") {
    return <DataCenterPage resetDemo={resetDemoWithSnapshot} />;
  }
  if (page === "/organization/workforce-dashboard/maintenance") {
    return <MaintenancePage />;
  }
  if (page === "/organization/workforce-dashboard/compatibility") {
    return (
      <CompatibilityPage
        compatibilityRules={compatibilityRules}
        resetCompatibility={resetCompatibility}
        spaces={state.spaces}
        taskTypes={state.taskTypes}
        updateCompatibility={updateCompatibility}
      />
    );
  }
  if (page === "/organization/workforce-dashboard/simulator") {
    return (
      <SimulatorPage
        compatibilityRules={compatibilityRules}
        employees={state.employees}
        rules={state.rules}
        scheduleItems={state.scheduleItems}
        settings={settings}
        spaces={state.spaces}
        taskTypes={state.taskTypes}
        updateScheduleItem={(id, changes) => updateItem("scheduleItems", id, changes)}
      />
    );
  }
  if (page === "/organization/workforce-dashboard/settings") {
    return <SettingsPage resetSettings={resetSettings} saveSettings={saveSettings} settings={settings} />;
  }
  return (
    <DashboardPageV2
      employees={state.employees}
      resetDemo={resetDemoWithSnapshot}
      rules={state.rules}
      scheduleItems={state.scheduleItems}
      settings={settings}
      compatibilityRules={compatibilityRules}
      spaces={state.spaces}
      taskTypes={state.taskTypes}
    />
  );
}

export function WorkforceRoutePage() {
  return <CurrentPage />;
}

export function WorkforceRoutePageByPath({ path }: { path: string }) {
  return <CurrentPage forcedPage={path} />;
}
