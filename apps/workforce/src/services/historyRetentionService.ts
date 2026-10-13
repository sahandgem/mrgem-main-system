import { buildHistoryRetentionReport, detectArchiveCandidates, getDefaultHistoryRetentionPolicy } from "../analysis/historyRetentionAnalyzer";
import type { HistoryRetentionPolicy, OperationalHistoryArchive } from "../models/workforce";
import { createId, nowIso, toPersianNumber } from "../models/workforce";
import { operationalHistoryService } from "./operationalHistoryService";
import { workforceBackupService } from "./workforceBackupService";

export const historyRetentionPolicyStorageKey = "komak.workforce.historyRetentionPolicy.v1";
export const historyArchivesStorageKey = "komak.workforce.historyArchives.v1";
export const historyArchiveVersion = "1.0.0";

let memoryPolicy: HistoryRetentionPolicy | undefined;
let memoryArchives: OperationalHistoryArchive[] = [];
const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

function readPolicy() {
  if (typeof localStorage === "undefined") return memoryPolicy ? clone(memoryPolicy) : undefined;
  try { return JSON.parse(localStorage.getItem(historyRetentionPolicyStorageKey) ?? "null") as HistoryRetentionPolicy | null ?? undefined; } catch { return undefined; }
}

function writePolicy(policy: HistoryRetentionPolicy) {
  if (typeof localStorage === "undefined") memoryPolicy = clone(policy);
  else localStorage.setItem(historyRetentionPolicyStorageKey, JSON.stringify(policy));
}

function readArchives() {
  if (typeof localStorage === "undefined") return clone(memoryArchives);
  try { const parsed = JSON.parse(localStorage.getItem(historyArchivesStorageKey) ?? "[]"); return Array.isArray(parsed) ? parsed as OperationalHistoryArchive[] : []; } catch { return []; }
}

function writeArchives(archives: OperationalHistoryArchive[]) {
  if (typeof localStorage === "undefined") memoryArchives = clone(archives);
  else localStorage.setItem(historyArchivesStorageKey, JSON.stringify(archives));
}

function normalizePolicy(policy: HistoryRetentionPolicy): HistoryRetentionPolicy {
  const positive = (value: number, fallback: number) => Number.isFinite(value) && value > 0 ? Math.round(value) : fallback;
  return {
    ...policy,
    keepRecentDays: positive(policy.keepRecentDays, 30),
    archiveAfterDays: positive(policy.archiveAfterDays, 60),
    criticalKeepDays: Math.max(positive(policy.criticalKeepDays, 180), positive(policy.archiveAfterDays, 60)),
    driftReviewAfterDays: positive(policy.driftReviewAfterDays, 14),
    resignoffExpiresAfterDays: positive(policy.resignoffExpiresAfterDays, 90),
    maxEventsBeforeWarning: positive(policy.maxEventsBeforeWarning, 500),
    updatedAt: nowIso(),
  };
}

export const historyRetentionService = {
  getPolicy() {
    const stored = readPolicy();
    if (stored) return stored;
    const policy = getDefaultHistoryRetentionPolicy();
    writePolicy(policy);
    return policy;
  },

  updatePolicy(changes: Partial<HistoryRetentionPolicy>) {
    const current = this.getPolicy();
    const policy = normalizePolicy({ ...current, ...changes, id: current.id, createdAt: current.createdAt });
    writePolicy(policy);
    return clone(policy);
  },

  resetPolicy() {
    const policy = getDefaultHistoryRetentionPolicy();
    writePolicy(policy);
    return policy;
  },

  listArchives() {
    return readArchives().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  getArchiveById(id: string) {
    return this.listArchives().find((archive) => archive.id === id);
  },

  buildRetentionReport(currentDriftLevel?: "none" | "low" | "medium" | "high" | "critical") {
    return buildHistoryRetentionReport({ events: operationalHistoryService.listEvents(), archives: this.listArchives(), snapshots: workforceBackupService.listSnapshots(), policy: this.getPolicy(), currentDriftLevel });
  },

  createHistoryArchive(note = "") {
    const events = operationalHistoryService.listEvents();
    const candidates = detectArchiveCandidates(events, this.getPolicy());
    if (!candidates.length) return undefined;
    const ordered = [...candidates].sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
    const timestamp = nowIso();
    const archive: OperationalHistoryArchive = {
      id: createId("history-archive"),
      title: `Archive تاریخچه ${toPersianNumber(new Date(timestamp).toLocaleDateString("fa-IR"))}`,
      createdAt: timestamp,
      fromDate: ordered[0].occurredAt,
      toDate: ordered[ordered.length - 1].occurredAt,
      eventCount: ordered.length,
      criticalEventCount: ordered.filter((event) => event.severity === "critical" || event.severity === "high").length,
      driftEventCount: ordered.filter((event) => event.type === "drift_report").length,
      resignoffCount: ordered.filter((event) => event.type === "resignoff_signed").length,
      checksum: workforceBackupService.calculateBackupChecksum(ordered),
      events: clone(ordered),
      summary: `${toPersianNumber(ordered.length)} رویداد تاریخچه بایگانی شد.`,
      note: note.trim(),
    };
    writeArchives([archive, ...readArchives()]);
    return clone(archive);
  },

  exportArchiveJson(id: string) {
    const archive = this.getArchiveById(id);
    if (!archive) return undefined;
    const payload = { version: historyArchiveVersion, generatedAt: nowIso(), archive };
    const content = JSON.stringify(payload, null, 2);
    const stamp = new Date(payload.generatedAt).toISOString().slice(0, 16).replace("T", "-").replace(":", "-");
    const fileName = `workforce-history-archive-${stamp}.json`;
    if (typeof document !== "undefined") {
      const blob = new Blob([content], { type: "application/json" }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = fileName; link.click(); URL.revokeObjectURL(url);
    }
    return { fileName, content, payload };
  },

  cleanupArchivedEvents(archiveId?: string) {
    const archives = archiveId ? this.listArchives().filter((archive) => archive.id === archiveId) : this.listArchives();
    const eventIds = Array.from(new Set(archives.flatMap((archive) => archive.events.map((event) => event.id))));
    if (!eventIds.length) return { removedCount: 0, snapshot: undefined };
    const snapshot = workforceBackupService.createSnapshot("Snapshot پیش از cleanup history", "before_history_cleanup", "قبل از حذف eventهای آرشیوشده ساخته شد.", false);
    const removedCount = operationalHistoryService.removeEventsByIds(eventIds);
    operationalHistoryService.recordSnapshotEvent(snapshot.id, snapshot.title, snapshot.reason);
    return { removedCount, snapshot };
  },

  deleteArchive(id: string) {
    const next = readArchives().filter((archive) => archive.id !== id);
    writeArchives(next);
    return next;
  },

  __memory: {
    clear() { memoryPolicy = undefined; memoryArchives = []; },
  },
};
