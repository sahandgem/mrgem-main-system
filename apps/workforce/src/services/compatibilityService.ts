import { createId, nowIso } from "../models/workforce";
import type { Space, TaskType, WorkCompatibility, WorkCompatibilityRule } from "../models/workforce";

export const compatibilityStorageKey = "komak.workforce.compatibilityRules.v1";

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

function inferCompatibility(task: TaskType, space: Space): { compatibility: WorkCompatibility; reason: string } {
  const text = `${task.name} ${task.category} ${task.description} ${space.name} ${space.type} ${space.description}`;
  const isSalesTask = task.requiresCustomerPresence || text.includes("فروش") || text.includes("ظپط±ظˆط´");
  const isSalesSpace = `${space.name} ${space.type}`.includes("فروش") || `${space.name} ${space.type}`.includes("ظپط±ظˆط´");
  const isDirtySpace = `${space.name} ${space.type} ${space.description}`.includes("کثیف") || `${space.name} ${space.type} ${space.description}`.includes("ع©ط«غŒظپ");
  const isPhotoOrDigital = `${task.name} ${task.category}`.includes("عکاسی") || `${task.name} ${task.category}`.includes("دیجیتال") || `${task.name} ${task.category}`.includes("ط¹ع©ط§ط³غŒ") || `${task.name} ${task.category}`.includes("ط¯غŒط¬غŒطھط§ظ„");

  if (task.needsCleanSpace && isDirtySpace) {
    return { compatibility: "blocked", reason: "این کار به فضای تمیز نیاز دارد." };
  }
  if (isPhotoOrDigital && isDirtySpace) {
    return { compatibility: "blocked", reason: "کار دیجیتال یا عکاسی در فضای کثیف مناسب نیست." };
  }
  if (isSalesTask && isSalesSpace) {
    return { compatibility: "preferred", reason: "فروش و پاسخ مشتری برای فروشگاه مناسب است." };
  }
  if (task.focusNeed.includes("زیاد") || task.focusNeed.includes("ط²غŒط§ط¯")) {
    if (space.distractionLevel.includes("زیاد") || space.distractionLevel.includes("ط²غŒط§ط¯")) {
      return { compatibility: "warning", reason: "کار تمرکزی در فضای پرتردد ریسک دارد." };
    }
  }
  return { compatibility: "allowed", reason: "محدودیت خاصی ثبت نشده است." };
}

export function buildDemoCompatibilityRules(taskTypes: TaskType[], spaces: Space[]): WorkCompatibilityRule[] {
  const timestamp = "2026-01-01T00:00:00.000Z";
  return taskTypes.flatMap((task) =>
    spaces.map((space) => {
      const inferred = inferCompatibility(task, space);
      return {
        id: `demo-compat-${task.id}-${space.id}`,
        taskTypeId: task.id,
        spaceId: space.id,
        compatibility: inferred.compatibility,
        reason: inferred.reason,
        isActive: true,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
    }),
  );
}

function readRules(taskTypes: TaskType[], spaces: Space[]): WorkCompatibilityRule[] {
  const demo = buildDemoCompatibilityRules(taskTypes, spaces);
  if (typeof localStorage === "undefined") return demo;

  const raw = localStorage.getItem(compatibilityStorageKey);
  if (!raw) {
    localStorage.setItem(compatibilityStorageKey, JSON.stringify(demo));
    return demo;
  }

  try {
    const parsed = JSON.parse(raw) as WorkCompatibilityRule[];
    const merged = [
      ...parsed,
      ...demo.filter((demoRule) => !parsed.some((rule) => rule.taskTypeId === demoRule.taskTypeId && rule.spaceId === demoRule.spaceId)),
    ];
    if (merged.length !== parsed.length) {
      localStorage.setItem(compatibilityStorageKey, JSON.stringify(merged));
    }
    return merged;
  } catch {
    localStorage.setItem(compatibilityStorageKey, JSON.stringify(demo));
    return demo;
  }
}

export const compatibilityService = {
  list(taskTypes: TaskType[], spaces: Space[]) {
    return readRules(taskTypes, spaces);
  },

  save(rules: WorkCompatibilityRule[]) {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(compatibilityStorageKey, JSON.stringify(rules));
    }
  },

  update(taskTypes: TaskType[], spaces: Space[], taskTypeId: string, spaceId: string, changes: Partial<WorkCompatibilityRule>) {
    const rows = readRules(taskTypes, spaces);
    const timestamp = nowIso();
    const existing = rows.find((rule) => rule.taskTypeId === taskTypeId && rule.spaceId === spaceId);
    const nextRows = existing
      ? rows.map((rule) => rule.id === existing.id ? { ...rule, ...changes, updatedAt: timestamp } : rule)
      : [
        ...rows,
        {
          id: createId("compatibility"),
          taskTypeId,
          spaceId,
          compatibility: changes.compatibility ?? "allowed",
          reason: changes.reason ?? "",
          isActive: changes.isActive ?? true,
          createdAt: timestamp,
          updatedAt: timestamp,
        },
      ];
    this.save(nextRows);
    return nextRows;
  },

  deactivate(taskTypes: TaskType[], spaces: Space[], id: string) {
    const rows = readRules(taskTypes, spaces).map((rule) => rule.id === id ? { ...rule, isActive: false, updatedAt: nowIso() } : rule);
    this.save(rows);
    return rows;
  },

  resetDemo(taskTypes: TaskType[], spaces: Space[]) {
    const demo = clone(buildDemoCompatibilityRules(taskTypes, spaces));
    this.save(demo);
    return demo;
  },
};
