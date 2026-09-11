import type {
  MaintenanceHealthStatus,
  MaintenanceIssue,
  MaintenanceIssueSeverity,
  MaintenanceIssueType,
  MaintenanceReport,
  StorageKeyHealth,
} from "../models/workforce";
import { createId, nowIso } from "../models/workforce";
import { workforceBackupKeys, workforceSnapshotStorageKey } from "../services/workforceBackupService";

export type MaintenanceStorageSnapshot = Record<string, string | null>;

const requiredArrayKeys = new Set([
  "komak.workforce.spaces.v1",
  "komak.workforce.employees.v1",
  "komak.workforce.taskTypes.v1",
  "komak.workforce.scheduleItems.v1",
  "komak.workforce.rules.v1",
  "komak.workforce.compatibilityRules.v1",
  "komak.workforce.decisionReports.v1",
  "komak.workforce.monthlyGoals.v1",
  "komak.workforce.preventiveAlertStates.v1",
  "komak.workforce.decisionQueue.v1",
  workforceSnapshotStorageKey,
]);

const baseRequiredCollections = [
  "komak.workforce.spaces.v1",
  "komak.workforce.employees.v1",
  "komak.workforce.taskTypes.v1",
  "komak.workforce.rules.v1",
];

function parseJson(raw: string | null) {
  if (!raw) return { ok: true, value: null as unknown };
  try {
    return { ok: true, value: JSON.parse(raw) as unknown };
  } catch {
    return { ok: false, value: null as unknown };
  }
}

function asRows<T>(value: unknown): T[] {
  return Array.isArray(value) ? value as T[] : [];
}

function issue(params: Omit<MaintenanceIssue, "id" | "createdAt">): MaintenanceIssue {
  return { ...params, id: createId("maintenance-issue"), createdAt: nowIso() };
}

function rowMap<T extends { id?: string; isActive?: boolean }>(rows: T[]) {
  return new Map(rows.filter((row) => row.id).map((row) => [row.id as string, row]));
}

function storageSizeKb(raw: string | null) {
  return raw ? Math.round((raw.length / 1024) * 10) / 10 : 0;
}

export function checkStorageKeys(snapshot: MaintenanceStorageSnapshot): StorageKeyHealth[] {
  return [...workforceBackupKeys, workforceSnapshotStorageKey].map((key) => {
    const raw = snapshot[key] ?? null;
    const parsed = parseJson(raw);
    const isArray = Array.isArray(parsed.value);
    const itemCount = isArray ? (parsed.value as unknown[]).length : parsed.value && typeof parsed.value === "object" ? 1 : 0;
    return {
      key,
      exists: raw !== null,
      isValidJson: parsed.ok,
      itemCount,
      estimatedSizeKb: storageSizeKb(raw),
      lastCheckedAt: nowIso(),
      status: !raw ? "warning" : !parsed.ok ? "critical" : requiredArrayKeys.has(key) && raw && !isArray ? "warning" : "ok",
    };
  });
}

export function detectInvalidJson(snapshot: MaintenanceStorageSnapshot): MaintenanceIssue[] {
  return checkStorageKeys(snapshot)
    .filter((item) => item.exists && !item.isValidJson)
    .map((item) => issue({
      type: "invalid_json",
      severity: "critical",
      title: "JSON خراب در localStorage",
      description: `${item.key} قابل خواندن نیست.`,
      storageKey: item.key,
      recommendation: "قبل از پاک‌سازی، از data-center بکاپ یا snapshot بساز.",
      canAutoFix: false,
    }));
}

export function detectDuplicateIds(data: Record<string, unknown>): MaintenanceIssue[] {
  const issues: MaintenanceIssue[] = [];
  for (const key of workforceBackupKeys) {
    const rows = asRows<{ id?: string }>(data[key]);
    const seen = new Set<string>();
    for (const row of rows) {
      if (!row.id) continue;
      if (seen.has(row.id)) {
        issues.push(issue({
          type: "duplicate_id",
          severity: "critical",
          title: "شناسه تکراری",
          description: `در ${key} شناسه ${row.id} بیش از یک بار دیده شد.`,
          storageKey: key,
          entityId: row.id,
          recommendation: "این مورد نیازمند بررسی دستی است.",
          canAutoFix: false,
        }));
      }
      seen.add(row.id);
    }
  }
  return issues;
}

