import type {
  AnalysisFinding,
  AnalysisRule,
  AnalysisSettings,
  Employee,
  RecommendationConfidence,
  RecommendationEffortLevel,
  RecommendationScenario,
  RecommendationScenarioType,
  SimulationChange,
  Space,
  TaskType,
  WeeklyScheduleItem,
  WorkCompatibility,
  WorkCompatibilityRule,
} from "../models/workforce";
import { normalizeAnalysisSettings } from "../services/analysisSettingsService";
import { overlaps } from "./timeUtils";
import { analyzeWorkforce } from "./workforceAnalyzer";
import { simulateScheduleChange } from "./workforceSimulator";

export type RecommendationInput = {
  spaces: Space[];
  employees: Employee[];
  taskTypes: TaskType[];
  scheduleItems: WeeklyScheduleItem[];
  rules: AnalysisRule[];
  settings?: AnalysisSettings;
  compatibilityRules?: WorkCompatibilityRule[];
};

type ScenarioDraft = {
  type: RecommendationScenarioType;
  title: string;
  description: string;
  expectedEffect: string;
  confidence?: RecommendationConfidence;
  effortLevel?: RecommendationEffortLevel;
  change?: SimulationChange;
  reason?: string;
};

const confidenceBonus: Record<RecommendationConfidence, number> = { high: 8, medium: 4, low: 0 };
const effortPenalty: Record<RecommendationEffortLevel, number> = { low: 0, medium: 4, high: 9 };
const severityRank = { critical: 4, warning: 3, info: 2, ok: 1 };

function ruleKey(finding: AnalysisFinding, rules: AnalysisRule[]) {
  return rules.find((rule) => rule.id === finding.ruleId)?.key ?? "";
}

function hasText(value: string, needles: string[]) {
  return needles.some((needle) => value.includes(needle));
}

function isLow(value: string) {
  return hasText(value, ["کم", "ع©ظ…", "low"]);
}

function isHigh(value: string) {
  return hasText(value, ["زیاد", "ط²غŒط§ط¯", "ط·آ²ط؛إ’ط·آ§ط·آ¯", "high"]);
}

function isSalesSpace(space: Space) {
  return `${space.name} ${space.type}`.includes("فروش") || `${space.name} ${space.type}`.includes("ظپط±ظˆط´") || `${space.name} ${space.type}`.includes("ط¸ظ¾ط·آ±ط¸ث†ط·آ´");
}

function activeRows(input: RecommendationInput) {
  return {
    spaces: input.spaces.filter((item) => item.isActive),
    employees: input.employees.filter((item) => item.isActive),
    taskTypes: input.taskTypes.filter((item) => item.isActive),
    scheduleItems: input.scheduleItems.filter((item) => item.isActive),
    compatibilityRules: input.compatibilityRules?.filter((item) => item.isActive) ?? [],
  };
}

function compatibilityFor(input: RecommendationInput, taskTypeId: string, spaceId: string): WorkCompatibility {
  return input.compatibilityRules?.find((rule) => rule.isActive && rule.taskTypeId === taskTypeId && rule.spaceId === spaceId)?.compatibility ?? "allowed";
}

function compatibleSpaceScore(input: RecommendationInput, taskTypeId: string, space: Space) {
  const compatibility = compatibilityFor(input, taskTypeId, space.id);
  if (compatibility === "blocked") return -100;
  if (compatibility === "warning") return -20;
  return compatibility === "preferred" ? 30 : 10;
}

function overlappingCount(input: RecommendationInput, item: WeeklyScheduleItem, spaceId: string) {
  const moved = { ...item, spaceId };
  return input.scheduleItems.filter((row) => row.isActive && row.id !== item.id && row.spaceId === spaceId && overlaps(row, moved)).length + 1;
}

function findItem(input: RecommendationInput, finding: AnalysisFinding) {
  return input.scheduleItems.find((item) => item.isActive && item.id === finding.affectedScheduleItemIds[0]);
}

function rankFromSimulation(draft: ScenarioDraft, simulationResult?: RecommendationScenario["simulationResult"]) {
  if (!simulationResult) {
    return draft.type === "no_safe_action" ? -70 : -15;
  }
  return (
    simulationResult.controlScoreDelta * 3
    - simulationResult.riskScoreDelta * 2
    - simulationResult.criticalDelta * 12
    - simulationResult.warningDelta * 5
    - simulationResult.newFindings.length * 4
    - effortPenalty[draft.effortLevel ?? "medium"]
    + confidenceBonus[draft.confidence ?? "medium"]
  );
}

