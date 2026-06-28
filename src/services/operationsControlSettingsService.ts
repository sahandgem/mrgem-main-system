import type {
  OperationalControlExportOptions,
  OperationalControlPriority,
  OperationalControlSchedulePolicy,
  OperationalControlType,
  OperationalNotificationPreference,
} from "../models/workforce";
import { nowIso } from "../models/workforce";

export const operationsControlSchedulePolicyKey = "komak.workforce.operationsControlSchedulePolicy.v1";
export const operationsControlExportOptionsKey = "komak.workforce.operationsControlExportOptions.v1";
export const operationalNotificationPreferencesKey = "komak.workforce.operationalNotificationPreferences.v1";

export const operationalControlTypes: OperationalControlType[] = [
  "snapshot_due", "backup_due", "archive_due", "maintenance_review", "drift_review",
  "resignoff_due", "readiness_review", "monthly_health_review",
  "preventive_alert_review", "launch_checklist_review",
];

const priorityValues: OperationalControlPriority[] = ["low", "medium", "high", "urgent"];
const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
let memoryPolicy: OperationalControlSchedulePolicy | undefined;
let memoryExportOptions: OperationalControlExportOptions | undefined;
let memoryPreference: OperationalNotificationPreference | undefined;

export function getDefaultSchedulePolicy(): OperationalControlSchedulePolicy {
  const timestamp = nowIso();
  return {
    id: "operations-control-schedule-policy-default",
    snapshotEveryDays: 7,
    backupEveryDays: 14,
    archiveEveryDays: 60,
    maintenanceReviewEveryDays: 7,
    driftReviewEveryDays: 7,
    resignoffExpiresAfterDays: 90,
    readinessReviewEveryDays: 30,
    monthlyHealthReviewEveryDays: 30,
    preventiveAlertReviewEveryDays: 7,
    launchChecklistReviewEveryDays: 14,
    enabledControlTypes: [...operationalControlTypes],
    defaultPriorities: Object.fromEntries(operationalControlTypes.map((type) => [type, "medium"])) as Record<OperationalControlType, OperationalControlPriority>,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function getDefaultExportOptions(): OperationalControlExportOptions {
  const timestamp = nowIso();
  return { id: "operations-control-export-default", includeCompleted: false, includeDismissed: false, includeSnoozed: true, includeOverdue: true, includeUpcomingDays: 30, includeRelatedPath: true, includeManagerNote: false, createdAt: timestamp, updatedAt: timestamp };
}

export function getDefaultNotificationPreference(): OperationalNotificationPreference {
  const timestamp = nowIso();
  return { id: "operations-notification-preference-default", enabled: true, channel: "in_app", controlTypes: [...operationalControlTypes], minimumPriority: "medium", daysBeforeDue: 0, createdAt: timestamp, updatedAt: timestamp };
}

const numberFields: Array<keyof Pick<OperationalControlSchedulePolicy,
  "snapshotEveryDays" | "backupEveryDays" | "archiveEveryDays" | "maintenanceReviewEveryDays" |
  "driftReviewEveryDays" | "resignoffExpiresAfterDays" | "readinessReviewEveryDays" |
  "monthlyHealthReviewEveryDays" | "preventiveAlertReviewEveryDays" | "launchChecklistReviewEveryDays">> = [
  "snapshotEveryDays", "backupEveryDays", "archiveEveryDays", "maintenanceReviewEveryDays",
  "driftReviewEveryDays", "resignoffExpiresAfterDays", "readinessReviewEveryDays",
  "monthlyHealthReviewEveryDays", "preventiveAlertReviewEveryDays", "launchChecklistReviewEveryDays",
];

export function validatePolicy(input: Partial<OperationalControlSchedulePolicy>) {
  const defaults = getDefaultSchedulePolicy();
  const warnings: string[] = [];
  const policy = { ...defaults, ...input, defaultPriorities: { ...defaults.defaultPriorities, ...input.defaultPriorities } };
  numberFields.forEach((field) => {
    const value = Number(policy[field]);
    if (!Number.isFinite(value) || value < 1) warnings.push(`${field} به حداقل یک روز اصلاح شد.`);
    policy[field] = Math.min(3650, Math.max(1, Math.round(Number.isFinite(value) ? value : defaults[field])));
  });
  policy.enabledControlTypes = operationalControlTypes.filter((type) => input.enabledControlTypes?.includes(type) ?? defaults.enabledControlTypes.includes(type));
  policy.defaultPriorities = Object.fromEntries(operationalControlTypes.map((type) => [type, priorityValues.includes(policy.defaultPriorities[type]) ? policy.defaultPriorities[type] : defaults.defaultPriorities[type]])) as Record<OperationalControlType, OperationalControlPriority>;
  return { isValid: warnings.length === 0, warnings, policy };
}

function read<T>(key: string, memory: T | undefined, fallback: () => T): T {
  if (typeof localStorage === "undefined") return clone(memory ?? fallback());
  try { return clone(JSON.parse(localStorage.getItem(key) ?? "null") as T ?? fallback()); } catch { return fallback(); }
}

function write<T>(key: string, value: T) {
  if (typeof localStorage !== "undefined") localStorage.setItem(key, JSON.stringify(value));
}

export const operationsControlSettingsService = {
  getSchedulePolicy() {
    const stored = read(operationsControlSchedulePolicyKey, memoryPolicy, getDefaultSchedulePolicy);
    return validatePolicy(stored).policy;
  },
  updateSchedulePolicy(input: Partial<OperationalControlSchedulePolicy>) {
    const current = this.getSchedulePolicy();
    const policy = validatePolicy({ ...current, ...input, id: current.id, createdAt: current.createdAt, updatedAt: nowIso() }).policy;
    memoryPolicy = clone(policy); write(operationsControlSchedulePolicyKey, policy); return clone(policy);
  },
  resetSchedulePolicy() {
    const policy = getDefaultSchedulePolicy(); memoryPolicy = clone(policy); write(operationsControlSchedulePolicyKey, policy); return clone(policy);
  },
  getExportOptions() { return read(operationsControlExportOptionsKey, memoryExportOptions, getDefaultExportOptions); },
  updateExportOptions(input: Partial<OperationalControlExportOptions>) {
    const current = this.getExportOptions();
    const options = { ...current, ...clone(input), id: current.id, includeUpcomingDays: Math.min(3650, Math.max(0, Math.round(Number(input.includeUpcomingDays ?? current.includeUpcomingDays)))), createdAt: current.createdAt, updatedAt: nowIso() };
    memoryExportOptions = clone(options); write(operationsControlExportOptionsKey, options); return clone(options);
  },
  getNotificationPreferences() { return read(operationalNotificationPreferencesKey, memoryPreference, getDefaultNotificationPreference); },
  updateNotificationPreferences(input: Partial<OperationalNotificationPreference>) {
    const current = this.getNotificationPreferences();
    const preference = { ...current, ...clone(input), id: current.id, controlTypes: operationalControlTypes.filter((type) => input.controlTypes?.includes(type) ?? current.controlTypes.includes(type)), daysBeforeDue: Math.min(365, Math.max(0, Math.round(Number(input.daysBeforeDue ?? current.daysBeforeDue)))), createdAt: current.createdAt, updatedAt: nowIso() };
    memoryPreference = clone(preference); write(operationalNotificationPreferencesKey, preference); return clone(preference);
  },
  validatePolicy,
  getDefaultSchedulePolicy,
  __memory: { clear() { memoryPolicy = undefined; memoryExportOptions = undefined; memoryPreference = undefined; } },
};
