import type {
  BaselineDriftLevel,
  DriftTrendPoint,
  OperationalHistoryEvent,
  OperationalHistoryReport,
} from "../models/workforce";
import { createId, nowIso, toPersianNumber } from "../models/workforce";

function driftLevel(value: unknown): BaselineDriftLevel {
  return value === "low" || value === "medium" || value === "high" || value === "critical" ? value : "none";
}

export function buildDriftTrend(events: OperationalHistoryEvent[]): DriftTrendPoint[] {
  return events
    .filter((event) => event.type === "drift_report")
    .map((event) => ({
      id: event.relatedId || event.id,
      generatedAt: String(event.metadata.generatedAt ?? event.occurredAt),
      driftScore: Number(event.metadata.driftScore ?? 0),
      driftLevel: driftLevel(event.metadata.driftLevel),
      requiresResignoff: Boolean(event.metadata.requiresResignoff),
      baselineChecksum: String(event.metadata.baselineChecksum ?? ""),
      currentChecksum: String(event.metadata.currentChecksum ?? event.checksum),
    }))
    .sort((a, b) => a.generatedAt.localeCompare(b.generatedAt));
}

export function detectIncreasingDriftTrend(points: DriftTrendPoint[]) {
  if (points.length < 2) return false;
  const recent = points.slice(-4);
  const first = recent[0].driftScore;
  const last = recent[recent.length - 1].driftScore;
  const upwardSteps = recent.slice(1).filter((point, index) => point.driftScore > recent[index].driftScore).length;
  return last > first && upwardSteps >= Math.ceil((recent.length - 1) / 2);
}

export function findCriticalOperationalEvents(events: OperationalHistoryEvent[]) {
  return events.filter((event) => event.severity === "critical" || event.severity === "high");
}

export function generateOperationalHistoryRecommendation(points: DriftTrendPoint[], events: OperationalHistoryEvent[]) {
  if (detectIncreasingDriftTrend(points)) return "روند drift رو به افزایش است؛ تغییرات جدید را بررسی و در صورت نیاز بازتأیید کنید.";
  if (points.at(-1)?.requiresResignoff) return "آخرین drift نیازمند بازتأیید عملیاتی است.";
  if (findCriticalOperationalEvents(events).length) return "رویدادهای مهم را مرور کنید و یادداشت مدیریتی را تکمیل نگه دارید.";
  return "روند عملیاتی پایدار است؛ ثبت دوره‌ای drift را ادامه دهید.";
}

export function calculateOperationalHistorySummary(events: OperationalHistoryEvent[]): OperationalHistoryReport {
  const ordered = [...events].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
  const driftTrend = buildDriftTrend(ordered);
  const resignoffCount = ordered.filter((event) => event.type === "resignoff_signed").length;
  const baselineChangeCount = ordered.filter((event) => event.type === "baseline_changed").length;
  const criticalEventCount = findCriticalOperationalEvents(ordered).length;
  return {
    id: createId("operational-history"),
    generatedAt: nowIso(),
    events: ordered,
    driftTrend,
    resignoffCount,
    baselineChangeCount,
    criticalEventCount,
    summary: `${toPersianNumber(ordered.length)} رویداد، ${toPersianNumber(resignoffCount)} بازتأیید و ${toPersianNumber(baselineChangeCount)} تغییر baseline ثبت شده است.`,
    recommendedAction: generateOperationalHistoryRecommendation(driftTrend, ordered),
  };
}
