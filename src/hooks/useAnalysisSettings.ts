import { useCallback, useMemo, useState } from "react";
import type { AnalysisSettings } from "../models/workforce";
import { analysisSettingsService } from "../services/analysisSettingsService";

export function useAnalysisSettings() {
  const [settings, setSettings] = useState<AnalysisSettings>(() => analysisSettingsService.load());

  const saveSettings = useCallback((nextSettings: AnalysisSettings) => {
    analysisSettingsService.save(nextSettings);
    setSettings(analysisSettingsService.load());
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(analysisSettingsService.reset());
  }, []);

  return useMemo(
    () => ({
      settings,
      saveSettings,
      resetSettings,
    }),
    [resetSettings, saveSettings, settings],
  );
}