export function detectEmptyRequiredCollections(data: Record<string, unknown>): MaintenanceIssue[] {
  return baseRequiredCollections
    .filter((key) => asRows(data[key]).length === 0)
    .map((key) => issue({
      type: "empty_required_collection",
      severity: "warning",
      title: "collection پایه خالی است",
      description: `${key} داده‌ای ندارد.`,
      storageKey: key,
      recommendation: "در صورت نیاز reset demo یا import بکاپ معتبر انجام بده.",
      canAutoFix: false,
    }));
}

export function detectOrphanReferences(data: Record<string, unknown>): MaintenanceIssue[] {
  const issues: MaintenanceIssue[] = [];
  const employees = rowMap(asRows<{ id?: string; isActive?: boolean }>(data["komak.workforce.employees.v1"]));
  const spaces = rowMap(asRows<{ id?: string; isActive?: boolean }>(data["komak.workforce.spaces.v1"]));
  const tasks = rowMap(asRows<{ id?: string; isActive?: boolean }>(data["komak.workforce.taskTypes.v1"]));
  const schedule = asRows<{ id?: string; employeeId?: string; spaceId?: string; taskTypeId?: string; isActive?: boolean }>(data["komak.workforce.scheduleItems.v1"]);
  const compatibility = asRows<{ id?: string; spaceId?: string; taskTypeId?: string }>(data["komak.workforce.compatibilityRules.v1"]);

  const missing = (entityType: string, entityId: string | undefined, relatedEntityId: string | undefined, storageKey: string, fixAction?: string) => {
    issues.push(issue({
      type: "orphan_reference",
      severity: "critical",
      title: "رابطه orphan",
      description: `${entityType} به رکوردی اشاره می‌کند که وجود ندارد.`,
      storageKey,
      entityType,
      entityId,
      relatedEntityId,
      recommendation: fixAction ? "می‌توان این آیتم را با تایید مدیر غیرفعال کرد." : "این رابطه نیازمند بررسی دستی است.",
      canAutoFix: Boolean(fixAction),
      fixAction,
    }));
  };

  for (const item of schedule) {
    if (item.employeeId && !employees.has(item.employeeId)) missing("scheduleItem.employeeId", item.id, item.employeeId, "komak.workforce.scheduleItems.v1", "deactivate_orphan_schedule_item");
    if (item.spaceId && !spaces.has(item.spaceId)) missing("scheduleItem.spaceId", item.id, item.spaceId, "komak.workforce.scheduleItems.v1", "deactivate_orphan_schedule_item");
    if (item.taskTypeId && !tasks.has(item.taskTypeId)) missing("scheduleItem.taskTypeId", item.id, item.taskTypeId, "komak.workforce.scheduleItems.v1", "deactivate_orphan_schedule_item");
  }

  for (const rule of compatibility) {
    if (rule.spaceId && !spaces.has(rule.spaceId)) missing("compatibility.spaceId", rule.id, rule.spaceId, "komak.workforce.compatibilityRules.v1");
    if (rule.taskTypeId && !tasks.has(rule.taskTypeId)) missing("compatibility.taskTypeId", rule.id, rule.taskTypeId, "komak.workforce.compatibilityRules.v1");
  }

  return issues;
}

