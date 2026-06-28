import { createId, nowIso } from "../models/workforce";
import type {
  BackupCoverageKeyStatus,
  BackupCoverageReport,
  BackupValidationResult,
  WorkforceBackupBundle,
  WorkforceBackupMetadata,
  WorkforceSnapshot,
} from "../models/workforce";
import {
  workforceBackupStorageKeys,
  workforceImportStorageKeys,
  workforceSnapshotDataKeys,
  workforceStorageKeyRegistry,
  type WorkforceStorageKeyRegistryItem,
} from "../registry/workforceStorageKeys";

export const workforceSnapshotStorageKey = "komak.workforce.snapshots.v1";
export const workforceBackupVersion = "1.0.0";
export const workforceBackupAppName = "komak-workforce-dashboard";
export const workforceBackupCoverageVersion = "2026-06-p25-coverage-v1";

export const workforceBackupKeys = [...workforceBackupStorageKeys] as readonly string[];
export const workforceSnapshotKeys = [...workforceSnapshotDataKeys] as readonly string[];
export const workforceImportKeys = [...workforceImportStorageKeys] as readonly string[];

let memoryStorage = new Map<string, string>();

function storageGet(key: string) {
  if (typeof localStorage !== "undefined") return localStorage.getItem(key);
  return memoryStorage.get(key) ?? null;
}

function storageSet(key: string, value: string) {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(key, value);
    return;
  }
  memoryStorage.set(key, value);
}

function storageRemove(key: string) {
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem(key);
    return;
  }
  memoryStorage.delete(key);
}

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

