import type {
  AnalysisRule,
  AnalysisSettings,
  DecisionBatchResult,
  DecisionConflict,
  DecisionConflictType,
  DecisionQueueItem,
  Employee,
  RecommendationScenario,
  SimulationChange,
  SimulationVerdict,
  Space,
  TaskType,
  WeeklyScheduleItem,
  WorkCompatibilityRule,
} from "../models/workforce";
import { nowIso } from "../models/workforce";
import { normalizeAnalysisSettings } from "../services/analysisSettingsService";
import { overlaps } from "./timeUtils";
import { analyzeWorkforce } from "./workforceAnalyzer";

export type DecisionQueueInput = {
  spaces: Space[];
  employees: Employee[];
  taskTypes: TaskType[];
  scheduleItems: WeeklyScheduleItem[];
  rules: AnalysisRule[];
  settings?: AnalysisSettings;
  compatibilityRules?: WorkCompatibilityRule[];
};

export function buildDecisionQueue(scenarios: RecommendationScenario[], existingItems: DecisionQueueItem[] = []) {
  const timestamp = nowIso();
  const existingByScenario = new Map(existingItems.map((item) => [item.scenarioId, item]));
  return scenarios.map((scenario) => {
    const existing = existingByScenario.get(scenario.id);
    return {
      id: existing?.id ?? `decision-${scenario.id}`,
      scenarioId: scenario.id,
      findingId: scenario.findingId,
      title: scenario.title,
      change: scenario.change,
      canApply: scenario.canApply,
      status: existing?.status ?? "pending",
      conflictGroupId: existing?.conflictGroupId,
      reason: scenario.reason,
      createdAt: existing?.createdAt ?? timestamp,
      updatedAt: existing?.updatedAt ?? timestamp,
    } satisfies DecisionQueueItem;
  });
}

function cloneSchedule(scheduleItems: WeeklyScheduleItem[]) {
  return scheduleItems.map((item) => ({ ...item }));
}

function applyChange(item: WeeklyScheduleItem, change: SimulationChange): WeeklyScheduleItem {
  return {
    ...item,
    day: change.newDayOfWeek ?? item.day,
    startTime: change.newStartTime ?? item.startTime,
    endTime: change.newEndTime ?? item.endTime,
    spaceId: change.newSpaceId ?? item.spaceId,
    employeeId: change.newEmployeeId ?? item.employeeId,
    taskTypeId: change.newTaskTypeId ?? item.taskTypeId,
  };
}

export function applyScenarioBatchToSchedule(scheduleItems: WeeklyScheduleItem[], scenarios: RecommendationScenario[]) {
  const executable = scenarios.filter((scenario) => scenario.canApply && scenario.change?.scheduleItemId);
  const schedule = cloneSchedule(scheduleItems);
  const appliedChanges: SimulationChange[] = [];
  const touched = new Set<string>();

  for (const scenario of executable) {
    const change = scenario.change;
    if (!change || touched.has(change.scheduleItemId)) continue;
    const index = schedule.findIndex((item) => item.id === change.scheduleItemId);
    if (index < 0) continue;
    schedule[index] = applyChange(schedule[index], change);
    touched.add(change.scheduleItemId);
    appliedChanges.push(change);
  }

  return { scheduleItems: schedule, appliedChanges };
}

function changedItem(input: DecisionQueueInput, scenario: RecommendationScenario) {
  const item = input.scheduleItems.find((row) => row.id === scenario.change?.scheduleItemId);
  if (!item || !scenario.change) return undefined;
  return applyChange(item, scenario.change);
}

function pairConflict(
  type: DecisionConflictType,
  scenarioIds: string[],
  description: string,
  recommendation = "یکی از پیشنهادهای متداخل را حذف کن و دوباره ترکیب را تحلیل کن.",
): DecisionConflict {
  return {
    id: `${type}-${scenarioIds.slice().sort().join("-")}`,
    scenarioIds,
    type,
    severity: "critical",
    description,
    recommendation,
  };
}

