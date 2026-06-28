import type { OperationalControlExportOptions, OperationalControlItem, OperationalControlSchedulePolicy } from "../models/workforce";
import { nowIso } from "../models/workforce";

export function escapeIcsText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

export function formatIcsDate(value: string | Date) {
  return new Date(value).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function filteredControls(controls: OperationalControlItem[], options: OperationalControlExportOptions, generatedAt = nowIso()) {
  const cutoff = new Date(generatedAt).getTime() + options.includeUpcomingDays * 86400000;
  return controls.filter((control) => {
    if (control.status === "completed" && !options.includeCompleted) return false;
    if (control.status === "dismissed" && !options.includeDismissed) return false;
    if (control.status === "snoozed" && !options.includeSnoozed) return false;
    if (control.status === "overdue" && !options.includeOverdue) return false;
    if (control.status === "upcoming" && new Date(control.dueAt).getTime() > cutoff) return false;
    return true;
  });
}

export function buildControlIcsEvent(control: OperationalControlItem, options: OperationalControlExportOptions, generatedAt = nowIso()) {
  const description = [control.description, `اولویت: ${control.priority}`, `وضعیت: ${control.status}`];
  if (options.includeRelatedPath) description.push(`مسیر: ${control.relatedPath}`);
  if (options.includeManagerNote && control.managerNote) description.push(`یادداشت مدیر: ${control.managerNote}`);
  return [
    "BEGIN:VEVENT",
    `UID:${escapeIcsText(`${control.id}@komak-workforce.local`)}`,
    `DTSTAMP:${formatIcsDate(generatedAt)}`,
    `DTSTART:${formatIcsDate(control.snoozedUntil ?? control.dueAt)}`,
    `SUMMARY:${escapeIcsText(control.title)}`,
    `DESCRIPTION:${escapeIcsText(description.join("\n"))}`,
    "END:VEVENT",
  ].join("\r\n");
}

export function buildOperationsCalendarIcs(controls: OperationalControlItem[], options: OperationalControlExportOptions, generatedAt = nowIso()) {
  const events = filteredControls(controls, options, generatedAt).map((control) => buildControlIcsEvent(control, options, generatedAt));
  return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Komak Workforce//Operations Calendar//FA", "CALSCALE:GREGORIAN", ...events, "END:VCALENDAR", ""].join("\r\n");
}

export function buildOperationsCalendarJson(controls: OperationalControlItem[], policy: OperationalControlSchedulePolicy, options: OperationalControlExportOptions, summary: string, generatedAt = nowIso()) {
  return {
    version: "1.0.0",
    generatedAt,
    timezone: "UTC",
    policy: JSON.parse(JSON.stringify(policy)) as OperationalControlSchedulePolicy,
    exportOptions: JSON.parse(JSON.stringify(options)) as OperationalControlExportOptions,
    controls: JSON.parse(JSON.stringify(filteredControls(controls, options, generatedAt))) as OperationalControlItem[],
    summary,
  };
}

function download(content: string, fileName: string, type: string) {
  if (typeof document !== "undefined") {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a"); link.href = url; link.download = fileName; link.click(); URL.revokeObjectURL(url);
  }
  return { content, fileName };
}

function stamp(value = nowIso()) {
  return new Date(value).toISOString().slice(0, 16).replace("T", "-").replace(":", "-");
}

export function downloadOperationsCalendarIcs(controls: OperationalControlItem[], options: OperationalControlExportOptions, generatedAt = nowIso()) {
  return download(buildOperationsCalendarIcs(controls, options, generatedAt), `workforce-operations-calendar-${stamp(generatedAt)}.ics`, "text/calendar;charset=utf-8");
}

export function downloadOperationsCalendarJson(controls: OperationalControlItem[], policy: OperationalControlSchedulePolicy, options: OperationalControlExportOptions, summary: string, generatedAt = nowIso()) {
  const payload = buildOperationsCalendarJson(controls, policy, options, summary, generatedAt);
  return download(JSON.stringify(payload, null, 2), `workforce-operations-calendar-${stamp(generatedAt)}.json`, "application/json;charset=utf-8");
}
