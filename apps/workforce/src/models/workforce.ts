export type StatusTone = "good" | "warn" | "critical" | "focus" | "info" | "sales" | "break" | "empty";

export type FocusLevel = "کم" | "متوسط" | "زیاد";
export type DistractionLevel = "کم" | "متوسط" | "زیاد";
export type WorkDay = "شنبه" | "یکشنبه" | "دوشنبه" | "سه‌شنبه" | "چهارشنبه" | "پنجشنبه" | "جمعه";
export type PriorityLevel = "کم" | "معمولی" | "بالا";

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface Space extends BaseEntity {
  name: string;
  type: string;
  normalCapacity: number;
  maxCapacity: number;
  distractionLevel: DistractionLevel;
  requiresCompanion: boolean;
  soloWorkAllowed: boolean;
  description: string;
}

export interface Employee extends BaseEntity {
  name: string;
  primaryRole: string;
  skills: string[];
  focusNeed: FocusLevel;
  goodForSales: boolean;
  goodForProduction: boolean;
  goodForDigital: boolean;
  defaultSpaceId: string;
  description: string;
}

export interface TaskType extends BaseEntity {
  name: string;
  category: string;
  focusNeed: FocusLevel;
  needsCleanSpace: boolean;
  requiresCompanion: boolean;
  requiresCustomerPresence: boolean;
  suggestedSpaceId: string;
  description: string;
}

export interface WeeklyScheduleItem extends BaseEntity {
  day: WorkDay;
  startTime: string;
  endTime: string;
  employeeId: string;
  spaceId: string;
  taskTypeId: string;
  priority: PriorityLevel;
  description: string;
}

export interface AnalysisRule extends BaseEntity {
  key: string;
  title: string;
  description: string;
  tone: StatusTone;
}

export interface WorkforceState {
  spaces: Space[];
  employees: Employee[];
  taskTypes: TaskType[];
  scheduleItems: WeeklyScheduleItem[];
  rules: AnalysisRule[];
}

export type CollectionName = keyof WorkforceState;

export type AnalysisSeverity = "ok" | "info" | "warning" | "critical";

export interface AnalysisFinding {
  id: string;
  ruleId: string;
  severity: AnalysisSeverity;
  title: string;
  description: string;
  affectedEmployeeIds: string[];
  affectedSpaceIds: string[];
  affectedScheduleItemIds: string[];
  dayOfWeek?: WorkDay;
  startTime?: string;
  endTime?: string;
  scoreImpact: number;
  recommendation: string;
  evidence?: string;
  whyItHappened?: string;
  suggestedFixType?: "move" | "add-person" | "reschedule" | "change-space" | "reduce-load" | "review";
}

export interface WeeklyAnalysisResult {
  findings: AnalysisFinding[];
  totalRiskScore: number;
  controlScore: number;
  criticalCount: number;
  warningCount: number;
  focusScore: number;
  salesCoverageScore: number;
  spaceCapacityScore: number;
  safetyScore: number;
  mainProblem: string;
  nextBestAction: string;
}

export interface SpaceOccupancySnapshot {
  spaceId: string;
  dayOfWeek: WorkDay;
  startTime: string;
  endTime: string;
  employeeCount: number;
  normalCapacity: number;
  maxCapacity: number;
  status: AnalysisSeverity;
}

export interface WorkHourConfig {
  startTime: string;
  endTime: string;
}

export interface RiskScoreConfig {
  info: number;
  warning: number;
  critical: number;
}

export interface AnalysisSettings {
  storeWorkingHours: WorkHourConfig;
  workloadWarningHours: number;
  workloadCriticalHours: number;
  cleanDirtyNearMinutes: number;
  riskImpact: RiskScoreConfig;
  dashboardImportantItemCount: number;
}

export type WorkCompatibility = "preferred" | "allowed" | "warning" | "blocked";

export interface WorkCompatibilityRule extends BaseEntity {
  taskTypeId: string;
  spaceId: string;
  compatibility: WorkCompatibility;
  reason: string;
}

export type SimulationVerdict = "improved" | "worsened" | "neutral";

export interface SimulationChange {
  scheduleItemId: string;
  newDayOfWeek?: WorkDay;
  newStartTime?: string;
  newEndTime?: string;
  newSpaceId?: string;
  newEmployeeId?: string;
  newTaskTypeId?: string;
}

