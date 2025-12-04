import type { Scheduler } from './scheduler';
import type { StorageAdapter } from './storage/types';
import type { SchedulerTask } from '../types/scheduler';

const DEFAULT_KEY = 'scheduler';
const DEFAULT_INTERVAL = 60_000;

type PersistOptions = {
  key?: string;
  intervalMs?: number;
};

type PersistHandle = {
  saveNow: () => void;
  stop: () => void;
};

const safeLoadTasks = (storage: StorageAdapter, key: string): SchedulerTask[] => {
  const fallback: SchedulerTask[] = [];
  try {
    return storage.readJson<SchedulerTask[]>(key, fallback);
  } catch (_err) {
    return fallback;
  }
};

export const restoreScheduler = (
  scheduler: Scheduler,
  storage: StorageAdapter,
  key: string = DEFAULT_KEY,
): void => {
  const tasks = safeLoadTasks(storage, key);
  scheduler.load(tasks);
};

export const startSchedulerPersistence = (
  scheduler: Scheduler,
  storage: StorageAdapter,
  { key = DEFAULT_KEY, intervalMs = DEFAULT_INTERVAL }: PersistOptions = {},
): PersistHandle => {
  const save = () => storage.writeJson<SchedulerTask[]>(key, scheduler.snapshot());
  save();
  const timer = setInterval(save, intervalMs);

  return {
    saveNow: save,
    stop: () => clearInterval(timer),
  };
};