function explainDelta(simulationResult?: RecommendationScenario["simulationResult"]) {
  if (!simulationResult) return "این پیشنهاد قابل شبیه سازی مستقیم نیست و باید با تصمیم مدیر بررسی شود.";
  const control = simulationResult.controlScoreDelta;
  const risk = simulationResult.riskScoreDelta;
  if (simulationResult.verdict === "improved") {
    return `امتیاز کنترل ${control >= 0 ? "+" : ""}${control} و ریسک ${risk >= 0 ? "+" : ""}${risk} تغییر می‌کند.`;
  }
  if (simulationResult.verdict === "worsened") {
    return `شبیه سازی ریسک جدید نشان می‌دهد؛ امتیاز کنترل ${control} و ریسک ${risk}.`;
  }
  return `اثر شبیه سازی خنثی است؛ کنترل ${control} و ریسک ${risk}.`;
}

function makeScenario(input: RecommendationInput, finding: AnalysisFinding, draft: ScenarioDraft): RecommendationScenario {
  const settings = normalizeAnalysisSettings(input.settings);
  const safeCompatibilityRules = input.compatibilityRules ?? [];
  const simulationResult = draft.change?.scheduleItemId
    ? simulateScheduleChange({ ...input, settings, compatibilityRules: safeCompatibilityRules }, draft.change)
    : undefined;
  const rankScore = rankFromSimulation(draft, simulationResult);
  const confidence = draft.confidence ?? (simulationResult?.verdict === "improved" ? "high" : simulationResult ? "medium" : "low");
  const canApply = Boolean(
    draft.change?.scheduleItemId &&
    simulationResult &&
    simulationResult.verdict !== "worsened" &&
    rankScore > 0 &&
    draft.type !== "no_safe_action" &&
    draft.type !== "add_support_person",
  );

  return {
    id: `${finding.id}-${draft.type}-${draft.change?.scheduleItemId ?? "manual"}-${draft.change?.newSpaceId ?? draft.change?.newEmployeeId ?? draft.change?.newStartTime ?? "review"}`,
    findingId: finding.id,
    type: draft.type,
    title: draft.title,
    description: draft.description,
    change: draft.change,
    expectedEffect: draft.expectedEffect,
    confidence,
    effortLevel: draft.effortLevel ?? "medium",
    riskLevel: simulationResult?.worsenedFindings.some((item) => item.severity === "critical") ? "critical" : finding.severity,
    simulationResult,
    rankScore,
    canApply,
    reason: draft.reason ?? explainScenarioReason({ ...draft, confidence, effortLevel: draft.effortLevel ?? "medium", simulationResult, rankScore } as RecommendationScenario),
  };
}

function manualScenario(finding: AnalysisFinding, type: RecommendationScenarioType, title: string, description: string, expectedEffect: string): RecommendationScenario {
  return {
    id: `${finding.id}-${type}-manual`,
    findingId: finding.id,
    type,
    title,
    description,
    expectedEffect,
    confidence: "low",
    effortLevel: "high",
    riskLevel: finding.severity,
    rankScore: -70,
    canApply: false,
    reason: "برای این مورد تغییر تک آیتمی امن پیدا نشد و نیازمند تصمیم مدیر است.",
  };
}

function bestSpaceForItem(input: RecommendationInput, item: WeeklyScheduleItem, options?: { focus?: boolean; safety?: boolean; freeCapacity?: boolean }) {
  const current = input.spaces.find((space) => space.id === item.spaceId);
  return activeRows(input).spaces
    .filter((space) => space.id !== item.spaceId)
    .filter((space) => compatibleSpaceScore(input, item.taskTypeId, space) >= 0)
    .filter((space) => !options?.safety || (!space.requiresCompanion && space.soloWorkAllowed))
    .filter((space) => !options?.focus || !isHigh(space.distractionLevel))
    .filter((space) => !options?.freeCapacity || overlappingCount(input, item, space.id) <= space.maxCapacity)
    .sort((a, b) => {
      const focusScore = (isLow(b.distractionLevel) ? 20 : 0) - (isLow(a.distractionLevel) ? 20 : 0);
      const compatScore = compatibleSpaceScore(input, item.taskTypeId, b) - compatibleSpaceScore(input, item.taskTypeId, a);
      const capacityScore = b.maxCapacity - overlappingCount(input, item, b.id) - (a.maxCapacity - overlappingCount(input, item, a.id));
      const currentPenalty = current && a.type === current.type ? 1 : 0;
      return compatScore + focusScore + capacityScore + currentPenalty;
    })[0];
}

