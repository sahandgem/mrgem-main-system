import { nowIso } from "../models/workforce";
import type { PreventiveAlert, PreventiveAlertState, PreventiveAlertStatus } from "../models/workforce";

export const preventiveAlertStatesStorageKey = "komak.workforce.preventiveAlertStates.v1";

let memoryStates: PreventiveAlertState[] = [];

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

export function preventiveAlertKey(alert: Pick<PreventiveAlert, "sourceType" | "title">) {
  return `${alert.sourceType}:${alert.title}`.toLowerCase().replace(/\s+/g, "-");
}

function readStates(): PreventiveAlertState[] {
  if (typeof localStorage === "undefined") return clone(memoryStates);
  const raw = localStorage.getItem(preventiveAlertStatesStorageKey);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as PreventiveAlertState[];
  } catch {
    localStorage.setItem(preventiveAlertStatesStorageKey, JSON.stringify([]));
    return [];
  }
}

function writeStates(states: PreventiveAlertState[]) {
  if (typeof localStorage === "undefined") {
    memoryStates = clone(states);
    return;
  }
  localStorage.setItem(preventiveAlertStatesStorageKey, JSON.stringify(states));
}

export const preventiveAlertStateService = {
  list() {
    return readStates();
  },

  update(alertKey: string, changes: Partial<Omit<PreventiveAlertState, "alertKey" | "updatedAt">>) {
    const states = readStates();
    const existing = states.find((state) => state.alertKey === alertKey);
    const nextState: PreventiveAlertState = {
      alertKey,
      status: changes.status ?? existing?.status ?? "open",
      managerNote: changes.managerNote ?? existing?.managerNote ?? "",
      updatedAt: nowIso(),
    };
    const next = existing ? states.map((state) => state.alertKey === alertKey ? nextState : state) : [nextState, ...states];
    writeStates(next);
    return nextState;
  },

  updateStatus(alertKey: string, status: PreventiveAlertStatus) {
    return this.update(alertKey, { status });
  },

  applyStates(alerts: PreventiveAlert[]) {
    const states = readStates();
    return alerts.map((alert) => {
      const state = states.find((item) => item.alertKey === preventiveAlertKey(alert));
      return state ? { ...alert, status: state.status, updatedAt: state.updatedAt } : alert;
    });
  },

  resetDemo() {
    writeStates([]);
    return [];
  },
};