export function detectInactiveReferences(data: Record<string, unknown>): MaintenanceIssue[] {
  const issues: MaintenanceIssue[] = [];
  const employees = rowMap(asRows<{ id?: string; isActive?: boolean }>(data["komak.workforce.employees.v1"]));
  const spaces = rowMap(asRows<{ id?: string; isActive?: boolean }>(data["komak.workforce.spaces.v1"]));
  const tasks = rowMap(asRows<{ id?: string; isActive?: boolean }>(data["komak.workforce.taskTypes.v1"]));
  const schedule = asRows<{ id?: string; employeeId?: string; spaceId?: string; taskTypeId?: string }>(data["komak.workforce.scheduleItems.v1"]);
  for (const item of schedule) {
    const refs = [
      { type: "کارمند", row: employees.get(item.employeeId ?? "") },
      { type: "فضا", row: spaces.get(item.spaceId ?? "") },
      { type: "نوع کار", row: tasks.get(item.taskTypeId ?? "") },
    ];
    for (const ref of refs) {
      if (ref.row && ref.row.isActive === false) {
        issues.push(issue({
          type: "inactive_reference",
          severity: "warning",
          title: "ارجاع به رکورد غیرفعال",
          description: `آیتم برنامه به ${ref.type} غیرفعال وصل است.`,
          storageKey: "komak.workforce.scheduleItems.v1",
          entityType: "scheduleItem",
          entityId: item.id,
          recommendation: "برنامه را بازبینی کن یا آیتم را به رکورد فعال منتقل کن.",
          canAutoFix: false,
        }));
      }
    }
  }
  return issues;
}

export function detectOversizedStorage(storageStats: StorageKeyHealth[]): MaintenanceIssue[] {
  return storageStats
    .filter((item) => item.estimatedSizeKb > 512)
    .map((item) => issue({
      type: "oversized_storage",
      severity: "warning",
      title: "حجم localStorage بالا است",
      description: `${item.key} حدود ${item.estimatedSizeKb}KB حجم دارد.`,
      storageKey: item.key,
      recommendation: "گزارش‌ها یا snapshotهای قدیمی را بررسی کن.",
      canAutoFix: false,
    }));
}

export function detectBackupAndSnapshotHealth(data: Record<string, unknown>): MaintenanceIssue[] {
  const snapshots = asRows<{ createdAt?: string }>(data[workforceSnapshotStorageKey]);
  if (!snapshots.length) {
    return [issue({
      type: "no_backup",
      severity: "warning",
      title: "Snapshot وجود ندارد",
      description: "هنوز snapshot قابل بازیابی ثبت نشده است.",
      storageKey: workforceSnapshotStorageKey,
      recommendation: "از data-center یک snapshot دستی بساز.",
      canAutoFix: false,
    })];
  }
  const latest = snapshots
    .map((snapshot) => snapshot.createdAt ? new Date(snapshot.createdAt).getTime() : 0)
    .sort((a, b) => b - a)[0];
  if (!latest) {
    return [issue({
      type: "stale_snapshot",
      severity: "info",
      title: "زمان snapshot نامشخص است",
      description: "تاریخ snapshot قابل خواندن نیست.",
      storageKey: workforceSnapshotStorageKey,
      recommendation: "یک snapshot جدید بساز.",
      canAutoFix: false,
    })];
  }
  const ageDays = (Date.now() - latest) / 86_400_000;
  if (ageDays > 30) {
    return [issue({
      type: "stale_snapshot",
      severity: "critical",
      title: "Snapshot بسیار قدیمی است",
      description: "بیش از ۳۰ روز از آخرین snapshot گذشته است.",
      storageKey: workforceSnapshotStorageKey,
      recommendation: "همین امروز snapshot تازه بساز.",
      canAutoFix: false,
    })];
  }
  if (ageDays > 7) {
    return [issue({
      type: "stale_snapshot",
      severity: "warning",
      title: "Snapshot قدیمی است",
      description: "بیش از ۷ روز از آخرین snapshot گذشته است.",
      storageKey: workforceSnapshotStorageKey,
      recommendation: "snapshot دوره‌ای بساز.",
      canAutoFix: false,
    })];
  }
  return [];
}

export function detectStalePreventiveAlertStates(data: Record<string, unknown>, activeAlertKeys: string[] = []): MaintenanceIssue[] {
  const active = new Set(activeAlertKeys);
  return asRows<{ alertKey?: string }>(data["komak.workforce.preventiveAlertStates.v1"])
    .filter((state) => state.alertKey && activeAlertKeys.length > 0 && !active.has(state.alertKey))
    .map((state) => issue({
      type: "orphan_reference",
      severity: "info",
      title: "وضعیت هشدار قدیمی",
      description: `alertKey ${state.alertKey} دیگر هشدار فعالی ندارد.`,
      storageKey: "komak.workforce.preventiveAlertStates.v1",
      entityType: "PreventiveAlertState",
      entityId: state.alertKey,
      recommendation: "می‌توان این state قدیمی را حذف کرد.",
      canAutoFix: true,
      fixAction: "remove_stale_preventive_alert_state",
    }));
}

