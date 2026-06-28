import type { BaselineDriftReport, OperationalResignoffReport } from "../models/workforce";
import { createId, nowIso } from "../models/workforce";
import { workforceBackupService } from "./workforceBackupService";
import { operationalHistoryService } from "./operationalHistoryService";

export const operationalResignoffsStorageKey = "komak.workforce.operationalResignoffs.v1";

let memoryReports: OperationalResignoffReport[] = [];
const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

function readReports(): OperationalResignoffReport[] {
  if (typeof localStorage === "undefined") return clone(memoryReports);
  try {
    const parsed = JSON.parse(localStorage.getItem(operationalResignoffsStorageKey) ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    localStorage.setItem(operationalResignoffsStorageKey, "[]");
    return [];
  }
}

function writeReports(reports: OperationalResignoffReport[]) {
  if (typeof localStorage === "undefined") memoryReports = clone(reports);
  else localStorage.setItem(operationalResignoffsStorageKey, JSON.stringify(reports));
}

function upsert(report: OperationalResignoffReport) {
  writeReports([report, ...readReports().filter((item) => item.id !== report.id)].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
  return clone(report);
}

export const operationalResignoffService = {
  buildDraft(drift: BaselineDriftReport): OperationalResignoffReport {
    const timestamp = nowIso();
    return {
      id: createId("operational-resignoff"),
      generatedAt: timestamp,
      baselineSignoffId: drift.baselineSignoffId,
      driftReportId: drift.id,
      status: "draft",
      signedBy: "",
      managerNote: "",
      acceptedChanges: drift.changes.filter((item) => item.requiresReview || item.requiresResignoff).map((item) => item.title),
      newBaselineChecksum: "",
      createdAt: timestamp,
      updatedAt: timestamp,
    };
  },

  createDraft(drift: BaselineDriftReport) {
    return upsert(this.buildDraft(drift));
  },

  list() {
    return readReports().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },

  latest() {
    return this.list()[0];
  },

  latestSigned() {
    return this.list().find((item) => item.status === "signed");
  },

  saveManagerNote(id: string, managerNote: string) {
    const current = readReports().find((item) => item.id === id);
    if (!current) return undefined;
    return upsert({ ...current, managerNote: managerNote.trim(), updatedAt: nowIso() });
  },

  sign(drift: BaselineDriftReport, signedBy: string, managerNote: string, signedAt = nowIso()) {
    const signer = signedBy.trim();
    const note = managerNote.trim();
    if (!signer) throw new Error("نام تأییدکننده الزامی است.");
    if (!note) throw new Error("یادداشت بازتأیید الزامی است.");
    const snapshot = workforceBackupService.createSnapshot("Baseline بازتأیید عملیاتی", "operational_resignoff_baseline", note, false);
    const bundle = workforceBackupService.createBackupBundle("Operational resignoff baseline", "operational-resignoff-baseline");
    const draft = this.buildDraft(drift);
    const report = upsert({
      ...draft,
      status: "signed",
      signedBy: signer,
      signedAt,
      managerNote: note,
      newBaselineSnapshotId: snapshot.id,
      newBaselineChecksum: bundle.checksum,
      newBaselineCoverageVersion: bundle.metadata.coverageVersion,
      newBaselineBundle: bundle,
      updatedAt: nowIso(),
    });
    operationalHistoryService.recordDriftReport(drift);
    operationalHistoryService.recordResignoff(report);
    operationalHistoryService.recordSnapshotEvent(snapshot.id, snapshot.title, snapshot.reason, signer);
    operationalHistoryService.recordBackupEvent(bundle.id, "Backup baseline بازتأیید", bundle.checksum);
    return report;
  },

  revoke(id: string, managerNote: string) {
    const note = managerNote.trim();
    if (!note) throw new Error("دلیل لغو بازتأیید الزامی است.");
    const current = readReports().find((item) => item.id === id);
    if (!current) return undefined;
    const report = upsert({ ...current, status: "revoked", managerNote: note, updatedAt: nowIso() });
    operationalHistoryService.recordResignoff(report);
    return report;
  },

  __memory: {
    clear() {
      memoryReports = [];
    },
  },
};
