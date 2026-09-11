import { calculateOperationalHistorySummary } from "../analysis/operationalHistoryAnalytics";
import type {
  BaselineDriftReport,
  LaunchSignoffReport,
  OperationalHistoryEvent,
  OperationalHistoryEventType,
  OperationalHistorySeverity,
  OperationalResignoffReport,
} from "../models/workforce";
import { createId, nowIso } from "../models/workforce";

export const operationalHistoryStorageKey = "komak.workforce.operationalHistory.v1";
export const operationalHistoryVersion = "1.0.0";

export interface OperationalHistoryFilters {
  type?: OperationalHistoryEventType | "all";
  severity?: OperationalHistorySeverity | "all";
  dateFrom?: string;
  dateTo?: string;
}

let memoryEvents: OperationalHistoryEvent[] = [];
const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

function readEvents() {
  if (typeof localStorage === "undefined") return clone(memoryEvents);
  try {
    const parsed = JSON.parse(localStorage.getItem(operationalHistoryStorageKey) ?? "[]");
    return Array.isArray(parsed) ? parsed as OperationalHistoryEvent[] : [];
  } catch {
    localStorage.setItem(operationalHistoryStorageKey, "[]");
    return [];
  }
}

function writeEvents(events: OperationalHistoryEvent[]) {
  if (typeof localStorage === "undefined") memoryEvents = clone(events);
  else localStorage.setItem(operationalHistoryStorageKey, JSON.stringify(events));
}

function hasEvent(type: OperationalHistoryEventType, relatedId: string) {
  return readEvents().some((event) => event.type === type && event.relatedId === relatedId);
}

