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
import OperationalHistoryPage from "./pages/workforce/operations/OperationalHistoryPage";
import DataCenterPage from "./pages/workforce/system/DataCenterPage";
import {
  currentBaselineDriftReport,
  driftLevelLabel,
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
import { workforceBackupService } from "./services/workforceBackupService";
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
  MaintenanceHealthStatus,
  MaintenanceIssue,
  MaintenanceIssueSeverity,
  LaunchChecklistItem,
  LaunchChecklistStatus,
  LaunchSignoffReport,
  BaselineDriftChange,
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

function optionList<T extends { id: string; name: string; isActive: boolean }>(rows: T[], emptyLabel = "انتخاب کنید") {
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
    { label: "وضعیت هفته", value: conflicts ? "نیازمند توجه" : "پایدار", caption: `${toPersianNumber(activeSchedule.length)} آیتم ثبت‌شده`, tone: conflicts ? "warn" : "good", icon: CheckCircle2 },
    { label: "هشدارهای فعال", value: toPersianNumber(urgentCount), caption: `${toPersianNumber(activeRuleCount)} قانون فعال`, tone: urgentCount ? "warn" : "good", icon: AlertTriangle },
    { label: "پوشش فروشگاه", value: toPersianNumber(salesItems), caption: "آیتم‌های فروش و مشتری", tone: "sales", icon: Store },
    { label: "زمان تمرکز", value: toPersianNumber(focusItems), caption: "بازه‌های تمرکزی ثبت‌شده", tone: "focus", icon: Brain },
    { label: "تداخل‌ها", value: toPersianNumber(conflicts), caption: "هم‌پوشانی فضا و زمان", tone: conflicts ? "critical" : "good", icon: Flame },
  ] satisfies { label: string; value: string; caption: string; tone: StatusTone; icon: typeof CheckCircle2 }[];

  const capacityItems = activeSpaces.map((space) => {
    const used = activeSchedule.filter((item) => item.spaceId === space.id).length;
    const usage = Math.min(100, Math.round((used / Math.max(space.normalCapacity * 3, 1)) * 100));
    return {
      name: space.name,
      usage,
      caption: `${toPersianNumber(used)} آیتم در هفته`,
      tone: usage > 85 ? "warn" as StatusTone : space.type.includes("ظپط±ظˆط´") ? "sales" as StatusTone : "good" as StatusTone,
    };
  });

  const urgentAlerts = [
    { title: "تداخل‌ها", caption: conflicts ? `${toPersianNumber(conflicts)} هم‌پوشانی نیازمند بررسی است.` : "تداخل فعالی دیده نشد.", tone: conflicts ? "critical" as StatusTone : "good" as StatusTone },
    { title: "پوشش فروشگاه", caption: salesItems ? `${toPersianNumber(salesItems)} بازه فروش ثبت شده است.` : "برای فروشگاه بازه‌ای ثبت نشده است.", tone: salesItems ? "sales" as StatusTone : "warn" as StatusTone },
    { title: "قوانین", caption: `${toPersianNumber(activeRuleCount)} قانون پایه فعال است.`, tone: "info" as StatusTone },
  ];

  const smartSuggestions = [
    { title: "تمرکز", caption: focusItems ? "بازه‌های تمرکزی را در فضاهای کم‌حواس‌پرتی نگه دارید." : "برای کارهای تمرکزی برنامه ثبت کنید.", tone: "focus" as StatusTone },
    { title: "ظرفیت", caption: "ظرفیت فضاها از داده‌های ذخیره‌شده محاسبه می‌شود.", tone: "info" as StatusTone },
    { title: "پاکسازی demo", caption: "هر زمان لازم بود داده‌ها را به seed اولیه برگردانید.", tone: "empty" as StatusTone },
  ];

  const employeeSummaries = activeEmployees.map((employee) => {
    const defaultSpace = spaces.find((space) => space.id === employee.defaultSpaceId);
    return {
      name: employee.name,
      role: employee.primaryRole || "بدون نقش",
      focus: employee.focusNeed,
      location: defaultSpace?.name ?? "بدون محل",
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
          <span className="eyebrow">داشبورد هفتگی</span>
          <h1>اتاق فرمان هفته</h1>
          <p>نمای زنده از داده‌های ذخیره‌شده در مرورگر؛ آماده برای جایگزینی با دیتابیس در مرحله بعد.</p>
        </div>
        <div className="hero-actions">
          <button className="ghost-button" type="button" onClick={resetDemo}>
            <RotateCcw size={17} /> بازگشت demo
          </button>
          <a className="primary-button" href="/organization/workforce-dashboard/schedule">
            <Sparkles size={17} /> برنامه هفتگی
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
          <InfoPanel title="هشدارهای فوری" items={urgentAlerts} />
          <InfoPanel title="پیشنهادهای هوشمند" items={smartSuggestions} />
          <a className="primary-button full-button" href="/organization/workforce-dashboard/recommendations">
            <Sparkles size={17} /> مشاهده همه پیشنهادها
          </a>
        </div>
      </section>

      <section className="bottom-grid">
        <section className="panel wide-panel">
          <h2>وضعیت خلاصه کارمندها</h2>
          <div className="employee-list">
            {employeeSummaries.map((employee) => (
              <article key={employee.name}>
                <div>
                  <strong>{employee.name}</strong>
                  <span>{employee.role}، تمرکز {employee.focus}</span>
                </div>
                <StatusBadge tone={employee.status}>{employee.location}</StatusBadge>
              </article>
            ))}
          </div>
        </section>
        <section className="panel">
          <h2>نقشه تمرکز هفته</h2>
          <div className="heatmap">
            {focusHeatmap.map((item) => (
              <div className={`heat-cell tone-${item.tone}`} key={item.label}>
                <strong>{toPersianNumber(item.value)}٪</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </section>
        <InfoPanel title="مرکز تصمیم هفته" items={smartSuggestions} />
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
    { label: "نام", render: (item) => item.name },
    { label: "نوع", render: (item) => item.type || "ثبت نشده" },
    { label: "ظرفیت", render: (item) => `${toPersianNumber(item.normalCapacity)} / ${toPersianNumber(item.maxCapacity)}` },
  ];

  const submit = () => {
    if (!form.name.trim()) {
      setError("نام فضا الزامی است.");
      return;
    }
    if (form.normalCapacity < 1 || form.maxCapacity < form.normalCapacity) {
      setError("ظرفیت حداکثر باید از ظرفیت عادی بیشتر یا برابر باشد.");
      return;
    }
    editingId ? updateItem(editingId, form) : createItem(form);
    setForm(blankSpace());
    setEditingId(null);
    setError("");
  };

  return (
    <EntityPanel
      addLabel="افزودن فضا"
      columns={columns}
      editingId={editingId}
      error={error}
      form={
        <>
          <TextField label="نام فضا" value={form.name} onChange={(name) => setForm({ ...form, name })} />
          <TextField label="نوع فضا" value={form.type} onChange={(type) => setForm({ ...form, type })} />
          <TextField label="ظرفیت عادی" type="number" value={form.normalCapacity} onChange={(value) => setForm({ ...form, normalCapacity: Number(value) })} />
          <TextField label="ظرفیت حداکثر" type="number" value={form.maxCapacity} onChange={(value) => setForm({ ...form, maxCapacity: Number(value) })} />
          <SelectField label="سطح حواس‌پرتی" value={form.distractionLevel} options={distractionOptions.map((item) => ({ label: item, value: item }))} onChange={(value) => setForm({ ...form, distractionLevel: value as DistractionLevel })} />
          <SelectField label="وضعیت" value={String(form.isActive)} options={[{ label: "فعال", value: "true" }, { label: "غیرفعال", value: "false" }]} onChange={(value) => setForm({ ...form, isActive: value === "true" })} />
          <ToggleField label="نیازمند همراه" checked={form.requiresCompanion} onChange={(requiresCompanion) => setForm({ ...form, requiresCompanion })} />
          <ToggleField label="کار تک‌نفره مجاز است" checked={form.soloWorkAllowed} onChange={(soloWorkAllowed) => setForm({ ...form, soloWorkAllowed })} />
          <TextAreaField label="توضیحات" value={form.description} onChange={(description) => setForm({ ...form, description })} />
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
      subtitle="تعریف و نگهداری فضاهای کاری، ظرفیت و محدودیت‌های ساده."
      title="مدیریت فضاها"
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
  const spaceOptions = optionList(spaces, "بدون محل پیش‌فرض");
  const columns: EntityColumn<Employee>[] = [
    { label: "نام", render: (item) => item.name },
    { label: "نقش", render: (item) => item.primaryRole || "ثبت نشده" },
    { label: "تمرکز", render: (item) => item.focusNeed },
  ];

  const submit = () => {
    if (!form.name.trim()) {
      setError("نام کارمند الزامی است.");
      return;
    }
    editingId ? updateItem(editingId, form) : createItem(form);
    setForm(blankEmployee());
    setEditingId(null);
    setError("");
  };

  return (
    <EntityPanel
      addLabel="افزودن کارمند"
      columns={columns}
      editingId={editingId}
      error={error}
      form={
        <>
          <TextField label="نام کارمند" value={form.name} onChange={(name) => setForm({ ...form, name })} />
          <TextField label="نقش اصلی" value={form.primaryRole} onChange={(primaryRole) => setForm({ ...form, primaryRole })} />
          <TextField label="مهارت‌ها" value={form.skills.join("، ")} onChange={(value) => setForm({ ...form, skills: value.split(/[طŒ,]/).map((item) => item.trim()).filter(Boolean) })} />
          <SelectField label="سطح نیاز به تمرکز" value={form.focusNeed} options={focusOptions.map((item) => ({ label: item, value: item }))} onChange={(value) => setForm({ ...form, focusNeed: value as FocusLevel })} />
          <SelectField label="محل پیش‌فرض" value={form.defaultSpaceId} options={spaceOptions} onChange={(defaultSpaceId) => setForm({ ...form, defaultSpaceId })} />
          <SelectField label="وضعیت" value={String(form.isActive)} options={[{ label: "فعال", value: "true" }, { label: "غیرفعال", value: "false" }]} onChange={(value) => setForm({ ...form, isActive: value === "true" })} />
          <ToggleField label="مناسب برای فروش" checked={form.goodForSales} onChange={(goodForSales) => setForm({ ...form, goodForSales })} />
          <ToggleField label="مناسب برای تولید" checked={form.goodForProduction} onChange={(goodForProduction) => setForm({ ...form, goodForProduction })} />
          <ToggleField label="مناسب برای دیجیتال" checked={form.goodForDigital} onChange={(goodForDigital) => setForm({ ...form, goodForDigital })} />
          <TextAreaField label="توضیحات" value={form.description} onChange={(description) => setForm({ ...form, description })} />
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
      subtitle="ثبت پروفایل کاری، مهارت‌ها و وضعیت فعالیت اعضای تیم."
      title="مدیریت کارمندان"
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
  const spaceOptions = optionList(spaces, "بدون محل پیشنهادی");
  const columns: EntityColumn<TaskType>[] = [
    { label: "نام", render: (item) => item.name },
    { label: "دسته", render: (item) => item.category || "ثبت نشده" },
    { label: "تمرکز", render: (item) => item.focusNeed },
  ];

  const submit = () => {
    if (!form.name.trim()) {
      setError("نام نوع کار الزامی است.");
      return;
    }
    editingId ? updateItem(editingId, form) : createItem(form);
    setForm(blankTask());
    setEditingId(null);
    setError("");
  };

  return (
    <EntityPanel
      addLabel="افزودن نوع کار"
      columns={columns}
      editingId={editingId}
      error={error}
      form={
        <>
          <TextField label="نام کار" value={form.name} onChange={(name) => setForm({ ...form, name })} />
          <TextField label="دسته کار" value={form.category} onChange={(category) => setForm({ ...form, category })} />
          <SelectField label="نیاز به تمرکز" value={form.focusNeed} options={focusOptions.map((item) => ({ label: item, value: item }))} onChange={(value) => setForm({ ...form, focusNeed: value as FocusLevel })} />
          <SelectField label="محل پیشنهادی" value={form.suggestedSpaceId} options={spaceOptions} onChange={(suggestedSpaceId) => setForm({ ...form, suggestedSpaceId })} />
          <SelectField label="وضعیت" value={String(form.isActive)} options={[{ label: "فعال", value: "true" }, { label: "غیرفعال", value: "false" }]} onChange={(value) => setForm({ ...form, isActive: value === "true" })} />
          <ToggleField label="نیاز به فضای تمیز" checked={form.needsCleanSpace} onChange={(needsCleanSpace) => setForm({ ...form, needsCleanSpace })} />
          <ToggleField label="نیاز به همراه" checked={form.requiresCompanion} onChange={(requiresCompanion) => setForm({ ...form, requiresCompanion })} />
          <ToggleField label="نیاز به حضور مشتری" checked={form.requiresCustomerPresence} onChange={(requiresCustomerPresence) => setForm({ ...form, requiresCustomerPresence })} />
          <TextAreaField label="توضیحات" value={form.description} onChange={(description) => setForm({ ...form, description })} />
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
      subtitle="تعریف نوع کارها، نیازهای تمرکزی و پیشنهاد مکان."
      title="نوع کارها"
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
    { label: "روز", render: (item) => item.day },
    { label: "زمان", render: (item) => `${toPersianNumber(item.startTime)} تا ${toPersianNumber(item.endTime)}` },
    { label: "کارمند", render: (item) => employees.find((employee) => employee.id === item.employeeId)?.name ?? "نامشخص" },
  ];

  const submit = () => {
    if (!form.employeeId || !form.spaceId || !form.taskTypeId) {
      setError("انتخاب کارمند، فضا و نوع کار الزامی است.");
      return;
    }
    if (form.startTime >= form.endTime) {
      setError("ساعت پایان باید بعد از ساعت شروع باشد.");
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
          <span className="eyebrow">برنامه‌ریزی P1</span>
          <h1>برنامه هفتگی</h1>
          <p>افزودن، ویرایش، غیرفعال‌سازی و فیلتر واقعی برنامه هفته.</p>
        </div>
        <div className="hero-actions">
          <button className="ghost-button" type="button" onClick={resetDemo}>
            <RotateCcw size={17} /> بازگشت demo
          </button>
          <button className="primary-button" type="button" onClick={() => setForm({ ...blankSchedule(), employeeId: activeEmployees[0]?.id ?? "", spaceId: activeSpaces[0]?.id ?? "", taskTypeId: activeTasks[0]?.id ?? "" })}>
            <Plus size={17} /> آیتم جدید
          </button>
        </div>
      </header>

      <section className="filter-bar">
        <Filter size={16} />
        <select value={filters.employeeId} onChange={(event) => setFilters({ ...filters, employeeId: event.target.value })}>
          {optionList(employees, "همه کارمندان").map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
        </select>
        <select value={filters.spaceId} onChange={(event) => setFilters({ ...filters, spaceId: event.target.value })}>
          {optionList(spaces, "همه فضاها").map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
        </select>
        <select value={filters.taskTypeId} onChange={(event) => setFilters({ ...filters, taskTypeId: event.target.value })}>
          {optionList(taskTypes, "همه نوع کارها").map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
        </select>
        <select value={filters.day} onChange={(event) => setFilters({ ...filters, day: event.target.value })}>
          {dayOptions().map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
        </select>
      </section>

      <WeeklyGrid compact employees={employees} filters={filters} items={scheduleItems} spaces={spaces} taskTypes={taskTypes} />

      <section className="management-layout">
        <section className="config-card">
          <h2>{editingId ? "ویرایش آیتم برنامه" : "افزودن آیتم برنامه"}</h2>
          {error && <p className="form-error">{error}</p>}
          <div className="field-grid">
            <SelectField label="روز هفته" value={form.day} options={weekDays.map((day) => ({ label: day, value: day }))} onChange={(day) => setForm({ ...form, day: day as WorkDay })} />
            <TextField label="ساعت شروع" type="time" value={form.startTime} onChange={(startTime) => setForm({ ...form, startTime })} />
            <TextField label="ساعت پایان" type="time" value={form.endTime} onChange={(endTime) => setForm({ ...form, endTime })} />
            <SelectField label="کارمند" value={form.employeeId} options={optionList(employees)} onChange={(employeeId) => setForm({ ...form, employeeId })} />
            <SelectField label="فضا" value={form.spaceId} options={optionList(spaces)} onChange={(spaceId) => setForm({ ...form, spaceId })} />
            <SelectField label="نوع کار" value={form.taskTypeId} options={optionList(taskTypes)} onChange={(taskTypeId) => setForm({ ...form, taskTypeId })} />
            <SelectField label="اولویت" value={form.priority} options={priorityOptions.map((item) => ({ label: item, value: item }))} onChange={(priority) => setForm({ ...form, priority: priority as PriorityLevel })} />
            <SelectField label="وضعیت" value={String(form.isActive)} options={[{ label: "فعال", value: "true" }, { label: "غیرفعال", value: "false" }]} onChange={(value) => setForm({ ...form, isActive: value === "true" })} />
            <TextAreaField label="توضیحات" value={form.description} onChange={(description) => setForm({ ...form, description })} />
          </div>
          <div className="form-actions">
            <button className="primary-button" type="button" onClick={submit}>ذخیره</button>
            <button className="ghost-button" type="button" onClick={() => {
              setForm({ ...blankSchedule(), employeeId: activeEmployees[0]?.id ?? "", spaceId: activeSpaces[0]?.id ?? "", taskTypeId: activeTasks[0]?.id ?? "" });
              setEditingId(null);
              setError("");
            }}>انصراف</button>
          </div>
        </section>

        <section className="config-card table-card">
          <h2>آیتم‌های برنامه</h2>
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
                    {taskTypes.find((task) => task.id === item.taskTypeId)?.name ?? "نامشخص"}
                  </StatusBadge>
                  <button type="button" onClick={() => {
                    setForm(item);
                    setEditingId(item.id);
                  }}>ویرایش</button>
                  {item.isActive && <button className="danger-button" type="button" onClick={() => deactivateItem(item.id)}>غیرفعال‌سازی</button>}
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
          <span className="eyebrow">قوانین تحلیل</span>
          <h1>قواعد پایه تصمیم‌گیری</h1>
          <p>در P1 فقط فعال یا غیرفعال بودن قوانین پایه ذخیره می‌شود.</p>
        </div>
        <button className="ghost-button" type="button" onClick={resetDemo}>
          <RotateCcw size={17} /> بازگشت demo
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
              <StatusBadge tone={rule.isActive ? rule.tone : "empty"}>{rule.isActive ? "فعال" : "غیرفعال"}</StatusBadge>
              <h2>{rule.title}</h2>
              <p>{rule.description}</p>
              <button className="ghost-button" type="button" onClick={() => updateItem(rule.id, { isActive: !rule.isActive })}>
                {rule.isActive ? "غیرفعال‌سازی" : "فعال‌سازی"}
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
      label: "وضعیت هفته",
      value: analysis.controlScore >= 80 ? "کنترل‌شده" : analysis.controlScore >= 55 ? "نیازمند توجه" : "بحرانی",
      caption: `امتیاز کنترل ${toPersianNumber(analysis.controlScore)} از ۱۰۰`,
      tone: analysis.controlScore >= 80 ? "good" as StatusTone : analysis.controlScore >= 55 ? "warn" as StatusTone : "critical" as StatusTone,
      icon: CheckCircle2,
    },
    {
      label: "هشدارهای فعال",
      value: toPersianNumber(analysis.findings.length),
      caption: `${toPersianNumber(analysis.criticalCount)} بحرانی، ${toPersianNumber(analysis.warningCount)} هشدار`,
      tone: analysis.criticalCount ? "critical" as StatusTone : analysis.warningCount ? "warn" as StatusTone : "good" as StatusTone,
      icon: AlertTriangle,
    },
    {
      label: "پوشش فروشگاه",
      value: toPersianNumber(analysis.salesCoverageScore),
      caption: "امتیاز پوشش از موتور تحلیل",
      tone: analysis.salesCoverageScore >= 80 ? "sales" as StatusTone : analysis.salesCoverageScore >= 55 ? "warn" as StatusTone : "critical" as StatusTone,
      icon: Store,
    },
    {
      label: "زمان تمرکز",
      value: toPersianNumber(analysis.focusScore),
      caption: "امتیاز تمرکز و تداخل تمرکز",
      tone: analysis.focusScore >= 80 ? "focus" as StatusTone : analysis.focusScore >= 55 ? "warn" as StatusTone : "critical" as StatusTone,
      icon: Brain,
    },
    {
      label: "تداخل‌ها",
      value: toPersianNumber(conflictCount),
      caption: "یافته‌های مرتبط با تداخل",
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
      caption: `اوج حضور ${toPersianNumber(peak)} نفر`,
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
    : [{ title: "بدون هشدار مهم", caption: "موتور تحلیل مورد بحرانی یا هشدار جدی پیدا نکرد.", tone: "good" as StatusTone }];

  const smartSuggestions = weeklyScenarios.length
    ? weeklyScenarios.slice(0, 5).map((item) => ({
      title: item.title,
      caption: item.reason,
      tone: item.canApply ? "good" as StatusTone : severityTone(item.riskLevel),
    }))
    : [{ title: "پایش هفته", caption: "برنامه فعلی را با داده‌های کامل‌تر پایش کن.", tone: "info" as StatusTone }];

  const employeeSummaries = activeEmployees.map((employee) => {
    const employeeItems = activeSchedule.filter((item) => item.employeeId === employee.id);
    const hours = employeeItems.reduce((sum, item) => sum + durationHours(item), 0);
    const relatedFindings = analysis.findings.filter((findingItem) => findingItem.affectedEmployeeIds.includes(employee.id));
    return {
      name: employee.name,
      role: employee.primaryRole || "بدون نقش",
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
    { label: "تمرکز", value: analysis.focusScore, tone: analysis.focusScore >= 80 ? "focus" as StatusTone : "warn" as StatusTone },
    { label: "فروش", value: analysis.salesCoverageScore, tone: analysis.salesCoverageScore >= 80 ? "sales" as StatusTone : "warn" as StatusTone },
    { label: "ظرفیت", value: analysis.spaceCapacityScore, tone: analysis.spaceCapacityScore >= 80 ? "good" as StatusTone : "critical" as StatusTone },
    { label: "ایمنی", value: analysis.safetyScore, tone: analysis.safetyScore >= 80 ? "good" as StatusTone : "critical" as StatusTone },
  ];

  const decisionItems = [
    { title: "مسئله اصلی", caption: analysis.mainProblem, tone: analysis.criticalCount ? "critical" as StatusTone : analysis.warningCount ? "warn" as StatusTone : "good" as StatusTone },
    { title: "بهترین پیشنهاد", caption: bestScenario ? `${bestScenario.title} - ${bestScenario.expectedEffect}` : analysis.nextBestAction, tone: bestScenario?.canApply ? "good" as StatusTone : "info" as StatusTone },
    { title: "صف تصمیم‌گیری", caption: `${toPersianNumber(weeklyScenarios.filter((item) => item.canApply).length)} پیشنهاد قابل بررسی برای ترکیب امن آماده است.`, tone: "focus" as StatusTone },
    { title: "آخرین گزارش", caption: latestReport ? `${latestReport.status} | کنترل ${toPersianNumber(latestReport.summary.controlScoreBefore)} به ${toPersianNumber(latestReport.summary.controlScoreAfter)}` : "هنوز گزارش تصمیمی ساخته نشده است.", tone: latestReport ? "info" as StatusTone : "empty" as StatusTone },
    { title: "روند مدیریتی", caption: latestTrendPoint && previousTrendPoint ? `آخرین کنترل ${toPersianNumber(latestTrendPoint.controlScoreAfter)} | تغییر ${toPersianNumber(trendDelta)}` : "برای روند، حداقل دو گزارش لازم است.", tone: trendDelta > 0 ? "good" as StatusTone : trendDelta < 0 ? "critical" as StatusTone : "info" as StatusTone },
    { title: "سلامت ماهانه", caption: `${monthlyHealth.healthLevel} | کنترل ${toPersianNumber(monthlyHealth.averageControlScore)} | ${monthlyHealth.topRecurringRisks[0] ?? "ریسک تکراری مهم ندارد"}`, tone: monthlyHealth.healthLevel === "critical" ? "critical" as StatusTone : monthlyHealth.healthLevel === "needs_attention" ? "warn" as StatusTone : "good" as StatusTone },
    { title: "هشدار پیشگیرانه", caption: topPreventiveAlert ? `${topPreventiveAlert.title} | ${topPreventiveAlert.recommendedAction}` : "هشدار پیشگیرانه فعالی وجود ندارد.", tone: topPreventiveAlert ? preventiveSeverityTone(topPreventiveAlert.severity) : "good" as StatusTone },
    { title: "جعبه سیاه داده‌ها", caption: snapshotCount ? `${toPersianNumber(snapshotCount)} snapshot ذخیره شده است.` : "هنوز بکاپی ثبت نشده؛ یک snapshot بساز.", tone: snapshotCount ? "focus" as StatusTone : "warn" as StatusTone },
    { title: "سلامت داده‌ها", caption: `${maintenanceHealthLabel(maintenanceReport.healthStatus)} | ${toPersianNumber(maintenanceReport.totalIssues)} مورد نگهداری`, tone: maintenanceHealthTone(maintenanceReport.healthStatus) },
    { title: "آمادگی عملیاتی", caption: `${readinessStatusLabel(readinessReport.status)} | امتیاز ${toPersianNumber(readinessReport.score)} | ${readinessReport.topActions[0]?.title ?? "اقدام فوری ندارد"}`, tone: readinessStatusTone(readinessReport.status) },
    { title: "Drift نسبت به baseline", caption: `${driftLevelLabel(baselineDrift.driftLevel)} | امتیاز ${toPersianNumber(baselineDrift.driftScore)} | ${baselineDrift.requiresResignoff ? "نیازمند بازتأیید" : "در محدوده پایش"}`, tone: driftTone(baselineDrift.driftLevel) },
    { title: "تاریخچه عملیاتی", caption: `${toPersianNumber(operationalHistory.events.length)} رویداد | ${driftWorsening ? "روند drift بدترشونده" : "روند پایدار یا ناکافی"}`, tone: driftWorsening ? "critical" as StatusTone : "info" as StatusTone },
    { title: "انضباط تاریخچه", caption: `${retentionStatusLabel(retentionReport.status)} | ${toPersianNumber(retentionReport.archiveCandidateCount)} قابل آرشیو`, tone: retentionStatusTone(retentionReport.status) },
    { title: "تقویم کنترل‌ها", caption: `${toPersianNumber(operationsCalendar.overdueCount)} عقب‌افتاده | ${toPersianNumber(operationsCalendar.todayCount)} امروز | ${operationsCalendar.nextBestControl?.title ?? "کنترل بازی باقی نمانده"}`, tone: operationsCalendar.urgentCount || operationsCalendar.overdueCount ? "critical" as StatusTone : operationsCalendar.todayCount ? "warn" as StatusTone : "good" as StatusTone },
    { title: "اعلان‌های عملیاتی", caption: `${toPersianNumber(operationalNotifications.unread)} خوانده‌نشده | ${toPersianNumber(operationalNotifications.urgent)} فوری | ${toPersianNumber(operationalNotifications.dueToday)} امروز`, tone: operationalNotifications.urgent ? "critical" as StatusTone : operationalNotifications.unread ? "warn" as StatusTone : "good" as StatusTone },
    { title: "ریسک کل", caption: `${toPersianNumber(analysis.totalRiskScore)} امتیاز ریسک از ${toPersianNumber(activeRuleCount)} قانون فعال`, tone: analysis.totalRiskScore > 40 ? "critical" as StatusTone : analysis.totalRiskScore > 15 ? "warn" as StatusTone : "good" as StatusTone },
  ];

  return (
    <div className="page-stack">
      <header className="hero-header">
        <div>
          <span className="eyebrow">داشبورد هفتگی P2</span>
          <h1>اتاق فرمان هفته</h1>
          <p>تحلیل واقعی از داده‌های ذخیره‌شده، قوانین فعال و برنامه هفتگی.</p>
        </div>
        <div className="hero-actions">
          <button className="ghost-button" type="button" onClick={resetDemo}>
            <RotateCcw size={17} /> بازگشت demo
          </button>
          <a className="primary-button" href="/organization/workforce-dashboard/rules">
            <Sparkles size={17} /> قوانین تحلیل
          </a>
          <a className="ghost-button" href="/organization/workforce-dashboard/analysis">
            <AlertTriangle size={17} /> مشاهده جزئیات تحلیل
          </a>
          <a className="ghost-button" href="/organization/workforce-dashboard/recommendations">
            <Sparkles size={17} /> مشاهده همه پیشنهادها
          </a>
          <a className="ghost-button" href="/organization/workforce-dashboard/decision-queue">
            <CheckCircle2 size={17} /> صف تصمیم‌گیری
          </a>
          <a className="ghost-button" href="/organization/workforce-dashboard/decision-report">
            <Activity size={17} /> گزارش‌های تصمیم
          </a>
          <a className="ghost-button" href="/organization/workforce-dashboard/report-archive">
            <CalendarDays size={17} /> آرشیو تصمیم‌ها
          </a>
          <a className="ghost-button" href="/organization/workforce-dashboard/monthly-health">
            <Activity size={17} /> سلامت ماهانه
          </a>
          <a className="ghost-button" href="/organization/workforce-dashboard/preventive-alerts">
            <AlertTriangle size={17} /> هشدار پیشگیرانه
          </a>
          <a className="ghost-button" href="/organization/workforce-dashboard/readiness">
            <ShieldCheck size={17} /> آمادگی عملیاتی
          </a>
          <a className="ghost-button" href="/organization/workforce-dashboard/launch-checklist">
            <ClipboardCheck size={17} /> چک‌لیست راه‌اندازی
          </a>
          <a className="ghost-button" href="/organization/workforce-dashboard/launch-signoff">
            <FileCheck2 size={17} /> تأیید راه‌اندازی
          </a>
          <a className="ghost-button" href="/organization/workforce-dashboard/baseline-drift">
            <Activity size={17} /> پایش Drift
          </a>
          <a className="ghost-button" href="/organization/workforce-dashboard/operational-history">
            <Clock3 size={17} /> تاریخچه عملیاتی
          </a>
          <a className="ghost-button" href="/organization/workforce-dashboard/history-retention">
            <ShieldCheck size={17} /> نگهداری تاریخچه
          </a>
          <a className="ghost-button" href="/organization/workforce-dashboard/operations-calendar">
            <CalendarDays size={17} /> تقویم کنترل‌ها
          </a>
          <a className="ghost-button" href="/organization/workforce-dashboard/data-center">
            <ShieldCheck size={17} /> جعبه سیاه داده‌ها
          </a>
          <a className="ghost-button" href="/organization/workforce-dashboard/simulator">
            <Sparkles size={17} /> شبیه‌ساز
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
            <h2>امتیازهای تحلیل</h2>
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
          <InfoPanel title="هشدارهای فوری" items={urgentAlerts} />
          <InfoPanel title="پیشنهادهای هوشمند" items={smartSuggestions} />
          <a className="primary-button full-button" href="/organization/workforce-dashboard/recommendations">
            <Sparkles size={17} /> مشاهده همه پیشنهادها
          </a>
        </div>
      </section>

      <section className="bottom-grid">
        <section className={`panel launch-progress-card tone-${operationalNotifications.urgent ? "critical" : operationalNotifications.unread ? "warn" : "good"}`}>
          <div className="section-head"><h2>اعلان‌های عملیاتی</h2><StatusBadge tone={operationalNotifications.urgent ? "critical" : operationalNotifications.unread ? "warn" : "good"}>{toPersianNumber(operationalNotifications.unread)} خوانده‌نشده</StatusBadge></div>
          <p>{toPersianNumber(operationalNotifications.urgent)} فوری و {toPersianNumber(operationalNotifications.dueToday)} مورد با موعد امروز</p>
          <small>اعلان‌ها محلی‌اند و فقط داخل این داشبورد نگهداری می‌شوند.</small>
          <a className="primary-button" href="/organization/workforce-dashboard/operations-calendar">مشاهده اعلان‌ها</a>
        </section>
        <section className={`panel launch-progress-card tone-${operationsCalendar.urgentCount || operationsCalendar.overdueCount ? "critical" : operationsCalendar.todayCount ? "warn" : "good"}`}>
          <div className="section-head"><h2>تقویم کنترل‌های عملیاتی</h2><StatusBadge tone={operationsCalendar.urgentCount ? "critical" : operationsCalendar.todayCount ? "warn" : "good"}>{toPersianNumber(operationsCalendar.totalControls)} کنترل</StatusBadge></div>
          <p>{operationsCalendar.summary}</p>
          <small>{operationsCalendar.nextBestControl ? `اقدام بعدی: ${operationsCalendar.nextBestControl.title}` : "همه کنترل‌ها رسیدگی شده‌اند."}</small>
          <a className="primary-button" href="/organization/workforce-dashboard/operations-calendar"><CalendarDays size={17} /> مشاهده تقویم</a>
        </section>
        {(retentionReport.status === "risky" || retentionReport.status === "needs_review") && (
          <section className={`panel launch-progress-card tone-${retentionStatusTone(retentionReport.status)}`}>
            <div className="section-head"><h2>سیاست نگهداری</h2><StatusBadge tone={retentionStatusTone(retentionReport.status)}>{retentionStatusLabel(retentionReport.status)}</StatusBadge></div>
            <p>{retentionReport.summary}</p><small>{retentionReport.recommendations[0]}</small><a className="primary-button" href="/organization/workforce-dashboard/history-retention">بررسی retention</a>
          </section>
        )}
        <section className={`panel launch-progress-card tone-${driftWorsening ? "critical" : "info"}`}>
          <div className="section-head"><h2>تاریخچه عملیاتی</h2><StatusBadge tone={driftWorsening ? "critical" : "info"}>{driftWorsening ? "رو به بدترشدن" : "پایش فعال"}</StatusBadge></div>
          <p>{operationalHistory.summary}</p>
          <small>{operationalHistory.recommendedAction}</small>
          <a className="primary-button" href="/organization/workforce-dashboard/operational-history">مشاهده تاریخچه</a>
        </section>
        <section className={`panel launch-progress-card tone-${driftTone(baselineDrift.driftLevel)}`}>
          <div className="section-head"><h2>Drift نسبت به baseline</h2><StatusBadge tone={driftTone(baselineDrift.driftLevel)}>{driftLevelLabel(baselineDrift.driftLevel)}</StatusBadge></div>
          <strong>{toPersianNumber(baselineDrift.driftScore)} از ۱۰۰</strong>
          <small>{baselineDrift.requiresResignoff ? "بازتأیید عملیاتی لازم است." : baselineDrift.recommendedAction}</small>
          <a className="primary-button" href="/organization/workforce-dashboard/baseline-drift">مشاهده تغییرات</a>
        </section>
        <section className={`panel launch-progress-card tone-${latestLaunchSignoff ? "good" : "warn"}`}>
          <div className="section-head">
            <h2>وضعیت راه‌اندازی</h2>
            <StatusBadge tone={latestLaunchSignoff ? "good" : "warn"}>{latestLaunchSignoff ? "عملیاتی" : "تأییدنشده"}</StatusBadge>
          </div>
          <p>{latestLaunchSignoff ? "سیستم عملیاتی شده است." : "راه‌اندازی هنوز تأیید نشده است."}</p>
          <small>{latestLaunchSignoff ? `${latestLaunchSignoff.signedBy} | ${toPersianNumber(new Date(latestLaunchSignoff.signedAt ?? latestLaunchSignoff.updatedAt).toLocaleDateString("fa-IR"))}` : "گزارش نهایی و baseline را ثبت کنید."}</small>
          <a className="primary-button" href="/organization/workforce-dashboard/launch-signoff"><FileCheck2 size={17} /> گزارش تأیید</a>
        </section>
        <section className="panel launch-progress-card">
          <div className="section-head">
            <h2>پیشرفت راه‌اندازی</h2>
            <StatusBadge tone={launchReport.criticalOpenCount ? "critical" : launchReport.openCount ? "warn" : "good"}>
              {toPersianNumber(launchReport.progressPercent)}٪
            </StatusBadge>
          </div>
          <div className="mini-meter readiness-meter"><span style={{ width: `${launchReport.progressPercent}%` }} /></div>
          <p>{toPersianNumber(launchReport.openCount)} اقدام باز</p>
          <small>{launchReport.nextBestStep?.title ?? "گام راه‌اندازی بازی باقی نمانده است."}</small>
          <a className="primary-button" href="/organization/workforce-dashboard/launch-checklist">
            <ClipboardCheck size={17} /> ادامه راه‌اندازی
          </a>
        </section>
        <section className="panel wide-panel">
          <h2>وضعیت خلاصه کارمندها</h2>
          <div className="employee-list">
            {employeeSummaries.map((employee) => (
              <article key={employee.name}>
                <div>
                  <strong>{employee.name}</strong>
                  <span>{employee.role}، {toPersianNumber(employee.hours)} ساعت، {toPersianNumber(employee.alerts)} هشدار</span>
                </div>
                <StatusBadge tone={employee.tone}>{employee.alerts ? "نیازمند توجه" : "پایدار"}</StatusBadge>
              </article>
            ))}
          </div>
        </section>
        <InfoPanel title="مرکز تصمیم هفته" items={decisionItems} />
        <section className="panel">
          <h2>جزئیات تحلیل</h2>
          <div className="analysis-list">
            {topFindings.slice(0, 5).map((item) => (
              <article className={`panel-row tone-${severityTone(item.severity)}`} key={item.id}>
                <StatusBadge tone={severityTone(item.severity)}>
                  {item.severity === "critical" ? "بحرانی" : item.severity === "warning" ? "هشدار" : "اطلاع"}
                </StatusBadge>
                <p>{item.title}</p>
                <small>{item.recommendation}</small>
              </article>
            ))}
            {!topFindings.length && <p>جزئیات مهمی برای نمایش وجود ندارد.</p>}
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
  if (severity === "critical") return "بحرانی";
  if (severity === "warning") return "هشدار";
  if (severity === "info") return "اطلاع";
  return "پایدار";
}

function scenarioTypeLabel(type: RecommendationScenarioType) {
  const labels: Record<RecommendationScenarioType, string> = {
    move_space: "تغییر فضا",
    move_time: "تغییر زمان",
    change_employee: "تغییر کارمند",
    add_support_person: "افزودن همراه",
    keep_but_warn: "پایش",
    split_task: "تقسیم کار",
    no_safe_action: "نیازمند تصمیم",
  };
  return labels[type];
}

function confidenceLabel(value: RecommendationScenario["confidence"]) {
  if (value === "high") return "اعتماد بالا";
  if (value === "medium") return "اعتماد متوسط";
  return "اعتماد پایین";
}

function effortLabel(value: RecommendationScenario["effortLevel"]) {
  if (value === "high") return "اجرای سخت";
  if (value === "medium") return "اجرای متوسط";
  return "اجرای ساده";
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

  const ruleOptions = [{ label: "همه قوانین", value: "" }, ...rules.map((rule) => ({ label: rule.title, value: rule.id }))];
  const employeeOptions = optionList(employees, "همه کارمندان");
  const spaceOptions = optionList(spaces, "همه فضاها");

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <span className="eyebrow">جزئیات تحلیل</span>
          <h1>هشدارها و پیشنهادهای سیستم</h1>
          <p>همه findings از موتور تحلیل واقعی و قوانین فعال ساخته می‌شوند.</p>
        </div>
        <a className="primary-button" href="/organization/workforce-dashboard/schedule">
          <CalendarDays size={17} /> رفتن به برنامه هفتگی
        </a>
      </header>

      <section className="kpi-strip">
        <article className="kpi-card tone-info"><div><p>کل یافته‌ها</p><strong>{toPersianNumber(analysis.findings.length)}</strong><span>پس از قوانین فعال</span></div></article>
        <article className="kpi-card tone-critical"><div><p>بحرانی</p><strong>{toPersianNumber(analysis.criticalCount)}</strong><span>نیازمند اقدام فوری</span></div></article>
        <article className="kpi-card tone-warn"><div><p>هشدار</p><strong>{toPersianNumber(analysis.warningCount)}</strong><span>نیازمند توجه</span></div></article>
        <article className="kpi-card tone-good"><div><p>امتیاز کنترل</p><strong>{toPersianNumber(analysis.controlScore)}</strong><span>از ۱۰۰</span></div></article>
        <article className="kpi-card tone-focus"><div><p>ریسک کل</p><strong>{toPersianNumber(analysis.totalRiskScore)}</strong><span>جمع اثر هشدارها</span></div></article>
      </section>

      <section className="filter-bar">
        <Filter size={16} />
        <select value={severity} onChange={(event) => setSeverity(event.target.value)}>
          <option value="">همه شدت‌ها</option>
          <option value="critical">بحرانی</option>
          <option value="warning">هشدار</option>
          <option value="info">اطلاع</option>
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
          <option value="severity">مرتب‌سازی شدت</option>
          <option value="time">مرتب‌سازی زمان</option>
        </select>
        <input className="search-input" value={query} placeholder="جست‌وجو در هشدارها" onChange={(event) => setQuery(event.target.value)} />
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
                <span>{rule?.title ?? "قانون نامشخص"}</span>
              </div>
              <h2>{finding.title}</h2>
              <p>{finding.description}</p>
              <div className="evidence-box">
                <span>{finding.evidence}</span>
                <small>{finding.whyItHappened}</small>
              </div>
              <div className="finding-meta">
                <span>زمان: {finding.dayOfWeek ?? "کل هفته"} {toPersianNumber(finding.startTime ?? "")} {finding.endTime ? `تا ${toPersianNumber(finding.endTime)}` : ""}</span>
                <span>کارمندها: {names.length ? names.join("، ") : "ثبت نشده"}</span>
                <span>فضاها: {spaceNames.length ? spaceNames.join("، ") : "ثبت نشده"}</span>
                <span>آیتم‌ها: {toPersianNumber(finding.affectedScheduleItemIds.length)}</span>
                <span>اثر ریسک: {toPersianNumber(finding.scoreImpact)}</span>
              </div>
              <div className="recommendation-row">
                <strong>{finding.recommendation}</strong>
                <a className="ghost-button" href={`/organization/workforce-dashboard/schedule${finding.affectedScheduleItemIds[0] ? `?itemId=${finding.affectedScheduleItemIds[0]}` : ""}`}>مشاهده در برنامه هفتگی</a>
                {!!finding.affectedScheduleItemIds.length && (
                  <a className="primary-button" href={`/organization/workforce-dashboard/simulator?findingId=${encodeURIComponent(finding.id)}`}>تست جابه‌جایی</a>
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
                        <strong>{item.day}، {toPersianNumber(item.startTime)} تا {toPersianNumber(item.endTime)}</strong>
                        <span>{employee?.name ?? "کارمند"} | {space?.name ?? "فضا"} | {task?.name ?? "نوع کار"}</span>
                      </a>
                    );
                  })}
                </div>
              )}
              <div className="scenario-stack">
                <strong>پیشنهادهای قابل بررسی</strong>
                {scenarios.map((scenario, index) => (
                  <div className="scenario-mini-card" key={scenario.id}>
                    <div>
                      <StatusBadge tone={index === 0 ? "good" : confidenceTone(scenario.confidence)}>{index === 0 ? "بهترین گزینه" : confidenceLabel(scenario.confidence)}</StatusBadge>
                      <StatusBadge tone={scenario.canApply ? "good" : "warn"}>{scenario.canApply ? "قابل اعمال" : "تصمیم مدیر"}</StatusBadge>
                    </div>
                    <h3>{scenario.title}</h3>
                    <p>{scenario.reason}</p>
                    <div className="recommendation-row">
                      {scenario.change ? (
                        <a className="primary-button" href={`/organization/workforce-dashboard/simulator?findingId=${encodeURIComponent(finding.id)}&scenarioId=${encodeURIComponent(scenario.id)}`}>تست در شبیه‌ساز</a>
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
        {!filteredFindings.length && <section className="panel"><h2>موردی پیدا نشد</h2><p>فیلترها را تغییر بده یا داده‌های برنامه را کامل‌تر کن.</p></section>}
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
    const ok = window.confirm("این پیشنهاد روی برنامه اصلی اعمال شود؟ فقط همین آیتم برنامه تغییر می‌کند.");
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
          <span className="eyebrow">موتور پیشنهاد P6</span>
          <h1>پیشنهادهای نیمه‌خودکار هفته</h1>
          <p>سناریوها از روی هشدارهای واقعی ساخته، با شبیه‌ساز تست و براساس اثر، ریسک، اعتماد و هزینه اجرا رتبه‌بندی می‌شوند.</p>
        </div>
        <div className="hero-actions">
          <a className="ghost-button" href="/organization/workforce-dashboard/analysis">جزئیات تحلیل</a>
          <a className="ghost-button" href="/organization/workforce-dashboard/decision-queue">رفتن به صف تصمیم</a>
          <a className="primary-button" href="/organization/workforce-dashboard/simulator">شبیه‌ساز</a>
        </div>
      </header>

      <section className="kpi-strip">
        <article className="kpi-card tone-info"><div><p>کل سناریوها</p><strong>{toPersianNumber(scenarios.length)}</strong><span>از findings مهم</span></div></article>
        <article className="kpi-card tone-good"><div><p>قابل اعمال</p><strong>{toPersianNumber(scenarios.filter((item) => item.canApply).length)}</strong><span>تغییر تک آیتمی امن</span></div></article>
        <article className="kpi-card tone-critical"><div><p>نیازمند تصمیم</p><strong>{toPersianNumber(scenarios.filter((item) => !item.canApply).length)}</strong><span>چندمرحله‌ای یا نامطمئن</span></div></article>
        <article className="kpi-card tone-focus"><div><p>بهترین امتیاز</p><strong>{toPersianNumber(Math.round(scenarios[0]?.rankScore ?? 0))}</strong><span>رتبه محاسباتی موتور پیشنهاد</span></div></article>
        <article className="kpi-card tone-warn"><div><p>هشدارهای مبنا</p><strong>{toPersianNumber(analysis.criticalCount + analysis.warningCount)}</strong><span>critical و warning</span></div></article>
      </section>

      <section className="filter-bar">
        <Filter size={16} />
        <select value={severity} onChange={(event) => setSeverity(event.target.value)}>
          <option value="">همه شدت‌ها</option>
          <option value="critical">بحرانی</option>
          <option value="warning">هشدار</option>
        </select>
        <select value={scenarioType} onChange={(event) => setScenarioType(event.target.value)}>
          <option value="">همه نوع سناریوها</option>
          {(["move_space", "move_time", "change_employee", "add_support_person", "keep_but_warn", "split_task", "no_safe_action"] as RecommendationScenarioType[]).map((type) => (
            <option value={type} key={type}>{scenarioTypeLabel(type)}</option>
          ))}
        </select>
        <select value={employeeId} onChange={(event) => setEmployeeId(event.target.value)}>
          {optionList(employees, "همه کارمندان").map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
        </select>
        <select value={spaceId} onChange={(event) => setSpaceId(event.target.value)}>
          {optionList(spaces, "همه فضاها").map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
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
                <StatusBadge tone={scenario.canApply ? "good" : "warn"}>{scenario.canApply ? "قابل اعمال" : "نیازمند تصمیم مدیر"}</StatusBadge>
                <StatusBadge tone={confidenceTone(scenario.confidence)}>{confidenceLabel(scenario.confidence)}</StatusBadge>
                <StatusBadge tone="info">{scenarioTypeLabel(scenario.type)}</StatusBadge>
              </div>
              <h2>{scenario.title}</h2>
              <p>{scenario.description}</p>
              <div className="finding-meta">
                <span>مسئله: {finding?.title ?? "finding نامشخص"}</span>
                <span>زمان: {finding?.dayOfWeek ?? item?.day ?? "کل هفته"} {toPersianNumber(finding?.startTime ?? item?.startTime ?? "")}</span>
                <span>فضای هدف: {spaceName ?? "ثبت نشده"}</span>
                <span>کارمند هدف: {employeeName ?? "بدون تغییر"}</span>
                <span>قبل: {toPersianNumber(beforeScore)}</span>
                <span>بعد: {afterScore === undefined ? "نیازمند تصمیم" : toPersianNumber(afterScore)}</span>
                <span>تغییر ریسک: {toPersianNumber(scenario.simulationResult?.riskScoreDelta ?? 0)}</span>
                <span>امتیاز رتبه: {toPersianNumber(Math.round(scenario.rankScore))}</span>
              </div>
              <div className="evidence-box">
                <span>{scenario.expectedEffect}</span>
                <small>{scenario.reason}</small>
              </div>
              <div className="recommendation-row">
                <button className="ghost-button" type="button" onClick={() => addToQueue(scenario)}>
                  افزودن به صف تصمیم
                </button>
                {scenario.change && <a className="primary-button" href={`/organization/workforce-dashboard/simulator?findingId=${encodeURIComponent(scenario.findingId)}&scenarioId=${encodeURIComponent(scenario.id)}`}>تست در شبیه‌ساز</a>}
                <button className="danger-button" type="button" disabled={!scenario.canApply} onClick={() => applyScenario(scenario)}>
                  {scenario.canApply ? "اعمال تغییر" : "نیازمند تصمیم مدیر"}
                </button>
              </div>
            </article>
          );
        })}
        {!filtered.length && <section className="panel"><h2>پیشنهادی پیدا نشد</h2><p>فیلترها را تغییر بده یا داده‌های برنامه را کامل‌تر کن.</p></section>}
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
      window.alert("این ترکیب هنوز امن نیست. ابتدا تداخل‌ها یا هشدارهای بحرانی تازه را رفع کن.");
      return;
    }
    const ok = window.confirm("تصمیم‌های انتخاب‌شده روی برنامه اصلی اعمال شوند؟ فقط آیتم‌های امن و انتخاب‌شده تغییر می‌کنند.");
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
    operationalHistoryService.recordDecisionBatchApplied(`decision-batch-${Date.now()}`, `${result.appliedChanges.length} تغییر برنامه اعمال شد.`);
    window.location.href = `/organization/workforce-dashboard/schedule${result.appliedChanges[0] ? `?itemId=${result.appliedChanges[0].scheduleItemId}` : ""}`;
  };

  const createReport = () => {
    const result = simulateDecisionBatch(input, selectedScenarios);
    setBatchResult(result);
    const report = decisionReportService.createFromBatch(result, {
      title: "گزارش تصمیم‌های مدیریتی هفته",
      weekLabel: "هفته جاری",
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
          <h1>صف تصمیم‌گیری مدیریتی</h1>
          <p>چند پیشنهاد را انتخاب کن، اثر تجمعی را ببین، تداخل‌ها را حذف کن و فقط ترکیب امن را اعمال کن.</p>
        </div>
        <div className="hero-actions">
          <a className="ghost-button" href="/organization/workforce-dashboard/recommendations">بازگشت به پیشنهادها</a>
          <button className="ghost-button" type="button" onClick={selectBest}>انتخاب بهترین ترکیب</button>
          <button className="primary-button" type="button" onClick={() => setBatchResult(simulateDecisionBatch(input, selectedScenarios))}>تحلیل ترکیب</button>
          <button className="ghost-button" type="button" onClick={createReport}>ساخت گزارش تصمیم</button>
          <button className="danger-button" type="button" onClick={applyBatch} disabled={!batchResult.safeToApply}>اعمال تصمیم‌های انتخاب‌شده</button>
        </div>
      </header>

      <section className="kpi-strip">
        <article className="kpi-card tone-info"><div><p>قابل بررسی</p><strong>{toPersianNumber(scenarios.length)}</strong><span>پیشنهاد رتبه‌بندی‌شده</span></div></article>
        <article className="kpi-card tone-focus"><div><p>انتخاب‌شده</p><strong>{toPersianNumber(selectedCount)}</strong><span>برای تحلیل batch</span></div></article>
        <article className="kpi-card tone-good"><div><p>کنترل قبل/بعد</p><strong>{toPersianNumber(batchResult.controlScoreBefore)} / {toPersianNumber(batchResult.controlScoreAfter)}</strong><span>{verdictLabel(batchResult.verdict)}</span></div></article>
        <article className={`kpi-card tone-${batchResult.riskScoreAfter <= batchResult.riskScoreBefore ? "good" : "critical"}`}><div><p>تغییر ریسک</p><strong>{toPersianNumber(batchResult.riskScoreAfter - batchResult.riskScoreBefore)}</strong><span>قبل {toPersianNumber(batchResult.riskScoreBefore)} | بعد {toPersianNumber(batchResult.riskScoreAfter)}</span></div></article>
        <article className={`kpi-card tone-${batchResult.safeToApply ? "good" : "warn"}`}><div><p>وضعیت نهایی</p><strong>{batchResult.safeToApply ? "امن" : "نیازمند بررسی"}</strong><span>{toPersianNumber(batchResult.conflicts.length)} تداخل</span></div></article>
      </section>

      <section className="decision-layout">
        <section className="panel decision-list">
          <div className="section-head">
            <h2>پیشنهادها</h2>
            <button className="ghost-button" type="button" onClick={clearSelection}>پاک کردن انتخاب</button>
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
                  <StatusBadge tone={scenario.canApply ? "good" : "warn"}>{scenario.canApply ? "قابل اعمال" : "نیازمند بررسی"}</StatusBadge>
                  <StatusBadge tone={conflicted ? "critical" : "info"}>{conflicted ? "متداخل" : scenarioTypeLabel(scenario.type)}</StatusBadge>
                  <StatusBadge tone={confidenceTone(scenario.confidence)}>{confidenceLabel(scenario.confidence)}</StatusBadge>
                </div>
              </article>
            );
          })}
        </section>

        <section className="panel decision-report">
          <h2>گزارش قبل/بعد</h2>
          <div className="score-grid">
            <div className="heat-cell tone-info"><strong>{toPersianNumber(batchResult.controlScoreBefore)}</strong><span>کنترل قبل</span></div>
            <div className="heat-cell tone-good"><strong>{toPersianNumber(batchResult.controlScoreAfter)}</strong><span>کنترل بعد</span></div>
            <div className="heat-cell tone-warn"><strong>{toPersianNumber(batchResult.warningBefore)} / {toPersianNumber(batchResult.warningAfter)}</strong><span>هشدار</span></div>
            <div className="heat-cell tone-critical"><strong>{toPersianNumber(batchResult.criticalBefore)} / {toPersianNumber(batchResult.criticalAfter)}</strong><span>بحرانی</span></div>
          </div>
          <div className="evidence-box">
            <span>{batchResult.summary}</span>
            <small>اعمال فقط وقتی فعال است که همه انتخاب‌ها canApply باشند، تداخل نداشته باشند و critical تازه نسازند.</small>
          </div>
          <div className="recommendation-row">
            <button className="primary-button" type="button" onClick={() => setBatchResult(simulateDecisionBatch(input, selectedScenarios))}>تحلیل ترکیب انتخاب‌شده</button>
            <button className="ghost-button" type="button" onClick={createReport}>ساخت گزارش تصمیم</button>
            <button className="danger-button" type="button" onClick={applyBatch} disabled={!batchResult.safeToApply}>اعمال batch</button>
          </div>
        </section>

        <section className="panel conflict-panel">
          <h2>تداخل‌ها</h2>
          {batchResult.conflicts.map((conflict) => (
            <article className="panel-row tone-critical" key={conflict.id}>
              <StatusBadge tone="critical">{conflict.type}</StatusBadge>
              <p>{conflict.description}</p>
              <small>{conflict.recommendation}</small>
            </article>
          ))}
          {!batchResult.conflicts.length && <p>تداخلی در ترکیب انتخاب‌شده دیده نشد.</p>}
        </section>
      </section>
    </div>
  );
}

function reportStatusLabel(status: DecisionReportStatus) {
  if (status === "approved") return "تایید شده";
  if (status === "applied") return "اعمال شده";
  if (status === "needs_review") return "نیازمند بررسی";
  return "پیش‌نویس";
}

function reportStatusTone(status: DecisionReportStatus): StatusTone {
  if (status === "approved") return "good";
  if (status === "applied") return "sales";
  if (status === "needs_review") return "warn";
  return "info";
}

function healthLevelLabel(value: string) {
  if (value === "excellent") return "عالی";
  if (value === "good") return "خوب";
  if (value === "needs_attention") return "نیازمند توجه";
  return "بحرانی";
}

function trendStatusLabel(value: string) {
  if (value === "improving") return "بهتر شده";
  if (value === "worsening") return "بدتر شده";
  if (value === "stable") return "تقریباً ثابت";
  return "داده ناکافی";
}

function healthTone(value: string): StatusTone {
  if (value === "excellent" || value === "good") return "good";
  if (value === "needs_attention") return "warn";
  return "critical";
}

function goalStatusLabel(value: MonthlyGoalStatus) {
  if (value === "in_progress") return "در حال اجرا";
  if (value === "achieved") return "محقق شده";
  if (value === "missed") return "ناموفق";
  return "برنامه‌ریزی";
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
  if (value === "acknowledged") return "تایید شد";
  if (value === "planned") return "برنامه‌ریزی شد";
  if (value === "resolved") return "حل شد";
  if (value === "dismissed") return "رد شد";
  return "باز";
}

function preventiveSourceLabel(value: PreventiveAlertSourceType) {
  if (value === "failed_goal") return "هدف ناموفق";
  if (value === "worsening_trend") return "روند نزولی";
  if (value === "repeated_space_pressure") return "فشار فضا";
  if (value === "repeated_focus_interruption") return "اختلال تمرکز";
  if (value === "repeated_sales_coverage_gap") return "پوشش فروش";
  return "ریسک تکراری";
}

function readinessStatusLabel(value: OperationalReadinessStatus) {
  if (value === "ready") return "آماده";
  if (value === "almost_ready") return "تقریبا آماده";
  if (value === "needs_setup") return "نیازمند آماده‌سازی";
  return "پرریسک";
}

function readinessStatusTone(value: OperationalReadinessStatus): StatusTone {
  if (value === "ready") return "good";
  if (value === "almost_ready") return "focus";
  if (value === "needs_setup") return "warn";
  return "critical";
}

function readinessCategoryLabel(value: ReadinessCheckCategory) {
  const labels: Record<ReadinessCheckCategory, string> = {
    base_data: "داده پایه",
    schedule: "برنامه",
    rules: "قوانین",
    analysis: "تحلیل",
    backup: "بکاپ",
    maintenance: "نگهداری",
    reports: "گزارش‌ها",
    monthly_goals: "اهداف ماهانه",
    preventive_alerts: "هشدار پیشگیرانه",
    ui_flow: "جریان کاری",
  };
  return labels[value];
}

function launchStatusLabel(value: LaunchChecklistStatus) {
  if (value === "completed") return "انجام‌شده";
  if (value === "dismissed") return "ردشده";
  return "باز";
}

function launchStatusTone(value: LaunchChecklistStatus): StatusTone {
  if (value === "completed") return "good";
  if (value === "dismissed") return "empty";
  return "warn";
}

function controlTypeLabel(value: OperationalControlType) {
  const labels: Record<OperationalControlType, string> = {
    snapshot_due: "Snapshot",
    backup_due: "Backup",
    archive_due: "Archive",
    maintenance_review: "نگهداری",
    drift_review: "Drift",
    resignoff_due: "بازتأیید",
    readiness_review: "Readiness",
    monthly_health_review: "سلامت ماهانه",
    preventive_alert_review: "هشدار پیشگیرانه",
    launch_checklist_review: "راه‌اندازی",
  };
  return labels[value];
}

function controlStatusLabel(value: OperationalControlStatus) {
  const labels: Record<OperationalControlStatus, string> = { upcoming: "آینده", due_today: "امروز", overdue: "عقب‌افتاده", completed: "انجام‌شده", snoozed: "تعویق", dismissed: "ردشده" };
  return labels[value];
}

function controlPriorityLabel(value: OperationalControlPriority) {
  const labels: Record<OperationalControlPriority, string> = { low: "کم", medium: "متوسط", high: "بالا", urgent: "فوری" };
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
    { key: "snapshotEveryDays", label: "فاصله Snapshot" },
    { key: "backupEveryDays", label: "فاصله Backup" },
    { key: "archiveEveryDays", label: "فاصله Archive" },
    { key: "maintenanceReviewEveryDays", label: "مرور نگهداری" },
    { key: "driftReviewEveryDays", label: "مرور Drift" },
    { key: "resignoffExpiresAfterDays", label: "مهلت بازتأیید" },
    { key: "readinessReviewEveryDays", label: "مرور آمادگی" },
    { key: "monthlyHealthReviewEveryDays", label: "مرور سلامت ماهانه" },
    { key: "preventiveAlertReviewEveryDays", label: "مرور هشدار پیشگیرانه" },
    { key: "launchChecklistReviewEveryDays", label: "مرور راه‌اندازی" },
  ];
  const setInterval = (key: keyof OperationalControlSchedulePolicy, value: string) => setPolicy((current) => ({ ...current, [key]: Number(value) }));
  const toggleControl = (type: OperationalControlType) => setPolicy((current) => ({ ...current, enabledControlTypes: current.enabledControlTypes.includes(type) ? current.enabledControlTypes.filter((item) => item !== type) : [...current.enabledControlTypes, type] }));
  const save = () => {
    const validation = operationsControlSettingsService.validatePolicy(policy);
    const savedPolicy = operationsControlSettingsService.updateSchedulePolicy(validation.policy);
    setPolicy(savedPolicy);
    setExportOptions(operationsControlSettingsService.updateExportOptions(exportOptions));
    setNotificationPreference(operationsControlSettingsService.updateNotificationPreferences(notificationPreference));
    setMessage(validation.warnings.length ? validation.warnings.join(" | ") : "تنظیمات کنترل‌های عملیاتی ذخیره شد.");
  };
  const reset = () => { setPolicy(operationsControlSettingsService.resetSchedulePolicy()); setMessage("Policy پیش‌فرض بازگردانده شد؛ برای اعمال روی تقویم، بازسازی را بزنید."); };
  const rebuild = () => {
    const saved = operationsControlSettingsService.updateSchedulePolicy(policy);
    operationsCalendarService.rebuild(currentOperationsCalendarState({ spaces, employees, taskTypes, scheduleItems, rules, settings }), saved);
    setPolicy(saved); setMessage("تقویم با policy جدید بازسازی شد.");
  };

  return (
    <div className="page-stack operations-control-settings-page">
      <header className="page-header"><div><span className="eyebrow">P21 Control Policy</span><h1>تنظیم زمان‌بندی کنترل‌ها</h1><p>دوره مرور، اولویت و خروجی کنترل‌های محلی را بدون تغییر کد تنظیم کنید.</p></div><div className="hero-actions"><a className="ghost-button" href="/organization/workforce-dashboard/operations-calendar">تقویم کنترل‌ها</a><button className="ghost-button" type="button" onClick={reset}>بازگشت به پیش‌فرض</button><button className="primary-button" type="button" onClick={save}>ذخیره تنظیمات</button><button className="primary-button" type="button" onClick={rebuild}>ذخیره و بازسازی تقویم</button></div></header>
      {message && <div className="inline-notice">{message}</div>}
      <section className="settings-band"><div className="section-head"><h2>دوره‌های زمانی</h2><span className="inline-note">واحد همه مقادیر روز است</span></div><div className="policy-interval-grid">{intervalFields.map((field) => <label className="field" key={String(field.key)}><span>{field.label}</span><div className="number-with-unit"><input type="number" min="1" max="3650" value={String(policy[field.key])} onChange={(event) => setInterval(field.key, event.target.value)} /><small>روز</small></div></label>)}</div></section>
      <section className="settings-band"><div className="section-head"><h2>کنترل‌ها و اولویت پیش‌فرض</h2><span className="inline-note">ریسک بحرانی می‌تواند اولویت را بالاتر ببرد</span></div><div className="control-policy-grid">{operationalControlTypes.map((type) => <article className="control-policy-row" key={type}><label className="risk-acceptance"><input type="checkbox" checked={policy.enabledControlTypes.includes(type)} onChange={() => toggleControl(type)} /><span>{controlTypeLabel(type)}</span></label><select aria-label={`اولویت ${controlTypeLabel(type)}`} value={policy.defaultPriorities[type]} onChange={(event) => setPolicy((current) => ({ ...current, defaultPriorities: { ...current.defaultPriorities, [type]: event.target.value as OperationalControlPriority } }))}>{(["low", "medium", "high", "urgent"] as OperationalControlPriority[]).map((priority) => <option key={priority} value={priority}>{controlPriorityLabel(priority)}</option>)}</select></article>)}</div></section>
      <section className="settings-split">
        <section className="settings-band"><h2>خروجی تقویم</h2><label className="risk-acceptance"><input type="checkbox" checked={exportOptions.includeCompleted} onChange={(event) => setExportOptions((current) => ({ ...current, includeCompleted: event.target.checked }))} /><span>شامل انجام‌شده‌ها</span></label><label className="risk-acceptance"><input type="checkbox" checked={exportOptions.includeDismissed} onChange={(event) => setExportOptions((current) => ({ ...current, includeDismissed: event.target.checked }))} /><span>شامل ردشده‌ها</span></label><label className="risk-acceptance"><input type="checkbox" checked={exportOptions.includeManagerNote} onChange={(event) => setExportOptions((current) => ({ ...current, includeManagerNote: event.target.checked }))} /><span>یادداشت مدیر در خروجی</span></label><label className="field"><span>روزهای آینده</span><input type="number" min="0" value={exportOptions.includeUpcomingDays} onChange={(event) => setExportOptions((current) => ({ ...current, includeUpcomingDays: Number(event.target.value) }))} /></label></section>
        <section className="settings-band"><h2>اعلان محلی</h2><p className="inline-note">این اعلان فقط داخل داشبورد است و reminder سیستم‌عامل نیست.</p><label className="risk-acceptance"><input type="checkbox" checked={notificationPreference.enabled} onChange={(event) => setNotificationPreference((current) => ({ ...current, enabled: event.target.checked }))} /><span>اعلان داخل داشبورد فعال باشد</span></label><label className="field"><span>حداقل اولویت</span><select value={notificationPreference.minimumPriority} onChange={(event) => setNotificationPreference((current) => ({ ...current, minimumPriority: event.target.value as OperationalControlPriority }))}>{(["low", "medium", "high", "urgent"] as OperationalControlPriority[]).map((priority) => <option key={priority} value={priority}>{controlPriorityLabel(priority)}</option>)}</select></label><label className="field"><span>چند روز قبل از موعد</span><input type="number" min="0" max="365" value={notificationPreference.daysBeforeDue} onChange={(event) => setNotificationPreference((current) => ({ ...current, daysBeforeDue: Number(event.target.value) }))} /></label></section>
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
    refresh("کنترل انجام‌شده ثبت شد.");
  };
  const dismiss = (control: OperationalControlItem) => {
    const note = noteFor(control).trim();
    if (!note) return refresh("برای رد کنترل، یادداشت مدیر الزامی است.");
    if (!window.confirm("این کنترل با یادداشت مدیر رد شود؟")) return;
    operationsCalendarService.dismiss(control.id, note);
    refresh("کنترل رد شد و دلیل آن نگهداری می‌شود.");
  };
  const snooze = (control: OperationalControlItem) => {
    if (!snoozeDate) return refresh("تاریخ تعویق را انتخاب کنید.");
    const until = new Date(`${snoozeDate}T12:00:00`).toISOString();
    if (!operationsCalendarService.snooze(control.id, until, noteFor(control))) return refresh("تاریخ تعویق باید در آینده باشد.");
    setSnoozeId("");
    setSnoozeDate("");
    refresh("کنترل تا تاریخ انتخاب‌شده به تعویق افتاد.");
  };
  const rebuild = () => {
    operationsCalendarService.rebuild(systemState, policy);
    refresh("تقویم از وضعیت فعلی سیستم بازسازی شد.");
  };
  const saveExportOptions = (next: OperationalControlExportOptions) => {
    setExportOptions(operationsControlSettingsService.updateExportOptions(next));
  };
  const refreshNotifications = () => {
    operationalNotificationService.refreshFromControls(report.controls, notificationPreference);
    refresh("اعلان‌های محلی از کنترل‌های فعلی به‌روزرسانی شدند.");
  };
  const createCalendarSnapshot = () => {
    const snapshot = workforceBackupService.createSnapshot("Snapshot تقویم کنترل‌ها", "operations_calendar_snapshot", "ساخته‌شده پیش از رسیدگی به کنترل‌های عملیاتی", false);
    operationalHistoryService.recordSnapshotEvent(snapshot.id, snapshot.title, snapshot.reason);
    operationsCalendarService.rebuild(currentOperationsCalendarState({ spaces, employees, taskTypes, scheduleItems, rules, settings }), policy);
    refresh("Snapshot عملیاتی ساخته شد.");
  };

  return (
    <div className="page-stack operations-calendar-page">
      <header className="page-header">
        <div><span className="eyebrow">P20 Operations Control</span><h1>تقویم کنترل‌های عملیاتی</h1><p>موعدهای کنترلی سیستم را در یک صف روزانه ببینید و نتیجه رسیدگی را محلی ثبت کنید.</p></div>
        <div className="hero-actions">
          <a className="ghost-button" href="/organization/workforce-dashboard">اتاق فرمان</a>
          <a className="ghost-button" href="/organization/workforce-dashboard/data-center">مرکز داده</a>
          <a className="ghost-button" href="/organization/workforce-dashboard/operations-control-settings">تنظیم زمان‌بندی</a>
          <button className="ghost-button" type="button" onClick={() => downloadOperationsCalendarIcs(report.controls, exportOptions)}>خروجی ICS</button>
          <button className="ghost-button" type="button" onClick={() => downloadOperationsCalendarJson(report.controls, policy, exportOptions, report.summary)}>خروجی JSON</button>
          <button className="ghost-button" type="button" onClick={createCalendarSnapshot}><ShieldCheck size={17} /> ساخت Snapshot</button>
          <button className="primary-button" type="button" onClick={rebuild}><RotateCcw size={17} /> بازسازی تقویم</button>
        </div>
      </header>
      {message && <div className="inline-notice">{message}</div>}

      <section className="kpi-strip operations-calendar-kpis">
        <article className="kpi-card tone-critical"><div><p>عقب‌افتاده</p><strong>{toPersianNumber(report.overdueCount)}</strong><span>نیازمند اقدام</span></div></article>
        <article className="kpi-card tone-warn"><div><p>موعد امروز</p><strong>{toPersianNumber(report.todayCount)}</strong><span>تا پایان امروز</span></div></article>
        <article className="kpi-card tone-info"><div><p>هفت روز آینده</p><strong>{toPersianNumber(nextSevenDaysCount)}</strong><span>کنترل پیش‌رو</span></div></article>
        <article className="kpi-card tone-critical"><div><p>اولویت فوری</p><strong>{toPersianNumber(report.urgentCount)}</strong><span>باز و فعال</span></div></article>
        <article className="kpi-card tone-good"><div><p>انجام‌شده</p><strong>{toPersianNumber(report.completedCount)}</strong><span>ثبت محلی</span></div></article>
      </section>

      <section className={`calendar-next-control tone-${report.nextBestControl ? controlTone(report.nextBestControl.priority) : "good"}`}>
        <div><span className="eyebrow">اقدام بعدی پیشنهادی</span><h2>{report.nextBestControl?.title ?? "کنترل بازی باقی نمانده است"}</h2><p>{report.nextBestControl?.description ?? "وضعیت فعلی پایدار است؛ تقویم را در نوبت بعدی بازسازی کنید."}</p></div>
        {report.nextBestControl && <a className="primary-button" href={report.nextBestControl.relatedPath}>رفتن به بخش مرتبط</a>}
      </section>

      <section className="settings-split calendar-tools">
        <section className="settings-band">
          <div className="section-head"><h2>خروجی سریع</h2><span className="inline-note">ICS با زمان UTC ساخته می‌شود</span></div>
          <div className="quick-export-controls"><label className="risk-acceptance"><input type="checkbox" checked={exportOptions.includeCompleted} onChange={(event) => saveExportOptions({ ...exportOptions, includeCompleted: event.target.checked })} /><span>انجام‌شده‌ها</span></label><label className="risk-acceptance"><input type="checkbox" checked={exportOptions.includeDismissed} onChange={(event) => saveExportOptions({ ...exportOptions, includeDismissed: event.target.checked })} /><span>ردشده‌ها</span></label><label className="risk-acceptance"><input type="checkbox" checked={exportOptions.includeManagerNote} onChange={(event) => saveExportOptions({ ...exportOptions, includeManagerNote: event.target.checked })} /><span>یادداشت مدیر</span></label><label className="field compact-field"><span>روزهای آینده</span><input type="number" min="0" value={exportOptions.includeUpcomingDays} onChange={(event) => saveExportOptions({ ...exportOptions, includeUpcomingDays: Number(event.target.value) })} /></label></div>
        </section>
        <section className="settings-band">
          <div className="section-head"><h2>اعلان‌های محلی</h2><div className="badge-row"><StatusBadge tone={notificationSummary.urgent ? "critical" : "info"}>{toPersianNumber(notificationSummary.unread)} خوانده‌نشده</StatusBadge><StatusBadge tone="warn">{toPersianNumber(notificationSummary.dueToday)} امروز</StatusBadge></div></div>
          <p className="inline-note">این‌ها فقط داخل داشبورد هستند و notification واقعی دستگاه نیستند.</p>
          <div className="row-actions"><button className="primary-button" type="button" onClick={refreshNotifications}>ساخت/به‌روزرسانی اعلان‌ها</button><button className="ghost-button" type="button" onClick={() => { operationalNotificationService.clearReadNotifications(); refresh("اعلان‌های خوانده‌شده پاک شدند."); }}>پاک‌سازی خوانده‌شده‌ها</button></div>
          <div className="notification-mini-list">{notifications.filter((item) => item.status !== "dismissed").slice(0, 4).map((item) => <article key={item.id}><div><strong>{item.title}</strong><small>{controlPriorityLabel(item.priority)} | {toPersianNumber(new Date(item.dueAt).toLocaleDateString("fa-IR"))}</small></div><div className="row-actions">{item.status === "unread" && <button className="ghost-button" type="button" onClick={() => { operationalNotificationService.markNotificationRead(item.id); refresh("اعلان خوانده شد."); }}>خواندم</button>}<button className="ghost-button" type="button" onClick={() => { operationalNotificationService.dismissNotification(item.id); refresh("اعلان بسته شد."); }}>بستن</button></div></article>)}{!notifications.filter((item) => item.status !== "dismissed").length && <p>اعلان محلی فعالی وجود ندارد.</p>}</div>
        </section>
      </section>

      <section className="filter-bar operations-calendar-filters">
        <select aria-label="فیلتر نوع کنترل" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as OperationalControlType | "all")}><option value="all">همه کنترل‌ها</option>{(["snapshot_due", "backup_due", "archive_due", "maintenance_review", "drift_review", "resignoff_due", "readiness_review", "monthly_health_review", "preventive_alert_review", "launch_checklist_review"] as OperationalControlType[]).map((type) => <option key={type} value={type}>{controlTypeLabel(type)}</option>)}</select>
        <select aria-label="فیلتر وضعیت" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as OperationalControlStatus | "all")}><option value="all">همه وضعیت‌ها</option>{(["upcoming", "due_today", "overdue", "completed", "snoozed", "dismissed"] as OperationalControlStatus[]).map((status) => <option key={status} value={status}>{controlStatusLabel(status)}</option>)}</select>
        <select aria-label="فیلتر اولویت" value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value as OperationalControlPriority | "all")}><option value="all">همه اولویت‌ها</option>{(["low", "medium", "high", "urgent"] as OperationalControlPriority[]).map((priority) => <option key={priority} value={priority}>{controlPriorityLabel(priority)}</option>)}</select>
        <span className="inline-note">{toPersianNumber(filteredControls.length)} نتیجه</span>
      </section>

      <div className="calendar-date-groups">
        {groupedControls.map(([date, controls]) => (
          <section className="calendar-date-section" key={date}>
            <div className="section-head"><h2>{toPersianNumber(new Date(`${date}T12:00:00`).toLocaleDateString("fa-IR", { weekday: "long", month: "long", day: "numeric" }))}</h2><span className="inline-note">{toPersianNumber(controls.length)} کنترل</span></div>
            <div className="control-card-grid">
              {controls.map((control) => (
                <article className={`control-card tone-${controlTone(control.status === "completed" || control.status === "dismissed" || control.status === "snoozed" ? control.status : control.priority)}`} key={control.id}>
                  <div className="section-head"><div className="badge-row"><StatusBadge tone={controlTone(control.status)}>{controlStatusLabel(control.status)}</StatusBadge><StatusBadge tone={controlTone(control.priority)}>{controlPriorityLabel(control.priority)}</StatusBadge></div><small>{controlTypeLabel(control.type)}</small></div>
                  <h3>{control.title}</h3><p>{control.description}</p>
                  <div className="control-meta"><span>سررسید: {toPersianNumber(new Date(control.dueAt).toLocaleString("fa-IR"))}</span><span>منبع: {control.source}</span>{control.snoozedUntil && <span>تعویق تا: {toPersianNumber(new Date(control.snoozedUntil).toLocaleDateString("fa-IR"))}</span>}</div>
                  <label className="field"><span>یادداشت مدیر</span><textarea rows={2} value={noteFor(control)} onChange={(event) => setNotes((current) => ({ ...current, [control.id]: event.target.value }))} placeholder="نتیجه بررسی یا دلیل تصمیم" /></label>
                  {snoozeId === control.id && <div className="snooze-panel"><input aria-label="تاریخ تعویق" type="date" value={snoozeDate} onChange={(event) => setSnoozeDate(event.target.value)} /><button className="primary-button" type="button" onClick={() => snooze(control)}>ثبت تعویق</button></div>}
                  <div className="row-actions">
                    <a className="ghost-button" href={control.relatedPath}>بخش مرتبط</a>
                    {(control.status === "completed" || control.status === "dismissed") ? <button className="ghost-button" type="button" onClick={() => { operationsCalendarService.reopen(control.id); refresh("کنترل دوباره باز شد."); }}>بازگشایی</button> : <><button className="primary-button" type="button" onClick={() => markCompleted(control)}>انجام شد</button><button className="ghost-button" type="button" onClick={() => { setSnoozeId(control.id); setSnoozeDate(""); }}>تعویق</button><button className="danger-button" type="button" onClick={() => dismiss(control)}>رد</button></>}
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
        {!groupedControls.length && <section className="panel"><p>کنترلی با فیلترهای انتخاب‌شده پیدا نشد.</p></section>}
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
    const ok = window.confirm("این گزارش از لیست فعال بایگانی شود؟");
    if (!ok) return;
    decisionReportService.archive(id);
    refresh();
  };

  return (
    <div className="page-stack report-page">
      <header className="page-header no-print">
        <div>
          <span className="eyebrow">P8 Decision Report</span>
          <h1>گزارش مدیریتی تصمیم‌ها</h1>
          <p>ثبت، مرور و چاپ نتیجه تصمیم‌های قبل/بعد برای جلسه مدیریتی.</p>
        </div>
        <div className="hero-actions">
          <a className="ghost-button" href="/organization/workforce-dashboard/decision-queue">صف تصمیم</a>
          <a className="ghost-button" href="/organization/workforce-dashboard/report-archive">رفتن به آرشیو گزارش‌ها</a>
          <button className="primary-button" type="button" onClick={() => window.print()}>چاپ گزارش</button>
        </div>
      </header>

      <section className="panel report-list no-print">
        <div className="section-head">
          <h2>گزارش‌های قبلی</h2>
          <span className="inline-note">{toPersianNumber(reports.length)} گزارش فعال</span>
        </div>
        <div className="entity-table">
          {reports.map((report) => (
            <article className={selectedReport?.id === report.id ? "highlight-row" : ""} key={report.id}>
              <div className="entity-main">
                <div><small>عنوان</small><strong>{report.title}</strong></div>
                <div><small>تاریخ</small><strong>{toPersianNumber(new Date(report.generatedAt).toLocaleDateString("fa-IR"))}</strong></div>
                <div><small>کنترل</small><strong>{toPersianNumber(report.summary.controlScoreBefore)} / {toPersianNumber(report.summary.controlScoreAfter)}</strong></div>
              </div>
              <div className="row-actions">
                <StatusBadge tone={reportStatusTone(report.status)}>{reportStatusLabel(report.status)}</StatusBadge>
                <button type="button" onClick={() => setSelectedId(report.id)}>مشاهده</button>
                <button className="danger-button" type="button" onClick={() => archiveReport(report.id)}>بایگانی</button>
              </div>
            </article>
          ))}
          {!reports.length && <p>هنوز گزارشی ساخته نشده است. از صف تصمیم‌گیری یک گزارش بساز.</p>}
        </div>
      </section>

      {selectedReport ? (
        <section className="print-surface">
          <section className="report-title">
            <div>
              <span className="eyebrow">گزارش قابل چاپ</span>
              <h1>{selectedReport.title}</h1>
              <p>{selectedReport.weekLabel} | تولید شده در {toPersianNumber(new Date(selectedReport.generatedAt).toLocaleString("fa-IR"))}</p>
            </div>
            <StatusBadge tone={reportStatusTone(selectedReport.status)}>{reportStatusLabel(selectedReport.status)}</StatusBadge>
          </section>

          <section className="kpi-strip">
            <article className="kpi-card tone-info"><div><p>قبل</p><strong>{toPersianNumber(selectedReport.summary.controlScoreBefore)}</strong><span>ریسک {toPersianNumber(selectedReport.summary.riskScoreBefore)}</span></div></article>
            <article className="kpi-card tone-good"><div><p>بعد</p><strong>{toPersianNumber(selectedReport.summary.controlScoreAfter)}</strong><span>ریسک {toPersianNumber(selectedReport.summary.riskScoreAfter)}</span></div></article>
            <article className={`kpi-card tone-${selectedReport.summary.controlScoreAfter >= selectedReport.summary.controlScoreBefore ? "good" : "critical"}`}><div><p>تغییر کنترل</p><strong>{toPersianNumber(selectedReport.summary.controlScoreAfter - selectedReport.summary.controlScoreBefore)}</strong><span>{verdictLabel(selectedReport.summary.verdict)}</span></div></article>
            <article className="kpi-card tone-critical"><div><p>بحرانی</p><strong>{toPersianNumber(selectedReport.summary.criticalBefore)} / {toPersianNumber(selectedReport.summary.criticalAfter)}</strong><span>قبل / بعد</span></div></article>
            <article className="kpi-card tone-warn"><div><p>هشدار</p><strong>{toPersianNumber(selectedReport.summary.warningBefore)} / {toPersianNumber(selectedReport.summary.warningAfter)}</strong><span>قبل / بعد</span></div></article>
          </section>

          <section className="bottom-grid">
            {previousPoint && (
              <section className="panel">
                <h2>مقایسه با گزارش قبلی</h2>
                <div className="finding-meta">
                  <span>تغییر کنترل: {toPersianNumber(selectedReport.summary.controlScoreAfter - previousPoint.controlScoreAfter)}</span>
                  <span>تغییر ریسک: {toPersianNumber(selectedReport.summary.riskScoreAfter - previousPoint.riskScoreAfter)}</span>
                </div>
                <a className="ghost-button no-print" href={`/organization/workforce-dashboard/report-comparison?reportIds=${encodeURIComponent(`${previousPoint.reportId},${selectedReport.id}`)}`}>مقایسه کامل</a>
              </section>
            )}
            <section className="panel wide-panel">
              <h2>تصمیم‌های اعمال‌شده یا پیشنهادی</h2>
              <div className="report-table">
                {selectedReport.decisionBatchResult.appliedChanges.map((change) => (
                  <article key={`${change.scheduleItemId}-${change.newSpaceId ?? ""}`}>
                    <strong>{change.scheduleItemId}</strong>
                    <span>فضا: {change.newSpaceId ?? "بدون تغییر"} | زمان: {change.newStartTime ?? "-"} تا {change.newEndTime ?? "-"}</span>
                  </article>
                ))}
                {!selectedReport.decisionBatchResult.appliedChanges.length && <p>تغییر قابل اعمالی در این گزارش ثبت نشده است.</p>}
              </div>
            </section>
            <section className="panel">
              <h2>خلاصه مدیریتی</h2>
              <div className="evidence-box">
                <span>{selectedReport.summary.summary}</span>
                <small>ریسک کل از {toPersianNumber(selectedReport.summary.riskScoreBefore)} به {toPersianNumber(selectedReport.summary.riskScoreAfter)} تغییر کرده است.</small>
              </div>
            </section>
          </section>

          <section className="bottom-grid">
            <section className="panel">
              <h2>ریسک‌های باقی‌مانده</h2>
              <div className="analysis-list">
                {selectedReport.remainingRisks.slice(0, 6).map((risk) => (
                  <article className={`panel-row tone-${severityTone(risk.severity)}`} key={risk.id}>
                    <StatusBadge tone={severityTone(risk.severity)}>{severityLabel(risk.severity)}</StatusBadge>
                    <p>{risk.title}</p>
                    <small>{risk.recommendation}</small>
                  </article>
                ))}
                {!selectedReport.remainingRisks.length && <p>ریسک مهم باقی‌مانده‌ای در گزارش ثبت نشده است.</p>}
              </div>
            </section>
            <section className="panel">
              <h2>هشدارهای جدید احتمالی</h2>
              <div className="analysis-list">
                {selectedReport.decisionBatchResult.conflicts.map((conflict) => (
                  <article className="panel-row tone-critical" key={conflict.id}>
                    <StatusBadge tone="critical">{conflict.type}</StatusBadge>
                    <p>{conflict.description}</p>
                    <small>{conflict.recommendation}</small>
                  </article>
                ))}
                {!selectedReport.decisionBatchResult.conflicts.length && <p>هشدار یا conflict تازه‌ای برای این batch ثبت نشده است.</p>}
              </div>
            </section>
            <section className="panel">
              <h2>تایید مدیر</h2>
              <div className="signature-box">
                <span>تاییدکننده: {selectedReport.approvedBy || "ثبت نشده"}</span>
                <span>وضعیت: {reportStatusLabel(selectedReport.status)}</span>
                <span>یادداشت: {selectedReport.managerNote || "بدون یادداشت"}</span>
              </div>
            </section>
          </section>

          <section className="panel no-print">
            <h2>ویرایش وضعیت گزارش</h2>
            <div className="field-grid">
              <TextField label="نام تاییدکننده" value={approvedBy} onChange={setApprovedBy} />
              <SelectField label="وضعیت تایید" value={selectedReport.status} options={[
                { label: "پیش‌نویس", value: "draft" },
                { label: "تایید شده", value: "approved" },
                { label: "اعمال شده", value: "applied" },
                { label: "نیازمند بررسی", value: "needs_review" },
              ]} onChange={(status) => updateReport({ status: status as DecisionReportStatus })} />
              <TextAreaField label="یادداشت مدیر" value={managerNote} onChange={setManagerNote} />
            </div>
            <div className="form-actions">
              <button className="primary-button" type="button" onClick={() => updateReport({ approvedBy, managerNote })}>ذخیره یادداشت</button>
              <button className="ghost-button" type="button" onClick={() => updateReport({ status: "approved", approvedBy, managerNote })}>تایید گزارش</button>
              <button className="ghost-button" type="button" onClick={() => updateReport({ status: "applied", approvedBy, managerNote })}>علامت‌گذاری اعمال شده</button>
            </div>
          </section>
        </section>
      ) : (
        <section className="panel">
          <h2>گزارشی برای نمایش وجود ندارد</h2>
          <p>از صفحه صف تصمیم‌گیری، پس از تحلیل batch، گزارش تصمیم بساز.</p>
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
    const ok = window.confirm("این گزارش بایگانی شود؟");
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
          <h1>{comparisonOnly ? "مقایسه گزارش‌ها" : "آرشیو و مقایسه گزارش‌ها"}</h1>
          <p>روند تصمیم‌های مدیریتی، بهترین/بدترین هفته و خلاصه ماهانه سبک را ببین.</p>
        </div>
        <div className="hero-actions">
          <a className="ghost-button" href="/organization/workforce-dashboard/decision-report">گزارش تصمیم</a>
          <a className="ghost-button" href="/organization/workforce-dashboard/monthly-health">سلامت ماهانه</a>
          <a className="primary-button" href="/organization/workforce-dashboard/report-comparison">مقایسه گزارش‌ها</a>
        </div>
      </header>

      <section className="kpi-strip">
        <article className="kpi-card tone-info"><div><p>گزارش‌ها</p><strong>{toPersianNumber(visibleReports.length)}</strong><span>فعال در آرشیو</span></div></article>
        <article className="kpi-card tone-good"><div><p>میانگین کنترل</p><strong>{toPersianNumber(comparison.averageControlScore)}</strong><span>گزارش‌های انتخاب‌شده</span></div></article>
        <article className="kpi-card tone-warn"><div><p>میانگین ریسک</p><strong>{toPersianNumber(comparison.averageRiskScore)}</strong><span>بعد از تصمیم‌ها</span></div></article>
        <article className="kpi-card tone-focus"><div><p>تصمیم‌های موثر</p><strong>{toPersianNumber(comparison.totalAppliedDecisions)}</strong><span>در گزارش‌های مقایسه</span></div></article>
        <article className="kpi-card tone-critical"><div><p>ریسک تکراری</p><strong>{toPersianNumber(comparison.recurringRiskTitles.length)}</strong><span>عنوان پرتکرار</span></div></article>
      </section>

      {!comparisonOnly && (
        <section className="filter-bar">
          <Filter size={16} />
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">همه وضعیت‌ها</option>
            <option value="draft">draft</option>
            <option value="approved">approved</option>
            <option value="applied">applied</option>
            <option value="needs_review">needs_review</option>
          </select>
          <select value={sortMode} onChange={(event) => setSortMode(event.target.value)}>
            <option value="date">مرتب‌سازی تاریخ</option>
            <option value="control">امتیاز کنترل بعد</option>
            <option value="improvement">بیشترین بهبود</option>
          </select>
          <input className="search-input" value={query} placeholder="جست‌وجو در عنوان یا هفته" onChange={(event) => setQuery(event.target.value)} />
        </section>
      )}

      <section className="archive-layout">
        {!comparisonOnly && (
          <section className="panel archive-list">
            <h2>گزارش‌های ذخیره‌شده</h2>
            {visibleReports.map((report) => {
              const improvement = report.summary.controlScoreAfter - report.summary.controlScoreBefore;
              const riskDelta = report.summary.riskScoreAfter - report.summary.riskScoreBefore;
              return (
                <article className="archive-card" key={report.id}>
                  <div className="analysis-card-head">
                    <StatusBadge tone={reportStatusTone(report.status)}>{reportStatusLabel(report.status)}</StatusBadge>
                    <label className="compare-toggle">
                      <input type="checkbox" checked={selectedIds.includes(report.id)} onChange={() => toggleCompare(report.id)} />
                      مقایسه
                    </label>
                  </div>
                  <h2>{report.title}</h2>
                  <p>{report.weekLabel} | {toPersianNumber(new Date(report.generatedAt).toLocaleDateString("fa-IR"))}</p>
                  <div className="finding-meta">
                    <span>کنترل: {toPersianNumber(report.summary.controlScoreBefore)} به {toPersianNumber(report.summary.controlScoreAfter)}</span>
                    <span>ریسک: {toPersianNumber(riskDelta)}</span>
                    <span>critical: {toPersianNumber(report.summary.criticalBefore)} / {toPersianNumber(report.summary.criticalAfter)}</span>
                    <span>warning: {toPersianNumber(report.summary.warningBefore)} / {toPersianNumber(report.summary.warningAfter)}</span>
                  </div>
                  <div className="mini-meter"><span style={{ width: miniBarWidth(report.summary.controlScoreAfter) }} /></div>
                  <div className="recommendation-row">
                    <a className="primary-button" href={`/organization/workforce-dashboard/decision-report?reportId=${encodeURIComponent(report.id)}`}>مشاهده گزارش</a>
                    <button className="ghost-button" type="button" onClick={() => toggleCompare(report.id)}>{selectedIds.includes(report.id) ? "حذف از مقایسه" : "مقایسه"}</button>
                    <button className="danger-button" type="button" onClick={() => archiveReport(report.id)}>بایگانی</button>
                  </div>
                  <small>بهبود کنترل: {toPersianNumber(improvement)}</small>
                </article>
              );
            })}
            {!visibleReports.length && <p>گزارشی برای نمایش وجود ندارد.</p>}
          </section>
        )}

        <section className="panel comparison-panel">
          <h2>روند گزارش‌ها</h2>
          <div className="trend-bars">
            {trend.map((point) => (
              <div className="trend-row" key={point.reportId}>
                <span>{point.weekLabel}</span>
                <div className="mini-meter"><span style={{ width: miniBarWidth(point.controlScoreAfter) }} /></div>
                <strong>{toPersianNumber(point.controlScoreAfter)}</strong>
              </div>
            ))}
            {!trend.length && <p>برای نمایش روند حداقل یک گزارش لازم است.</p>}
          </div>
          <div className="bottom-grid compact-bottom">
            <div className="heat-cell tone-good"><strong>{bestReport?.weekLabel ?? "ثبت نشده"}</strong><span>بهترین هفته</span></div>
            <div className="heat-cell tone-critical"><strong>{worstReport?.weekLabel ?? "ثبت نشده"}</strong><span>بدترین هفته</span></div>
            <div className="heat-cell tone-info"><strong>{toPersianNumber(comparison.averageControlScore)}</strong><span>میانگین کنترل</span></div>
            <div className="heat-cell tone-warn"><strong>{toPersianNumber(comparison.averageRiskScore)}</strong><span>میانگین ریسک</span></div>
          </div>
          <div className="evidence-box">
            <span>{comparison.summary}</span>
            <small>{comparison.managementInsight}</small>
          </div>
        </section>
      </section>

      <section className="bottom-grid">
        <section className="panel">
          <h2>مشکلات تکرارشونده</h2>
          <div className="analysis-list">
            {comparison.recurringRiskTitles.slice(0, 6).map((title) => (
              <article className="panel-row tone-warn" key={title}>
                <StatusBadge tone="warn">تکراری</StatusBadge>
                <p>{title}</p>
              </article>
            ))}
            {!comparison.recurringRiskTitles.length && <p>مشکل تکرارشونده معناداری پیدا نشد.</p>}
          </div>
        </section>
        <section className="panel wide-panel">
          <h2>خلاصه ماهانه</h2>
          <div className="finding-meta">
            <span>میانگین کنترل: {toPersianNumber(monthlySummary.averageControlScore)}</span>
            <span>میانگین ریسک: {toPersianNumber(monthlySummary.averageRiskScore)}</span>
            <span>بهترین هفته: {monthlySummary.bestWeek}</span>
            <span>بدترین هفته: {monthlySummary.worstWeek}</span>
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
      setGoalError("عنوان هدف الزامی است.");
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
          <h1>داشبورد سلامت مدیریتی ماهانه</h1>
          <p>وضعیت ماه، روند کنترل، ریسک‌های تکرارشونده و هدف‌های ماه بعد را یک‌جا ببین.</p>
        </div>
        <div className="hero-actions">
          <a className="ghost-button" href="/organization/workforce-dashboard/report-archive">آرشیو گزارش‌ها</a>
          <button className="primary-button" type="button" onClick={() => window.print()}>چاپ گزارش ماهانه</button>
        </div>
      </header>

      <section className="filter-bar no-print">
        <Filter size={16} />
        <select value={monthLabel} onChange={(event) => setMonthLabel(event.target.value)}>
          {monthOptions.map((option) => <option value={option} key={option}>{option === "all" ? "همه گزارش‌ها" : option}</option>)}
        </select>
      </section>

      <section className="report-title">
        <div>
          <span className="eyebrow">خلاصه سلامت ماه</span>
          <h1>{dashboard.monthLabel}</h1>
          <p>{dashboard.managementSummary}</p>
        </div>
        <StatusBadge tone={healthTone(dashboard.healthLevel)}>{healthLevelLabel(dashboard.healthLevel)}</StatusBadge>
      </section>

      <section className="kpi-strip">
        <article className="kpi-card tone-info"><div><p>گزارش‌های ماه</p><strong>{toPersianNumber(dashboard.reportIds.length)}</strong><span>منبع تحلیل</span></div></article>
        <article className={`kpi-card tone-${healthTone(dashboard.healthLevel)}`}><div><p>سلامت</p><strong>{healthLevelLabel(dashboard.healthLevel)}</strong><span>{trendStatusLabel(dashboard.trendStatus)}</span></div></article>
        <article className="kpi-card tone-good"><div><p>میانگین کنترل</p><strong>{toPersianNumber(dashboard.averageControlScore)}</strong><span>بهترین: {dashboard.bestWeekLabel}</span></div></article>
        <article className="kpi-card tone-warn"><div><p>میانگین ریسک</p><strong>{toPersianNumber(dashboard.averageRiskScore)}</strong><span>بدترین: {dashboard.worstWeekLabel}</span></div></article>
        <article className="kpi-card tone-critical"><div><p>ریسک تکراری</p><strong>{toPersianNumber(dashboard.repeatedRiskCount)}</strong><span>{dashboard.topRecurringRisks[0] ?? "مورد مهمی نیست"}</span></div></article>
      </section>

      <section className="panel no-print">
        <div className="section-head">
          <h2>هشدارهای پیشگیرانه</h2>
          <a className="ghost-button" href="/organization/workforce-dashboard/preventive-alerts">مشاهده هشدارها</a>
        </div>
        <div className="finding-meta">
          <span>باز: {toPersianNumber(openPreventiveAlerts.length)}</span>
          <span>فوری/بالا: {toPersianNumber(preventiveAlerts.filter((alert) => alert.priority === "urgent" || alert.priority === "high").length)}</span>
          <span>مهم‌ترین: {topPreventiveAlert?.title ?? "ثبت نشده"}</span>
          <span>اقدام: {topPreventiveAlert?.recommendedAction ?? "فعلاً اقدامی لازم نیست"}</span>
        </div>
      </section>

      <section className="archive-layout">
        <section className="panel comparison-panel">
          <h2>روند کنترل و ریسک</h2>
          <div className="trend-bars">
            {trend.map((point) => (
              <div className="trend-row" key={point.reportId}>
                <span>{point.weekLabel}</span>
                <div className="mini-meter"><span style={{ width: miniBarWidth(point.controlScoreAfter) }} /></div>
                <strong>{toPersianNumber(point.controlScoreAfter)}</strong>
              </div>
            ))}
            {!trend.length && <p>گزارشی برای این ماه ثبت نشده است.</p>}
          </div>
          <div className="evidence-box">
            <span>{dashboard.nextMonthFocus}</span>
            <small>قوی‌ترین حوزه: {dashboard.strongestArea} | ضعیف‌ترین حوزه: {dashboard.weakestArea}</small>
          </div>
        </section>

        <section className="panel">
          <h2>هشدار ریسک تکرارشونده</h2>
          <div className="analysis-list">
            {dashboard.topRecurringRisks.map((risk, index) => (
              <article className={`panel-row tone-${index >= 2 ? "critical" : "warn"}`} key={risk}>
                <StatusBadge tone={index >= 2 ? "critical" : "warn"}>{index >= 2 ? "critical" : "warning"}</StatusBadge>
                <p>{risk}</p>
                <small>{index >= 2 ? "در چند گزارش تکرار شده و نیازمند اقدام فوری است." : "در حداقل دو گزارش اخیر دیده شده است."}</small>
              </article>
            ))}
            {!dashboard.topRecurringRisks.length && <p>ریسک تکرارشونده مهمی دیده نشد.</p>}
          </div>
        </section>
      </section>

      <section className="bottom-grid">
        <section className="panel wide-panel">
          <h2>هدف‌های ماه بعد</h2>
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
                  <button type="button" onClick={() => { setGoalForm(goal); setEditingGoalId(goal.id); }}>ویرایش</button>
                  <select value={goal.status} onChange={(event) => updateGoalStatus(goal, event.target.value as MonthlyGoalStatus)}>
                    <option value="planned">برنامه‌ریزی</option>
                    <option value="in_progress">در حال اجرا</option>
                    <option value="achieved">محقق شده</option>
                    <option value="missed">ناموفق</option>
                  </select>
                  <button className="danger-button" type="button" onClick={() => archiveGoal(goal.id)}>بایگانی</button>
                </div>
              </article>
            ))}
            {!goals.length && <p>برای این ماه هنوز هدفی ثبت نشده است.</p>}
          </div>
        </section>

        <section className="panel no-print">
          <h2>{editingGoalId ? "ویرایش هدف ماهانه" : "افزودن هدف ماهانه"}</h2>
          {goalError && <p className="form-error">{goalError}</p>}
          <div className="field-grid">
            <TextField label="عنوان هدف" value={goalForm.title} onChange={(title) => setGoalForm({ ...goalForm, title })} />
            <TextField label="شاخص هدف" value={goalForm.targetMetric} onChange={(targetMetric) => setGoalForm({ ...goalForm, targetMetric })} />
            <TextField label="مقدار هدف" type="number" value={goalForm.targetValue} onChange={(targetValue) => setGoalForm({ ...goalForm, targetValue: Number(targetValue) })} />
            <TextField label="مقدار فعلی" type="number" value={goalForm.currentValue} onChange={(currentValue) => setGoalForm({ ...goalForm, currentValue: Number(currentValue) })} />
            <SelectField label="وضعیت" value={goalForm.status} options={[
              { label: "برنامه‌ریزی", value: "planned" },
              { label: "در حال اجرا", value: "in_progress" },
              { label: "محقق شده", value: "achieved" },
              { label: "ناموفق", value: "missed" },
            ]} onChange={(status) => setGoalForm({ ...goalForm, status: status as MonthlyGoalStatus })} />
            <TextAreaField label="توضیح" value={goalForm.description} onChange={(description) => setGoalForm({ ...goalForm, description })} />
          </div>
          <div className="form-actions">
            <button className="primary-button" type="button" onClick={saveGoal}>ذخیره هدف</button>
            <button className="ghost-button" type="button" onClick={() => { setGoalForm(blankMonthlyGoal(monthLabel)); setEditingGoalId(null); }}>انصراف</button>
          </div>
        </section>
      </section>

      <section className="panel">
        <h2>جمع‌بندی مدیریتی</h2>
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
    const ok = window.confirm("برای این هشدار، هدف پیشنهادی ماه بعد ساخته شود؟");
    if (!ok) return;
    monthlyGoalService.create({
      monthLabel: nextMonthLabel(),
      title: alert.sourceType === "failed_goal" ? `بازطراحی هدف: ${alert.affectedArea}` : `کاهش ریسک تکراری: ${alert.affectedArea}`,
      description: "این هدف از هشدار پیشگیرانه ساخته شده است.",
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
          <h1>هشدارهای پیشگیرانه ماهانه</h1>
          <p>ریسک‌های تکراری، هدف‌های ناموفق و روندهای نزولی را قبل از بحرانی شدن ببین.</p>
        </div>
        <div className="hero-actions">
          <a className="ghost-button" href="/organization/workforce-dashboard/monthly-health">سلامت ماهانه</a>
          <a className="ghost-button" href="/organization/workforce-dashboard/report-archive">آرشیو گزارش‌ها</a>
        </div>
      </header>

      <section className="kpi-strip">
        <article className="kpi-card tone-info"><div><p>کل هشدارها</p><strong>{toPersianNumber(alerts.length)}</strong><span>محاسبه‌شده از گزارش‌ها</span></div></article>
        <article className="kpi-card tone-critical"><div><p>بحرانی</p><strong>{toPersianNumber(alerts.filter((alert) => alert.severity === "critical").length)}</strong><span>نیازمند اقدام فوری</span></div></article>
        <article className="kpi-card tone-warn"><div><p>اولویت بالا</p><strong>{toPersianNumber(alerts.filter((alert) => alert.priority === "urgent" || alert.priority === "high").length)}</strong><span>urgent/high</span></div></article>
        <article className="kpi-card tone-good"><div><p>باز</p><strong>{toPersianNumber(alerts.filter((alert) => alert.status === "open").length)}</strong><span>هنوز تصمیم نگرفته</span></div></article>
        <article className="kpi-card tone-focus"><div><p>هدف ناموفق</p><strong>{toPersianNumber(alerts.filter((alert) => alert.sourceType === "failed_goal").length)}</strong><span>قابل تبدیل به هدف</span></div></article>
      </section>

      <section className="filter-bar">
        <Filter size={16} />
        <select value={severity} onChange={(event) => setSeverity(event.target.value)}>
          <option value="">همه شدت‌ها</option>
          <option value="info">info</option>
          <option value="warning">warning</option>
          <option value="critical">critical</option>
        </select>
        <select value={priority} onChange={(event) => setPriority(event.target.value)}>
          <option value="">همه اولویت‌ها</option>
          <option value="low">low</option>
          <option value="medium">medium</option>
          <option value="high">high</option>
          <option value="urgent">urgent</option>
        </select>
        <select value={sourceType} onChange={(event) => setSourceType(event.target.value)}>
          <option value="">همه منابع</option>
          {(["recurring_risk", "failed_goal", "worsening_trend", "repeated_space_pressure", "repeated_focus_interruption", "repeated_sales_coverage_gap"] as PreventiveAlertSourceType[]).map((item) => (
            <option value={item} key={item}>{preventiveSourceLabel(item)}</option>
          ))}
        </select>
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">همه وضعیت‌ها</option>
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
              <span>تکرار: {toPersianNumber(alert.repeatedCount)}</span>
              <span>اولین مشاهده: {alert.firstSeenLabel}</span>
              <span>آخرین مشاهده: {alert.lastSeenLabel}</span>
              <span>حوزه: {alert.affectedArea}</span>
            </div>
            <div className="evidence-box">
              <span>{alert.recommendedAction}</span>
              <small>{alert.relatedRiskTitles.join("، ") || "بدون risk title مستقیم"}</small>
            </div>
            <div className="recommendation-row">
              <button className="ghost-button" type="button" onClick={() => updateAlertStatus(alert, "acknowledged")}>تایید شد</button>
              <button className="ghost-button" type="button" onClick={() => updateAlertStatus(alert, "planned")}>برنامه‌ریزی شد</button>
              <button className="ghost-button" type="button" onClick={() => updateAlertStatus(alert, "resolved")}>حل شد</button>
              <button className="danger-button" type="button" onClick={() => updateAlertStatus(alert, "dismissed")}>رد شد</button>
              {(alert.sourceType === "failed_goal" || alert.sourceType === "recurring_risk" || alert.sourceType.startsWith("repeated_")) && (
                <button className="primary-button" type="button" onClick={() => createGoalFromAlert(alert)}>ساخت هدف پیشنهادی</button>
              )}
            </div>
          </article>
        ))}
        {!filteredAlerts.length && <section className="panel"><h2>هشداری پیدا نشد</h2><p>فیلترها را تغییر بده یا گزارش‌های بیشتری بساز.</p></section>}
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
    workforceBackupService.createSnapshot("Snapshot شروع آمادگی عملیاتی", "operational_readiness_start", "قبل از شروع استفاده عملیاتی ماژول ساخته شد.", false);
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
          <h1>چک‌لیست آمادگی عملیاتی</h1>
          <p>یک نمای اجرایی برای اینکه قبل از استفاده جدی، داده‌ها، قوانین، بکاپ، نگهداری و جریان تصمیم‌گیری آماده باشند.</p>
        </div>
        <div className="hero-actions">
          <a className="ghost-button" href="/organization/workforce-dashboard">اتاق فرمان</a>
          <a className="ghost-button" href="/organization/workforce-dashboard/data-center">مرکز داده</a>
          <a className="ghost-button" href="/organization/workforce-dashboard/maintenance">نگهداری</a>
          {existingChecklistCount > 0 && <a className="ghost-button" href="/organization/workforce-dashboard/launch-checklist">ادامه چک‌لیست اجرایی</a>}
          <a className={readiness.score >= 70 ? "primary-button" : "ghost-button tone-warn"} href="/organization/workforce-dashboard/launch-signoff">رفتن به تأیید راه‌اندازی</a>
          <button className="primary-button" type="button" onClick={buildLaunchChecklist}>ساخت چک‌لیست اجرایی</button>
          <button className="primary-button" type="button" onClick={createStartSnapshot}>ساخت snapshot شروع</button>
        </div>
      </header>

      <section className="kpi-strip">
        <article className={`kpi-card tone-${readinessStatusTone(readiness.status)}`}>
          <div><p>امتیاز آمادگی</p><strong>{toPersianNumber(readiness.score)}</strong><span>{readinessStatusLabel(readiness.status)}</span></div>
        </article>
        <article className="kpi-card tone-good">
          <div><p>چک‌های پاس‌شده</p><strong>{toPersianNumber(readiness.passedCount)}</strong><span>از {toPersianNumber(readiness.checks.length)} چک</span></div>
        </article>
        <article className="kpi-card tone-critical">
          <div><p>بحرانی</p><strong>{toPersianNumber(readiness.criticalCount)}</strong><span>مانع شروع امن</span></div>
        </article>
        <article className="kpi-card tone-warn">
          <div><p>هشدار</p><strong>{toPersianNumber(readiness.warningCount)}</strong><span>نیازمند پیگیری</span></div>
        </article>
        <article className="kpi-card tone-focus">
          <div><p>Snapshotها</p><strong>{toPersianNumber(snapshots.length)}</strong><span>برای بازگشت سریع</span></div>
        </article>
      </section>

      <section className="bottom-grid">
        <section className="panel wide-panel">
          <div className="section-head">
            <h2>وضعیت کلی</h2>
            <StatusBadge tone={readinessStatusTone(readiness.status)}>{readinessStatusLabel(readiness.status)}</StatusBadge>
          </div>
          <p>{readiness.summary}</p>
          {readiness.score < 85 && <p className="inline-notice">برای تبدیل موارد باز به قدم‌های کوتاه و قابل پیگیری، از چک‌لیست اجرایی استفاده کنید.</p>}
          <div className="mini-meter readiness-meter"><span style={{ width: `${readiness.score}%` }} /></div>
          <div className="finding-meta">
            <span>آخرین محاسبه: {toPersianNumber(new Date(readiness.generatedAt).toLocaleString("fa-IR"))}</span>
            <span>اقدام‌های باز: {toPersianNumber(failedChecks.length)}</span>
            <span>سلامت داده: {maintenanceHealthLabel(maintenanceReport.healthStatus)}</span>
          </div>
        </section>

        <section className="panel">
          <h2>اقدام‌های اولویت‌دار</h2>
          <div className="analysis-list">
            {readiness.topActions.map((item) => (
              <article className={`panel-row tone-${checkTone(item)}`} key={item.id}>
                <StatusBadge tone={checkTone(item)}>{item.severity}</StatusBadge>
                <p>{item.title}</p>
                <a className="ghost-button" href={item.actionPath}>{item.actionLabel}</a>
              </article>
            ))}
            {!readiness.topActions.length && <p>اقدام فوری باقی نمانده است.</p>}
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
                <StatusBadge tone={categoryScore === 100 ? "good" : categoryScore >= 60 ? "warn" : "critical"}>{toPersianNumber(categoryScore)}٪</StatusBadge>
              </div>
              <div className="mini-meter readiness-meter"><span style={{ width: `${categoryScore}%` }} /></div>
              <div className="analysis-list">
                {categoryChecks.map((item) => (
                  <article className={`panel-row tone-${checkTone(item)}`} key={item.id}>
                    <StatusBadge tone={checkTone(item)}>{item.passed ? "آماده" : item.severity}</StatusBadge>
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
    refresh(reset ? "چک‌لیست با وضعیت تازه بازسازی شد." : "چک‌لیست به‌روز شد و وضعیت‌های قابل حفظ باقی ماندند.");
  };

  const completeItem = (id: string) => {
    launchChecklistService.complete(id);
    refresh("اقدام انجام‌شده ثبت شد.");
  };

  const dismissItem = (id: string) => {
    if (!managerNote.trim()) {
      setMessage("برای رد اقدام، دلیل کوتاهی ثبت کنید.");
      return;
    }
    launchChecklistService.dismiss(id, managerNote);
    setDismissingId(undefined);
    setManagerNote("");
    refresh("اقدام با یادداشت مدیر رد شد.");
  };

  const reopenItem = (id: string) => {
    launchChecklistService.reopen(id);
    refresh("اقدام دوباره به فهرست باز برگشت.");
  };

  const createLaunchSnapshot = () => {
    workforceBackupService.createSnapshot(
      "Snapshot پیش از راه‌اندازی",
      "launch_checklist_snapshot",
      "وضعیت داده‌ها و چک‌لیست قبل از شروع راه‌اندازی ذخیره شد.",
      false,
    );
    refresh("Snapshot پیش از راه‌اندازی ساخته شد.");
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
      {item.managerNote && <div className="manager-note">یادداشت مدیر: {item.managerNote}</div>}
      {dismissingId === item.id && (
        <div className="dismiss-panel">
          <input
            className="search-input"
            value={managerNote}
            onChange={(event) => setManagerNote(event.target.value)}
            placeholder="دلیل کوتاه رد اقدام"
            maxLength={180}
          />
          <button className="ghost-button tone-critical" type="button" onClick={() => dismissItem(item.id)}>ثبت رد</button>
        </div>
      )}
      <div className="row-actions">
        <a className="ghost-button" href={item.actionPath}>{item.actionLabel || "رفتن به صفحه اقدام"}</a>
        {item.status === "open" && (
          <>
            <button className="primary-button" type="button" onClick={() => completeItem(item.id)}><CheckCircle2 size={16} /> انجام شد</button>
            <button className="ghost-button" type="button" onClick={() => { setDismissingId(item.id); setManagerNote(""); }}><XCircle size={16} /> رد شد</button>
          </>
        )}
        {item.status !== "open" && <button className="ghost-button" type="button" onClick={() => reopenItem(item.id)}><RotateCcw size={16} /> باز کردن دوباره</button>}
      </div>
    </article>
  );

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <span className="eyebrow">P15 Launch Checklist</span>
          <h1>چک‌لیست اجرایی راه‌اندازی</h1>
          <p>قدم بعدی مشخص است؛ هر اقدام را انجام دهید، رد کنید یا مستقیم به صفحه مربوط بروید.</p>
        </div>
        <div className="hero-actions">
          <a className="ghost-button" href="/organization/workforce-dashboard/readiness">رفتن به آمادگی عملیاتی</a>
          <a className={report.openCount ? "ghost-button tone-warn" : "primary-button"} href="/organization/workforce-dashboard/launch-signoff">تأیید راه‌اندازی</a>
          <button className="ghost-button" type="button" onClick={createLaunchSnapshot}>ساخت snapshot پیش از راه‌اندازی</button>
          <button className="primary-button" type="button" onClick={() => rebuild(false)}><RotateCcw size={17} /> بازسازی از وضعیت فعلی</button>
          <button className="ghost-button" type="button" onClick={() => rebuild(true)}>بازسازی کامل</button>
        </div>
      </header>

      {message && <div className="inline-notice">{message}</div>}
      {report.openCount > 0 && <div className="inline-notice tone-warn">هنوز {toPersianNumber(report.openCount)} اقدام باز است؛ در گزارش تأیید پنهان نخواهد شد.</div>}

      <section className="kpi-strip">
        <article className="kpi-card tone-focus"><div><p>پیشرفت راه‌اندازی</p><strong>{toPersianNumber(report.progressPercent)}٪</strong><span>بر پایه اقدام‌های تکمیل‌شده</span></div></article>
        <article className="kpi-card tone-warn"><div><p>اقدام باز</p><strong>{toPersianNumber(report.openCount)}</strong><span>منتظر اقدام مدیر</span></div></article>
        <article className="kpi-card tone-good"><div><p>تکمیل‌شده</p><strong>{toPersianNumber(report.completedCount)}</strong><span>ثبت‌شده در همین مرورگر</span></div></article>
        <article className="kpi-card tone-empty"><div><p>ردشده</p><strong>{toPersianNumber(report.dismissedCount)}</strong><span>دارای تصمیم مدیریتی</span></div></article>
        <article className="kpi-card tone-critical"><div><p>بحرانی باز</p><strong>{toPersianNumber(report.criticalOpenCount)}</strong><span>اولویت شروع امن</span></div></article>
      </section>

      <section className="launch-overview">
        <section className="panel launch-progress-card">
          <div className="section-head"><h2>مسیر راه‌اندازی</h2><StatusBadge tone={report.criticalOpenCount ? "critical" : report.openCount ? "warn" : "good"}>{toPersianNumber(report.progressPercent)}٪</StatusBadge></div>
          <div className="mini-meter readiness-meter"><span style={{ width: `${report.progressPercent}%` }} /></div>
          <p>{report.summary}</p>
        </section>
        <section className={`panel next-step-card tone-${report.nextBestStep ? severityTone(report.nextBestStep.severity) : "good"}`}>
          <span className="eyebrow">قدم بعدی پیشنهادی</span>
          <h2>{report.nextBestStep?.title ?? "راه‌اندازی آماده است"}</h2>
          <p>{report.nextBestStep?.description ?? "اقدام بازی باقی نمانده است؛ وضعیت readiness را یک‌بار دیگر بررسی کنید."}</p>
          {report.nextBestStep && <a className="primary-button" href={report.nextBestStep.actionPath}>{report.nextBestStep.actionLabel}</a>}
        </section>
      </section>

      <div className="filter-bar">
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as LaunchChecklistStatus | "all")} aria-label="فیلتر وضعیت">
          <option value="all">همه وضعیت‌ها</option>
          <option value="open">باز</option>
          <option value="completed">انجام‌شده</option>
          <option value="dismissed">ردشده</option>
        </select>
        <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value as ReadinessCheckCategory | "all")} aria-label="فیلتر دسته">
          <option value="all">همه دسته‌ها</option>
          {categories.map((category) => <option key={category} value={category}>{readinessCategoryLabel(category)}</option>)}
        </select>
      </div>

      {!report.items.length && (
        <section className="panel empty-launch-state">
          <ClipboardCheck size={32} />
          <h2>چک‌لیست هنوز ساخته نشده است</h2>
          <p>وضعیت فعلی readiness را به قدم‌های اجرایی تبدیل کنید.</p>
          <button className="primary-button" type="button" onClick={() => rebuild(false)}>ساخت چک‌لیست اجرایی</button>
        </section>
      )}

      <section className="launch-category-list">
        {Object.entries(groupedItems).map(([category, items]) => (
          <section className="panel" key={category}>
            <div className="section-head">
              <h2>{readinessCategoryLabel(category as ReadinessCheckCategory)}</h2>
              <StatusBadge tone="info">{toPersianNumber(items.length)} اقدام</StatusBadge>
            </div>
            <div className="launch-items-grid">{items.map(itemCard)}</div>
          </section>
        ))}
        {report.items.length > 0 && !filteredItems.length && <section className="panel"><h2>موردی پیدا نشد</h2><p>فیلتر وضعیت یا دسته را تغییر دهید.</p></section>}
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
    workforceBackupService.createSnapshot("Snapshot پیش از بازتأیید", "before_operational_resignoff", "قبل از بررسی بازتأیید عملیاتی ساخته شد.", false);
    setRefreshToken((value) => value + 1);
    setMessage("Snapshot پیش از بازتأیید ساخته شد.");
  };

  const signResignoff = () => {
    if (!signedBy.trim() || !managerNote.trim()) {
      setMessage("نام تأییدکننده و یادداشت مدیر الزامی است.");
      return;
    }
    if (!drift.baselineSignoffId) {
      setMessage("ابتدا launch signoff و baseline اولیه را ثبت کنید.");
      return;
    }
    if (!window.confirm(`بازتأیید عملیاتی با پذیرش ${drift.totalChanges} تغییر ثبت و baseline جدید ساخته شود؟`)) return;
    try {
      setLastReviewedDrift(drift);
      operationalResignoffService.sign(drift, signedBy, managerNote);
      setMessage("بازتأیید ثبت شد و baseline جدید از وضعیت فعلی ساخته شد.");
      setRefreshToken((value) => value + 1);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "ثبت بازتأیید انجام نشد.");
    }
  };

  const changeCard = (change: BaselineDriftChange) => (
    <article className={`drift-change tone-${driftTone(change.severity)}`} key={change.id}>
      <div className="section-head">
        <div className="badge-row">
          <StatusBadge tone={driftTone(change.severity)}>{change.severity}</StatusBadge>
          {change.requiresResignoff && <StatusBadge tone="critical">بازتأیید</StatusBadge>}
          {!change.requiresResignoff && change.requiresReview && <StatusBadge tone="warn">بازبینی</StatusBadge>}
        </div>
        <small>{change.entityType}</small>
      </div>
      <h3>{change.title}</h3>
      <p>{change.description}</p>
      <div className="drift-before-after"><span>قبل: {change.beforeSummary}</span><span>اکنون: {change.afterSummary}</span></div>
    </article>
  );

  return (
    <div className="page-stack baseline-drift-page">
      <header className="page-header no-print">
        <div>
          <span className="eyebrow">P17 Baseline Drift</span>
          <h1>پایش Drift بعد از Baseline</h1>
          <p>تغییرات بعد از تأیید عملیاتی را ببینید و فقط وقتی لازم است baseline را بازتأیید کنید.</p>
        </div>
        <div className="hero-actions">
          <a className="ghost-button" href="/organization/workforce-dashboard/operations-calendar">تقویم کنترل‌ها</a>
          <a className="ghost-button" href="/organization/workforce-dashboard/launch-signoff">رفتن به launch signoff</a>
          <a className="ghost-button" href="/organization/workforce-dashboard/operational-history">مشاهده تاریخچه drift</a>
          <button className="ghost-button" type="button" onClick={makePreResignoffSnapshot}>ساخت snapshot قبل از بازتأیید</button>
          <button className="ghost-button" type="button" onClick={() => window.print()}><Printer size={17} /> چاپ گزارش drift</button>
        </div>
      </header>

      {drift.baselineSignoffId && <BaselineCompatibilityNotice report={drift} />}
      {message && <div className="inline-notice no-print">{message}</div>}
      {(retentionReport.staleDriftCount > 0 || retentionReport.expiredResignoffCount > 0) && <div className="inline-notice tone-critical no-print">Drift قدیمی یا بازتأیید نیازمند مرور است. <a href="/organization/workforce-dashboard/history-retention">بررسی سیاست نگهداری</a></div>}
      {!drift.baselineSignoffId && <div className="inline-notice tone-critical no-print">Baseline امضاشده‌ای وجود ندارد؛ ابتدا تأیید راه‌اندازی را ثبت کنید.</div>}

      <section className="kpi-strip no-print">
        <article className="kpi-card tone-focus"><div><p>Baseline</p><strong>{drift.baselineSignoffId ? "فعال" : "ندارد"}</strong><span>{drift.baselineChecksum || "ابتدا signoff"}</span></div></article>
        <article className={`kpi-card tone-${driftTone(drift.driftLevel)}`}><div><p>امتیاز Drift</p><strong>{toPersianNumber(drift.driftScore)}</strong><span>از ۱۰۰</span></div></article>
        <article className={`kpi-card tone-${driftTone(drift.driftLevel)}`}><div><p>سطح Drift</p><strong>{driftLevelLabel(drift.driftLevel)}</strong><span>{toPersianNumber(drift.totalChanges)} تغییر</span></div></article>
        <article className="kpi-card tone-warn"><div><p>نیازمند بازبینی</p><strong>{toPersianNumber(drift.reviewCount)}</strong><span>تغییر مهم</span></div></article>
        <article className={`kpi-card tone-${drift.requiresResignoff ? "critical" : "good"}`}><div><p>بازتأیید</p><strong>{drift.requiresResignoff ? "لازم است" : "لازم نیست"}</strong><span>{toPersianNumber(drift.resignoffCount)} تغییر مستقیم</span></div></article>
      </section>

      <section className="drift-checksum-strip no-print">
        <div><small>Checksum baseline</small><code>{drift.baselineChecksum || "ثبت نشده"}</code></div>
        <div><small>Checksum فعلی</small><code>{drift.currentChecksum}</code></div>
      </section>

      <section className={`panel drift-decision tone-${driftTone(drift.driftLevel)} no-print`}>
        <div className="section-head"><h2>تصمیم پیشنهادی</h2><StatusBadge tone={driftTone(drift.driftLevel)}>{driftLevelLabel(drift.driftLevel)}</StatusBadge></div>
        <p>{drift.summary}</p><strong>{drift.recommendedAction}</strong>
      </section>

      <div className="filter-bar no-print">
        <select value={severityFilter} onChange={(event) => setSeverityFilter(event.target.value as BaselineDriftSeverity | "all")} aria-label="فیلتر شدت drift">
          <option value="all">همه شدت‌ها</option><option value="critical">بحرانی</option><option value="high">زیاد</option><option value="medium">متوسط</option><option value="low">کم</option><option value="info">اطلاع</option>
        </select>
        <select value={resignoffFilter} onChange={(event) => setResignoffFilter(event.target.value as "all" | "yes" | "no")} aria-label="فیلتر بازتأیید">
          <option value="all">همه تغییرات</option><option value="yes">نیازمند بازتأیید</option><option value="no">بدون نیاز به بازتأیید</option>
        </select>
      </div>

      <section className="drift-groups no-print">
        {Object.entries(groupedChanges).map(([storageKey, changes]) => (
          <section className="panel" key={storageKey}>
            <div className="section-head"><h2>{storageKey}</h2><StatusBadge tone="info">{toPersianNumber(changes.length)} تغییر</StatusBadge></div>
            <div className="drift-change-grid">{changes.map(changeCard)}</div>
          </section>
        ))}
        {drift.baselineSignoffId && !filteredChanges.length && <section className="panel empty-launch-state"><CheckCircle2 className="tone-good" size={32} /><h2>تغییری در این فیلتر وجود ندارد</h2><p>{drift.driftLevel === "none" ? "وضعیت فعلی با baseline یکسان است." : "فیلترها را تغییر دهید."}</p></section>}
      </section>

      {drift.baselineSignoffId && drift.totalChanges > 0 && (
        <section className="panel resignoff-form no-print">
          <div className="section-head"><h2>ثبت بازتأیید عملیاتی</h2><StatusBadge tone={drift.requiresResignoff ? "critical" : "warn"}>{drift.requiresResignoff ? "ضروری" : "اختیاری"}</StatusBadge></div>
          <div className="field-grid">
            <label className="field"><span>نام تأییدکننده</span><input value={signedBy} onChange={(event) => setSignedBy(event.target.value)} placeholder="نام و سمت" /></label>
            <label className="field field-textarea"><span>یادداشت تغییرات پذیرفته‌شده</span><textarea value={managerNote} onChange={(event) => setManagerNote(event.target.value)} placeholder="دلیل پذیرش و نتیجه بازبینی" /></label>
          </div>
          <button className={drift.requiresResignoff ? "danger-button" : "primary-button"} type="button" onClick={signResignoff}>ثبت بازتأیید عملیاتی</button>
        </section>
      )}

      <section className="print-surface drift-print">
        <div className="report-title"><span className="eyebrow">گزارش پایش پس از راه‌اندازی</span><h1>گزارش Drift نسبت به Baseline</h1><StatusBadge tone={driftTone(printableDrift.driftLevel)}>{driftLevelLabel(printableDrift.driftLevel)}</StatusBadge></div>
        <div className="signoff-facts">
          <div><small>زمان گزارش</small><strong>{toPersianNumber(new Date(printableDrift.generatedAt).toLocaleString("fa-IR"))}</strong></div>
          <div><small>امتیاز drift</small><strong>{toPersianNumber(printableDrift.driftScore)}</strong></div>
          <div><small>تغییرات</small><strong>{toPersianNumber(printableDrift.totalChanges)}</strong></div>
          <div><small>Baseline checksum</small><code>{printableDrift.baselineChecksum || "ندارد"}</code></div>
          <div><small>Current checksum</small><code>{printableDrift.currentChecksum}</code></div>
          <div><small>نیاز به بازتأیید</small><strong>{printableDrift.requiresResignoff ? "بله" : "خیر"}</strong></div>
        </div>
        <section className="report-section"><h2>تغییرات مهم</h2>{printableDrift.changes.filter((item) => item.requiresReview).length ? <ul>{printableDrift.changes.filter((item) => item.requiresReview).map((item) => <li key={item.id}>{item.title}: {item.beforeSummary} ← {item.afterSummary}</li>)}</ul> : <p>تغییر مهمی ثبت نشده است.</p>}</section>
        <section className="report-section"><h2>تغییرات نیازمند بازتأیید</h2>{printableDrift.changes.filter((item) => item.requiresResignoff).length ? <ul>{printableDrift.changes.filter((item) => item.requiresResignoff).map((item) => <li key={item.id}>{item.title}</li>)}</ul> : <p>موردی ثبت نشده است.</p>}</section>
        <section className="report-section"><h2>یادداشت مدیر</h2><p>{latestResignoff?.managerNote || managerNote || "ثبت نشده"}</p></section>
        <div className="signature-box"><span>نام و امضای بازتأییدکننده</span><strong>{latestResignoff?.signedBy || signedBy || "................................"}</strong><span>تاریخ: {latestResignoff?.signedAt ? toPersianNumber(new Date(latestResignoff.signedAt).toLocaleDateString("fa-IR")) : "................"}</span></div>
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
    { label: "داده‌های پایه کامل", passed: baselineSummary.spacesCount > 0 && baselineSummary.employeesCount > 0 && baselineSummary.taskTypesCount > 0 },
    { label: "Snapshot قابل بازگشت", passed: baselineSummary.snapshotsCount > 0 },
    { label: "بدون اقدام بحرانی در چک‌لیست", passed: checklist.criticalOpenCount === 0 },
    { label: "سلامت نگهداری قابل قبول", passed: maintenance.healthStatus !== "risky" && maintenance.healthStatus !== "critical" },
    { label: "آمادگی عملیاتی غیرپرریسک", passed: readiness.status !== "risky" },
  ];

  const saveDraft = () => {
    const report = launchSignoffService.createDraft(signoffContext);
    if (managerNote.trim()) launchSignoffService.updateManagerNote(report.id, managerNote);
    setLatestSignoff(launchSignoffService.latest());
    setMessage("پیش‌نویس گزارش ذخیره شد.");
  };

  const signLaunch = () => {
    if (!signedBy.trim()) {
      setMessage("نام تأییدکننده الزامی است.");
      return;
    }
    if (!approvalDate) {
      setMessage("تاریخ تأیید الزامی است.");
      return;
    }
    if (draft.blockers.length && (!acceptRisk || !managerNote.trim())) {
      setMessage("برای تأیید با ریسک، پذیرش ریسک و یادداشت مدیر الزامی است.");
      return;
    }
    const confirmation = draft.blockers.length
      ? `این راه‌اندازی ${draft.blockers.length} مانع فعال دارد. با ثبت baseline، ریسک‌های نمایش‌داده‌شده را آگاهانه می‌پذیرید. ادامه می‌دهید؟`
      : "Baseline عملیاتی ساخته و راه‌اندازی نهایی تأیید شود؟";
    if (!window.confirm(confirmation)) return;
    try {
      const report = launchSignoffService.sign(signoffContext, {
        signedBy,
        signedAt: new Date(`${approvalDate}T12:00:00.000Z`).toISOString(),
        managerNote,
        acceptRisk,
      });
      setLatestSignoff(report);
      setMessage("Baseline ساخته شد و راه‌اندازی تأیید شد.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "تأیید راه‌اندازی انجام نشد.");
    }
  };

  const revokeSignoff = () => {
    if (!latestSignoff || !revokeNote.trim()) {
      setMessage("برای لغو تأیید، دلیل کوتاهی ثبت کنید.");
      return;
    }
    if (!window.confirm("تأیید عملیاتی این baseline لغو شود؟ داده‌های baseline حذف نمی‌شوند.")) return;
    try {
      const report = launchSignoffService.revoke(latestSignoff.id, revokeNote);
      setLatestSignoff(report);
      setMessage("تأیید راه‌اندازی لغو شد؛ baseline برای بایگانی باقی ماند.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "لغو تأیید انجام نشد.");
    }
  };

  const statusTone: StatusTone = draft.blockers.length ? "critical" : latestSignoff?.status === "signed" ? "good" : "warn";

  return (
    <div className="page-stack launch-signoff-page">
      <header className="page-header no-print">
        <div>
          <span className="eyebrow">P16 Launch Signoff</span>
          <h1>تأیید نهایی راه‌اندازی</h1>
          <p>کنترل نهایی، ثبت مسئول تأیید و ساخت baseline قابل بازگشت برای شروع استفاده واقعی.</p>
        </div>
        <div className="hero-actions">
          <a className="ghost-button" href="/organization/workforce-dashboard">رفتن به داشبورد اصلی</a>
          <a className="ghost-button" href="/organization/workforce-dashboard/launch-checklist">چک‌لیست راه‌اندازی</a>
          {latestSignoff?.status === "signed" && <a className="ghost-button" href="/organization/workforce-dashboard/baseline-drift">پایش Drift baseline</a>}
          <button className="ghost-button" type="button" onClick={() => window.print()}><Printer size={17} /> چاپ گزارش</button>
        </div>
      </header>

      {message && <div className="inline-notice no-print">{message}</div>}
       {latestSignoff?.status === "signed" && <BaselineCompatibilityNotice report={baselineDrift} />}
     {latestSignoff?.status === "signed" && (baselineDrift.driftLevel === "high" || baselineDrift.driftLevel === "critical") && (
        <div className="inline-notice tone-critical no-print">Baseline فعلی drift {driftLevelLabel(baselineDrift.driftLevel)} دارد و باید بازتأیید شود.</div>
      )}

      <section className="kpi-strip no-print">
        <article className={`kpi-card tone-${readinessStatusTone(readiness.status)}`}><div><p>آمادگی</p><strong>{toPersianNumber(readiness.score)}</strong><span>{readinessStatusLabel(readiness.status)}</span></div></article>
        <article className="kpi-card tone-focus"><div><p>پیشرفت راه‌اندازی</p><strong>{toPersianNumber(checklist.progressPercent)}٪</strong><span>{toPersianNumber(checklist.openCount)} اقدام باز</span></div></article>
        <article className={`kpi-card tone-${maintenanceHealthTone(maintenance.healthStatus)}`}><div><p>نگهداری</p><strong>{maintenanceHealthLabel(maintenance.healthStatus)}</strong><span>{toPersianNumber(maintenance.totalIssues)} مسئله</span></div></article>
        <article className="kpi-card tone-info"><div><p>Snapshot</p><strong>{toPersianNumber(snapshots.length)}</strong><span>{snapshots[0]?.title ?? "ثبت نشده"}</span></div></article>
        <article className={`kpi-card tone-${statusTone}`}><div><p>اجازه تأیید</p><strong>{draft.blockers.length ? "مسدود" : "آماده"}</strong><span>{toPersianNumber(draft.blockers.length)} مانع</span></div></article>
      </section>

      {draft.blockers.length > 0 && (
        <section className="panel signoff-blockers no-print">
          <div className="section-head"><h2>موانع تأیید عادی</h2><StatusBadge tone="critical">ریسک آشکار</StatusBadge></div>
          <div className="analysis-list">{draft.blockers.map((item) => <div className="panel-row tone-critical" key={item}>{item}</div>)}</div>
        </section>
      )}

      <section className="signoff-layout no-print">
        <section className="panel">
          <h2>کنترل‌های پیش از تأیید</h2>
          <div className="approval-checks">
            {approvalChecks.map((item) => (
              <div className="approval-check" key={item.label}>
                {item.passed ? <CheckCircle2 className="tone-good" size={19} /> : <AlertTriangle className="tone-critical" size={19} />}
                <span>{item.label}</span>
                <StatusBadge tone={item.passed ? "good" : "critical"}>{item.passed ? "پاس" : "باز"}</StatusBadge>
              </div>
            ))}
          </div>
        </section>

        <section className="panel signoff-form">
          <h2>ثبت تأیید مدیر</h2>
          <div className="field-grid">
            <label className="field"><span>نام تأییدکننده</span><input value={signedBy} onChange={(event) => setSignedBy(event.target.value)} placeholder="نام و سمت" /></label>
            <label className="field"><span>تاریخ تأیید</span><input type="date" value={approvalDate} onChange={(event) => setApprovalDate(event.target.value)} /></label>
            <label className="field field-textarea"><span>یادداشت مدیر</span><textarea value={managerNote} onChange={(event) => setManagerNote(event.target.value)} placeholder={draft.blockers.length ? "برای پذیرش ریسک اجباری است" : "یادداشت اختیاری برای بایگانی"} /></label>
          </div>
          {draft.blockers.length > 0 && (
            <label className="risk-acceptance">
              <input type="checkbox" checked={acceptRisk} onChange={(event) => setAcceptRisk(event.target.checked)} />
              <span>ریسک‌های باز را دیده‌ام و مسئولیت شروع عملیاتی با این وضعیت را می‌پذیرم.</span>
            </label>
          )}
          <div className="form-actions">
            <button className="ghost-button" type="button" onClick={saveDraft}>ذخیره پیش‌نویس</button>
            <button className={draft.blockers.length ? "danger-button" : "primary-button"} type="button" onClick={signLaunch}><FileCheck2 size={17} /> ساخت baseline و تأیید راه‌اندازی</button>
          </div>
        </section>
      </section>

      <section className="print-surface launch-signoff-print">
        <div className="report-title">
          <span className="eyebrow">گزارش قابل بایگانی</span>
          <h1>{printableReport.title}</h1>
          <StatusBadge tone={printableReport.status === "signed" ? "good" : printableReport.status === "revoked" ? "critical" : statusTone}>
            {printableReport.status === "signed" ? "تأییدشده" : printableReport.status === "revoked" ? "لغوشده" : "پیش‌نویس"}
          </StatusBadge>
        </div>

        <div className="signoff-facts">
          <div><small>تاریخ گزارش</small><strong>{toPersianNumber(new Date(printableReport.signedAt ?? printableReport.generatedAt).toLocaleString("fa-IR"))}</strong></div>
          <div><small>تأییدکننده</small><strong>{printableReport.signedBy || signedBy || "ثبت نشده"}</strong></div>
          <div><small>امتیاز آمادگی</small><strong>{toPersianNumber(printableReport.readinessScore)}</strong></div>
          <div><small>پیشرفت راه‌اندازی</small><strong>{toPersianNumber(printableReport.launchProgressPercent)}٪</strong></div>
          <div><small>سلامت نگهداری</small><strong>{maintenanceHealthLabel(printableReport.maintenanceHealthStatus)}</strong></div>
          <div><small>Checksum baseline</small><code>{printableReport.baselineChecksum || "پس از تأیید ساخته می‌شود"}</code></div>
        </div>

        <section className="report-section">
          <h2>خلاصه baseline</h2>
          <div className="baseline-summary-grid">
            {Object.entries(printableReport.baselineSummary).map(([key, value]) => <div key={key}><small>{baselineSummaryLabel(key as keyof typeof printableReport.baselineSummary)}</small><strong>{toPersianNumber(value)}</strong></div>)}
          </div>
        </section>

        <section className="signoff-risk-grid">
          <div className="report-section"><h2>ریسک‌های باز یا پذیرفته‌شده</h2>{printableReport.unresolvedRisks.length ? <ul>{printableReport.unresolvedRisks.map((item) => <li key={item}>{item}</li>)}</ul> : <p>ریسک بازی ثبت نشده است.</p>}</div>
          <div className="report-section"><h2>آیتم‌های باز چک‌لیست</h2>{printableReport.unresolvedChecklistItems.length ? <ul>{printableReport.unresolvedChecklistItems.map((item) => <li key={item}>{item}</li>)}</ul> : <p>آیتم بازی باقی نمانده است.</p>}</div>
        </section>

        <section className="report-section"><h2>یادداشت مدیر</h2><p>{printableReport.managerNote || managerNote || "یادداشتی ثبت نشده است."}</p></section>
        <div className="signature-box"><span>نام و امضای تأییدکننده</span><strong>{printableReport.signedBy || signedBy || "................................"}</strong><span>تاریخ: {toPersianNumber(printableReport.signedAt ? new Date(printableReport.signedAt).toLocaleDateString("fa-IR") : approvalDate)}</span></div>

        {latestSignoff?.baselineBundle && (
          <div className="row-actions no-print">
            <button className="primary-button" type="button" onClick={() => launchSignoffService.downloadBaseline(latestSignoff.id)}>دانلود backup baseline</button>
          </div>
        )}
      </section>

      {latestSignoff?.status === "signed" && (
        <section className="panel no-print revoke-panel">
          <h2>لغو تأیید عملیاتی</h2>
          <p>Baseline و گزارش حذف نمی‌شوند؛ فقط اعتبار عملیاتی آن لغو می‌شود.</p>
          <div className="dismiss-panel"><input className="search-input" value={revokeNote} onChange={(event) => setRevokeNote(event.target.value)} placeholder="دلیل لغو تأیید" /><button className="danger-button" type="button" onClick={revokeSignoff}>لغو تأیید</button></div>
        </section>
      )}
    </div>
  );
}

function baselineSummaryLabel(key: keyof ReturnType<typeof buildLaunchBaselineSummary>) {
  const labels: Partial<Record<keyof ReturnType<typeof buildLaunchBaselineSummary>, string>> = {
    spacesCount: "فضاها",
    employeesCount: "کارمندان",
    taskTypesCount: "نوع کارها",
    scheduleItemsCount: "آیتم‌های برنامه",
    rulesCount: "قوانین",
    reportsCount: "گزارش‌ها",
    goalsCount: "هدف‌ها",
    preventiveAlertsCount: "هشدارهای پیشگیرانه",
    snapshotsCount: "Snapshotها",
    maintenanceIssuesCount: "مسائل نگهداری",
  };
  return labels[key] ?? String(key);
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
      setError("ساعت پایان فروشگاه باید بعد از ساعت شروع باشد.");
      return;
    }
    if (form.workloadCriticalHours <= form.workloadWarningHours) {
      setError("آستانه بحرانی باید بیشتر از آستانه هشدار باشد.");
      return;
    }
    if (form.riskImpact.critical <= form.riskImpact.warning || form.riskImpact.warning <= form.riskImpact.info) {
      setError("امتیاز ریسک باید به ترتیب critical، warning و info نزولی باشد.");
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
          <span className="eyebrow">تنظیمات تحلیل</span>
          <h1>آستانه‌های مغز سیستم</h1>
          <p>این مقادیر در مرورگر ذخیره می‌شوند و محاسبه داشبورد و جزئیات تحلیل را تغییر می‌دهند.</p>
        </div>
      </header>

      <section className="management-layout">
        <section className="config-card">
          <h2>تنظیمات قابل ویرایش</h2>
          {error && <p className="form-error">{error}</p>}
          {saved && !error && <p className="success-note">تنظیمات ذخیره شد.</p>}
          <div className="field-grid">
            <TextField label="شروع فعالیت فروشگاه" type="time" value={form.storeWorkingHours.startTime} onChange={(startTime) => setForm({ ...form, storeWorkingHours: { ...form.storeWorkingHours, startTime } })} />
            <TextField label="پایان فعالیت فروشگاه" type="time" value={form.storeWorkingHours.endTime} onChange={(endTime) => setForm({ ...form, storeWorkingHours: { ...form.storeWorkingHours, endTime } })} />
            <TextField label="آستانه فشار کاری هشدار" type="number" value={form.workloadWarningHours} onChange={(value) => setForm({ ...form, workloadWarningHours: Number(value) })} />
            <TextField label="آستانه فشار کاری بحرانی" type="number" value={form.workloadCriticalHours} onChange={(value) => setForm({ ...form, workloadCriticalHours: Number(value) })} />
            <TextField label="امتیاز ریسک critical" type="number" value={form.riskImpact.critical} onChange={(value) => setForm({ ...form, riskImpact: { ...form.riskImpact, critical: Number(value) } })} />
            <TextField label="امتیاز ریسک warning" type="number" value={form.riskImpact.warning} onChange={(value) => setForm({ ...form, riskImpact: { ...form.riskImpact, warning: Number(value) } })} />
            <TextField label="امتیاز ریسک info" type="number" value={form.riskImpact.info} onChange={(value) => setForm({ ...form, riskImpact: { ...form.riskImpact, info: Number(value) } })} />
            <TextField label="تعداد آیتم‌های مهم داشبورد" type="number" value={form.dashboardImportantItemCount} onChange={(value) => setForm({ ...form, dashboardImportantItemCount: Math.max(1, Number(value)) })} />
          </div>
          <div className="form-actions">
            <button className="primary-button" type="button" onClick={submit}>ذخیره تنظیمات</button>
            <button className="ghost-button" type="button" onClick={() => {
              resetSettings();
              setSaved(false);
              setError("");
            }}>بازگشت به پیش‌فرض</button>
          </div>
        </section>
        <InfoPanel
          title="اثر تنظیمات"
          items={[
            { title: "فروشگاه", caption: "قانون پوشش فروشگاه از ساعت شروع و پایان استفاده می‌کند.", tone: "sales" },
            { title: "فشار کاری", caption: "قانون فشار کاری از آستانه‌های هشدار و بحرانی می‌خواند.", tone: "warn" },
            { title: "امتیاز کنترل", caption: "totalRiskScore و controlScore از امتیازهای ریسک تنظیم‌شده ساخته می‌شوند.", tone: "info" },
          ]}
        />
      </section>
    </div>
  );
}

function compatibilityLabel(value: WorkCompatibility) {
  if (value === "preferred") return "ترجیحی";
  if (value === "allowed") return "مجاز";
  if (value === "warning") return "هشدار";
  return "مسدود";
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
          <span className="eyebrow">سازگاری P4</span>
          <h1>ماتریس فضا و نوع کار</h1>
          <p>این وضعیت‌ها به قانون سازگاری analyzer وصل هستند و روی findings اثر می‌گذارند.</p>
        </div>
        <div className="hero-actions">
          <button className="ghost-button" type="button" onClick={() => { resetCompatibility(); setSaved(false); }}>
            <RotateCcw size={17} /> reset demo
          </button>
          <button className="primary-button" type="button" onClick={() => setSaved(true)}>ذخیره تغییرات</button>
        </div>
      </header>

      <section className="filter-bar">
        <Filter size={16} />
        <select value={taskFilter} onChange={(event) => setTaskFilter(event.target.value)}>
          {optionList(taskTypes, "همه نوع کارها").map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
        </select>
        <select value={spaceFilter} onChange={(event) => setSpaceFilter(event.target.value)}>
          {optionList(spaces, "همه فضاها").map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
        </select>
        {saved && <span className="inline-note">تغییرات در localStorage ذخیره شده‌اند.</span>}
      </section>

      <section className="compatibility-shell">
        <div className="compatibility-grid" style={{ gridTemplateColumns: `12rem repeat(${activeSpaces.length}, minmax(12rem, 1fr))` }}>
          <div className="compatibility-head">نوع کار / فضا</div>
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
                      <option value="preferred">ترجیحی</option>
                      <option value="allowed">مجاز</option>
                      <option value="warning">هشدار</option>
                      <option value="blocked">مسدود</option>
                    </select>
                    <textarea
                      value={rule?.reason ?? ""}
                      placeholder="دلیل کوتاه"
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
  if (verdict === "improved") return "بهتر شد";
  if (verdict === "worsened") return "بدتر شد";
  return "تقریبا بدون تغییر";
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
    const ok = window.confirm("این تغییر روی برنامه اصلی اعمال شود؟ فقط همین آیتم ویرایش می‌شود.");
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
    const employee = employees.find((row) => row.id === item.employeeId)?.name ?? "کارمند";
    const space = spaces.find((row) => row.id === item.spaceId)?.name ?? "فضا";
    const task = taskTypes.find((row) => row.id === item.taskTypeId)?.name ?? "نوع کار";
    return `${item.day} ${toPersianNumber(item.startTime)}-${toPersianNumber(item.endTime)} | ${employee} | ${space} | ${task}`;
  };

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <span className="eyebrow">شبیه‌ساز P5</span>
          <h1>تست جابه‌جایی برنامه</h1>
          <p>سناریو روی کپی موقت برنامه تحلیل می‌شود و داده اصلی تغییر نمی‌کند.</p>
        </div>
        <a className="ghost-button" href="/organization/workforce-dashboard/analysis">بازگشت به تحلیل</a>
      </header>

      {finding && (
        <section className="panel">
          <h2>یافته مبنا</h2>
          <div className="panel-row tone-warn">
            <StatusBadge tone={severityTone(finding.severity)}>{severityLabel(finding.severity)}</StatusBadge>
            <p>{finding.title} | {finding.recommendation}</p>
          </div>
        </section>
      )}

      <section className="management-layout">
        <section className="config-card">
          <h2>سناریوی فرضی</h2>
          <div className="field-grid">
            <SelectField label="آیتم برنامه" value={change.scheduleItemId} options={scheduleItems.filter((item) => item.isActive).map((item) => ({ label: itemLabel(item), value: item.id }))} onChange={(scheduleItemId) => {
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
            <SelectField label="روز جدید" value={simulatedChange.newDayOfWeek ?? ""} options={weekDays.map((day) => ({ label: day, value: day }))} onChange={(newDayOfWeek) => setChange({ ...change, newDayOfWeek: newDayOfWeek as WorkDay })} />
            <TextField label="شروع جدید" type="time" value={simulatedChange.newStartTime ?? ""} onChange={(newStartTime) => setChange({ ...change, newStartTime })} />
            <TextField label="پایان جدید" type="time" value={simulatedChange.newEndTime ?? ""} onChange={(newEndTime) => setChange({ ...change, newEndTime })} />
            <SelectField label="فضای جدید" value={simulatedChange.newSpaceId ?? ""} options={optionList(spaces)} onChange={(newSpaceId) => setChange({ ...change, newSpaceId })} />
            <SelectField label="کارمند جدید" value={simulatedChange.newEmployeeId ?? ""} options={optionList(employees)} onChange={(newEmployeeId) => setChange({ ...change, newEmployeeId })} />
            <SelectField label="نوع کار جدید" value={simulatedChange.newTaskTypeId ?? ""} options={optionList(taskTypes)} onChange={(newTaskTypeId) => setChange({ ...change, newTaskTypeId })} />
          </div>
          <div className="form-actions">
            <button className="primary-button" type="button" onClick={runSimulation}>تحلیل سناریو</button>
            <button className="ghost-button" type="button" onClick={() => { setChange(initialChange ?? fallbackChange); setResult(null); }}>بازگشت به حالت اولیه</button>
            <button className="danger-button" type="button" onClick={applyChange} disabled={!result}>اعمال تغییر به برنامه اصلی</button>
          </div>
        </section>

        <section className="config-card">
          <h2>وضعیت فعلی آیتم</h2>
          {selectedItem ? (
            <div className="panel-row">
              <StatusBadge tone="info">{selectedItem.day}</StatusBadge>
              <p>{itemLabel(selectedItem)}</p>
            </div>
          ) : <p>آیتمی برای شبیه‌سازی وجود ندارد.</p>}
        </section>
      </section>

      {result && (
        <section className="page-stack">
          <section className="simulation-compare">
            <article className="kpi-card tone-info"><div><p>قبل</p><strong>{toPersianNumber(result.originalAnalysis.controlScore)}</strong><span>کنترل | ریسک {toPersianNumber(result.originalAnalysis.totalRiskScore)}</span></div></article>
            <article className="kpi-card tone-focus"><div><p>بعد</p><strong>{toPersianNumber(result.simulatedAnalysis.controlScore)}</strong><span>کنترل | ریسک {toPersianNumber(result.simulatedAnalysis.totalRiskScore)}</span></div></article>
            <article className={`kpi-card tone-${verdictTone(result.verdict)}`}><div><p>تغییر</p><strong>{toPersianNumber(result.controlScoreDelta)}</strong><span>ریسک {toPersianNumber(result.riskScoreDelta)}</span></div></article>
            <article className={`kpi-card tone-${verdictTone(result.verdict)}`}><div><p>نتیجه</p><strong>{verdictLabel(result.verdict)}</strong><span>{result.summary}</span></div></article>
          </section>
          <section className="bottom-grid">
            <InfoPanel title="هشدارهای حل‌شده" items={result.resolvedFindings.slice(0, 4).map((item) => ({ title: item.title, caption: item.recommendation, tone: severityTone(item.severity) }))} />
            <InfoPanel title="هشدارهای جدید" items={result.newFindings.slice(0, 4).map((item) => ({ title: item.title, caption: item.recommendation, tone: severityTone(item.severity) }))} />
            <InfoPanel title="بدتر شده‌ها" items={result.worsenedFindings.slice(0, 4).map((item) => ({ title: item.title, caption: item.recommendation, tone: severityTone(item.severity) }))} />
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
