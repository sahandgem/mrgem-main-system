import { demoWorkforceState } from "../data/workforceSeed";
import { createId, nowIso } from "../models/workforce";
import type { BaseEntity, CollectionName, WorkforceState } from "../models/workforce";

export const storageKeys: Record<CollectionName, string> = {
  spaces: "komak.workforce.spaces.v1",
  employees: "komak.workforce.employees.v1",
  taskTypes: "komak.workforce.taskTypes.v1",
  scheduleItems: "komak.workforce.scheduleItems.v1",
  rules: "komak.workforce.rules.v1",
};

type CollectionItem<K extends CollectionName> = WorkforceState[K][number];
type Draft<T extends BaseEntity> = Omit<T, "id" | "createdAt" | "updatedAt"> & Partial<Pick<T, "id" | "createdAt" | "updatedAt">>;

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

function readCollection<K extends CollectionName>(collection: K): WorkforceState[K] {
  if (typeof localStorage === "undefined") {
    return clone(demoWorkforceState[collection]);
  }

  const raw = localStorage.getItem(storageKeys[collection]);
  if (!raw) {
    const seed = clone(demoWorkforceState[collection]);
    localStorage.setItem(storageKeys[collection], JSON.stringify(seed));
    return seed;
  }

  try {
    const parsed = JSON.parse(raw) as WorkforceState[K];
    const seed = demoWorkforceState[collection];
    const merged = [
      ...parsed,
      ...seed.filter((seedItem) => !parsed.some((item) => item.id === seedItem.id)),
    ] as WorkforceState[K];
    if (merged.length !== parsed.length) {
      localStorage.setItem(storageKeys[collection], JSON.stringify(merged));
    }
    return merged;
  } catch {
    const seed = clone(demoWorkforceState[collection]);
    localStorage.setItem(storageKeys[collection], JSON.stringify(seed));
    return seed;
  }
}

function writeCollection<K extends CollectionName>(collection: K, rows: WorkforceState[K]) {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(storageKeys[collection], JSON.stringify(rows));
  }
}

export const workforceService = {
  list<K extends CollectionName>(collection: K): WorkforceState[K] {
    return readCollection(collection);
  },

  load(): WorkforceState {
    return {
      spaces: readCollection("spaces"),
      employees: readCollection("employees"),
      taskTypes: readCollection("taskTypes"),
      scheduleItems: readCollection("scheduleItems"),
      rules: readCollection("rules"),
    };
  },

  save(state: WorkforceState) {
    writeCollection("spaces", state.spaces);
    writeCollection("employees", state.employees);
    writeCollection("taskTypes", state.taskTypes);
    writeCollection("scheduleItems", state.scheduleItems);
    writeCollection("rules", state.rules);
  },

  create<K extends CollectionName>(collection: K, draft: Draft<CollectionItem<K>>): CollectionItem<K> {
    const timestamp = nowIso();
    const item = {
      ...draft,
      id: draft.id ?? createId(collection),
      createdAt: draft.createdAt ?? timestamp,
      updatedAt: timestamp,
    } as CollectionItem<K>;
    const rows = [...readCollection(collection), item] as WorkforceState[K];
    writeCollection(collection, rows);
    return item;
  },

  update<K extends CollectionName>(collection: K, id: string, changes: Partial<CollectionItem<K>>): CollectionItem<K> | undefined {
    let updated: CollectionItem<K> | undefined;
    const rows = readCollection(collection).map((item) => {
      if (item.id !== id) {
        return item;
      }
      updated = { ...item, ...changes, id, updatedAt: nowIso() } as CollectionItem<K>;
      return updated;
    }) as WorkforceState[K];
    writeCollection(collection, rows);
    return updated;
  },

  deactivate<K extends CollectionName>(collection: K, id: string): CollectionItem<K> | undefined {
    return this.update(collection, id, { isActive: false } as Partial<CollectionItem<K>>);
  },

  reset(): WorkforceState {
    const seed = clone(demoWorkforceState);
    this.save(seed);
    return seed;
  },
};
