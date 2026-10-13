import { buildLaunchChecklistFromReadiness, createLaunchChecklistReport } from "../analysis/launchChecklistBuilder";
import type { LaunchChecklistItem, OperationalReadinessReport } from "../models/workforce";
import { nowIso } from "../models/workforce";

export const launchChecklistStorageKey = "komak.workforce.launchChecklist.v1";

let memoryItems: LaunchChecklistItem[] = [];
const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

function readItems(): LaunchChecklistItem[] {
  if (typeof localStorage === "undefined") return clone(memoryItems);
  const raw = localStorage.getItem(launchChecklistStorageKey);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    localStorage.setItem(launchChecklistStorageKey, "[]");
    return [];
  }
}

function writeItems(items: LaunchChecklistItem[]) {
  if (typeof localStorage === "undefined") memoryItems = clone(items);
  else localStorage.setItem(launchChecklistStorageKey, JSON.stringify(items));
}

function updateItem(id: string, changes: Partial<LaunchChecklistItem>) {
  let updated: LaunchChecklistItem | undefined;
  const items = readItems().map((item) => {
    if (item.id !== id) return item;
    updated = { ...item, ...changes, id, updatedAt: nowIso() };
    return updated;
  });
  writeItems(items);
  return updated;
}

export const launchChecklistService = {
  list() {
    return createLaunchChecklistReport(readItems());
  },

  rebuild(readiness: OperationalReadinessReport, reset = false) {
    const report = buildLaunchChecklistFromReadiness(readiness, reset ? [] : readItems());
    writeItems(report.items);
    return report;
  },

  complete(id: string) {
    const timestamp = nowIso();
    return updateItem(id, { status: "completed", completedAt: timestamp, dismissedAt: undefined });
  },

  dismiss(id: string, managerNote: string) {
    const note = managerNote.trim();
    if (!note) return undefined;
    const timestamp = nowIso();
    return updateItem(id, { status: "dismissed", managerNote: note, dismissedAt: timestamp, completedAt: undefined });
  },

  reopen(id: string) {
    return updateItem(id, { status: "open", managerNote: "", completedAt: undefined, dismissedAt: undefined });
  },

  reset() {
    writeItems([]);
    return this.list();
  },

  __memory: {
    clear() {
      memoryItems = [];
    },
  },
};