export interface SimulationResult {
  originalAnalysis: WeeklyAnalysisResult;
  simulatedAnalysis: WeeklyAnalysisResult;
  controlScoreDelta: number;
  riskScoreDelta: number;
  criticalDelta: number;
  warningDelta: number;
  verdict: SimulationVerdict;
  summary: string;
  improvedFindings: AnalysisFinding[];
  worsenedFindings: AnalysisFinding[];
  newFindings: AnalysisFinding[];
  resolvedFindings: AnalysisFinding[];
}

export const weekDays: WorkDay[] = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"];
export type RecommendationScenarioType =
  | "move_space"
  | "move_time"
  | "change_employee"
  | "add_support_person"
  | "keep_but_warn"
  | "split_task"
  | "no_safe_action";

export type RecommendationConfidence = "low" | "medium" | "high";
export type RecommendationEffortLevel = "low" | "medium" | "high";

export interface RecommendationScenario {
  id: string;
  findingId: string;
  type: RecommendationScenarioType;
  title: string;
  description: string;
  change?: SimulationChange;
  expectedEffect: string;
  confidence: RecommendationConfidence;
  effortLevel: RecommendationEffortLevel;
  riskLevel: AnalysisSeverity;
  simulationResult?: SimulationResult;
  rankScore: number;
  canApply: boolean;
  reason: string;
}

export type DecisionQueueStatus = "pending" | "selected" | "blocked" | "applied" | "skipped";

export interface DecisionQueueItem {
  id: string;
  scenarioId: string;
  findingId: string;
  title: string;
  change?: SimulationChange;
  canApply: boolean;
  status: DecisionQueueStatus;
  conflictGroupId?: string;
  reason: string;
  createdAt: string;
  updatedAt: string;
}

export type DecisionConflictType =
  | "same_schedule_item"
  | "overlapping_time_change"
  | "same_employee_conflict"
  | "space_capacity_conflict"
  | "creates_new_critical"
  | "incompatible_changes";

export interface DecisionConflict {
  id: string;
  scenarioIds: string[];
  type: DecisionConflictType;
  severity: AnalysisSeverity;
  description: string;
  recommendation: string;
}

export interface DecisionBatchResult {
  selectedScenarioIds: string[];
  originalAnalysis: WeeklyAnalysisResult;
  batchAnalysis: WeeklyAnalysisResult;
  controlScoreBefore: number;
  controlScoreAfter: number;
  riskScoreBefore: number;
  riskScoreAfter: number;
  criticalBefore: number;
  criticalAfter: number;
  warningBefore: number;
  warningAfter: number;
  verdict: SimulationVerdict;
  summary: string;
  conflicts: DecisionConflict[];
  safeToApply: boolean;
  appliedChanges: SimulationChange[];
}

export type DecisionReportStatus = "draft" | "approved" | "applied" | "needs_review";

export interface DecisionReportSummary {
  controlScoreBefore: number;
  controlScoreAfter: number;
  riskScoreBefore: number;
  riskScoreAfter: number;
  criticalBefore: number;
  criticalAfter: number;
  warningBefore: number;
  warningAfter: number;
  verdict: SimulationVerdict;
  summary: string;
}

export interface DecisionReport {
  id: string;
  title: string;
  weekLabel: string;
  generatedAt: string;
  status: DecisionReportStatus;
  approvedBy: string;
  managerNote: string;
  decisionBatchResult: DecisionBatchResult;
  appliedScenarioIds: string[];
  skippedScenarioIds: string[];
  remainingRisks: AnalysisFinding[];
  summary: DecisionReportSummary;
  createdAt: string;
  updatedAt: string;
  isArchived?: boolean;
}

export interface ReportTrendPoint {
  reportId: string;
  weekLabel: string;
  generatedAt: string;
  controlScoreAfter: number;
  riskScoreAfter: number;
  criticalAfter: number;
  warningAfter: number;
  decisionCount: number;
}

export interface ReportComparisonResult {
  reportIds: string[];
  controlScoreTrend: ReportTrendPoint[];
  riskScoreTrend: ReportTrendPoint[];
  criticalTrend: ReportTrendPoint[];
  warningTrend: ReportTrendPoint[];
  bestReportId?: string;
  worstReportId?: string;
  averageControlScore: number;
  averageRiskScore: number;
  totalAppliedDecisions: number;
  recurringRiskTitles: string[];
  summary: string;
  managementInsight: string;
}

