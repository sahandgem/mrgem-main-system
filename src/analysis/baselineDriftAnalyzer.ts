import type {
  BaselineDriftChange,
  BaselineDriftChangeType,
  BaselineDriftLevel,
  BaselineDriftReport,
  BaselineDriftSeverity,
  WorkforceBackupBundle,
} from "../models/workforce";
import { createId, nowIso, toPersianNumber } from "../models/workforce";
import {
  calculateComparableChecksum,
  isLegacyBackupCoverageBaseline,
  workforceBackupCoverageVersion,
} from "../services/workforceBackupService";

export interface BaselineDriftInput {
  baselineSignoffId: string;
  baselineChecksum: string;
  currentChecksum: string;
  baselineData: Record<string, unknown>;
  currentData: Record<string, unknown>;
  baselineBundle?: WorkforceBackupBundle;
  currentBundle?: WorkforceBackupBundle;
}

type ChangeOperation = "count" | "added" | "removed" | "updated" | "value";

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value as Record<string, unknown>).sort().map((key) => `${JSON.stringify(key)}:${stableStringify((value as Record<string, unknown>)[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function entityLabel(storageKey: string) {
  if (storageKey.includes("spaces")) return "فضا";
  if (storageKey.includes("employees")) return "کارمند";
  if (storageKey.includes("taskTypes")) return "نوع کار";
  if (storageKey.includes("scheduleItems")) return "برنامه هفتگی";
  if (storageKey.includes("rules")) return "قانون تحلیل";
  if (storageKey.includes("analysisSettings")) return "تنظیمات تحلیل";
  if (storageKey.includes("compatibilityRules")) return "قانون سازگاری";
  if (storageKey.includes("decisionReports")) return "گزارش تصمیم";
  if (storageKey.includes("monthlyGoals")) return "هدف ماهانه";
  if (storageKey.includes("preventiveAlertStates")) return "وضعیت هشدار";
  if (storageKey.includes("launchChecklist")) return "چک‌لیست راه‌اندازی";
  return "داده عملیاتی";
}

export function classifyDriftChange(storageKey: string, operation: ChangeOperation) {
  const base = { type: "entity_updated" as BaselineDriftChangeType, severity: "medium" as BaselineDriftSeverity, scoreImpact: 8, requiresReview: true, requiresResignoff: false };
  if (operation === "count") return { ...base, type: "count_changed" as const, severity: "low" as const, scoreImpact: 2, requiresReview: false };
  if (storageKey.includes("analysisSettings")) return { ...base, type: "settings_changed" as const, severity: "high" as const, scoreImpact: 24, requiresResignoff: true };
  if (storageKey.includes("compatibilityRules")) return { ...base, type: "compatibility_changed" as const, severity: "high" as const, scoreImpact: 22, requiresResignoff: true };
  if (storageKey.endsWith("rules.v1")) return { ...base, type: "rule_changed" as const, severity: "high" as const, scoreImpact: 24, requiresResignoff: true };
  if (storageKey.includes("scheduleItems")) return { ...base, type: "schedule_changed" as const, severity: "medium" as const, scoreImpact: operation === "removed" ? 12 : 9 };
  if (storageKey.includes("decisionReports")) return { ...base, type: "report_changed" as const, severity: "low" as const, scoreImpact: 2, requiresReview: false };
  if (storageKey.includes("monthlyGoals")) return { ...base, type: "goal_changed" as const, severity: "low" as const, scoreImpact: 3, requiresReview: false };
  if (storageKey.includes("preventiveAlertStates")) return { ...base, type: "alert_state_changed" as const, severity: "low" as const, scoreImpact: 2, requiresReview: false };
  if (storageKey.includes("snapshots") || storageKey.includes("backup")) return { ...base, type: "backup_state_changed" as const, severity: "info" as const, scoreImpact: 1, requiresReview: false };
  if (storageKey.includes("spaces") || storageKey.includes("employees") || storageKey.includes("taskTypes")) {
    if (operation === "removed" || operation === "updated") return { ...base, type: operation === "removed" ? "entity_removed" as const : "entity_updated" as const, severity: "high" as const, scoreImpact: 18, requiresResignoff: true };
    return { ...base, type: "entity_added" as const, severity: "medium" as const, scoreImpact: 10 };
  }
  if (operation === "added") return { ...base, type: "entity_added" as const };
  if (operation === "removed") return { ...base, type: "entity_removed" as const, severity: "high" as const, scoreImpact: 15, requiresResignoff: true };
  return base;
}

function summary(value: unknown) {
  if (value === undefined) return "وجود ندارد";
  if (Array.isArray(value)) return `${toPersianNumber(value.length)} رکورد`;
  if (value && typeof value === "object") {
    const row = value as Record<string, unknown>;
    return String(row.name ?? row.title ?? row.key ?? row.id ?? "رکورد موجود");
  }
  return String(value);
}

function makeChange(storageKey: string, operation: ChangeOperation, before: unknown, after: unknown, entityId?: string): BaselineDriftChange {
  const classification = classifyDriftChange(storageKey, operation);
  const label = entityLabel(storageKey);
  const operationLabel = operation === "added" ? "اضافه شد" : operation === "removed" ? "حذف شد" : operation === "count" ? "تعداد تغییر کرد" : "ویرایش شد";
  return {
    id: createId("drift-change"),
    ...classification,
    storageKey,
    entityType: label,
    entityId,
    title: `${label} ${operationLabel}`,
    description: entityId ? `رکورد ${entityId} نسبت به baseline تغییر کرده است.` : `محتوای ${label} نسبت به baseline تغییر کرده است.`,
    beforeSummary: summary(before),
    afterSummary: summary(after),
  };
}

export function summarizeStorageKeyDiff(storageKey: string, baselineValue: unknown, currentValue: unknown) {
  return `${entityLabel(storageKey)}: ${summary(baselineValue)} -> ${summary(currentValue)}`;
}

export function compareCurrentStateToBaseline(baselineData: Record<string, unknown>, currentData: Record<string, unknown>) {
  const baseline = clone(baselineData);
  const current = clone(currentData);
  const changes: BaselineDriftChange[] = [];
  const keys = new Set([...Object.keys(baseline), ...Object.keys(current)]);

  for (const key of keys) {
    const before = baseline[key];
    const after = current[key];
    if (stableStringify(before) === stableStringify(after)) continue;

    if (Array.isArray(before) && Array.isArray(after)) {
      if (before.length !== after.length) changes.push(makeChange(key, "count", before, after));
      const beforeById = new Map(before.filter((item) => item && typeof item === "object" && "id" in item).map((item) => [String((item as { id: unknown }).id), item]));
      const afterById = new Map(after.filter((item) => item && typeof item === "object" && "id" in item).map((item) => [String((item as { id: unknown }).id), item]));
      for (const [id, row] of afterById) if (!beforeById.has(id)) changes.push(makeChange(key, "added", undefined, row, id));
      for (const [id, row] of beforeById) if (!afterById.has(id)) changes.push(makeChange(key, "removed", row, undefined, id));
      for (const [id, row] of afterById) {
        const previous = beforeById.get(id);
        if (previous && stableStringify(previous) !== stableStringify(row)) changes.push(makeChange(key, "updated", previous, row, id));
      }
      if (!beforeById.size && !afterById.size) changes.push(makeChange(key, "value", before, after));
    } else {
      changes.push(makeChange(key, "value", before, after));
    }
  }
  return changes;
}

export function calculateDriftScore(changes: BaselineDriftChange[]) {
  return Math.max(0, Math.min(100, changes.reduce((sum, change) => sum + change.scoreImpact, 0)));
}

export function determineDriftLevel(score: number): BaselineDriftLevel {
  if (score <= 0) return "none";
  if (score <= 20) return "low";
  if (score <= 45) return "medium";
  if (score <= 75) return "high";
  return "critical";
}

export function detectResignoffRequiredChanges(changes: BaselineDriftChange[]) {
  return changes.filter((change) => change.requiresResignoff);
}

export function generateDriftRecommendedAction(level: BaselineDriftLevel, requiresResignoff: boolean) {
  if (requiresResignoff) return "تغییرات مهم را بررسی و بازتأیید عملیاتی ثبت کنید.";
  if (level === "medium") return "تغییرات را پیش از ادامه هفته بازبینی کنید.";
  if (level === "low") return "تغییرات کم‌خطر ثبت شده‌اند؛ پایش را ادامه دهید.";
  return "وضعیت فعلی با baseline هم‌خوان است.";
}

function buildCompatibility(input: BaselineDriftInput) {
  const comparable = calculateComparableChecksum(input.baselineData ?? {}, input.currentData ?? {});
  const isLegacyBaseline = isLegacyBackupCoverageBaseline(input.baselineBundle, input.baselineData);
  const compatibilityWarnings = isLegacyBaseline
    ? [
      "این baseline با نسخه قدیمی‌تر backup coverage ساخته شده است؛ مقایسه checksum ممکن است drift ساختاری نشان دهد.",
      comparable.nonComparableKeys.length
        ? `${toPersianNumber(comparable.nonComparableKeys.length)} کلید جدید فقط به عنوان اختلاف پوشش گزارش شد و در drift اصلی شمرده نشد.`
        : "همه کلیدهای موجود بین baseline و وضعیت فعلی قابل مقایسه هستند.",
    ]
    : [];
  return {
    comparable,
    reportFields: {
      baselineCoverageVersion: input.baselineBundle?.metadata.coverageVersion,
      currentCoverageVersion: input.currentBundle?.metadata.coverageVersion ?? workforceBackupCoverageVersion,
      isLegacyBaseline,
      compatibilityWarnings,
      comparableKeyCount: comparable.comparableKeys.length,
      nonComparableKeyCount: comparable.nonComparableKeys.length,
      comparableChecksumBefore: comparable.baselineChecksum,
      comparableChecksumAfter: comparable.currentChecksum,
    },
  };
}

export function buildBaselineDriftReport(input: BaselineDriftInput): BaselineDriftReport {
  const compatibility = buildCompatibility(input);
  if (!input.baselineSignoffId || !input.baselineData) {
    return { id: createId("drift"), generatedAt: nowIso(), baselineSignoffId: "", baselineChecksum: "", currentChecksum: input.currentChecksum, ...compatibility.reportFields, driftScore: 0, driftLevel: "none", totalChanges: 0, reviewCount: 0, resignoffCount: 0, requiresResignoff: false, changes: [], summary: "Baseline تأییدشده‌ای برای مقایسه وجود ندارد.", recommendedAction: "ابتدا launch signoff را ثبت کنید." };
  }
  if (input.baselineChecksum === input.currentChecksum) {
    return { id: createId("drift"), generatedAt: nowIso(), baselineSignoffId: input.baselineSignoffId, baselineChecksum: input.baselineChecksum, currentChecksum: input.currentChecksum, ...compatibility.reportFields, driftScore: 0, driftLevel: "none", totalChanges: 0, reviewCount: 0, resignoffCount: 0, requiresResignoff: false, changes: [], summary: "داده‌های فعلی با baseline یکسان هستند.", recommendedAction: generateDriftRecommendedAction("none", false) };
  }

  const baselineData = compatibility.reportFields.isLegacyBaseline
    ? Object.fromEntries(compatibility.comparable.comparableKeys.map((key) => [key, input.baselineData[key]]))
    : input.baselineData;
  const currentData = compatibility.reportFields.isLegacyBaseline
    ? Object.fromEntries(compatibility.comparable.comparableKeys.map((key) => [key, input.currentData[key]]))
    : input.currentData;
  const changes = compareCurrentStateToBaseline(baselineData, currentData);
  const driftScore = calculateDriftScore(changes);
  const driftLevel = determineDriftLevel(driftScore);
  const resignoffChanges = detectResignoffRequiredChanges(changes);
  const requiresResignoff = driftLevel === "high" || driftLevel === "critical" || resignoffChanges.length > 0;

  return {
    id: createId("drift"),
    generatedAt: nowIso(),
    baselineSignoffId: input.baselineSignoffId,
    baselineChecksum: input.baselineChecksum,
    currentChecksum: input.currentChecksum,
    ...compatibility.reportFields,
    driftScore,
    driftLevel,
    totalChanges: changes.length,
    reviewCount: changes.filter((change) => change.requiresReview).length,
    resignoffCount: resignoffChanges.length,
    requiresResignoff,
    changes,
    summary: `${toPersianNumber(changes.length)} تغییر با امتیاز drift ${toPersianNumber(driftScore)} شناسایی شد.`,
    recommendedAction: generateDriftRecommendedAction(driftLevel, requiresResignoff),
  };
}
