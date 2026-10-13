import { buildMaintenanceReport, type MaintenanceStorageSnapshot } from "../analysis/workforceMaintenanceAnalyzer";
import type { MaintenanceIssue, MaintenanceReport } from "../models/workforce";
import { workforceBackupKeys, workforceBackupService, workforceSnapshotStorageKey } from "./workforceBackupService";

export const maintenanceReportsStorageKey = "komak.workforce.maintenanceReports.v1";

let memoryMaintenance = new Map<string, string>();

function getStorage(key: string) {
  if (typeof localStorage !== "undefined") return localStorage.getItem(key);
  return memoryMaintenance.get(key) ?? null;
}

function setStorage(key: string, value: string) {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(key, value);
    return;
  }
  memoryMaintenance.set(key, value);
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = getStorage(key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  setStorage(key, JSON.stringify(value));
}

export function readMaintenanceStorageSnapshot(): MaintenanceStorageSnapshot {
  return [...workforceBackupKeys, workforceSnapshotStorageKey].reduce((snapshot, key) => {
    snapshot[key] = getStorage(key);
    return snapshot;
  }, {} as MaintenanceStorageSnapshot);
}

function saveMaintenanceReport(report: MaintenanceReport) {
  const reports = readJson<MaintenanceReport[]>(maintenanceReportsStorageKey, []);
  writeJson(maintenanceReportsStorageKey, [report, ...reports].slice(0, 20));
}

function removeStalePreventiveAlertState(issue: MaintenanceIssue) {
  const states = readJson<Array<{ alertKey?: string }>>("komak.workforce.preventiveAlertStates.v1", []);
  writeJson("komak.workforce.preventiveAlertStates.v1", states.filter((state) => state.alertKey !== issue.entityId));
}

function deactivateOrphanScheduleItem(issue: MaintenanceIssue) {
  const rows = readJson<Array<{ id?: string; isActive?: boolean }>>("komak.workforce.scheduleItems.v1", []);
  writeJson("komak.workforce.scheduleItems.v1", rows.map((row) => row.id === issue.entityId ? { ...row, isActive: false } : row));
}

export const workforceMaintenanceService = {
  runReport(activeAlertKeys: string[] = []) {
    const report = buildMaintenanceReport(readMaintenanceStorageSnapshot(), activeAlertKeys);
    saveMaintenanceReport(report);
    return report;
  },

  listReports() {
    return readJson<MaintenanceReport[]>(maintenanceReportsStorageKey, []);
  },

  runSafeFix(issue: MaintenanceIssue) {
    if (!issue.canAutoFix || !issue.fixAction) return false;
    workforceBackupService.createAutoSnapshotBeforeChange(`before-maintenance-fix-${issue.fixAction}`);
    if (issue.fixAction === "remove_stale_preventive_alert_state") {
      removeStalePreventiveAlertState(issue);
      return true;
    }
    if (issue.fixAction === "deactivate_orphan_schedule_item") {
      deactivateOrphanScheduleItem(issue);
      return true;
    }
    return false;
  },

  runAllSafeFixes(report: MaintenanceReport) {
    return report.issues.filter((issue) => issue.canAutoFix).map((issue) => this.runSafeFix(issue)).filter(Boolean).length;
  },

  createSnapshot() {
    return workforceBackupService.createSnapshot("Snapshot نگهداری", "maintenance", "ساخته شده از کنسول نگهداری", false);
  },

  __memory: {
    clear() {
      memoryMaintenance = new Map<string, string>();
      workforceBackupService.__memory.clear();
    },
    set(key: string, value: unknown) {
      const serialized = typeof value === "string" ? value : JSON.stringify(value);
      setStorage(key, serialized);
      try {
        workforceBackupService.__memory.set(key, typeof value === "string" ? JSON.parse(value) : value);
      } catch {
        // Invalid JSON is intentionally allowed in maintenance tests.
      }
    },
    get(key: string) {
      return readJson<unknown>(key, null);
    },
  },
};
