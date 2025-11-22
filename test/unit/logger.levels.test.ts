import { describe, it, vi, expect } from 'vitest';
import { createLogger } from '../../src/utils/logger';

describe('logger levels', () => {
  it('respects level threshold', () => {
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
    const log = createLogger('warn');
    log.info('should not print');
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});
