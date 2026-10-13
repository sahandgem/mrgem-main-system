import type {
  AnalysisFinding,
  AnalysisRule,
  AnalysisSettings,
  AnalysisSeverity,
  Employee,
  Space,
  SpaceOccupancySnapshot,
  TaskType,
  WeeklyAnalysisResult,
  WeeklyScheduleItem,
  WorkCompatibilityRule,
  WorkDay,
} from "../models/workforce";
import { weekDays } from "../models/workforce";
import { normalizeAnalysisSettings } from "../services/analysisSettingsService";
import { durationHours, isNearInTime, minutesToTime, overlaps, overlapWindow, timeToMinutes } from "./timeUtils";

type AnalyzerInput = {
  spaces: Space[];
  employees: Employee[];
  taskTypes: TaskType[];
  scheduleItems: WeeklyScheduleItem[];
  rules: AnalysisRule[];
  settings?: AnalysisSettings;
  compatibilityRules?: WorkCompatibilityRule[];
};

type AnalyzerOutput = WeeklyAnalysisResult & {
  occupancySnapshots: SpaceOccupancySnapshot[];
};

function scoreImpact(severity: AnalysisSeverity, settings: AnalysisSettings) {
  if (severity === "ok") return 0;
  return settings.riskImpact[severity];
}

function activeRule(rules: AnalysisRule[], key: string) {
  return rules.find((rule) => rule.key === key && rule.isActive);
}

function isHigh(value: string) {
  return value.includes("زیاد") || value.includes("ط²غŒط§ط¯");
}

function isMedium(value: string) {
  return value.includes("متوسط") || value.includes("ظ…طھظˆط³ط·");
}

function isSalesSpace(space: Space) {
  return `${space.name} ${space.type}`.includes("فروش") || `${space.name} ${space.type}`.includes("ظپط±ظˆط´");
}

function isDirty(space: Space, task?: TaskType) {
  const text = `${space.name} ${space.type} ${space.description} ${task?.name ?? ""} ${task?.category ?? ""} ${task?.description ?? ""}`;
  return text.includes("کثیف") || text.includes("ع©ط«غŒظپ") || text.toLowerCase().includes("dirty");
}

function isClean(task?: TaskType, space?: Space) {
  const text = `${task?.name ?? ""} ${task?.category ?? ""} ${task?.description ?? ""} ${space?.name ?? ""} ${space?.type ?? ""}`;
  return Boolean(task?.needsCleanSpace) || text.includes("تمیز") || text.includes("طھظ…غŒط²") || text.toLowerCase().includes("clean");
}

function finding(params: Omit<AnalysisFinding, "id" | "scoreImpact">, settings: AnalysisSettings): AnalysisFinding {
  return {
    ...params,
    id: `${params.ruleId}-${params.affectedScheduleItemIds.join("-") || params.affectedSpaceIds.join("-") || params.affectedEmployeeIds.join("-")}-${params.dayOfWeek ?? "week"}-${params.startTime ?? "all"}`,
    scoreImpact: scoreImpact(params.severity, settings),
    evidence: params.evidence ?? params.description,
    whyItHappened: params.whyItHappened ?? params.title,
    suggestedFixType: params.suggestedFixType ?? "review",
  };
}

function activeRows(input: AnalyzerInput) {
  return {
    spaces: input.spaces.filter((item) => item.isActive),
    employees: input.employees.filter((item) => item.isActive),
    taskTypes: input.taskTypes.filter((item) => item.isActive),
    scheduleItems: input.scheduleItems.filter((item) => item.isActive),
  };
}