function safeParse(raw: string | null) {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return raw;
  }
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value as Record<string, unknown>).sort().map((key) => `${JSON.stringify(key)}:${stableStringify((value as Record<string, unknown>)[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

export function calculateBackupChecksum(data: unknown) {
  const input = stableStringify(data);
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

function asArray(value: unknown) {
  return Array.isArray(value) ? value : [];
}

function readDataForKeys(keys: readonly string[]): Record<string, unknown> {
  return keys.reduce((data, key) => {
    data[key] = safeParse(storageGet(key));
    return data;
  }, {} as Record<string, unknown>);
}

function readBackupData(): Record<string, unknown> {
  return readDataForKeys(workforceBackupKeys);
}

export function getBackupCoverageMetadata() {
  const includedKeys = [...workforceBackupKeys];
  const excludedKeys = workforceStorageKeyRegistry.filter((item) => !item.includeInBackup).map((item) => item.key);
  return {
    coverageVersion: workforceBackupCoverageVersion,
    knownKeyCount: workforceStorageKeyRegistry.length,
    includedKeyCount: includedKeys.length,
    excludedKeyCount: excludedKeys.length,
    includedKeys,
    excludedKeys,
  };
}

export function getWorkforceDataStats(data = readBackupData()): WorkforceBackupMetadata {
  return {
    spacesCount: asArray(data["komak.workforce.spaces.v1"]).length,
    employeesCount: asArray(data["komak.workforce.employees.v1"]).length,
    taskTypesCount: asArray(data["komak.workforce.taskTypes.v1"]).length,
    scheduleItemsCount: asArray(data["komak.workforce.scheduleItems.v1"]).length,
    rulesCount: asArray(data["komak.workforce.rules.v1"]).length,
    reportsCount: asArray(data["komak.workforce.decisionReports.v1"]).length,
    goalsCount: asArray(data["komak.workforce.monthlyGoals.v1"]).length,
    snapshotCount: listSnapshots().length,
    exportedBy: "local-user",
    note: "",
    ...getBackupCoverageMetadata(),
  };
}

export function createBackupBundle(note = "", source = "manual"): WorkforceBackupBundle {
  const keys = source === "snapshot" || source === "auto-snapshot" ? workforceSnapshotKeys : workforceBackupKeys;
  const data = readDataForKeys(keys);
  const metadata = { ...getWorkforceDataStats(data), note };
  const unsigned = {
    id: createId("backup"),
    version: workforceBackupVersion,
    appName: workforceBackupAppName,
    generatedAt: nowIso(),
    source,
    data,
    metadata,
  };
  return {
    ...unsigned,
    checksum: calculateBackupChecksum(unsigned.data),
  };
}

function toCoverageKeyStatus(item: WorkforceStorageKeyRegistryItem, reason: string): BackupCoverageKeyStatus {
  return {
    key: item.key,
    title: item.title,
    isCritical: item.isCritical,
    reason,
  };
}

function bundleDataFrom(input?: WorkforceBackupBundle | Record<string, unknown>) {
  if (!input) return undefined;
  if ("data" in input && input.data && typeof input.data === "object") return input.data as Record<string, unknown>;
  return input as Record<string, unknown>;
}

export function buildBackupCoverageReport(
  input?: WorkforceBackupBundle | Record<string, unknown>,
  registry: readonly WorkforceStorageKeyRegistryItem[] = workforceStorageKeyRegistry,
  configuredBackupKeys: readonly string[] = workforceBackupKeys,
): BackupCoverageReport {
  const data = bundleDataFrom(input);
  const availableKeys = new Set(data ? Object.keys(data) : configuredBackupKeys);
  const expected = registry.filter((item) => item.includeInBackup);
  const coveredKeys = expected
    .filter((item) => availableKeys.has(item.key))
    .map((item) => toCoverageKeyStatus(item, "در backup پوشش داده شده است."));
  const missingKeys = expected
    .filter((item) => !availableKeys.has(item.key))
    .map((item) => toCoverageKeyStatus(item, item.isCritical ? "کلید حیاتی از backup جا مانده است." : "کلید غیرحیاتی از backup جا مانده است."));
  const knownKeySet = new Set(registry.map((item) => item.key));
  const extraKeysInBundle = data ? Object.keys(data).filter((key) => !knownKeySet.has(key)).sort() : [];
  const criticalMissingCount = missingKeys.filter((item) => item.isCritical).length;
  const warnings = [
    ...missingKeys.map((item) => `${item.key}: ${item.reason}`),
    ...extraKeysInBundle.map((key) => `${key}: کلید ناشناخته در bundle دیده شد و هنگام import نادیده گرفته می‌شود.`),
  ];
  return {
    generatedAt: nowIso(),
    totalKnownKeys: registry.length,
    includedInBackupCount: coveredKeys.length,
    missingFromBackupCount: missingKeys.length,
    criticalMissingCount,
    coveredKeys,
    missingKeys,
    extraKeysInBundle,
    warnings,
    status: criticalMissingCount > 0 ? "risky" : missingKeys.length > 0 ? "needs_attention" : "complete",
  };
}

export function validateBackupBundle(input: unknown): BackupValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const bundle = input && typeof input === "object" ? input as Partial<WorkforceBackupBundle> : {};

  if (!input || typeof input !== "object") errors.push("فایل ساختار JSON معتبر ندارد.");
  if (bundle.version !== workforceBackupVersion) warnings.push("نسخه فایل با نسخه فعلی متفاوت است.");
  if (bundle.appName !== workforceBackupAppName) errors.push("این فایل متعلق به داشبورد workforce نیست.");
  if (!bundle.data || typeof bundle.data !== "object") errors.push("بخش data در فایل وجود ندارد.");

  const data = (bundle.data ?? {}) as Record<string, unknown>;
  const coverage = buildBackupCoverageReport(data);
  warnings.push(...coverage.warnings);
  if (coverage.criticalMissingCount > 0) {
    errors.push("فایل backup همه کلیدهای حیاتی لازم برای import امن را ندارد.");
  }

  if (bundle.checksum && bundle.data) {
    const expected = calculateBackupChecksum(bundle.data);
    if (expected !== bundle.checksum) errors.push("checksum فایل با داده‌ها هم‌خوان نیست.");
  }

  return {
    isValid: errors.length === 0,
    version: String(bundle.version ?? ""),
    errors,
    warnings,
    counts: getWorkforceDataStats(data),
    canImport: errors.length === 0,
  };
}

export function isLegacyBackupCoverageBaseline(bundle?: Partial<WorkforceBackupBundle> | null, data?: Record<string, unknown>) {
  const metadata = bundle?.metadata;
  if (!metadata?.coverageVersion) return true;
  if (!metadata.includedKeys || !Array.isArray(metadata.includedKeys)) return true;
  if ((metadata.knownKeyCount ?? 0) < workforceStorageKeyRegistry.length) return true;
  if ((metadata.includedKeyCount ?? 0) < workforceBackupKeys.length) return true;
  const baselineKeys = data ? Object.keys(data) : Object.keys(bundle?.data ?? {});
  return workforceBackupKeys.some((key) => !metadata.includedKeys?.includes(key) && !baselineKeys.includes(key));
}

export function getComparableBackupKeys(baselineData: Record<string, unknown>, currentData: Record<string, unknown>) {
  return workforceBackupKeys.filter((key) => key in baselineData && key in currentData);
}

export function calculateComparableChecksum(baselineData: Record<string, unknown>, currentData: Record<string, unknown>) {
  const comparableKeys = getComparableBackupKeys(baselineData, currentData);
  const pick = (data: Record<string, unknown>) => comparableKeys.reduce((selected, key) => {
    selected[key] = data[key];
    return selected;
  }, {} as Record<string, unknown>);
  return {
    comparableKeys,
    nonComparableKeys: workforceBackupKeys.filter((key) => !comparableKeys.includes(key)),
    baselineChecksum: calculateBackupChecksum(pick(baselineData)),
    currentChecksum: calculateBackupChecksum(pick(currentData)),
  };
}

function readSnapshots(includeInvalid = false): WorkforceSnapshot[] {
  const parsed = safeParse(storageGet(workforceSnapshotStorageKey));
  const rows = Array.isArray(parsed) ? parsed as WorkforceSnapshot[] : [];
  return includeInvalid ? clone(rows) : clone(rows).filter((snapshot) => snapshot.bundle?.data);
}

function writeSnapshots(snapshots: WorkforceSnapshot[]) {
  storageSet(workforceSnapshotStorageKey, JSON.stringify(snapshots));
}

export function listSnapshots() {
  return readSnapshots().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function createSnapshot(title = "Snapshot دستی", reason = "manual", note = "", isAuto = false): WorkforceSnapshot {
  const snapshot: WorkforceSnapshot = {
    id: createId("snapshot"),
    title,
    createdAt: nowIso(),
    reason,
    bundle: createBackupBundle(note, isAuto ? "auto-snapshot" : "snapshot"),
    isAuto,
    note,
  };
  writeSnapshots([snapshot, ...readSnapshots(true)]);
  return snapshot;
}

export function createAutoSnapshotBeforeChange(reason: string) {
  return createSnapshot("Snapshot خودکار", reason, "قبل از عملیات مهم ساخته شد.", true);
}

function writeBackupData(data: Record<string, unknown>) {
  for (const key of workforceImportKeys) {
    if (key in data) {
      storageSet(key, JSON.stringify(data[key]));
    }
  }
}

export function importBackupBundle(bundle: WorkforceBackupBundle, mode: "replace" | "validate-only" = "replace") {
  const validation = validateBackupBundle(bundle);
  if (!validation.canImport) return { validation, imported: false, snapshot: undefined as WorkforceSnapshot | undefined };
  if (mode === "validate-only") return { validation, imported: false, snapshot: undefined as WorkforceSnapshot | undefined };
  const snapshot = createAutoSnapshotBeforeChange("before-import-backup");
  writeBackupData(bundle.data);
  return { validation, imported: true, snapshot };
}

export function restoreSnapshot(snapshotId: string) {
  const snapshot = readSnapshots(true).find((item) => item.id === snapshotId);
  if (!snapshot) return undefined;
  createAutoSnapshotBeforeChange("before-restore-snapshot");
  writeBackupData(snapshot.bundle.data);
  return snapshot;
}

export function deleteSnapshot(snapshotId: string) {
  const snapshots = readSnapshots(true).filter((snapshot) => snapshot.id !== snapshotId);
  writeSnapshots(snapshots);
  return snapshots;
}

export function downloadBackupFile(bundle = createBackupBundle()) {
  const stamp = new Date(bundle.generatedAt).toISOString().slice(0, 16).replace("T", "-").replace(":", "-");
  const fileName = `workforce-dashboard-backup-${stamp}.json`;
  const content = JSON.stringify(bundle, null, 2);
  if (typeof document !== "undefined") {
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  }
  return { fileName, content };
}

export const workforceBackupService = {
  createBackupBundle,
  downloadBackupFile,
  validateBackupBundle,
  importBackupBundle,
  createSnapshot,
  listSnapshots,
  restoreSnapshot,
  deleteSnapshot,
  createAutoSnapshotBeforeChange,
  calculateBackupChecksum,
  calculateComparableChecksum,
  buildBackupCoverageReport,
  getBackupCoverageMetadata,
  getWorkforceDataStats,
  isLegacyBackupCoverageBaseline,
  __memory: {
    clear() {
      memoryStorage = new Map<string, string>();
    },
    set(key: string, value: unknown) {
      storageSet(key, JSON.stringify(value));
    },
    get(key: string) {
      return safeParse(storageGet(key));
    },
    remove(key: string) {
      storageRemove(key);
    },
  },
};