export function detectScenarioConflicts(input: DecisionQueueInput, scenarios: RecommendationScenario[], batchScheduleItems?: WeeklyScheduleItem[]) {
  const conflicts: DecisionConflict[] = [];
  const executable = scenarios.filter((scenario) => scenario.change?.scheduleItemId);

  for (let index = 0; index < executable.length; index += 1) {
    for (let otherIndex = index + 1; otherIndex < executable.length; otherIndex += 1) {
      const a = executable[index];
      const b = executable[otherIndex];
      const changeA = a.change;
      const changeB = b.change;
      if (!changeA || !changeB) continue;
      if (changeA.scheduleItemId === changeB.scheduleItemId) {
        conflicts.push(pairConflict("same_schedule_item", [a.id, b.id], "دو تصمیم روی یک آیتم برنامه اثر می‌گذارند."));
        continue;
      }

      const itemA = changedItem(input, a);
      const itemB = changedItem(input, b);
      if (!itemA || !itemB) continue;
      if (itemA.employeeId === itemB.employeeId && itemA.spaceId !== itemB.spaceId && overlaps(itemA, itemB)) {
        conflicts.push(pairConflict("same_employee_conflict", [a.id, b.id], "یک کارمند هم‌زمان به دو فضای متفاوت فرستاده می‌شود."));
      }
      if (changeA.newEmployeeId && changeB.newEmployeeId && changeA.newEmployeeId === changeB.newEmployeeId && changeA.newSpaceId !== changeB.newSpaceId && overlaps(itemA, itemB)) {
        conflicts.push(pairConflict("overlapping_time_change", [a.id, b.id], "دو تغییر زمانی/مکانی هم‌پوشان برای یک کارمند ساخته شده است."));
      }
    }
  }

  const schedule = batchScheduleItems ?? applyScenarioBatchToSchedule(input.scheduleItems, scenarios).scheduleItems;
  for (const space of input.spaces.filter((item) => item.isActive)) {
    const related = schedule.filter((item) => item.isActive && item.spaceId === space.id);
    for (let index = 0; index < related.length; index += 1) {
      const item = related[index];
      const overlapping = related.filter((other) => overlaps(item, other));
      if (overlapping.length > space.maxCapacity) {
        const scenarioIds = executable
          .filter((scenario) => overlapping.some((row) => row.id === scenario.change?.scheduleItemId))
          .map((scenario) => scenario.id);
        conflicts.push({
          id: `space_capacity_conflict-${space.id}-${item.day}-${item.startTime}`,
          scenarioIds,
          type: "space_capacity_conflict",
          severity: "critical",
          description: `${space.name} بعد از ترکیب انتخاب‌ها از ظرفیت مجاز عبور می‌کند.`,
          recommendation: "یکی از انتقال‌ها به این فضا را حذف کن یا زمان را تغییر بده.",
        });
      }
    }
  }

  return uniqueConflicts(conflicts);
}

function uniqueConflicts(conflicts: DecisionConflict[]) {
  const seen = new Set<string>();
  return conflicts.filter((conflict) => {
    if (seen.has(conflict.id)) return false;
    seen.add(conflict.id);
    return true;
  });
}

export function getDecisionBatchVerdict(controlScoreDelta: number, riskScoreDelta: number, conflicts: DecisionConflict[]): SimulationVerdict {
  if (conflicts.some((conflict) => conflict.severity === "critical")) return "worsened";
  if (controlScoreDelta > 2 || riskScoreDelta < -2) return "improved";
  if (controlScoreDelta < -2 || riskScoreDelta > 2) return "worsened";
  return "neutral";
}

export function explainBatchResult(result: Pick<DecisionBatchResult, "verdict" | "controlScoreBefore" | "controlScoreAfter" | "riskScoreBefore" | "riskScoreAfter" | "conflicts" | "safeToApply">) {
  if (result.conflicts.length) return "ترکیب انتخاب‌شده تداخل دارد و تا رفع آن قابل اعمال نیست.";
  if (!result.safeToApply) return "ترکیب انتخاب‌شده هشدار بحرانی تازه می‌سازد و برای اعمال امن نیست.";
  if (result.verdict === "improved") return `ترکیب انتخاب‌شده کنترل را از ${result.controlScoreBefore} به ${result.controlScoreAfter} می‌رساند و ریسک از ${result.riskScoreBefore} به ${result.riskScoreAfter} تغییر می‌کند.`;
  if (result.verdict === "worsened") return "ترکیب انتخاب‌شده وضعیت را بدتر می‌کند و بهتر است اعمال نشود.";
  return "اثر ترکیب انتخاب‌شده تقریباً خنثی است و نیازمند بررسی مدیر است.";
}

