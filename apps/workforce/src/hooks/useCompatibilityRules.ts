import { useCallback, useEffect, useMemo, useState } from "react";
import type { Space, TaskType, WorkCompatibilityRule } from "../models/workforce";
import { compatibilityService } from "../services/compatibilityService";

export function useCompatibilityRules(taskTypes: TaskType[], spaces: Space[]) {
  const [rules, setRules] = useState<WorkCompatibilityRule[]>(() => compatibilityService.list(taskTypes, spaces));

  useEffect(() => {
    setRules(compatibilityService.list(taskTypes, spaces));
  }, [spaces, taskTypes]);

  const updateCompatibility = useCallback((taskTypeId: string, spaceId: string, changes: Partial<WorkCompatibilityRule>) => {
    setRules(compatibilityService.update(taskTypes, spaces, taskTypeId, spaceId, changes));
  }, [spaces, taskTypes]);

  const resetCompatibility = useCallback(() => {
    setRules(compatibilityService.resetDemo(taskTypes, spaces));
  }, [spaces, taskTypes]);

  return useMemo(
    () => ({
      compatibilityRules: rules,
      updateCompatibility,
      resetCompatibility,
    }),
    [resetCompatibility, rules, updateCompatibility],
  );
}