export function buildScenarioFromCapacityFinding(input: RecommendationInput, finding: AnalysisFinding): RecommendationScenario[] {
  const item = findItem(input, finding);
  if (!item) return [manualScenario(finding, "move_time", "کاهش هم پوشانی ظرفیت", "آیتم مشخصی برای جابه جایی مستقیم پیدا نشد.", "کاهش فشار ظرفیت با تغییر زمان یا توزیع کار")];
  const target = bestSpaceForItem(input, item, { freeCapacity: true });
  if (!target) return [manualScenario(finding, "move_time", "تغییر زمان برای کاهش ظرفیت", "فضای جایگزین آزاد و سازگار پیدا نشد.", "کم کردن هم زمانی افراد در فضای پر")];
  return [makeScenario(input, finding, {
    type: "move_space",
    title: `انتقال یک آیتم به ${target.name}`,
    description: "یک آیتم درگیر ظرفیت به فضای خلوت تر منتقل می‌شود.",
    expectedEffect: "کاهش فشار ظرفیت و ریسک هم پوشانی",
    confidence: "medium",
    effortLevel: "low",
    change: { scheduleItemId: item.id, newSpaceId: target.id },
  })];
}

export function buildScenarioFromFocusFinding(input: RecommendationInput, finding: AnalysisFinding): RecommendationScenario[] {
  const item = findItem(input, finding);
  if (!item) return [manualScenario(finding, "no_safe_action", "نیاز به فضای تمرکز", "آیتم برنامه برای انتقال مستقیم پیدا نشد.", "تعریف یا آزاد کردن فضای تمرکز")];
  const target = bestSpaceForItem(input, item, { focus: true, freeCapacity: true });
  if (!target) return [manualScenario(finding, "no_safe_action", "فضای آرام کافی نیست", "فضای کم حواس پرتی و سازگار برای این بازه پیدا نشد.", "نیاز به تعریف فضای تمرکز یا تغییر زمان")];
  return [makeScenario(input, finding, {
    type: "move_space",
    title: `انتقال کار تمرکزی به ${target.name}`,
    description: "کار تمرکزی از فضای پرتردد به فضای آرام تر منتقل می‌شود.",
    expectedEffect: "بهبود امتیاز تمرکز و کاهش ریسک تداخل تمرکز",
    confidence: isLow(target.distractionLevel) ? "high" : "medium",
    effortLevel: "low",
    change: { scheduleItemId: item.id, newSpaceId: target.id },
  })];
}

export function buildScenarioFromSafetyFinding(input: RecommendationInput, finding: AnalysisFinding): RecommendationScenario[] {
  const item = findItem(input, finding);
  if (!item) return [manualScenario(finding, "add_support_person", "افزودن همراه ایمنی", "برای این بازه باید حضور همراه بررسی شود.", "رفع ریسک تنها ماندن")];
  const target = bestSpaceForItem(input, item, { safety: true, freeCapacity: true });
  const scenarios = [
    manualScenario(finding, "add_support_person", "افزودن همراه در همان بازه", "یک نفر همراه در همین فضا و بازه زمانی اضافه شود.", "رفع ریسک فضای نیازمند همراه"),
  ];
  if (!target) return scenarios;
  return [
    makeScenario(input, finding, {
      type: "move_space",
      title: `انتقال به فضای امن تر ${target.name}`,
      description: "آیتم تنها از فضای نیازمند همراه به فضای مجاز برای کار تک نفره منتقل می‌شود.",
      expectedEffect: "کاهش ریسک ایمنی بدون ساخت آیتم جدید",
      confidence: "medium",
      effortLevel: "low",
      change: { scheduleItemId: item.id, newSpaceId: target.id },
    }),
    ...scenarios,
  ];
}

export function buildScenarioFromSalesCoverageFinding(input: RecommendationInput, finding: AnalysisFinding): RecommendationScenario[] {
  const store = activeRows(input).spaces.find(isSalesSpace);
  if (!store || !finding.dayOfWeek || !finding.startTime || !finding.endTime) {
    return [manualScenario(finding, "add_support_person", "افزودن شیفت فروش", "برای این هشدار باید شیفت فروش مستقل تعریف شود.", "پوشش فروشگاه")];
  }
  const candidateItem = activeRows(input).scheduleItems.find((item) => {
    const employee = input.employees.find((row) => row.id === item.employeeId);
    return employee?.goodForSales && item.day === finding.dayOfWeek && overlaps(item, { day: finding.dayOfWeek!, startTime: finding.startTime!, endTime: finding.endTime! }) && item.spaceId !== store.id;
  });
  if (!candidateItem) {
    return [manualScenario(finding, "add_support_person", "افزودن شیفت فروش", "نیروی فروش قابل انتقال در همان بازه پیدا نشد.", "پوشش فروشگاه با تصمیم مدیر")];
  }
  return [makeScenario(input, finding, {
    type: "move_space",
    title: `انتقال نیروی فروش به ${store.name}`,
    description: "یک آیتم فروش پذیر در همان بازه به فضای فروشگاه منتقل می‌شود.",
    expectedEffect: "کاهش هشدار پوشش فروشگاه",
    confidence: "medium",
    effortLevel: "medium",
    change: { scheduleItemId: candidateItem.id, newSpaceId: store.id },
  })];
}

