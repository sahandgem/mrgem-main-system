import { useCallback, useEffect, useMemo, useState } from "react";
import { workforceService } from "../services/workforceService";
import type { BaseEntity, CollectionName, WorkforceState } from "../models/workforce";

type CollectionItem<K extends CollectionName> = WorkforceState[K][number];
type Draft<T extends BaseEntity> = Omit<T, "id" | "createdAt" | "updatedAt"> & Partial<Pick<T, "id" | "createdAt" | "updatedAt">>;

export function useWorkforceStore() {
  const [state, setState] = useState<WorkforceState>(() => workforceService.load());

  useEffect(() => {
    workforceService.save(state);
  }, [state]);

  const createItem = useCallback(<K extends CollectionName>(collection: K, draft: Draft<CollectionItem<K>>) => {
    const item = workforceService.create(collection, draft);
    setState(workforceService.load());
    return item;
  }, []);

  const updateItem = useCallback(<K extends CollectionName>(collection: K, id: string, changes: Partial<CollectionItem<K>>) => {
    const item = workforceService.update(collection, id, changes);
    setState(workforceService.load());
    return item;
  }, []);

  const deactivateItem = useCallback(<K extends CollectionName>(collection: K, id: string) => {
    const item = workforceService.deactivate(collection, id);
    setState(workforceService.load());
    return item;
  }, []);

  const resetDemo = useCallback(() => {
    setState(workforceService.reset());
  }, []);

  return useMemo(
    () => ({
      state,
      createItem,
      updateItem,
      deactivateItem,
      resetDemo,
    }),
    [createItem, deactivateItem, resetDemo, state, updateItem],
  );
}
