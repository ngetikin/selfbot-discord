import { describe, it, expect } from 'vitest';
import { Scheduler } from '../../src/core/scheduler';

describe('Scheduler persistence helpers', () => {
  it('snapshot returns tasks and load restores order', () => {
    const s1 = new Scheduler();
    s1.add({ id: 'a', runAt: 2 });
    s1.add({ id: 'b', runAt: 1 });
    const snap = s1.snapshot();
    const s2 = new Scheduler();
    s2.load(snap);
    const ready = s2.popReady(5);
    expect(ready.map((t) => t.id)).toEqual(['b', 'a']);
  });
});
