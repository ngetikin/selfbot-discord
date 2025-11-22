import { describe, it, expect } from 'vitest';
import { Scheduler } from '../../src/core/scheduler';

describe('Scheduler', () => {
  it('adds and pops ready tasks in order', () => {
    const s = new Scheduler();
    s.add({ id: 'b', runAt: 2 });
    s.add({ id: 'a', runAt: 1 });
    const ready = s.popReady(2);
    expect(ready.map((t) => t.id)).toEqual(['a', 'b']);
  });

  it('cancels tasks', () => {
    const s = new Scheduler();
    s.add({ id: 'a', runAt: 1 });
    s.cancel('a');
    const ready = s.popReady(2);
    expect(ready.length).toBe(0);
  });
});
