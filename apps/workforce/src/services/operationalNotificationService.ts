import type { OperationalControlItem, OperationalControlPriority, OperationalInAppNotification, OperationalNotificationPreference } from "../models/workforce";
import { nowIso } from "../models/workforce";

export const operationalInAppNotificationsKey = "komak.workforce.operationalInAppNotifications.v1";
const rank: Record<OperationalControlPriority, number> = { low: 0, medium: 1, high: 2, urgent: 3 };
const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
let memoryNotifications: OperationalInAppNotification[] = [];

function read() {
  if (typeof localStorage === "undefined") return clone(memoryNotifications);
  try { const rows = JSON.parse(localStorage.getItem(operationalInAppNotificationsKey) ?? "[]"); return Array.isArray(rows) ? rows as OperationalInAppNotification[] : []; } catch { return []; }
}

function write(rows: OperationalInAppNotification[]) {
  if (typeof localStorage === "undefined") memoryNotifications = clone(rows);
  else localStorage.setItem(operationalInAppNotificationsKey, JSON.stringify(rows));
}

export function buildNotificationsFromControls(controls: OperationalControlItem[], preference: OperationalNotificationPreference, generatedAt = nowIso()) {
  if (!preference.enabled || preference.channel !== "in_app") return [];
  const futureLimit = new Date(generatedAt).getTime() + preference.daysBeforeDue * 86400000;
  return controls.filter((control) => {
    if (!preference.controlTypes.includes(control.type) || rank[control.priority] < rank[preference.minimumPriority]) return false;
    if (control.status === "completed" || control.status === "dismissed" || control.status === "snoozed") return false;
    return control.priority === "urgent" || control.status === "overdue" || control.status === "due_today" || (preference.daysBeforeDue > 0 && new Date(control.dueAt).getTime() <= futureLimit);
  }).map((control): OperationalInAppNotification => ({
    id: `operations-notification-${control.id}`,
    controlId: control.id,
    title: control.title,
    description: control.description,
    priority: control.priority,
    dueAt: control.dueAt,
    relatedPath: control.relatedPath,
    status: "unread",
    createdAt: generatedAt,
  }));
}

export const operationalNotificationService = {
  buildNotificationsFromControls,
  listNotifications() { return read().sort((a, b) => b.createdAt.localeCompare(a.createdAt)); },
  refreshFromControls(controls: OperationalControlItem[], preference: OperationalNotificationPreference) {
    const existing = new Map(read().map((item) => [item.id, item]));
    const generated = buildNotificationsFromControls(controls, preference).map((item) => {
      const current = existing.get(item.id);
      return current ? { ...item, status: current.status, readAt: current.readAt, dismissedAt: current.dismissedAt, createdAt: current.createdAt } : item;
    });
    write(generated); return clone(generated);
  },
  markNotificationRead(id: string) {
    const rows = read().map((item) => item.id === id ? { ...item, status: "read" as const, readAt: nowIso() } : item); write(rows); return rows.find((item) => item.id === id);
  },
  dismissNotification(id: string) {
    const rows = read().map((item) => item.id === id ? { ...item, status: "dismissed" as const, dismissedAt: nowIso() } : item); write(rows); return rows.find((item) => item.id === id);
  },
  clearReadNotifications() { const rows = read().filter((item) => item.status !== "read"); write(rows); return clone(rows); },
  getNotificationSummary() {
    const rows = read();
    return { total: rows.length, unread: rows.filter((item) => item.status === "unread").length, urgent: rows.filter((item) => item.status === "unread" && item.priority === "urgent").length, dueToday: rows.filter((item) => item.status === "unread" && new Date(item.dueAt).toDateString() === new Date().toDateString()).length };
  },
  __memory: { clear() { memoryNotifications = []; } },
};