function buildOccupancy(input: AnalyzerInput): SpaceOccupancySnapshot[] {
  const { spaces, scheduleItems } = activeRows(input);
  const snapshots: SpaceOccupancySnapshot[] = [];

  for (const space of spaces) {
    for (const day of weekDays) {
      const dayItems = scheduleItems.filter((item) => item.spaceId === space.id && item.day === day);
      const checkpoints = Array.from(new Set(dayItems.flatMap((item) => [item.startTime, item.endTime]))).sort();

      for (let index = 0; index < checkpoints.length - 1; index += 1) {
        const startTime = checkpoints[index];
        const endTime = checkpoints[index + 1];
        const employeeCount = dayItems.filter((item) => timeToMinutes(item.startTime) < timeToMinutes(endTime) && timeToMinutes(startTime) < timeToMinutes(item.endTime)).length;
        if (!employeeCount) continue;

        const status: AnalysisSeverity =
          employeeCount > space.maxCapacity ? "critical" : employeeCount > space.normalCapacity ? "warning" : "ok";

        snapshots.push({
          spaceId: space.id,
          dayOfWeek: day as WorkDay,
          startTime,
          endTime,
          employeeCount,
          normalCapacity: space.normalCapacity,
          maxCapacity: space.maxCapacity,
          status,
        });
      }
    }
  }

  return snapshots;
}

function capacityFindings(input: AnalyzerInput, snapshots: SpaceOccupancySnapshot[], settings: AnalysisSettings): AnalysisFinding[] {
  const rule = activeRule(input.rules, "space-capacity");
  if (!rule) return [];
  return snapshots
    .filter((snapshot) => snapshot.status === "warning" || snapshot.status === "critical")
    .map((snapshot) => {
      const items = input.scheduleItems.filter(
        (item) =>
          item.isActive &&
          item.spaceId === snapshot.spaceId &&
          item.day === snapshot.dayOfWeek &&
          timeToMinutes(item.startTime) < timeToMinutes(snapshot.endTime) &&
          timeToMinutes(snapshot.startTime) < timeToMinutes(item.endTime),
      );
      const space = input.spaces.find((item) => item.id === snapshot.spaceId);
      return finding({
        ruleId: rule.id,
        severity: snapshot.status,
        title: snapshot.status === "critical" ? "ظرفیت فضا بحرانی است" : "ظرفیت فضا نیازمند توجه است",
        description: `${space?.name ?? "فضا"} در این بازه ${snapshot.employeeCount} نفر دارد.`,
        affectedEmployeeIds: items.map((item) => item.employeeId),
        affectedSpaceIds: [snapshot.spaceId],
        affectedScheduleItemIds: items.map((item) => item.id),
        dayOfWeek: snapshot.dayOfWeek,
        startTime: snapshot.startTime,
        endTime: snapshot.endTime,
        recommendation: "ظرفیت این فضا پر شده؛ یک نفر را جابه‌جا کن.",
      }, settings);
    });
}

function focusFindings(input: AnalyzerInput, settings: AnalysisSettings): AnalysisFinding[] {
  const rule = activeRule(input.rules, "focus");
  if (!rule) return [];
  const findings: AnalysisFinding[] = [];

  for (const item of input.scheduleItems.filter((row) => row.isActive)) {
    const task = input.taskTypes.find((row) => row.id === item.taskTypeId);
    const space = input.spaces.find((row) => row.id === item.spaceId);
    if (!task || !space || !isHigh(task.focusNeed)) continue;

    const severity: AnalysisSeverity = isHigh(space.distractionLevel) ? "critical" : isMedium(space.distractionLevel) ? "warning" : "ok";
    if (severity === "ok") continue;

    findings.push(finding({
      ruleId: rule.id,
      severity,
      title: "کار تمرکزی در فضای پرتردد",
      description: `${task.name} با نیاز تمرکز بالا در ${space.name} قرار گرفته است.`,
      affectedEmployeeIds: [item.employeeId],
      affectedSpaceIds: [item.spaceId],
      affectedScheduleItemIds: [item.id],
      dayOfWeek: item.day,
      startTime: item.startTime,
      endTime: item.endTime,
      recommendation: "این کار را به فضای آرام‌تر منتقل کن.",
    }, settings));
  }

  return findings;
}

