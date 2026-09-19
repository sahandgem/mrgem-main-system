import type { CommandCenterAttentionItem, CommandCenterModuleSummary, CommandCenterReliabilityState } from "../../integration/commandCenter/commandCenterViewModel";

// Presentation copy only: never changes ranking, thresholds or source data.
const summaries: Readonly<Record<string, { title: string; impact: string }>> = {
  "mock:workforce:schedule-conflict": { title: "تعارض عملیاتی در برنامه نمونه", impact: "ریسک اجرا یا ایمنی برنامه" },
  workforce_schedule_coverage: { title: "پوشش ناکافی برنامه", impact: "احتمال باقی‌ماندن کار بدون پوشش" },
  workforce_capacity_concentration: { title: "تمرکز فشار کاری", impact: "آسیب‌پذیری ظرفیت با اتکا به یک نقش" },
  "mock:production:work-order": { title: "سفارش آزمایشی در معرض تأخیر", impact: "ریسک موعد تولید و تحویل؛ آزمایشی" },
  production_plan_attainment: { title: "فاصله با برنامه تولید نمونه", impact: "احتمال عقب‌ماندگی تولید؛ آزمایشی" },
};

export function attentionSummary(item: CommandCenterAttentionItem) {
  return summaries[item.sourceRef ?? ""] ?? { title: item.title, impact: item.businessImpact };
}

export function changeImpact(key: string) {
  return summaries[key]?.impact ?? "اثر نیازمند بررسی";
}

export function reliabilityText(value: CommandCenterReliabilityState) {
  if (value === "fresh") return "داده تازه";
  if (value === "stale_last_known_good") return "آخرین داده سالم؛ تاریخی";
  if (value === "degraded") return "داده ناقص؛ با احتیاط";
  return "داده معتبر موجود نیست";
}

export function hasDisplayData(module?: CommandCenterModuleSummary) {
  return !!module && (module.reliability === "fresh" || module.reliability === "degraded" || module.hasLastKnownGood);
}

export function visibleCount(count: number, module?: CommandCenterModuleSummary) {
  if (!hasDisplayData(module)) return undefined;
  // Missing/partial coverage must not imply a confirmed absence of exceptions.
  return count === 0 && module?.isPartialData ? undefined : count;
}
