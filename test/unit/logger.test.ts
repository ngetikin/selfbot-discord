import { describe, it, expect, vi } from 'vitest';
import { createLogger } from '../../src/utils/logger';

describe('logger', () => {
  it('redacts token fields', () => {
    const logger = createLogger('debug');
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    logger.debug('test', { token: 'secret', other: 'ok' });
    const call = spy.mock.calls[0][1] as Record<string, unknown>;
    expect(call.token).toBe('[REDACTED]');
    expect(call.other).toBe('ok');
    spy.mockRestore();
  });
});