function safetyFindings(input: AnalyzerInput, snapshots: SpaceOccupancySnapshot[], settings: AnalysisSettings): AnalysisFinding[] {
  const rule = activeRule(input.rules, "basement-safety");
  if (!rule) return [];
  return snapshots
    .filter((snapshot) => snapshot.employeeCount === 1)
    .flatMap((snapshot) => {
      const space = input.spaces.find((row) => row.id === snapshot.spaceId);
      if (!space || (!space.requiresCompanion && space.soloWorkAllowed)) return [];
      const items = input.scheduleItems.filter(
        (item) =>
          item.isActive &&
          item.spaceId === snapshot.spaceId &&
          item.day === snapshot.dayOfWeek &&
          timeToMinutes(item.startTime) < timeToMinutes(snapshot.endTime) &&
          timeToMinutes(snapshot.startTime) < timeToMinutes(item.endTime),
      );
      return [finding({
        ruleId: rule.id,
        severity: "critical",
        title: "فضای نیازمند همراه تنها مانده",
        description: `${space.name} در این بازه فقط یک نفر دارد.`,
        affectedEmployeeIds: items.map((item) => item.employeeId),
        affectedSpaceIds: [space.id],
        affectedScheduleItemIds: items.map((item) => item.id),
        dayOfWeek: snapshot.dayOfWeek,
        startTime: snapshot.startTime,
        endTime: snapshot.endTime,
        recommendation: "برای این بازه یک نفر همراه اضافه کن.",
      }, settings)];
    });
}

function storeCoverageFindings(input: AnalyzerInput, settings: AnalysisSettings): AnalysisFinding[] {
  const rule = activeRule(input.rules, "store-coverage");
  if (!rule) return [];
  const storeSpaces = input.spaces.filter((space) => space.isActive && isSalesSpace(space));
  if (!storeSpaces.length) return [];
  const findings: AnalysisFinding[] = [];
  const startHour = timeToMinutes(settings.storeWorkingHours.startTime) / 60;
  const endHour = timeToMinutes(settings.storeWorkingHours.endTime) / 60;

  for (const day of weekDays) {
    for (let hour = startHour; hour < endHour; hour += 1) {
      const startTime = minutesToTime(hour * 60);
      const endTime = minutesToTime((hour + 1) * 60);
      const items = input.scheduleItems.filter(
        (item) =>
          item.isActive &&
          item.day === day &&
          storeSpaces.some((space) => space.id === item.spaceId) &&
          timeToMinutes(item.startTime) < timeToMinutes(endTime) &&
          timeToMinutes(startTime) < timeToMinutes(item.endTime),
      );
      const salesEmployees = items
        .map((item) => input.employees.find((employee) => employee.id === item.employeeId))
        .filter((employee): employee is Employee => Boolean(employee?.isActive && employee.goodForSales));

      if (!items.length || !salesEmployees.length) {
        findings.push(finding({
          ruleId: rule.id,
          severity: items.length ? "warning" : "critical",
          title: items.length ? "فروشگاه بدون نیروی مناسب فروش" : "پوشش فروشگاه خالی است",
          description: items.length ? "در فروشگاه نیرو هست، اما مناسب فروش ثبت نشده است." : "در این بازه برای فروشگاه برنامه‌ای ثبت نشده است.",
          affectedEmployeeIds: items.map((item) => item.employeeId),
          affectedSpaceIds: storeSpaces.map((space) => space.id),
          affectedScheduleItemIds: items.map((item) => item.id),
          dayOfWeek: day as WorkDay,
          startTime,
          endTime,
          recommendation: "یک فروشنده در فروشگاه قرار بده.",
        }, settings));
      }
    }
  }

  return findings;
}