export function simulateDecisionBatch(input: DecisionQueueInput, scenarios: RecommendationScenario[]): DecisionBatchResult {
  const settings = normalizeAnalysisSettings(input.settings);
  const originalSchedule = cloneSchedule(input.scheduleItems);
  const batch = applyScenarioBatchToSchedule(originalSchedule, scenarios);
  const originalAnalysis = analyzeWorkforce({ ...input, settings, scheduleItems: originalSchedule, compatibilityRules: input.compatibilityRules ?? [] });
  const batchAnalysis = analyzeWorkforce({ ...input, settings, scheduleItems: batch.scheduleItems, compatibilityRules: input.compatibilityRules ?? [] });
  const conflicts = detectScenarioConflicts(input, scenarios, batch.scheduleItems);
  const originalCriticalIds = new Set(originalAnalysis.findings.filter((finding) => finding.severity === "critical").map((finding) => finding.id));
  const createsNewCritical = batchAnalysis.findings.some((finding) => finding.severity === "critical" && !originalCriticalIds.has(finding.id));
  if (createsNewCritical) {
    conflicts.push({
      id: "creates_new_critical-batch",
      scenarioIds: scenarios.map((scenario) => scenario.id),
      type: "creates_new_critical",
      severity: "critical",
      description: "ترکیب انتخاب‌شده هشدار بحرانی تازه ایجاد می‌کند.",
      recommendation: "ترکیب را کوچک‌تر کن یا سناریوی پرریسک را حذف کن.",
    });
  }
  const controlScoreDelta = batchAnalysis.controlScore - originalAnalysis.controlScore;
  const riskScoreDelta = batchAnalysis.totalRiskScore - originalAnalysis.totalRiskScore;
  const verdict = getDecisionBatchVerdict(controlScoreDelta, riskScoreDelta, conflicts);
  const safeToApply = scenarios.length > 0 && scenarios.every((scenario) => scenario.canApply) && conflicts.length === 0 && !createsNewCritical && verdict !== "worsened";
  const result: DecisionBatchResult = {
    selectedScenarioIds: scenarios.map((scenario) => scenario.id),
    originalAnalysis,
    batchAnalysis,
    controlScoreBefore: originalAnalysis.controlScore,
    controlScoreAfter: batchAnalysis.controlScore,
    riskScoreBefore: originalAnalysis.totalRiskScore,
    riskScoreAfter: batchAnalysis.totalRiskScore,
    criticalBefore: originalAnalysis.criticalCount,
    criticalAfter: batchAnalysis.criticalCount,
    warningBefore: originalAnalysis.warningCount,
    warningAfter: batchAnalysis.warningCount,
    verdict,
    summary: "",
    conflicts: uniqueConflicts(conflicts),
    safeToApply,
    appliedChanges: batch.appliedChanges,
  };
  return { ...result, summary: explainBatchResult(result) };
}

export function groupConflictingScenarios(conflicts: DecisionConflict[]) {
  return conflicts.reduce<Record<string, DecisionConflict[]>>((groups, conflict) => {
    const key = conflict.scenarioIds.slice().sort().join("|") || conflict.type;
    groups[key] = [...(groups[key] ?? []), conflict];
    return groups;
  }, {});
}

export function selectBestSafeScenarioCombination(input: DecisionQueueInput, scenarios: RecommendationScenario[], minCount = 3, maxCount = 5) {
  const selected: RecommendationScenario[] = [];
  for (const scenario of [...scenarios].filter((item) => item.canApply).sort((a, b) => b.rankScore - a.rankScore)) {
    if (selected.length >= maxCount) break;
    const attempt = [...selected, scenario];
    const result = simulateDecisionBatch(input, attempt);
    if (result.safeToApply || (selected.length < minCount && result.conflicts.length === 0 && result.criticalAfter <= result.criticalBefore)) {
      selected.push(scenario);
    }
  }
  return selected;
}
