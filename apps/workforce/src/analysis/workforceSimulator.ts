import type {
  AnalysisFinding,
  AnalysisRule,
  AnalysisSettings,
  Employee,
  SimulationChange,
  SimulationResult,
  SimulationVerdict,
  Space,
  TaskType,
  WeeklyScheduleItem,
  WorkCompatibilityRule,
} from "../models/workforce";
import { analyzeWorkforce } from "./workforceAnalyzer";

type SimulationInput = {
  spaces: Space[];
  employees: Employee[];
  taskTypes: TaskType[];
  scheduleItems: WeeklyScheduleItem[];
  rules: AnalysisRule[];
  settings: AnalysisSettings;
  compatibilityRules: WorkCompatibilityRule[];
};

function findingKey(finding: AnalysisFinding) {
  return [
    finding.ruleId,
    finding.severity,
    finding.affectedScheduleItemIds.slice().sort().join(","),
    finding.affectedSpaceIds.slice().sort().join(","),
    finding.affectedEmployeeIds.slice().sort().join(","),
    finding.dayOfWeek ?? "",
    finding.startTime ?? "",
    finding.endTime ?? "",
  ].join("|");
}

export function getSimulationVerdict(controlScoreDelta: number, riskScoreDelta: number): SimulationVerdict {
  if (controlScoreDelta > 2 || riskScoreDelta < -2) return "improved";
  if (controlScoreDelta < -2 || riskScoreDelta > 2) return "worsened";
  return "neutral";
}

export function compareAnalysisResults(
  originalAnalysis: SimulationResult["originalAnalysis"],
  simulatedAnalysis: SimulationResult["simulatedAnalysis"],
): Omit<SimulationResult, "originalAnalysis" | "simulatedAnalysis"> {
  const originalByKey = new Map(originalAnalysis.findings.map((finding) => [findingKey(finding), finding]));
  const simulatedByKey = new Map(simulatedAnalysis.findings.map((finding) => [findingKey(finding), finding]));
  const resolvedFindings = originalAnalysis.findings.filter((finding) => !simulatedByKey.has(findingKey(finding)));
  const newFindings = simulatedAnalysis.findings.filter((finding) => !originalByKey.has(findingKey(finding)));
  const worsenedFindings = newFindings.filter((finding) => finding.severity === "critical" || finding.scoreImpact >= 8);
  const improvedFindings = resolvedFindings;
  const controlScoreDelta = simulatedAnalysis.controlScore - originalAnalysis.controlScore;
  const riskScoreDelta = simulatedAnalysis.totalRiskScore - originalAnalysis.totalRiskScore;
  const criticalDelta = simulatedAnalysis.criticalCount - originalAnalysis.criticalCount;
  const warningDelta = simulatedAnalysis.warningCount - originalAnalysis.warningCount;
  const verdict = getSimulationVerdict(controlScoreDelta, riskScoreDelta);

  return {
    controlScoreDelta,
    riskScoreDelta,
    criticalDelta,
    warningDelta,
    verdict,
    summary:
      verdict === "improved"
        ? "این جابه‌جایی برنامه را بهتر می‌کند."
        : verdict === "worsened"
          ? "این جابه‌جایی ریسک را بیشتر می‌کند."
          : "اثر این جابه‌جایی تقریبا خنثی است.",
    improvedFindings,
    worsenedFindings,
    newFindings,
    resolvedFindings,
  };
}

export function simulateScheduleChange(input: SimulationInput, change: SimulationChange): SimulationResult {
  const originalSchedule = input.scheduleItems.map((item) => ({ ...item }));
  const simulatedSchedule = originalSchedule.map((item) =>
    item.id === change.scheduleItemId
      ? {
        ...item,
        day: change.newDayOfWeek ?? item.day,
        startTime: change.newStartTime ?? item.startTime,
        endTime: change.newEndTime ?? item.endTime,
        spaceId: change.newSpaceId ?? item.spaceId,
        employeeId: change.newEmployeeId ?? item.employeeId,
        taskTypeId: change.newTaskTypeId ?? item.taskTypeId,
      }
      : item,
  );

  const originalAnalysis = analyzeWorkforce({ ...input, scheduleItems: originalSchedule });
  const simulatedAnalysis = analyzeWorkforce({ ...input, scheduleItems: simulatedSchedule });

  return {
    originalAnalysis,
    simulatedAnalysis,
    ...compareAnalysisResults(originalAnalysis, simulatedAnalysis),
  };
}

export function buildInitialSimulationFromFinding(
  finding: AnalysisFinding | undefined,
  scheduleItems: WeeklyScheduleItem[],
  spaces: Space[],
): SimulationChange | undefined {
  const scheduleItemId = finding?.affectedScheduleItemIds[0];
  const item = scheduleItems.find((row) => row.id === scheduleItemId);
  if (!item) return undefined;

  const alternativeSpace = spaces.find((space) => {
    if (!space.isActive || space.id === item.spaceId) return false;
    if (finding?.suggestedFixType === "change-space" || finding?.suggestedFixType === "move") {
      return space.distractionLevel.includes("کم") || space.normalCapacity > 1 || space.soloWorkAllowed;
    }
    return true;
  });

  return {
    scheduleItemId: item.id,
    newDayOfWeek: item.day,
    newStartTime: item.startTime,
    newEndTime: item.endTime,
    newSpaceId: alternativeSpace?.id ?? item.spaceId,
    newEmployeeId: item.employeeId,
    newTaskTypeId: item.taskTypeId,
  };
}