function cleanDirtyFindings(input: AnalyzerInput, settings: AnalysisSettings): AnalysisFinding[] {
  const rule = activeRule(input.rules, "clean-dirty-conflict");
  if (!rule) return [];
  const items = input.scheduleItems.filter((item) => item.isActive);
  const findings: AnalysisFinding[] = [];

  for (let index = 0; index < items.length; index += 1) {
    for (let otherIndex = index + 1; otherIndex < items.length; otherIndex += 1) {
      const a = items[index];
      const b = items[otherIndex];
      const taskA = input.taskTypes.find((task) => task.id === a.taskTypeId);
      const taskB = input.taskTypes.find((task) => task.id === b.taskTypeId);
      const spaceA = input.spaces.find((space) => space.id === a.spaceId);
      const spaceB = input.spaces.find((space) => space.id === b.spaceId);
      if (!spaceA || !spaceB) continue;

      const mixed = (isClean(taskA, spaceA) && isDirty(spaceB, taskB)) || (isClean(taskB, spaceB) && isDirty(spaceA, taskA));
      if (!mixed) continue;

      const sameOrOverlapping = a.spaceId === b.spaceId && overlaps(a, b);
      const near = isNearInTime(a, b, settings.cleanDirtyNearMinutes);
      if (!sameOrOverlapping && !near) continue;

      const window = sameOrOverlapping ? overlapWindow([a, b]) : { startTime: a.startTime < b.startTime ? a.startTime : b.startTime, endTime: a.endTime > b.endTime ? a.endTime : b.endTime };
      findings.push(finding({
        ruleId: rule.id,
        severity: sameOrOverlapping ? "critical" : "warning",
        title: sameOrOverlapping ? "تداخل کار تمیز و کثیف" : "نزدیکی زمانی کار تمیز و کثیف",
        description: "دو فعالیت ناسازگار در زمان یا فضای نزدیک قرار گرفته‌اند.",
        affectedEmployeeIds: [a.employeeId, b.employeeId],
        affectedSpaceIds: Array.from(new Set([a.spaceId, b.spaceId])),
        affectedScheduleItemIds: [a.id, b.id],
        dayOfWeek: a.day,
        startTime: window.startTime,
        endTime: window.endTime,
        recommendation: "این دو کار را در زمان یا فضای جدا قرار بده.",
      }, settings));
    }
  }

  return findings;
}

function focusConflictFindings(input: AnalyzerInput, settings: AnalysisSettings): AnalysisFinding[] {
  const rule = activeRule(input.rules, "focus-conflict");
  if (!rule) return [];
  const items = input.scheduleItems.filter((item) => item.isActive);
  const findings: AnalysisFinding[] = [];

  for (const space of input.spaces.filter((item) => item.isActive)) {
    for (const day of weekDays) {
      const focusItems = items.filter((item) => {
        const task = input.taskTypes.find((row) => row.id === item.taskTypeId);
        return item.spaceId === space.id && item.day === day && task && isHigh(task.focusNeed);
      });
      for (let index = 0; index < focusItems.length; index += 1) {
        for (let otherIndex = index + 1; otherIndex < focusItems.length; otherIndex += 1) {
          const a = focusItems[index];
          const b = focusItems[otherIndex];
          if (!overlaps(a, b)) continue;
          const window = overlapWindow([a, b]);
          findings.push(finding({
            ruleId: rule.id,
            severity: space.normalCapacity <= 1 ? "critical" : "warning",
            title: "تداخل تمرکز افراد",
            description: `${space.name} هم‌زمان چند کار تمرکزی دارد.`,
            affectedEmployeeIds: [a.employeeId, b.employeeId],
            affectedSpaceIds: [space.id],
            affectedScheduleItemIds: [a.id, b.id],
            dayOfWeek: day as WorkDay,
            startTime: window.startTime,
            endTime: window.endTime,
            recommendation: "یکی از کارهای تمرکزی را به بازه یا فضای دیگر منتقل کن.",
          }, settings));
        }
      }
    }
  }

  return findings;
}

function workloadFindings(input: AnalyzerInput, settings: AnalysisSettings): AnalysisFinding[] {
  const rule = activeRule(input.rules, "workload-pressure");
  if (!rule) return [];

  return input.employees
    .filter((employee) => employee.isActive)
    .flatMap((employee) => {
      const items = input.scheduleItems.filter((item) => item.isActive && item.employeeId === employee.id);
      const hours = items.reduce((sum, item) => sum + durationHours(item), 0);
      const severity: AnalysisSeverity =
        hours > settings.workloadCriticalHours ? "critical" :
        hours > settings.workloadWarningHours ? "warning" :
        "ok";
      if (severity === "ok") return [];
      return [finding({
        ruleId: rule.id,
        severity,
        title: "فشار کاری بالا",
        description: `${employee.name} حدود ${Math.round(hours)} ساعت برنامه‌ریزی‌شده دارد.`,
        affectedEmployeeIds: [employee.id],
        affectedSpaceIds: [],
        affectedScheduleItemIds: items.map((item) => item.id),
        recommendation: "بخشی از برنامه این فرد را سبک‌تر یا توزیع کن.",
      }, settings)];
    });
}