export function calculateMaintenanceHealthStatus(issues: MaintenanceIssue[]): MaintenanceHealthStatus {
  const critical = issues.filter((item) => item.severity === "critical").length;
  const warning = issues.filter((item) => item.severity === "warning").length;
  if (critical >= 3) return "critical";
  if (critical > 0) return "risky";
  if (warning > 0) return "needs_attention";
  return "healthy";
}

export function generateMaintenanceRecommendations(issues: MaintenanceIssue[]) {
  const recommendations = new Set<string>();
  for (const item of issues) recommendations.add(item.recommendation);
  if (!recommendations.size) recommendations.add("وضعیت داده‌ها خوب است؛ snapshot دوره‌ای را ادامه بده.");
  return [...recommendations].slice(0, 8);
}

export function buildMaintenanceReport(snapshot: MaintenanceStorageSnapshot, activeAlertKeys: string[] = []): MaintenanceReport {
  const storageStats = checkStorageKeys(snapshot);
  const data: Record<string, unknown> = {};
  for (const key of [...workforceBackupKeys, workforceSnapshotStorageKey]) {
    const parsed = parseJson(snapshot[key] ?? null);
    data[key] = parsed.ok ? parsed.value : null;
  }
  const missingIssues = storageStats
    .filter((item) => !item.exists && item.key !== workforceSnapshotStorageKey)
    .map((item) => issue({
      type: "missing_storage_key",
      severity: "warning",
      title: "کلید localStorage وجود ندارد",
      description: `${item.key} هنوز ساخته نشده است.`,
      storageKey: item.key,
      recommendation: "اگر داده لازم است، seed demo یا import بکاپ انجام بده.",
      canAutoFix: false,
    }));
  const schemaIssues = storageStats
    .filter((item) => item.exists && item.isValidJson && item.status === "warning" && requiredArrayKeys.has(item.key))
    .map((item) => issue({
      type: "schema_mismatch",
      severity: "warning",
      title: "ساختار داده نامنتظر است",
      description: `${item.key} ساختار array مورد انتظار را ندارد.`,
      storageKey: item.key,
      recommendation: "قبل از اصلاح، بکاپ بگیر و فایل را بررسی کن.",
      canAutoFix: false,
    }));
  const issues = [
    ...missingIssues,
    ...schemaIssues,
    ...detectInvalidJson(snapshot),
    ...detectDuplicateIds(data),
    ...detectEmptyRequiredCollections(data),
    ...detectOrphanReferences(data),
    ...detectInactiveReferences(data),
    ...detectStalePreventiveAlertStates(data, activeAlertKeys),
    ...detectOversizedStorage(storageStats),
    ...detectBackupAndSnapshotHealth(data),
  ];
  const criticalCount = issues.filter((item) => item.severity === "critical").length;
  const warningCount = issues.filter((item) => item.severity === "warning").length;
  const infoCount = issues.filter((item) => item.severity === "info").length;
  const healthStatus = calculateMaintenanceHealthStatus(issues);
  return {
    id: createId("maintenance-report"),
    generatedAt: nowIso(),
    healthStatus,
    totalIssues: issues.length,
    criticalCount,
    warningCount,
    infoCount,
    storageStats,
    issues,
    recommendations: generateMaintenanceRecommendations(issues),
    snapshotRecommendation: issues.some((item) => item.type === "no_backup" || item.type === "stale_snapshot") ? "snapshot تازه بساز." : "snapshot فعلی قابل قبول است.",
    summary: healthStatus === "healthy" ? "داده‌ها سالم هستند." : `${criticalCount} خطای بحرانی و ${warningCount} هشدار نیازمند توجه است.`,
  };
}
