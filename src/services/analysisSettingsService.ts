import type { AnalysisSettings } from "../models/workforce";

export const analysisSettingsStorageKey = "komak.workforce.analysisSettings.v1";

export const defaultAnalysisSettings: AnalysisSettings = {
  storeWorkingHours: {
    startTime: "10:00",
    endTime: "20:00",
  },
  workloadWarningHours: 45,
  workloadCriticalHours: 55,
  cleanDirtyNearMinutes: 60,
  riskImpact: {
    info: 3,
    warning: 8,
    critical: 20,
  },
  dashboardImportantItemCount: 5,
};

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

export function normalizeAnalysisSettings(settings?: Partial<AnalysisSettings>): AnalysisSettings {
  return {
    ...clone(defaultAnalysisSettings),
    ...settings,
    storeWorkingHours: {
      ...defaultAnalysisSettings.storeWorkingHours,
      ...settings?.storeWorkingHours,
    },
    riskImpact: {
      ...defaultAnalysisSettings.riskImpact,
      ...settings?.riskImpact,
    },
  };
}

export const analysisSettingsService = {
  load(): AnalysisSettings {
    if (typeof localStorage === "undefined") {
      return clone(defaultAnalysisSettings);
    }

    const raw = localStorage.getItem(analysisSettingsStorageKey);
    if (!raw) {
      const defaults = clone(defaultAnalysisSettings);
      localStorage.setItem(analysisSettingsStorageKey, JSON.stringify(defaults));
      return defaults;
    }

    try {
      const settings = normalizeAnalysisSettings(JSON.parse(raw) as Partial<AnalysisSettings>);
      localStorage.setItem(analysisSettingsStorageKey, JSON.stringify(settings));
      return settings;
    } catch {
      const defaults = clone(defaultAnalysisSettings);
      localStorage.setItem(analysisSettingsStorageKey, JSON.stringify(defaults));
      return defaults;
    }
  },

  save(settings: AnalysisSettings) {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(analysisSettingsStorageKey, JSON.stringify(normalizeAnalysisSettings(settings)));
    }
  },

  reset(): AnalysisSettings {
    const defaults = clone(defaultAnalysisSettings);
    this.save(defaults);
    return defaults;
  },
};
