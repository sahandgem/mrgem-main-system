import { createId, nowIso } from "../models/workforce";
import type { DecisionBatchResult, DecisionReport, DecisionReportStatus } from "../models/workforce";

export const decisionReportsStorageKey = "komak.workforce.decisionReports.v1";

let memoryReports: DecisionReport[] = [];

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

function readReports(includeArchived = false): DecisionReport[] {
  if (typeof localStorage === "undefined") {
    return clone(includeArchived ? memoryReports : memoryReports.filter((report) => !report.isArchived));
  }

  const raw = localStorage.getItem(decisionReportsStorageKey);
  if (!raw) return [];

  try {
    const reports = JSON.parse(raw) as DecisionReport[];
    return includeArchived ? reports : reports.filter((report) => !report.isArchived);
  } catch {
    localStorage.setItem(decisionReportsStorageKey, JSON.stringify([]));
    return [];
  }
}

function writeReports(reports: DecisionReport[]) {
  if (typeof localStorage === "undefined") {
    memoryReports = clone(reports);
    return;
  }
  localStorage.setItem(decisionReportsStorageKey, JSON.stringify(reports));
}

export function createDecisionReportFromBatch(
  decisionBatchResult: DecisionBatchResult,
  options: Partial<Pick<DecisionReport, "title" | "weekLabel" | "status" | "approvedBy" | "managerNote">> = {},
): DecisionReport {
  const timestamp = nowIso();
  const appliedScenarioIds = decisionBatchResult.safeToApply ? decisionBatchResult.selectedScenarioIds : [];
  const skippedScenarioIds = decisionBatchResult.selectedScenarioIds.filter((id) => !appliedScenarioIds.includes(id));
  return {
    id: createId("decision-report"),
    title: options.title ?? "گزارش تصمیم‌های مدیریتی هفته",
    weekLabel: options.weekLabel ?? "هفته جاری",
    generatedAt: timestamp,
    status: options.status ?? (decisionBatchResult.safeToApply ? "draft" : "needs_review"),
    approvedBy: options.approvedBy ?? "",
    managerNote: options.managerNote ?? "",
    decisionBatchResult: clone(decisionBatchResult),
    appliedScenarioIds,
    skippedScenarioIds,
    remainingRisks: clone(decisionBatchResult.batchAnalysis.findings.filter((finding) => finding.severity === "critical" || finding.severity === "warning").slice(0, 12)),
    summary: {
      controlScoreBefore: decisionBatchResult.controlScoreBefore,
      controlScoreAfter: decisionBatchResult.controlScoreAfter,
      riskScoreBefore: decisionBatchResult.riskScoreBefore,
      riskScoreAfter: decisionBatchResult.riskScoreAfter,
      criticalBefore: decisionBatchResult.criticalBefore,
      criticalAfter: decisionBatchResult.criticalAfter,
      warningBefore: decisionBatchResult.warningBefore,
      warningAfter: decisionBatchResult.warningAfter,
      verdict: decisionBatchResult.verdict,
      summary: decisionBatchResult.summary,
    },
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export const decisionReportService = {
  list(includeArchived = false) {
    return readReports(includeArchived).sort((a, b) => b.generatedAt.localeCompare(a.generatedAt));
  },

  get(id: string) {
    return readReports(true).find((report) => report.id === id);
  },

  createFromBatch(decisionBatchResult: DecisionBatchResult, options = {} as Parameters<typeof createDecisionReportFromBatch>[1]) {
    const report = createDecisionReportFromBatch(decisionBatchResult, options);
    writeReports([report, ...readReports(true)]);
    return report;
  },

  update(id: string, changes: Partial<Pick<DecisionReport, "title" | "weekLabel" | "approvedBy" | "managerNote" | "status">>) {
    const reports = readReports(true);
    let updated: DecisionReport | undefined;
    const next = reports.map((report) => {
      if (report.id !== id) return report;
      updated = { ...report, ...changes, updatedAt: nowIso() };
      return updated;
    });
    writeReports(next);
    return updated;
  },

  updateManagerNote(id: string, managerNote: string) {
    return this.update(id, { managerNote });
  },

  updateStatus(id: string, status: DecisionReportStatus) {
    return this.update(id, { status });
  },

  archive(id: string) {
    const reports = readReports(true);
    let archived: DecisionReport | undefined;
    const next = reports.map((report) => {
      if (report.id !== id) return report;
      archived = { ...report, isArchived: true, updatedAt: nowIso() };
      return archived;
    });
    writeReports(next);
    return archived;
  },

  resetDemo() {
    writeReports([]);
    return [];
  },
};
