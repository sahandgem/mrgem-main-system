import type {
  BaselineDriftLevel,
  HistoryRetentionIssue,
  HistoryRetentionPolicy,
  HistoryRetentionReport,
  HistoryRetentionStatus,
  OperationalHistoryArchive,
  OperationalHistoryEvent,
  WorkforceSnapshot,
} from "../models/workforce";
import { createId, nowIso, toPersianNumber } from "../models/workforce";

export interface HistoryRetentionInput {
  events: OperationalHistoryEvent[];
  archives: OperationalHistoryArchive[];
  snapshots: WorkforceSnapshot[];
  policy: HistoryRetentionPolicy;
  currentDriftLevel?: BaselineDriftLevel;
  now?: string;
}

const DAY_MS = 86400000;
const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

function ageDays(date: string, now: string) {
  return Math.max(0, (new Date(now).getTime() - new Date(date).getTime()) / DAY_MS);
}

export function getDefaultHistoryRetentionPolicy(): HistoryRetentionPolicy {
  const timestamp = nowIso();
  return {
    id: "history-retention-default",
    keepRecentDays: 30,
    archiveAfterDays: 60,
    criticalKeepDays: 180,
    driftReviewAfterDays: 14,
    resignoffExpiresAfterDays: 90,
    maxEventsBeforeWarning: 500,
    autoArchiveSuggestionEnabled: true,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function detectArchiveCandidates(events: OperationalHistoryEvent[], policy: HistoryRetentionPolicy, now = nowIso()) {
  return clone(events).filter((event) => {
    const age = ageDays(event.occurredAt, now);
    const isCritical = event.severity === "critical" || event.severity === "high";
    return isCritical ? age > policy.criticalKeepDays : age > policy.archiveAfterDays;
  });
}

export function detectStaleDriftEvents(events: OperationalHistoryEvent[], policy: HistoryRetentionPolicy, now = nowIso()) {
  const resignoffDates = events.filter((event) => event.type === "resignoff_signed").map((event) => event.occurredAt);
  return clone(events).filter((event) => {
    if (event.type !== "drift_report") return false;
    const important = Boolean(event.metadata.requiresResignoff) || event.severity === "high" || event.severity === "critical";
    if (!important || ageDays(event.occurredAt, now) <= policy.driftReviewAfterDays) return false;
    return !resignoffDates.some((date) => date > event.occurredAt);
  });
}

export function detectExpiredResignoffs(events: OperationalHistoryEvent[], policy: HistoryRetentionPolicy, now = nowIso()) {
  const signoffs = events
    .filter((event) => event.type === "resignoff_signed" || event.type === "launch_signoff_signed")
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
  const latest = signoffs[0];
  return latest && ageDays(latest.occurredAt, now) > policy.resignoffExpiresAfterDays ? [clone(latest)] : [];
}

export function detectHistoryTooLarge(events: OperationalHistoryEvent[], policy: HistoryRetentionPolicy) {
  return events.length > policy.maxEventsBeforeWarning;
}

export function detectNoRecentArchive(archives: OperationalHistoryArchive[], policy: HistoryRetentionPolicy, now = nowIso()) {
  const latest = [...archives].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  return !latest || ageDays(latest.createdAt, now) > policy.archiveAfterDays;
}

export function detectNoRecentSnapshot(snapshots: WorkforceSnapshot[], policy: HistoryRetentionPolicy, now = nowIso()) {
  const latest = [...snapshots].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  return !latest || ageDays(latest.createdAt, now) > policy.keepRecentDays;
}

function issue(type: HistoryRetentionIssue["type"], severity: HistoryRetentionIssue["severity"], title: string, description: string, recommendation: string, relatedEventId?: string): HistoryRetentionIssue {
  return { id: createId("retention-issue"), type, severity, title, description, relatedEventId, relatedPath: "/organization/workforce-dashboard/history-retention", recommendation, createdAt: nowIso() };
}

export function calculateHistoryRetentionStatus(issues: HistoryRetentionIssue[]): HistoryRetentionStatus {
  if (issues.some((item) => item.severity === "critical")) return "risky";
  if (issues.some((item) => item.type === "stale_drift" || item.type === "expired_resignoff" || item.type === "no_recent_snapshot")) return "needs_review";
  if (issues.some((item) => item.type === "history_too_large" || item.type === "archive_recommended" || item.type === "no_recent_archive")) return "needs_archive";
  return "healthy";
}

export function generateRetentionRecommendations(issues: HistoryRetentionIssue[]) {
  const recommendations = Array.from(new Set(issues.map((item) => item.recommendation)));
  return recommendations.length ? recommendations.slice(0, 6) : ["History منظم است؛ پایش دوره‌ای را ادامه دهید."];
}

export function buildHistoryRetentionReport(input: HistoryRetentionInput): HistoryRetentionReport {
  const events = clone(input.events);
  const archives = clone(input.archives);
  const snapshots = clone(input.snapshots);
  const now = input.now ?? nowIso();
  const candidates = detectArchiveCandidates(events, input.policy, now);
  const staleDrifts = detectStaleDriftEvents(events, input.policy, now);
  const expiredResignoffs = detectExpiredResignoffs(events, input.policy, now);
  const criticalEvents = events.filter((event) => event.severity === "high" || event.severity === "critical");
  const issues: HistoryRetentionIssue[] = [];

  if (detectHistoryTooLarge(events, input.policy)) issues.push(issue("history_too_large", "high", "History بزرگ شده است", `${toPersianNumber(events.length)} رویداد از سقف سیاست بیشتر است.`, "یک archive بسازید و سپس cleanup امن انجام دهید."));
  staleDrifts.forEach((event) => issues.push(issue("stale_drift", input.currentDriftLevel === "high" || input.currentDriftLevel === "critical" ? "critical" : "high", "Drift قدیمی بدون بازتأیید", `رویداد ${event.title} هنوز بازتأیید بعدی ندارد.`, "Drift را بررسی و نتیجه را بازتأیید کنید.", event.id)));
  expiredResignoffs.forEach((event) => issues.push(issue("expired_resignoff", input.currentDriftLevel === "medium" || input.currentDriftLevel === "high" || input.currentDriftLevel === "critical" ? "critical" : "high", "بازتأیید نیازمند مرور است", `آخرین تأیید توسط ${event.actorName} از بازه سیاست عبور کرده است.`, "وضعیت فعلی را مرور و baseline را بازتأیید کنید.", event.id)));
  if (detectNoRecentArchive(archives, input.policy, now) && candidates.length > 0) issues.push(issue("no_recent_archive", "medium", "Archive تازه وجود ندارد", "آخرین archive ثبت نشده یا قدیمی است.", "از رویدادهای واجد شرایط archive بسازید."));
  if (detectNoRecentSnapshot(snapshots, input.policy, now)) issues.push(issue("no_recent_snapshot", "medium", "Snapshot تازه وجود ندارد", "برای cleanup امن به snapshot تازه نیاز است.", "از مرکز داده snapshot بسازید."));
  if (criticalEvents.length >= 10) issues.push(issue("too_many_critical_events", "high", "رویداد مهم زیاد است", `${toPersianNumber(criticalEvents.length)} رویداد high/critical ثبت شده است.`, "رویدادهای مهم را پیش از archive مرور کنید."));
  if (candidates.length && input.policy.autoArchiveSuggestionEnabled) issues.push(issue("archive_recommended", "medium", "Archive پیشنهاد می‌شود", `${toPersianNumber(candidates.length)} رویداد واجد شرایط archive است.`, "یک archive قابل خروجی بسازید."));

  const latestArchive = [...archives].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  const latestSnapshot = [...snapshots].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  const status = calculateHistoryRetentionStatus(issues);
  return {
    id: createId("retention-report"),
    generatedAt: now,
    status,
    totalEvents: events.length,
    criticalEventCount: criticalEvents.length,
    archiveCandidateCount: candidates.length,
    staleDriftCount: staleDrifts.length,
    expiredResignoffCount: expiredResignoffs.length,
    issues,
    recommendations: generateRetentionRecommendations(issues),
    latestArchiveAt: latestArchive?.createdAt,
    latestSnapshotAt: latestSnapshot?.createdAt,
    summary: `${toPersianNumber(events.length)} رویداد فعال و ${toPersianNumber(candidates.length)} رویداد قابل آرشیو است.`,
  };
}