export const operationalHistoryService = {
  addEvent(draft: Omit<OperationalHistoryEvent, "id" | "createdAt"> & Partial<Pick<OperationalHistoryEvent, "id" | "createdAt">>) {
    const event: OperationalHistoryEvent = {
      ...clone(draft),
      id: draft.id ?? createId("history-event"),
      createdAt: draft.createdAt ?? nowIso(),
    };
    writeEvents([event, ...readEvents()].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)));
    return clone(event);
  },

  listEvents() {
    return readEvents().sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
  },

  filterEvents(filters: OperationalHistoryFilters) {
    return this.listEvents().filter((event) => {
      if (filters.type && filters.type !== "all" && event.type !== filters.type) return false;
      if (filters.severity && filters.severity !== "all" && event.severity !== filters.severity) return false;
      if (filters.dateFrom && event.occurredAt < filters.dateFrom) return false;
      if (filters.dateTo && event.occurredAt > filters.dateTo) return false;
      return true;
    });
  },

  buildOperationalHistoryReport() {
    return calculateOperationalHistorySummary(this.listEvents());
  },

  recordDriftReport(report: BaselineDriftReport) {
    const duplicate = this.listEvents().find((event) => event.type === "drift_report" && event.metadata.baselineChecksum === report.baselineChecksum && event.metadata.currentChecksum === report.currentChecksum);
    if (duplicate) return duplicate;
    return this.addEvent({
      type: "drift_report",
      title: `Drift ${report.driftLevel}`,
      description: report.summary,
      occurredAt: report.generatedAt,
      actorName: "سیستم محلی",
      severity: report.driftLevel === "none" ? "info" : report.driftLevel,
      relatedId: report.id,
      relatedPath: "/organization/workforce-dashboard/baseline-drift",
      checksum: report.currentChecksum,
      metadata: {
        generatedAt: report.generatedAt,
        driftScore: report.driftScore,
        driftLevel: report.driftLevel,
        requiresResignoff: report.requiresResignoff,
        baselineChecksum: report.baselineChecksum,
        currentChecksum: report.currentChecksum,
        changes: report.changes.map((change) => ({ title: change.title, type: change.type, severity: change.severity, requiresResignoff: change.requiresResignoff })),
      },
    });
  },

  recordResignoff(report: OperationalResignoffReport) {
    const type = report.status === "revoked" ? "resignoff_revoked" : "resignoff_signed";
    if (hasEvent(type, report.id)) return this.listEvents().find((event) => event.type === type && event.relatedId === report.id);
    const event = this.addEvent({
      type,
      title: report.status === "revoked" ? "بازتأیید لغو شد" : "بازتأیید عملیاتی ثبت شد",
      description: report.managerNote,
      occurredAt: report.signedAt ?? report.updatedAt,
      actorName: report.signedBy || "مدیر",
      severity: report.status === "revoked" ? "high" : "medium",
      relatedId: report.id,
      relatedPath: "/organization/workforce-dashboard/baseline-drift",
      checksum: report.newBaselineChecksum,
      metadata: { acceptedChanges: clone(report.acceptedChanges), status: report.status },
    });
    if (report.status === "signed" && !hasEvent("baseline_changed", report.id)) {
      this.addEvent({ type: "baseline_changed", title: "Baseline عملیاتی تغییر کرد", description: "مرجع drift با بازتأیید جدید جایگزین شد.", occurredAt: report.signedAt ?? report.updatedAt, actorName: report.signedBy, severity: "medium", relatedId: report.id, relatedPath: "/organization/workforce-dashboard/baseline-drift", checksum: report.newBaselineChecksum, metadata: { source: "operational_resignoff" } });
    }
    return event;
  },

  recordLaunchSignoff(report: LaunchSignoffReport) {
    if (report.status !== "signed" || hasEvent("launch_signoff_signed", report.id)) return undefined;
    const event = this.addEvent({ type: "launch_signoff_signed", title: "راه‌اندازی نهایی تأیید شد", description: report.managerNote || "Baseline اولیه ثبت شد.", occurredAt: report.signedAt ?? report.updatedAt, actorName: report.signedBy, severity: report.acceptedRisk ? "high" : "medium", relatedId: report.id, relatedPath: "/organization/workforce-dashboard/launch-signoff", checksum: report.baselineChecksum, metadata: { readinessScore: report.readinessScore, acceptedRisk: report.acceptedRisk } });
    if (!hasEvent("baseline_changed", report.id)) this.addEvent({ type: "baseline_changed", title: "Baseline اولیه ساخته شد", description: "مرجع اولیه پایش تغییرات ثبت شد.", occurredAt: report.signedAt ?? report.updatedAt, actorName: report.signedBy, severity: "medium", relatedId: report.id, relatedPath: "/organization/workforce-dashboard/launch-signoff", checksum: report.baselineChecksum, metadata: { source: "launch_signoff" } });
    return event;
  },

  recordSnapshotEvent(relatedId: string, title: string, reason: string, actorName = "مدیر") {
    if (hasEvent("snapshot_created", relatedId)) return undefined;
    return this.addEvent({ type: "snapshot_created", title, description: reason, occurredAt: nowIso(), actorName, severity: "low", relatedId, relatedPath: "/organization/workforce-dashboard/data-center", checksum: "", metadata: { reason } });
  },

  recordBackupEvent(relatedId: string, title: string, checksum: string) {
    if (hasEvent("backup_created", relatedId)) return undefined;
    return this.addEvent({ type: "backup_created", title, description: "خروجی پشتیبان ساخته شد.", occurredAt: nowIso(), actorName: "مدیر", severity: "low", relatedId, relatedPath: "/organization/workforce-dashboard/data-center", checksum, metadata: {} });
  },

  recordMaintenanceFix(relatedId: string, title: string) {
    return this.addEvent({ type: "maintenance_fix", title, description: "اصلاح امن نگهداری اجرا شد.", occurredAt: nowIso(), actorName: "مدیر", severity: "medium", relatedId, relatedPath: "/organization/workforce-dashboard/maintenance", checksum: "", metadata: {} });
  },

  recordDecisionBatchApplied(relatedId: string, description: string) {
    return this.addEvent({ type: "decision_batch_applied", title: "بسته تصمیم اعمال شد", description, occurredAt: nowIso(), actorName: "مدیر", severity: "medium", relatedId, relatedPath: "/organization/workforce-dashboard/decision-report", checksum: "", metadata: {} });
  },

  recordImportRestore(relatedId: string, description: string) {
    return this.addEvent({ type: "import_restored", title: "داده‌ها بازیابی شدند", description, occurredAt: nowIso(), actorName: "مدیر", severity: "high", relatedId, relatedPath: "/organization/workforce-dashboard/data-center", checksum: "", metadata: {} });
  },

  exportHistoryJson() {
    const report = this.buildOperationalHistoryReport();
    const payload = { version: operationalHistoryVersion, generatedAt: report.generatedAt, summary: report.summary, report };
    const content = JSON.stringify(payload, null, 2);
    const stamp = new Date(report.generatedAt).toISOString().slice(0, 16).replace("T", "-").replace(":", "-");
    const fileName = `workforce-operational-history-${stamp}.json`;
    if (typeof document !== "undefined") {
      const blob = new Blob([content], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a"); link.href = url; link.download = fileName; link.click(); URL.revokeObjectURL(url);
    }
    return { fileName, content, payload };
  },

  clearHistory() {
    writeEvents([]);
  },

  removeEventsByIds(ids: string[]) {
    const idSet = new Set(ids);
    const before = readEvents();
    const next = before.filter((event) => !idSet.has(event.id));
    writeEvents(next);
    return before.length - next.length;
  },

  __memory: { clear() { memoryEvents = []; } },
};