export function buildScenarioFromCompatibilityFinding(input: RecommendationInput, finding: AnalysisFinding): RecommendationScenario[] {
  const item = findItem(input, finding);
  if (!item) return [manualScenario(finding, "no_safe_action", "بازبینی سازگاری", "آیتم برنامه برای اصلاح مستقیم پیدا نشد.", "انتخاب فضای مجاز")];
  const targets = activeRows(input).spaces
    .filter((space) => space.id !== item.spaceId)
    .filter((space) => ["preferred", "allowed"].includes(compatibilityFor(input, item.taskTypeId, space.id)))
    .filter((space) => overlappingCount(input, item, space.id) <= space.maxCapacity)
    .sort((a, b) => compatibleSpaceScore(input, item.taskTypeId, b) - compatibleSpaceScore(input, item.taskTypeId, a));
  const target = targets[0];
  if (!target) return [manualScenario(finding, "no_safe_action", "فضای سازگار پیدا نشد", "برای این نوع کار فضای مجاز یا ترجیحی خالی وجود ندارد.", "بازبینی ماتریس سازگاری یا زمان بندی")];
  return [makeScenario(input, finding, {
    type: "move_space",
    title: `انتقال به فضای سازگار ${target.name}`,
    description: "آیتم ناسازگار به یک فضای مجاز یا ترجیحی منتقل می‌شود.",
    expectedEffect: "رفع هشدار سازگاری کار و فضا",
    confidence: compatibilityFor(input, item.taskTypeId, target.id) === "preferred" ? "high" : "medium",
    effortLevel: "low",
    change: { scheduleItemId: item.id, newSpaceId: target.id },
  })];
}

export function generateRecommendationScenarios(input: RecommendationInput, finding: AnalysisFinding): RecommendationScenario[] {
  const key = ruleKey(finding, input.rules);
  if (key === "space-capacity") return buildScenarioFromCapacityFinding(input, finding);
  if (key === "focus" || key === "focus-conflict") return buildScenarioFromFocusFinding(input, finding);
  if (key === "basement-safety") return buildScenarioFromSafetyFinding(input, finding);
  if (key === "store-coverage") return buildScenarioFromSalesCoverageFinding(input, finding);
  if (key === "compatibility") return buildScenarioFromCompatibilityFinding(input, finding);
  return [manualScenario(finding, "keep_but_warn", "نیازمند بررسی مدیر", "برای این قانون پیشنهاد تک مرحله‌ای امن ساخته نشد.", "پایش و تصمیم دستی")];
}

export function rankRecommendationScenarios(scenarios: RecommendationScenario[]) {
  return [...scenarios].sort((a, b) =>
    b.rankScore - a.rankScore ||
    severityRank[b.riskLevel] - severityRank[a.riskLevel] ||
    confidenceBonus[b.confidence] - confidenceBonus[a.confidence],
  );
}

export function getBestScenarioForFinding(input: RecommendationInput, finding: AnalysisFinding) {
  return rankRecommendationScenarios(generateRecommendationScenarios(input, finding))[0];
}

export function getBestScenariosForWeek(input: RecommendationInput, limit = 12) {
  const analysis = analyzeWorkforce({ ...input, settings: normalizeAnalysisSettings(input.settings), compatibilityRules: input.compatibilityRules ?? [] });
  return rankRecommendationScenarios(
    analysis.findings
      .filter((finding) => finding.severity === "critical" || finding.severity === "warning")
      .flatMap((finding) => generateRecommendationScenarios(input, finding)),
  ).slice(0, limit);
}

export function explainScenarioReason(scenario: RecommendationScenario) {
  const simulation = scenario.simulationResult;
  if (!simulation) return scenario.reason || "این سناریو نیازمند تصمیم مدیر است و به صورت تک آیتمی اعمال نمی‌شود.";
  const resolved = simulation.resolvedFindings.length;
  const newWarnings = simulation.newFindings.length;
  return [
    explainDelta(simulation),
    resolved ? `${resolved} هشدار حل می‌شود.` : "هشدار حل شده قطعی ندارد.",
    newWarnings ? `${newWarnings} هشدار تازه ممکن است ایجاد شود.` : "هشدار تازه مهمی ایجاد نمی‌شود.",
    `اعتماد ${scenario.confidence} و هزینه اجرا ${scenario.effortLevel}.`,
  ].join(" ");
}
