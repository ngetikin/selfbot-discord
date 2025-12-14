import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Scheduler } from '../../src/core/scheduler';
import { restoreScheduler, startSchedulerPersistence } from '../../src/core/scheduler-persist';

const makeStorage = () => {
  const readJson = vi.fn();
  const writeJson = vi.fn();
  const storage = {
    readJson,
    writeJson,
    listKeys: vi.fn(),
    remove: vi.fn(),
  } as any;
  return { storage, readJson, writeJson };
};

describe('scheduler persistence', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('restores tasks from storage', () => {
    const { storage, readJson } = makeStorage();
    const scheduler = new Scheduler();
    readJson.mockReturnValue([{ id: 'a', runAt: 1 }]);

    restoreScheduler(scheduler, storage);

    const ready = scheduler.popReady(5);
    expect(ready[0]?.id).toBe('a');
  });

  it('persists snapshot on interval', () => {
    const { storage, writeJson } = makeStorage();
    const scheduler = new Scheduler();
    scheduler.add({ id: 'a', runAt: Date.now() + 1000 });

    const handle = startSchedulerPersistence(scheduler, storage, { intervalMs: 1000 });

    expect(writeJson).toHaveBeenCalledTimes(1); // immediate save

    vi.advanceTimersByTime(1000);
    expect(writeJson).toHaveBeenCalledTimes(2);

    handle.stop();
    vi.advanceTimersByTime(2000);
    expect(writeJson).toHaveBeenCalledTimes(2);
  });
});