export interface MonthlyManagementSummary {
  id: string;
  monthLabel: string;
  generatedAt: string;
  reportIds: string[];
  averageControlScore: number;
  averageRiskScore: number;
  bestWeek: string;
  worstWeek: string;
  mostRepeatedProblems: string[];
  mostEffectiveDecisions: string[];
  managerSummary: string;
  recommendedFocusForNextMonth: string;
}

export type MonthlyTrendStatus = "improving" | "worsening" | "stable" | "insufficient_data";
export type MonthlyHealthLevel = "excellent" | "good" | "needs_attention" | "critical";
export type MonthlyGoalStatus = "planned" | "in_progress" | "achieved" | "missed";

export interface MonthlyHealthDashboard {
  id: string;
  monthLabel: string;
  generatedAt: string;
  reportIds: string[];
  averageControlScore: number;
  averageRiskScore: number;
  bestWeekLabel: string;
  worstWeekLabel: string;
  trendStatus: MonthlyTrendStatus;
  repeatedRiskCount: number;
  topRecurringRisks: string[];
  mostEffectiveDecisionTitles: string[];
  weakestArea: string;
  strongestArea: string;
  nextMonthFocus: string;
  managementSummary: string;
  healthLevel: MonthlyHealthLevel;
}

export interface MonthlyGoal {
  id: string;
  monthLabel: string;
  title: string;
  description: string;
  targetMetric: string;
  targetValue: number;
  currentValue: number;
  status: MonthlyGoalStatus;
  createdAt: string;
  updatedAt: string;
  isArchived?: boolean;
}

export type PreventiveAlertSeverity = "info" | "warning" | "critical";
export type PreventiveAlertSourceType =
  | "recurring_risk"
  | "failed_goal"
  | "worsening_trend"
  | "repeated_space_pressure"
  | "repeated_focus_interruption"
  | "repeated_sales_coverage_gap";
export type PreventiveAlertPriority = "low" | "medium" | "high" | "urgent";
export type PreventiveAlertStatus = "open" | "acknowledged" | "planned" | "resolved" | "dismissed";

