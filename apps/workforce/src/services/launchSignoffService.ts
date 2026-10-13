import { buildLaunchSignoffDraft, type LaunchSignoffContext } from "../analysis/launchSignoffBuilder";
import type { LaunchSignoffReport, LaunchSignoffStatus } from "../models/workforce";
import { nowIso } from "../models/workforce";
import { workforceBackupService } from "./workforceBackupService";
import { operationalHistoryService } from "./operationalHistoryService";

export const launchSignoffsStorageKey = "komak.workforce.launchSignoffs.v1";

export interface SignLaunchOptions {
  signedBy: string;
  signedAt?: string;
  managerNote: string;
  acceptRisk?: boolean;
}

let memoryReports: LaunchSignoffReport[] = [];
const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

function readReports(): LaunchSignoffReport[] {
  if (typeof localStorage === "undefined") return clone(memoryReports);
  const raw = localStorage.getItem(launchSignoffsStorageKey);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    localStorage.setItem(launchSignoffsStorageKey, "[]");
    return [];
  }
}

function writeReports(reports: LaunchSignoffReport[]) {
  if (typeof localStorage === "undefined") memoryReports = clone(reports);
  else localStorage.setItem(launchSignoffsStorageKey, JSON.stringify(reports));
}

function upsert(report: LaunchSignoffReport) {
  const existing = readReports();
  const next = [report, ...existing.filter((item) => item.id !== report.id)]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  writeReports(next);
  return clone(report);
}

function update(id: string, changes: Partial<LaunchSignoffReport>) {
  const current = readReports().find((item) => item.id === id);
  if (!current) return undefined;
  return upsert({ ...current, ...changes, id, updatedAt: nowIso() });
}

export const launchSignoffService = {
  buildDraft(context: LaunchSignoffContext) {
    return buildLaunchSignoffDraft(context);
  },

  createDraft(context: LaunchSignoffContext) {
    return upsert(buildLaunchSignoffDraft(context));
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

  updateManagerNote(id: string, managerNote: string) {
    return update(id, { managerNote: managerNote.trim() });
  },

  changeStatus(id: string, status: LaunchSignoffStatus) {
    return update(id, { status });
  },

  sign(context: LaunchSignoffContext, options: SignLaunchOptions) {
    const draft = buildLaunchSignoffDraft(context);
    const signedBy = options.signedBy.trim();
    const managerNote = options.managerNote.trim();
    if (!signedBy) throw new Error("نام تأییدکننده الزامی است.");
    if (draft.blockers.length && (!options.acceptRisk || !managerNote)) {
      throw new Error("برای تأیید با ریسک، یادداشت مدیر و پذیرش صریح ریسک الزامی است.");
    }

    const snapshot = workforceBackupService.createSnapshot(
      "Baseline تأیید راه‌اندازی",
      "launch_signoff_baseline",
      managerNote || "Baseline شروع استفاده عملیاتی",
      false,
    );
    const bundle = workforceBackupService.createBackupBundle("Launch signoff baseline", "launch-signoff-baseline");
    const timestamp = nowIso();
    const report = upsert({
      ...draft,
      signedAt: options.signedAt ?? timestamp,
      status: "signed",
      signedBy,
      managerNote,
      snapshotId: snapshot.id,
      backupBundleId: bundle.id,
      baselineChecksum: bundle.checksum,
      baselineCoverageVersion: bundle.metadata.coverageVersion,
      baselineBundle: bundle,
      baselineSummary: {
        ...draft.baselineSummary,
        snapshotsCount: workforceBackupService.listSnapshots().length,
        includedKeyCount: bundle.metadata.includedKeyCount,
        coverageVersion: bundle.metadata.coverageVersion,
      },
      acceptedRisk: draft.blockers.length > 0,
      updatedAt: timestamp,
    });
    operationalHistoryService.recordLaunchSignoff(report);
    operationalHistoryService.recordSnapshotEvent(snapshot.id, snapshot.title, snapshot.reason, signedBy);
    operationalHistoryService.recordBackupEvent(bundle.id, "Backup baseline راه‌اندازی", bundle.checksum);
    return report;
  },

  revoke(id: string, managerNote: string) {
    const note = managerNote.trim();
    if (!note) throw new Error("دلیل لغو تأیید الزامی است.");
    return update(id, { status: "revoked", managerNote: note });
  },

  downloadBaseline(id: string) {
    const report = readReports().find((item) => item.id === id);
    if (!report?.baselineBundle) return undefined;
    return workforceBackupService.downloadBackupFile(report.baselineBundle);
  },

  __memory: {
    clear() {
      memoryReports = [];
    },
  },
};
