import { buildOperationsCalendarReport, calculateControlStatus, generateControlItemsFromSystemState, type OperationsCalendarSystemState } from "../analysis/operationsCalendarAnalyzer";
import type { OperationalControlItem, OperationalControlSchedulePolicy, OperationalControlType } from "../models/workforce";
import { nowIso } from "../models/workforce";
import { operationsControlSettingsService } from "./operationsControlSettingsService";

export const operationsCalendarStorageKey = "komak.workforce.operationsCalendar.v1";

let memoryControls: OperationalControlItem[] = [];
const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

function readControls() {
  if (typeof localStorage === "undefined") return clone(memoryControls);
  try { const parsed = JSON.parse(localStorage.getItem(operationsCalendarStorageKey) ?? "[]"); return Array.isArray(parsed) ? parsed as OperationalControlItem[] : []; } catch { return []; }
}

function writeControls(controls: OperationalControlItem[]) {
  if (typeof localStorage === "undefined") memoryControls = clone(controls);
  else localStorage.setItem(operationsCalendarStorageKey, JSON.stringify(controls));
}

function mergeControls(generated: OperationalControlItem[], existing: OperationalControlItem[], now = nowIso()): OperationalControlItem[] {
  const byId = new Map(existing.map((control) => [control.id, control]));
  return generated.map((control) => {
    const current = byId.get(control.id);
    if (!current) return control;
    if (current.status === "completed" && current.completedAt && new Date(control.dueAt) > new Date(now)) return { ...current, ...control, status: "completed" as const, completedAt: current.completedAt, managerNote: current.managerNote, createdAt: current.createdAt };
    if (current.status === "dismissed") return { ...control, ...current, title: control.title, description: control.description, relatedPath: control.relatedPath, source: control.source };
    if (current.status === "snoozed" && current.snoozedUntil && new Date(current.snoozedUntil) > new Date(now)) return { ...control, ...current, title: control.title, description: control.description, relatedPath: control.relatedPath, source: control.source };
    return { ...control, managerNote: current.managerNote, createdAt: current.createdAt, status: calculateControlStatus(control.dueAt, now), updatedAt: now };
  });
}

function update(id: string, changes: Partial<OperationalControlItem>) {
  let updated: OperationalControlItem | undefined;
  const rows = readControls().map((control) => {
    if (control.id !== id) return control;
    updated = { ...control, ...changes, id, updatedAt: nowIso() };
    return updated;
  });
  writeControls(rows);
  return updated;
}

export const operationsCalendarService = {
  list() { return readControls(); },
  preview(state: OperationsCalendarSystemState, policy: OperationalControlSchedulePolicy = operationsControlSettingsService.getSchedulePolicy()) {
    const existing = readControls();
    const lastCompletedAtByType = Object.fromEntries(existing.filter((item) => item.completedAt).map((item) => [item.type, item.completedAt])) as Partial<Record<OperationalControlType, string>>;
    return buildOperationsCalendarReport(mergeControls(generateControlItemsFromSystemState({ ...state, lastCompletedAtByType }, policy), existing, state.now));
  },
  rebuild(state: OperationsCalendarSystemState, policy: OperationalControlSchedulePolicy = operationsControlSettingsService.getSchedulePolicy()) {
    const existing = readControls();
    const lastCompletedAtByType = Object.fromEntries(existing.filter((item) => item.completedAt).map((item) => [item.type, item.completedAt])) as Partial<Record<OperationalControlType, string>>;
    const controls = mergeControls(generateControlItemsFromSystemState({ ...state, lastCompletedAtByType }, policy), existing, state.now);
    writeControls(controls);
    return buildOperationsCalendarReport(controls);
  },
  latestReport() { return buildOperationsCalendarReport(readControls()); },
  markCompleted(id: string, managerNote = "") { return update(id, { status: "completed", completedAt: nowIso(), snoozedUntil: undefined, managerNote: managerNote.trim() }); },
  snooze(id: string, snoozedUntil: string, managerNote = "") {
    if (!snoozedUntil || new Date(snoozedUntil) <= new Date()) return undefined;
    return update(id, { status: "snoozed", snoozedUntil, managerNote: managerNote.trim(), completedAt: undefined });
  },
  dismiss(id: string, managerNote: string) {
    const note = managerNote.trim(); if (!note) return undefined;
    return update(id, { status: "dismissed", dismissedAt: nowIso(), managerNote: note, completedAt: undefined, snoozedUntil: undefined });
  },
  reopen(id: string) { return update(id, { status: calculateControlStatus(readControls().find((item) => item.id === id)?.dueAt ?? nowIso()), completedAt: undefined, snoozedUntil: undefined, dismissedAt: undefined, managerNote: "" }); },
  updateManagerNote(id: string, managerNote: string) { return update(id, { managerNote: managerNote.trim() }); },
  __memory: { clear() { memoryControls = []; } },
};