export interface PreventiveAlert {
  id: string;
  title: string;
  description: string;
  severity: PreventiveAlertSeverity;
  sourceType: PreventiveAlertSourceType;
  repeatedCount: number;
  firstSeenLabel: string;
  lastSeenLabel: string;
  affectedArea: string;
  relatedRiskTitles: string[];
  relatedGoalIds: string[];
  recommendedAction: string;
  priority: PreventiveAlertPriority;
  status: PreventiveAlertStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PreventiveAlertState {
  alertKey: string;
  status: PreventiveAlertStatus;
  managerNote: string;
  updatedAt: string;
}

export interface WorkforceBackupMetadata {
  spacesCount: number;
  employeesCount: number;
  taskTypesCount: number;
  scheduleItemsCount: number;
  rulesCount: number;
  reportsCount: number;
  goalsCount: number;
  snapshotCount: number;
  exportedBy: string;
  note: string;
  coverageVersion?: string;
  knownKeyCount?: number;
  includedKeyCount?: number;
  excludedKeyCount?: number;
  includedKeys?: string[];
  excludedKeys?: string[];
}

export interface WorkforceBackupBundle {
  id: string;
  version: string;
  appName: string;
  generatedAt: string;
  source: string;
  data: Record<string, unknown>;
  metadata: WorkforceBackupMetadata;
  checksum: string;
}

export interface WorkforceSnapshot {
  id: string;
  title: string;
  createdAt: string;
  reason: string;
  bundle: WorkforceBackupBundle;
  isAuto: boolean;
  note: string;
}

export interface BackupValidationResult {
  isValid: boolean;
  version: string;
  errors: string[];
  warnings: string[];
  counts: Partial<WorkforceBackupMetadata>;
  canImport: boolean;
}

export type BackupCoverageStatus = "complete" | "needs_attention" | "risky";

export interface BackupCoverageKeyStatus {
  key: string;
  title: string;
  isCritical: boolean;
  reason: string;
}

export interface BackupCoverageReport {
  generatedAt: string;
  totalKnownKeys: number;
  includedInBackupCount: number;
  missingFromBackupCount: number;
  criticalMissingCount: number;
  coveredKeys: BackupCoverageKeyStatus[];
  missingKeys: BackupCoverageKeyStatus[];
  extraKeysInBundle: string[];
  warnings: string[];
  status: BackupCoverageStatus;
}

export type MaintenanceHealthStatus = "healthy" | "needs_attention" | "risky" | "critical";
export type MaintenanceIssueSeverity = "info" | "warning" | "critical";
export type MaintenanceIssueType =
  | "missing_storage_key"
  | "invalid_json"
  | "orphan_reference"
  | "inactive_reference"
  | "stale_snapshot"
  | "no_backup"
  | "duplicate_id"
  | "schema_mismatch"
  | "empty_required_collection"
  | "oversized_storage"
  | "unsafe_state";

export interface MaintenanceIssue {
  id: string;
  type: MaintenanceIssueType;
  severity: MaintenanceIssueSeverity;
  title: string;
  description: string;
  storageKey?: string;
  entityType?: string;
  entityId?: string;
  relatedEntityId?: string;
  recommendation: string;
  canAutoFix: boolean;
  fixAction?: string;
  createdAt: string;
}

export interface StorageKeyHealth {
  key: string;
  exists: boolean;
  isValidJson: boolean;
  itemCount: number;
  estimatedSizeKb: number;
  lastCheckedAt: string;
  status: MaintenanceIssueSeverity | "ok";
}

export interface MaintenanceReport {
  id: string;
  generatedAt: string;
  healthStatus: MaintenanceHealthStatus;
  totalIssues: number;
  criticalCount: number;
  warningCount: number;
  infoCount: number;
  storageStats: StorageKeyHealth[];
  issues: MaintenanceIssue[];
  recommendations: string[];
  snapshotRecommendation: string;
  summary: string;
}

export type OperationalReadinessStatus = "ready" | "almost_ready" | "needs_setup" | "risky";
export type ReadinessCheckSeverity = "info" | "warning" | "critical";
export type ReadinessCheckCategory =
  | "base_data"
  | "schedule"
  | "rules"
  | "analysis"
  | "backup"
  | "maintenance"
  | "reports"
  | "monthly_goals"
  | "preventive_alerts"
  | "ui_flow";

export interface ReadinessCheck {
  id: string;
  category: ReadinessCheckCategory;
  title: string;
  description: string;
  severity: ReadinessCheckSeverity;
  passed: boolean;
  scoreImpact: number;
  actionLabel: string;
  actionPath: string;
  evidence: string;
}

export interface OperationalReadinessReport {
  id: string;
  generatedAt: string;
  score: number;
  status: OperationalReadinessStatus;
  passedCount: number;
  warningCount: number;
  criticalCount: number;
  checks: ReadinessCheck[];
  topActions: ReadinessCheck[];
  summary: string;
}

export type LaunchChecklistStatus = "open" | "completed" | "dismissed";

export interface LaunchChecklistItem {
  id: string;
  sourceCheckId: string;
  category: ReadinessCheckCategory;
  title: string;
  description: string;
  severity: ReadinessCheckSeverity;
  actionLabel: string;
  actionPath: string;
  status: LaunchChecklistStatus;
  managerNote: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  dismissedAt?: string;
}

export interface LaunchChecklistReport {
  id: string;
  generatedAt: string;
  progressPercent: number;
  openCount: number;
  completedCount: number;
  dismissedCount: number;
  criticalOpenCount: number;
  items: LaunchChecklistItem[];
  summary: string;
  nextBestStep?: LaunchChecklistItem;
}

export type LaunchSignoffStatus = "draft" | "ready_to_sign" | "signed" | "blocked" | "revoked";

export interface LaunchBaselineSummary {
  spacesCount: number;
  employeesCount: number;
  taskTypesCount: number;
  scheduleItemsCount: number;
  rulesCount: number;
  reportsCount: number;
  goalsCount: number;
  preventiveAlertsCount: number;
  snapshotsCount: number;
  maintenanceIssuesCount: number;
  includedKeyCount?: number;
  coverageVersion?: string;
}

export interface LaunchSignoffReport {
  id: string;
  title: string;
  generatedAt: string;
  signedAt?: string;
  status: LaunchSignoffStatus;
  signedBy: string;
  managerNote: string;
  readinessScore: number;
  readinessStatus: OperationalReadinessStatus;
  launchProgressPercent: number;
  maintenanceHealthStatus: MaintenanceHealthStatus;
  openCriticalCount: number;
  openWarningCount: number;
  snapshotId?: string;
  backupBundleId?: string;
  baselineChecksum: string;
  baselineCoverageVersion?: string;
  baselineSummary: LaunchBaselineSummary;
  unresolvedRisks: string[];
  unresolvedChecklistItems: string[];
  blockers: string[];
  acceptedRisk: boolean;
  baselineBundle?: WorkforceBackupBundle;
  createdAt: string;
  updatedAt: string;
}

export type BaselineDriftLevel = "none" | "low" | "medium" | "high" | "critical";
export type BaselineDriftSeverity = "info" | "low" | "medium" | "high" | "critical";
export type BaselineDriftChangeType =
  | "count_changed"
  | "entity_added"
  | "entity_removed"
  | "entity_updated"
  | "rule_changed"
  | "settings_changed"
  | "schedule_changed"
  | "compatibility_changed"
  | "report_changed"
  | "goal_changed"
  | "alert_state_changed"
  | "backup_state_changed";

export interface BaselineDriftChange {
  id: string;
  type: BaselineDriftChangeType;
  severity: BaselineDriftSeverity;
  scoreImpact: number;
  storageKey: string;
  entityType: string;
  entityId?: string;
  title: string;
  description: string;
  beforeSummary: string;
  afterSummary: string;
  requiresReview: boolean;
  requiresResignoff: boolean;
}

export interface BaselineDriftReport {
  id: string;
  generatedAt: string;
  baselineSignoffId: string;
  baselineChecksum: string;
  currentChecksum: string;
  baselineCoverageVersion?: string;
  currentCoverageVersion?: string;
  isLegacyBaseline?: boolean;
  compatibilityWarnings?: string[];
  comparableKeyCount?: number;
  nonComparableKeyCount?: number;
  comparableChecksumBefore?: string;
  comparableChecksumAfter?: string;
  driftScore: number;
  driftLevel: BaselineDriftLevel;
  totalChanges: number;
  reviewCount: number;
  resignoffCount: number;
  requiresResignoff: boolean;
  changes: BaselineDriftChange[];
  summary: string;
  recommendedAction: string;
}

export type OperationalResignoffStatus = "draft" | "signed" | "revoked";

export interface OperationalResignoffReport {
  id: string;
  generatedAt: string;
  baselineSignoffId: string;
  driftReportId: string;
  status: OperationalResignoffStatus;
  signedBy: string;
  signedAt?: string;
  managerNote: string;
  acceptedChanges: string[];
  newBaselineSnapshotId?: string;
  newBaselineChecksum: string;
  newBaselineCoverageVersion?: string;
  newBaselineBundle?: WorkforceBackupBundle;
  createdAt: string;
  updatedAt: string;
}

export type OperationalHistoryEventType =
  | "drift_report"
  | "resignoff_signed"
  | "resignoff_revoked"
  | "launch_signoff_signed"
  | "baseline_changed"
  | "backup_created"
  | "snapshot_created"
  | "maintenance_fix"
  | "import_restored"
  | "decision_batch_applied";

export type OperationalHistorySeverity = "info" | "low" | "medium" | "high" | "critical";

export interface OperationalHistoryEvent {
  id: string;
  type: OperationalHistoryEventType;
  title: string;
  description: string;
  occurredAt: string;
  actorName: string;
  severity: OperationalHistorySeverity;
  relatedId: string;
  relatedPath: string;
  checksum: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface DriftTrendPoint {
  id: string;
  generatedAt: string;
  driftScore: number;
  driftLevel: BaselineDriftLevel;
  requiresResignoff: boolean;
  baselineChecksum: string;
  currentChecksum: string;
}

export interface OperationalHistoryReport {
  id: string;
  generatedAt: string;
  events: OperationalHistoryEvent[];
  driftTrend: DriftTrendPoint[];
  resignoffCount: number;
  baselineChangeCount: number;
  criticalEventCount: number;
  summary: string;
  recommendedAction: string;
}

export interface HistoryRetentionPolicy {
  id: string;
  keepRecentDays: number;
  archiveAfterDays: number;
  criticalKeepDays: number;
  driftReviewAfterDays: number;
  resignoffExpiresAfterDays: number;
  maxEventsBeforeWarning: number;
  autoArchiveSuggestionEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export type HistoryRetentionStatus = "healthy" | "needs_archive" | "needs_review" | "risky";
export type HistoryRetentionIssueType =
  | "history_too_large"
  | "stale_drift"
  | "expired_resignoff"
  | "no_recent_archive"
  | "no_recent_snapshot"
  | "too_many_critical_events"
  | "archive_recommended";

export interface HistoryRetentionIssue {
  id: string;
  type: HistoryRetentionIssueType;
  severity: OperationalHistorySeverity;
  title: string;
  description: string;
  relatedEventId?: string;
  relatedPath: string;
  recommendation: string;
  createdAt: string;
}

export interface OperationalHistoryArchive {
  id: string;
  title: string;
  createdAt: string;
  fromDate: string;
  toDate: string;
  eventCount: number;
  criticalEventCount: number;
  driftEventCount: number;
  resignoffCount: number;
  checksum: string;
  events: OperationalHistoryEvent[];
  summary: string;
  note: string;
}

export interface HistoryRetentionReport {
  id: string;
  generatedAt: string;
  status: HistoryRetentionStatus;
  totalEvents: number;
  criticalEventCount: number;
  archiveCandidateCount: number;
  staleDriftCount: number;
  expiredResignoffCount: number;
  issues: HistoryRetentionIssue[];
  recommendations: string[];
  latestArchiveAt?: string;
  latestSnapshotAt?: string;
  summary: string;
}

export type OperationalControlType =
  | "snapshot_due"
  | "backup_due"
  | "archive_due"
  | "maintenance_review"
  | "drift_review"
  | "resignoff_due"
  | "readiness_review"
  | "monthly_health_review"
  | "preventive_alert_review"
  | "launch_checklist_review";

export type OperationalControlStatus = "upcoming" | "due_today" | "overdue" | "completed" | "snoozed" | "dismissed";
export type OperationalControlPriority = "low" | "medium" | "high" | "urgent";

export interface OperationalControlItem {
  id: string;
  type: OperationalControlType;
  title: string;
  description: string;
  dueAt: string;
  status: OperationalControlStatus;
  priority: OperationalControlPriority;
  relatedPath: string;
  source: string;
  completedAt?: string;
  snoozedUntil?: string;
  dismissedAt?: string;
  managerNote: string;
  createdAt: string;
  updatedAt: string;
}

export interface OperationalCalendarReport {
  id: string;
  generatedAt: string;
  totalControls: number;
  overdueCount: number;
  todayCount: number;
  upcomingCount: number;
  completedCount: number;
  urgentCount: number;
  controls: OperationalControlItem[];
  summary: string;
  nextBestControl?: OperationalControlItem;
}

export interface OperationalControlSchedulePolicy {
  id: string;
  snapshotEveryDays: number;
  backupEveryDays: number;
  archiveEveryDays: number;
  maintenanceReviewEveryDays: number;
  driftReviewEveryDays: number;
  resignoffExpiresAfterDays: number;
  readinessReviewEveryDays: number;
  monthlyHealthReviewEveryDays: number;
  preventiveAlertReviewEveryDays: number;
  launchChecklistReviewEveryDays: number;
  enabledControlTypes: OperationalControlType[];
  defaultPriorities: Record<OperationalControlType, OperationalControlPriority>;
  createdAt: string;
  updatedAt: string;
}

export interface OperationalControlExportOptions {
  id: string;
  includeCompleted: boolean;
  includeDismissed: boolean;
  includeSnoozed: boolean;
  includeOverdue: boolean;
  includeUpcomingDays: number;
  includeRelatedPath: boolean;
  includeManagerNote: boolean;
  createdAt: string;
  updatedAt: string;
}

export type OperationalNotificationChannel = "none" | "in_app" | "calendar_export" | "future_external";

export interface OperationalNotificationPreference {
  id: string;
  enabled: boolean;
  channel: OperationalNotificationChannel;
  controlTypes: OperationalControlType[];
  minimumPriority: OperationalControlPriority;
  daysBeforeDue: number;
  createdAt: string;
  updatedAt: string;
}

export type OperationalInAppNotificationStatus = "unread" | "read" | "dismissed";

export interface OperationalInAppNotification {
  id: string;
  controlId: string;
  title: string;
  description: string;
  priority: OperationalControlPriority;
  dueAt: string;
  relatedPath: string;
  status: OperationalInAppNotificationStatus;
  createdAt: string;
  readAt?: string;
  dismissedAt?: string;
}

export const workingHours = ["09", "10", "11", "12", "13", "14", "15", "16", "17"];

export const toPersianNumber = (value: string | number) =>
  String(value).replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);

export const nowIso = () => new Date().toISOString();

export const createId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