function compatibilityFindings(input: AnalyzerInput, settings: AnalysisSettings): AnalysisFinding[] {
  const rule = activeRule(input.rules, "compatibility");
  if (!rule || !input.compatibilityRules?.length) return [];

  return input.scheduleItems
    .filter((item) => item.isActive)
    .flatMap((item) => {
      const compatibility = input.compatibilityRules?.find(
        (row) => row.isActive && row.taskTypeId === item.taskTypeId && row.spaceId === item.spaceId,
      );
      if (!compatibility || (compatibility.compatibility !== "blocked" && compatibility.compatibility !== "warning")) {
        return [];
      }

      const task = input.taskTypes.find((row) => row.id === item.taskTypeId);
      const space = input.spaces.find((row) => row.id === item.spaceId);
      const severity: AnalysisSeverity = compatibility.compatibility === "blocked" ? "critical" : "warning";

      return [finding({
        ruleId: rule.id,
        severity,
        title: compatibility.compatibility === "blocked" ? "ناسازگاری جدی کار و فضا" : "سازگاری کار و فضا نیازمند توجه است",
        description: `${task?.name ?? "نوع کار"} برای ${space?.name ?? "فضا"} مناسب نیست.`,
        affectedEmployeeIds: [item.employeeId],
        affectedSpaceIds: [item.spaceId],
        affectedScheduleItemIds: [item.id],
        dayOfWeek: item.day,
        startTime: item.startTime,
        endTime: item.endTime,
        recommendation: compatibility.compatibility === "blocked" ? "این کار را به فضای سازگار منتقل کن." : "در صورت امکان فضای مناسب‌تری انتخاب کن.",
        evidence: compatibility.reason || "در ماتریس سازگاری این ترکیب مناسب ثبت نشده است.",
        whyItHappened: "وضعیت سازگاری ثبت‌شده برای این نوع کار و فضا هشداردهنده است.",
        suggestedFixType: "change-space",
      }, settings)];
    });
}

function categoryScore(findings: AnalysisFinding[], ruleKeys: string[], rules: AnalysisRule[]) {
  const ruleIds = rules.filter((rule) => ruleKeys.includes(rule.key)).map((rule) => rule.id);
  const risk = findings.filter((findingItem) => ruleIds.includes(findingItem.ruleId)).reduce((sum, item) => sum + item.scoreImpact, 0);
  return Math.max(0, 100 - risk);
}

export function analyzeWorkforce(input: AnalyzerInput): AnalyzerOutput {
  const settings = normalizeAnalysisSettings(input.settings);
  const occupancySnapshots = buildOccupancy(input);
  const findings = [
    ...capacityFindings(input, occupancySnapshots, settings),
    ...focusFindings(input, settings),
    ...safetyFindings(input, occupancySnapshots, settings),
    ...storeCoverageFindings(input, settings),
    ...cleanDirtyFindings(input, settings),
    ...focusConflictFindings(input, settings),
    ...workloadFindings(input, settings),
    ...compatibilityFindings(input, settings),
  ].filter((item) => item.severity !== "ok");

  const totalRiskScore = findings.reduce((sum, item) => sum + item.scoreImpact, 0);
  const controlScore = Math.max(0, 100 - totalRiskScore);
  const criticalCount = findings.filter((item) => item.severity === "critical").length;
  const warningCount = findings.filter((item) => item.severity === "warning").length;
  const sortedFindings = [...findings].sort((a, b) => b.scoreImpact - a.scoreImpact);
  const mainFinding = sortedFindings[0];

  return {
    findings,
    occupancySnapshots,
    totalRiskScore,
    controlScore,
    criticalCount,
    warningCount,
    focusScore: categoryScore(findings, ["focus", "focus-conflict"], input.rules),
    salesCoverageScore: categoryScore(findings, ["store-coverage"], input.rules),
    spaceCapacityScore: categoryScore(findings, ["space-capacity"], input.rules),
    safetyScore: categoryScore(findings, ["basement-safety", "clean-dirty-conflict", "workload-pressure", "compatibility"], input.rules),
    mainProblem: mainFinding?.title ?? "مسئله مهمی در برنامه دیده نشد",
    nextBestAction: mainFinding?.recommendation ?? "برنامه فعلی را پایش کن و داده‌ها را کامل نگه دار.",
  };
}
