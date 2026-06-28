import type {
  LaunchChecklistItem,
  LaunchChecklistReport,
  OperationalReadinessReport,
  ReadinessCheckCategory,
  ReadinessCheckSeverity,
} from "../models/workforce";
import { createId, nowIso, toPersianNumber } from "../models/workforce";

const severityOrder: Record<ReadinessCheckSeverity, number> = {
  critical: 0,
  warning: 1,
  info: 2,
};

const categoryFallbackPath: Record<ReadinessCheckCategory, string> = {
  base_data: "/organization/workforce-dashboard/spaces",
  schedule: "/organization/workforce-dashboard/schedule",
  rules: "/organization/workforce-dashboard/rules",
  analysis: "/organization/workforce-dashboard/settings",
  backup: "/organization/workforce-dashboard/data-center",
  maintenance: "/organization/workforce-dashboard/maintenance",
  reports: "/organization/workforce-dashboard/decision-report",
  monthly_goals: "/organization/workforce-dashboard/monthly-health",
  preventive_alerts: "/organization/workforce-dashboard/preventive-alerts",
  ui_flow: "/organization/workforce-dashboard",
};

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

function sortItems(items: LaunchChecklistItem[]) {
  return [...items].sort((a, b) => {
    const statusDelta = (a.status === "open" ? 0 : 1) - (b.status === "open" ? 0 : 1);
    return statusDelta || severityOrder[a.severity] - severityOrder[b.severity] || a.createdAt.localeCompare(b.createdAt);
  });
}

export function mergeChecklistWithExistingState(
  generatedItems: LaunchChecklistItem[],
  existingItems: LaunchChecklistItem[] = [],
) {
  const existingBySource = new Map(existingItems.map((item) => [item.sourceCheckId, item]));
  return sortItems(generatedItems.map((item) => {
    const existing = existingBySource.get(item.sourceCheckId);
    if (!existing) return item;

    if (existing.status === "dismissed") {
      return {
        ...item,
        id: existing.id,
        status: existing.status,
        managerNote: existing.managerNote,
        createdAt: existing.createdAt,
        updatedAt: existing.updatedAt,
        dismissedAt: existing.dismissedAt,
      };
    }

    // A completed action that still fails readiness needs another explicit review.
    return {
      ...item,
      id: existing.id,
      status: "open" as const,
      managerNote: existing.status === "completed" ? "نیازمند بررسی مجدد پس از بازسازی" : existing.managerNote,
      createdAt: existing.createdAt,
      updatedAt: existing.status === "completed" ? nowIso() : existing.updatedAt,
    };
  }));
}

export function calculateLaunchProgress(items: LaunchChecklistItem[]) {
  if (!items.length) return 100;
  return Math.round((items.filter((item) => item.status === "completed").length / items.length) * 100);
}

export function getNextBestLaunchStep(items: LaunchChecklistItem[]) {
  return sortItems(items.filter((item) => item.status === "open"))[0];
}

export function groupChecklistByCategory(items: LaunchChecklistItem[]) {
  return items.reduce((groups, item) => {
    (groups[item.category] ??= []).push(item);
    return groups;
  }, {} as Partial<Record<ReadinessCheckCategory, LaunchChecklistItem[]>>);
}

export function createLaunchChecklistReport(items: LaunchChecklistItem[]): LaunchChecklistReport {
  const sortedItems = sortItems(clone(items));
  const openCount = sortedItems.filter((item) => item.status === "open").length;
  const completedCount = sortedItems.filter((item) => item.status === "completed").length;
  const dismissedCount = sortedItems.filter((item) => item.status === "dismissed").length;
  const criticalOpenCount = sortedItems.filter((item) => item.status === "open" && item.severity === "critical").length;
  const progressPercent = calculateLaunchProgress(sortedItems);
  const nextBestStep = getNextBestLaunchStep(sortedItems);

  return {
    id: createId("launch-report"),
    generatedAt: nowIso(),
    progressPercent,
    openCount,
    completedCount,
    dismissedCount,
    criticalOpenCount,
    items: sortedItems,
    summary: openCount
      ? `${toPersianNumber(openCount)} اقدام باز است و ${toPersianNumber(completedCount)} اقدام تکمیل شده.`
      : "اقدام بازی برای راه‌اندازی باقی نمانده است.",
    nextBestStep,
  };
}

export function buildLaunchChecklistFromReadiness(
  readiness: OperationalReadinessReport,
  existingItems: LaunchChecklistItem[] = [],
): LaunchChecklistReport {
  const timestamp = nowIso();
  const generatedItems = readiness.checks
    .filter((check) => !check.passed && (check.severity !== "info" || Boolean(check.actionPath)))
    .map<LaunchChecklistItem>((check) => ({
      id: `launch-${check.id}`,
      sourceCheckId: check.id,
      category: check.category,
      title: check.title,
      description: check.description,
      severity: check.severity,
      actionLabel: check.actionLabel || "رفتن به صفحه اقدام",
      actionPath: check.actionPath || categoryFallbackPath[check.category],
      status: "open",
      managerNote: "",
      createdAt: timestamp,
      updatedAt: timestamp,
    }));

  return createLaunchChecklistReport(mergeChecklistWithExistingState(generatedItems, existingItems));
}
