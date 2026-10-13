import { createId, nowIso } from "../models/workforce";
import type { MonthlyGoal } from "../models/workforce";

export const monthlyGoalsStorageKey = "komak.workforce.monthlyGoals.v1";

let memoryGoals: MonthlyGoal[] = [];

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

function readGoals(includeArchived = false): MonthlyGoal[] {
  if (typeof localStorage === "undefined") {
    return clone(includeArchived ? memoryGoals : memoryGoals.filter((goal) => !goal.isArchived));
  }
  const raw = localStorage.getItem(monthlyGoalsStorageKey);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as MonthlyGoal[];
    return includeArchived ? parsed : parsed.filter((goal) => !goal.isArchived);
  } catch {
    localStorage.setItem(monthlyGoalsStorageKey, JSON.stringify([]));
    return [];
  }
}

function writeGoals(goals: MonthlyGoal[]) {
  if (typeof localStorage === "undefined") {
    memoryGoals = clone(goals);
    return;
  }
  localStorage.setItem(monthlyGoalsStorageKey, JSON.stringify(goals));
}

export const monthlyGoalService = {
  list(includeArchived = false) {
    return readGoals(includeArchived).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  filterByMonth(monthLabel: string) {
    return this.list().filter((goal) => goal.monthLabel === monthLabel || monthLabel === "all");
  },

  create(draft: Omit<MonthlyGoal, "id" | "createdAt" | "updatedAt"> & Partial<Pick<MonthlyGoal, "id" | "createdAt" | "updatedAt">>) {
    const timestamp = nowIso();
    const goal: MonthlyGoal = {
      ...draft,
      id: draft.id ?? createId("monthly-goal"),
      createdAt: draft.createdAt ?? timestamp,
      updatedAt: timestamp,
    };
    writeGoals([goal, ...readGoals(true)]);
    return goal;
  },

  update(id: string, changes: Partial<MonthlyGoal>) {
    let updated: MonthlyGoal | undefined;
    const next = readGoals(true).map((goal) => {
      if (goal.id !== id) return goal;
      updated = { ...goal, ...changes, id, updatedAt: nowIso() };
      return updated;
    });
    writeGoals(next);
    return updated;
  },

  archive(id: string) {
    return this.update(id, { isArchived: true });
  },

  resetDemo() {
    writeGoals([]);
    return [];
  },
};
